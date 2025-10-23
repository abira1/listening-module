"""
Enhanced Auto-Grading Service
Supports all 18 question types with intelligent answer matching
"""

import re
from typing import Dict, Any, Tuple, List
from difflib import SequenceMatcher
import logging

logger = logging.getLogger(__name__)


class EnhancedAutoGrader:
    """Enhanced auto-grading with support for all question types"""
    
    # Similarity threshold for fuzzy matching (0-1)
    SIMILARITY_THRESHOLD = 0.85
    
    @staticmethod
    def grade_question(
        question: Dict[str, Any],
        user_answer: Any,
        question_type: str
    ) -> Tuple[bool, float, str]:
        """
        Grade a question answer
        
        Args:
            question: Question data
            user_answer: Student's answer
            question_type: Type of question
        
        Returns:
            (is_correct, score, feedback)
        """
        grader_method = getattr(
            EnhancedAutoGrader,
            f'_grade_{question_type}',
            EnhancedAutoGrader._grade_default
        )
        
        return grader_method(question, user_answer)
    
    # ============================================
    # MULTIPLE CHOICE
    # ============================================
    
    @staticmethod
    def _grade_mcq_single(question: Dict, user_answer: str) -> Tuple[bool, float, str]:
        """Grade single choice MCQ"""
        correct_answer = question.get('correctAnswer', '')
        
        if not user_answer:
            return False, 0.0, "No answer provided"
        
        is_correct = str(user_answer).lower() == str(correct_answer).lower()
        score = 1.0 if is_correct else 0.0
        feedback = "Correct!" if is_correct else f"Incorrect. Correct answer: {correct_answer}"
        
        return is_correct, score, feedback
    
    @staticmethod
    def _grade_mcq_multiple(question: Dict, user_answers: List[str]) -> Tuple[bool, float, str]:
        """Grade multiple choice MCQ"""
        correct_answers = set(str(a).lower() for a in question.get('correctAnswers', []))
        user_answers_set = set(str(a).lower() for a in (user_answers or []))
        
        if not user_answers:
            return False, 0.0, "No answers provided"
        
        # Partial credit: correct answers / total correct answers
        correct_count = len(user_answers_set & correct_answers)
        total_correct = len(correct_answers)
        
        score = correct_count / total_correct if total_correct > 0 else 0.0
        is_correct = user_answers_set == correct_answers
        
        feedback = "Correct!" if is_correct else f"Partial credit: {correct_count}/{total_correct} correct"
        
        return is_correct, score, feedback
    
    # ============================================
    # TRUE/FALSE/NOT GIVEN
    # ============================================
    
    @staticmethod
    def _grade_true_false_ng(question: Dict, user_answer: str) -> Tuple[bool, float, str]:
        """Grade True/False/Not Given"""
        correct_answer = question.get('correctAnswer', '')
        
        if not user_answer:
            return False, 0.0, "No answer provided"
        
        # Normalize answers
        user_ans = str(user_answer).lower().strip()
        correct_ans = str(correct_answer).lower().strip()
        
        # Handle variations
        variations = {
            'true': ['true', 't', 'yes'],
            'false': ['false', 'f', 'no'],
            'not given': ['not given', 'ng', 'not_given']
        }
        
        user_normalized = None
        correct_normalized = None
        
        for key, vals in variations.items():
            if user_ans in vals:
                user_normalized = key
            if correct_ans in vals:
                correct_normalized = key
        
        is_correct = user_normalized == correct_normalized
        score = 1.0 if is_correct else 0.0
        feedback = "Correct!" if is_correct else f"Incorrect. Correct answer: {correct_answer}"
        
        return is_correct, score, feedback
    
    # ============================================
    # TEXT COMPLETION
    # ============================================
    
    @staticmethod
    def _grade_sentence_completion(question: Dict, user_answer: str) -> Tuple[bool, float, str]:
        """Grade sentence completion"""
        correct_answer = question.get('correctAnswer', '')
        acceptable_answers = question.get('acceptableAnswers', [])
        
        if not user_answer:
            return False, 0.0, "No answer provided"
        
        user_ans = str(user_answer).strip().lower()
        correct_ans = str(correct_answer).strip().lower()
        
        # Check exact match
        if user_ans == correct_ans:
            return True, 1.0, "Correct!"
        
        # Check acceptable answers
        for acceptable in acceptable_answers:
            if user_ans == str(acceptable).strip().lower():
                return True, 1.0, "Correct!"
        
        # Check fuzzy match
        similarity = EnhancedAutoGrader._calculate_similarity(user_ans, correct_ans)
        if similarity >= EnhancedAutoGrader.SIMILARITY_THRESHOLD:
            return True, 1.0, "Correct!"
        
        return False, 0.0, f"Incorrect. Expected: {correct_answer}"
    
    @staticmethod
    def _grade_fill_gaps(question: Dict, user_answer: str) -> Tuple[bool, float, str]:
        """Grade fill gaps"""
        return EnhancedAutoGrader._grade_sentence_completion(question, user_answer)
    
    @staticmethod
    def _grade_fill_gaps_short(question: Dict, user_answer: str) -> Tuple[bool, float, str]:
        """Grade fill gaps (short answer with word limit)"""
        max_words = question.get('maxWords', 3)
        
        if not user_answer:
            return False, 0.0, "No answer provided"
        
        word_count = len(str(user_answer).split())
        
        if word_count > max_words:
            return False, 0.0, f"Answer exceeds {max_words} word limit ({word_count} words)"
        
        # Grade the answer content
        is_correct, score, feedback = EnhancedAutoGrader._grade_sentence_completion(question, user_answer)
        
        if not is_correct:
            feedback += f" (Word limit: {max_words})"
        
        return is_correct, score, feedback
    
    # ============================================
    # MATCHING
    # ============================================
    
    @staticmethod
    def _grade_matching(question: Dict, user_answers: Dict[str, str]) -> Tuple[bool, float, str]:
        """Grade matching questions"""
        correct_matches = question.get('matches', {})
        
        if not user_answers:
            return False, 0.0, "No answers provided"
        
        correct_count = 0
        total_items = len(correct_matches)
        
        for item_id, correct_option in correct_matches.items():
            user_option = user_answers.get(item_id, '')
            if str(user_option).lower() == str(correct_option).lower():
                correct_count += 1
        
        score = correct_count / total_items if total_items > 0 else 0.0
        is_correct = score == 1.0
        
        feedback = f"Correct!" if is_correct else f"Partial credit: {correct_count}/{total_items} correct"
        
        return is_correct, score, feedback
    
    # ============================================
    # FORM/TABLE/FLOWCHART COMPLETION
    # ============================================
    
    @staticmethod
    def _grade_form_completion(question: Dict, user_answers: Dict[str, str]) -> Tuple[bool, float, str]:
        """Grade form completion"""
        form_fields = question.get('formFields', [])
        
        if not user_answers:
            return False, 0.0, "No answers provided"
        
        correct_count = 0
        
        for field in form_fields:
            field_id = field.get('fieldId')
            correct_answer = field.get('correctAnswer', '')
            user_answer = user_answers.get(field_id, '')
            
            if str(user_answer).strip().lower() == str(correct_answer).strip().lower():
                correct_count += 1
        
        total_fields = len(form_fields)
        score = correct_count / total_fields if total_fields > 0 else 0.0
        is_correct = score == 1.0
        
        feedback = f"Correct!" if is_correct else f"Partial credit: {correct_count}/{total_fields} correct"
        
        return is_correct, score, feedback
    
    @staticmethod
    def _grade_table_completion(question: Dict, user_answers: Dict) -> Tuple[bool, float, str]:
        """Grade table completion"""
        return EnhancedAutoGrader._grade_form_completion(question, user_answers)
    
    @staticmethod
    def _grade_flowchart_completion(question: Dict, user_answers: Dict) -> Tuple[bool, float, str]:
        """Grade flowchart completion"""
        return EnhancedAutoGrader._grade_form_completion(question, user_answers)
    
    # ============================================
    # WRITING TASKS (Manual Grading)
    # ============================================
    
    @staticmethod
    def _grade_writing_task1(question: Dict, user_answer: str) -> Tuple[bool, float, str]:
        """Grade writing task 1 (auto-check only)"""
        if not user_answer:
            return False, 0.0, "No answer provided"
        
        word_count = len(str(user_answer).split())
        min_words = question.get('minWords', 150)
        max_words = question.get('maxWords', 200)
        
        if word_count < min_words:
            return False, 0.0, f"Answer too short ({word_count} words, minimum {min_words})"
        
        if word_count > max_words:
            return False, 0.0, f"Answer too long ({word_count} words, maximum {max_words})"
        
        return True, 0.5, f"Word count valid ({word_count} words). Requires manual grading."
    
    @staticmethod
    def _grade_writing_task2(question: Dict, user_answer: str) -> Tuple[bool, float, str]:
        """Grade writing task 2 (auto-check only)"""
        return EnhancedAutoGrader._grade_writing_task1(question, user_answer)
    
    # ============================================
    # HELPER METHODS
    # ============================================
    
    @staticmethod
    def _calculate_similarity(str1: str, str2: str) -> float:
        """Calculate similarity between two strings (0-1)"""
        return SequenceMatcher(None, str1, str2).ratio()
    
    @staticmethod
    def _grade_default(question: Dict, user_answer: Any) -> Tuple[bool, float, str]:
        """Default grading for unknown types"""
        logger.warning(f"No grader found for question type")
        return False, 0.0, "Grading not supported for this question type"
    
    # ============================================
    # BATCH GRADING
    # ============================================
    
    @staticmethod
    def grade_submission(
        questions: List[Dict[str, Any]],
        answers: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Grade entire submission
        
        Returns:
            {
                'total_questions': int,
                'correct_answers': int,
                'total_marks': float,
                'marks_obtained': float,
                'percentage': float,
                'question_results': [
                    {
                        'question_id': str,
                        'is_correct': bool,
                        'score': float,
                        'feedback': str
                    }
                ]
            }
        """
        question_results = []
        total_marks = 0
        marks_obtained = 0
        correct_count = 0
        
        for question in questions:
            question_id = question.get('id')
            question_type = question.get('type', 'mcq_single')
            user_answer = answers.get(question_id)
            marks = question.get('marks', 1)
            
            is_correct, score, feedback = EnhancedAutoGrader.grade_question(
                question,
                user_answer,
                question_type
            )
            
            total_marks += marks
            marks_obtained += marks * score
            
            if is_correct:
                correct_count += 1
            
            question_results.append({
                'question_id': question_id,
                'is_correct': is_correct,
                'score': score,
                'marks_obtained': marks * score,
                'feedback': feedback
            })
        
        percentage = (marks_obtained / total_marks * 100) if total_marks > 0 else 0
        
        return {
            'total_questions': len(questions),
            'correct_answers': correct_count,
            'total_marks': total_marks,
            'marks_obtained': marks_obtained,
            'percentage': round(percentage, 2),
            'question_results': question_results
        }

