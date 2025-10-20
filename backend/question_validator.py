"""
Question Validation Service
Validates question structure and track integrity
"""

from typing import Dict, List, Any, Tuple, Optional
from question_type_detector import QuestionTypeDetector


class ValidationError:
    """Represents a validation error"""
    def __init__(self, question_id: str, field: str, message: str):
        self.question_id = question_id
        self.field = field
        self.message = message
    
    def to_dict(self) -> Dict[str, str]:
        return {
            "question_id": self.question_id,
            "field": self.field,
            "message": self.message
        }


class QuestionValidator:
    """Validates question structure"""

    REQUIRED_FIELDS = {
        "id": str,
        "text": str,
    }

    @staticmethod
    def validate_question(question: Dict[str, Any]) -> Tuple[bool, List[ValidationError]]:
        """
        Validate a single question

        Returns:
            (is_valid, errors)
        """
        errors = []

        # Check required fields (type is optional - will be auto-detected)
        for field, field_type in QuestionValidator.REQUIRED_FIELDS.items():
            if field not in question:
                errors.append(ValidationError(
                    question.get("id", "unknown"),
                    field,
                    f"Missing required field: {field}"
                ))
            elif not isinstance(question[field], field_type):
                errors.append(ValidationError(
                    question.get("id", "unknown"),
                    field,
                    f"Field '{field}' must be {field_type.__name__}, got {type(question[field]).__name__}"
                ))

        if errors:
            return False, errors

        # Validate type if provided (otherwise will be auto-detected)
        if "type" in question:
            question_type = question.get("type")
            is_valid_type, type_error = QuestionTypeDetector.validate_type(question_type)
            if not is_valid_type:
                errors.append(ValidationError(
                    question.get("id", "unknown"),
                    "type",
                    type_error
                ))
                return False, errors
        
        # Type-specific validation
        type_errors = QuestionValidator._validate_by_type(question)
        errors.extend(type_errors)
        
        return len(errors) == 0, errors
    
    @staticmethod
    def _validate_by_type(question: Dict[str, Any]) -> List[ValidationError]:
        """Validate question based on its type"""
        errors = []
        question_type = question.get("type")
        question_id = question.get("id", "unknown")

        # MCQ Single - requires options and correctAnswers
        if question_type == "mcq_single":
            if "options" not in question:
                errors.append(ValidationError(question_id, "options", "MCQ Single requires 'options' field"))
            elif not isinstance(question["options"], list) or len(question["options"]) < 2:
                errors.append(ValidationError(question_id, "options", "MCQ Single requires at least 2 options"))

            if "correctAnswers" not in question:
                errors.append(ValidationError(question_id, "correctAnswers", "MCQ Single requires 'correctAnswers' field"))

        # MCQ Multiple - requires options and correctAnswers
        elif question_type == "mcq_multiple":
            if "options" not in question:
                errors.append(ValidationError(question_id, "options", "MCQ Multiple requires 'options' field"))
            elif not isinstance(question["options"], list) or len(question["options"]) < 2:
                errors.append(ValidationError(question_id, "options", "MCQ Multiple requires at least 2 options"))

            if "correctAnswers" not in question:
                errors.append(ValidationError(question_id, "correctAnswers", "MCQ Multiple requires 'correctAnswers' field"))
            elif not isinstance(question["correctAnswers"], list) or len(question["correctAnswers"]) < 1:
                errors.append(ValidationError(question_id, "correctAnswers", "MCQ Multiple requires at least 1 correct answer"))

        # Sentence Completion - requires correctAnswers
        elif question_type == "sentence_completion":
            if "correctAnswers" not in question:
                errors.append(ValidationError(question_id, "correctAnswers", "Sentence Completion requires 'correctAnswers' field"))

        # True/False/Not Given - requires correctAnswers
        elif question_type == "true_false_ng":
            if "correctAnswers" not in question:
                errors.append(ValidationError(question_id, "correctAnswers", "True/False/Not Given requires 'correctAnswers' field"))
            else:
                answers = question["correctAnswers"] if isinstance(question["correctAnswers"], list) else [question["correctAnswers"]]
                for answer in answers:
                    answer_str = str(answer).lower()
                    if answer_str not in ["true", "false", "not given", "ng"]:
                        errors.append(ValidationError(question_id, "correctAnswers", "Answer must be 'True', 'False', or 'Not Given'"))
        
        # Writing Tasks - no correctAnswer required
        elif question_type in ["writing_task1", "writing_task2"]:
            if "minWords" not in question:
                errors.append(ValidationError(question_id, "minWords", f"{question_type} requires 'minWords' field"))
            if "maxWords" not in question:
                errors.append(ValidationError(question_id, "maxWords", f"{question_type} requires 'maxWords' field"))
        
        # Matching - requires items and options
        elif question_type == "matching":
            if "items" not in question:
                errors.append(ValidationError(question_id, "items", "Matching requires 'items' field"))
            if "options" not in question:
                errors.append(ValidationError(question_id, "options", "Matching requires 'options' field"))
        
        return errors
    
    @staticmethod
    def validate_questions_batch(questions: List[Dict[str, Any]]) -> Tuple[bool, List[ValidationError]]:
        """
        Validate a batch of questions
        
        Returns:
            (all_valid, all_errors)
        """
        all_errors = []
        
        for question in questions:
            is_valid, errors = QuestionValidator.validate_question(question)
            all_errors.extend(errors)
        
        return len(all_errors) == 0, all_errors


