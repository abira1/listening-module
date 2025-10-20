"""
JSON Upload Service
Handles file uploads and track creation from JSON
"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import Dict, Any, Optional
import json
import logging
from track_creation_service import TrackCreationService
from question_validator import TrackValidator
from firebase_service import FirebaseService

logger = logging.getLogger(__name__)
router = APIRouter()


class JSONUploadHandler:
    """Handles JSON file uploads and processing"""
    
    @staticmethod
    async def process_json_file(file: UploadFile) -> Dict[str, Any]:
        """
        Process uploaded JSON file
        
        Returns:
            {
                "success": bool,
                "track_id": str,
                "questions_created": int,
                "questions_by_type": dict,
                "errors": list
            }
        """
        try:
            # Read file content
            content = await file.read()
            
            # Parse JSON
            try:
                json_data = json.loads(content.decode('utf-8'))
            except json.JSONDecodeError as e:
                return {
                    "success": False,
                    "errors": [f"Invalid JSON format: {str(e)}"]
                }
            
            # Validate structure
            validation = TrackValidator.validate_complete_track(json_data)
            if not validation["is_valid"]:
                return {
                    "success": False,
                    "errors": validation["errors"]
                }
            
            # Create track
            result = TrackCreationService.create_track_from_json(json_data)
            
            if not result["success"]:
                return {
                    "success": False,
                    "errors": result["errors"]
                }
            
            # Save to Firebase
            try:
                track_id = result["track_id"]
                track_data = result["track"]

                # Save track to Firebase using create_track method
                FirebaseService.create_track(track_data)

                logger.info(f"Track {track_id} created and saved to Firebase")

                return {
                    "success": True,
                    "track_id": track_id,
                    "questions_created": result["questions_created"],
                    "questions_by_type": result["questions_by_type"],
                    "errors": []
                }

            except Exception as e:
                logger.error(f"Error saving to Firebase: {str(e)}")
                return {
                    "success": False,
                    "errors": [f"Error saving track to database: {str(e)}"]
                }
        
        except Exception as e:
            logger.error(f"Error processing JSON file: {str(e)}")
            return {
                "success": False,
                "errors": [f"Error processing file: {str(e)}"]
            }


# ============================================
# API ENDPOINTS
# ============================================

@router.post("/api/tracks/import-from-json")
async def import_track_from_json(file: UploadFile = File(...)):
    """
    Upload JSON file and create track
    
    Supports:
    - File upload (JSON)
    - Auto type detection (18 types)
    - Auto batching by type
    - Validation
    - Firebase storage
    
    Returns:
        {
            "success": bool,
            "track_id": str,
            "questions_created": int,
            "questions_by_type": dict,
            "errors": list
        }
    """
    # Validate file type
    if not file.filename.endswith('.json'):
        raise HTTPException(
            status_code=400,
            detail="File must be a JSON file (.json)"
        )
    
    # Process file
    result = await JSONUploadHandler.process_json_file(file)
    
    if not result["success"]:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Failed to create track",
                "errors": result["errors"]
            }
        )
    
    return result


@router.post("/api/tracks/validate-json")
async def validate_json_file(file: UploadFile = File(...)):
    """
    Validate JSON file without creating track
    
    Returns:
        {
            "is_valid": bool,
            "total_questions": int,
            "total_sections": int,
            "questions_by_type": dict,
            "errors": list,
            "warnings": list
        }
    """
    try:
        # Read file content
        content = await file.read()
        
        # Parse JSON
        try:
            json_data = json.loads(content.decode('utf-8'))
        except json.JSONDecodeError as e:
            return {
                "is_valid": False,
                "errors": [f"Invalid JSON format: {str(e)}"],
                "warnings": []
            }
        
        # Validate
        validation = TrackValidator.validate_complete_track(json_data)
        
        return {
            "is_valid": validation["is_valid"],
            "total_questions": validation["total_questions"],
            "total_sections": validation["total_sections"],
            "questions_by_type": validation["questions_by_type"],
            "errors": validation["errors"],
            "warnings": validation["warnings"]
        }
    
    except Exception as e:
        logger.error(f"Error validating JSON: {str(e)}")
        return {
            "is_valid": False,
            "errors": [f"Error validating file: {str(e)}"],
            "warnings": []
        }


def get_router():
    """Export router"""
    return router

