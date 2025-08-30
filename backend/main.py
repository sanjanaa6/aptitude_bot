import json
import os
import logging
from typing import Any, List, Literal, Optional
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException, Header, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import urllib.request
import urllib.error

# Import our modular components
from database import init_database, close_database
from auth import get_current_user, create_access_token, hash_password, verify_password
from models import *
from routers import quiz, bookmarks
from routers import admin as admin_router
from routers import gamification
from routers import learning
from database import get_collection

load_dotenv()

# Configure logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FILE = os.getenv("LOG_FILE", "app.log")

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "deepseek/deepseek-chat"

app = FastAPI(title="Quantitative Chatbot API")

# Environment-based CORS configuration
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")

if ENVIRONMENT == "production":
    # Production: Only allow specific origins
    origins = [origin.strip() for origin in ALLOWED_ORIGINS.split(",") if origin.strip()]
    allow_credentials = True
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["*"]
else:
    # Development: More permissive but still controlled
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    allow_credentials = True
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["*"]

logger.info(f"CORS configuration - Environment: {ENVIRONMENT}, Origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
    allow_methods=allow_methods,
    allow_headers=allow_headers,
)

# Request logging using FastAPI events
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.utcnow()
    
    # Log request
    logger.info(f"Request: {request.method} {request.url.path} - Client: {request.client.host if request.client else 'unknown'}")
    
    # Process request
    response = await call_next(request)
    
    # Log response
    process_time = (datetime.utcnow() - start_time).total_seconds()
    logger.info(f"Response: {response.status_code} - {request.method} {request.url.path} - {process_time:.3f}s")
    
    return response

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return {"error": "Internal server error", "detail": str(exc) if ENVIRONMENT == "development" else "Something went wrong"}

# Include routers
app.include_router(quiz.router)
app.include_router(bookmarks.router)
app.include_router(gamification.router)
app.include_router(admin_router.router)
app.include_router(learning.router)

@app.on_event("startup")
async def on_startup() -> None:
    """Initialize database and sample data on startup"""
    logger.info("Starting Quantitative Chatbot API...")
    try:
        await init_database()
        logger.info("Database initialized successfully")
        
        # Seed default admin if not present (dev convenience)
        try:
            users_col = get_collection("users")
            if users_col is not None:
                existing = await users_col.find_one({"email": "admin@gmail.com"})
                if not existing:
                    await users_col.insert_one({
                        "email": "admin@gmail.com",
                        "password_hash": hash_password("admin 123"),
                        "username": "admin",
                        "name": "Admin",
                        "created_at": datetime.utcnow().isoformat(),
                        "is_admin": True,
                    })
                    logger.info("Default admin user created")
        except Exception as e:
            logger.warning(f"Failed to seed admin user: {e}")
            
        logger.info("Application startup completed successfully")
    except Exception as e:
        logger.error(f"Failed to initialize application: {e}")
        raise

@app.on_event("shutdown")
async def on_shutdown() -> None:
    """Close database connection on shutdown"""
    logger.info("Shutting down application...")
    try:
        await close_database()
        logger.info("Database connection closed successfully")
    except Exception as e:
        logger.error(f"Error closing database connection: {e}")

@app.get("/")
def root() -> dict:
    logger.info("Health check endpoint accessed")
    return {"status": "ok", "environment": ENVIRONMENT, "timestamp": datetime.utcnow().isoformat()}

