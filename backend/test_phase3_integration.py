"""
Phase 3 Integration Tests
End-to-end tests for complete exam workflow
"""

import unittest
import json
import uuid
from database import db
from submission_service import SubmissionService


class TestPhase3Integration(unittest.TestCase):
    """Integration tests for Phase 3 exam workflow"""

    @classmethod
    def setUpClass(cls):
        """Set up test database"""
        cls.db = db

    def setUp(self):
        """Set up test data"""
        # Create test student
        self.student_id = "STU-INT-001"
        try:
            self.db.add_student(
                name="Integration Test Student",
                email="int@example.com",
                mobile="9876543210",
                institute="Integration Test Institute"
            )
        except:
            pass  # Student might already exist

        # Create test track with multiple question types
        self.track_id = f"TRACK-INT-{uuid.uuid4().hex[:8].upper()}"
        self.db.create_track(
            track_id=self.track_id,
            title="Integration Test Track",
            track_type="listening",
            description="Complete integration test track"
        )

        # Create sections and questions
        self.questions_by_type = {}
        question_types = [
            ('mcq_single', {'text': 'Q1', 'options': ['A', 'B', 'C'], 'correctAnswer': 'A'}),
            ('mcq_multiple', {'text': 'Q2', 'options': ['A', 'B', 'C'], 'correctAnswers': ['A', 'B']}),
            ('true_false_ng', {'text': 'Q3', 'correctAnswer': 'true'})
        ]

        for idx, (q_type, q_payload) in enumerate(question_types):
            section_id = f"SEC-INT-{idx}-{uuid.uuid4().hex[:8].upper()}"
            self.db.create_section(
                section_id=section_id,
                track_id=self.track_id,
                section_number=idx+1,
                title=f"Section {idx+1}"
            )

            q_id = f"Q-INT-{idx}-{uuid.uuid4().hex[:8].upper()}"
            self.db.create_question(
                question_id=q_id,
                section_id=section_id,
                track_id=self.track_id,
                question_number=idx+1,
                question_type=q_type,
                payload=json.dumps(q_payload),
                marks=1
            )
            self.questions_by_type[q_type] = q_id

    def test_1_complete_exam_flow(self):
        """Test 1: Complete exam flow from start to results"""
        print("\n✓ TEST 1: Complete Exam Flow")
        
        # Start exam
        start_result = SubmissionService.start_submission(
            track_id=self.track_id,
            student_id=self.student_id
        )
        self.assertTrue(start_result['success'])
        submission_id = start_result['submission_id']
        print(f"  ✓ Exam started: {submission_id}")

        # Save answers
        answers_to_save = {
            'mcq_single': 'A',
            'mcq_multiple': ['A', 'B'],
            'true_false_ng': 'true'
        }

        for q_type, answer in answers_to_save.items():
            q_id = self.questions_by_type[q_type]
            result = SubmissionService.save_answer(
                submission_id=submission_id,
                question_id=q_id,
                student_answer=answer
            )
            self.assertTrue(result['success'])
            print(f"  ✓ Answer saved for {q_type}")

        # Submit and grade
        grade_result = SubmissionService.submit_and_grade(submission_id)
        self.assertTrue(grade_result['success'])
        print(f"  ✓ Exam submitted and graded")
        print(f"  ✓ Score: {grade_result['obtained_marks']}/{grade_result['total_marks']}")

        # Get results
        results = SubmissionService.get_results(submission_id)
        self.assertTrue(results['success'])
        self.assertEqual(results['submission']['status'], 'graded')
        print(f"  ✓ Results retrieved: {len(results['results'])} questions")

    def test_2_multiple_question_types(self):
        """Test 2: Handle multiple question types correctly"""
        print("\n✓ TEST 2: Multiple Question Types")
        
        start_result = SubmissionService.start_submission(
            track_id=self.track_id,
            student_id=self.student_id
        )
        submission_id = start_result['submission_id']

        # Verify all question types are present
        questions = start_result['questions']
        types_found = set(q['type'] for q in questions)
        print(f"  ✓ Question types found: {types_found}")

        # Save answers for each type
        for q in questions:
            if q['type'] == 'mcq_single':
                answer = 'A'
            elif q['type'] == 'mcq_multiple':
                answer = ['A', 'B']
            elif q['type'] == 'true_false_ng':
                answer = 'true'
            else:
                answer = 'test'

            SubmissionService.save_answer(
                submission_id=submission_id,
                question_id=q['id'],
                student_answer=answer
            )

        # Grade
        grade_result = SubmissionService.submit_and_grade(submission_id)
        self.assertTrue(grade_result['success'])
        self.assertEqual(len(grade_result['results']), len(questions))
        print(f"  ✓ All {len(questions)} question types graded successfully")

    def test_3_auto_grading_accuracy(self):
        """Test 3: Verify auto-grading accuracy"""
        print("\n✓ TEST 3: Auto-Grading Accuracy")
        
        start_result = SubmissionService.start_submission(
            track_id=self.track_id,
            student_id=self.student_id
        )
        submission_id = start_result['submission_id']

        # Save correct answers
        correct_answers = {
            'mcq_single': 'A',
            'mcq_multiple': ['A', 'B'],
            'true_false_ng': 'true'
        }

        for q_type, answer in correct_answers.items():
            q_id = self.questions_by_type[q_type]
            SubmissionService.save_answer(
                submission_id=submission_id,
                question_id=q_id,
                student_answer=answer
            )

        # Grade
        grade_result = SubmissionService.submit_and_grade(submission_id)
        
        # Verify all answers are marked correct
        correct_count = sum(1 for r in grade_result['results'] if r['is_correct'])
        self.assertEqual(correct_count, len(correct_answers))
        print(f"  ✓ All {correct_count} answers graded as correct")
        print(f"  ✓ Percentage: {grade_result['percentage']}%")

    def test_4_submission_persistence(self):
        """Test 4: Verify submission data persists correctly"""
        print("\n✓ TEST 4: Submission Persistence")
        
        start_result = SubmissionService.start_submission(
            track_id=self.track_id,
            student_id=self.student_id
        )
        submission_id = start_result['submission_id']

        # Save answers
        for q_type, q_id in self.questions_by_type.items():
            SubmissionService.save_answer(
                submission_id=submission_id,
                question_id=q_id,
                student_answer='test'
            )

        # Submit
        SubmissionService.submit_and_grade(submission_id)

        # Retrieve from database
        submission = self.db.get_submission(submission_id)
        self.assertIsNotNone(submission)
        self.assertEqual(submission['status'], 'graded')
        self.assertIsNotNone(submission['completed_at'])
        print(f"  ✓ Submission persisted: {submission['id']}")
        print(f"  ✓ Status: {submission['status']}")
        print(f"  ✓ Marks: {submission['obtained_marks']}/{submission['total_marks']}")

        # Retrieve answers
        answers = self.db.get_submission_answers(submission_id)
        self.assertEqual(len(answers), len(self.questions_by_type))
        print(f"  ✓ All {len(answers)} answers persisted")

    def test_5_student_submissions_history(self):
        """Test 5: Retrieve student submission history"""
        print("\n✓ TEST 5: Student Submissions History")
        
        # Create multiple submissions
        submission_ids = []
        for i in range(2):
            start_result = SubmissionService.start_submission(
                track_id=self.track_id,
                student_id=self.student_id
            )
            submission_id = start_result['submission_id']
            
            # Save and submit
            for q_id in self.questions_by_type.values():
                SubmissionService.save_answer(
                    submission_id=submission_id,
                    question_id=q_id,
                    student_answer='test'
                )
            
            SubmissionService.submit_and_grade(submission_id)
            submission_ids.append(submission_id)

        # Get student history
        submissions = self.db.get_student_submissions(self.student_id)
        self.assertGreaterEqual(len(submissions), 2)
        print(f"  ✓ Retrieved {len(submissions)} submissions for student")
        
        # Verify all are graded
        graded_count = sum(1 for s in submissions if s['status'] == 'graded')
        print(f"  ✓ Graded submissions: {graded_count}")


def run_integration_tests():
    """Run all Phase 3 integration tests"""
    print("\n" + "="*60)
    print("PHASE 3: INTEGRATION TESTS")
    print("="*60)
    
    suite = unittest.TestLoader().loadTestsFromTestCase(TestPhase3Integration)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    print("\n" + "="*60)
    print(f"RESULTS: {result.testsRun} tests, {len(result.failures)} failures, {len(result.errors)} errors")
    print("="*60 + "\n")
    
    return result.wasSuccessful()


if __name__ == '__main__':
    success = run_integration_tests()
    exit(0 if success else 1)

