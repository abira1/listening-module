"""
Local authentication service for IELTS platform
Handles IP-based admin auth and credential-based student auth
"""

import secrets
import sqlite3
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
import logging
from database import db

logger = logging.getLogger(__name__)

# Session configuration
SESSION_EXPIRY_HOURS = 24
ADMIN_SESSION_EXPIRY_HOURS = 8


class LocalAuthService:
    """Handle local authentication without Firebase"""
    
    @staticmethod
    def validate_student_credentials(user_id: str, registration_number: str) -> Tuple[bool, Optional[Dict], str]:
        """
        Validate student credentials
        
        Args:
            user_id: Student User ID (e.g., STU-2025-001)
            registration_number: Student Registration Number (e.g., REG-2025-001)
        
        Returns:
            Tuple of (is_valid, student_data, message)
        """
        try:
            student = db.get_student(user_id)
            
            if not student:
                return False, None, "Invalid User ID"
            
            if student['registration_number'] != registration_number:
                return False, None, "Invalid Registration Number"
            
            if student['status'] != 'active':
                return False, None, f"Account is {student['status']}"
            
            return True, student, "Credentials valid"
        
        except Exception as e:
            logger.error(f"Error validating credentials: {e}")
            return False, None, "Authentication error"
    
    @staticmethod
    def create_student_session(user_id: str, ip_address: str = '', device_info: str = '') -> Dict[str, Any]:
        """
        Create student session
        
        Args:
            user_id: Student User ID
            ip_address: Client IP address
            device_info: Device information
        
        Returns:
            Session data with token
        """
        try:
            session_token = secrets.token_urlsafe(32)
            expires_at = (datetime.now() + timedelta(hours=SESSION_EXPIRY_HOURS)).isoformat()
            
            conn = db.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO student_sessions 
                (user_id, session_token, expires_at, ip_address, device_info)
                VALUES (?, ?, ?, ?, ?)
            ''', (user_id, session_token, expires_at, ip_address, device_info))
            
            # Update last login
            cursor.execute('''
                UPDATE students SET last_login = ? WHERE user_id = ?
            ''', (datetime.now().isoformat(), user_id))
            
            conn.commit()
            conn.close()
            
            return {
                'success': True,
                'session_token': session_token,
                'expires_at': expires_at,
                'user_id': user_id
            }
        
        except Exception as e:
            logger.error(f"Error creating session: {e}")
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def validate_session_token(session_token: str) -> Tuple[bool, Optional[Dict], str]:
        """
        Validate session token
        
        Args:
            session_token: Session token to validate
        
        Returns:
            Tuple of (is_valid, session_data, message)
        """
        try:
            conn = db.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM student_sessions WHERE session_token = ?
            ''', (session_token,))
            
            session = cursor.fetchone()
            conn.close()
            
            if not session:
                return False, None, "Invalid session token"
            
            session_dict = dict(session)
            
            # Check expiry
            expires_at = datetime.fromisoformat(session_dict['expires_at'])
            if datetime.now() > expires_at:
                return False, None, "Session expired"
            
            # Update last activity
            conn = db.get_connection()
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE student_sessions 
                SET last_activity = ? 
                WHERE session_token = ?
            ''', (datetime.now().isoformat(), session_token))
            conn.commit()
            conn.close()
            
            return True, session_dict, "Session valid"
        
        except Exception as e:
            logger.error(f"Error validating session: {e}")
            return False, None, "Session validation error"
    
    @staticmethod
    def end_session(session_token: str) -> bool:
        """End student session"""
        try:
            conn = db.get_connection()
            cursor = conn.cursor()
            cursor.execute('DELETE FROM student_sessions WHERE session_token = ?', (session_token,))
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            logger.error(f"Error ending session: {e}")
            return False
    
    @staticmethod
    def validate_admin_ip(client_ip: str, admin_ip: str) -> bool:
        """
        Validate if client IP matches admin IP
        For local desktop app, allow localhost (127.0.0.1)

        Args:
            client_ip: Client IP address
            admin_ip: Configured admin IP

        Returns:
            True if IPs match or if localhost
        """
        # Allow localhost for local desktop app
        if client_ip in ['127.0.0.1', 'localhost', '::1']:
            return True
        # Also allow configured admin IP
        return client_ip == admin_ip
    
    @staticmethod
    def regenerate_student_credentials(user_id: str, reason: str = '', changed_by: str = 'admin') -> Dict[str, Any]:
        """
        Regenerate student credentials (Registration Number)
        
        Args:
            user_id: Student User ID
            reason: Reason for regeneration
            changed_by: Who made the change
        
        Returns:
            New credentials
        """
        try:
            student = db.get_student(user_id)
            if not student:
                return {'success': False, 'error': 'Student not found'}
            
            old_reg = student['registration_number']
            new_reg = db.get_next_registration_number()
            
            conn = db.get_connection()
            cursor = conn.cursor()
            
            # Update student registration number
            cursor.execute('''
                UPDATE students SET registration_number = ? WHERE user_id = ?
            ''', (new_reg, user_id))
            
            # Log in credentials history
            cursor.execute('''
                INSERT INTO student_credentials_history 
                (user_id, old_registration_number, new_registration_number, reason, changed_by)
                VALUES (?, ?, ?, ?, ?)
            ''', (user_id, old_reg, new_reg, reason, changed_by))
            
            conn.commit()
            conn.close()
            
            return {
                'success': True,
                'user_id': user_id,
                'old_registration_number': old_reg,
                'new_registration_number': new_reg
            }
        
        except Exception as e:
            logger.error(f"Error regenerating credentials: {e}")
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def update_student_status(user_id: str, status: str, admin_ip: str = '') -> Dict[str, Any]:
        """
        Update student status (active, inactive, suspended)
        
        Args:
            user_id: Student User ID
            status: New status
            admin_ip: Admin IP for logging
        
        Returns:
            Update result
        """
        try:
            if status not in ['active', 'inactive', 'suspended']:
                return {'success': False, 'error': 'Invalid status'}
            
            conn = db.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE students SET status = ?, updated_at = ? WHERE user_id = ?
            ''', (status, datetime.now().isoformat(), user_id))
            
            conn.commit()
            conn.close()
            
            # Log action
            db.log_admin_action(admin_ip, f'update_student_status', f'{user_id} -> {status}')
            
            return {'success': True, 'user_id': user_id, 'status': status}
        
        except Exception as e:
            logger.error(f"Error updating student status: {e}")
            return {'success': False, 'error': str(e)}


# Global auth service instance
auth_service = LocalAuthService()

