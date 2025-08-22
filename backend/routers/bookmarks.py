from fastapi import APIRouter, HTTPException, Header, Depends, Query
from typing import Optional
from models import (
    BookmarkRequest, BookmarkUpdateRequest, Bookmark,
    NoteRequest, NoteUpdateRequest, Note
)
from bookmark_service import (
    create_bookmark, get_user_bookmarks, update_bookmark, delete_bookmark,
    create_note, get_user_notes, update_note, delete_note,
    get_bookmarks_and_notes_summary
)
from auth import get_current_user

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])

async def get_current_user_id(authorization: Optional[str] = Header(None, alias="Authorization")):
    """Get current user ID from JWT token"""
    claims = get_current_user(authorization)
    return claims.get("sub")

# Bookmark endpoints
@router.post("/", response_model=Bookmark)
async def create_user_bookmark(
    req: BookmarkRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new bookmark"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        return await create_bookmark(user_id, req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=list[Bookmark])
async def get_bookmarks(
    topic: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user_id)
):
    """Get user's bookmarks, optionally filtered by topic"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        return await get_user_bookmarks(user_id, topic)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{bookmark_id}", response_model=Bookmark)
async def update_user_bookmark(
    bookmark_id: str,
    req: BookmarkUpdateRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Update a bookmark"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        updated = await update_bookmark(user_id, bookmark_id, req)
        if not updated:
            raise HTTPException(status_code=404, detail="Bookmark not found")
        return updated
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{bookmark_id}")
async def delete_user_bookmark(
    bookmark_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a bookmark"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        success = await delete_bookmark(user_id, bookmark_id)
        if not success:
            raise HTTPException(status_code=404, detail="Bookmark not found")
        return {"message": "Bookmark deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Note endpoints
@router.post("/notes", response_model=Note)
async def create_user_note(
    req: NoteRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new note"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        return await create_note(user_id, req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/notes", response_model=list[Note])
async def get_notes(
    topic: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user_id)
):
    """Get user's notes, optionally filtered by topic"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        return await get_user_notes(user_id, topic)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/notes/{note_id}", response_model=Note)
async def update_user_note(
    note_id: str,
    req: NoteUpdateRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Update a note"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        updated = await update_note(user_id, note_id, req)
        if not updated:
            raise HTTPException(status_code=404, detail="Note not found")
        return updated
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/notes/{note_id}")
async def delete_user_note(
    note_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a note"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        success = await delete_note(user_id, note_id)
        if not success:
            raise HTTPException(status_code=404, detail="Note not found")
        return {"message": "Note deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Summary endpoint
@router.get("/summary")
async def get_bookmarks_notes_summary(user_id: str = Depends(get_current_user_id)):
    """Get summary of user's bookmarks and notes"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        return await get_bookmarks_and_notes_summary(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
