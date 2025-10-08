"""
Authentication service for Emergent Google OAuth integration
"""
import httpx
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict
from fastapi import Cookie, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorDatabase


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
    async def create_session(db: AsyncIOMotorDatabase, user_id: str, session_token: str) -> Dict:
        """
        Create a new session in database
        
        Args:
            db: MongoDB database instance
            user_id: User/Student ID
            session_token: Session token from Emergent
            
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
        
        # Upsert session (update if exists, insert if not)
        await db.sessions.update_one(
            {"user_id": user_id},
            {"$set": session},
            upsert=True
        )
        
        return session
    
    @staticmethod
    async def get_session(db: AsyncIOMotorDatabase, session_token: str) -> Optional[Dict]:
        """
        Retrieve session from database
        
        Args:
            db: MongoDB database instance
            session_token: Session token to look up
            
        Returns:
            Session document if valid, None otherwise
        """
        session = await db.sessions.find_one({"session_token": session_token})
        
        if not session:
            return None
        
        # Check if session has expired
        expires_at = datetime.fromisoformat(session["expires_at"])
        if expires_at < datetime.now(timezone.utc):
            # Delete expired session
            await db.sessions.delete_one({"session_token": session_token})
            return None
        
        return session
    
    @staticmethod
    async def delete_session(db: AsyncIOMotorDatabase, session_token: str):
        """
        Delete session from database
        
        Args:
            db: MongoDB database instance
            session_token: Session token to delete
        """
        await db.sessions.delete_one({"session_token": session_token})
    
    @staticmethod
    async def get_current_user(request: Request, db: AsyncIOMotorDatabase, session_token: Optional[str] = Cookie(None)) -> Optional[Dict]:
        """
        Get current authenticated user from session_token cookie or Authorization header
        
        Args:
            request: FastAPI request object
            db: MongoDB database instance
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
        
        # Get user from database
        user = await db.students.find_one({"id": session["user_id"]})
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