def call_openrouter(messages: List[ChatMessage], model: Optional[str] = None) -> str:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        logger.error("Missing OPENROUTER_API_KEY in environment")
        raise HTTPException(status_code=500, detail="Missing OPENROUTER_API_KEY in environment")

    payload = {
        "model": model or DEFAULT_MODEL,
        "messages": [m.model_dump() for m in messages],
    }

    logger.info(f"Calling OpenRouter API with model: {model or DEFAULT_MODEL}")

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(OPENROUTER_API_URL, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("Authorization", f"Bearer {api_key}")
    req.add_header("X-Title", "Quantitative Chatbot")

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            resp_data = resp.read()
            resp_json = json.loads(resp_data.decode("utf-8"))
            choices = resp_json.get("choices", [])
            if not choices:
                logger.error("No choices returned from OpenRouter")
                raise HTTPException(status_code=502, detail="No choices returned from OpenRouter")
            content = choices[0].get("message", {}).get("content")
            if not content:
                logger.error("Empty content from OpenRouter")
                raise HTTPException(status_code=502, detail="Empty content from OpenRouter")
            logger.info("OpenRouter API call successful")
            return content
    except urllib.error.HTTPError as e:
        try:
            error_body = e.read().decode("utf-8")
            return_json = json.loads(error_body)
            detail = return_json.get("error", {}).get("message") or error_body
        except Exception:
            detail = str(e)
        logger.error(f"OpenRouter HTTP error: {e.code} - {detail}")
        raise HTTPException(status_code=e.code or 500, detail=detail)
    except urllib.error.URLError as e:
        logger.error(f"OpenRouter network error: {e.reason}")
        raise HTTPException(status_code=502, detail=f"Network error contacting OpenRouter: {e.reason}")
    except Exception as e:
        logger.error(f"Unexpected error calling OpenRouter: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/auth/register")
async def register(req: RegisterRequest) -> dict:
    logger.info(f"Registration attempt for user: {req.email}")
    
    if not req.email or not req.password:
        logger.warning("Registration failed: Missing email or password")
        raise HTTPException(status_code=400, detail="Email and password are required")
    if not req.username:
        logger.warning("Registration failed: Missing username")
        raise HTTPException(status_code=400, detail="Username is required")
    
    from database import get_collection
    users_col = get_collection("users")
    if users_col is None:
        logger.error("Database not initialized during registration")
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Check if user already exists
    existing = await users_col.find_one({"email": req.email.lower()})
    if existing:
        logger.warning(f"User already exists: {req.email}")
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Check username uniqueness
    if await users_col.find_one({"username": req.username.lower()}):
        logger.warning(f"Username already taken: {req.username}")
        raise HTTPException(status_code=400, detail="Username already taken")
    
    user_doc = {
        "email": req.email.lower(),
        "password_hash": hash_password(req.password),
        "username": req.username.lower(),
        "name": (req.name or "").strip() or None,
        "created_at": datetime.utcnow().isoformat(),
        "is_admin": False,
    }
    await users_col.insert_one(user_doc)
    logger.info(f"User registered successfully: {req.email}")
    return {"message": "registered"}

@app.post("/auth/login", response_model=TokenResponse)
async def login(req: LoginRequest) -> TokenResponse:
    from database import get_collection
    users_col = get_collection("users")
    if users_col is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    user = await users_col.find_one({"email": req.email.lower()})
    if not user or not verify_password(req.password, user.get("password_hash", "")):
        # Dev bootstrap: allow creating/resetting default admin on login attempt
        if req.email.lower() == "admin@gmail.com" and req.password == "admin 123":
            # Upsert admin user
            doc = {
                "email": "admin@gmail.com",
                "password_hash": hash_password("admin 123"),
                "username": "admin",
                "name": "Admin",
                "created_at": datetime.utcnow().isoformat(),
                "is_admin": True,
            }
            existing = await users_col.find_one({"email": "admin@gmail.com"})
            if existing:
                await users_col.update_one({"_id": existing.get("_id")}, {"$set": doc})
                user = await users_col.find_one({"_id": existing.get("_id")})
            else:
                res = await users_col.insert_one(doc)
                user = await users_col.find_one({"_id": res.inserted_id})
        else:
            logger.warning(f"Invalid credentials attempted for user: {req.email}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({
        "sub": str(user.get("_id")),
        "email": user.get("email"),
        "username": user.get("username"),
        "name": user.get("name"),
        "is_admin": bool(user.get("is_admin", False)),
    })
    logger.info(f"User logged in successfully: {req.email}")
    return TokenResponse(access_token=token)

@app.get("/auth/me")
async def me(authorization: Optional[str] = Header(None, alias="Authorization")) -> dict:
    claims = get_current_user(authorization)
    logger.info(f"User info requested for user: {claims.get('email')}")
    return {"user": {"email": claims.get("email"), "username": claims.get("username"), "name": claims.get("name"), "is_admin": bool(claims.get("is_admin", False))}}

@app.post("/auth/logout")
async def logout() -> dict:
    logger.info("Logout endpoint accessed")
    return {"message": "logged out"}

