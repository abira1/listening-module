"""
IELTS Question Type Schemas - Complete Definition
This file contains ALL official IELTS question type structures.
Used for automatic type detection, validation, and import.

When uploading a JSON file, the system will:
1. Read the question data
2. Auto-detect the question type based on structure
3. Validate against the appropriate schema
4. Create questions with correct type
"""

from typing import Dict, List, Any, Optional, Literal, Union
from pydantic import BaseModel, Field, validator
from enum import Enum

# ============================================
# QUESTION TYPE ENUMS
# ============================================

class ListeningQuestionType(str, Enum):
    """All official IELTS Listening question types"""
    MULTIPLE_CHOICE_SINGLE = "multiple_choice_single"
    MULTIPLE_CHOICE_MULTIPLE = "multiple_choice_multiple"
    MATCHING = "matching"
    MAP_LABELING = "map_labeling"
    DIAGRAM_LABELING = "diagram_labeling"
    FORM_COMPLETION = "form_completion"
    NOTE_COMPLETION = "note_completion_listening"
    TABLE_COMPLETION = "table_completion_listening"
    FLOWCHART_COMPLETION = "flowchart_completion_listening"
    SUMMARY_COMPLETION = "summary_completion_listening"
    SENTENCE_COMPLETION = "sentence_completion_listening"
    SHORT_ANSWER = "short_answer_listening"


class ReadingQuestionType(str, Enum):
    """All official IELTS Reading question types"""
    MULTIPLE_CHOICE_SINGLE = "multiple_choice_single_reading"
    MULTIPLE_CHOICE_MULTIPLE = "multiple_choice_multiple_reading"
    TRUE_FALSE_NOT_GIVEN = "true_false_not_given"
    YES_NO_NOT_GIVEN = "yes_no_not_given"
    NOTE_COMPLETION = "note_completion_reading"
    MATCHING_HEADINGS = "matching_headings"
    SUMMARY_COMPLETION_TEXT = "summary_completion_text"
    SUMMARY_COMPLETION_LIST = "summary_completion_list"
    FLOWCHART_COMPLETION = "flowchart_completion_reading"
    SENTENCE_COMPLETION = "sentence_completion_reading"
    MATCHING_SENTENCE_ENDINGS = "matching_sentence_endings"
    TABLE_COMPLETION = "table_completion_reading"
    MATCHING_FEATURES = "matching_features"
    MATCHING_PARAGRAPHS = "matching_paragraphs"


class WritingQuestionType(str, Enum):
    """IELTS Writing question type"""
    WRITING_TASK = "writing_task"


# ============================================
# TYPE DETECTION SIGNATURES
# ============================================

