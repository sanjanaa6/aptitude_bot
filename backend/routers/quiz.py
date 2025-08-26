from fastapi import APIRouter, HTTPException, Header, Depends
from typing import Optional
from models import QuizRequest, QuizResponse, QuizSubmission, QuizResult
from quiz_service import get_quiz_questions, get_available_quiz_topics, get_quiz_statistics
from auth import get_current_user
from database import get_collection
from datetime import datetime
import uuid

router = APIRouter(prefix="/quiz", tags=["quiz"])

async def get_current_user_id(authorization: Optional[str] = Header(None, alias="Authorization")):
    """Get current user ID from JWT token"""
    claims = get_current_user(authorization)
    return claims.get("sub")

@router.get("/topics")
async def get_quiz_topics():
    """Get list of topics that have quizzes available"""
    try:
        topics = await get_available_quiz_topics()
        return {"topics": topics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/topics/{topic}/stats")
async def get_topic_quiz_stats(topic: str):
    """Get statistics for quizzes in a specific topic"""
    try:
        stats = await get_quiz_statistics(topic)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/questions", response_model=QuizResponse)
async def get_quiz(req: QuizRequest):
    """Get quiz questions for a specific topic"""
    try:
        return await get_quiz_questions(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submit")
async def submit_quiz(
    submission: QuizSubmission,
    user_id: str = Depends(get_current_user_id)
):
    """Submit quiz answers and get results"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        # Get the quiz questions to calculate score
        quiz_col = get_collection("quiz")
        if quiz_col is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        # For now, we'll create a simple quiz result
        # In a real implementation, you'd store the quiz questions and validate answers
        quiz_result = QuizResult(
            quiz_id=submission.quiz_id,
            score=0,  # This would be calculated based on correct answers
            total_questions=len(submission.answers),
            correct_answers=0,  # This would be calculated
            time_taken=submission.time_taken,
            completed_at=datetime.utcnow().isoformat()
        )
        
        # Store quiz result
        quiz_results_col = get_collection("quiz_results")
        if quiz_results_col is not None:
            await quiz_results_col.insert_one(quiz_result.model_dump())
        
        # Trigger gamification for quiz completion
        from gamification_service import gamification_service
        gamification_data = {
            "score": quiz_result.score,
            "total_questions": quiz_result.total_questions,
            "time_taken": quiz_result.time_taken,
            "quiz_id": submission.quiz_id
        }
        newly_earned_badges = await gamification_service.check_badges(
            user_id, "quiz_completed", gamification_data
        )
        
        return {
            "message": "Quiz submitted successfully",
            "result": quiz_result,
            "gamification": {
                "newly_earned_badges": newly_earned_badges
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/results")
async def get_user_quiz_results(user_id: str = Depends(get_current_user_id)):
    """Get quiz results for the current user"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        quiz_results_col = get_collection("quiz_results")
        if quiz_results_col is None:
            return {"results": []}
        
        results = await quiz_results_col.find({"user_id": user_id}).sort("completed_at", -1).to_list(length=None)
        return {"results": results}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
