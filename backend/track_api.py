"""
Track API - RESTful endpoints for Track management
Handles CRUD operations for tracks, audio upload, and validation
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Request
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional
import os
import uuid
import shutil
from pathlib import Path
from datetime import datetime

from track_models import (
    Track, TrackCreate, TrackUpdate, TrackListResponse,
    Section, Question, AudioConfig, ValidationResponse
)

# Initialize router
router = APIRouter(prefix="/api/tracks", tags=["tracks"])

# Audio storage directory
AUDIO_DIR = Path("/app/listening_tracks")
AUDIO_DIR.mkdir(exist_ok=True)

ALLOWED_AUDIO_FORMATS = {".mp3", ".wav", ".m4a", ".ogg", ".flac"}
MAX_AUDIO_SIZE = 50 * 1024 * 1024  # 50MB


# ============================================
# DEPENDENCY: Get Database
# ============================================

async def get_db(request: Request):
    """Get MongoDB database from request state"""
    return request.app.state.db


# ============================================
# TRACK CRUD ENDPOINTS
# ============================================

@router.post("", response_model=Track, status_code=201)
async def create_track(
    track_data: TrackCreate,
    request: Request,
    db = Depends(get_db)
):
    """
    Create a new track
    
    - Creates a track with 4 empty sections
    - Status is set to 'draft' by default
    """
    # Get current user (from auth middleware)
    user_id = request.state.user.get("uid", "admin") if hasattr(request.state, "user") else "admin"
    
    # Create track with 4 empty sections
    track = Track(
        title=track_data.title,
        type=track_data.type,
        description=track_data.description,
        time_limit_seconds=track_data.time_limit_seconds,
        created_by=user_id,
        sections=[
            Section(order=1, title=f"Section 1", questions=[]),
            Section(order=2, title=f"Section 2", questions=[]),
            Section(order=3, title=f"Section 3", questions=[]),
            Section(order=4, title=f"Section 4", questions=[])
        ]
    )
    
    # Validate track
    track.validation = track.validate_track()
    
    # Insert into database
    track_dict = track.dict(by_alias=True)
    await db.tracks.insert_one(track_dict)
    
    return track


@router.get("", response_model=TrackListResponse)
async def list_tracks(
    type: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db = Depends(get_db)
):
    """
    List all tracks with optional filters
    
    Query Parameters:
    - type: Filter by track type (listening/reading/writing)
    - status: Filter by status (draft/published/archived)
    - page: Page number (default: 1)
    - page_size: Items per page (default: 20)
    """
    # Build query
    query = {}
    if type:
        query["type"] = type
    if status:
        query["status"] = status
    
    # Count total
    total = await db.tracks.count_documents(query)
    
    # Fetch tracks with pagination
    skip = (page - 1) * page_size
    cursor = db.tracks.find(query).skip(skip).limit(page_size).sort("created_at", -1)
    tracks_data = await cursor.to_list(length=page_size)
    
    # Convert to Track models
    tracks = [Track(**track) for track in tracks_data]
    
    return TrackListResponse(
        tracks=tracks,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{track_id}", response_model=Track)
async def get_track(track_id: str, db = Depends(get_db)):
    """Get a single track by ID"""
    track_data = await db.tracks.find_one({"id": track_id})
    
    if not track_data:
        raise HTTPException(status_code=404, detail="Track not found")
    
    return Track(**track_data)


@router.put("/{track_id}", response_model=Track)
async def update_track(
    track_id: str,
    track_update: TrackUpdate,
    db = Depends(get_db)
):
    """
    Update track metadata
    
    - Can update: title, description, time_limit_seconds, status
    - Cannot update: sections, questions, audio (use dedicated endpoints)
    """
    # Check if track exists
    existing_track = await db.tracks.find_one({"id": track_id})
    if not existing_track:
        raise HTTPException(status_code=404, detail="Track not found")
    
    # Build update data
    update_data = {k: v for k, v in track_update.dict(exclude_unset=True).items() if v is not None}
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    # Update in database
    await db.tracks.update_one(
        {"id": track_id},
        {"$set": update_data}
    )
    
    # Fetch updated track
    updated_track = await db.tracks.find_one({"id": track_id})
    return Track(**updated_track)


@router.delete("/{track_id}")
async def delete_track(track_id: str, db = Depends(get_db)):
    """
    Delete a track
    
    - Permanently removes track from database
    - Use with caution!
    """
    result = await db.tracks.delete_one({"id": track_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Track not found")
    
    return {"message": "Track deleted successfully", "track_id": track_id}


# ============================================
# SECTION & QUESTION MANAGEMENT
# ============================================

@router.post("/{track_id}/sections/{section_order}/questions", response_model=Track)
async def add_question_to_section(
    track_id: str,
    section_order: int,
    question_data: dict,
    db = Depends(get_db)
):
    """
    Add a question to a section
    
    Body should contain:
    - type: Question type
    - payload: Question-specific data
    - image: Optional image data
    - marks: Points (default: 1)
    """
    # Get track
    track_data = await db.tracks.find_one({"id": track_id})
    if not track_data:
        raise HTTPException(status_code=404, detail="Track not found")
    
    track = Track(**track_data)
    
    # Find section
    section = next((s for s in track.sections if s.order == section_order), None)
    if not section:
        raise HTTPException(status_code=404, detail=f"Section {section_order} not found")
    
    # Check question limit
    if len(section.questions) >= 10:
        raise HTTPException(status_code=400, detail="Section already has maximum 10 questions")
    
    # Create question
    question = Question(
        order=len(section.questions) + 1,
        type=question_data.get("type"),
        payload=question_data.get("payload", {}),
        image=question_data.get("image"),
        marks=question_data.get("marks", 1),
        metadata=question_data.get("metadata", {})
    )
    
    # Add to section
    section.questions.append(question)
    
    # Re-validate track
    track.validation = track.validate_track()
    track.updated_at = datetime.utcnow().isoformat()
    
    # Update in database
    await db.tracks.update_one(
        {"id": track_id},
        {"$set": track.dict(by_alias=True)}
    )
    
    return track


@router.put("/{track_id}/sections/{section_order}/questions/{question_id}", response_model=Track)
async def update_question(
    track_id: str,
    section_order: int,
    question_id: str,
    question_update: dict,
    db = Depends(get_db)
):
    """Update a specific question"""
    track_data = await db.tracks.find_one({"id": track_id})
    if not track_data:
        raise HTTPException(status_code=404, detail="Track not found")
    
    track = Track(**track_data)
    
    # Find section and question
    section = next((s for s in track.sections if s.order == section_order), None)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    question = next((q for q in section.questions if q.id == question_id), None)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Update question fields
    for key, value in question_update.items():
        if hasattr(question, key):
            setattr(question, key, value)
    
    # Re-validate and save
    track.validation = track.validate_track()
    track.updated_at = datetime.utcnow().isoformat()
    
    await db.tracks.update_one(
        {"id": track_id},
        {"$set": track.dict(by_alias=True)}
    )
    
    return track


@router.delete("/{track_id}/sections/{section_order}/questions/{question_id}", response_model=Track)
async def delete_question(
    track_id: str,
    section_order: int,
    question_id: str,
    db = Depends(get_db)
):
    """Delete a question and re-index remaining questions"""
    track_data = await db.tracks.find_one({"id": track_id})
    if not track_data:
        raise HTTPException(status_code=404, detail="Track not found")
    
    track = Track(**track_data)
    
    # Find section
    section = next((s for s in track.sections if s.order == section_order), None)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    # Remove question
    section.questions = [q for q in section.questions if q.id != question_id]
    
    # Re-index remaining questions
    for idx, question in enumerate(section.questions, start=1):
        question.order = idx
    
    # Re-validate and save
    track.validation = track.validate_track()
    track.updated_at = datetime.utcnow().isoformat()
    
    await db.tracks.update_one(
        {"id": track_id},
        {"$set": track.dict(by_alias=True)}
    )
    
    return track


# ============================================
# AUDIO UPLOAD
# ============================================

@router.post("/{track_id}/upload-audio")
async def upload_audio(
    track_id: str,
    file: UploadFile = File(...),
    db = Depends(get_db)
):
    """
    Upload audio file for listening track
    
    - Supported formats: MP3, WAV, M4A, OGG, FLAC
    - Max size: 50MB
    - Returns audio URL
    """
    # Get track
    track_data = await db.tracks.find_one({"id": track_id})
    if not track_data:
        raise HTTPException(status_code=404, detail="Track not found")
    
    track = Track(**track_data)
    
    # Validate track type
    if track.type != "listening":
        raise HTTPException(status_code=400, detail="Audio can only be uploaded for listening tracks")
    
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_AUDIO_FORMATS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid audio format. Allowed: {', '.join(ALLOWED_AUDIO_FORMATS)}"
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = AUDIO_DIR / unique_filename
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Get file size
    file_size = os.path.getsize(file_path)
    
    # Validate size
    if file_size > MAX_AUDIO_SIZE:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"File too large. Max: {MAX_AUDIO_SIZE / 1024 / 1024}MB")
    
    # Create audio config
    audio_config = AudioConfig(
        method="upload",
        url=f"/listening_tracks/{unique_filename}",
        original_filename=file.filename,
        size=file_size,
        mime_type=file.content_type
    )
    
    # Update track
    track.audio = audio_config
    track.validation = track.validate_track()
    track.updated_at = datetime.utcnow().isoformat()
    
    await db.tracks.update_one(
        {"id": track_id},
        {"$set": track.dict(by_alias=True)}
    )
    
    return {
        "message": "Audio uploaded successfully",
        "audio_url": audio_config.url,
        "filename": unique_filename,
        "size": file_size
    }


@router.post("/{track_id}/set-audio-url")
async def set_audio_url(
    track_id: str,
    audio_url: str,
    db = Depends(get_db)
):
    """
    Set external audio URL for listening track
    
    Body: { "audio_url": "https://..." }
    """
    # Get track
    track_data = await db.tracks.find_one({"id": track_id})
    if not track_data:
        raise HTTPException(status_code=404, detail="Track not found")
    
    track = Track(**track_data)
    
    # Validate track type
    if track.type != "listening":
        raise HTTPException(status_code=400, detail="Audio can only be set for listening tracks")
    
    # Create audio config
    audio_config = AudioConfig(
        method="url",
        url=audio_url
    )
    
    # Update track
    track.audio = audio_config
    track.validation = track.validate_track()
    track.updated_at = datetime.utcnow().isoformat()
    
    await db.tracks.update_one(
        {"id": track_id},
        {"$set": track.dict(by_alias=True)}
    )
    
    return {
        "message": "Audio URL set successfully",
        "audio_url": audio_url
    }


# ============================================
# VALIDATION & PUBLISHING
# ============================================

@router.post("/{track_id}/validate", response_model=ValidationResponse)
async def validate_track(track_id: str, db = Depends(get_db)):
    """
    Validate track structure
    
    Returns validation result with errors/warnings
    """
    track_data = await db.tracks.find_one({"id": track_id})
    if not track_data:
        raise HTTPException(status_code=404, detail="Track not found")
    
    track = Track(**track_data)
    validation = track.validate_track()
    
    # Update validation in database
    await db.tracks.update_one(
        {"id": track_id},
        {"$set": {"validation": validation.dict()}}
    )
    
    warnings = []
    if validation.total_questions < 40:
        warnings.append(f"Track has only {validation.total_questions} questions (recommended: 40)")
    
    return ValidationResponse(
        is_valid=validation.is_valid,
        errors=validation.errors,
        warnings=warnings
    )


@router.post("/{track_id}/publish", response_model=Track)
async def publish_track(track_id: str, db = Depends(get_db)):
    """
    Publish a track
    
    - Validates track before publishing
    - Sets status to 'published'
    """
    track_data = await db.tracks.find_one({"id": track_id})
    if not track_data:
        raise HTTPException(status_code=404, detail="Track not found")
    
    track = Track(**track_data)
    
    # Validate before publishing
    validation = track.validate_track()
    if not validation.is_valid:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot publish invalid track. Errors: {', '.join(validation.errors)}"
        )
    
    # Update status
    track.status = "published"
    track.updated_at = datetime.utcnow().isoformat()
    
    await db.tracks.update_one(
        {"id": track_id},
        {"$set": track.dict(by_alias=True)}
    )
    
    return track


# Export router
def get_router():
    return router
