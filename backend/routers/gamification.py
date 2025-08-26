from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List, Optional, Any, Dict
from datetime import datetime
from bson import ObjectId
from auth import get_current_user
from gamification_service import gamification_service
from models import *

router = APIRouter(prefix="/gamification", tags=["gamification"])

def serialize_mongo_document(doc: Any) -> Any:
    """Recursively serialize MongoDB documents, converting ObjectId to string"""
    if isinstance(doc, dict):
        serialized = {}
        for key, value in doc.items():
            if key == "_id" and isinstance(value, ObjectId):
                serialized[key] = str(value)
            else:
                serialized[key] = serialize_mongo_document(value)
        return serialized
    elif isinstance(doc, list):
        return [serialize_mongo_document(item) for item in doc]
    elif isinstance(doc, ObjectId):
        return str(doc)
    else:
        return doc

async def get_current_user_id(authorization: Optional[str] = Header(None, alias="Authorization")):
    """Get current user ID from JWT token"""
    claims = get_current_user(authorization)
    return claims.get("sub")

async def get_current_user_full(authorization: Optional[str] = Header(None, alias="Authorization")):
    """Get current user full object from JWT token"""
    return get_current_user(authorization)

@router.get("/stats")
async def get_user_gamification_stats(user_id: str = Depends(get_current_user_id)):
    """Get user's gamification statistics"""
    try:
        gamification_data = await gamification_service.get_user_gamification_data(user_id)
        if gamification_data:
            return gamification_data
        else:
            raise HTTPException(status_code=500, detail="Failed to get gamification data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get gamification stats: {str(e)}")

@router.get("/badges")
async def get_user_badges(user_id: str = Depends(get_current_user_id)):
    """Get user's earned badges"""
    try:
        gamification_data = await gamification_service.get_user_gamification_data(user_id)
        if gamification_data:
            return {"badges": gamification_data.badges}
        else:
            return {"badges": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get badges: {str(e)}")

@router.get("/progress")
async def get_badge_progress(user_id: str = Depends(get_current_user_id)):
    """Get user's progress towards unearned badges"""
    try:
        gamification_data = await gamification_service.get_user_gamification_data(user_id)
        if gamification_data:
            return {"progress": gamification_data.badge_progress}
        else:
            return {"progress": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get badge progress: {str(e)}")

@router.post("/action")
async def record_user_action(
    action: str,
    data: dict,
    user_id: str = Depends(get_current_user_id)
):
    """Record a user action and trigger gamification checks"""
    try:
        # Update study streak
        await gamification_service.update_study_streak(user_id)
        
        # Add points based on action
        points_to_add = 0
        reason = ""
        
        if action == "topic_completed":
            points_to_add = 10
            reason = "Topic completed"
        elif action == "quiz_completed":
            score = data.get("score", 0)
            total = data.get("total_questions", 1)
            percentage = (score / total) * 100
            
            if percentage >= 90:
                points_to_add = 25
                reason = "Excellent quiz performance"
            elif percentage >= 70:
                points_to_add = 15
                reason = "Good quiz performance"
            else:
                points_to_add = 5
                reason = "Quiz completed"
        elif action == "chat_message":
            points_to_add = 1
            reason = "Engaged with AI tutor"
        
        # Add points if any
        points_result = None
        if points_to_add > 0:
            points_result = await gamification_service.add_points(user_id, points_to_add, reason)
        
        # Check for badges
        newly_earned_badges = await gamification_service.check_badges(user_id, action, data)
        
        return {
            "points_gained": points_to_add,
            "points_result": points_result,
            "newly_earned_badges": newly_earned_badges,
            "message": "Action recorded successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record action: {str(e)}")

@router.post("/initialize")
async def initialize_user_gamification(user_id: str = Depends(get_current_user_id)):
    """Initialize gamification data for a user"""
    try:
        success = await gamification_service.initialize_user_gamification(user_id)
        if success:
            return {"message": "Gamification initialized successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to initialize gamification")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize gamification: {str(e)}")

# Admin endpoints for managing gamification content
@router.post("/admin/badges/seed")
async def seed_default_badges(current_user: dict = Depends(get_current_user_full)):
    """Seed default badges (admin only)"""
    try:
        # Check if user is admin
        if not current_user.get("is_admin", False):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        count = await gamification_service.seed_default_badges()
        return {"message": f"Default badges seeded successfully", "count": count}
    except Exception as e:
        print(f"Error in seed_default_badges: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to seed badges: {str(e)}")

@router.get("/admin/badges")
async def get_all_badges(current_user: dict = Depends(get_current_user_full)):
    """Get all badges (admin only)"""
    try:
        # Check if user is admin
        if not current_user.get("is_admin", False):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        badges = await gamification_service.badges_col.find({}).to_list(length=None)
        
        # Serialize MongoDB documents
        serialized_badges = serialize_mongo_document(badges)
        
        return {"badges": serialized_badges}
    except Exception as e:
        print(f"Error in get_all_badges: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get badges: {str(e)}")

@router.get("/admin/user/{user_id}/stats")
async def get_user_stats_admin(user_id: str, current_user: dict = Depends(get_current_user_full)):
    """Get detailed gamification stats for a user (admin only)"""
    try:
        # Check if user is admin
        if not current_user.get("is_admin", False):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        gamification_data = await gamification_service.get_user_gamification_data(user_id)
        if gamification_data:
            # Convert to dict and handle ObjectId serialization
            return gamification_data.dict()
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user stats: {str(e)}")

@router.get("/admin/leaderboard")
async def get_leaderboard(limit: int = 10, current_user: dict = Depends(get_current_user_full)):
    """Get leaderboard of top users (admin only)"""
    try:
        # Check if user is admin
        if not current_user.get("is_admin", False):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Use the service method instead of direct collection access
        leaderboard = await gamification_service.get_leaderboard(limit)
        
        # Serialize MongoDB documents
        serialized_leaderboard = serialize_mongo_document(leaderboard)
        
        return {"leaderboard": serialized_leaderboard}
    except Exception as e:
        print(f"Error in get_leaderboard: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get leaderboard: {str(e)}")
