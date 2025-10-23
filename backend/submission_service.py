"""
Submission Service for exam taking and auto-grading
Handles submission creation, answer saving, and auto-grading logic
"""

import json
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
import logging
from database import db
from html_question_grader import html_grader

logger = logging.getLogger(__name__)


class SubmissionService:
    """Service for managing exam submissions and grading"""

    @staticmethod
    def start_submission(track_id: str, student_id: str) -> Dict[str, Any]:
        """
        Start a new exam submission
        
        Args:
            track_id: ID of the track/exam
            student_id: ID of the student
            
        Returns:
            {
                'success': bool,
                'submission_id': str,
                'track': dict,
                'questions': list,
                'error': str (if failed)
            }
        """
        try:
            # Get track and questions
            track = db.get_track(track_id)
            if not track:
                return {'success': False, 'error': 'Track not found'}

            questions = db.get_all_track_questions(track_id)
            if not questions:
                return {'success': False, 'error': 'No questions in track'}

            # Create submission
            submission_id = f"SUB-{uuid.uuid4().hex[:12].upper()}"
            total_marks = sum(int(q.get('marks', 1)) for q in questions)

            result = db.create_submission(
                submission_id=submission_id,
                track_id=track_id,
                student_id=student_id,
                total_questions=len(questions),
                total_marks=total_marks
            )

            if not result['success']:
                return {'success': False, 'error': 'Failed to create submission'}

            # Prepare questions for frontend (remove sensitive data)
            questions_for_frontend = []
            for q in questions:
                q_dict = dict(q)
                # Parse payload
                try:
                    payload = json.loads(q_dict.get('payload', '{}'))
                except:
                    payload = {}

                questions_for_frontend.append({
                    'id': q_dict['id'],
                    'question_number': q_dict['question_number'],
                    'type': q_dict['type'],
                    'payload': payload,
                    'marks': q_dict.get('marks', 1)
                })

            return {
                'success': True,
                'submission_id': submission_id,
                'track': {
                    'id': track['id'],
                    'title': track['title'],
                    'total_questions': len(questions),
                    'total_marks': total_marks
                },
                'questions': questions_for_frontend
            }
        except Exception as e:
            logger.error(f"Error starting submission: {e}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def save_answer(submission_id: str, question_id: str, student_answer: Any) -> Dict[str, Any]:
        """
        Save a student's answer (auto-save)
        
        Args:
            submission_id: ID of the submission
            question_id: ID of the question
            student_answer: The student's answer (format varies by type)
            
        Returns:
            {'success': bool, 'error': str (if failed)}
        """
        try:
            # Get submission and question
            submission = db.get_submission(submission_id)
            if not submission:
                return {'success': False, 'error': 'Submission not found'}

            question = db.get_question(question_id)
            if not question:
                return {'success': False, 'error': 'Question not found'}

            # Create or update answer
            answer_id = f"ANS-{uuid.uuid4().hex[:12].upper()}"
            student_answer_json = json.dumps(student_answer) if not isinstance(student_answer, str) else student_answer

            result = db.save_answer(
                answer_id=answer_id,
                submission_id=submission_id,
                question_id=question_id,
                question_number=question['question_number'],
                question_type=question['type'],
                student_answer=student_answer_json,
                correct_answer=question.get('payload', ''),
                marks_total=question.get('marks', 1)
            )

            return result
        except Exception as e:
            logger.error(f"Error saving answer: {e}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def submit_and_grade(submission_id: str) -> Dict[str, Any]:
        """
        Submit exam and perform auto-grading
        
        Args:
            submission_id: ID of the submission
            
        Returns:
            {
                'success': bool,
                'submission_id': str,
                'obtained_marks': int,
                'total_marks': int,
                'percentage': float,
                'results': list of question results,
                'error': str (if failed)
            }
        """
        try:
            # Get submission
            submission = db.get_submission(submission_id)
            if not submission:
                return {'success': False, 'error': 'Submission not found'}

            # Get all answers
            answers = db.get_submission_answers(submission_id)
            if not answers:
                return {'success': False, 'error': 'No answers found'}

            # Grade each answer
            total_marks = 0
            obtained_marks = 0
            results = []

            for answer in answers:
                question = db.get_question(answer['question_id'])
                if not question:
                    continue

                marks_total = answer.get('marks_total', 1)
                total_marks += marks_total

                # Grade the answer
                grade_result = SubmissionService._grade_answer(
                    answer_dict=answer,
                    question_dict=question
                )

                is_correct = grade_result['is_correct']
                marks_obtained = marks_total if is_correct else 0

                # Update answer with grading
                db.update_answer(
                    answer['id'],
                    is_correct=is_correct,
                    marks_obtained=marks_obtained,
                    feedback=grade_result.get('feedback', '')
                )

                obtained_marks += marks_obtained
                results.append({
                    'question_id': answer['question_id'],
                    'question_number': answer['question_number'],
                    'question_type': answer['question_type'],
                    'is_correct': is_correct,
                    'marks_obtained': marks_obtained,
                    'marks_total': marks_total,
                    'feedback': grade_result.get('feedback', '')
                })

            # Calculate percentage
            percentage = (obtained_marks / total_marks * 100) if total_marks > 0 else 0

            # Update submission
            now = datetime.now().isoformat()
            db.update_submission(
                submission_id,
                status='graded',
                completed_at=now,
                obtained_marks=obtained_marks,
                percentage=percentage
            )

            return {
                'success': True,
                'submission_id': submission_id,
                'obtained_marks': obtained_marks,
                'total_marks': total_marks,
                'percentage': round(percentage, 2),
                'results': results
            }
        except Exception as e:
            logger.error(f"Error submitting and grading: {e}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def _grade_answer(answer_dict: Dict, question_dict: Dict) -> Dict[str, Any]:
        """
        Grade a single answer based on question type

        Returns:
            {'is_correct': bool, 'feedback': str}
        """
        try:
            question_type = answer_dict.get('question_type', '')
            student_answer = answer_dict.get('student_answer', '')

            # Parse answers
            try:
                student_ans = json.loads(student_answer) if isinstance(student_answer, str) else student_answer
            except:
                student_ans = student_answer

            try:
                correct_ans_str = answer_dict.get('correct_answer', '{}')
                correct_ans = json.loads(correct_ans_str) if isinstance(correct_ans_str, str) else correct_ans_str
            except:
                correct_ans = {}

            # Handle HTML questions
            if question_type == 'custom_html':
                try:
                    grading_rules = json.loads(question_dict.get('grading_rules', '{}')) if isinstance(question_dict.get('grading_rules'), str) else question_dict.get('grading_rules', {})
                    grade_result = html_grader.grade_answer(student_ans, grading_rules)
                    return {
                        'is_correct': grade_result.get('is_correct', False),
                        'feedback': grade_result.get('feedback', 'Graded')
                    }
                except Exception as e:
                    logger.error(f"Error grading HTML question: {e}")
                    return {'is_correct': False, 'feedback': 'Error during grading'}

            # Grade based on type
            elif question_type in ['mcq_single', 'true_false_ng']:
                is_correct = str(student_ans).lower() == str(correct_ans.get('correctAnswer', '')).lower()
                return {
                    'is_correct': is_correct,
                    'feedback': 'Correct!' if is_correct else f"Correct answer: {correct_ans.get('correctAnswer', '')}"
                }

            elif question_type == 'mcq_multiple':
                correct_answers = set(str(a).lower() for a in correct_ans.get('correctAnswers', []))
                student_answers = set(str(a).lower() for a in (student_ans if isinstance(student_ans, list) else [student_ans]))
                is_correct = correct_answers == student_answers
                return {
                    'is_correct': is_correct,
                    'feedback': 'Correct!' if is_correct else f"Correct answers: {', '.join(correct_ans.get('correctAnswers', []))}"
                }

            elif question_type in ['writing_task1', 'writing_task2']:
                # Writing tasks require manual grading
                return {
                    'is_correct': False,
                    'feedback': 'Submitted for manual grading'
                }

            else:
                # For other types, mark as submitted
                return {
                    'is_correct': False,
                    'feedback': 'Submitted for review'
                }

        except Exception as e:
            logger.error(f"Error grading answer: {e}")
            return {'is_correct': False, 'feedback': 'Error during grading'}

    @staticmethod
    def get_results(submission_id: str) -> Dict[str, Any]:
        """
        Get detailed results for a submission
        
        Returns:
            {
                'success': bool,
                'submission': dict,
                'results': list,
                'error': str (if failed)
            }
        """
        try:
            submission = db.get_submission(submission_id)
            if not submission:
                return {'success': False, 'error': 'Submission not found'}

            answers = db.get_submission_answers(submission_id)

            results = []
            for answer in answers:
                results.append({
                    'question_number': answer['question_number'],
                    'question_type': answer['question_type'],
                    'is_correct': bool(answer['is_correct']),
                    'marks_obtained': answer['marks_obtained'],
                    'marks_total': answer['marks_total'],
                    'feedback': answer.get('feedback', '')
                })

            return {
                'success': True,
                'submission': {
                    'id': submission['id'],
                    'track_id': submission['track_id'],
                    'student_id': submission['student_id'],
                    'status': submission['status'],
                    'started_at': submission['started_at'],
                    'completed_at': submission['completed_at'],
                    'obtained_marks': submission['obtained_marks'],
                    'total_marks': submission['total_marks'],
                    'percentage': submission['percentage']
                },
                'results': results
            }
        except Exception as e:
            logger.error(f"Error getting results: {e}")
            return {'success': False, 'error': str(e)}

