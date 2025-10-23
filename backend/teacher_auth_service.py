"""
Teacher authentication service for IELTS platform
Handles teacher login, session management, and credential generation
"""

import secrets
import string
import sqlite3
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
import logging
from database import db

logger = logging.getLogger(__name__)

# Session configuration
TEACHER_SESSION_EXPIRY_HOURS = 24


class TeacherAuthService:
    """Handle teacher authentication"""
    
    @staticmethod
    def generate_teacher_id() -> str:
        """Generate unique teacher ID in format TCH-XXXXXX"""
        random_part = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
        return f"TCH-{random_part}"
    
    @staticmethod
    def generate_password(length: int = 8) -> str:
        """Generate random password"""
        characters = string.ascii_letters + string.digits + string.punctuation
        return ''.join(secrets.choice(characters) for _ in range(length))
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt(rounds=12)
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        try:
            return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
        except Exception as e:
            logger.error(f"Error verifying password: {e}")
            return False
    
    @staticmethod
    def validate_teacher_credentials(teacher_id: str, password: str) -> Tuple[bool, Optional[Dict], str]:
        """
        Validate teacher credentials
        
        Args:
            teacher_id: Teacher ID (e.g., TCH-ABC123)
            password: Teacher password
        
        Returns:
            Tuple of (is_valid, teacher_data, message)
        """
        try:
            teacher = db.get_teacher(teacher_id)
            
            if not teacher:
                return False, None, "Invalid Teacher ID"
            
            if teacher['status'] != 'active':
                return False, None, f"Account is {teacher['status']}"
            
            if not TeacherAuthService.verify_password(password, teacher['password_hash']):
                return False, None, "Invalid password"
            
            return True, teacher, "Credentials valid"
        
        except Exception as e:
            logger.error(f"Error validating credentials: {e}")
            return False, None, "Authentication error"
    
    @staticmethod
    def create_teacher_session(teacher_id: str, ip_address: str = '', device_info: str = '') -> Dict[str, Any]:
        """
        Create teacher session
        
        Args:
            teacher_id: Teacher ID
            ip_address: Client IP address
            device_info: Device information
        
        Returns:
            Session data with token
        """
        try:
            session_token = secrets.token_urlsafe(32)
            expires_at = (datetime.now() + timedelta(hours=TEACHER_SESSION_EXPIRY_HOURS)).isoformat()
            
            conn = db.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO teacher_sessions 
                (teacher_id, session_token, expires_at, ip_address, device_info)
                VALUES (?, ?, ?, ?, ?)
            ''', (teacher_id, session_token, expires_at, ip_address, device_info))
            
            # Update last login
            cursor.execute('''
                UPDATE teachers SET last_login = ? WHERE teacher_id = ?
            ''', (datetime.now().isoformat(), teacher_id))
            
            conn.commit()
            conn.close()
            
            return {
                'success': True,
                'session_token': session_token,
                'expires_at': expires_at,
                'teacher_id': teacher_id
            }
        
        except Exception as e:
            logger.error(f"Error creating session: {e}")
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def validate_session_token(session_token: str) -> Tuple[bool, Optional[Dict], str]:
        """
        Validate teacher session token
        
        Args:
            session_token: Session token to validate
        
        Returns:
            Tuple of (is_valid, teacher_data, message)
        """
        try:
            conn = db.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT ts.*, t.* FROM teacher_sessions ts
                JOIN teachers t ON ts.teacher_id = t.teacher_id
                WHERE ts.session_token = ?
            ''', (session_token,))
            
            row = cursor.fetchone()
            conn.close()
            
            if not row:
                return False, None, "Invalid session token"
            
            session_data = dict(row)
            
            # Check if session has expired
            expires_at = datetime.fromisoformat(session_data['expires_at'])
            if datetime.now() > expires_at:
                return False, None, "Session expired"
            
            # Update last activity
            conn = db.get_connection()
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE teacher_sessions SET last_activity = ? WHERE session_token = ?
            ''', (datetime.now().isoformat(), session_token))
            conn.commit()
            conn.close()
            
            return True, session_data, "Session valid"
        
        except Exception as e:
            logger.error(f"Error validating session: {e}")
            return False, None, "Session validation error"
    
    @staticmethod
    def logout_teacher(session_token: str) -> Dict[str, Any]:
        """
        Logout teacher by invalidating session
        
        Args:
            session_token: Session token to invalidate
        
        Returns:
            Success/failure result
        """
        try:
            conn = db.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM teacher_sessions WHERE session_token = ?', (session_token,))
            conn.commit()
            conn.close()
            
            return {'success': True, 'message': 'Logged out successfully'}
        
        except Exception as e:
            logger.error(f"Error logging out: {e}")
            return {'success': False, 'error': str(e)}


# Create singleton instance
teacher_auth_service = TeacherAuthService()

