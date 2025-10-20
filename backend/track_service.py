"""
Track Management Service
CRUD operations for tracks
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase

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
        from firebase_service import FirebaseService

        # Get tracks from Firebase
        tracks = FirebaseService.get_all_tracks(track_type=track_type, status=status)

        # Format response
        return [
            {
                "id": track["id"],
                "track_type": track["track_type"],
                "title": track["title"],
                "description": track["description"],
                "exam_id": track.get("exam_id"),
                "status": track["status"],
                "created_at": track["created_at"],
                "created_by": track.get("created_by"),
                "metadata": track.get("metadata", {}),
                "tags": track.get("tags", []),
                "source": track.get("source", "manual")
            }
            for track in tracks
        ]

    except Exception as e:
        print(f"Error fetching tracks: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/tracks/{track_id}")
async def get_track(track_id: str):
    """Get single track with full details"""
    try:
        from firebase_service import FirebaseService

        track = FirebaseService.get_track(track_id)
        if not track:
            raise HTTPException(status_code=404, detail="Track not found")

        # Get associated exam details
        exam = FirebaseService.get_exam(track.get("exam_id")) if track.get("exam_id") else None

        return {
            "id": track["id"],
            "track_type": track["track_type"],
            "title": track["title"],
            "description": track["description"],
            "exam_id": track.get("exam_id"),
            "status": track["status"],
            "created_at": track["created_at"],
            "updated_at": track.get("updated_at"),
            "created_by": track.get("created_by"),
            "metadata": track.get("metadata", {}),
            "tags": track.get("tags", []),
            "source": track.get("source", "manual"),
            "exam_details": {
                "published": exam.get("published") if exam else False,
                "is_active": exam.get("is_active") if exam else False,
                "submission_count": exam.get("submission_count") if exam else 0
            } if exam else None
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
        from firebase_service import FirebaseService

        track = FirebaseService.get_track(track_id)
        if not track:
            raise HTTPException(status_code=404, detail="Track not found")

        # Build update
        update_fields = {}

        if update_data.title:
            update_fields["title"] = update_data.title
        if update_data.description:
            update_fields["description"] = update_data.description
        if update_data.status:
            update_fields["status"] = update_data.status
        if update_data.tags is not None:
            update_fields["tags"] = update_data.tags

        # Update track
        updated_track = FirebaseService.update_track(track_id, update_fields)

        # Also update exam title/description if changed
        if update_data.title or update_data.description:
            exam_update = {}
            if update_data.title:
                exam_update["title"] = update_data.title
            if update_data.description:
                exam_update["description"] = update_data.description

            if track.get("exam_id"):
                FirebaseService.update_exam(track["exam_id"], exam_update)
        
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
        from firebase_service import FirebaseService

        track = FirebaseService.get_track(track_id)
        if not track:
            raise HTTPException(status_code=404, detail="Track not found")

        # For now, just archive the track (soft delete)
        # In a full implementation, we'd check mock_tests collection
        FirebaseService.update_track(track_id, {"status": "archived"})

        return {"success": True, "message": "Track archived successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Export router
def get_router():
    return router