class TrackValidator:
    """Validates track structure"""
    
    @staticmethod
    def validate_track_structure(track_data: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Validate track structure

        Returns:
            (is_valid, errors)
        """
        errors = []

        # Check required fields
        required_fields = ["title", "sections"]
        for field in required_fields:
            if field not in track_data:
                errors.append(f"Missing required field: {field}")

        if errors:
            return False, errors

        # Validate type (can be test_type or type)
        track_type = track_data.get("test_type") or track_data.get("type")
        if track_type and track_type not in ["listening", "reading", "writing"]:
            errors.append(f"Invalid track type: {track_type}. Must be 'listening', 'reading', or 'writing'")
        
        # Validate sections
        sections = track_data.get("sections", [])
        if not isinstance(sections, list):
            errors.append("Sections must be a list")
            return False, errors
        
        if len(sections) == 0:
            errors.append("Track must have at least 1 section")
        
        if len(sections) > 4:
            errors.append(f"Track cannot have more than 4 sections (found {len(sections)})")
        
        # Validate each section
        total_questions = 0
        for i, section in enumerate(sections, 1):
            section_errors = TrackValidator._validate_section(section, i)
            errors.extend(section_errors)
            
            questions = section.get("questions", [])
            total_questions += len(questions)
        
        # Validate total questions
        if total_questions == 0:
            errors.append("Track must have at least 1 question")
        
        if total_questions > 40:
            errors.append(f"Track cannot have more than 40 questions (found {total_questions})")
        
        return len(errors) == 0, errors
    
    @staticmethod
    def _validate_section(section: Dict[str, Any], section_number: int) -> List[str]:
        """Validate a single section"""
        errors = []
        
        if not isinstance(section, dict):
            errors.append(f"Section {section_number} must be an object")
            return errors
        
        # Check required fields
        if "title" not in section:
            errors.append(f"Section {section_number} missing 'title' field")
        
        if "questions" not in section:
            errors.append(f"Section {section_number} missing 'questions' field")
            return errors
        
        questions = section.get("questions", [])
        if not isinstance(questions, list):
            errors.append(f"Section {section_number} questions must be a list")
            return errors
        
        if len(questions) == 0:
            errors.append(f"Section {section_number} must have at least 1 question")
        
        if len(questions) > 10:
            errors.append(f"Section {section_number} cannot have more than 10 questions (found {len(questions)})")
        
        return errors
    
    @staticmethod
    def validate_complete_track(track_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Comprehensive track validation
        
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
        is_valid, structure_errors = TrackValidator.validate_track_structure(track_data)
        
        result = {
            "is_valid": is_valid,
            "total_questions": 0,
            "total_sections": 0,
            "questions_by_type": {},
            "errors": structure_errors,
            "warnings": []
        }
        
        if not is_valid:
            return result
        
        # Count questions and types
        sections = track_data.get("sections", [])
        result["total_sections"] = len(sections)
        
        all_questions = []
        for section in sections:
            questions = section.get("questions", [])
            all_questions.extend(questions)
            result["total_questions"] += len(questions)
        
        # Validate all questions
        questions_valid, question_errors = QuestionValidator.validate_questions_batch(all_questions)
        result["errors"].extend([e.to_dict() for e in question_errors])
        result["is_valid"] = questions_valid and is_valid
        
        # Count by type
        type_batches = QuestionTypeDetector.batch_by_type(all_questions)
        result["questions_by_type"] = {
            question_type: len(questions)
            for question_type, questions in type_batches.items()
        }
        
        # Add warnings
        if result["total_questions"] < 10:
            result["warnings"].append(f"Track has only {result['total_questions']} questions (recommended: 10+)")
        
        return result