TYPE_DETECTION_RULES = {
    # LISTENING TYPES
    "multiple_choice_single": {
        "required_fields": ["prompt", "options", "answer_key"],
        "field_types": {
            "options": list,
            "answer_key": str  # Single answer
        },
        "indicators": {
            "has_checkboxes": False,
            "select_count": None
        }
    },
    "multiple_choice_multiple": {
        "required_fields": ["prompt", "options", "answer_key", "select_count"],
        "field_types": {
            "options": list,
            "answer_key": list,  # Multiple answers
            "select_count": int
        },
        "indicators": {
            "has_checkboxes": True,
            "select_count": lambda x: x >= 2
        }
    },
    "matching": {
        "required_fields": ["left_items", "right_items", "answer_key"],
        "field_types": {
            "left_items": list,
            "right_items": list,
            "answer_key": dict  # Mapping
        },
        "indicators": {
            "has_items": True,
            "is_matching": True
        }
    },
    "map_labeling": {
        "required_fields": ["prompt", "options", "answer_key", "image_url"],
        "field_types": {
            "image_url": str,
            "options": list
        },
        "indicators": {
            "has_map": True,
            "has_image": True
        }
    },
    "diagram_labeling": {
        "required_fields": ["prompt", "answer_key", "image_url"],
        "field_types": {
            "image_url": str,
            "answer_key": str
        },
        "indicators": {
            "has_diagram": True,
            "has_blanks": True
        }
    },
    "form_completion": {
        "required_fields": ["form_title", "fields"],
        "field_types": {
            "fields": list,
            "form_title": str
        },
        "indicators": {
            "has_form": True,
            "has_fields": True
        }
    },
    "note_completion_listening": {
        "required_fields": ["notes", "title"],
        "field_types": {
            "notes": list,
            "title": str
        },
        "indicators": {
            "has_notes": True,
            "is_outline": True
        }
    },
    "table_completion_listening": {
        "required_fields": ["headers", "rows"],
        "field_types": {
            "headers": list,
            "rows": list
        },
        "indicators": {
            "has_table": True,
            "has_rows": True
        }
    },
    "flowchart_completion_listening": {
        "required_fields": ["steps", "title"],
        "field_types": {
            "steps": list,
            "title": str
        },
        "indicators": {
            "has_flowchart": True,
            "has_steps": True
        }
    },
    "summary_completion_listening": {
        "required_fields": ["summary", "blanks"],
        "field_types": {
            "summary": str,
            "blanks": list
        },
        "indicators": {
            "has_summary": True,
            "has_paragraph": True
        }
    },
    "sentence_completion_listening": {
        "required_fields": ["prompt", "answer_key", "max_words"],
        "field_types": {
            "prompt": str,
            "answer_key": str,
            "max_words": int
        },
        "indicators": {
            "has_sentence": True,
            "has_blank": True
        }
    },
    "short_answer_listening": {
        "required_fields": ["prompt", "answer_key"],
        "field_types": {
            "prompt": str,
            "answer_key": str
        },
        "indicators": {
            "is_question": True,
            "requires_answer": True
        }
    },
    
    # READING TYPES
    "matching_headings": {
        "required_fields": ["headings", "answer_key"],
        "field_types": {
            "headings": list,
            "answer_key": str
        },
        "indicators": {
            "has_headings": True,
            "match_to_paragraph": True
        }
    },
    "true_false_not_given": {
        "required_fields": ["prompt", "answer_key"],
        "field_types": {
            "answer_key": str
        },
        "indicators": {
            "has_tfng_options": True,
            "answer_key_in": ["TRUE", "FALSE", "NOT GIVEN", "true", "false", "not given"]
        }
    },
    "matching_sentence_endings": {
        "required_fields": ["sentence_beginning", "endings", "answer_key"],
        "field_types": {
            "sentence_beginning": str,
            "endings": list,
            "answer_key": str
        },
        "indicators": {
            "has_sentence_parts": True,
            "has_endings": True
        }
    },
    "matching_features": {
        "required_fields": ["statements", "features", "answer_key"],
        "field_types": {
            "statements": list,
            "features": list,
            "answer_key": dict
        },
        "indicators": {
            "has_features": True,
            "match_features": True
        }
    },
    
    # WRITING TYPE
    "writing_task": {
        "required_fields": ["instructions", "prompt", "min_words", "task_number"],
        "field_types": {
            "min_words": int,
            "task_number": int
        },
        "indicators": {
            "is_writing": True,
            "has_word_requirement": True
        }
    }
}


# ============================================
# COMPLETE QUESTION TYPE SCHEMAS
# ============================================

