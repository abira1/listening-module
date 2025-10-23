"""
Authentication service for Emergent Google OAuth integration
"""
import httpx
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict
from fastapi import Cookie, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)


class AuthService:
    """Handle authentication using Emergent OAuth"""
    
    EMERGENT_SESSION_API = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
    SESSION_EXPIRY_DAYS = 7
    
    @staticmethod
    async def exchange_session_id(session_id: str) -> Dict:
        """
        Exchange session_id for user data and session_token
        
        Args:
            session_id: Temporary session ID from URL fragment
            
        Returns:
            Dict with user data and session_token
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                AuthService.EMERGENT_SESSION_API,
                headers={"X-Session-ID": session_id}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=401,
                    detail="Invalid or expired session ID"
                )
            
            return response.json()
    
    @staticmethod
    async def create_session(db, user_id: str, session_token: str) -> Dict:
        """
        Create a new session in database

        Args:
            db: Database instance (SQLite)
            user_id: User/Student ID
            session_token: Session token

        Returns:
            Session document
        """
        expires_at = datetime.now(timezone.utc) + timedelta(days=AuthService.SESSION_EXPIRY_DAYS)

        session = {
            "user_id": user_id,
            "session_token": session_token,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": expires_at.isoformat()
        }

        # Create session in SQLite
        db.create_student_session(user_id, session_token, expires_at.isoformat())

        return session
    
    @staticmethod
    async def get_session(db, session_token: str) -> Optional[Dict]:
        """
        Retrieve session from database

        Args:
            db: Database instance (SQLite)
            session_token: Session token to look up

        Returns:
            Session document if valid, None otherwise
        """
        session = db.get_student_session(session_token)

        if not session:
            return None

        # Check if session has expired
        expires_at_str = session["expires_at"]
        if expires_at_str:
            try:
                expires_at = datetime.fromisoformat(expires_at_str)
                # Make comparison timezone-aware
                now = datetime.now(timezone.utc)
                # If expires_at is naive, make it aware
                if expires_at.tzinfo is None:
                    expires_at = expires_at.replace(tzinfo=timezone.utc)
                if expires_at < now:
                    # Delete expired session
                    db.delete_student_session(session_token)
                    return None
            except Exception as e:
                logger.error(f"Error checking session expiry: {e}")
                return None

        return session
    
    @staticmethod
    async def delete_session(db, session_token: str):
        """
        Delete session from database

        Args:
            db: Database instance (SQLite)
            session_token: Session token to delete
        """
        db.delete_student_session(session_token)
    
    @staticmethod
    async def get_current_user(request: Request, db, session_token: Optional[str] = Cookie(None)) -> Optional[Dict]:
        """
        Get current authenticated user from session_token cookie or Authorization header

        Args:
            request: FastAPI request object
            db: Database instance (SQLite)
            session_token: Session token from cookie

        Returns:
            User document if authenticated, None otherwise
        """
        # Try cookie first
        token = session_token

        # Fallback to Authorization header
        if not token:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.replace("Bearer ", "")

        if not token:
            return None

        # Get session
        session = await AuthService.get_session(db, token)
        if not session:
            return None

        # Get user from database using SQLite
        user = db.get_student(session["user_id"])
        return user
    
    @staticmethod
    def require_auth(user: Optional[Dict]) -> Dict:
        """
        Require user to be authenticated
        
        Args:
            user: User document or None
            
        Returns:
            User document
            
        Raises:
            HTTPException if not authenticated
        """
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required")
        return user
    
    @staticmethod
    def require_admin(user: Optional[Dict], admin_emails: list) -> Dict:
        """
        Require user to be an admin
        
        Args:
            user: User document or None
            admin_emails: List of authorized admin emails
            
        Returns:
            User document
            
        Raises:
            HTTPException if not authenticated or not admin
        """
        user = AuthService.require_auth(user)
        if user.get("email") not in admin_emails:
            raise HTTPException(status_code=403, detail="Admin access required")
        return user
