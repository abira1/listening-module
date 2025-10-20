"""
Question Type Detection Service
Automatically detects all 18 IELTS question types from JSON structure
"""

from typing import Dict, List, Any, Optional, Tuple
from enum import Enum


class QuestionType(str, Enum):
    """All 18 supported IELTS question types"""
    # Listening (10)
    MCQ_SINGLE = "mcq_single"
    MCQ_MULTIPLE = "mcq_multiple"
    SENTENCE_COMPLETION = "sentence_completion"
    FORM_COMPLETION = "form_completion"
    TABLE_COMPLETION = "table_completion"
    FLOWCHART_COMPLETION = "flowchart_completion"
    FILL_GAPS = "fill_gaps"
    FILL_GAPS_SHORT = "fill_gaps_short"
    MATCHING = "matching"
    MAP_LABELLING = "map_labelling"
    
    # Reading (6)
    TRUE_FALSE_NG = "true_false_ng"
    MATCHING_HEADINGS = "matching_headings"
    MATCHING_FEATURES = "matching_features"
    MATCHING_ENDINGS = "matching_endings"
    NOTE_COMPLETION = "note_completion"
    SUMMARY_COMPLETION = "summary_completion"
    
    # Writing (2)
    WRITING_TASK1 = "writing_task1"
    WRITING_TASK2 = "writing_task2"