QUESTION_TYPE_SCHEMAS = {
    # ============================================
    # LISTENING QUESTION TYPES (11 types)
    # ============================================
    
    "multiple_choice_single": {
        "name": "Multiple Choice (Single Answer)",
        "description": "Choose ONE correct answer from 3-4 options",
        "test_type": "listening",
        "structure": {
            "index": {"type": "integer", "required": True, "description": "Question number"},
            "type": {"type": "string", "required": True, "value": "multiple_choice_single"},
            "prompt": {"type": "string", "required": True, "description": "Question text"},
            "options": {"type": "array", "required": True, "min_items": 2, "max_items": 4, "description": "Answer choices"},
            "answer_key": {"type": "string", "required": True, "pattern": "^[A-D]$", "description": "Correct option (A, B, C, or D)"},
            "marks": {"type": "integer", "required": False, "default": 1}
        },
        "example": {
            "index": 1,
            "type": "multiple_choice_single",
            "prompt": "What is the speaker's main concern?",
            "options": ["Cost", "Time", "Quality", "Safety"],
            "answer_key": "C",
            "marks": 1
        },
        "ui_component": "RadioButtons",
        "auto_grade": True,
        "grading_method": "exact_match"
    },
    
    "multiple_choice_multiple": {
        "name": "Multiple Choice (Multiple Answers)",
        "description": "Choose TWO or more correct answers from options",
        "test_type": "listening",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "multiple_choice_multiple"},
            "prompt": {"type": "string", "required": True},
            "options": {"type": "array", "required": True, "min_items": 3},
            "answer_key": {"type": "array", "required": True, "description": "List of correct options"},
            "select_count": {"type": "integer", "required": True, "min": 2, "description": "How many to select"},
            "marks": {"type": "integer", "required": False, "default": 1}
        },
        "example": {
            "index": 2,
            "type": "multiple_choice_multiple",
            "prompt": "Which TWO features are mentioned?",
            "options": ["Swimming pool", "Gym", "Library", "Parking"],
            "answer_key": ["A", "C"],
            "select_count": 2,
            "marks": 1
        },
        "ui_component": "Checkboxes",
        "auto_grade": True,
        "grading_method": "set_match"
    },
    
    "matching": {
        "name": "Matching",
        "description": "Match items from one list to another",
        "test_type": "listening",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "matching"},
            "instructions": {"type": "string", "required": True},
            "left_items": {"type": "array", "required": True, "description": "Items to match FROM"},
            "right_items": {"type": "array", "required": True, "description": "Options to match TO"},
            "answer_key": {"type": "object", "required": True, "description": "Mapping of left to right"},
            "marks": {"type": "integer", "required": False}
        },
        "example": {
            "index": 3,
            "type": "matching",
            "instructions": "Match each person to their opinion",
            "left_items": [
                {"id": 1, "text": "Dr. Sarah"},
                {"id": 2, "text": "Prof. James"}
            ],
            "right_items": [
                {"key": "A", "text": "Strongly supports"},
                {"key": "B", "text": "Opposes"},
                {"key": "C", "text": "Neutral"}
            ],
            "answer_key": {"1": "A", "2": "B"},
            "marks": 2
        },
        "ui_component": "MatchingDraggable",
        "auto_grade": True,
        "grading_method": "mapping_match"
    },
    
    "map_labeling": {
        "name": "Map/Plan Labeling",
        "description": "Label locations on a map or plan",
        "test_type": "listening",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "map_labeling"},
            "prompt": {"type": "string", "required": True},
            "options": {"type": "array", "required": True, "description": "Letter options (A-I)"},
            "answer_key": {"type": "string", "required": True, "pattern": "^[A-I]$"},
            "image_url": {"type": "string", "required": True, "description": "Map image URL"},
            "marks": {"type": "integer", "required": False, "default": 1}
        },
        "example": {
            "index": 11,
            "type": "map_labeling",
            "prompt": "Restaurant",
            "options": ["A", "B", "C", "D", "E", "F"],
            "answer_key": "B",
            "image_url": "https://example.com/ferry-map.png",
            "marks": 1
        },
        "ui_component": "DropdownWithImage",
        "auto_grade": True,
        "grading_method": "exact_match"
    },
    
    "diagram_labeling": {
        "name": "Diagram Labeling",
        "description": "Label parts of a diagram",
        "test_type": "listening",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "diagram_labeling"},
            "prompt": {"type": "string", "required": True, "description": "Prompt with blank (_____)"},
            "answer_key": {"type": "string", "required": True},
            "max_words": {"type": "integer", "required": True, "default": 1},
            "image_url": {"type": "string", "required": True, "description": "Diagram image URL"},
            "marks": {"type": "integer", "required": False, "default": 1}
        },
        "example": {
            "index": 31,
            "type": "diagram_labeling",
            "prompt": "_____ rods: uranium/plutonium isotope",
            "answer_key": "Fuel",
            "max_words": 1,
            "image_url": "https://example.com/reactor-diagram.png",
            "marks": 1
        },
        "ui_component": "InlineTextInput",
        "auto_grade": True,
        "grading_method": "case_insensitive"
    },
    
    "form_completion": {
        "name": "Form Completion",
        "description": "Fill in missing fields in a form",
        "test_type": "listening",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "form_completion"},
            "form_title": {"type": "string", "required": True},
            "fields": {"type": "array", "required": True, "description": "Form fields with labels and blanks"},
            "marks": {"type": "integer", "required": False}
        },
        "example": {
            "index": 5,
            "type": "form_completion",
            "form_title": "Job Application Form",
            "fields": [
                {"index": 5, "label": "Name:", "answer_key": "Sarah Johnson", "max_words": 3},
                {"index": 6, "label": "Phone:", "answer_key": "555-1234", "max_words": 2},
                {"index": 7, "label": "Start Date:", "answer_key": "15 March", "max_words": 2}
            ],
            "marks": 3
        },
        "ui_component": "FormComponent",
        "auto_grade": True,
        "grading_method": "case_insensitive_per_field"
    },
    
    "note_completion_listening": {
        "name": "Note Completion",
        "description": "Complete notes or an outline",
        "test_type": "listening",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "note_completion_listening"},
            "title": {"type": "string", "required": True},
            "notes": {"type": "array", "required": True, "description": "Note lines with blanks"},
            "marks": {"type": "integer", "required": False}
        },
        "example": {
            "index": 8,
            "type": "note_completion_listening",
            "title": "Key Information",
            "notes": [
                {"index": 8, "text": "• Opening hours: __BLANK__", "answer_key": "9am to 5pm", "max_words": 3},
                {"index": 9, "text": "• Cost per person: $__BLANK__", "answer_key": "15", "max_words": 1}
            ],
            "marks": 2
        },
        "ui_component": "NoteComponent",
        "auto_grade": True,
        "grading_method": "case_insensitive_per_blank"
    },
    
    "table_completion_listening": {
        "name": "Table Completion",
        "description": "Fill in missing information in a table",
        "test_type": "listening",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "table_completion_listening"},
            "table_title": {"type": "string", "required": False},
            "headers": {"type": "array", "required": True, "description": "Column headers"},
            "rows": {"type": "array", "required": True, "description": "Table rows with blanks"},
            "marks": {"type": "integer", "required": False}
        },
        "example": {
            "index": 10,
            "type": "table_completion_listening",
            "table_title": "Weekly Schedule",
            "headers": ["Day", "Activity", "Time"],
            "rows": [
                {"index": 10, "cells": ["Monday", "__BLANK__", "9am"], "blank_position": 1, "answer_key": "Swimming"},
                {"index": 11, "cells": ["Tuesday", "Yoga", "__BLANK__"], "blank_position": 2, "answer_key": "10am"}
            ],
            "marks": 2
        },
        "ui_component": "TableComponent",
        "auto_grade": True,
        "grading_method": "case_insensitive_per_cell"
    },
    
    "flowchart_completion_listening": {
        "name": "Flowchart/Process Completion",
        "description": "Complete steps in a flowchart or process",
        "test_type": "listening",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "flowchart_completion_listening"},
            "title": {"type": "string", "required": True},
            "steps": {"type": "array", "required": True, "description": "Process steps (some blank)"},
            "marks": {"type": "integer", "required": False}
        },
        "example": {
            "index": 12,
            "type": "flowchart_completion_listening",
            "title": "Application Process",
            "steps": [
                {"index": 12, "text": "__BLANK__", "answer_key": "Submit form", "max_words": 2},
                {"text": "Interview"},
                {"index": 13, "text": "__BLANK__", "answer_key": "Medical check", "max_words": 2},
                {"text": "Final decision"}
            ],
            "marks": 2
        },
        "ui_component": "FlowchartComponent",
        "auto_grade": True,
        "grading_method": "case_insensitive_per_step"
    },
    
    "summary_completion_listening": {
        "name": "Summary Completion",
        "description": "Complete a summary paragraph",
        "test_type": "listening",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "summary_completion_listening"},
            "summary": {"type": "string", "required": True, "description": "Summary text with blanks (__14__, __15__)"},
            "blanks": {"type": "array", "required": True, "description": "Blank definitions"},
            "marks": {"type": "integer", "required": False}
        },
        "example": {
            "index": 14,
            "type": "summary_completion_listening",
            "summary": "The company was established in __14__ and now operates __15__ branches worldwide.",
            "blanks": [
                {"index": 14, "answer_key": "1985", "max_words": 1},
                {"index": 15, "answer_key": "50", "max_words": 1}
            ],
            "marks": 2
        },
        "ui_component": "SummaryComponent",
        "auto_grade": True,
        "grading_method": "case_insensitive_per_blank"
    },
    
    "sentence_completion_listening": {
        "name": "Sentence Completion",
        "description": "Complete a sentence with missing words",
        "test_type": "listening",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "sentence_completion_listening"},
            "prompt": {"type": "string", "required": True, "description": "Incomplete sentence"},
            "answer_key": {"type": "string", "required": True},
            "max_words": {"type": "integer", "required": True, "default": 2},
            "marks": {"type": "integer", "required": False, "default": 1}
        },
        "example": {
            "index": 16,
            "type": "sentence_completion_listening",
            "prompt": "The meeting will be held in the ____ room.",
            "answer_key": "conference",
            "max_words": 1,
            "marks": 1
        },
        "ui_component": "InlineTextInput",
        "auto_grade": True,
        "grading_method": "case_insensitive"
    },
    
    "short_answer_listening": {
        "name": "Short-Answer Questions",
        "description": "Answer questions with short responses",
        "test_type": "listening",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "short_answer_listening"},
            "prompt": {"type": "string", "required": True, "description": "Question text"},
            "answer_key": {"type": "string", "required": True},
            "max_words": {"type": "integer", "required": False, "default": 3},
            "marks": {"type": "integer", "required": False, "default": 1}
        },
        "example": {
            "index": 1,
            "type": "short_answer_listening",
            "prompt": "What is the job type?",
            "answer_key": "part-time",
            "max_words": 2,
            "marks": 1
        },
        "ui_component": "TextInput",
        "auto_grade": True,
        "grading_method": "case_insensitive"
    },
    
    # ============================================
    # READING QUESTION TYPES (14 types)
    # ============================================
    
    "multiple_choice_single_reading": {
        "name": "Multiple Choice (Single Answer)",
        "description": "Choose ONE correct answer",
        "test_type": "reading",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "multiple_choice_single_reading"},
            "prompt": {"type": "string", "required": True},
            "options": {"type": "array", "required": True, "min_items": 3, "max_items": 4},
            "answer_key": {"type": "string", "required": True, "pattern": "^[A-D]$"},
            "marks": {"type": "integer", "required": False, "default": 1}
        },
        "example": {
            "index": 1,
            "type": "multiple_choice_single_reading",
            "prompt": "What is the main idea of paragraph C?",
            "options": ["Economic factors", "Social issues", "Environmental concerns", "Political debates"],
            "answer_key": "A",
            "marks": 1
        },
        "ui_component": "RadioButtons",
        "auto_grade": True,
        "grading_method": "exact_match"
    },
    
    "multiple_choice_multiple_reading": {
        "name": "Multiple Choice (Multiple Answers)",
        "description": "Choose TWO or more correct answers",
        "test_type": "reading",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "multiple_choice_multiple_reading"},
            "prompt": {"type": "string", "required": True},
            "options": {"type": "array", "required": True, "min_items": 4},
            "answer_key": {"type": "array", "required": True},
            "select_count": {"type": "integer", "required": True, "min": 2},
            "marks": {"type": "integer", "required": False, "default": 1}
        },
        "example": {
            "index": 2,
            "type": "multiple_choice_multiple_reading",
            "prompt": "Which TWO statements are true according to the passage?",
            "options": ["Statement A", "Statement B", "Statement C", "Statement D"],
            "answer_key": ["B", "D"],
            "select_count": 2,
            "marks": 1
        },
        "ui_component": "Checkboxes",
        "auto_grade": True,
        "grading_method": "set_match"
    },
    
    "true_false_not_given": {
        "name": "True/False/Not Given",
        "description": "Identify if statements are True, False, or Not Given",
        "test_type": "reading",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "true_false_not_given"},
            "prompt": {"type": "string", "required": True},
            "options": {"type": "array", "required": True, "value": ["TRUE", "FALSE", "NOT GIVEN"]},
            "answer_key": {"type": "string", "required": True, "enum": ["TRUE", "FALSE", "NOT GIVEN"]},
            "marks": {"type": "integer", "required": False, "default": 1}
        },
        "example": {
            "index": 9,
            "type": "true_false_not_given",
            "prompt": "All kinds of music can enhance brain performance.",
            "options": ["TRUE", "FALSE", "NOT GIVEN"],
            "answer_key": "NOT GIVEN",
            "marks": 1
        },
        "ui_component": "ThreeButtonChoice",
        "auto_grade": True,
        "grading_method": "exact_match"
    },
    
    "yes_no_not_given": {
        "name": "Yes/No/Not Given",
        "description": "Identify if statements are Yes, No, or Not Given",
        "test_type": "reading",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "yes_no_not_given"},
            "prompt": {"type": "string", "required": True},
            "options": {"type": "array", "required": True, "value": ["YES", "NO", "NOT GIVEN"]},
            "answer_key": {"type": "string", "required": True, "enum": ["YES", "NO", "NOT GIVEN"]},
            "marks": {"type": "integer", "required": False, "default": 1}
        },
        "example": {
            "index": 10,
            "type": "yes_no_not_given",
            "prompt": "The author agrees with the theory.",
            "options": ["YES", "NO", "NOT GIVEN"],
            "answer_key": "YES",
            "marks": 1
        },
        "ui_component": "ThreeButtonChoice",
        "auto_grade": True,
        "grading_method": "exact_match"
    },
    
    "note_completion_reading": {
        "name": "Note Completion",
        "description": "Complete notes using words from passage",
        "test_type": "reading",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "note_completion_reading"},
            "title": {"type": "string", "required": True},
            "notes": {"type": "array", "required": True},
            "marks": {"type": "integer", "required": False}
        },
        "example": {
            "index": 5,
            "type": "note_completion_reading",
            "title": "Research Findings",
            "notes": [
                {"index": 5, "text": "• Main discovery: __BLANK__", "answer_key": "penicillin", "max_words": 1},
                {"index": 6, "text": "• Year: __BLANK__", "answer_key": "1928", "max_words": 1}
            ],
            "marks": 2
        },
        "ui_component": "NoteComponent",
        "auto_grade": True,
        "grading_method": "case_insensitive_per_blank"
    },
    
    "matching_headings": {
        "name": "Matching Headings",
        "description": "Match headings to paragraphs",
        "test_type": "reading",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "matching_headings"},
            "paragraph_ref": {"type": "string", "required": True, "description": "Which paragraph (A, B, C...)"},
            "headings": {"type": "array", "required": True, "description": "List of possible headings"},
            "answer_key": {"type": "string", "required": True, "description": "Roman numeral of correct heading"},
            "marks": {"type": "integer", "required": False, "default": 1}
        },
        "example": {
            "index": 1,
            "type": "matching_headings",
            "paragraph_ref": "Paragraph A",
            "headings": [
                {"key": "i", "text": "Early discoveries"},
                {"key": "ii", "text": "Modern applications"},
                {"key": "iii", "text": "Future predictions"},
                {"key": "iv", "text": "Historical context"}
            ],
            "answer_key": "iv",
            "marks": 1
        },
        "ui_component": "HeadingMatcher",
        "auto_grade": True,
        "grading_method": "exact_match"
    },
    
    "summary_completion_text": {
        "name": "Summary Completion (from Text)",
        "description": "Complete summary using words from passage",
        "test_type": "reading",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "summary_completion_text"},
            "summary": {"type": "string", "required": True},
            "blanks": {"type": "array", "required": True},
            "marks": {"type": "integer", "required": False}
        },
        "example": {
            "index": 7,
            "type": "summary_completion_text",
            "summary": "The research began in __7__ when scientists discovered __8__.",
            "blanks": [
                {"index": 7, "answer_key": "1920", "max_words": 1},
                {"index": 8, "answer_key": "antibiotics", "max_words": 1}
            ],
            "marks": 2
        },
        "ui_component": "SummaryComponent",
        "auto_grade": True,
        "grading_method": "case_insensitive_per_blank"
    },
    
    "summary_completion_list": {
        "name": "Summary Completion (from List)",
        "description": "Complete summary by selecting from word list",
        "test_type": "reading",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "summary_completion_list"},
            "summary": {"type": "string", "required": True},
            "word_list": {"type": "array", "required": True},
            "blanks": {"type": "array", "required": True},
            "marks": {"type": "integer", "required": False}
        },
        "example": {
            "index": 33,
            "type": "summary_completion_list",
            "summary": "Scientists believe our __33__ understanding is incomplete.",
            "word_list": ["initial", "current", "future", "past"],
            "blanks": [
                {"index": 33, "answer_key": "current"}
            ],
            "marks": 1
        },
        "ui_component": "SummaryWithWordList",
        "auto_grade": True,
        "grading_method": "exact_match_from_list"
    },
    
    "flowchart_completion_reading": {
        "name": "Flowchart Completion",
        "description": "Complete flowchart using words from passage",
        "test_type": "reading",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "flowchart_completion_reading"},
            "title": {"type": "string", "required": True},
            "steps": {"type": "array", "required": True},
            "marks": {"type": "integer", "required": False}
        },
        "example": {
            "index": 20,
            "type": "flowchart_completion_reading",
            "title": "Production Process",
            "steps": [
                {"text": "Raw materials collected"},
                {"index": 20, "text": "__BLANK__", "answer_key": "Quality testing", "max_words": 2},
                {"text": "Assembly"},
                {"index": 21, "text": "__BLANK__", "answer_key": "Packaging", "max_words": 1}
            ],
            "marks": 2
        },
        "ui_component": "FlowchartComponent",
        "auto_grade": True,
        "grading_method": "case_insensitive_per_step"
    },
    
    "sentence_completion_reading": {
        "name": "Sentence Completion",
        "description": "Complete sentences using words from passage",
        "test_type": "reading",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "sentence_completion_reading"},
            "prompt": {"type": "string", "required": True},
            "answer_key": {"type": "string", "required": True},
            "max_words": {"type": "integer", "required": True},
            "marks": {"type": "integer", "required": False, "default": 1}
        },
        "example": {
            "index": 6,
            "type": "sentence_completion_reading",
            "prompt": "Subjects were exposed to music for a ____ period.",
            "answer_key": "short",
            "max_words": 1,
            "marks": 1
        },
        "ui_component": "TextInput",
        "auto_grade": True,
        "grading_method": "case_insensitive"
    },
    
    "matching_sentence_endings": {
        "name": "Matching Sentence Endings",
        "description": "Match sentence beginnings to correct endings",
        "test_type": "reading",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "matching_sentence_endings"},
            "sentence_beginning": {"type": "string", "required": True},
            "endings": {"type": "array", "required": True},
            "answer_key": {"type": "string", "required": True},
            "marks": {"type": "integer", "required": False, "default": 1}
        },
        "example": {
            "index": 15,
            "type": "matching_sentence_endings",
            "sentence_beginning": "The researchers discovered that",
            "endings": [
                {"key": "A", "text": "pollution levels increased rapidly."},
                {"key": "B", "text": "the theory was incorrect."},
                {"key": "C", "text": "more funding was needed."}
            ],
            "answer_key": "A",
            "marks": 1
        },
        "ui_component": "SentenceEndingMatcher",
        "auto_grade": True,
        "grading_method": "exact_match"
    },
    
    "table_completion_reading": {
        "name": "Table Completion",
        "description": "Fill in table using information from passage",
        "test_type": "reading",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "table_completion_reading"},
            "table_title": {"type": "string", "required": False},
            "headers": {"type": "array", "required": True},
            "rows": {"type": "array", "required": True},
            "marks": {"type": "integer", "required": False}
        },
        "example": {
            "index": 25,
            "type": "table_completion_reading",
            "table_title": "Country Comparison",
            "headers": ["Country", "Population", "GDP"],
            "rows": [
                {"index": 25, "cells": ["USA", "__BLANK__", "21 trillion"], "blank_position": 1, "answer_key": "330 million", "max_words": 2},
                {"index": 26, "cells": ["China", "1.4 billion", "__BLANK__"], "blank_position": 2, "answer_key": "14 trillion", "max_words": 2}
            ],
            "marks": 2
        },
        "ui_component": "TableComponent",
        "auto_grade": True,
        "grading_method": "case_insensitive_per_cell"
    },
    
    "matching_features": {
        "name": "Matching Features",
        "description": "Match features to statements or categories",
        "test_type": "reading",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "matching_features"},
            "instructions": {"type": "string", "required": True},
            "statements": {"type": "array", "required": True},
            "features": {"type": "array", "required": True},
            "answer_key": {"type": "object", "required": True},
            "marks": {"type": "integer", "required": False}
        },
        "example": {
            "index": 30,
            "type": "matching_features",
            "instructions": "Match each researcher to their contribution",
            "statements": [
                {"id": 30, "text": "Developed the first vaccine"},
                {"id": 31, "text": "Discovered DNA structure"}
            ],
            "features": [
                {"key": "A", "text": "Louis Pasteur"},
                {"key": "B", "text": "Watson and Crick"},
                {"key": "C", "text": "Marie Curie"}
            ],
            "answer_key": {"30": "A", "31": "B"},
            "marks": 2
        },
        "ui_component": "FeatureMatcher",
        "auto_grade": True,
        "grading_method": "mapping_match"
    },
    
    "matching_paragraphs": {
        "name": "Matching Information to Paragraphs",
        "description": "Match statements to paragraphs",
        "test_type": "reading",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "matching_paragraphs"},
            "prompt": {"type": "string", "required": True},
            "options": {"type": "array", "required": True, "description": "Paragraph letters"},
            "answer_key": {"type": "string", "required": True, "pattern": "^[A-H]$"},
            "marks": {"type": "integer", "required": False, "default": 1}
        },
        "example": {
            "index": 1,
            "type": "matching_paragraphs",
            "prompt": "A description of early experiments",
            "options": ["A", "B", "C", "D", "E", "F", "G", "H"],
            "answer_key": "B",
            "marks": 1
        },
        "ui_component": "ParagraphMatcher",
        "auto_grade": True,
        "grading_method": "exact_match"
    },
    
    # ============================================
    # WRITING QUESTION TYPE (1 type)
    # ============================================
    
    "writing_task": {
        "name": "Writing Task",
        "description": "Essay or report writing with word requirement",
        "test_type": "writing",
        "structure": {
            "index": {"type": "integer", "required": True},
            "type": {"type": "string", "required": True, "value": "writing_task"},
            "instructions": {"type": "string", "required": True},
            "prompt": {"type": "string", "required": True},
            "min_words": {"type": "integer", "required": True},
            "task_number": {"type": "integer", "required": True, "enum": [1, 2]},
            "chart_image": {"type": "string", "required": False, "description": "Chart for Task 1"},
            "answer_key": {"type": "null", "required": True, "value": None},
            "marks": {"type": "integer", "required": False, "default": 1}
        },
        "example": {
            "index": 1,
            "type": "writing_task",
            "instructions": "You should spend about 20 minutes on this task.",
            "prompt": "The chart below shows milk export figures from three countries.\n\nSummarise the information by selecting and reporting the main features.",
            "chart_image": "https://example.com/chart.png",
            "min_words": 150,
            "task_number": 1,
            "answer_key": None,
            "marks": 1
        },
        "ui_component": "WritingTextarea",
        "auto_grade": False,
        "grading_method": "manual_only"
    }
}


