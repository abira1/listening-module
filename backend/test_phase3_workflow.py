"""
Phase 3 Workflow Tests
Tests for submission creation, answer saving, and grading
"""

import unittest
import json
import uuid
from datetime import datetime
from database import Database, db
from submission_service import SubmissionService

class TestPhase3Workflow(unittest.TestCase):
    """Test Phase 3 submission and grading workflow"""

    @classmethod
    def setUpClass(cls):
        """Set up test database"""
        cls.db = db

    def setUp(self):
        """Set up test data before each test"""
        # Create test student
        self.student_id = "STU-TEST-001"
        self.db.add_student(
            name="Test Student",
            email="test@example.com",
            mobile="1234567890",
            institute="Test Institute"
        )

        # Create test track
        self.track_id = f"TRACK-{uuid.uuid4().hex[:8].upper()}"
        self.db.create_track(
            track_id=self.track_id,
            title="Test Track",
            track_type="listening",
            description="Test track for Phase 3"
        )

        # Create test section
        self.section_id = f"SEC-{uuid.uuid4().hex[:8].upper()}"
        self.db.create_section(
            section_id=self.section_id,
            track_id=self.track_id,
            section_number=1,
            title="Section 1"
        )

        # Create test questions
        self.questions = []
        for i in range(3):
            q_id = f"Q-{uuid.uuid4().hex[:8].upper()}"
            payload = json.dumps({
                "text": f"Question {i+1}",
                "options": ["A", "B", "C", "D"],
                "correctAnswer": "A"
            })
            self.db.create_question(
                question_id=q_id,
                section_id=self.section_id,
                track_id=self.track_id,
                question_number=i+1,
                question_type="mcq_single",
                payload=payload,
                marks=1
            )
            self.questions.append(q_id)

    def test_1_database_tables_exist(self):
        """Test 1: Verify Phase 3 database tables exist"""
        print("\n✓ TEST 1: Database Tables Exist")
        
        conn = self.db.get_connection()
        cursor = conn.cursor()

        # Check submissions table
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='submissions'")
        self.assertIsNotNone(cursor.fetchone(), "submissions table not found")
        print("  ✓ submissions table exists")

        # Check submission_answers table
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='submission_answers'")
        self.assertIsNotNone(cursor.fetchone(), "submission_answers table not found")
        print("  ✓ submission_answers table exists")

        conn.close()

    def test_2_submission_creation(self):
        """Test 2: Create submission and verify structure"""
        print("\n✓ TEST 2: Submission Creation")
        
        result = SubmissionService.start_submission(
            track_id=self.track_id,
            student_id=self.student_id
        )

        self.assertTrue(result['success'], f"Failed to start submission: {result.get('error')}")
        self.assertIn('submission_id', result)
        self.assertIn('questions', result)
        self.assertEqual(len(result['questions']), 3)
        print(f"  ✓ Submission created: {result['submission_id']}")
        print(f"  ✓ Questions loaded: {len(result['questions'])}")

        self.submission_id = result['submission_id']

    def test_3_answer_saving(self):
        """Test 3: Save answers and verify storage"""
        print("\n✓ TEST 3: Answer Saving")
        
        # First create a submission
        result = SubmissionService.start_submission(
            track_id=self.track_id,
            student_id=self.student_id
        )
        submission_id = result['submission_id']

        # Save answers
        for i, q_id in enumerate(self.questions):
            answer_result = SubmissionService.save_answer(
                submission_id=submission_id,
                question_id=q_id,
                student_answer="A"
            )
            self.assertTrue(answer_result['success'], f"Failed to save answer {i+1}")
            print(f"  ✓ Answer {i+1} saved")

        # Verify answers are stored
        answers = self.db.get_submission_answers(submission_id)
        self.assertEqual(len(answers), 3, "Not all answers were saved")
        print(f"  ✓ All {len(answers)} answers verified in database")

    def test_4_submission_and_grading(self):
        """Test 4: Submit exam and verify auto-grading"""
        print("\n✓ TEST 4: Submission and Grading")
        
        # Create submission
        result = SubmissionService.start_submission(
            track_id=self.track_id,
            student_id=self.student_id
        )
        submission_id = result['submission_id']

        # Save correct answers
        for q_id in self.questions:
            SubmissionService.save_answer(
                submission_id=submission_id,
                question_id=q_id,
                student_answer="A"
            )

        # Submit and grade
        grade_result = SubmissionService.submit_and_grade(submission_id)
        
        self.assertTrue(grade_result['success'], f"Failed to grade: {grade_result.get('error')}")
        self.assertIn('obtained_marks', grade_result)
        self.assertIn('total_marks', grade_result)
        self.assertIn('percentage', grade_result)
        self.assertIn('results', grade_result)
        
        print(f"  ✓ Exam submitted and graded")
        print(f"  ✓ Marks: {grade_result['obtained_marks']}/{grade_result['total_marks']}")
        print(f"  ✓ Percentage: {grade_result['percentage']}%")
        print(f"  ✓ Results: {len(grade_result['results'])} questions analyzed")

        # Verify submission status
        submission = self.db.get_submission(submission_id)
        self.assertEqual(submission['status'], 'graded')
        print(f"  ✓ Submission status: {submission['status']}")

    def test_5_results_retrieval(self):
        """Test 5: Retrieve and verify results"""
        print("\n✓ TEST 5: Results Retrieval")
        
        # Create and submit
        result = SubmissionService.start_submission(
            track_id=self.track_id,
            student_id=self.student_id
        )
        submission_id = result['submission_id']

        # Save answers
        for q_id in self.questions:
            SubmissionService.save_answer(
                submission_id=submission_id,
                question_id=q_id,
                student_answer="A"
            )

        # Submit
        SubmissionService.submit_and_grade(submission_id)

        # Get results
        results = SubmissionService.get_results(submission_id)
        
        self.assertTrue(results['success'])
        self.assertIn('submission', results)
        self.assertIn('results', results)
        self.assertEqual(len(results['results']), 3)
        
        print(f"  ✓ Results retrieved successfully")
        print(f"  ✓ Submission status: {results['submission']['status']}")
        print(f"  ✓ Score: {results['submission']['percentage']}%")
        print(f"  ✓ Question results: {len(results['results'])} questions")


def run_tests():
    """Run all Phase 3 workflow tests"""
    print("\n" + "="*60)
    print("PHASE 3: WORKFLOW TESTS")
    print("="*60)
    
    suite = unittest.TestLoader().loadTestsFromTestCase(TestPhase3Workflow)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    print("\n" + "="*60)
    print(f"RESULTS: {result.testsRun} tests, {len(result.failures)} failures, {len(result.errors)} errors")
    print("="*60 + "\n")
    
    return result.wasSuccessful()


if __name__ == '__main__':
    success = run_tests()
    exit(0 if success else 1)

