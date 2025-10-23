"""
Unit Tests for Question Validation API Endpoints
Tests all API endpoints for question detection, validation, and reporting
"""

import pytest
import sys
import os
import json
from fastapi.testclient import TestClient

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Create a minimal FastAPI app for testing
from fastapi import FastAPI
from question_validation_routes import get_router

app = FastAPI()
app.include_router(get_router())

client = TestClient(app)


class TestDetectTypeEndpoint:
    """Test cases for /api/questions/detect-type endpoint"""
    
    def test_detect_listening_multiple_choice(self):
        """Test detecting listening multiple choice question"""
        payload = {
            "question_data": {
                "prompt": "Listen and choose the correct answer",
                "audio_url": "audio/test.ogg",
                "options": [
                    {"text": "A", "value": "A"},
                    {"text": "B", "value": "B"},
                ],
                "answer_key": "A"
            },
            "question_id": "Q001"
        }
        
        response = client.post("/api/questions/detect-type", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data['question_id'] == 'Q001'
        assert 'listening' in data['detected_type']
        assert 0 <= data['confidence'] <= 1
        assert data['confidence_level'] in ['HIGH', 'MEDIUM', 'LOW']
    
    def test_detect_reading_multiple_choice(self):
        """Test detecting reading multiple choice question"""
        payload = {
            "question_data": {
                "prompt": "Which of the following is correct?",
                "options": [
                    {"text": "A", "value": "A"},
                    {"text": "B", "value": "B"},
                    {"text": "C", "value": "C"},
                ],
                "answer_key": "A"
            },
            "question_id": "Q002"
        }
        
        response = client.post("/api/questions/detect-type", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert 'reading' in data['detected_type']
    
    def test_detect_writing_question(self):
        """Test detecting writing question"""
        payload = {
            "question_data": {
                "prompt": "Write an essay",
                "min_words": 250,
                "max_words": 400,
                "answer_key": "essay"
            },
            "question_id": "Q003"
        }
        
        response = client.post("/api/questions/detect-type", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert 'writing' in data['detected_type']
    
    def test_detect_type_includes_all_methods(self):
        """Test that response includes all detection methods"""
        payload = {
            "question_data": {
                "prompt": "Listen and choose",
                "audio_url": "audio/test.ogg",
                "options": [
                    {"text": "A", "value": "A"},
                    {"text": "B", "value": "B"},
                ],
                "answer_key": "A"
            }
        }
        
        response = client.post("/api/questions/detect-type", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert 'all_methods' in data
        assert isinstance(data['all_methods'], dict)


class TestValidateEndpoint:
    """Test cases for /api/questions/validate endpoint"""
    
    def test_validate_valid_question(self):
        """Test validating a valid question"""
        payload = {
            "question_data": {
                "prompt": "Which is correct?",
                "options": [
                    {"text": "A", "value": "A"},
                    {"text": "B", "value": "B"},
                ],
                "answer_key": "A"
            },
            "question_id": "Q001"
        }
        
        response = client.post("/api/questions/validate", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data['is_valid'] == True
        assert data['question_id'] == 'Q001'
        assert len(data['errors']) == 0
    
    def test_validate_invalid_question(self):
        """Test validating an invalid question"""
        payload = {
            "question_data": {
                "answer_key": "A"
            },
            "question_id": "Q002"
        }
        
        response = client.post("/api/questions/validate", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data['is_valid'] == False
        assert len(data['errors']) > 0
    
    def test_validate_with_warnings(self):
        """Test validating question with warnings"""
        payload = {
            "question_data": {
                "prompt": "Which is correct?",
                "options": [
                    {"text": "A", "value": "A"},
                    {"text": "B", "value": "B"},
                ],
                "answer_key": "C"  # Not in options
            },
            "question_id": "Q003"
        }
        
        response = client.post("/api/questions/validate", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data['is_valid'] == True
        assert len(data['warnings']) > 0
    
    def test_validate_auto_detects_type(self):
        """Test that validation auto-detects question type"""
        payload = {
            "question_data": {
                "prompt": "Listen and choose",
                "audio_url": "audio/test.ogg",
                "options": [
                    {"text": "A", "value": "A"},
                    {"text": "B", "value": "B"},
                ],
                "answer_key": "A"
            }
        }
        
        response = client.post("/api/questions/validate", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data['detected_type'] is not None
        assert 'listening' in data['detected_type']
    
    def test_validate_includes_summary(self):
        """Test that validation response includes summary"""
        payload = {
            "question_data": {
                "prompt": "Which is correct?",
                "options": [
                    {"text": "A", "value": "A"},
                    {"text": "B", "value": "B"},
                ],
                "answer_key": "A"
            }
        }
        
        response = client.post("/api/questions/validate", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert 'summary' in data
        assert 'critical_count' in data['summary']
        assert 'high_count' in data['summary']


class TestValidationReportEndpoint:
    """Test cases for /api/questions/validation-report endpoint"""
    
    def test_get_validation_report(self):
        """Test getting validation report"""
        # First validate a question
        payload = {
            "question_data": {
                "prompt": "Which is correct?",
                "options": [
                    {"text": "A", "value": "A"},
                    {"text": "B", "value": "B"},
                ],
                "answer_key": "A"
            },
            "question_id": "Q001"
        }
        client.post("/api/questions/validate", json=payload)
        
        # Then get the report
        response = client.get("/api/questions/validation-report")
        
        assert response.status_code == 200
        data = response.json()
        assert 'total_questions' in data
        assert 'valid_count' in data
        assert 'invalid_count' in data
    
    def test_get_report_by_question_id(self):
        """Test getting report filtered by question ID"""
        # First validate a question
        payload = {
            "question_data": {
                "prompt": "Which is correct?",
                "options": [
                    {"text": "A", "value": "A"},
                    {"text": "B", "value": "B"},
                ],
                "answer_key": "A"
            },
            "question_id": "Q_SPECIFIC"
        }
        client.post("/api/questions/validate", json=payload)
        
        # Then get the report for that question
        response = client.get("/api/questions/validation-report?question_id=Q_SPECIFIC")
        
        assert response.status_code == 200
        data = response.json()
        assert data['total_questions'] == 1
    
    def test_get_report_nonexistent_question(self):
        """Test getting report for nonexistent question"""
        response = client.get("/api/questions/validation-report?question_id=NONEXISTENT")
        
        assert response.status_code == 404


class TestExportReportEndpoint:
    """Test cases for /api/questions/export-report endpoint"""
    
    def test_export_report_as_json(self):
        """Test exporting report as JSON"""
        # First validate a question
        payload = {
            "question_data": {
                "prompt": "Which is correct?",
                "options": [
                    {"text": "A", "value": "A"},
                    {"text": "B", "value": "B"},
                ],
                "answer_key": "A"
            },
            "question_id": "Q_JSON"
        }
        client.post("/api/questions/validate", json=payload)
        
        # Then export as JSON
        response = client.post("/api/questions/export-report?question_id=Q_JSON&format=json")
        
        assert response.status_code == 200
        data = response.json()
        assert 'report' in data
        # Should be valid JSON string
        json.loads(data['report'])
    
    def test_export_report_as_text(self):
        """Test exporting report as text"""
        # First validate a question
        payload = {
            "question_data": {
                "prompt": "Which is correct?",
                "options": [
                    {"text": "A", "value": "A"},
                    {"text": "B", "value": "B"},
                ],
                "answer_key": "A"
            },
            "question_id": "Q_TEXT"
        }
        client.post("/api/questions/validate", json=payload)
        
        # Then export as text
        response = client.post("/api/questions/export-report?question_id=Q_TEXT&format=text")
        
        assert response.status_code == 200
        data = response.json()
        assert 'report' in data
        assert 'ERROR REPORT' in data['report']
    
    def test_export_report_invalid_format(self):
        """Test exporting report with invalid format"""
        response = client.post("/api/questions/export-report?question_id=Q001&format=invalid")
        
        assert response.status_code == 400


if __name__ == '__main__':
    pytest.main([__file__, '-v'])

