from pydantic import BaseModel
from typing import List, Optional, Literal, Any
from datetime import datetime

# Existing models
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

class ProgressRequest(BaseModel):
    topic: str
    completed: bool = True

class ProgressResponse(BaseModel):
    topic: str
    completed: bool
    completed_at: Optional[str] = None

class UserProgress(BaseModel):
    user_id: str
    topic: str
    completed: bool
    completed_at: Optional[str] = None

class UserProgressSummary(BaseModel):
    total_topics: int
    completed_topics: int
    progress_percentage: float
    completed_topics_list: List[str]
    remaining_topics: List[str]

# New models for quizzes
class QuizQuestion(BaseModel):
    id: str
    topic: str
    question: str
    options: List[str]
    correct_answer: int  # Index of correct option
    explanation: str
    difficulty: Literal["easy", "medium", "hard"] = "medium"

class QuizRequest(BaseModel):
    topic: str
    difficulty: Optional[Literal["easy", "medium", "hard"]] = None
    question_count: Optional[int] = 10

class QuizResponse(BaseModel):
    questions: List[QuizQuestion]
    total_questions: int

class QuizSubmission(BaseModel):
    quiz_id: str
    answers: List[int]  # User's selected answers
    time_taken: int  # Time taken in seconds

class QuizResult(BaseModel):
    quiz_id: str
    score: int
    total_questions: int
    correct_answers: int
    time_taken: int
    completed_at: str

# New models for bookmarks and notes
class Bookmark(BaseModel):
    id: str
    user_id: str
    topic: str
    title: str
    content: str
    created_at: str
    updated_at: str

class BookmarkRequest(BaseModel):
    topic: str
    title: str
    content: str

class BookmarkUpdateRequest(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class Note(BaseModel):
    id: str
    user_id: str
    topic: str
    title: str
    content: str
    created_at: str
    updated_at: str

class NoteRequest(BaseModel):
    topic: str
    title: str
    content: str

class NoteUpdateRequest(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

# Gamification and Badge models
class Badge(BaseModel):
    id: str
    name: str
    description: str
    icon: str  # Icon name or emoji
    category: Literal["progress", "quiz", "streak", "special", "milestone"]
    criteria: dict  # Achievement criteria
    rarity: Literal["common", "rare", "epic", "legendary"] = "common"
    points: int = 0  # Points awarded for earning this badge
    created_at: str

class UserBadge(BaseModel):
    id: str
    user_id: str
    badge_id: str
    earned_at: str
    progress_towards_next: Optional[float] = None  # For progressive badges

class UserStats(BaseModel):
    user_id: str
    total_points: int = 0
    level: int = 1
    experience: int = 0
    experience_to_next_level: int = 100
    badges_earned: int = 0
    total_badges: int = 0
    current_streak: int = 0
    longest_streak: int = 0
    topics_completed: int = 0
    quizzes_taken: int = 0
    quizzes_passed: int = 0
    last_activity: Optional[str] = None

class BadgeProgress(BaseModel):
    badge_id: str
    badge_name: str
    progress: float  # 0.0 to 1.0
    current_value: int
    target_value: int
    is_earned: bool = False

class GamificationResponse(BaseModel):
    user_stats: UserStats
    badges: List[UserBadge]
    badge_progress: List[BadgeProgress]
    recent_achievements: List[UserBadge]

# Auth models
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

# Admin models
class AdminUserCreate(BaseModel):
    email: str
    password: str
    username: str
    name: Optional[str] = None
    is_admin: bool = False

class AdminUserUpdate(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    username: Optional[str] = None
    name: Optional[str] = None
    is_admin: Optional[bool] = None

class SectionDoc(BaseModel):
    id: str
    title: str
    topics: List[str]

# Learning Models
class MessageRequest(BaseModel):
    session_id: str
    message: str
    email: Optional[str] = None

class SessionRequest(BaseModel):
    session_id: str
    email: Optional[str] = None

class CodeExecutionRequest(BaseModel):
    session_id: str
    code: str
    language: str
    input_data: Optional[str] = None
    email: Optional[str] = None

class LearningSession(BaseModel):
    session_id: str
    email: str
    language: str
    progress: int
    current_topic: dict
    completed_topics: List[str]
    created_at: datetime
    last_accessed: datetime

class UserProgress(BaseModel):
    email: str
    language: str
    progress: int
    completed_topics: List[str]
    last_updated: datetime
