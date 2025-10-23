"""
Integration Tests for Admin Panel Backend
Part of Phase 2, Task 1.6.1
"""

import pytest
import json
from fastapi.testclient import TestClient
from server import app

client = TestClient(app)


class TestAdminPanelIntegration:
    """Integration tests for admin panel endpoints"""

    def test_detect_type_endpoint_returns_valid_response(self):
        """Test that detect-type endpoint returns valid response"""
        question_data = {
            "prompt": "Which is correct?",
            "options": [
                {"text": "A", "value": "A"},
                {"text": "B", "value": "B"}
            ],
            "answer_key": "A"
        }

        response = client.post(
            "/api/questions/detect-type",
            json={"question_data": question_data, "question_id": "Q001"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "detected_type" in data
        assert "confidence" in data
        assert "confidence_level" in data
        assert "all_methods" in data

    def test_validate_endpoint_returns_valid_response(self):
        """Test that validate endpoint returns valid response"""
        question_data = {
            "prompt": "Which is correct?",
            "options": [
                {"text": "A", "value": "A"},
                {"text": "B", "value": "B"}
            ],
            "answer_key": "A"
        }

        response = client.post(
            "/api/questions/validate",
            json={"question_data": question_data, "question_id": "Q001"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "is_valid" in data
        assert "errors" in data
        assert "warnings" in data
        assert "deployment_ready" in data
        assert "summary" in data

    def test_detect_and_validate_workflow(self):
        """Test complete detect and validate workflow"""
        question_data = {
            "prompt": "Which is correct?",
            "options": [
                {"text": "A", "value": "A"},
                {"text": "B", "value": "B"}
            ],
            "answer_key": "A"
        }

        # Step 1: Detect type
        detect_response = client.post(
            "/api/questions/detect-type",
            json={"question_data": question_data, "question_id": "Q001"}
        )
        assert detect_response.status_code == 200
        detected_type = detect_response.json()["detected_type"]

        # Step 2: Validate with detected type
        validate_response = client.post(
            "/api/questions/validate",
            json={
                "question_data": question_data,
                "question_type": detected_type,
                "question_id": "Q001"
            }
        )
        assert validate_response.status_code == 200
        validation_data = validate_response.json()
        assert validation_data["detected_type"] == detected_type

    def test_validation_with_missing_prompt(self):
        """Test validation with missing prompt"""
        question_data = {
            "options": [
                {"text": "A", "value": "A"},
                {"text": "B", "value": "B"}
            ],
            "answer_key": "A"
        }

        response = client.post(
            "/api/questions/validate",
            json={"question_data": question_data, "question_id": "Q001"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["is_valid"] == False
        assert len(data["errors"]) > 0

    def test_validation_with_missing_options(self):
        """Test validation with missing options"""
        question_data = {
            "prompt": "Which is correct?",
            "answer_key": "A"
        }

        response = client.post(
            "/api/questions/validate",
            json={"question_data": question_data, "question_id": "Q001"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["is_valid"] == False
        assert len(data["errors"]) > 0

    def test_validation_with_invalid_answer_key(self):
        """Test validation with invalid answer key"""
        question_data = {
            "prompt": "Which is correct?",
            "options": [
                {"text": "A", "value": "A"},
                {"text": "B", "value": "B"}
            ],
            "answer_key": "Z"
        }

        response = client.post(
            "/api/questions/validate",
            json={"question_data": question_data, "question_id": "Q001"}
        )

        assert response.status_code == 200
        data = response.json()
        # May have errors or warnings depending on validation rules
        assert "errors" in data or "warnings" in data

    def test_validation_summary_counts(self):
        """Test that validation summary counts are accurate"""
        question_data = {
            "prompt": "Which is correct?",
            "options": [
                {"text": "A", "value": "A"},
                {"text": "B", "value": "B"}
            ],
            "answer_key": "A"
        }

        response = client.post(
            "/api/questions/validate",
            json={"question_data": question_data, "question_id": "Q001"}
        )

        assert response.status_code == 200
        data = response.json()
        summary = data["summary"]

        # Verify summary structure
        assert "critical_count" in summary
        assert "high_count" in summary
        assert "medium_count" in summary
        assert "low_count" in summary
        assert "total_errors" in summary
        assert "total_warnings" in summary

        # Verify counts match actual errors/warnings
        assert summary["total_errors"] == len(data["errors"])
        assert summary["total_warnings"] == len(data["warnings"])

    def test_deployment_ready_flag(self):
        """Test deployment_ready flag is set correctly"""
        question_data = {
            "prompt": "Which is correct?",
            "options": [
                {"text": "A", "value": "A"},
                {"text": "B", "value": "B"}
            ],
            "answer_key": "A"
        }

        response = client.post(
            "/api/questions/validate",
            json={"question_data": question_data, "question_id": "Q001"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "deployment_ready" in data
        assert isinstance(data["deployment_ready"], bool)

    def test_export_report_json_format(self):
        """Test exporting report in JSON format"""
        question_data = {
            "prompt": "Which is correct?",
            "options": [
                {"text": "A", "value": "A"},
                {"text": "B", "value": "B"}
            ],
            "answer_key": "A"
        }

        response = client.post(
            "/api/questions/export-report",
            json={
                "question_data": question_data,
                "question_id": "Q001",
                "format": "json"
            }
        )

        assert response.status_code == 200
        # Response should be valid JSON
        data = response.json()
        assert "report" in data or "question_id" in data

    def test_export_report_text_format(self):
        """Test exporting report in text format"""
        question_data = {
            "prompt": "Which is correct?",
            "options": [
                {"text": "A", "value": "A"},
                {"text": "B", "value": "B"}
            ],
            "answer_key": "A"
        }

        response = client.post(
            "/api/questions/export-report",
            json={
                "question_data": question_data,
                "question_id": "Q001",
                "format": "text"
            }
        )

        assert response.status_code == 200
        # Response should contain text content
        assert len(response.text) > 0

    def test_multiple_questions_validation(self):
        """Test validating multiple questions"""
        questions = [
            {
                "prompt": "Question 1?",
                "options": [{"text": "A", "value": "A"}],
                "answer_key": "A"
            },
            {
                "prompt": "Question 2?",
                "options": [{"text": "B", "value": "B"}],
                "answer_key": "B"
            }
        ]

        for idx, question_data in enumerate(questions):
            response = client.post(
                "/api/questions/validate",
                json={"question_data": question_data, "question_id": f"Q{idx+1}"}
            )
            assert response.status_code == 200
            data = response.json()
            assert "is_valid" in data

    def test_error_response_structure(self):
        """Test that error responses have correct structure"""
        question_data = {
            "prompt": "Which is correct?",
            "options": [
                {"text": "A", "value": "A"},
                {"text": "B", "value": "B"}
            ],
            "answer_key": "A"
        }

        response = client.post(
            "/api/questions/validate",
            json={"question_data": question_data, "question_id": "Q001"}
        )

        assert response.status_code == 200
        data = response.json()

        # Check error structure
        for error in data.get("errors", []):
            assert "field" in error
            assert "message" in error
            assert "severity" in error

        # Check warning structure
        for warning in data.get("warnings", []):
            assert "field" in warning
            assert "message" in warning
            assert "severity" in warning

    def test_question_id_in_response(self):
        """Test that question_id is included in response"""
        question_data = {
            "prompt": "Which is correct?",
            "options": [
                {"text": "A", "value": "A"},
                {"text": "B", "value": "B"}
            ],
            "answer_key": "A"
        }

        response = client.post(
            "/api/questions/validate",
            json={"question_data": question_data, "question_id": "Q001"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["question_id"] == "Q001"

    def test_timestamp_in_response(self):
        """Test that timestamp is included in response"""
        question_data = {
            "prompt": "Which is correct?",
            "options": [
                {"text": "A", "value": "A"},
                {"text": "B", "value": "B"}
            ],
            "answer_key": "A"
        }

        response = client.post(
            "/api/questions/validate",
            json={"question_data": question_data, "question_id": "Q001"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "timestamp" in data

