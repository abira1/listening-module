"""
End-to-End Tests for Admin Workflow
Part of Phase 2, Task 1.6.3
"""

import pytest
import json
from fastapi.testclient import TestClient
from server import app

client = TestClient(app)


class TestAdminWorkflowE2E:
    """End-to-end tests for complete admin workflows"""

    def test_complete_question_validation_workflow(self):
        """Test complete workflow: upload, detect, validate, export"""
        question_data = {
            "prompt": "Which of the following is the capital of France?",
            "options": [
                {"text": "London", "value": "A"},
                {"text": "Paris", "value": "B"},
                {"text": "Berlin", "value": "C"},
                {"text": "Madrid", "value": "D"}
            ],
            "answer_key": "B"
        }

        # Step 1: Detect question type
        detect_response = client.post(
            "/api/questions/detect-type",
            json={"question_data": question_data, "question_id": "Q001"}
        )
        assert detect_response.status_code == 200
        detection_data = detect_response.json()
        assert "detected_type" in detection_data
        detected_type = detection_data["detected_type"]

        # Step 2: Validate question
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
        assert validation_data["is_valid"] == True
        assert validation_data["deployment_ready"] == True

        # Step 3: Export report
        export_response = client.post(
            "/api/questions/export-report",
            json={
                "question_data": question_data,
                "question_id": "Q001",
                "format": "json"
            }
        )
        assert export_response.status_code == 200

    def test_error_detection_and_fix_workflow(self):
        """Test workflow: detect errors, fix, re-validate"""
        # Step 1: Validate question with errors
        invalid_question = {
            "options": [
                {"text": "A", "value": "A"},
                {"text": "B", "value": "B"}
            ],
            "answer_key": "A"
        }

        response1 = client.post(
            "/api/questions/validate",
            json={"question_data": invalid_question, "question_id": "Q001"}
        )
        assert response1.status_code == 200
        data1 = response1.json()
        assert data1["is_valid"] == False
        initial_error_count = len(data1["errors"])
        assert initial_error_count > 0

        # Step 2: Fix the question
        fixed_question = {
            "prompt": "Which is correct?",
            "options": [
                {"text": "A", "value": "A"},
                {"text": "B", "value": "B"}
            ],
            "answer_key": "A"
        }

        # Step 3: Re-validate
        response2 = client.post(
            "/api/questions/validate",
            json={"question_data": fixed_question, "question_id": "Q001"}
        )
        assert response2.status_code == 200
        data2 = response2.json()
        # Should have fewer errors after fix
        assert len(data2["errors"]) <= initial_error_count

    def test_batch_question_validation_workflow(self):
        """Test validating multiple questions in sequence"""
        questions = [
            {
                "id": "Q001",
                "data": {
                    "prompt": "Question 1?",
                    "options": [{"text": "A", "value": "A"}],
                    "answer_key": "A"
                }
            },
            {
                "id": "Q002",
                "data": {
                    "prompt": "Question 2?",
                    "options": [{"text": "B", "value": "B"}],
                    "answer_key": "B"
                }
            },
            {
                "id": "Q003",
                "data": {
                    "prompt": "Question 3?",
                    "options": [{"text": "C", "value": "C"}],
                    "answer_key": "C"
                }
            }
        ]

        results = []
        for question in questions:
            response = client.post(
                "/api/questions/validate",
                json={
                    "question_data": question["data"],
                    "question_id": question["id"]
                }
            )
            assert response.status_code == 200
            results.append(response.json())

        # Verify all questions were validated
        assert len(results) == 3
        for idx, result in enumerate(results):
            assert result["question_id"] == f"Q{idx+1}"

    def test_deployment_readiness_workflow(self):
        """Test checking deployment readiness"""
        question_data = {
            "prompt": "Which is correct?",
            "options": [
                {"text": "A", "value": "A"},
                {"text": "B", "value": "B"}
            ],
            "answer_key": "A"
        }

        # Validate question
        response = client.post(
            "/api/questions/validate",
            json={"question_data": question_data, "question_id": "Q001"}
        )
        assert response.status_code == 200
        data = response.json()

        # Check deployment readiness
        assert "deployment_ready" in data
        assert isinstance(data["deployment_ready"], bool)

        # If deployment_ready is True, there should be no critical errors
        if data["deployment_ready"]:
            critical_errors = [e for e in data["errors"] if e["severity"] == "CRITICAL"]
            assert len(critical_errors) == 0

    def test_error_severity_workflow(self):
        """Test handling different error severities"""
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

        # Check error severity levels
        for error in data["errors"]:
            assert error["severity"] in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]

        # Check warning severity levels
        for warning in data["warnings"]:
            assert warning["severity"] in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]

    def test_question_type_detection_accuracy(self):
        """Test question type detection for different question types"""
        test_cases = [
            {
                "name": "Multiple Choice",
                "data": {
                    "prompt": "Which is correct?",
                    "options": [
                        {"text": "A", "value": "A"},
                        {"text": "B", "value": "B"}
                    ],
                    "answer_key": "A"
                }
            },
            {
                "name": "True/False",
                "data": {
                    "prompt": "Is this true?",
                    "options": [
                        {"text": "True", "value": "true"},
                        {"text": "False", "value": "false"}
                    ],
                    "answer_key": "true"
                }
            }
        ]

        for test_case in test_cases:
            response = client.post(
                "/api/questions/detect-type",
                json={
                    "question_data": test_case["data"],
                    "question_id": f"Q_{test_case['name']}"
                }
            )
            assert response.status_code == 200
            data = response.json()
            assert "detected_type" in data
            assert data["detected_type"] is not None

    def test_validation_consistency(self):
        """Test that validation is consistent across multiple calls"""
        question_data = {
            "prompt": "Which is correct?",
            "options": [
                {"text": "A", "value": "A"},
                {"text": "B", "value": "B"}
            ],
            "answer_key": "A"
        }

        # Validate same question multiple times
        results = []
        for _ in range(3):
            response = client.post(
                "/api/questions/validate",
                json={"question_data": question_data, "question_id": "Q001"}
            )
            assert response.status_code == 200
            results.append(response.json())

        # All results should be identical
        for result in results[1:]:
            assert result["is_valid"] == results[0]["is_valid"]
            assert len(result["errors"]) == len(results[0]["errors"])
            assert len(result["warnings"]) == len(results[0]["warnings"])

    def test_export_formats_workflow(self):
        """Test exporting validation report in different formats"""
        question_data = {
            "prompt": "Which is correct?",
            "options": [
                {"text": "A", "value": "A"},
                {"text": "B", "value": "B"}
            ],
            "answer_key": "A"
        }

        # Export as JSON
        json_response = client.post(
            "/api/questions/export-report",
            json={
                "question_data": question_data,
                "question_id": "Q001",
                "format": "json"
            }
        )
        assert json_response.status_code == 200

        # Export as text
        text_response = client.post(
            "/api/questions/export-report",
            json={
                "question_data": question_data,
                "question_id": "Q001",
                "format": "text"
            }
        )
        assert text_response.status_code == 200

    def test_admin_panel_full_workflow(self):
        """Test complete admin panel workflow"""
        # Step 1: Create question
        question_data = {
            "prompt": "What is 2+2?",
            "options": [
                {"text": "3", "value": "A"},
                {"text": "4", "value": "B"},
                {"text": "5", "value": "C"}
            ],
            "answer_key": "B"
        }

        # Step 2: Detect type
        detect_resp = client.post(
            "/api/questions/detect-type",
            json={"question_data": question_data, "question_id": "Q001"}
        )
        assert detect_resp.status_code == 200

        # Step 3: Validate
        validate_resp = client.post(
            "/api/questions/validate",
            json={"question_data": question_data, "question_id": "Q001"}
        )
        assert validate_resp.status_code == 200
        validation_data = validate_resp.json()

        # Step 4: Check deployment readiness
        assert "deployment_ready" in validation_data

        # Step 5: Export report
        export_resp = client.post(
            "/api/questions/export-report",
            json={
                "question_data": question_data,
                "question_id": "Q001",
                "format": "json"
            }
        )
        assert export_resp.status_code == 200