# ============================================
# TYPE DETECTION FUNCTION
# ============================================

def detect_question_type(question_data: Dict[str, Any]) -> Optional[str]:
    """
    Automatically detect question type from JSON structure
    
    Args:
        question_data: Dictionary containing question data
        
    Returns:
        String of detected question type or None if unable to detect
    """
    
    # If type is explicitly provided, validate and return it
    if "type" in question_data:
        explicit_type = question_data["type"]
        if explicit_type in QUESTION_TYPE_SCHEMAS:
            return explicit_type
    
    # Auto-detect based on structure
    scores = {}
    
    for type_name, rules in TYPE_DETECTION_RULES.items():
        score = 0
        
        # Check required fields
        required_fields = rules.get("required_fields", [])
        if all(field in question_data for field in required_fields):
            score += 10
        else:
            continue  # Skip if required fields missing
        
        # Check field types
        field_types = rules.get("field_types", {})
        for field, expected_type in field_types.items():
            if field in question_data:
                if isinstance(question_data[field], expected_type):
                    score += 5
        
        # Check indicators
        indicators = rules.get("indicators", {})
        for indicator, condition in indicators.items():
            if callable(condition):
                if indicator in question_data and condition(question_data[indicator]):
                    score += 3
            elif isinstance(condition, bool):
                if (indicator in question_data) == condition:
                    score += 3
            elif isinstance(condition, list):
                if indicator in question_data and question_data[indicator] in condition:
                    score += 3
        
        scores[type_name] = score
    
    # Return type with highest score
    if scores:
        best_match = max(scores.items(), key=lambda x: x[1])
        if best_match[1] >= 10:  # Minimum threshold
            return best_match[0]
    
    return None