@app.get("/topics")
def get_topics() -> dict:
    # Flattened topics for backward compatibility; now superseded by /sections
    section_one = [
        "1. Number System",
        "2. H.C.F. and L.C.M. of Numbers",
        "3. Decimal Fractions",
        "4. Simplification",
        "5. Square Roots and Cube Roots",
        "6. Average",
        "7. Problems on Numbers",
        "8. Problems on Ages",
        "9. Surds and Indices",
        "10. Logarithms",
        "11. Percentage",
        "12. Profit and Loss",
        "13. Ratio and Proportion",
        "14. Partnership",
        "15. Chain Rule",
        "16. Pipes and Cisterns",
        "17. Time and Work",
        "18. Time and Distance",
        "19. Boats and Streams",
        "20. Problems on Trains",
        "21. Alligation or Mixture",
        "22. Simple Interest",
        "23. Compound Interest",
        "24. Area",
        "25. Volume and Surface Area",
        "26. Races and Games of Skill",
        "27. Calendar",
        "28. Clocks",
        "29. Stocks and Shares",
        "30. Permutations and Combinations",
        "31. Probability",
        "32. True Discount",
        "33. Banker's Discount",
        "34. Heights and Distances",
        "35. Odd Man Out and Series",
    ]
    section_two = [
        "36. Tabulation",
        "37. Bar Graphs",
        "38. Pie Chart",
        "39. Line Graphs",
    ]
    logger.info("Topics endpoint accessed")
    return {"topics": section_one + section_two}

@app.get("/sections")
async def get_sections() -> dict:
    sections_col = get_collection("sections")
    if sections_col is not None:
        try:
            docs = await sections_col.find({}).to_list(length=None)
            if docs:
                for d in docs:
                    d.pop("_id", None)
                logger.info("Sections retrieved successfully")
                return {"sections": docs}
        except Exception as e:
            logger.error(f"Error retrieving sections from database: {e}")
            # fall back to static
            pass
    # No fallback: return empty
    logger.warning("Sections endpoint accessed, but no sections found in database. Returning empty.")
    return {"sections": []}

@app.post("/explain-topic", response_model=ChatResponse)
async def explain_topic(
    req: TopicRequest, 
    authorization: Optional[str] = Header(None, alias="Authorization")
) -> ChatResponse:
    logger.info(f"Explain topic request for user: {get_current_user(authorization).get('email') if authorization else 'anonymous'}")
    system = ChatMessage(
        role="system",
        content=(
            "You are a concise quantitative tutor. Provide a clear, structured explanation with "
            "bullet points, a simple example, and a short summary. Keep it under 200 words unless asked."
        ),
    )
    user = ChatMessage(role="user", content=f"Explain the topic: {req.topic}")
    content = call_openrouter([system, user], model=req.model)
    
    # Mark topic as completed if user is authenticated
    if authorization:
        try:
            claims = get_current_user(authorization)
            user_id = claims.get("sub")
            from database import get_collection
            progress_col = get_collection("progress")
            if progress_col is not None and user_id:
                await progress_col.update_one(
                    {"user_id": user_id, "topic": req.topic},
                    {
                        "$set": {
                            "user_id": user_id,
                            "topic": req.topic,
                            "completed": True,
                            "completed_at": datetime.utcnow().isoformat(),
                            "updated_at": datetime.utcnow().isoformat()
                        }
                    },
                    upsert=True
                )
                logger.info(f"Progress updated for user {user_id}: topic {req.topic} completed")
        except Exception as e:
            logger.warning(f"Failed to update progress for topic {req.topic}: {e}")
            # Don't fail the main request if progress tracking fails
            pass
    
    logger.info(f"Explain topic request completed for user: {get_current_user(authorization).get('email') if authorization else 'anonymous'}")
    return ChatResponse(content=content)

@app.post("/chat", response_model=ChatResponse)
def chat(
    req: ChatRequest,
    authorization: Optional[str] = Header(None, alias="Authorization")
) -> ChatResponse:
    # Forward the conversation to OpenRouter. If auth header present, log the user; otherwise allow anonymous chat.
    user_email = None
    if authorization:
        try:
            claims = get_current_user(authorization)
            user_email = claims.get("email")
        except Exception:
            # If token invalid, still allow but log as anonymous
            user_email = None
    logger.info(f"Chat request for user: {user_email or 'anonymous'}")
    content = call_openrouter(req.messages, model=req.model)
    logger.info(f"Chat request completed for user: {user_email or 'anonymous'}")
    return ChatResponse(content=content)

