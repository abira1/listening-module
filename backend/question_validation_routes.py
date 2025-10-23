"""
Question Validation API Routes
Endpoints for question type detection, validation, and error reporting
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import logging
import sys
import os

# Add services to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'services'))

from services.question_type_detector import QuestionTypeDetector
from services.validation_service import ValidationService
from services.error_reporter import ErrorReporter

logger = logging.getLogger(__name__)

# Initialize services
detector = QuestionTypeDetector()
validator = ValidationService()
reporter = ErrorReporter()

router = APIRouter(prefix="/api/questions", tags=["question-validation"])


# Request/Response Models
class DetectTypeRequest(BaseModel):
    """Request model for type detection"""
    question_data: Dict[str, Any] = Field(..., description="Question JSON data")
    question_id: Optional[str] = Field(None, description="Optional question identifier")


class DetectTypeResponse(BaseModel):
    """Response model for type detection"""
    question_id: Optional[str]
    detected_type: str
    confidence: float
    confidence_level: str
    all_methods: Dict[str, Any]
    timestamp: str


class ValidateQuestionRequest(BaseModel):
    """Request model for question validation"""
    question_data: Dict[str, Any] = Field(..., description="Question JSON data")
    question_type: Optional[str] = Field(None, description="Question type (auto-detected if not provided)")
    question_id: Optional[str] = Field(None, description="Optional question identifier")
    asset_path: Optional[str] = Field(None, description="Path to assets directory")


class ValidationError(BaseModel):
    """Validation error model"""
    field: str
    message: str
    severity: str
    fix: str
    example: Optional[str] = None


class ValidateQuestionResponse(BaseModel):
    """Response model for question validation"""
    question_id: Optional[str]
    is_valid: bool
    detected_type: Optional[str]
    errors: List[ValidationError]
    warnings: List[ValidationError]
    summary: Dict[str, Any]
    deployment_ready: bool
    timestamp: str


class ValidationReportResponse(BaseModel):
    """Response model for validation report"""
    total_questions: int
    valid_count: int
    invalid_count: int
    deployment_ready_count: int
    critical_errors: int
    high_errors: int
    medium_warnings: int
    low_warnings: int
    reports: List[Dict[str, Any]]


# Endpoints

@router.post("/detect-type", response_model=DetectTypeResponse)
async def detect_question_type(request: DetectTypeRequest):
    """
    Detect the type of a question using AI-powered multi-method voting

    Args:
        request: DetectTypeRequest with question_data

    Returns:
        DetectTypeResponse with detected type and confidence
    """
    try:
        from datetime import datetime

        result = detector.detect_type(request.question_data)

        # Format all methods results
        all_methods = {}
        for method_result in result.get('all_results', []):
            method_name = method_result.get('method', 'unknown')
            all_methods[method_name] = {
                'type': method_result.get('type'),
                'confidence': method_result.get('confidence')
            }

        return DetectTypeResponse(
            question_id=request.question_id,
            detected_type=result['detected_type'],
            confidence=result['confidence'],
            confidence_level=result['confidence_level'],
            all_methods=all_methods,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        logger.error(f"Error detecting question type: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error detecting question type: {str(e)}")


@router.post("/validate", response_model=ValidateQuestionResponse)
async def validate_question(request: ValidateQuestionRequest):
    """
    Validate a question using 4-layer validation system

    Args:
        request: ValidateQuestionRequest with question_data

    Returns:
        ValidateQuestionResponse with validation results
    """
    try:
        from datetime import datetime

        # Auto-detect type if not provided
        question_type = request.question_type
        if not question_type:
            detection_result = detector.detect_type(request.question_data)
            question_type = detection_result['detected_type']
        
        # Validate question
        validation_result = validator.validate_question(
            request.question_data,
            question_type,
            request.asset_path
        )

        # Generate error report
        reporter.generate_report(validation_result, request.question_id, request.question_data)

        # Format errors and warnings
        errors = [
            ValidationError(
                field=e['field'],
                message=e['message'],
                severity=e['severity'],
                fix=e['fix'],
                example=e.get('example')
            )
            for e in validation_result['errors']
        ]

        warnings = [
            ValidationError(
                field=w['field'],
                message=w['message'],
                severity=w['severity'],
                fix=w['fix'],
                example=w.get('example')
            )
            for w in validation_result['warnings']
        ]

        return ValidateQuestionResponse(
            question_id=request.question_id,
            is_valid=validation_result['is_valid'],
            detected_type=question_type,
            errors=errors,
            warnings=warnings,
            summary=validation_result['summary'],
            deployment_ready=validation_result['summary'].get('can_deploy', False),
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        logger.error(f"Error validating question: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error validating question: {str(e)}")


@router.get("/validation-report")
async def get_validation_report(
    question_id: Optional[str] = Query(None, description="Filter by question ID")
):
    """
    Get validation report for questions
    
    Args:
        question_id: Optional question ID to filter by
        
    Returns:
        ValidationReportResponse with report summary
    """
    try:
        all_reports = reporter.get_all_reports()
        
        if question_id:
            report = reporter.get_report_by_id(question_id)
            if not report:
                raise HTTPException(status_code=404, detail=f"Report not found for question {question_id}")
            all_reports = [report]
        
        # Calculate summary
        valid_count = sum(1 for r in all_reports if r['is_valid'])
        invalid_count = len(all_reports) - valid_count
        deployment_ready_count = sum(1 for r in all_reports if r['deployment_ready'])
        
        critical_errors = sum(r['summary'].get('critical_count', 0) for r in all_reports)
        high_errors = sum(r['summary'].get('high_count', 0) for r in all_reports)
        medium_warnings = sum(r['summary'].get('medium_count', 0) for r in all_reports)
        low_warnings = sum(r['summary'].get('low_count', 0) for r in all_reports)
        
        return ValidationReportResponse(
            total_questions=len(all_reports),
            valid_count=valid_count,
            invalid_count=invalid_count,
            deployment_ready_count=deployment_ready_count,
            critical_errors=critical_errors,
            high_errors=high_errors,
            medium_warnings=medium_warnings,
            low_warnings=low_warnings,
            reports=all_reports
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting validation report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting validation report: {str(e)}")


@router.post("/export-report")
async def export_report(
    question_id: str = Query(..., description="Question ID to export"),
    format: str = Query("json", description="Export format: json or text")
):
    """
    Export validation report in specified format
    
    Args:
        question_id: Question ID to export
        format: Export format (json or text)
        
    Returns:
        Exported report as string
    """
    try:
        report = reporter.get_report_by_id(question_id)
        if not report:
            raise HTTPException(status_code=404, detail=f"Report not found for question {question_id}")
        
        if format == "json":
            return {"report": reporter.export_report_json(report)}
        elif format == "text":
            return {"report": reporter.export_report_text(report)}
        else:
            raise HTTPException(status_code=400, detail="Invalid format. Use 'json' or 'text'")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error exporting report: {str(e)}")


def get_router():
    """Get the router for mounting in main app"""
    return router

