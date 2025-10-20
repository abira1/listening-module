"""
Track Creation Service
Creates tracks from JSON with automatic type detection and batching
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import uuid
from question_type_detector import QuestionTypeDetector
from question_validator import TrackValidator, QuestionValidator


class TrackCreationService:
    """Service for creating tracks from JSON"""
    
    @staticmethod
    def create_track_from_json(
        json_data: Dict[str, Any],
        admin_id: str = "admin@example.com"
    ) -> Dict[str, Any]:
        """
        Create a complete track from JSON data
        
        Process:
        1. Validate structure
        2. Detect question types
        3. Batch by type
        4. Create track document
        5. Create sections
        6. Create questions
        
        Returns:
            {
                "success": bool,
                "track_id": str,
                "track": Track object,
                "questions_created": int,
                "questions_by_type": dict,
                "errors": list
            }
        """
        result = {
            "success": False,
            "track_id": None,
            "track": None,
            "questions_created": 0,
            "questions_by_type": {},
            "errors": []
        }
        
        # Step 1: Validate structure
        validation = TrackValidator.validate_complete_track(json_data)
        if not validation["is_valid"]:
            result["errors"] = validation["errors"]
            return result
        
        # Step 2: Extract track metadata
        track_id = str(uuid.uuid4())
        track_title = json_data.get("title", "Untitled Track")
        track_type = json_data.get("type", "listening")
        track_description = json_data.get("description", "")
        
        # Step 3: Process sections and questions
        sections = []
        all_questions = []
        
        for section_data in json_data.get("sections", []):
            section = TrackCreationService._create_section(
                section_data,
                track_id
            )
            sections.append(section)
            
            # Collect all questions for type detection
            questions = section_data.get("questions", [])
            all_questions.extend(questions)
        
        # Step 4: Detect types and batch
        type_batches = QuestionTypeDetector.batch_by_type(all_questions)
        
        # Step 5: Create track document
        track = TrackCreationService._create_track_document(
            track_id=track_id,
            title=track_title,
            track_type=track_type,
            description=track_description,
            sections=sections,
            admin_id=admin_id,
            questions_by_type=type_batches
        )
        
        result["success"] = True
        result["track_id"] = track_id
        result["track"] = track
        result["questions_created"] = len(all_questions)
        result["questions_by_type"] = {
            qtype: len(questions)
            for qtype, questions in type_batches.items()
        }
        
        return result
    
    @staticmethod
    def _create_section(
        section_data: Dict[str, Any],
        track_id: str
    ) -> Dict[str, Any]:
        """Create a section with questions"""
        section_id = str(uuid.uuid4())
        
        questions = []
        for i, question_data in enumerate(section_data.get("questions", []), 1):
            question = TrackCreationService._create_question(
                question_data,
                track_id,
                section_id,
                i
            )
            questions.append(question)
        
        return {
            "id": section_id,
            "order": section_data.get("order", 1),
            "title": section_data.get("title", ""),
            "questions": questions
        }
    
    @staticmethod
    def _create_question(
        question_data: Dict[str, Any],
        track_id: str,
        section_id: str,
        order: int
    ) -> Dict[str, Any]:
        """Create a question with auto-detected type"""
        question_id = question_data.get("id", str(uuid.uuid4()))
        
        # Auto-detect type if not provided
        detected_type = QuestionTypeDetector.detect_type(question_data)
        
        # Build payload from question data
        payload = TrackCreationService._build_payload(question_data, detected_type)
        
        return {
            "id": question_id,
            "order": order,
            "type": detected_type,
            "payload": payload,
            "marks": question_data.get("marks", 1),
            "metadata": {
                "track_id": track_id,
                "section_id": section_id,
                "original_data": question_data
            }
        }
    
    @staticmethod
    def _build_payload(question_data: Dict[str, Any], question_type: str) -> Dict[str, Any]:
        """Build payload based on question type"""
        payload = {}
        
        # Common fields
        if "text" in question_data:
            payload["text"] = question_data["text"]
        if "prompt" in question_data:
            payload["prompt"] = question_data["prompt"]
        
        # Type-specific fields
        if question_type in ["mcq_single", "mcq_multiple"]:
            if "options" in question_data:
                payload["options"] = question_data["options"]
            if "correctAnswer" in question_data:
                payload["correctAnswer"] = question_data["correctAnswer"]
            if "correctAnswers" in question_data:
                payload["correctAnswers"] = question_data["correctAnswers"]
        
        elif question_type == "sentence_completion":
            if "correctAnswer" in question_data:
                payload["correctAnswer"] = question_data["correctAnswer"]
            if "maxWords" in question_data:
                payload["maxWords"] = question_data["maxWords"]
        
        elif question_type == "true_false_ng":
            if "correctAnswer" in question_data:
                payload["correctAnswer"] = question_data["correctAnswer"]
        
        elif question_type in ["writing_task1", "writing_task2"]:
            if "minWords" in question_data:
                payload["minWords"] = question_data["minWords"]
            if "maxWords" in question_data:
                payload["maxWords"] = question_data["maxWords"]
            if "instructions" in question_data:
                payload["instructions"] = question_data["instructions"]
        
        elif question_type == "matching":
            if "items" in question_data:
                payload["items"] = question_data["items"]
            if "options" in question_data:
                payload["options"] = question_data["options"]
        
        elif question_type == "table_completion":
            if "table" in question_data:
                payload["table"] = question_data["table"]
            if "correctAnswers" in question_data:
                payload["correctAnswers"] = question_data["correctAnswers"]
        
        elif question_type == "form_completion":
            if "form" in question_data:
                payload["form"] = question_data["form"]
            if "correctAnswers" in question_data:
                payload["correctAnswers"] = question_data["correctAnswers"]
        
        elif question_type == "flowchart_completion":
            if "flowchart" in question_data:
                payload["flowchart"] = question_data["flowchart"]
            if "correctAnswers" in question_data:
                payload["correctAnswers"] = question_data["correctAnswers"]
        
        elif question_type == "map_labelling":
            if "mapImage" in question_data:
                payload["mapImage"] = question_data["mapImage"]
            if "locations" in question_data:
                payload["locations"] = question_data["locations"]
            if "correctAnswers" in question_data:
                payload["correctAnswers"] = question_data["correctAnswers"]
        
        elif question_type == "matching_headings":
            if "headings" in question_data:
                payload["headings"] = question_data["headings"]
            if "paragraphs" in question_data:
                payload["paragraphs"] = question_data["paragraphs"]
            if "correctAnswers" in question_data:
                payload["correctAnswers"] = question_data["correctAnswers"]
        
        elif question_type == "matching_features":
            if "features" in question_data:
                payload["features"] = question_data["features"]
            if "options" in question_data:
                payload["options"] = question_data["options"]
            if "correctAnswers" in question_data:
                payload["correctAnswers"] = question_data["correctAnswers"]
        
        elif question_type == "matching_endings":
            if "stems" in question_data:
                payload["stems"] = question_data["stems"]
            if "endings" in question_data:
                payload["endings"] = question_data["endings"]
            if "correctAnswers" in question_data:
                payload["correctAnswers"] = question_data["correctAnswers"]
        
        elif question_type == "note_completion":
            if "notes" in question_data:
                payload["notes"] = question_data["notes"]
            if "correctAnswers" in question_data:
                payload["correctAnswers"] = question_data["correctAnswers"]
        
        elif question_type == "summary_completion":
            if "summary" in question_data:
                payload["summary"] = question_data["summary"]
            if "correctAnswers" in question_data:
                payload["correctAnswers"] = question_data["correctAnswers"]
        
        return payload
    
    @staticmethod
    def _create_track_document(
        track_id: str,
        title: str,
        track_type: str,
        description: str,
        sections: List[Dict[str, Any]],
        admin_id: str,
        questions_by_type: Dict[str, List[Any]]
    ) -> Dict[str, Any]:
        """Create track document"""
        total_questions = sum(len(s.get("questions", [])) for s in sections)
        
        return {
            "id": track_id,
            "title": title,
            "type": track_type,
            "description": description,
            "created_by": admin_id,
            "status": "draft",
            "sections": sections,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "metadata": {
                "total_questions": total_questions,
                "total_sections": len(sections),
                "questions_by_type": {
                    qtype: len(questions)
                    for qtype, questions in questions_by_type.items()
                }
            }
        }

