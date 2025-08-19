import json
import os
from typing import Any, List, Literal, Optional
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from jose import JWTError, jwt
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient
import urllib.request
import urllib.error


load_dotenv()


class ChatMessage(BaseModel):
	role: Literal["system", "user", "assistant"]
	content: str


class ChatRequest(BaseModel):
	messages: List[ChatMessage]
	model: Optional[str] = None


class TopicRequest(BaseModel):
	topic: str
	model: Optional[str] = None


class ChatResponse(BaseModel):
	content: str
	raw: Optional[Any] = None


OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "deepseek/deepseek-chat"

# Mongo & Auth config
MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")
MONGO_DB = os.getenv("MONGO_DB", "Quantitative-chatbot")
JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-prod")
JWT_ALG = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24h

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

mongo_client: Optional[AsyncIOMotorClient] = None
db = None
users_col = None


def call_openrouter(messages: List[ChatMessage], model: Optional[str] = None) -> str:
	api_key = os.getenv("OPENROUTER_API_KEY")
	if not api_key:
		raise HTTPException(status_code=500, detail="Missing OPENROUTER_API_KEY in environment")

	payload = {
		"model": model or DEFAULT_MODEL,
		"messages": [m.model_dump() for m in messages],
	}

	data = json.dumps(payload).encode("utf-8")
	req = urllib.request.Request(OPENROUTER_API_URL, data=data, method="POST")
	req.add_header("Content-Type", "application/json")
	req.add_header("Authorization", f"Bearer {api_key}")
	# Optional but recommended by OpenRouter
	req.add_header("X-Title", "Quantitative Chatbot")

	try:
		with urllib.request.urlopen(req, timeout=60) as resp:
			resp_data = resp.read()
			resp_json = json.loads(resp_data.decode("utf-8"))
			choices = resp_json.get("choices", [])
			if not choices:
				raise HTTPException(status_code=502, detail="No choices returned from OpenRouter")
			content = choices[0].get("message", {}).get("content")
			if not content:
				raise HTTPException(status_code=502, detail="Empty content from OpenRouter")
			return content
	except urllib.error.HTTPError as e:
		try:
			error_body = e.read().decode("utf-8")
			return_json = json.loads(error_body)
			detail = return_json.get("error", {}).get("message") or error_body
		except Exception:
			detail = str(e)
		raise HTTPException(status_code=e.code or 500, detail=detail)
	except urllib.error.URLError as e:
		raise HTTPException(status_code=502, detail=f"Network error contacting OpenRouter: {e.reason}")


app = FastAPI(title="Quantitative Chatbot API")

origins = [
	"http://localhost:5173",
	"http://127.0.0.1:5173",
]

app.add_middleware(
	CORSMiddleware,
	allow_origins=origins,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup() -> None:
	global mongo_client, db, users_col
	mongo_client = AsyncIOMotorClient(MONGO_URI)
	db = mongo_client[MONGO_DB]
	users_col = db["users"]
	# Ensure unique indexes
	await users_col.create_index("email", unique=True)
	await users_col.create_index("username", unique=True)


def verify_password(plain_password: str, password_hash: str) -> bool:
	return pwd_context.verify(plain_password, password_hash)


def hash_password(password: str) -> str:
	return pwd_context.hash(password)


def create_access_token(subject: dict, expires_delta: Optional[timedelta] = None) -> str:
	to_encode = subject.copy()
	expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
	to_encode.update({"exp": expire})
	return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALG)


@app.get("/")
def root() -> dict:
	return {"status": "ok"}


class RegisterRequest(BaseModel):
	email: str
	password: str
	username: str
	name: Optional[str] = None


class LoginRequest(BaseModel):
	email: str
	password: str


class TokenResponse(BaseModel):
	access_token: str
	token_type: str = "bearer"


async def get_user_by_email(email: str) -> Optional[dict]:
	if users_col is None:
		raise HTTPException(status_code=500, detail="Database not initialized")
	return await users_col.find_one({"email": email.lower()})


@app.post("/auth/register")
async def register(req: RegisterRequest) -> dict:
	if not req.email or not req.password:
		raise HTTPException(status_code=400, detail="Email and password are required")
	if not req.username:
		raise HTTPException(status_code=400, detail="Username is required")
	existing = await get_user_by_email(req.email)
	if existing:
		raise HTTPException(status_code=400, detail="User already exists")
	# Check username uniqueness
	if await users_col.find_one({"username": req.username.lower()}):
		raise HTTPException(status_code=400, detail="Username already taken")
	user_doc = {
		"email": req.email.lower(),
		"password_hash": hash_password(req.password),
		"username": req.username.lower(),
		"name": (req.name or "").strip() or None,
		"created_at": datetime.utcnow().isoformat(),
	}
	await users_col.insert_one(user_doc)
	return {"message": "registered"}


@app.post("/auth/login", response_model=TokenResponse)
async def login(req: LoginRequest) -> TokenResponse:
	user = await get_user_by_email(req.email)
	if not user or not verify_password(req.password, user.get("password_hash", "")):
		raise HTTPException(status_code=401, detail="Invalid credentials")
	token = create_access_token({
		"sub": str(user.get("_id")),
		"email": user.get("email"),
		"username": user.get("username"),
		"name": user.get("name"),
	})
	return TokenResponse(access_token=token)


def get_current_user(authorization: Optional[str]) -> dict:
	if not authorization or not authorization.lower().startswith("bearer "):
		raise HTTPException(status_code=401, detail="Missing bearer token")
	token = authorization.split(" ", 1)[1]
	try:
		payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
		return payload
	except JWTError:
		raise HTTPException(status_code=401, detail="Invalid token")


@app.get("/auth/me")
async def me(authorization: Optional[str] = None) -> dict:
	claims = get_current_user(authorization)
	return {"user": {"email": claims.get("email"), "username": claims.get("username"), "name": claims.get("name")}}


@app.post("/auth/logout")
async def logout() -> dict:
	# Stateless JWT: client should discard the token
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
	return {"topics": section_one + section_two}


@app.get("/sections")
def get_sections() -> dict:
	sections = [
		{
			"id": "arithmetic-ability",
			"title": "Section I: Arithmetical Ability",
			"topics": [
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
			],
		},
		{
			"id": "data-interpretation",
			"title": "Section II: Data Interpretation",
			"topics": [
				"36. Tabulation",
				"37. Bar Graphs",
				"38. Pie Chart",
				"39. Line Graphs",
			],
		},
	]
	return {"sections": sections}


@app.post("/explain-topic", response_model=ChatResponse)
def explain_topic(req: TopicRequest) -> ChatResponse:
	system = ChatMessage(
		role="system",
		content=(
			"You are a concise quantitative tutor. Provide a clear, structured explanation with "
			"bullet points, a simple example, and a short summary. Keep it under 200 words unless asked."
		),
	)
	user = ChatMessage(role="user", content=f"Explain the topic: {req.topic}")
	content = call_openrouter([system, user], model=req.model)
	return ChatResponse(content=content)


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
	# Forward the conversation to OpenRouter
	content = call_openrouter(req.messages, model=req.model)
	return ChatResponse(content=content)


if __name__ == "__main__":
	import uvicorn
	uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


