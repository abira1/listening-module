"""
Auto Import Handler for IELTS Tests
Automatically detects question types and creates tests from JSON uploads
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from typing import Dict, List, Any, Optional
import json
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase

from question_type_schemas import (
    QUESTION_TYPE_SCHEMAS,
    detect_question_type,
    validate_question_structure,
    is_auto_gradable,
    get_grading_method
)

router = APIRouter()


def generate_id():
    """Generate unique ID"""
    return str(uuid.uuid4())


def get_timestamp():
    """Get current timestamp in ISO format"""
    return datetime.now(timezone.utc).isoformat()


class AutoImportHandler:
    """
    Handles automatic import of IELTS tests from JSON files
    - Auto-detects question types
    - Validates structures
    - Creates exam, sections, and questions
    """
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
    
    async def import_from_json(self, json_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main import function - processes JSON and creates test
        
        Args:
            json_data: Complete test JSON structure
            
        Returns:
            Dictionary with import results and created IDs
        """
        results = {
            "success": False,
            "exam_id": None,
            "sections_created": 0,
            "questions_created": 0,
            "questions_detected": {},
            "errors": [],
            "warnings": []
        }
        
        try:
            # Validate basic structure
            if not self._validate_basic_structure(json_data):
                results["errors"].append("Invalid JSON structure. Must contain: title, test_type, sections")
                return results
            
            # Create exam
            exam_id = await self._create_exam(json_data)
            results["exam_id"] = exam_id
            
            # Process sections
            sections = json_data.get("sections", [])
            
            for section_data in sections:
                try:
                    section_id = await self._create_section(exam_id, section_data)
                    results["sections_created"] += 1
                    
                    # Process questions in this section
                    questions = section_data.get("questions", [])
                    
                    for question_data in questions:
                        try:
                            question_result = await self._create_question_auto_detect(
                                exam_id, 
                                section_id, 
                                question_data
                            )
                            
                            if question_result["success"]:
                                results["questions_created"] += 1
                                q_type = question_result["detected_type"]
                                results["questions_detected"][q_type] = \
                                    results["questions_detected"].get(q_type, 0) + 1
                            else:
                                results["warnings"].append(
                                    f"Question {question_data.get('index', '?')}: {question_result['error']}"
                                )
                        
                        except Exception as e:
                            results["warnings"].append(
                                f"Error creating question {question_data.get('index', '?')}: {str(e)}"
                            )
                
                except Exception as e:
                    results["errors"].append(f"Error creating section: {str(e)}")
            
            results["success"] = results["questions_created"] > 0
            
            return results
        
        except Exception as e:
            results["errors"].append(f"Import failed: {str(e)}")
            return results
    
    def _validate_basic_structure(self, json_data: Dict[str, Any]) -> bool:
        """Validate basic JSON structure"""
        required_fields = ["title", "test_type", "sections"]
        return all(field in json_data for field in required_fields)
    
    async def _create_exam(self, json_data: Dict[str, Any]) -> str:
        """Create exam from JSON data"""
        exam_id = json_data.get("id") or generate_id()
        now = get_timestamp()
        
        exam_data = {
            "id": exam_id,
            "_id": exam_id,
            "title": json_data.get("title"),
            "description": json_data.get("description", ""),
            "exam_type": json_data.get("test_type", "listening"),
            "audio_url": json_data.get("audio_url"),
            "audio_source_method": json_data.get("audio_source_method"),
            "loop_audio": json_data.get("loop_audio", False),
            "duration_seconds": json_data.get("duration_seconds", 2400),
            "published": json_data.get("published", True),
            "created_at": now,
            "updated_at": now,
            "is_demo": False,
            "question_count": 0,  # Will be updated
            "submission_count": 0,
            "is_active": False,
            "started_at": None,
            "stopped_at": None,
            "is_visible": True,
        }
        
        await self.db.exams.insert_one(exam_data)
        return exam_id
    
    async def _create_section(self, exam_id: str, section_data: Dict[str, Any]) -> str:
        """Create section from JSON data"""
        section_id = section_data.get("id") or f"{exam_id}-section-{section_data.get('index', 1)}"
        
        section = {
            "id": section_id,
            "_id": section_id,
            "exam_id": exam_id,
            "index": section_data.get("index", 1),
            "title": section_data.get("title", f"Section {section_data.get('index', 1)}"),
            "passage_text": section_data.get("passage_text"),  # For reading
            "instructions": section_data.get("instructions"),
        }
        
        await self.db.sections.insert_one(section)
        return section_id
    
    async def _create_question_auto_detect(
        self, 
        exam_id: str, 
        section_id: str, 
        question_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create question with automatic type detection
        
        Returns dict with success status and detected type
        """
        result = {
            "success": False,
            "detected_type": None,
            "question_id": None,
            "error": None
        }
        
        try:
            # Auto-detect question type
            detected_type = detect_question_type(question_data)
            
            if not detected_type:
                result["error"] = "Unable to auto-detect question type from structure"
                return result
            
            result["detected_type"] = detected_type
            
            # Validate structure
            is_valid, errors = validate_question_structure(question_data, detected_type)
            
            if not is_valid:
                result["error"] = f"Validation failed: {', '.join(errors)}"
                return result
            
            # Create question
            question_id = await self._create_question(
                exam_id, 
                section_id, 
                detected_type, 
                question_data
            )
            
            result["success"] = True
            result["question_id"] = question_id
            
            return result
        
        except Exception as e:
            result["error"] = str(e)
            return result
    
    async def _create_question(
        self, 
        exam_id: str, 
        section_id: str, 
        question_type: str, 
        question_data: Dict[str, Any]
    ) -> str:
        """Create question in database"""
        question_id = question_data.get("id") or f"{exam_id}-q{question_data.get('index', 1)}"
        
        # Build payload based on question type
        payload = self._build_payload(question_type, question_data)
        
        question = {
            "id": question_id,
            "_id": question_id,
            "exam_id": exam_id,
            "section_id": section_id,
            "index": question_data.get("index", 1),
            "type": question_type,
            "payload": payload,
            "marks": question_data.get("marks", 1),
            "created_by": "auto_import",
            "is_demo": False,
        }
        
        await self.db.questions.insert_one(question)
        
        # Update exam question count
        await self.db.exams.update_one(
            {"id": exam_id},
            {"$inc": {"question_count": 1}}
        )
        
        return question_id
    
    def _build_payload(self, question_type: str, question_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Build payload structure based on question type
        
        Different question types need different payload structures
        """
        payload = {}
        
        # Common fields
        if "prompt" in question_data:
            payload["prompt"] = question_data["prompt"]
        if "answer_key" in question_data:
            payload["answer_key"] = question_data["answer_key"]
        if "max_words" in question_data:
            payload["max_words"] = question_data["max_words"]
        if "min_words" in question_data:
            payload["min_words"] = question_data["min_words"]
        
        # Type-specific fields
        if "multiple_choice" in question_type:
            payload["options"] = question_data.get("options", [])
            if "select_count" in question_data:
                payload["select_count"] = question_data["select_count"]
        
        if "map_labeling" in question_type or "diagram_labeling" in question_type:
            payload["image_url"] = question_data.get("image_url", "")
            if "options" in question_data:
                payload["options"] = question_data["options"]
        
        if "matching" in question_type:
            payload["instructions"] = question_data.get("instructions", "")
            payload["left_items"] = question_data.get("left_items", [])
            payload["right_items"] = question_data.get("right_items", [])
        
        if "form_completion" in question_type:
            payload["form_title"] = question_data.get("form_title", "")
            payload["fields"] = question_data.get("fields", [])
        
        if "note_completion" in question_type:
            payload["title"] = question_data.get("title", "")
            payload["notes"] = question_data.get("notes", [])
        
        if "table_completion" in question_type:
            payload["table_title"] = question_data.get("table_title", "")
            payload["headers"] = question_data.get("headers", [])
            payload["rows"] = question_data.get("rows", [])
        
        if "flowchart" in question_type:
            payload["title"] = question_data.get("title", "")
            payload["steps"] = question_data.get("steps", [])
        
        if "summary_completion" in question_type:
            payload["summary"] = question_data.get("summary", "")
            payload["blanks"] = question_data.get("blanks", [])
            if "word_list" in question_data:
                payload["word_list"] = question_data["word_list"]
        
        if "sentence_ending" in question_type:
            payload["sentence_beginning"] = question_data.get("sentence_beginning", "")
            payload["endings"] = question_data.get("endings", [])
        
        if "matching_headings" in question_type:
            payload["paragraph_ref"] = question_data.get("paragraph_ref", "")
            payload["headings"] = question_data.get("headings", [])
        
        if "matching_features" in question_type:
            payload["statements"] = question_data.get("statements", [])
            payload["features"] = question_data.get("features", [])
        
        if "writing_task" in question_type:
            payload["instructions"] = question_data.get("instructions", "")
            payload["task_number"] = question_data.get("task_number", 1)
            payload["chart_image"] = question_data.get("chart_image")
        
        return payload


# ============================================
# API ENDPOINTS
# ============================================

@router.post("/api/admin/import-test-json")
async def import_test_from_json(
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(lambda: None)  # Replace with actual DB dependency
):
    """
    Upload a JSON file and automatically import as IELTS test
    
    The system will:
    1. Read the JSON file
    2. Auto-detect all question types
    3. Validate structures
    4. Create exam, sections, and questions
    5. Return detailed import report
    """
    
    try:
        # Read JSON file
        content = await file.read()
        json_data = json.loads(content)
        
        # Initialize handler
        handler = AutoImportHandler(db)
        
        # Import
        results = await handler.import_from_json(json_data)
        
        # Build response
        response = {
            "status": "success" if results["success"] else "failed",
            "exam_id": results["exam_id"],
            "summary": {
                "sections_created": results["sections_created"],
                "questions_created": results["questions_created"],
                "questions_by_type": results["questions_detected"]
            },
            "errors": results["errors"],
            "warnings": results["warnings"]
        }
        
        return response
    
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON file: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")


@router.post("/api/admin/validate-test-json")
async def validate_test_json(
    file: UploadFile = File(...)
):
    """
    Validate a JSON file without importing
    
    Returns:
    - List of detected question types
    - Validation errors
    - Structure warnings
    """
    
    try:
        # Read JSON file
        content = await file.read()
        json_data = json.loads(content)
        
        validation_results = {
            "valid": True,
            "detected_types": {},
            "errors": [],
            "warnings": []
        }
        
        # Check basic structure
        required_fields = ["title", "test_type", "sections"]
        for field in required_fields:
            if field not in json_data:
                validation_results["errors"].append(f"Missing required field: {field}")
                validation_results["valid"] = False
        
        # Validate sections and questions
        sections = json_data.get("sections", [])
        
        for i, section in enumerate(sections, 1):
            if "questions" not in section:
                validation_results["warnings"].append(f"Section {i} has no questions")
                continue
            
            questions = section["questions"]
            
            for question_data in questions:
                # Detect type
                detected_type = detect_question_type(question_data)
                
                if detected_type:
                    validation_results["detected_types"][detected_type] = \
                        validation_results["detected_types"].get(detected_type, 0) + 1
                    
                    # Validate structure
                    is_valid, errors = validate_question_structure(question_data, detected_type)
                    
                    if not is_valid:
                        validation_results["errors"].extend([
                            f"Question {question_data.get('index', '?')}: {error}"
                            for error in errors
                        ])
                        validation_results["valid"] = False
                else:
                    validation_results["warnings"].append(
                        f"Question {question_data.get('index', '?')}: Unable to detect type"
                    )
        
        return validation_results
    
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON file: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")


@router.get("/api/question-types/schemas")
async def get_all_schemas():
    """
    Get complete schema documentation for all question types
    
    Returns detailed structure for each question type with examples
    """
    return {
        "total_types": len(QUESTION_TYPE_SCHEMAS),
        "schemas": QUESTION_TYPE_SCHEMAS
    }


@router.get("/api/question-types/list")
async def get_question_types_list():
    """
    Get list of all supported question types
    """
    types_by_category = {
        "listening": [],
        "reading": [],
        "writing": []
    }
    
    for type_name, schema in QUESTION_TYPE_SCHEMAS.items():
        test_type = schema["test_type"]
        types_by_category[test_type].append({
            "type": type_name,
            "name": schema["name"],
            "description": schema["description"],
            "auto_grade": schema["auto_grade"],
            "ui_component": schema["ui_component"]
        })
    
    return types_by_category
