"""
HTML Question Routes
API endpoints for creating and managing HTML-based questions
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Dict, Any, Optional
import json
from html_question_service import html_question_service

router = APIRouter(prefix="/api/html-questions", tags=["html-questions"])

class HtmlQuestionCreate(BaseModel):
    """Model for creating HTML questions"""
    track_id: str
    section_id: str
    html_content: str
    answer_extraction: Dict[str, Any]
    grading_rules: Dict[str, Any]
    question_number: Optional[int] = 1
    marks: Optional[int] = 1
    difficulty: Optional[str] = "medium"
    text: Optional[str] = ""

class HtmlQuestionUpload(BaseModel):
    """Model for uploading HTML questions as JSON"""
    track_id: str
    section_id: str
    questions: list  # List of question objects

@router.post("/create")
async def create_html_question(question_data: HtmlQuestionCreate):
    """
    Create a new HTML-based question
    
    Request body:
    {
        "track_id": "track-123",
        "section_id": "section-456",
        "html_content": "<div>...</div>",
        "answer_extraction": {
            "method": "radio_button",
            "selector": "input[name='answer']:checked",
            "value_extractor": "value"
        },
        "grading_rules": {
            "method": "exact_match",
            "correct_answers": ["A"],
            "points": 1
        },
        "question_number": 1,
        "marks": 1,
        "difficulty": "medium"
    }
    """
    try:
        result = html_question_service.create_html_question(
            track_id=question_data.track_id,
            section_id=question_data.section_id,
            question_data=question_data.dict()
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-json")
async def upload_html_questions_json(upload_data: HtmlQuestionUpload):
    """
    Upload multiple HTML questions from JSON
    
    Request body:
    {
        "track_id": "track-123",
        "section_id": "section-456",
        "questions": [
            {
                "html_content": "...",
                "answer_extraction": {...},
                "grading_rules": {...}
            },
            ...
        ]
    }
    """
    try:
        results = []
        
        for idx, question_data in enumerate(upload_data.questions):
            question_data['track_id'] = upload_data.track_id
            question_data['section_id'] = upload_data.section_id
            question_data['question_number'] = idx + 1
            
            result = html_question_service.create_html_question(
                track_id=upload_data.track_id,
                section_id=upload_data.section_id,
                question_data=question_data
            )
            
            results.append(result)
        
        # Check if all succeeded
        failed = [r for r in results if not r.get('success', False)]
        
        if failed:
            return {
                'success': False,
                'total': len(results),
                'succeeded': len(results) - len(failed),
                'failed': len(failed),
                'errors': failed
            }
        
        return {
            'success': True,
            'total': len(results),
            'succeeded': len(results),
            'failed': 0,
            'questions': [r.get('question_id') for r in results]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{question_id}")
async def get_html_question(question_id: str):
    """Get HTML question by ID"""
    try:
        question = html_question_service.get_html_question(question_id)
        
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        return {
            'success': True,
            'question': question
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/validate")
async def validate_html_question(question_data: HtmlQuestionCreate):
    """
    Validate HTML question without creating it
    
    Returns validation errors if any
    """
    try:
        errors = []
        
        # Validate HTML
        is_valid, error = html_question_service.validate_html_content(
            question_data.html_content
        )
        if not is_valid:
            errors.append(f"HTML validation: {error}")
        
        # Validate answer extraction
        is_valid, error = html_question_service.validate_answer_extraction(
            question_data.answer_extraction
        )
        if not is_valid:
            errors.append(f"Answer extraction validation: {error}")
        
        # Validate grading rules
        is_valid, error = html_question_service.validate_grading_rules(
            question_data.grading_rules
        )
        if not is_valid:
            errors.append(f"Grading rules validation: {error}")
        
        if errors:
            return {
                'success': False,
                'valid': False,
                'errors': errors
            }
        
        return {
            'success': True,
            'valid': True,
            'message': 'Question is valid'
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