def validate_question_structure(question_data: Dict[str, Any], question_type: str) -> tuple[bool, List[str]]:
    """
    Validate question data against schema for given type
    
    Args:
        question_data: Dictionary containing question data
        question_type: The question type to validate against
        
    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    if question_type not in QUESTION_TYPE_SCHEMAS:
        return False, [f"Unknown question type: {question_type}"]
    
    schema = QUESTION_TYPE_SCHEMAS[question_type]["structure"]
    errors = []
    
    for field_name, field_def in schema.items():
        # Check required fields
        if field_def.get("required", False):
            if field_name not in question_data:
                errors.append(f"Missing required field: {field_name}")
                continue
        
        # Check field types
        if field_name in question_data:
            value = question_data[field_name]
            expected_type = field_def.get("type")
            
            # Type validation
            type_map = {
                "string": str,
                "integer": int,
                "array": list,
                "object": dict,
                "null": type(None)
            }
            
            if expected_type in type_map:
                if not isinstance(value, type_map[expected_type]):
                    errors.append(f"Field '{field_name}' must be of type {expected_type}")
    
    return len(errors) == 0, errors


def get_ui_component(question_type: str) -> str:
    """Get the UI component name for a question type"""
    if question_type in QUESTION_TYPE_SCHEMAS:
        return QUESTION_TYPE_SCHEMAS[question_type].get("ui_component", "DefaultComponent")
    return "DefaultComponent"


def get_grading_method(question_type: str) -> str:
    """Get the grading method for a question type"""
    if question_type in QUESTION_TYPE_SCHEMAS:
        return QUESTION_TYPE_SCHEMAS[question_type].get("grading_method", "exact_match")
    return "exact_match"


def is_auto_gradable(question_type: str) -> bool:
    """Check if a question type can be auto-graded"""
    if question_type in QUESTION_TYPE_SCHEMAS:
        return QUESTION_TYPE_SCHEMAS[question_type].get("auto_grade", False)
    return False
