"""
Track Management Service
CRUD operations for tracks - SQLite Only
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# ============================================
# PYDANTIC MODELS
# ============================================

class TrackUpdateRequest(BaseModel):
    """Update track fields"""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[Literal["draft", "published", "archived"]] = None
    tags: Optional[List[str]] = None


# ============================================
# API ENDPOINTS
# ============================================

def get_database():
    from server import db
    return db


@router.get("/api/tracks")
async def get_all_tracks(
    track_type: Optional[str] = Query(None, regex="^(listening|reading|writing)$"),
    status: Optional[str] = Query(None, regex="^(draft|published|archived)$"),
):
    """
    Get all tracks with optional filtering

    Query params:
    - track_type: Filter by listening/reading/writing
    - status: Filter by draft/published/archived
    """
    try:
        from database import db

        # Get tracks from SQLite
        # Database schema: id, title, type, description, total_questions, total_sections, status, created_by, created_at, updated_at, metadata
        query = "SELECT id, title, type, description, total_questions, total_sections, status, created_by, created_at, updated_at, metadata FROM tracks WHERE 1=1"
        params = []

        if track_type:
            query += " AND type = ?"
            params.append(track_type)

        if status:
            query += " AND status = ?"
            params.append(status)

        query += " ORDER BY created_at DESC"
        tracks = db.execute(query, params).fetchall()

        # Format response
        return [
            {
                "id": track[0],
                "track_type": track[2],  # Changed from "type" to "track_type" for frontend compatibility
                "title": track[1],
                "description": track[3] or "",
                "total_questions": track[4] or 0,
                "total_sections": track[5] or 0,
                "status": track[6] or "draft",
                "created_by": track[7],
                "created_at": track[8],
                "updated_at": track[9],
                "metadata": track[10] or "{}",
                "tags": [],
                "source": "ai_import"  # Default to ai_import for newly created tracks
            }
            for track in tracks
        ]

    except Exception as e:
        logger.error(f"Error fetching tracks: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/tracks/{track_id}")
async def get_track(track_id: str):
    """Get single track with full details"""
    try:
        from database import db

        # Get track from SQLite
        # Database schema: id, title, type, description, total_questions, total_sections, status, created_by, created_at, updated_at, metadata
        track = db.execute("SELECT id, title, type, description, total_questions, total_sections, status, created_by, created_at, updated_at, metadata FROM tracks WHERE id = ?", (track_id,)).fetchone()
        if not track:
            raise HTTPException(status_code=404, detail="Track not found")

        return {
            "id": track[0],
            "track_type": track[2],  # Changed from "type" to "track_type" for frontend compatibility
            "title": track[1],
            "description": track[3] or "",
            "total_questions": track[4] or 0,
            "total_sections": track[5] or 0,
            "status": track[6] or "draft",
            "created_by": track[7],
            "created_at": track[8],
            "updated_at": track[9],
            "metadata": track[10] or "{}",
            "tags": [],
            "source": "ai_import",  # Default to ai_import for newly created tracks
            "exam_details": None
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/api/tracks/{track_id}")
async def update_track(
    track_id: str,
    update_data: TrackUpdateRequest,
):
    """Update track metadata"""
    try:
        from database import db

        # Check if track exists
        track = db.execute("SELECT * FROM tracks WHERE id = ?", (track_id,)).fetchone()
        if not track:
            raise HTTPException(status_code=404, detail="Track not found")

        # Build update
        update_fields = []
        params = []

        if update_data.title:
            update_fields.append("title = ?")
            params.append(update_data.title)
        if update_data.description:
            update_fields.append("description = ?")
            params.append(update_data.description)
        if update_data.status:
            update_fields.append("status = ?")
            params.append(update_data.status)

        if update_fields:
            params.append(track_id)
            query = f"UPDATE tracks SET {', '.join(update_fields)} WHERE id = ?"
            db.execute(query, params)
            db.commit()

        return {"success": True, "message": "Track updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/api/tracks/{track_id}")
async def delete_track(track_id: str):
    """
    Delete track (soft delete - archive it)
    Does not delete underlying exam/sections/questions
    """
    try:
        from database import db

        # Check if track exists
        track = db.execute("SELECT * FROM tracks WHERE id = ?", (track_id,)).fetchone()
        if not track:
            raise HTTPException(status_code=404, detail="Track not found")

        # Archive the track (soft delete)
        db.execute("UPDATE tracks SET status = ? WHERE id = ?", ("archived", track_id))
        db.commit()

        return {"success": True, "message": "Track archived successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Export router
def get_router():
    return router