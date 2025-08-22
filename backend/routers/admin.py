from fastapi import APIRouter, HTTPException, Header, Depends
from typing import Optional
from auth import get_current_user, hash_password
from database import get_collection
from models import AdminUserCreate, AdminUserUpdate, SectionDoc

router = APIRouter(prefix="/admin", tags=["admin"])

def require_admin(authorization: Optional[str] = Header(None, alias="Authorization")) -> dict:
	claims = get_current_user(authorization)
	if not claims.get("is_admin"):
		raise HTTPException(status_code=403, detail="Admin privileges required")
	return claims

def ensure_quiz_collection():
	"""Ensure the quiz_questions collection exists and has proper indexes"""
	try:
		questions_col = get_collection("quiz_questions")
		if questions_col is None:
			raise HTTPException(status_code=500, detail="Database not initialized")
		
		# Create indexes if they don't exist
		questions_col.create_index("section")
		questions_col.create_index("topic")
		questions_col.create_index("difficulty")
		
		return questions_col
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Failed to initialize quiz collection: {str(e)}")

# Users CRUD
@router.get("/users")
async def list_users(_: dict = Depends(require_admin)):
	users_col = get_collection("users")
	if users_col is None:
		raise HTTPException(status_code=500, detail="Database not initialized")
	users = await users_col.find({}, {"password_hash": 0}).to_list(length=None)
	for u in users:
		u["id"] = str(u.pop("_id"))
	return {"users": users}

@router.post("/users")
async def create_user(req: AdminUserCreate, _: dict = Depends(require_admin)):
	users_col = get_collection("users")
	if users_col is None:
		raise HTTPException(status_code=500, detail="Database not initialized")
	user_doc = {
		"email": req.email.lower(),
		"password_hash": hash_password(req.password),
		"username": req.username.lower(),
		"name": (req.name or "").strip() or None,
		"created_at": __import__("datetime").datetime.utcnow().isoformat(),
		"is_admin": bool(req.is_admin),
	}
	res = await users_col.insert_one(user_doc)
	return {"id": str(res.inserted_id)}

@router.put("/users/{user_id}")
async def update_user(user_id: str, req: AdminUserUpdate, _: dict = Depends(require_admin)):
	from bson import ObjectId
	users_col = get_collection("users")
	if users_col is None:
		raise HTTPException(status_code=500, detail="Database not initialized")
	updates = {}
	if req.email is not None: updates["email"] = req.email.lower()
	if req.username is not None: updates["username"] = req.username.lower()
	if req.name is not None: updates["name"] = (req.name or "").strip() or None
	if req.is_admin is not None: updates["is_admin"] = bool(req.is_admin)
	if req.password:
		updates["password_hash"] = hash_password(req.password)
	if not updates:
		return {"updated": False}
	await users_col.update_one({"_id": ObjectId(user_id)}, {"$set": updates})
	return {"updated": True}

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, _: dict = Depends(require_admin)):
	from bson import ObjectId
	users_col = get_collection("users")
	if users_col is None:
		raise HTTPException(status_code=500, detail="Database not initialized")
	await users_col.delete_one({"_id": ObjectId(user_id)})
	return {"deleted": True}

# Sections/Topics CRUD
@router.get("/sections")
async def list_sections(_: dict = Depends(require_admin)):
	sections_col = get_collection("sections")
	if sections_col is None:
		raise HTTPException(status_code=500, detail="Database not initialized")
	sections = await sections_col.find({}).to_list(length=None)
	# Remove non-serializable ObjectId
	for s in sections:
		s.pop("_id", None)
	return {"sections": sections}

@router.post("/sections")
async def create_section(section: SectionDoc, _: dict = Depends(require_admin)):
	sections_col = get_collection("sections")
	if sections_col is None:
		raise HTTPException(status_code=500, detail="Database not initialized")
	await sections_col.insert_one(section.model_dump())
	return {"created": True}

@router.put("/sections/{section_id}")
async def update_section(section_id: str, section: SectionDoc, _: dict = Depends(require_admin)):
	sections_col = get_collection("sections")
	if sections_col is None:
		raise HTTPException(status_code=500, detail="Database not initialized")
	await sections_col.update_one({"id": section_id}, {"$set": section.model_dump()})
	return {"updated": True}

@router.delete("/sections/{section_id}")
async def delete_section(section_id: str, _: dict = Depends(require_admin)):
	sections_col = get_collection("sections")
	if sections_col is None:
		raise HTTPException(status_code=500, detail="Database not initialized")
	await sections_col.delete_one({"id": section_id})
	return {"deleted": True}

# Quiz Questions CRUD
@router.get("/quiz/questions")
async def list_quiz_questions(section: Optional[str] = None, topic: Optional[str] = None, _: dict = Depends(require_admin)):
	try:
		questions_col = ensure_quiz_collection()
		
		filter_query = {}
		if section:
			filter_query["section"] = section
		if topic:
			filter_query["topic"] = topic
		
		questions = await questions_col.find(filter_query).to_list(length=None)
		for q in questions:
			q["id"] = str(q.pop("_id"))
		return {"questions": questions}
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Failed to list questions: {str(e)}")

