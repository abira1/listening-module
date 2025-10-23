"""
Local authentication API routes
Handles student login, admin student management, and session management
"""

from fastapi import APIRouter, Request, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import Optional, List
import logging
from database import db
from local_auth_service import auth_service
import os
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["authentication"])

# Configuration
ADMIN_IP = os.getenv('ADMIN_IP', '192.168.1.100')
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads', 'student_photos')
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_client_ip(request: Request) -> str:
    """Extract client IP from request"""
    if request.client:
        return request.client.host
    return request.headers.get('X-Forwarded-For', 'unknown')


# ==================== STUDENT AUTHENTICATION ====================

@router.post("/student-login")
async def student_login(
    user_id: str = Form(...),
    registration_number: str = Form(...),
    request: Request = None
):
    """
    Student login with User ID and Registration Number

    Args:
        user_id: Student User ID (e.g., STU-2025-001)
        registration_number: Student Registration Number (e.g., REG-2025-001)

    Returns:
        Token and student data
    """
    try:
        # Validate credentials
        is_valid, student, message = auth_service.validate_student_credentials(user_id, registration_number)

        if not is_valid:
            raise HTTPException(status_code=401, detail=message)

        # Create session
        client_ip = get_client_ip(request)
        session_result = auth_service.create_student_session(user_id, client_ip)

        if not session_result['success']:
            raise HTTPException(status_code=500, detail="Failed to create session")

        return {
            'success': True,
            'token': session_result['session_token'],
            'user': {
                'user_id': student['user_id'],
                'name': student['name'],
                'email': student['email'],
                'institute': student['institute'],
                'photo_path': student['photo_path'],
                'status': student.get('status', 'active')  # Return status (active by default)
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")


@router.get("/verify")
async def verify_token(request: Request):
    """
    Verify student token from Authorization header

    Returns:
        Student data if token is valid
    """
    try:
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Missing or invalid token")

        token = auth_header[7:]  # Remove 'Bearer ' prefix

        # Validate token
        is_valid, session, message = auth_service.validate_session_token(token)

        if not is_valid:
            raise HTTPException(status_code=401, detail=message)

        # Get student data
        student = db.get_student(session['user_id'])

        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        return {
            'user_id': student['user_id'],
            'name': student['name'],
            'email': student['email'],
            'institute': student['institute'],
            'photo_path': student['photo_path'],
            'status': student.get('status', 'active')  # Return status (active by default)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/student/logout")
async def student_logout(session_token: str):
    """End student session"""
    try:
        success = auth_service.end_session(session_token)
        return {'success': success}
    except Exception as e:
        logger.error(f"Logout error: {e}")
        raise HTTPException(status_code=500, detail="Logout failed")


@router.get("/student/profile")
async def get_student_profile(request: Request, session_token: Optional[str] = None):
    """Get student profile using session token from Authorization header or query param"""
    try:
        # Get token from Authorization header or query parameter
        token = session_token
        if not token:
            auth_header = request.headers.get('Authorization', '')
            if auth_header.startswith('Bearer '):
                token = auth_header[7:]  # Remove 'Bearer ' prefix

        if not token:
            raise HTTPException(status_code=401, detail="No authentication token provided")

        is_valid, session, message = auth_service.validate_session_token(token)

        if not is_valid:
            raise HTTPException(status_code=401, detail=message)

        student = db.get_student(session['user_id'])
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        return {
            'success': True,
            'student': {
                'user_id': student['user_id'],
                'registration_number': student['registration_number'],
                'name': student['name'],
                'email': student['email'],
                'mobile': student['mobile_number'],
                'institute': student['institute'],
                'department': student['department'],
                'roll_number': student['roll_number'],
                'photo_path': student['photo_path'],
                'status': student.get('status', 'active'),
                'created_at': student['created_at'],
                'last_login': student['last_login']
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to get profile")


@router.get("/students/me/submissions")
async def get_my_submissions(request: Request):
    """
    Get current student's exam submissions

    Returns:
        List of submissions for the authenticated student
    """
    try:
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Missing or invalid token")

        token = auth_header[7:]  # Remove 'Bearer ' prefix

        # Validate token
        is_valid, session, message = auth_service.validate_session_token(token)

        if not is_valid:
            raise HTTPException(status_code=401, detail=message)

        # Get student's submissions
        student_id = session['user_id']
        submissions = db.get_student_submissions(student_id)

        if not submissions:
            return []

        # Format submissions for frontend
        formatted_submissions = []
        for sub in submissions:
            formatted_submissions.append({
                'id': sub.get('id'),
                'exam_id': sub.get('exam_id') or sub.get('track_id'),
                'examId': sub.get('exam_id') or sub.get('track_id'),
                'student_id': sub.get('student_id'),
                'status': sub.get('status'),
                'score': sub.get('score'),
                'total_marks': sub.get('total_marks'),
                'percentage': sub.get('percentage'),
                'submitted_at': sub.get('submitted_at'),
                'created_at': sub.get('created_at')
            })

        return formatted_submissions

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting student submissions: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get submissions: {str(e)}")


# ==================== ADMIN STUDENT MANAGEMENT ====================

@router.post("/admin/students/add")
async def add_student(
    name: str = Form(...),
    email: str = Form(...),
    mobile_number: str = Form(...),
    institute: str = Form(...),
    department: str = Form(''),
    roll_number: str = Form(''),
    photo: Optional[UploadFile] = File(None),
    request: Request = None
):
    """
    Add new student (Admin only - IP based)
    
    Args:
        name: Student name
        email: Student email
        mobile_number: Student mobile number
        institute: Student institute
        department: Student department (optional)
        roll_number: Student roll number (optional)
        photo: Student photo (optional)
    
    Returns:
        Generated credentials
    """
    try:
        # Verify admin IP
        client_ip = get_client_ip(request)
        if not auth_service.validate_admin_ip(client_ip, ADMIN_IP):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Handle photo upload
        photo_path = ''
        if photo:
            filename = f"{datetime.now().timestamp()}_{photo.filename}"
            filepath = os.path.join(UPLOAD_DIR, filename)
            
            with open(filepath, 'wb') as f:
                content = await photo.read()
                f.write(content)
            
            photo_path = f"/uploads/student_photos/{filename}"
        
        # Add student
        result = db.add_student(
            name=name,
            email=email,
            mobile=mobile_number,
            institute=institute,
            department=department,
            roll_number=roll_number,
            photo_path=photo_path,
            created_by=client_ip
        )
        
        if result['success']:
            # Log action
            db.log_admin_action(client_ip, 'add_student', f"Added {name} ({result['user_id']})")
            
            return {
                'success': True,
                'user_id': result['user_id'],
                'registration_number': result['registration_number'],
                'name': result['name'],
                'email': result['email'],
                'mobile': result['mobile'],
                'institute': result['institute']
            }
        else:
            raise HTTPException(status_code=400, detail=result['error'])
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding student: {e}")
        raise HTTPException(status_code=500, detail="Failed to add student")


@router.get("/admin/students")
async def get_all_students(status: Optional[str] = None, request: Request = None):
    """Get all students (Admin only)"""
    try:
        client_ip = get_client_ip(request)
        if not auth_service.validate_admin_ip(client_ip, ADMIN_IP):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        students = db.get_all_students(status)
        return {
            'success': True,
            'count': len(students),
            'students': students
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting students: {e}")
        raise HTTPException(status_code=500, detail="Failed to get students")


@router.get("/admin/students/{user_id}")
async def get_student(user_id: str, request: Request = None):
    """Get student details (Admin only)"""
    try:
        client_ip = get_client_ip(request)
        if not auth_service.validate_admin_ip(client_ip, ADMIN_IP):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        student = db.get_student(user_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        return {'success': True, 'student': student}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting student: {e}")
        raise HTTPException(status_code=500, detail="Failed to get student")


@router.put("/admin/students/{user_id}/status")
async def update_student_status(
    user_id: str,
    status: str = Form(...),
    request: Request = None
):
    """Update student status (Admin only)"""
    try:
        client_ip = get_client_ip(request)
        if not auth_service.validate_admin_ip(client_ip, ADMIN_IP):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        result = auth_service.update_student_status(user_id, status, client_ip)
        
        if result['success']:
            return result
        else:
            raise HTTPException(status_code=400, detail=result['error'])
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating status: {e}")
        raise HTTPException(status_code=500, detail="Failed to update status")


@router.post("/admin/students/{user_id}/regenerate-credentials")
async def regenerate_credentials(
    user_id: str,
    reason: str = Form(''),
    request: Request = None
):
    """Regenerate student credentials (Admin only)"""
    try:
        client_ip = get_client_ip(request)
        if not auth_service.validate_admin_ip(client_ip, ADMIN_IP):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        result = auth_service.regenerate_student_credentials(user_id, reason, client_ip)
        
        if result['success']:
            db.log_admin_action(client_ip, 'regenerate_credentials', f"{user_id}: {reason}")
            return result
        else:
            raise HTTPException(status_code=400, detail=result['error'])
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error regenerating credentials: {e}")
        raise HTTPException(status_code=500, detail="Failed to regenerate credentials")


@router.delete("/admin/students/{user_id}")
async def delete_student(user_id: str, request: Request = None):
    """Delete student (Admin only)"""
    try:
        client_ip = get_client_ip(request)
        if not auth_service.validate_admin_ip(client_ip, ADMIN_IP):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM students WHERE user_id = ?', (user_id,))
        conn.commit()
        conn.close()
        
        db.log_admin_action(client_ip, 'delete_student', user_id)
        
        return {'success': True, 'message': 'Student deleted'}
    
    except Exception as e:
        logger.error(f"Error deleting student: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete student")

