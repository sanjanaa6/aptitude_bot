from fastapi import HTTPException, Header
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
import os
from database import get_collection

# JWT configuration
JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-prod")
JWT_ALG = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24h

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, password_hash: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, password_hash)

def hash_password(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(subject: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = subject.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALG)

def get_current_user(authorization: Optional[str]) -> dict:
    """Get current user from JWT token"""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_user_by_email(email: str) -> Optional[dict]:
    """Get user by email from database"""
    users_col = get_collection("users")
    if users_col is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    return await users_col.find_one({"email": email.lower()})

async def get_user_by_username(username: str) -> Optional[dict]:
    """Get user by username from database"""
    users_col = get_collection("users")
    if users_col is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    return await users_col.find_one({"username": username.lower()})
