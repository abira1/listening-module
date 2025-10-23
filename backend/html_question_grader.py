"""
HTML Question Grader
Handles grading of HTML-based questions using various grading methods
"""

import json
from typing import Dict, Any, Union, List
from difflib import SequenceMatcher
import re

class HtmlQuestionGrader:
    """Service for grading HTML-based questions"""
    
    def grade_answer(self, student_answer: Any, grading_rules: Dict[str, Any]) -> Dict[str, Any]:
        """
        Grade a student's answer based on grading rules
        
        Args:
            student_answer: The student's answer (can be string, list, etc.)
            grading_rules: Dictionary containing grading method and rules
        
        Returns:
            Dictionary with:
            - is_correct: Boolean
            - score: Points earned
            - max_score: Maximum points possible
            - feedback: Optional feedback message
        """
        try:
            if not grading_rules or not isinstance(grading_rules, dict):
                return {
                    'is_correct': False,
                    'score': 0,
                    'max_score': 0,
                    'feedback': 'Invalid grading rules'
                }
            
            method = grading_rules.get('method', 'exact_match')
            max_score = grading_rules.get('points', 1)
            
            if method == 'exact_match':
                return self._grade_exact_match(student_answer, grading_rules, max_score)
            
            elif method == 'similarity':
                return self._grade_similarity(student_answer, grading_rules, max_score)
            
            elif method == 'custom_javascript':
                return self._grade_custom(student_answer, grading_rules, max_score)
            
            elif method == 'manual':
                return {
                    'is_correct': None,  # Unknown until manually graded
                    'score': 0,
                    'max_score': max_score,
                    'feedback': 'Awaiting manual grading'
                }
            
            else:
                return {
                    'is_correct': False,
                    'score': 0,
                    'max_score': max_score,
                    'feedback': f'Unknown grading method: {method}'
                }
        
        except Exception as e:
            return {
                'is_correct': False,
                'score': 0,
                'max_score': grading_rules.get('points', 1),
                'feedback': f'Grading error: {str(e)}'
            }
    
    def _grade_exact_match(self, student_answer: Any, grading_rules: Dict[str, Any],
                          max_score: int) -> Dict[str, Any]:
        """Grade using exact match method"""
        try:
            correct_answers = grading_rules.get('correct_answers', [])
            
            # Normalize correct answers to list
            if isinstance(correct_answers, str):
                correct_answers = [correct_answers]
            
            # Normalize student answer
            if isinstance(student_answer, list):
                student_answers = student_answer
            else:
                student_answers = [str(student_answer)] if student_answer else []
            
            # Check if student answer matches any correct answer
            is_correct = False
            
            if len(student_answers) == len(correct_answers):
                # For multiple answers, check if all match
                is_correct = all(
                    str(ans).strip().lower() in [str(ca).strip().lower() for ca in correct_answers]
                    for ans in student_answers
                )
            elif len(student_answers) == 1:
                # For single answer, check if it matches any correct answer
                is_correct = str(student_answers[0]).strip().lower() in [
                    str(ca).strip().lower() for ca in correct_answers
                ]
            
            score = max_score if is_correct else 0
            
            # Check for partial credit
            partial_credit = grading_rules.get('partial_credit', False)
            if partial_credit and not is_correct and len(student_answers) > 0:
                # Count matching answers
                matches = sum(
                    1 for ans in student_answers
                    if str(ans).strip().lower() in [str(ca).strip().lower() for ca in correct_answers]
                )
                if matches > 0:
                    partial_points = grading_rules.get('partial_points', max_score // 2)
                    score = min(partial_points, max_score)
                    is_correct = False  # Still not fully correct
            
            return {
                'is_correct': is_correct,
                'score': score,
                'max_score': max_score,
                'feedback': 'Correct!' if is_correct else 'Incorrect'
            }
        
        except Exception as e:
            return {
                'is_correct': False,
                'score': 0,
                'max_score': max_score,
                'feedback': f'Grading error: {str(e)}'
            }
    
    def _grade_similarity(self, student_answer: Any, grading_rules: Dict[str, Any],
                         max_score: int) -> Dict[str, Any]:
        """Grade using similarity/fuzzy matching method"""
        try:
            correct_answers = grading_rules.get('correct_answers', [])
            threshold = grading_rules.get('threshold', 0.8)
            case_sensitive = grading_rules.get('case_sensitive', False)
            
            # Normalize correct answers to list
            if isinstance(correct_answers, str):
                correct_answers = [correct_answers]
            
            # Normalize student answer
            student_text = str(student_answer).strip() if student_answer else ""
            
            if not student_text:
                return {
                    'is_correct': False,
                    'score': 0,
                    'max_score': max_score,
                    'feedback': 'No answer provided'
                }
            
            # Calculate similarity with each correct answer
            best_similarity = 0
            for correct_answer in correct_answers:
                correct_text = str(correct_answer).strip()
                
                if not case_sensitive:
                    student_text_cmp = student_text.lower()
                    correct_text_cmp = correct_text.lower()
                else:
                    student_text_cmp = student_text
                    correct_text_cmp = correct_text
                
                similarity = SequenceMatcher(None, student_text_cmp, correct_text_cmp).ratio()
                best_similarity = max(best_similarity, similarity)
            
            is_correct = best_similarity >= threshold
            score = max_score if is_correct else 0
            
            return {
                'is_correct': is_correct,
                'score': score,
                'max_score': max_score,
                'feedback': f'Similarity: {best_similarity:.1%}' if not is_correct else 'Correct!'
            }
        
        except Exception as e:
            return {
                'is_correct': False,
                'score': 0,
                'max_score': max_score,
                'feedback': f'Grading error: {str(e)}'
            }
    
    def _grade_custom(self, student_answer: Any, grading_rules: Dict[str, Any],
                     max_score: int) -> Dict[str, Any]:
        """Grade using custom JavaScript function"""
        try:
            # Note: In production, this should use a sandboxed JavaScript engine
            # For now, we'll return a placeholder
            return {
                'is_correct': None,
                'score': 0,
                'max_score': max_score,
                'feedback': 'Custom grading requires manual review'
            }
        
        except Exception as e:
            return {
                'is_correct': False,
                'score': 0,
                'max_score': max_score,
                'feedback': f'Grading error: {str(e)}'
            }

# Create singleton instance
html_grader = HtmlQuestionGrader()