class QuestionTypeDetector:
    """Detects question types from JSON structure"""
    
    VALID_TYPES = [t.value for t in QuestionType]
    
    @staticmethod
    def detect_type(question: Dict[str, Any]) -> str:
        """
        Detect question type from structure
        
        Priority:
        1. Explicit 'type' field
        2. Structure-based detection
        3. Default to mcq_single
        """
        # Priority 1: Check explicit type field
        if 'type' in question:
            explicit_type = question['type']
            if explicit_type in QuestionTypeDetector.VALID_TYPES:
                return explicit_type
        
        # Priority 2: Structure-based detection
        detected_type = QuestionTypeDetector._detect_by_structure(question)
        if detected_type:
            return detected_type
        
        # Priority 3: Default
        return QuestionType.MCQ_SINGLE.value
    
    @staticmethod
    def _detect_by_structure(question: Dict[str, Any]) -> Optional[str]:
        """Detect type by analyzing question structure"""

        # Check for multiple correct answers (MCQ Multiple)
        if 'correctAnswers' in question and isinstance(question.get('correctAnswers'), list):
            if len(question['correctAnswers']) > 1:
                return QuestionType.MCQ_MULTIPLE.value

        # Check for options (MCQ Single)
        if 'options' in question and isinstance(question.get('options'), list):
            if len(question['options']) >= 2:
                return QuestionType.MCQ_SINGLE.value

        # Check for True/False/Not Given (check both correctAnswer and correctAnswers)
        answer_field = question.get('correctAnswer') or (question.get('correctAnswers')[0] if isinstance(question.get('correctAnswers'), list) and len(question.get('correctAnswers', [])) > 0 else None)
        if answer_field:
            answer = str(answer_field).lower()
            if answer in ['true', 'false', 'not given', 'ng']:
                return QuestionType.TRUE_FALSE_NG.value
        
        # Check for writing tasks
        if 'minWords' in question or 'maxWords' in question:
            if 'task_number' in question:
                task_num = question.get('task_number', 1)
                if task_num == 1:
                    return QuestionType.WRITING_TASK1.value
                elif task_num == 2:
                    return QuestionType.WRITING_TASK2.value
            return QuestionType.WRITING_TASK1.value
        
        # Check for completion types
        if 'blanks' in question or 'gaps' in question:
            if 'maxWords' in question and question['maxWords'] <= 3:
                return QuestionType.FILL_GAPS_SHORT.value
            return QuestionType.FILL_GAPS.value
        
        # Check for matching
        if 'items' in question and 'options' in question:
            return QuestionType.MATCHING.value
        
        # Check for table/form/flowchart completion
        if 'table' in question or 'tableData' in question:
            return QuestionType.TABLE_COMPLETION.value
        
        if 'form' in question or 'formFields' in question:
            return QuestionType.FORM_COMPLETION.value
        
        if 'flowchart' in question or 'flowchartData' in question:
            return QuestionType.FLOWCHART_COMPLETION.value
        
        # Check for map labelling
        if 'map' in question or 'mapImage' in question or 'locations' in question:
            return QuestionType.MAP_LABELLING.value
        
        # Check for matching headings
        if 'headings' in question and 'paragraphs' in question:
            return QuestionType.MATCHING_HEADINGS.value
        
        # Check for matching features
        if 'features' in question and 'options' in question:
            return QuestionType.MATCHING_FEATURES.value
        
        # Check for matching endings
        if 'stems' in question and 'endings' in question:
            return QuestionType.MATCHING_ENDINGS.value
        
        # Check for note completion
        if 'notes' in question or 'noteTemplate' in question:
            return QuestionType.NOTE_COMPLETION.value
        
        # Check for summary completion
        if 'summary' in question or 'summaryTemplate' in question:
            return QuestionType.SUMMARY_COMPLETION.value
        
        return None
    
    @staticmethod
    def batch_by_type(questions: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Group questions by detected type
        
        Returns:
            Dict mapping type -> list of questions
        """
        batches = {}
        
        for question in questions:
            detected_type = QuestionTypeDetector.detect_type(question)
            
            if detected_type not in batches:
                batches[detected_type] = []
            
            batches[detected_type].append(question)
        
        return batches
    
    @staticmethod
    def get_type_category(question_type: str) -> str:
        """Get category (listening/reading/writing) for a question type"""
        listening_types = [
            QuestionType.MCQ_SINGLE.value,
            QuestionType.MCQ_MULTIPLE.value,
            QuestionType.SENTENCE_COMPLETION.value,
            QuestionType.FORM_COMPLETION.value,
            QuestionType.TABLE_COMPLETION.value,
            QuestionType.FLOWCHART_COMPLETION.value,
            QuestionType.FILL_GAPS.value,
            QuestionType.FILL_GAPS_SHORT.value,
            QuestionType.MATCHING.value,
            QuestionType.MAP_LABELLING.value,
        ]
        
        reading_types = [
            QuestionType.TRUE_FALSE_NG.value,
            QuestionType.MATCHING_HEADINGS.value,
            QuestionType.MATCHING_FEATURES.value,
            QuestionType.MATCHING_ENDINGS.value,
            QuestionType.NOTE_COMPLETION.value,
            QuestionType.SUMMARY_COMPLETION.value,
        ]
        
        writing_types = [
            QuestionType.WRITING_TASK1.value,
            QuestionType.WRITING_TASK2.value,
        ]
        
        if question_type in listening_types:
            return "listening"
        elif question_type in reading_types:
            return "reading"
        elif question_type in writing_types:
            return "writing"
        
        return "unknown"
    
    @staticmethod
    def validate_type(question_type: str) -> Tuple[bool, Optional[str]]:
        """
        Validate if a question type is valid
        
        Returns:
            (is_valid, error_message)
        """
        if question_type not in QuestionTypeDetector.VALID_TYPES:
            return False, f"Unknown question type: {question_type}. Valid types: {', '.join(QuestionTypeDetector.VALID_TYPES)}"
        
        return True, None
    
    @staticmethod
    def get_all_types() -> List[str]:
        """Get list of all valid question types"""
        return QuestionTypeDetector.VALID_TYPES
    
    @staticmethod
    def get_types_by_category(category: str) -> List[str]:
        """Get all question types for a category"""
        if category == "listening":
            return [
                QuestionType.MCQ_SINGLE.value,
                QuestionType.MCQ_MULTIPLE.value,
                QuestionType.SENTENCE_COMPLETION.value,
                QuestionType.FORM_COMPLETION.value,
                QuestionType.TABLE_COMPLETION.value,
                QuestionType.FLOWCHART_COMPLETION.value,
                QuestionType.FILL_GAPS.value,
                QuestionType.FILL_GAPS_SHORT.value,
                QuestionType.MATCHING.value,
                QuestionType.MAP_LABELLING.value,
            ]
        elif category == "reading":
            return [
                QuestionType.TRUE_FALSE_NG.value,
                QuestionType.MATCHING_HEADINGS.value,
                QuestionType.MATCHING_FEATURES.value,
                QuestionType.MATCHING_ENDINGS.value,
                QuestionType.NOTE_COMPLETION.value,
                QuestionType.SUMMARY_COMPLETION.value,
            ]
        elif category == "writing":
            return [
                QuestionType.WRITING_TASK1.value,
                QuestionType.WRITING_TASK2.value,
            ]
        
        return []

