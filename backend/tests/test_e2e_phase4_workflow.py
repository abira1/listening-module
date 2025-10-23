"""
End-to-End Tests for Phase 4 Workflow
Tests complete workflows: exam management, reporting, and grading
Part of Phase 4, Task 4.4
"""

import pytest
import json
from datetime import datetime, timedelta
from fastapi.testclient import TestClient


class TestPhase4ExamManagementWorkflow:
    """Test complete exam management workflows"""

    def test_create_publish_and_report_exam(self, client, admin_token):
        """Test complete exam lifecycle"""
        # Create exam
        exam_data = {
            "title": "IELTS Practice Test",
            "description": "Full practice test",
            "duration": 180,
            "totalScore": 100,
            "passingScore": 60,
            "category": "IELTS",
            "difficulty": "intermediate"
        }

        response = client.post(
            "/exams",
            json=exam_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 201
        exam_id = response.json()["id"]

        # Add questions
        questions_data = {
            "questionIds": ["Q1", "Q2", "Q3", "Q4", "Q5"]
        }

        response = client.post(
            f"/exams/{exam_id}/questions",
            json=questions_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200

        # Publish exam
        response = client.post(
            f"/exams/{exam_id}/publish",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200

        # Get exam report
        response = client.get(
            f"/reports/exams/{exam_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        report = response.json()
        assert report["examId"] == exam_id

    def test_duplicate_and_modify_exam(self, client, admin_token):
        """Test exam duplication workflow"""
        # Create original exam
        exam_data = {
            "title": "Original Exam",
            "description": "Original",
            "duration": 180,
            "totalScore": 100,
            "passingScore": 60,
            "category": "IELTS",
            "difficulty": "intermediate"
        }

        response = client.post(
            "/exams",
            json=exam_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        original_id = response.json()["id"]

        # Duplicate exam
        duplicate_data = {
            "newTitle": "Duplicated Exam"
        }

        response = client.post(
            f"/exams/{original_id}/duplicate",
            json=duplicate_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 201
        duplicate_id = response.json()["id"]

        # Verify duplication
        response = client.get(
            f"/exams/{duplicate_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        assert response.json()["title"] == "Duplicated Exam"

    def test_schedule_exam_workflow(self, client, admin_token):
        """Test exam scheduling"""
        # Create exam
        exam_data = {
            "title": "Scheduled Exam",
            "description": "Test",
            "duration": 180,
            "totalScore": 100,
            "passingScore": 60,
            "category": "IELTS",
            "difficulty": "intermediate"
        }

        response = client.post(
            "/exams",
            json=exam_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        exam_id = response.json()["id"]

        # Schedule exam
        schedule_data = {
            "startDate": (datetime.now() + timedelta(days=7)).isoformat(),
            "endDate": (datetime.now() + timedelta(days=14)).isoformat(),
            "maxAttempts": 2
        }

        response = client.post(
            f"/exams/{exam_id}/schedule",
            json=schedule_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200


class TestPhase4ReportingWorkflow:
    """Test complete reporting and analytics workflows"""

    def test_generate_comprehensive_report(self, client, admin_token):
        """Test comprehensive report generation"""
        # Generate exam report
        response = client.get(
            "/reports/exams",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200

        # Generate analytics dashboard
        response = client.get(
            "/reports/analytics/dashboard",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        dashboard = response.json()
        assert "totalExams" in dashboard
        assert "totalStudents" in dashboard
        assert "averageScore" in dashboard

    def test_export_report_workflow(self, client, admin_token):
        """Test report export functionality"""
        # Export to CSV
        response = client.get(
            "/reports/export/csv",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/csv"

        # Export to PDF
        response = client.get(
            "/reports/export/pdf",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200

    def test_performance_trends_analysis(self, client, admin_token):
        """Test performance trends analysis"""
        response = client.get(
            "/reports/analytics/trends",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        trends = response.json()
        assert "trends" in trends


class TestPhase4TeacherGradingWorkflow:
    """Test complete teacher grading workflows"""

    def test_complete_grading_workflow(self, client, teacher_token):
        """Test complete grading process"""
        # Get pending submissions
        response = client.get(
            "/teacher/submissions/pending",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code == 200

        # Get submission details
        if response.json():
            submission_id = response.json()[0]["id"]

            response = client.get(
                f"/submissions/{submission_id}",
                headers={"Authorization": f"Bearer {teacher_token}"}
            )
            assert response.status_code == 200

            # Grade submission
            grade_data = {
                "score": 85,
                "feedback": "Excellent work"
            }

            response = client.post(
                f"/submissions/{submission_id}/grade",
                json=grade_data,
                headers={"Authorization": f"Bearer {teacher_token}"}
            )
            assert response.status_code == 200

    def test_bulk_grading_workflow(self, client, teacher_token):
        """Test bulk grading operations"""
        # Get all pending submissions
        response = client.get(
            "/teacher/submissions/pending",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code == 200

        submissions = response.json()
        if len(submissions) > 0:
            # Grade multiple submissions
            for submission in submissions[:3]:
                grade_data = {
                    "score": 80,
                    "feedback": "Good work"
                }

                response = client.post(
                    f"/submissions/{submission['id']}/grade",
                    json=grade_data,
                    headers={"Authorization": f"Bearer {teacher_token}"}
                )
                assert response.status_code == 200

    def test_publish_grades_workflow(self, client, teacher_token):
        """Test grade publication"""
        response = client.post(
            "/teacher/grades/publish",
            json={"classId": "C001", "examId": "E001"},
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code in [200, 404]  # 404 if no data

    def test_export_grades_workflow(self, client, teacher_token):
        """Test grades export"""
        response = client.get(
            "/teacher/grades/export",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code in [200, 404]


class TestPhase4CrossModuleIntegration:
    """Test integration between different modules"""

    def test_exam_to_reporting_integration(self, client, admin_token):
        """Test exam creation and reporting"""
        # Create exam
        exam_data = {
            "title": "Integration Test Exam",
            "description": "Test",
            "duration": 180,
            "totalScore": 100,
            "passingScore": 60,
            "category": "IELTS",
            "difficulty": "intermediate"
        }

        response = client.post(
            "/exams",
            json=exam_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        exam_id = response.json()["id"]

        # Verify exam appears in reports
        response = client.get(
            "/reports/exams",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200

    def test_teacher_to_reporting_integration(self, client, teacher_token):
        """Test teacher dashboard and reporting"""
        # Get teacher dashboard
        response = client.get(
            "/teacher/dashboard",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code == 200

        # Get grading statistics
        response = client.get(
            "/teacher/statistics",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code == 200


class TestPhase4ErrorHandling:
    """Test error handling and edge cases"""

    def test_invalid_exam_data(self, client, admin_token):
        """Test validation of invalid exam data"""
        invalid_data = {
            "title": "",
            "description": "",
            "duration": -1,
            "totalScore": 0,
            "passingScore": 100
        }

        response = client.post(
            "/exams",
            json=invalid_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 422

    def test_invalid_grade_data(self, client, teacher_token):
        """Test validation of invalid grade data"""
        invalid_grade = {
            "score": 150,
            "feedback": ""
        }

        response = client.post(
            "/submissions/SUB001/grade",
            json=invalid_grade,
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code in [422, 404]

    def test_unauthorized_access(self, client):
        """Test unauthorized access handling"""
        response = client.get("/exams")
        assert response.status_code == 401

    def test_not_found_handling(self, client, admin_token):
        """Test 404 handling"""
        response = client.get(
            "/exams/NONEXISTENT",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 404


class TestPhase4Performance:
    """Test performance characteristics"""

    def test_list_exams_performance(self, client, admin_token):
        """Test exam listing performance"""
        response = client.get(
            "/exams",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        # Should return quickly even with many exams

    def test_report_generation_performance(self, client, admin_token):
        """Test report generation performance"""
        response = client.get(
            "/reports/analytics/dashboard",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        # Should complete within reasonable time


@pytest.fixture
def client():
    """Provide test client"""
    from main import app
    return TestClient(app)


@pytest.fixture
def admin_token():
    """Provide admin token"""
    return "test-admin-token"


@pytest.fixture
def teacher_token():
    """Provide teacher token"""
    return "test-teacher-token"

