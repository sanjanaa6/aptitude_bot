from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os
 
# Database configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")
MONGO_DB = os.getenv("MONGO_DB", "Quantitative-chatbot")

# Global database client and collections
mongo_client: Optional[AsyncIOMotorClient] = None
db = None

# Collection references
users_col = None
progress_col = None
quiz_col = None
quiz_results_col = None
bookmarks_col = None
notes_col = None
sections_col = None
quiz_questions_col = None

async def init_database():
    """Initialize database connection and collections"""
    global mongo_client, db, users_col, progress_col, quiz_col, quiz_results_col, bookmarks_col, notes_col, sections_col, quiz_questions_col
    
    mongo_client = AsyncIOMotorClient(MONGO_URI)
    db = mongo_client[MONGO_DB]
    
    # Initialize collections
    users_col = db["users"]
    progress_col = db["user_progress"]
    quiz_col = db["quizzes"]
    quiz_results_col = db["quiz_results"]
    bookmarks_col = db["bookmarks"]
    notes_col = db["notes"]
    sections_col = db["sections"]
    quiz_questions_col = db["quiz_questions"]
    
    # Create indexes with error handling
    try:
        await users_col.create_index("email", unique=True)
    except Exception:
        pass  # Index might already exist
    
    try:
        await users_col.create_index("username", unique=True)
    except Exception:
        pass  # Index might already exist
    
    try:
        await progress_col.create_index([("user_id", 1), ("topic", 1)], unique=True)
    except Exception:
        pass  # Index might already exist
    
    try:
        await quiz_col.create_index([("topic", 1), ("difficulty", 1)])
    except Exception:
        pass  # Index might already exist
    
    try:
        await quiz_results_col.create_index([("user_id", 1), ("quiz_id", 1)])
    except Exception:
        pass  # Index might already exist
    
    try:
        await bookmarks_col.create_index([("user_id", 1), ("topic", 1)])
    except Exception:
        pass  # Index might already exist
    
    try:
        await notes_col.create_index([("user_id", 1), ("topic", 1)])
    except Exception:
        pass  # Index might already exist
    try:
        await sections_col.create_index("id", unique=True)
    except Exception:
        pass  # Index might already exist
    
    # Create indexes for quiz_questions collection
    try:
        await quiz_questions_col.create_index("section")
    except Exception:
        pass  # Index might already exist
    
    try:
        await quiz_questions_col.create_index("topic")
    except Exception:
        pass  # Index might already exist
    
    try:
        await quiz_questions_col.create_index("difficulty")
    except Exception:
        pass  # Index might already exist

async def close_database():
    """Close database connection"""
    global mongo_client
    if mongo_client:
        mongo_client.close()

def get_db():
    """Get database instance"""
    return db

def get_collection(collection_name: str):
    """Get a specific collection by name"""
    collections = {
        "users": users_col,
        "progress": progress_col,
        "quiz": quiz_col,
        "quiz_results": quiz_results_col,
        "bookmarks": bookmarks_col,
        "notes": notes_col,
        "sections": sections_col,
        "quiz_questions": quiz_questions_col,
    }
    return collections.get(collection_name)
