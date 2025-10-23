"""
Role-Based Access Control (RBAC) Service
Handles role management, permission checking, and access control
"""

import logging
from typing import Optional, List, Dict, Any
from database import db

logger = logging.getLogger(__name__)


class RBACService:
    """Handle role-based access control"""
    
    @staticmethod
    def has_permission(user_id: str, permission: str) -> bool:
        """
        Check if user has a specific permission
        
        Args:
            user_id: Student user ID
            permission: Permission name to check
        
        Returns:
            True if user has permission, False otherwise
        """
        try:
            student = db.get_student(user_id)
            if not student:
                return False
            
            user_role = student.get('role', 'student')
            permissions = db.get_permissions_for_role(user_role)
            
            return permission in permissions
        except Exception as e:
            logger.error(f"Error checking permission: {e}")
            return False
    
    @staticmethod
    def has_any_permission(user_id: str, permissions: List[str]) -> bool:
        """
        Check if user has any of the specified permissions
        
        Args:
            user_id: Student user ID
            permissions: List of permission names
        
        Returns:
            True if user has any permission, False otherwise
        """
        for permission in permissions:
            if RBACService.has_permission(user_id, permission):
                return True
        return False
    
    @staticmethod
    def has_all_permissions(user_id: str, permissions: List[str]) -> bool:
        """
        Check if user has all specified permissions
        
        Args:
            user_id: Student user ID
            permissions: List of permission names
        
        Returns:
            True if user has all permissions, False otherwise
        """
        for permission in permissions:
            if not RBACService.has_permission(user_id, permission):
                return False
        return True
    
    @staticmethod
    def get_user_role(user_id: str) -> Optional[str]:
        """Get user's role"""
        try:
            student = db.get_student(user_id)
            if student:
                return student.get('role', 'student')
            return None
        except Exception as e:
            logger.error(f"Error getting user role: {e}")
            return None
    
    @staticmethod
    def get_user_permissions(user_id: str) -> List[str]:
        """Get all permissions for a user"""
        try:
            student = db.get_student(user_id)
            if not student:
                return []
            
            user_role = student.get('role', 'student')
            return db.get_permissions_for_role(user_role)
        except Exception as e:
            logger.error(f"Error getting user permissions: {e}")
            return []
    
    @staticmethod
    def is_admin(user_id: str) -> bool:
        """Check if user is admin"""
        return RBACService.get_user_role(user_id) == 'admin'
    
    @staticmethod
    def is_teacher(user_id: str) -> bool:
        """Check if user is teacher"""
        return RBACService.get_user_role(user_id) == 'teacher'
    
    @staticmethod
    def is_student(user_id: str) -> bool:
        """Check if user is student"""
        return RBACService.get_user_role(user_id) == 'student'
    
    @staticmethod
    def can_grade_submissions(user_id: str) -> bool:
        """Check if user can grade submissions"""
        return RBACService.has_permission(user_id, 'grade_submissions')
    
    @staticmethod
    def can_publish_results(user_id: str) -> bool:
        """Check if user can publish results"""
        return RBACService.has_permission(user_id, 'publish_results')
    
    @staticmethod
    def can_manage_users(user_id: str) -> bool:
        """Check if user can manage users"""
        return RBACService.has_permission(user_id, 'manage_users')
    
    @staticmethod
    def can_view_analytics(user_id: str) -> bool:
        """Check if user can view analytics"""
        return RBACService.has_permission(user_id, 'view_analytics')
    
    @staticmethod
    def can_create_questions(user_id: str) -> bool:
        """Check if user can create questions"""
        return RBACService.has_permission(user_id, 'create_questions')
    
    @staticmethod
    def can_take_exams(user_id: str) -> bool:
        """Check if user can take exams"""
        return RBACService.has_permission(user_id, 'take_exams')
    
    @staticmethod
    def update_role(user_id: str, new_role: str, changed_by: str = 'admin') -> Dict[str, Any]:
        """
        Update user role
        
        Args:
            user_id: Student user ID
            new_role: New role name
            changed_by: Who made the change
        
        Returns:
            Result dictionary
        """
        result = db.update_student_role(user_id, new_role)
        
        if result['success']:
            # Log the action
            db.log_action(
                user_id=changed_by,
                user_role='admin',
                action='update_role',
                resource_type='user',
                resource_id=user_id,
                details=f'Changed role to {new_role}'
            )
        
        return result
    
    @staticmethod
    def log_access_attempt(user_id: str, action: str, resource_type: str = None, 
                          resource_id: str = None, success: bool = True, 
                          ip_address: str = None) -> Dict[str, Any]:
        """
        Log an access attempt for audit trail
        
        Args:
            user_id: User who attempted the action
            action: Action name
            resource_type: Type of resource accessed
            resource_id: ID of resource accessed
            success: Whether the action was successful
            ip_address: IP address of the request
        
        Returns:
            Result dictionary
        """
        user_role = RBACService.get_user_role(user_id)
        details = f"Success: {success}"
        
        return db.log_action(
            user_id=user_id,
            user_role=user_role or 'unknown',
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=ip_address
        )


# Create singleton instance
rbac_service = RBACService()

