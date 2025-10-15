"""
Exam Track API - Endpoints for creating and managing track-based exams
Handles exam creation from tracks, starting exams, and track progression
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional
from datetime import datetime

from track_models import (
    Exam, ExamFromTracks, ExamTrack, ExamSettings,
    Submission, SubmissionCreate, SubmissionAutosave,
    TrackAnswers, Track,
    ExamStartResponse, NextTrackResponse
)

# Initialize router
router = APIRouter(prefix="/api/exams", tags=["exams-tracks"])


# ============================================
# DEPENDENCY: Get Database
# ============================================

async def get_db(request: Request):
    """Get MongoDB database from request state"""
    return request.app.state.db


# ============================================
# EXAM CREATION FROM TRACKS
# ============================================

@router.post("/from-tracks", response_model=Exam, status_code=201)
async def create_exam_from_tracks(
    exam_data: ExamFromTracks,
    request: Request,
    db = Depends(get_db)
):
    """
    Create an exam from one or more tracks
    
    - Validates that all tracks exist
    - Calculates total questions and duration
    - Creates exam with sequential track order
    """
    # Get current user
    user_id = request.state.user.get("uid", "admin") if hasattr(request.state, "user") else "admin"
    
    # Fetch all tracks
    tracks_data = []
    total_questions = 0
    total_duration = 0
    
    for idx, track_id in enumerate(exam_data.track_ids):
        track_data = await db.tracks.find_one({"id": track_id})
        if not track_data:
            raise HTTPException(status_code=404, detail=f"Track {track_id} not found")
        
        track = Track(**track_data)
        
        # Check if track is published
        if track.status != "published":
            raise HTTPException(
                status_code=400,
                detail=f"Track '{track.title}' is not published"
            )
        
        tracks_data.append(track)
        
        # Count questions
        track_questions = sum(len(section.questions) for section in track.sections)
        total_questions += track_questions
        total_duration += track.time_limit_seconds
    
    # Create exam tracks list
    exam_tracks = [
        ExamTrack(
            track_id=track.id,
            order=idx + 1,
            track_type=track.type
        )
        for idx, track in enumerate(tracks_data)
    ]
    
    # Create exam
    exam = Exam(
        title=exam_data.title,
        description=exam_data.description,
        created_by=user_id,
        tracks=exam_tracks,
        settings=exam_data.settings,
        total_questions=total_questions,
        total_duration=total_duration,
        published=exam_data.published,
        is_visible=exam_data.is_visible
    )
    
    # Save to database
    exam_dict = exam.dict(by_alias=True)
    await db.exams.insert_one(exam_dict)
    
    return exam


@router.get("/track-based", response_model=List[Exam])
async def list_track_based_exams(
    published: Optional[bool] = None,
    db = Depends(get_db)
):
    """
    List all track-based exams
    
    Query Parameters:
    - published: Filter by published status
    """
    query = {}
    if published is not None:
        query["published"] = published
    
    cursor = db.exams.find(query).sort("created_at", -1)
    exams_data = await cursor.to_list(length=100)
    
    return [Exam(**exam) for exam in exams_data]


@router.get("/{exam_id}/tracks", response_model=dict)
async def get_exam_with_tracks(exam_id: str, db = Depends(get_db)):
    """
    Get exam with full track details
    
    Returns exam object with populated track data
    """
    # Get exam
    exam_data = await db.exams.find_one({"id": exam_id})
    if not exam_data:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    exam = Exam(**exam_data)
    
    # Fetch all tracks
    tracks = []
    for exam_track in exam.tracks:
        track_data = await db.tracks.find_one({"id": exam_track.track_id})
        if track_data:
            tracks.append(Track(**track_data))
    
    return {
        "exam": exam,
        "tracks": tracks
    }


# ============================================
# EXAM START & SUBMISSION CREATION
# ============================================

@router.get("/{exam_id}/start", response_model=ExamStartResponse)
async def start_exam(
    exam_id: str,
    request: Request,
    db = Depends(get_db)
):
    """
    Start an exam for a student
    
    - Creates a submission record
    - Returns first track
    - Returns exam settings
    """
    # Get exam
    exam_data = await db.exams.find_one({"id": exam_id})
    if not exam_data:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    exam = Exam(**exam_data)
    
    # Check if exam is published and visible
    if not exam.published or not exam.is_visible:
        raise HTTPException(status_code=403, detail="Exam is not available")
    
    # Get user info (from auth middleware or anonymous)
    user_id = "anonymous"
    user_email = "anonymous@example.com"
    user_name = "Anonymous Student"
    
    if hasattr(request.state, "user"):
        user = request.state.user
        user_id = user.get("uid", "anonymous")
        user_email = user.get("email", "anonymous@example.com")
        user_name = user.get("name", user_email.split("@")[0])
    
    # Check if user already has a submission for this exam
    existing_submission = await db.submissions.find_one({
        "exam_id": exam_id,
        "user_id": user_id
    })
    
    if existing_submission and existing_submission.get("status") == "completed":
        raise HTTPException(
            status_code=400,
            detail="You have already completed this exam"
        )
    
    # Get first track
    first_track_id = exam.tracks[0].track_id
    first_track_data = await db.tracks.find_one({"id": first_track_id})
    if not first_track_data:
        raise HTTPException(status_code=500, detail="First track not found")
    
    first_track = Track(**first_track_data)
    
    # Create or resume submission
    if existing_submission:
        submission = Submission(**existing_submission)
    else:
        # Initialize track answers for all tracks
        track_answers_list = []
        for exam_track in exam.tracks:
            track_data = await db.tracks.find_one({"id": exam_track.track_id})
            if track_data:
                track = Track(**track_data)
                total_qs = sum(len(section.questions) for section in track.sections)
                track_answers_list.append(
                    TrackAnswers(
                        track_id=track.id,
                        track_type=track.type,
                        status="not_started",
                        total_questions=total_qs
                    )
                )
        
        # Create submission
        submission = Submission(
            exam_id=exam_id,
            user_id=user_id,
            user_email=user_email,
            user_name=user_name,
            tracks=track_answers_list,
            current_track_index=0,
            total_questions=exam.total_questions
        )
        
        # Mark first track as in progress
        submission.tracks[0].status = "in_progress"
        submission.tracks[0].started_at = datetime.utcnow().isoformat()
        
        # Save submission
        submission_dict = submission.dict(by_alias=True)
        await db.submissions.insert_one(submission_dict)
    
    return ExamStartResponse(
        submission_id=submission.id,
        exam=exam,
        first_track=first_track,
        settings=exam.settings
    )


# ============================================
# TRACK PROGRESSION
# ============================================

@router.post("/submissions/{submission_id}/next-track", response_model=NextTrackResponse)
async def get_next_track(
    submission_id: str,
    db = Depends(get_db)
):
    """
    Get next track after completing current one
    
    - Marks current track as completed
    - Returns next track if available
    - Returns waiting screen info if needed
    """
    # Get submission
    submission_data = await db.submissions.find_one({"id": submission_id})
    if not submission_data:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    submission = Submission(**submission_data)
    
    # Get exam
    exam_data = await db.exams.find_one({"id": submission.exam_id})
    if not exam_data:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    exam = Exam(**exam_data)
    
    # Mark current track as completed
    current_track = submission.tracks[submission.current_track_index]
    if current_track.status != "completed":
        current_track.status = "completed"
        current_track.completed_at = datetime.utcnow().isoformat()
        
        # Calculate time spent
        if current_track.started_at:
            started = datetime.fromisoformat(current_track.started_at)
            completed = datetime.fromisoformat(current_track.completed_at)
            current_track.time_spent = int((completed - started).total_seconds())
    
    # Check if there's a next track
    next_track_index = submission.current_track_index + 1
    has_next = next_track_index < len(exam.tracks)
    
    if not has_next:
        # No more tracks - exam complete
        submission.status = "completed"
        submission.submitted_at = datetime.utcnow().isoformat()
        
        await db.submissions.update_one(
            {"id": submission_id},
            {"$set": submission.dict(by_alias=True)}
        )
        
        return NextTrackResponse(
            has_next=False,
            waiting_required=False,
            wait_seconds=0,
            next_track=None,
            progress={
                "completed_tracks": len([t for t in submission.tracks if t.status == "completed"]),
                "total_tracks": len(exam.tracks),
                "status": "completed"
            }
        )
    
    # Get next track
    next_exam_track = exam.tracks[next_track_index]
    next_track_data = await db.tracks.find_one({"id": next_exam_track.track_id})
    if not next_track_data:
        raise HTTPException(status_code=500, detail="Next track not found")
    
    next_track = Track(**next_track_data)
    
    # Update submission
    submission.current_track_index = next_track_index
    submission.tracks[next_track_index].status = "in_progress"
    submission.tracks[next_track_index].started_at = datetime.utcnow().isoformat()
    
    await db.submissions.update_one(
        {"id": submission_id},
        {"$set": submission.dict(by_alias=True)}
    )
    
    # Determine if waiting is required
    waiting_required = exam.settings.wait_between_tracks_seconds > 0
    
    return NextTrackResponse(
        has_next=True,
        waiting_required=waiting_required,
        wait_seconds=exam.settings.wait_between_tracks_seconds,
        next_track=next_track,
        progress={
            "completed_tracks": next_track_index,
            "total_tracks": len(exam.tracks),
            "current_track": next_track_index + 1
        }
    )


# ============================================
# AUTOSAVE & SUBMISSION
# ============================================

@router.post("/submissions/{submission_id}/autosave")
async def autosave_answer(
    submission_id: str,
    autosave_data: SubmissionAutosave,
    db = Depends(get_db)
):
    """
    Autosave a single answer
    
    - Updates answer for specific question in current track
    - Debounced on client side
    """
    # Get submission
    submission_data = await db.submissions.find_one({"id": submission_id})
    if not submission_data:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    submission = Submission(**submission_data)
    
    # Find the track
    track = next((t for t in submission.tracks if t.track_id == autosave_data.track_id), None)
    if not track:
        raise HTTPException(status_code=404, detail="Track not found in submission")
    
    # Update answer
    track.answers[autosave_data.question_id] = autosave_data.answer
    
    # Update in database
    await db.submissions.update_one(
        {"id": submission_id},
        {"$set": {"tracks": [t.dict() for t in submission.tracks]}}
    )
    
    return {
        "message": "Answer saved",
        "question_id": autosave_data.question_id,
        "timestamp": autosave_data.timestamp
    }


@router.post("/submissions/{submission_id}/submit")
async def submit_exam(
    submission_id: str,
    db = Depends(get_db)
):
    """
    Final submission of entire exam
    
    - Marks all tracks as completed
    - Calculates total score (if auto-gradable)
    - Sets status to 'completed'
    """
    # Get submission
    submission_data = await db.submissions.find_one({"id": submission_id})
    if not submission_data:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    submission = Submission(**submission_data)
    
    # Mark as completed
    submission.status = "completed"
    submission.submitted_at = datetime.utcnow().isoformat()
    
    # TODO: Calculate auto-grading scores for each track
    # This will be implemented when grading logic is added
    
    await db.submissions.update_one(
        {"id": submission_id},
        {"$set": submission.dict(by_alias=True)}
    )
    
    return {
        "message": "Exam submitted successfully",
        "submission_id": submission_id,
        "status": "completed"
    }


@router.get("/submissions/{submission_id}", response_model=Submission)
async def get_submission(submission_id: str, db = Depends(get_db)):
    """Get submission details"""
    submission_data = await db.submissions.find_one({"id": submission_id})
    if not submission_data:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    return Submission(**submission_data)


# Export router
def get_router():
    return router
