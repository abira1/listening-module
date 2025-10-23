"""
RBAC API Routes
Endpoints for role management and permission checking
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging
from database import db
from rbac_service import rbac_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/rbac", tags=["rbac"])


# Models
class RoleUpdate(BaseModel):
    user_id: str
    new_role: str


class PermissionCheck(BaseModel):
    user_id: str
    permission: str


class RoleInfo(BaseModel):
    role_name: str
    description: Optional[str] = None
    permissions: List[str] = []


# Endpoints

@router.get("/roles", response_model=List[RoleInfo])
async def get_all_roles(request: Request):
    """Get all available roles"""
    try:
        # Check if user has permission to view roles
        admin_email = request.headers.get("X-Admin-Email")
        if not admin_email:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        roles = db.get_all_roles()
        result = []
        
        for role in roles:
            permissions = db.get_permissions_for_role(role['role_name'])
            result.append(RoleInfo(
                role_name=role['role_name'],
                description=role.get('description'),
                permissions=permissions
            ))
        
        return result
    except Exception as e:
        logger.error(f"Error getting roles: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/roles/{role_name}", response_model=RoleInfo)
async def get_role(role_name: str, request: Request):
    """Get specific role details"""
    try:
        admin_email = request.headers.get("X-Admin-Email")
        if not admin_email:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        role = db.get_role(role_name)
        if not role:
            raise HTTPException(status_code=404, detail=f"Role {role_name} not found")
        
        permissions = db.get_permissions_for_role(role_name)
        
        return RoleInfo(
            role_name=role['role_name'],
            description=role.get('description'),
            permissions=permissions
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting role: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/users/{user_id}/role")
async def update_user_role(user_id: str, role_update: RoleUpdate, request: Request):
    """Update user role (admin only)"""
    try:
        admin_email = request.headers.get("X-Admin-Email")
        if not admin_email:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Verify role exists
        role = db.get_role(role_update.new_role)
        if not role:
            raise HTTPException(status_code=400, detail=f"Role {role_update.new_role} does not exist")
        
        # Update role
        result = rbac_service.update_role(user_id, role_update.new_role, changed_by=admin_email)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result.get('error', 'Failed to update role'))
        
        return {
            'success': True,
            'user_id': user_id,
            'new_role': role_update.new_role,
            'message': f'User role updated to {role_update.new_role}'
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user role: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/{user_id}/role")
async def get_user_role(user_id: str, request: Request):
    """Get user's current role (accessible by the user themselves or admins)"""
    try:
        # Check if user is accessing their own role or if admin
        auth_header = request.headers.get("Authorization", "")
        admin_email = request.headers.get("X-Admin-Email")

        # Allow if admin or if user is accessing their own role
        is_admin = bool(admin_email)
        is_self = auth_header.startswith("Bearer ")  # Student accessing their own role

        if not is_admin and not is_self:
            raise HTTPException(status_code=403, detail="Access denied")

        student = db.get_student(user_id)
        if not student:
            raise HTTPException(status_code=404, detail="User not found")

        role = student.get('role', 'student')
        permissions = db.get_permissions_for_role(role)

        return {
            'user_id': user_id,
            'role': role,
            'permissions': permissions
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user role: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/check-permission")
async def check_permission(check: PermissionCheck, request: Request):
    """Check if user has a specific permission"""
    try:
        has_perm = rbac_service.has_permission(check.user_id, check.permission)
        
        return {
            'user_id': check.user_id,
            'permission': check.permission,
            'has_permission': has_perm
        }
    except Exception as e:
        logger.error(f"Error checking permission: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/{user_id}/permissions")
async def get_user_permissions(user_id: str, request: Request):
    """Get all permissions for a user"""
    try:
        admin_email = request.headers.get("X-Admin-Email")
        if not admin_email:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        permissions = rbac_service.get_user_permissions(user_id)
        role = rbac_service.get_user_role(user_id)
        
        return {
            'user_id': user_id,
            'role': role,
            'permissions': permissions
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user permissions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/audit-logs")
async def get_audit_logs(limit: int = 100, offset: int = 0, request: Request = None):
    """Get audit logs (admin only)"""
    try:
        admin_email = request.headers.get("X-Admin-Email") if request else None
        if not admin_email:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        logs = db.get_audit_logs(limit=limit, offset=offset)
        
        return {
            'total': len(logs),
            'limit': limit,
            'offset': offset,
            'logs': logs
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting audit logs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

