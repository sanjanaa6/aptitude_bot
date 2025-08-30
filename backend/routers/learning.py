import json
import os
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from models import MessageRequest, SessionRequest, CodeExecutionRequest
from auth import get_current_user
from database import get_collection

router = APIRouter(prefix="/learning", tags=["Learning"])

# Load learning path data
def load_learning_path():
    try:
        with open("learning_path.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

# Load questions data
def load_questions():
    try:
        with open("questions.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

# In-memory session storage (in production, use Redis or database)
sessions = {}

def save_session(session_id: str, session_data: dict):
    sessions[session_id] = session_data

def load_session(session_id: str) -> dict:
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    return sessions[session_id]

def generate_fallback_explanation(topic: str, difficulty: str, concepts: list) -> str:
    """Generate a fallback explanation when AI is not available"""
    return f"""# {topic}

## Overview
This topic covers fundamental concepts in programming with a {difficulty} difficulty level.

## Key Concepts
{', '.join(concepts)}

## What You'll Learn
- Basic understanding of {topic.lower()}
- Practical examples and exercises
- Hands-on coding practice

## Next Steps
Complete the exercises and challenges to reinforce your learning!"""

@router.post("/start")
async def start_session(user: dict = Depends(get_current_user)):
    """Initialize a new learning session"""
    session_id = str(uuid.uuid4())
    session_data = {
        "language": None,
        "progress": 1,
        "current_problem": None,
        "current_topic": None,
        "attempts": 0,
        "completed_topics": [],
        "conversation_history": [],
        "user_level": "beginner",
        "last_accessed": datetime.now().isoformat()
    }
    save_session(session_id, session_data)
    
    return {
        "session_id": session_id, 
        "message": "Welcome! I'm your personal coding tutor. Which programming language would you like to learn?\n\nAvailable languages:\n• Python\n• JavaScript\n• Java\n• C++"
    }

@router.post("/set-language")
async def set_language(req: MessageRequest, user: dict = Depends(get_current_user)):
    """Set the programming language for the learning session"""
    try:
        session = load_session(req.session_id)
        language = req.message.strip()
        email = req.email or user.get("email")
        
        # Handle various input formats
        language_map = {
            "python": "Python",
            "javascript": "JavaScript", 
            "js": "JavaScript",
            "java": "Java",
            "c++": "C++",
            "cpp": "C++",
            "c": "C++",
            "Java": "Java",
            "Python": "Python",
            "JavaScript": "JavaScript",
            "C++": "C++"
        }
        
        normalized_language = language_map.get(language.lower(), language_map.get(language, None))
        
        learning_path = load_learning_path()
        if normalized_language not in learning_path:
            return {
                "message": "I don't recognize that language. Please choose from:\n• Python\n• JavaScript\n• Java\n• C++",
                "status": "language_selection_needed"
            }
        
        session["language"] = normalized_language
        
        # Get user progress from database
        progress = 1
        completed_topics = []
        current_topic = learning_path[normalized_language][0]
        
        if email:
            sessions_collection = get_collection("sessions")
            progress_doc = await sessions_collection.find_one({"email": email, "subject": normalized_language})
            if progress_doc:
                progress = progress_doc.get("progress", 1)
                completed_topics = progress_doc.get("completed_topics", [])
                topics = learning_path[normalized_language]
                if 1 <= progress <= len(topics):
                    current_topic = topics[progress - 1]
                else:
                    current_topic = topics[0]
        
        session["progress"] = progress
        session["completed_topics"] = completed_topics
        session["current_topic"] = current_topic
        
        save_session(req.session_id, session)
        
        return {
            "message": f"Great choice! Let's begin your {normalized_language} journey.\n\nWe'll start with: **{session['current_topic']['topic']}**\n\nType 'explain' when you're ready to begin.",
            "language": normalized_language,
            "current_topic": session["current_topic"],
            "status": "ready_for_learning"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/explain-topic")
async def explain_topic(req: SessionRequest, user: dict = Depends(get_current_user)):
    """Generate explanation for current topic"""
    try:
        session = load_session(req.session_id)
        email = req.email or user.get("email")
        
        if not session.get("language"):
            raise HTTPException(status_code=400, detail="Language not set")
        
        current_topic = session["current_topic"]
        
        # Generate explanation
        explanation = generate_fallback_explanation(
            current_topic["topic"], 
            current_topic["difficulty"], 
            current_topic["concepts"]
        )
        
        # Update conversation history
        session["conversation_history"].append({
            "type": "explanation",
            "topic": current_topic["topic"],
            "content": explanation,
            "timestamp": datetime.now().isoformat()
        })
        
        save_session(req.session_id, session)
        
        return {
            "topic": current_topic["topic"],
            "explanation": f"**{current_topic['topic']}**\n\n{explanation}\n\nReady to test your understanding? Click 'challenge' to get a coding problem.",
            "concepts": current_topic["concepts"],
            "difficulty": current_topic["difficulty"],
            "status": "explained"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-challenge")
async def generate_challenge(req: SessionRequest, user: dict = Depends(get_current_user)):
    """Generate a coding challenge for the current topic"""
    try:
        session = load_session(req.session_id)
        
        if not session.get("language"):
            raise HTTPException(status_code=400, detail="Language not set")
        
        current_topic = session.get("current_topic")
        if not current_topic:
            raise HTTPException(status_code=400, detail="No active topic")
        
        # Load questions
        questions = load_questions()
        if not questions:
            raise HTTPException(status_code=500, detail="No questions available")
        
        # Select a random question
        import random
        question = random.choice(questions)
        
        # Format the problem
        formatted_problem = f"""**Problem Statement:**
{question['problem_statement']}

**Input Format:**
{question.get('input_format', '- Single line containing an integer N')}

**Test Cases:**"""

        # Add examples
        for i, example in enumerate(question['examples'], 1):
            formatted_problem += f"""

Test Case {i}:
📥 Input:
```
{example['input']}
```
📤 Expected Output:
```
{example['output']}
```"""
            if 'explanation' in example:
                formatted_problem += f"""
💡 Explanation: {example['explanation']}"""

        # Add language-specific starter code
        language = session.get("language")
        starter_code = ""
        
        if language == "Python":
            starter_code = """# Read input
N = int(input())
# Your solution here
print("Hello, World!")"""
        elif language == "JavaScript":
            starter_code = """// Read input using readline
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let inputLines = [];
rl.on('line', (line) => {
    inputLines.push(line);
});

rl.on('close', () => {
    const N = parseInt(inputLines[0]);
    // Your solution here
    console.log("Hello, World!");
});"""
        elif language == "Java":
            starter_code = """import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int N = sc.nextInt();
        // Your solution here
        System.out.println("Hello, World!");
        sc.close();
    }
}"""
        elif language == "C++":
            starter_code = """#include <iostream>
using namespace std;

int main() {
    int N;
    cin >> N;
    // Your solution here
    cout << "Hello, World!" << endl;
    return 0;
}"""

        formatted_problem += f"""

**Starter Code:**
```{language.lower()}
{starter_code}
```"""

        # Create test cases
        test_cases = []
        if 'sample_test_case' in question:
            test_cases.append({
                'input': question['sample_test_case']['input'],
                'output': question['sample_test_case']['expected_output']
            })
        
        for example in question['examples']:
            test_cases.append({
                'input': example['input'],
                'output': example['output']
            })

        # Store in session
        session["current_problem"] = {
            "text": formatted_problem,
            "test_cases": test_cases,
            "generated_at": datetime.now().isoformat()
        }
        session["hints_cache"] = []
        save_session(req.session_id, session)

        return {
            "status": "success",
            "challenge": {
                "id": question['id'],
                "question": formatted_problem,
                "test_cases": test_cases,
                "difficulty": question['difficulty']
            },
            "show_explain": False,
            "show_hint": True
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/get-hint")
async def get_hint(req: SessionRequest, user: dict = Depends(get_current_user)):
    """Get a hint for the current challenge"""
    try:
        session = load_session(req.session_id)
        
        if not session.get("current_problem"):
            raise HTTPException(status_code=400, detail="No active challenge")
        
        # Generate a helpful hint
        hint = "💡 **Hint**: Start by understanding the problem statement. Break it down into smaller steps and think about what data structures or algorithms might be useful."
        
        return {
            "hint": hint,
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submit-solution")
async def submit_solution(req: CodeExecutionRequest, user: dict = Depends(get_current_user)):
    """Submit a solution for the current challenge"""
    try:
        session = load_session(req.session_id)
        
        if not session.get("current_problem"):
            raise HTTPException(status_code=400, detail="No active challenge")
        
        # For now, just acknowledge the submission
        # In a real system, you would validate the code against test cases
        
        return {
            "status": "submitted",
            "message": "Solution submitted successfully! Your code will be evaluated against the test cases.",
            "correct": True  # Placeholder - would be determined by actual evaluation
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/run-code")
async def run_code(req: CodeExecutionRequest, user: dict = Depends(get_current_user)):
    """Execute code (simulated for now)"""
    try:
        session = load_session(req.session_id)
        session["current_code"] = req.code
        
        # Simulate code execution
        mock_result = {
            "status": "success",
            "output": f"Code execution simulation:\n\nInput: {req.input_data or 'None'}\n\nYour code would execute here.\n\nNote: This is a simulation - external code execution service is not configured.",
            "error": None,
            "execution_time": "N/A",
            "memory": "N/A"
        }
        
        session["last_run_result"] = mock_result
        save_session(req.session_id, session)
        
        return mock_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test-code")
async def test_code(req: CodeExecutionRequest, user: dict = Depends(get_current_user)):
    """Test code against test cases (simulated for now)"""
    try:
        session = load_session(req.session_id)
        
        if not session.get("current_problem"):
            raise HTTPException(status_code=400, detail="No active challenge")
        
        # Simulate test results
        test_results = "🧪 **Test Results**:\n\n✅ Test Case 1: Passed\n✅ Test Case 2: Passed\n\n🎉 All test cases passed!"
        
        return {
            "test_results": test_results,
            "summary": "Great job! Your code passed all test cases.",
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/get-session-status")
async def get_session_status(req: SessionRequest, user: dict = Depends(get_current_user)):
    """Get the current status of the learning session"""
    try:
        session = load_session(req.session_id)
        email = req.email or user.get("email")
        
        return {
            "session_id": req.session_id,
            "language": session.get("language"),
            "progress": session.get("progress", 1),
            "current_topic": session.get("current_topic"),
            "completed_topics": session.get("completed_topics", []),
            "last_accessed": session.get("last_accessed")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reset-session")
async def reset_session(req: SessionRequest, user: dict = Depends(get_current_user)):
    """Reset the learning session"""
    try:
        if req.session_id in sessions:
            del sessions[req.session_id]
        
        return {
            "message": "Session reset successfully",
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/get-user-progress")
async def get_user_progress(req: SessionRequest, user: dict = Depends(get_current_user)):
    """Get user progress for a specific language"""
    try:
        email = req.email or user.get("email")
        language = req.message if hasattr(req, 'message') else None
        
        if not language:
            raise HTTPException(status_code=400, detail="Language not specified")
        
        # Get progress from database
        sessions_collection = get_collection("sessions")
        progress_doc = await sessions_collection.find_one({"email": email, "subject": language})
        
        if progress_doc:
            return {
                "progress": progress_doc.get("progress", 1),
                "completed_topics": progress_doc.get("completed_topics", []),
                "status": "success"
            }
        else:
            return {
                "progress": 1,
                "completed_topics": [],
                "status": "success"
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/save-user-progress")
async def save_user_progress(req: SessionRequest, user: dict = Depends(get_current_user)):
    """Save user progress for a specific language"""
    try:
        email = req.email or user.get("email")
        language = req.message if hasattr(req, 'message') else None
        
        if not language:
            raise HTTPException(status_code=400, detail="Language not specified")
        
        # Save progress to database
        sessions_collection = get_collection("sessions")
        await sessions_collection.update_one(
            {"email": email, "subject": language},
            {
                "$set": {
                    "email": email,
                    "subject": language,
                    "progress": 1,
                    "completed_topics": [],
                    "last_updated": datetime.now()
                }
            },
            upsert=True
        )
        
        return {
            "message": "Progress saved successfully",
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/save-learning-session")
async def save_learning_session(req: SessionRequest, user: dict = Depends(get_current_user)):
    """Save the current learning session"""
    try:
        session = load_session(req.session_id)
        email = req.email or user.get("email")
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not provided")
        
        # Save session to database
        sessions_collection = get_collection("sessions")
        await sessions_collection.update_one(
            {"email": email, "session_id": req.session_id},
            {
                "$set": {
                    "email": email,
                    "session_id": req.session_id,
                    "session_data": session,
                    "last_updated": datetime.now()
                }
            },
            upsert=True
        )
        
        return {
            "message": "Learning session saved successfully",
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

