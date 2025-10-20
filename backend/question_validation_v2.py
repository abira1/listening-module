"""
Enhanced Question Validation for All 18 IELTS Question Types
Supports the new unified type system with all official IELTS question types
"""

from typing import Dict, List, Any, Optional, Tuple
from enum import Enum

# ============================================
# UNIFIED QUESTION TYPE ENUMS
# ============================================

class QuestionType(str, Enum):
    """All 18 official IELTS question types"""
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


# ============================================
# VALIDATION SCHEMAS
# ============================================

QUESTION_VALIDATION_SCHEMAS = {
    # Listening Types
    "mcq_single": {
        "required_fields": ["id", "type", "text", "options", "correctAnswer"],
        "field_types": {
            "id": str,
            "type": str,
            "text": str,
            "options": list,
            "correctAnswer": str
        },
        "constraints": {
            "options": {"min_length": 2, "max_length": 4},
            "correctAnswer": {"pattern": "^[a-zA-Z0-9]+$"}
        }
    },
    
    "mcq_multiple": {
        "required_fields": ["id", "type", "text", "options", "correctAnswers"],
        "field_types": {
            "id": str,
            "type": str,
            "text": str,
            "options": list,
            "correctAnswers": list
        },
        "constraints": {
            "options": {"min_length": 2},
            "correctAnswers": {"min_length": 2}
        }
    },
    
    "sentence_completion": {
        "required_fields": ["id", "type", "text", "wordList", "correctAnswer"],
        "field_types": {
            "id": str,
            "type": str,
            "text": str,
            "wordList": list,
            "correctAnswer": str
        }
    },
    
    "form_completion": {
        "required_fields": ["id", "type", "text", "fields"],
        "field_types": {
            "id": str,
            "type": str,
            "text": str,
            "fields": list
        }
    },
    
    "table_completion": {
        "required_fields": ["id", "type", "text", "table"],
        "field_types": {
            "id": str,
            "type": str,
            "text": str,
            "table": dict
        }
    },
    
    "flowchart_completion": {
        "required_fields": ["id", "type", "text", "boxes"],
        "field_types": {
            "id": str,
            "type": str,
            "text": str,
            "boxes": list
        }
    },
    
    "fill_gaps": {
        "required_fields": ["id", "type", "text", "correctAnswer"],
        "field_types": {
            "id": str,
            "type": str,
            "text": str,
            "correctAnswer": list
        }
    },
    
    "fill_gaps_short": {
        "required_fields": ["id", "type", "text", "correctAnswer"],
        "field_types": {
            "id": str,
            "type": str,
            "text": str,
            "correctAnswer": str
        }
    },
    
    "matching": {
        "required_fields": ["id", "type", "text", "leftItems", "rightItems"],
        "field_types": {
            "id": str,
            "type": str,
            "text": str,
            "leftItems": list,
            "rightItems": list
        }
    },
    
    "map_labelling": {
        "required_fields": ["id", "type", "text", "image", "labels"],
        "field_types": {
            "id": str,
            "type": str,
            "text": str,
            "image": str,
            "labels": list
        }
    },
    
    # Reading Types
    "true_false_ng": {
        "required_fields": ["id", "type", "text", "correctAnswer"],
        "field_types": {
            "id": str,
            "type": str,
            "text": str,
            "correctAnswer": str
        },
        "constraints": {
            "correctAnswer": {"enum": ["True", "False", "Not Given"]}
        }
    },
    
    "matching_headings": {
        "required_fields": ["id", "type", "text", "headings", "paragraphs"],
        "field_types": {
            "id": str,
            "type": str,
            "text": str,
            "headings": list,
            "paragraphs": list
        }
    },
    
    "matching_features": {
        "required_fields": ["id", "type", "text", "features", "items"],
        "field_types": {
            "id": str,
            "type": str,
            "text": str,
            "features": list,
            "items": list
        }
    },
    
    "matching_endings": {
        "required_fields": ["id", "type", "text", "beginnings", "endings"],
        "field_types": {
            "id": str,
            "type": str,
            "text": str,
            "beginnings": list,
            "endings": list
        }
    },
    
    "note_completion": {
        "required_fields": ["id", "type", "text", "notes"],
        "field_types": {
            "id": str,
            "type": str,
            "text": str,
            "notes": list
        }
    },
    
    "summary_completion": {
        "required_fields": ["id", "type", "text", "summary", "wordList"],
        "field_types": {
            "id": str,
            "type": str,
            "text": str,
            "summary": str,
            "wordList": list
        }
    },
    
    # Writing Types
    "writing_task1": {
        "required_fields": ["id", "type", "prompt", "minWords"],
        "field_types": {
            "id": str,
            "type": str,
            "prompt": str,
            "minWords": int
        },
        "constraints": {
            "minWords": {"min": 100, "max": 300}
        }
    },
    
    "writing_task2": {
        "required_fields": ["id", "type", "prompt", "minWords"],
        "field_types": {
            "id": str,
            "type": str,
            "prompt": str,
            "minWords": int
        },
        "constraints": {
            "minWords": {"min": 200, "max": 500}
        }
    }
}


# ============================================
# VALIDATION FUNCTIONS
# ============================================

def validate_question(question_data: Dict[str, Any], question_type: str) -> Tuple[bool, List[str]]:
    """
    Validate a question against its schema
    
    Args:
        question_data: The question data to validate
        question_type: The type of question
        
    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []
    
    # Check if type is valid
    if question_type not in QUESTION_VALIDATION_SCHEMAS:
        return False, [f"Unknown question type: {question_type}"]
    
    schema = QUESTION_VALIDATION_SCHEMAS[question_type]
    
    # Check required fields
    for field in schema.get("required_fields", []):
        if field not in question_data:
            errors.append(f"Missing required field: {field}")
    
    # Check field types
    for field, expected_type in schema.get("field_types", {}).items():
        if field in question_data:
            value = question_data[field]
            if not isinstance(value, expected_type):
                errors.append(f"Field '{field}' must be of type {expected_type.__name__}")
    
    # Check constraints
    for field, constraints in schema.get("constraints", {}).items():
        if field in question_data:
            value = question_data[field]
            
            # Check enum constraint
            if "enum" in constraints:
                if value not in constraints["enum"]:
                    errors.append(f"Field '{field}' must be one of: {constraints['enum']}")
            
            # Check length constraints
            if isinstance(value, (list, str)):
                if "min_length" in constraints and len(value) < constraints["min_length"]:
                    errors.append(f"Field '{field}' must have at least {constraints['min_length']} items")
                if "max_length" in constraints and len(value) > constraints["max_length"]:
                    errors.append(f"Field '{field}' must have at most {constraints['max_length']} items")
            
            # Check numeric constraints
            if isinstance(value, (int, float)):
                if "min" in constraints and value < constraints["min"]:
                    errors.append(f"Field '{field}' must be at least {constraints['min']}")
                if "max" in constraints and value > constraints["max"]:
                    errors.append(f"Field '{field}' must be at most {constraints['max']}")
    
    return len(errors) == 0, errors


def get_all_question_types() -> List[str]:
    """Get list of all supported question types"""
    return list(QUESTION_VALIDATION_SCHEMAS.keys())


def is_valid_question_type(question_type: str) -> bool:
    """Check if a question type is valid"""
    return question_type in QUESTION_VALIDATION_SCHEMAS


def get_question_type_schema(question_type: str) -> Optional[Dict[str, Any]]:
    """Get the schema for a question type"""
    return QUESTION_VALIDATION_SCHEMAS.get(question_type)