@router.post("/quiz/questions")
async def create_quiz_question(question_data: dict, _: dict = Depends(require_admin)):
	try:
		questions_col = ensure_quiz_collection()
		
		# Validate required fields
		required_fields = ["question", "options", "topic", "section"]
		for field in required_fields:
			if field not in question_data or not question_data[field]:
				raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
		
		# Special validation for correctAnswer (can be 0)
		if "correctAnswer" not in question_data or question_data["correctAnswer"] is None:
			raise HTTPException(status_code=400, detail="Missing required field: correctAnswer")
		
		# Validate correctAnswer is a valid index
		try:
			correct_answer = int(question_data["correctAnswer"])
			if correct_answer < 0 or correct_answer >= len(question_data["options"]):
				raise HTTPException(status_code=400, detail="correctAnswer must be a valid option index")
		except (ValueError, TypeError):
			raise HTTPException(status_code=400, detail="correctAnswer must be a valid number")
		
		question_doc = {
			"question": question_data["question"],
			"options": question_data["options"],
			"correctAnswer": correct_answer,
			"explanation": question_data.get("explanation", ""),
			"difficulty": question_data.get("difficulty", "medium"),
			"topic": question_data["topic"],
			"section": question_data["section"],
			"created_at": __import__("datetime").datetime.utcnow().isoformat(),
			"updated_at": __import__("datetime").datetime.utcnow().isoformat()
		}
		
		res = await questions_col.insert_one(question_doc)
		return {"id": str(res.inserted_id)}
	except HTTPException:
		raise
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Failed to create question: {str(e)}")

@router.put("/quiz/questions/{question_id}")
async def update_quiz_question(question_id: str, question_data: dict, _: dict = Depends(require_admin)):
	try:
		from bson import ObjectId
		questions_col = ensure_quiz_collection()
		
		# Validate required fields
		required_fields = ["question", "options", "topic", "section"]
		for field in required_fields:
			if field not in question_data or not question_data[field]:
				raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
		
		# Special validation for correctAnswer (can be 0)
		if "correctAnswer" not in question_data or question_data["correctAnswer"] is None:
			raise HTTPException(status_code=400, detail="Missing required field: correctAnswer")
		
		# Validate correctAnswer is a valid index
		try:
			correct_answer = int(question_data["correctAnswer"])
			if correct_answer < 0 or correct_answer >= len(question_data["options"]):
				raise HTTPException(status_code=400, detail="correctAnswer must be a valid option index")
		except (ValueError, TypeError):
			raise HTTPException(status_code=400, detail="correctAnswer must be a valid number")
		
		updates = {
			"question": question_data["question"],
			"options": question_data["options"],
			"correctAnswer": correct_answer,
			"explanation": question_data.get("explanation", ""),
			"difficulty": question_data.get("difficulty", "medium"),
			"topic": question_data["topic"],
			"section": question_data["section"],
			"updated_at": __import__("datetime").datetime.utcnow().isoformat()
		}
		
		result = await questions_col.update_one({"_id": ObjectId(question_id)}, {"$set": updates})
		if result.matched_count == 0:
			raise HTTPException(status_code=404, detail="Question not found")
		
		return {"updated": True}
	except HTTPException:
		raise
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Failed to update question: {str(e)}")

@router.delete("/quiz/questions/{question_id}")
async def delete_quiz_question(question_id: str, _: dict = Depends(require_admin)):
	try:
		from bson import ObjectId
		questions_col = ensure_quiz_collection()
		
		result = await questions_col.delete_one({"_id": ObjectId(question_id)})
		if result.deleted_count == 0:
			raise HTTPException(status_code=404, detail="Question not found")
		
		return {"deleted": True}
	except HTTPException:
		raise
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Failed to delete question: {str(e)}")

@router.get("/quiz/stats")
async def get_quiz_stats(_: dict = Depends(require_admin)):
	try:
		questions_col = ensure_quiz_collection()
		
		# Get total questions count
		total_questions = await questions_col.count_documents({})
		
		# Get questions by difficulty
		easy_count = await questions_col.count_documents({"difficulty": "easy"})
		medium_count = await questions_col.count_documents({"difficulty": "medium"})
		hard_count = await questions_col.count_documents({"difficulty": "hard"})
		
		# Get questions by section
		sections_pipeline = [
			{"$group": {"_id": "$section", "count": {"$sum": 1}}},
			{"$sort": {"count": -1}}
		]
		sections_stats = await questions_col.aggregate(sections_pipeline).to_list(length=None)
		
		return {
			"total_questions": total_questions,
			"by_difficulty": {
				"easy": easy_count,
				"medium": medium_count,
				"hard": hard_count
			},
			"by_section": sections_stats
		}
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Failed to get quiz stats: {str(e)}")

# Seed default sections/topics (39 topics)
def _default_sections() -> list[dict]:
	return [
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

@router.post("/sections/seed-defaults")
async def seed_default_sections(_: dict = Depends(require_admin)):
	sections_col = get_collection("sections")
	if sections_col is None:
		raise HTTPException(status_code=500, detail="Database not initialized")
	await sections_col.delete_many({})
	await sections_col.insert_many(_default_sections())
	docs = await sections_col.find({}).to_list(length=None)
	for d in docs:
		d.pop("_id", None)
	return {"sections": docs}


