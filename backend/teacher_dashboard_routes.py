"""
Teacher Dashboard API routes
Handles teacher dashboard data, pending submissions, and grading statistics
"""

from fastapi import APIRouter, Request, HTTPException
from typing import Optional
import logging
from database import db
from teacher_auth_service import teacher_auth_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/teachers", tags=["teacher-dashboard"])


def verify_teacher_token(request: Request) -> tuple[bool, dict, str]:
    """
    Verify teacher token from Authorization header
    
    Returns:
        (is_valid, session_data, message)
    """
    try:
        auth_header = request.headers.get('Authorization', '')
        session_token = auth_header.replace('Bearer ', '') if auth_header else None
        
        if not session_token:
            return False, {}, "No session token provided"
        
        is_valid, session_data, message = teacher_auth_service.validate_session_token(session_token)
        return is_valid, session_data, message
    except Exception as e:
        logger.error(f"Error verifying teacher token: {e}")
        return False, {}, str(e)


@router.get("/{teacher_id}/dashboard")
async def get_teacher_dashboard(teacher_id: str, request: Request):
    """
    Get teacher dashboard data
    
    Args:
        teacher_id: Teacher ID (e.g., TCH-ABC123)
    
    Returns:
        Dashboard data including statistics and pending submissions
    """
    try:
        # Verify teacher token
        is_valid, session_data, message = verify_teacher_token(request)
        
        if not is_valid:
            raise HTTPException(status_code=401, detail=message)
        
        # Verify the teacher is accessing their own dashboard
        if session_data.get('teacher_id') != teacher_id:
            raise HTTPException(status_code=403, detail="Cannot access other teacher's dashboard")
        
        # Get teacher info
        teacher = db.get_teacher_by_id(teacher_id)
        if not teacher:
            raise HTTPException(status_code=404, detail="Teacher not found")
        
        # Get pending submissions count
        pending_submissions = db.get_pending_submissions_for_teacher(teacher_id)
        pending_count = len(pending_submissions) if pending_submissions else 0
        
        # Get graded submissions count (this month)
        graded_submissions = db.get_graded_submissions_for_teacher(teacher_id)
        graded_count = len(graded_submissions) if graded_submissions else 0
        
        # Get total students taught
        students = db.get_students_for_teacher(teacher_id)
        total_students = len(students) if students else 0
        
        # Get average grading time (in hours)
        avg_grading_time = 2.5  # Default placeholder
        
        dashboard_data = {
            'success': True,
            'teacher': {
                'teacher_id': teacher.get('teacher_id'),
                'full_name': teacher.get('full_name'),
                'email': teacher.get('email'),
                'subject': teacher.get('subject'),
                'photo_path': teacher.get('photo_path')
            },
            'statistics': {
                'pending_submissions': pending_count,
                'graded_submissions': graded_count,
                'total_students': total_students,
                'average_grading_time': avg_grading_time
            },
            'recent_activity': {
                'last_graded': graded_submissions[0].get('graded_at') if graded_submissions else None,
                'total_graded_this_month': graded_count
            }
        }
        
        logger.info(f"Dashboard data retrieved for teacher: {teacher_id}")
        return dashboard_data
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting teacher dashboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to load dashboard")


@router.get("/{teacher_id}/pending-submissions")
async def get_pending_submissions(teacher_id: str, request: Request):
    """
    Get pending submissions for a teacher
    
    Args:
        teacher_id: Teacher ID (e.g., TCH-ABC123)
    
    Returns:
        List of pending submissions
    """
    try:
        # Verify teacher token
        is_valid, session_data, message = verify_teacher_token(request)
        
        if not is_valid:
            raise HTTPException(status_code=401, detail=message)
        
        # Verify the teacher is accessing their own submissions
        if session_data.get('teacher_id') != teacher_id:
            raise HTTPException(status_code=403, detail="Cannot access other teacher's submissions")
        
        # Get pending submissions
        pending_submissions = db.get_pending_submissions_for_teacher(teacher_id)
        
        if not pending_submissions:
            return {
                'success': True,
                'submissions': []
            }
        
        # Format submissions
        formatted_submissions = []
        for submission in pending_submissions:
            formatted_submissions.append({
                'submission_id': submission.get('submission_id'),
                'student_id': submission.get('student_id'),
                'student_name': submission.get('student_name'),
                'exam_id': submission.get('exam_id'),
                'exam_title': submission.get('exam_title'),
                'submitted_at': submission.get('submitted_at'),
                'status': submission.get('status', 'pending')
            })
        
        logger.info(f"Retrieved {len(formatted_submissions)} pending submissions for teacher: {teacher_id}")
        
        return {
            'success': True,
            'submissions': formatted_submissions
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting pending submissions: {e}")
        raise HTTPException(status_code=500, detail="Failed to load pending submissions")


@router.get("/{teacher_id}/students")
async def get_teacher_students(teacher_id: str, request: Request):
    """
    Get list of students for a teacher
    
    Args:
        teacher_id: Teacher ID (e.g., TCH-ABC123)
    
    Returns:
        List of students
    """
    try:
        # Verify teacher token
        is_valid, session_data, message = verify_teacher_token(request)
        
        if not is_valid:
            raise HTTPException(status_code=401, detail=message)
        
        # Verify the teacher is accessing their own students
        if session_data.get('teacher_id') != teacher_id:
            raise HTTPException(status_code=403, detail="Cannot access other teacher's students")
        
        # Get students
        students = db.get_students_for_teacher(teacher_id)
        
        if not students:
            return {
                'success': True,
                'students': []
            }
        
        # Format students
        formatted_students = []
        for student in students:
            formatted_students.append({
                'student_id': student.get('student_id'),
                'full_name': student.get('full_name'),
                'email': student.get('email'),
                'registration_number': student.get('registration_number'),
                'status': student.get('status', 'active')
            })
        
        logger.info(f"Retrieved {len(formatted_students)} students for teacher: {teacher_id}")
        
        return {
            'success': True,
            'students': formatted_students
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting teacher students: {e}")
        raise HTTPException(status_code=500, detail="Failed to load students")

