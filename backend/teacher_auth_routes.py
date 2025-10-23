"""
Teacher authentication API routes
Handles teacher login, profile, logout, and password management
"""

from fastapi import APIRouter, Request, HTTPException, Form
from fastapi.responses import JSONResponse
from typing import Optional
import logging
from database import db
from teacher_auth_service import teacher_auth_service
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["teacher-authentication"])


def get_client_ip(request: Request) -> str:
    """Extract client IP from request"""
    if request.client:
        return request.client.host
    return "unknown"


@router.post("/teacher-login")
async def teacher_login(
    request: Request,
    teacher_id: str = Form(...),
    password: str = Form(...)
):
    """
    Teacher login endpoint
    
    Args:
        teacher_id: Teacher ID (e.g., TCH-ABC123)
        password: Teacher password
    
    Returns:
        Session token and teacher data
    """
    try:
        logger.info(f"Teacher login attempt: {teacher_id}")
        
        # Validate credentials
        is_valid, teacher_data, message = teacher_auth_service.validate_teacher_credentials(teacher_id, password)
        
        if not is_valid:
            logger.warning(f"Failed login attempt for teacher: {teacher_id} - {message}")
            raise HTTPException(status_code=401, detail=message)
        
        # Create session
        client_ip = get_client_ip(request)
        session_result = teacher_auth_service.create_teacher_session(
            teacher_id=teacher_id,
            ip_address=client_ip,
            device_info=request.headers.get('user-agent', '')
        )
        
        if not session_result['success']:
            raise HTTPException(status_code=500, detail="Failed to create session")
        
        # Prepare response
        response_data = {
            'token': session_result['session_token'],
            'teacher': {
                'teacher_id': teacher_data['teacher_id'],
                'full_name': teacher_data['full_name'],
                'email': teacher_data['email'],
                'phone_number': teacher_data['phone_number'],
                'subject': teacher_data['subject'],
                'photo_path': teacher_data['photo_path'],
                'role': teacher_data['role'],
                'status': teacher_data['status']
            }
        }
        
        logger.info(f"Successful login for teacher: {teacher_id}")
        
        response = JSONResponse(content=response_data)
        response.set_cookie(
            key="teacher_session_token",
            value=session_result['session_token'],
            httponly=True,
            secure=True,
            samesite="none",
            max_age=24 * 60 * 60,
            path="/"
        )
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during teacher login: {e}")
        raise HTTPException(status_code=500, detail="Login failed")


@router.get("/teacher/profile")
async def get_teacher_profile(request: Request):
    """
    Get teacher profile
    
    Returns:
        Teacher profile data
    """
    try:
        # Get session token from header or cookie
        auth_header = request.headers.get('Authorization', '')
        session_token = auth_header.replace('Bearer ', '') if auth_header else None
        
        if not session_token:
            session_token = request.cookies.get('teacher_session_token')
        
        if not session_token:
            raise HTTPException(status_code=401, detail="No session token provided")
        
        # Validate session
        is_valid, session_data, message = teacher_auth_service.validate_session_token(session_token)
        
        if not is_valid:
            raise HTTPException(status_code=401, detail=message)
        
        # Return teacher profile
        return {
            'teacher': {
                'teacher_id': session_data['teacher_id'],
                'full_name': session_data['full_name'],
                'email': session_data['email'],
                'phone_number': session_data['phone_number'],
                'subject': session_data['subject'],
                'photo_path': session_data['photo_path'],
                'bio': session_data['bio'],
                'role': session_data['role'],
                'status': session_data['status'],
                'created_at': session_data['created_at'],
                'last_login': session_data['last_login']
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting teacher profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to get profile")


@router.post("/teacher/logout")
async def teacher_logout(request: Request):
    """
    Teacher logout endpoint
    
    Returns:
        Success message
    """
    try:
        # Get session token
        auth_header = request.headers.get('Authorization', '')
        session_token = auth_header.replace('Bearer ', '') if auth_header else None
        
        if not session_token:
            session_token = request.cookies.get('teacher_session_token')
        
        if session_token:
            teacher_auth_service.logout_teacher(session_token)
        
        response = JSONResponse(content={'success': True, 'message': 'Logged out successfully'})
        response.delete_cookie('teacher_session_token')
        
        return response
    
    except Exception as e:
        logger.error(f"Error during logout: {e}")
        raise HTTPException(status_code=500, detail="Logout failed")


@router.post("/teacher/change-password")
async def change_teacher_password(
    request: Request,
    current_password: str = Form(...),
    new_password: str = Form(...)
):
    """
    Change teacher password
    
    Args:
        current_password: Current password for verification
        new_password: New password
    
    Returns:
        Success message
    """
    try:
        # Get session token
        auth_header = request.headers.get('Authorization', '')
        session_token = auth_header.replace('Bearer ', '') if auth_header else None
        
        if not session_token:
            session_token = request.cookies.get('teacher_session_token')
        
        if not session_token:
            raise HTTPException(status_code=401, detail="No session token provided")
        
        # Validate session
        is_valid, session_data, message = teacher_auth_service.validate_session_token(session_token)
        
        if not is_valid:
            raise HTTPException(status_code=401, detail=message)
        
        teacher_id = session_data['teacher_id']
        
        # Verify current password
        if not teacher_auth_service.verify_password(current_password, session_data['password_hash']):
            raise HTTPException(status_code=401, detail="Current password is incorrect")
        
        # Hash new password
        new_password_hash = teacher_auth_service.hash_password(new_password)
        
        # Update password
        result = db.update_teacher_password(teacher_id, new_password_hash)
        
        if not result['success']:
            raise HTTPException(status_code=500, detail="Failed to update password")
        
        logger.info(f"Password changed for teacher: {teacher_id}")
        
        return {'success': True, 'message': 'Password changed successfully'}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error changing password: {e}")
        raise HTTPException(status_code=500, detail="Failed to change password")

