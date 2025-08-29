from fastapi import APIRouter, HTTPException, Header, Depends
from typing import Optional, List
from pydantic import BaseModel
from models import QuizRequest, QuizResponse, QuizSubmission, QuizResult
from quiz_service import get_quiz_questions, get_available_quiz_topics, get_quiz_statistics
from auth import get_current_user
from database import get_collection
from datetime import datetime
import uuid
import json
import urllib.request
import urllib.error
import os

router = APIRouter(prefix="/quiz", tags=["quiz"])

# AI Quiz Generation
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "deepseek/deepseek-chat"

class GenerateQuizRequest(BaseModel):
    topic: str
    explanation: str
    question_count: int = 5

async def generate_quiz_questions_ai(topic: str, explanation: str, question_count: int = 5) -> List[dict]:
    """Generate quiz questions using AI based on topic and explanation"""
    try:
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise Exception("OpenRouter API key not configured")
        
        prompt = f"""
Generate {question_count} multiple choice quiz questions based on the following topic and explanation.

Topic: {topic}

Explanation:
{explanation}

Requirements:
- Create {question_count} questions that test understanding of the key concepts
- Each question should have 4 options (A, B, C, D)
- Only one option should be correct
- Questions should vary in difficulty (easy, medium, hard)
- Include an explanation for the correct answer
- Focus on practical understanding, not just memorization

Format the response as a JSON array with this structure:
[
  {{
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "explanation": "Explanation of why this is correct",
    "difficulty": "easy|medium|hard"
  }}
]

Only return the JSON array, no other text.
"""

        data = {
            "model": DEFAULT_MODEL,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.7,
            "max_tokens": 2000
        }

        req = urllib.request.Request(
            OPENROUTER_API_URL,
            data=json.dumps(data).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}',
                'HTTP-Referer': 'https://quantitative-chatbot.com',
                'X-Title': 'Quantitative Chatbot'
            }
        )

        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            
        if 'choices' not in result or not result['choices']:
            raise Exception("Invalid response from AI service")
            
        content = result['choices'][0]['message']['content']
        
        # Try to extract JSON from the response
        try:
            # Find JSON array in the response
            start = content.find('[')
            end = content.rfind(']') + 1
            if start != -1 and end != 0:
                json_str = content[start:end]
                questions = json.loads(json_str)
            else:
                raise Exception("No JSON array found in response")
        except json.JSONDecodeError:
            raise Exception("Failed to parse AI response as JSON")
        
        # Validate and format questions
        formatted_questions = []
        for i, q in enumerate(questions):
            if not all(key in q for key in ['question', 'options', 'correct_answer']):
                continue
                
            formatted_question = {
                "topic": topic,
                "question": q['question'],
                "options": q['options'][:4],  # Ensure only 4 options
                "correctAnswer": q['correct_answer'],
                "explanation": q.get('explanation', ''),
                "difficulty": q.get('difficulty', 'medium')
            }
            formatted_questions.append(formatted_question)
        
        return formatted_questions
        
    except Exception as e:
        raise Exception(f"Failed to generate quiz questions: {str(e)}")

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

@router.post("/generate", response_model=QuizResponse)
async def generate_quiz_ai(req: GenerateQuizRequest):
    """Generate quiz questions using AI based on topic and explanation"""
    try:
        questions = await generate_quiz_questions_ai(req.topic, req.explanation, req.question_count)
        
        # Store the generated questions in the database
        questions_col = get_collection("quiz_questions")
        if questions_col is not None:
            for question in questions:
                question["_id"] = str(uuid.uuid4())
                await questions_col.insert_one(question)
        
        # Convert to QuizQuestion format for response
        from models import QuizQuestion
        quiz_questions = []
        for q in questions:
            question_data = {
                "id": q["_id"],
                "topic": q["topic"],
                "question": q["question"],
                "options": q["options"],
                "correct_answer": q["correctAnswer"],
                "explanation": q["explanation"],
                "difficulty": q["difficulty"]
            }
            quiz_questions.append(QuizQuestion(**question_data))
        
        response = QuizResponse(
            questions=quiz_questions,
            total_questions=len(quiz_questions)
        )
        
        return response
        
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
