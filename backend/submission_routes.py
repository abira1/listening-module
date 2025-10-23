"""
API Routes for exam submissions and grading
Handles submission creation, answer saving, submission, and results retrieval
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Any, Dict, Optional
import logging
from submission_service import SubmissionService
from database import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/submissions", tags=["submissions"])


# ==================== REQUEST MODELS ====================

class StartSubmissionRequest(BaseModel):
    """Request to start a new submission"""
    track_id: str
    student_id: str


class SaveAnswerRequest(BaseModel):
    """Request to save an answer"""
    question_id: str
    student_answer: Any


class SubmitExamRequest(BaseModel):
    """Request to submit exam (empty body)"""
    pass


# ==================== API ENDPOINTS ====================

@router.post("/start")
async def start_submission(request: StartSubmissionRequest):
    """
    Start a new exam submission
    
    Args:
        track_id: ID of the track/exam
        student_id: ID of the student
        
    Returns:
        {
            'success': bool,
            'submission_id': str,
            'track': dict,
            'questions': list,
            'error': str (if failed)
        }
    """
    try:
        logger.info(f"Starting submission for student {request.student_id} on track {request.track_id}")
        
        result = SubmissionService.start_submission(
            track_id=request.track_id,
            student_id=request.student_id
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result.get('error', 'Failed to start submission'))
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting submission: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{submission_id}/autosave")
async def autosave_answer(submission_id: str, request: SaveAnswerRequest):
    """
    Auto-save a student's answer
    
    Args:
        submission_id: ID of the submission
        question_id: ID of the question
        student_answer: The student's answer
        
    Returns:
        {'success': bool, 'error': str (if failed)}
    """
    try:
        logger.debug(f"Auto-saving answer for submission {submission_id}, question {request.question_id}")
        
        result = SubmissionService.save_answer(
            submission_id=submission_id,
            question_id=request.question_id,
            student_answer=request.student_answer
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result.get('error', 'Failed to save answer'))
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving answer: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{submission_id}/submit")
async def submit_exam(submission_id: str):
    """
    Submit exam and perform auto-grading
    
    Args:
        submission_id: ID of the submission
        
    Returns:
        {
            'success': bool,
            'submission_id': str,
            'obtained_marks': int,
            'total_marks': int,
            'percentage': float,
            'results': list,
            'error': str (if failed)
        }
    """
    try:
        logger.info(f"Submitting exam for submission {submission_id}")
        
        result = SubmissionService.submit_and_grade(submission_id)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result.get('error', 'Failed to submit exam'))
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting exam: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{submission_id}/results")
async def get_results(submission_id: str):
    """
    Get detailed results for a submission
    
    Args:
        submission_id: ID of the submission
        
    Returns:
        {
            'success': bool,
            'submission': dict,
            'results': list,
            'error': str (if failed)
        }
    """
    try:
        logger.info(f"Getting results for submission {submission_id}")
        
        result = SubmissionService.get_results(submission_id)
        
        if not result['success']:
            raise HTTPException(status_code=404, detail=result.get('error', 'Submission not found'))
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting results: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== HELPER ENDPOINTS ====================

@router.get("/{submission_id}")
async def get_submission(submission_id: str):
    """
    Get submission details
    
    Args:
        submission_id: ID of the submission
        
    Returns:
        {
            'success': bool,
            'submission': dict,
            'error': str (if failed)
        }
    """
    try:
        submission = db.get_submission(submission_id)
        
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        return {
            'success': True,
            'submission': dict(submission)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting submission: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/student/{student_id}")
async def get_student_submissions(student_id: str):
    """
    Get all submissions for a student
    
    Args:
        student_id: ID of the student
        
    Returns:
        {
            'success': bool,
            'submissions': list,
            'error': str (if failed)
        }
    """
    try:
        submissions = db.get_student_submissions(student_id)
        
        return {
            'success': True,
            'submissions': [dict(s) for s in submissions]
        }
    except Exception as e:
        logger.error(f"Error getting student submissions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

