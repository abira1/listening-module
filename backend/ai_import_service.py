"""
AI Import Service
Handles validation and import of AI-generated JSON track data
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
import json
import logging
from track_creation_service import TrackCreationService
from question_validator import TrackValidator
from question_type_detector import QuestionTypeDetector

logger = logging.getLogger(__name__)
router = APIRouter()


# ============================================
# JSON FORMAT CONVERTER
# ============================================

class JSONFormatConverter:
    """Convert old JSON format to new format"""

    @staticmethod
    def convert_question(question: Dict[str, Any]) -> Dict[str, Any]:
        """Convert a single question from old format to new format"""
        converted = {}

        # Map id: use 'index' if 'id' doesn't exist
        converted["id"] = question.get("id") or f"q{question.get('index', 1)}"

        # Map type: convert old type names to new ones
        old_type = question.get("type", "").lower()
        type_mapping = {
            "short_answer": "fill_gaps_short",
            "multiple_choice": "mcq_single",
            "matching_draggable": "matching",
        }
        converted_type = type_mapping.get(old_type, old_type)

        # Just use the converted type - let validator handle it
        converted["type"] = converted_type

        # Map text: use 'prompt' if 'text' doesn't exist
        converted["text"] = question.get("text") or question.get("prompt", "")

        # Map correctAnswers: use 'answer_key' if 'correctAnswers' doesn't exist
        answer_key = question.get("answer_key") or question.get("correctAnswers")
        if answer_key:
            # Ensure it's a list
            if isinstance(answer_key, list):
                converted["correctAnswers"] = answer_key
            elif isinstance(answer_key, str) and answer_key.strip():
                converted["correctAnswers"] = [answer_key]
            else:
                # Empty answer key - will be filled during creation
                converted["correctAnswers"] = []
        else:
            # No answer key - will be filled during creation
            converted["correctAnswers"] = []

        # Copy options if present
        if "options" in question and question["options"]:
            converted["options"] = question["options"]

        # Copy payload if present (for matching questions)
        if "payload" in question:
            converted["payload"] = question["payload"]

        # Copy items if present
        if "items" in question:
            converted["items"] = question["items"]

        return converted

    @staticmethod
    def convert_section(section: Dict[str, Any]) -> Dict[str, Any]:
        """Convert a section from old format to new format"""
        converted = {}

        converted["index"] = section.get("index", 1)
        converted["title"] = section.get("title", f"Section {section.get('index', 1)}")
        converted["instructions"] = section.get("instructions", "")

        # Convert all questions in the section
        questions = section.get("questions", [])
        converted["questions"] = [JSONFormatConverter.convert_question(q) for q in questions]

        return converted

    @staticmethod
    def convert_track(track_data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert entire track from old format to new format"""
        converted = {}

        converted["test_type"] = track_data.get("test_type") or track_data.get("type", "listening")
        converted["title"] = track_data.get("title", "IELTS Test")
        converted["description"] = track_data.get("description", "")
        converted["duration_seconds"] = track_data.get("duration_seconds", 2700)

        if "audio_url" in track_data:
            converted["audio_url"] = track_data["audio_url"]

        # Convert all sections
        sections = track_data.get("sections", [])
        converted["sections"] = [JSONFormatConverter.convert_section(s) for s in sections]

        return converted


# ============================================
# CORS PREFLIGHT HANDLERS
# ============================================

@router.options("/validate-import")
async def options_validate_import():
    """Handle CORS preflight for validate endpoint"""
    return {}


@router.options("/import-from-ai")
async def options_import_from_ai():
    """Handle CORS preflight for import endpoint"""
    return {}


# ============================================
# VALIDATION ENDPOINT
# ============================================

@router.post("/validate-import")
async def validate_ai_import(json_data: Dict[str, Any]):
    """
    Validate AI-generated JSON data without creating track

    Args:
        json_data: The JSON data to validate (supports both old and new formats)

    Returns:
        {
            "valid": bool,
            "total_questions": int,
            "total_sections": int,
            "questions_by_type": dict,
            "errors": list,
            "warnings": list
        }
    """
    try:
        # Convert from old format to new format if needed
        converted_data = JSONFormatConverter.convert_track(json_data)

        # Validate the track structure
        validation = TrackValidator.validate_complete_track(converted_data)

        return {
            "valid": validation["is_valid"],
            "total_questions": validation["total_questions"],
            "total_sections": validation["total_sections"],
            "questions_by_type": validation["questions_by_type"],
            "errors": validation["errors"],
            "warnings": validation["warnings"]
        }

    except Exception as e:
        import traceback
        logger.error(f"Error validating AI import: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return {
            "valid": False,
            "total_questions": 0,
            "total_sections": 0,
            "questions_by_type": {},
            "errors": [f"Validation error: {str(e)}", f"Details: {traceback.format_exc()}"],
            "warnings": []
        }


# ============================================
# IMPORT ENDPOINT
# ============================================

@router.post("/import-from-ai")
async def import_track_from_ai(json_data: Dict[str, Any]):
    """
    Create a track from AI-generated JSON data

    Args:
        json_data: The JSON data containing track and questions (supports both old and new formats)

    Returns:
        {
            "success": bool,
            "track_id": str,
            "questions_created": int,
            "questions_by_type": dict,
            "message": str,
            "errors": list
        }
    """
    try:
        # Convert from old format to new format if needed
        converted_data = JSONFormatConverter.convert_track(json_data)

        # Validate first
        validation = TrackValidator.validate_complete_track(converted_data)

        if not validation["is_valid"]:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Validation failed",
                    "errors": validation["errors"]
                }
            )

        # Create track from JSON
        result = TrackCreationService.create_track_from_json(converted_data)

        if not result["success"]:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Failed to create track",
                    "errors": result["errors"]
                }
            )

        return {
            "success": True,
            "track_id": result["track_id"],
            "questions_created": result["questions_created"],
            "questions_by_type": result["questions_by_type"],
            "message": f"✅ Track created successfully with {result['questions_created']} questions",
            "errors": []
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error importing from AI: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Error creating track",
                "errors": [str(e)]
            }
        )


def get_router():
    """Export router"""
    return router

