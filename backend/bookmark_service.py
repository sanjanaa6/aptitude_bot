from typing import List, Optional
from models import Bookmark, BookmarkRequest, BookmarkUpdateRequest, Note, NoteRequest, NoteUpdateRequest
from database import get_collection
from datetime import datetime
import uuid

async def create_bookmark(user_id: str, req: BookmarkRequest) -> Bookmark:
    """Create a new bookmark for a user"""
    bookmarks_col = get_collection("bookmarks")
    if bookmarks_col is None:
        raise Exception("Database not initialized")
    
    bookmark_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    
    bookmark_data = {
        "id": bookmark_id,
        "user_id": user_id,
        "topic": req.topic,
        "title": req.title,
        "content": req.content,
        "created_at": now,
        "updated_at": now
    }
    
    await bookmarks_col.insert_one(bookmark_data)
    return Bookmark(**bookmark_data)

async def get_user_bookmarks(user_id: str, topic: Optional[str] = None) -> List[Bookmark]:
    """Get all bookmarks for a user, optionally filtered by topic"""
    bookmarks_col = get_collection("bookmarks")
    if bookmarks_col is None:
        return []
    
    query = {"user_id": user_id}
    if topic:
        query["topic"] = topic
    
    bookmarks = await bookmarks_col.find(query).sort("created_at", -1).to_list(length=None)
    return [Bookmark(**b) for b in bookmarks]

async def update_bookmark(user_id: str, bookmark_id: str, req: BookmarkUpdateRequest) -> Optional[Bookmark]:
    """Update an existing bookmark"""
    bookmarks_col = get_collection("bookmarks")
    if bookmarks_col is None:
        return None
    
    update_data = {"updated_at": datetime.utcnow().isoformat()}
    if req.title is not None:
        update_data["title"] = req.title
    if req.content is not None:
        update_data["content"] = req.content
    
    result = await bookmarks_col.update_one(
        {"id": bookmark_id, "user_id": user_id},
        {"$set": update_data}
    )
    
    if result.modified_count > 0:
        # Return updated bookmark
        updated = await bookmarks_col.find_one({"id": bookmark_id})
        return Bookmark(**updated) if updated else None
    
    return None

async def delete_bookmark(user_id: str, bookmark_id: str) -> bool:
    """Delete a bookmark"""
    bookmarks_col = get_collection("bookmarks")
    if bookmarks_col is None:
        return False
    
    result = await bookmarks_col.delete_one({"id": bookmark_id, "user_id": user_id})
    return result.deleted_count > 0

async def create_note(user_id: str, req: NoteRequest) -> Note:
    """Create a new note for a user"""
    notes_col = get_collection("notes")
    if notes_col is None:
        raise Exception("Database not initialized")
    
    note_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    
    note_data = {
        "id": note_id,
        "user_id": user_id,
        "topic": req.topic,
        "title": req.title,
        "content": req.content,
        "created_at": now,
        "updated_at": now
    }
    
    await notes_col.insert_one(note_data)
    return Note(**note_data)

async def get_user_notes(user_id: str, topic: Optional[str] = None) -> List[Note]:
    """Get all notes for a user, optionally filtered by topic"""
    notes_col = get_collection("notes")
    if notes_col is None:
        return []
    
    query = {"user_id": user_id}
    if topic:
        query["topic"] = topic
    
    notes = await notes_col.find(query).sort("created_at", -1).to_list(length=None)
    return [Note(**n) for n in notes]

async def update_note(user_id: str, note_id: str, req: NoteUpdateRequest) -> Optional[Note]:
    """Update an existing note"""
    notes_col = get_collection("notes")
    if notes_col is None:
        return None
    
    update_data = {"updated_at": datetime.utcnow().isoformat()}
    if req.title is not None:
        update_data["title"] = req.title
    if req.content is not None:
        update_data["content"] = req.content
    
    result = await notes_col.update_one(
        {"id": note_id, "user_id": user_id},
        {"$set": update_data}
    )
    
    if result.modified_count > 0:
        # Return updated note
        updated = await notes_col.find_one({"id": note_id})
        return Note(**updated) if updated else None
    
    return None

async def delete_note(user_id: str, note_id: str) -> bool:
    """Delete a note"""
    notes_col = get_collection("notes")
    if notes_col is None:
        return False
    
    result = await notes_col.delete_one({"id": note_id, "user_id": user_id})
    return result.deleted_count > 0

async def get_bookmarks_and_notes_summary(user_id: str) -> dict:
    """Get summary of user's bookmarks and notes"""
    bookmarks_col = get_collection("bookmarks")
    notes_col = get_collection("notes")
    
    if bookmarks_col is None or notes_col is None:
        return {"bookmarks_count": 0, "notes_count": 0, "topics_with_content": []}
    
    # Count bookmarks and notes
    bookmarks_count = await bookmarks_col.count_documents({"user_id": user_id})
    notes_count = await notes_col.count_documents({"user_id": user_id})
    
    # Get unique topics that have bookmarks or notes
    bookmark_topics = await bookmarks_col.distinct("topic", {"user_id": user_id})
    note_topics = await notes_col.distinct("topic", {"user_id": user_id})
    all_topics = list(set(bookmark_topics + note_topics))
    
    return {
        "bookmarks_count": bookmarks_count,
        "notes_count": notes_count,
        "topics_with_content": all_topics
    }
