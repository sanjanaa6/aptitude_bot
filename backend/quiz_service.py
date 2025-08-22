from typing import List, Optional
from models import QuizQuestion, QuizRequest, QuizResponse
from database import get_collection
import logging

logger = logging.getLogger(__name__)

async def get_quiz_questions(req: QuizRequest) -> QuizResponse:
	"""Get quiz questions for a specific topic from the quiz_questions collection"""
	logger.info(f"Getting quiz questions for topic: {req.topic}")
	
	# Use the new quiz_questions collection instead of the old quiz collection
	questions_col = get_collection("quiz_questions")
	if questions_col is None:
		logger.error("quiz_questions collection not available")
		raise Exception("Quiz system not initialized")
	
	# Build query
	query = {"topic": req.topic}
	if req.difficulty:
		query["difficulty"] = req.difficulty
	
	logger.debug(f"Quiz query: {query}")
	
	# Get questions
	questions = await questions_col.find(query).to_list(length=req.question_count or 10)
	logger.info(f"Found {len(questions)} questions for topic: {req.topic}")
	
	# Convert to QuizQuestion objects (map correctAnswer to correct_answer for compatibility)
	quiz_questions = []
	for q in questions:
		# Map the new field names to the old model structure
		question_data = {
			"id": str(q.get("_id", "")),
			"topic": q.get("topic", ""),
			"question": q.get("question", ""),
			"options": q.get("options", []),
			"correct_answer": q.get("correctAnswer", 0),  # Map correctAnswer to correct_answer
			"explanation": q.get("explanation", ""),
			"difficulty": q.get("difficulty", "medium")
		}
		quiz_questions.append(QuizQuestion(**question_data))
	
	response = QuizResponse(
		questions=quiz_questions,
		total_questions=len(quiz_questions)
	)
	logger.info(f"Returning response with {len(response.questions)} questions for topic: {req.topic}")
	return response

async def get_available_quiz_topics() -> List[str]:
	"""Get list of all available topics that have questions in the quiz_questions collection"""
	logger.info("Getting available quiz topics")
	
	questions_col = get_collection("quiz_questions")
	if questions_col is None:
		logger.error("quiz_questions collection not available")
		return []
	
	# Get unique topics that have questions
	pipeline = [
		{"$group": {"_id": "$topic"}},
		{"$sort": {"_id": 1}}
	]
	
	topics = await questions_col.aggregate(pipeline).to_list(length=None)
	available_topics = [topic["_id"] for topic in topics]
	
	logger.info(f"Found {len(available_topics)} topics with questions: {available_topics}")
	return available_topics

async def check_topic_has_questions(topic: str) -> bool:
	"""Check if a specific topic has any questions"""
	logger.info(f"Checking if topic has questions: {topic}")
	
	questions_col = get_collection("quiz_questions")
	if questions_col is None:
		logger.error("quiz_questions collection not available")
		return False
	
	count = await questions_col.count_documents({"topic": topic})
	has_questions = count > 0
	
	logger.info(f"Topic {topic} has {count} questions: {has_questions}")
	return has_questions

async def get_quiz_statistics(topic: str) -> dict:
	"""Get statistics for a specific topic's quizzes"""
	logger.info(f"Getting quiz statistics for topic: {topic}")
	questions_col = get_collection("quiz_questions")
	if questions_col is None:
		logger.error("quiz_questions collection not available")
		raise Exception("Quiz system not initialized")
	
	# Get quiz statistics
	total_questions = await questions_col.count_documents({"topic": topic})
	easy_questions = await questions_col.count_documents({"topic": topic, "difficulty": "easy"})
	medium_questions = await questions_col.count_documents({"topic": topic, "difficulty": "medium"})
	hard_questions = await questions_col.count_documents({"topic": topic, "difficulty": "hard"})
	
	stats = {
		"topic": topic,
		"total_questions": total_questions,
		"difficulty_breakdown": {
			"easy": easy_questions,
			"medium": medium_questions,
			"hard": hard_questions
		}
	}
	
	logger.info(f"Quiz statistics for {topic}: {stats}")
	return stats