@app.get("/progress")
async def get_user_progress(authorization: Optional[str] = Header(None, alias="Authorization")) -> dict:
    """Get progress for all topics for the current user"""
    claims = get_current_user(authorization)
    user_id = claims.get("sub")
    logger.info(f"Get user progress request for user: {claims.get('email')}")
    
    from database import get_collection
    progress_col = get_collection("progress")
    if progress_col is None:
        logger.error("Database not initialized during get_user_progress")
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Get all topics from sections (DB-backed)
    sections_resp = await get_sections()
    all_topics = []
    for section in sections_resp["sections"]:
        all_topics.extend(section["topics"])
    # Deduplicate topics to avoid overcount if duplicates exist across sections
    all_topics = list(dict.fromkeys(all_topics))
    
    # Get user's completed topics
    user_progress = await progress_col.find({"user_id": user_id, "completed": True}).to_list(length=None)
    completed_topics = [p["topic"] for p in user_progress]
    
    # Create progress response for each topic
    progress_data = []
    for topic in all_topics:
        completed = topic in completed_topics
        progress_data.append({
            "topic": topic,
            "completed": completed,
            "completed_at": None
        })
    
    logger.info(f"Get user progress request completed for user: {claims.get('email')}")
    return {"progress": progress_data}

@app.post("/progress/update")
async def update_progress(
    req: ProgressRequest, 
    authorization: Optional[str] = Header(None, alias="Authorization")
) -> ProgressResponse:
    """Update progress for a specific topic"""
    claims = get_current_user(authorization)
    user_id = claims.get("sub")
    logger.info(f"Update progress request for user: {claims.get('email')}")
    
    from database import get_collection
    progress_col = get_collection("progress")
    if progress_col is None:
        logger.error("Database not initialized during update_progress")
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    completed_at = datetime.utcnow().isoformat() if req.completed else None
    
    # Upsert progress record
    await progress_col.update_one(
        {"user_id": user_id, "topic": req.topic},
        {
            "$set": {
                "user_id": user_id,
                "topic": req.topic,
                "completed": req.completed,
                "completed_at": completed_at,
                "updated_at": datetime.utcnow().isoformat()
            }
        },
        upsert=True
    )
    
    # Trigger gamification for topic completion
    if req.completed:
        from gamification_service import gamification_service
        gamification_data = {"topic": req.topic}
        newly_earned_badges = await gamification_service.check_badges(
            user_id, "topic_completed", gamification_data
        )
        # Add points for topic completion
        points_result = await gamification_service.add_points(
            user_id, 10, f"Topic completed: {req.topic}"
        )
        logger.info(f"Gamification triggered for topic completion: {req.topic}")
    
    logger.info(f"Update progress request completed for user: {claims.get('email')}")
    return ProgressResponse(
        topic=req.topic,
        completed=req.completed,
        completed_at=completed_at
    )

@app.get("/progress/summary")
async def get_progress_summary(authorization: Optional[str] = Header(None, alias="Authorization")) -> UserProgressSummary:
    """Get a summary of user's progress across all topics"""
    claims = get_current_user(authorization)
    user_id = claims.get("sub")
    logger.info(f"Get progress summary request for user: {claims.get('email')}")
    
    from database import get_collection
    progress_col = get_collection("progress")
    if progress_col is None:
        logger.error("Database not initialized during get_progress_summary")
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Get all topics from sections (DB-backed)
    sections_resp = await get_sections()
    all_topics = []
    for section in sections_resp["sections"]:
        all_topics.extend(section["topics"])
    # Deduplicate topics to avoid overcount if duplicates exist across sections
    all_topics = list(dict.fromkeys(all_topics))
    
    # Get user's completed topics
    user_progress = await progress_col.find({"user_id": user_id, "completed": True}).to_list(length=None)
    completed_topics = [p["topic"] for p in user_progress]
    
    total_topics = len(all_topics)
    completed_count = len(completed_topics)
    progress_percentage = round((completed_count / total_topics) * 100, 2) if total_topics > 0 else 0
    
    remaining_topics = [topic for topic in all_topics if topic not in completed_topics]
    
    logger.info(f"Get progress summary request completed for user: {claims.get('email')}")
    return UserProgressSummary(
        total_topics=total_topics,
        completed_topics=completed_count,
        progress_percentage=progress_percentage,
        completed_topics_list=completed_topics,
        remaining_topics=remaining_topics
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


