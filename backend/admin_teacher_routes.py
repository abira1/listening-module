"""
Admin teacher management API routes
Handles CRUD operations for teacher accounts
"""

from fastapi import APIRouter, Request, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import Optional, List
import logging
import os
from datetime import datetime
from database import db
from teacher_auth_service import teacher_auth_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["admin-teacher-management"])

# Configuration
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads', 'teacher_photos')
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Admin emails for verification
ADMIN_EMAILS = [
    "shahsultanweb@gmail.com",
    "aminulislam004474@gmail.com",
    "admin"
]


def get_client_ip(request: Request) -> str:
    """Extract client IP from request"""
    if request.client:
        return request.client.host
    return "unknown"


def verify_admin(request: Request) -> bool:
    """Verify if request is from admin"""
    admin_email = request.headers.get('X-Admin-Email', '')
    return admin_email in ADMIN_EMAILS


@router.options("/teachers")
async def options_teachers():
    """Handle CORS preflight requests for /teachers endpoint"""
    return {"message": "OK"}


@router.get("/teachers")
async def get_teachers(request: Request, limit: int = 100, offset: int = 0):
    """
    Get all teachers
    
    Args:
        limit: Number of teachers to return
        offset: Offset for pagination
    
    Returns:
        List of teachers
    """
    try:
        if not verify_admin(request):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        teachers = db.get_all_teachers(limit=limit, offset=offset)
        
        # Remove password hashes from response
        for teacher in teachers:
            teacher.pop('password_hash', None)
        
        return {'success': True, 'teachers': teachers}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting teachers: {e}")
        raise HTTPException(status_code=500, detail="Failed to get teachers")


@router.post("/teachers")
async def create_teacher(
    request: Request,
    full_name: str = Form(...),
    email: str = Form(...),
    phone_number: str = Form(default=''),
    subject: str = Form(default=''),
    bio: str = Form(default=''),
    photo: Optional[UploadFile] = File(None)
):
    """
    Create a new teacher
    
    Args:
        full_name: Teacher's full name
        email: Teacher's email
        phone_number: Teacher's phone number
        subject: Teacher's subject/department
        bio: Teacher's bio
        photo: Teacher's profile photo
    
    Returns:
        Generated credentials (teacher_id and password)
    """
    try:
        if not verify_admin(request):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Generate teacher ID and password
        teacher_id = teacher_auth_service.generate_teacher_id()
        initial_password = teacher_auth_service.generate_password()
        password_hash = teacher_auth_service.hash_password(initial_password)
        
        # Handle photo upload
        photo_path = ''
        if photo:
            filename = f"{datetime.now().timestamp()}_{photo.filename}"
            filepath = os.path.join(UPLOAD_DIR, filename)
            
            with open(filepath, 'wb') as f:
                content = await photo.read()
                f.write(content)
            
            photo_path = f"/uploads/teacher_photos/{filename}"
        
        # Add teacher to database
        result = db.add_teacher(
            teacher_id=teacher_id,
            full_name=full_name,
            email=email,
            phone_number=phone_number,
            subject=subject,
            photo_path=photo_path,
            bio=bio,
            password_hash=password_hash,
            created_by=request.headers.get('X-Admin-Email', 'admin')
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result.get('error', 'Failed to create teacher'))
        
        logger.info(f"Teacher created: {teacher_id}")
        
        # Return credentials to admin
        return {
            'success': True,
            'message': 'Teacher created successfully',
            'credentials': {
                'teacher_id': teacher_id,
                'initial_password': initial_password,
                'email': email,
                'full_name': full_name
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating teacher: {e}")
        raise HTTPException(status_code=500, detail="Failed to create teacher")


@router.options("/teachers/{teacher_id}")
async def options_teacher_id():
    """Handle CORS preflight requests for /teachers/{teacher_id} endpoint"""
    return {"message": "OK"}


@router.put("/teachers/{teacher_id}")
async def update_teacher(
    request: Request,
    teacher_id: str,
    full_name: Optional[str] = Form(None),
    phone_number: Optional[str] = Form(None),
    subject: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None)
):
    """
    Update teacher information
    
    Args:
        teacher_id: Teacher ID to update
        full_name: Updated full name
        phone_number: Updated phone number
        subject: Updated subject
        bio: Updated bio
        status: Updated status (active/inactive)
        photo: Updated profile photo
    
    Returns:
        Success message
    """
    try:
        if not verify_admin(request):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Prepare update data
        update_data = {}
        if full_name:
            update_data['full_name'] = full_name
        if phone_number:
            update_data['phone_number'] = phone_number
        if subject:
            update_data['subject'] = subject
        if bio:
            update_data['bio'] = bio
        if status:
            update_data['status'] = status
        
        # Handle photo upload
        if photo:
            filename = f"{datetime.now().timestamp()}_{photo.filename}"
            filepath = os.path.join(UPLOAD_DIR, filename)
            
            with open(filepath, 'wb') as f:
                content = await photo.read()
                f.write(content)
            
            update_data['photo_path'] = f"/uploads/teacher_photos/{filename}"
        
        # Update teacher
        result = db.update_teacher(teacher_id, **update_data)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result.get('error', 'Failed to update teacher'))
        
        logger.info(f"Teacher updated: {teacher_id}")
        
        return {'success': True, 'message': 'Teacher updated successfully'}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating teacher: {e}")
        raise HTTPException(status_code=500, detail="Failed to update teacher")


@router.delete("/teachers/{teacher_id}")
async def delete_teacher(request: Request, teacher_id: str):
    """
    Delete (soft delete) a teacher
    
    Args:
        teacher_id: Teacher ID to delete
    
    Returns:
        Success message
    """
    try:
        if not verify_admin(request):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        result = db.delete_teacher(teacher_id)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result.get('error', 'Failed to delete teacher'))
        
        logger.info(f"Teacher deleted: {teacher_id}")
        
        return {'success': True, 'message': 'Teacher deleted successfully'}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting teacher: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete teacher")


@router.options("/teachers/{teacher_id}/reset-password")
async def options_reset_password():
    """Handle CORS preflight requests for /teachers/{teacher_id}/reset-password endpoint"""
    return {"message": "OK"}


@router.post("/teachers/{teacher_id}/reset-password")
async def reset_teacher_password(request: Request, teacher_id: str):
    """
    Reset teacher password and generate new one
    
    Args:
        teacher_id: Teacher ID
    
    Returns:
        New password
    """
    try:
        if not verify_admin(request):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Generate new password
        new_password = teacher_auth_service.generate_password()
        password_hash = teacher_auth_service.hash_password(new_password)
        
        # Update password
        result = db.update_teacher_password(teacher_id, password_hash)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result.get('error', 'Failed to reset password'))
        
        logger.info(f"Password reset for teacher: {teacher_id}")
        
        return {
            'success': True,
            'message': 'Password reset successfully',
            'new_password': new_password
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resetting password: {e}")
        raise HTTPException(status_code=500, detail="Failed to reset password")

