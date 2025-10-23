"""
HTML Question Service
Handles creation, validation, and management of HTML-based questions
"""

import json
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
import re
from database import Database

class HtmlQuestionService:
    """Service for managing HTML-based questions"""
    
    def __init__(self):
        self.db = Database()
        self.allowed_html_tags = {
            'div', 'p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'input', 'label', 'textarea', 'select', 'option',
            'table', 'tr', 'td', 'th', 'tbody', 'thead',
            'ul', 'ol', 'li', 'br', 'strong', 'em', 'u', 'i', 'b',
            'style', 'img'
        }
        
        self.allowed_attributes = {
            'class', 'id', 'name', 'type', 'value', 'placeholder',
            'disabled', 'checked', 'selected', 'rows', 'cols',
            'src', 'alt', 'width', 'height'
        }
    
    def validate_html_content(self, html_content: str) -> tuple[bool, str]:
        """
        Validate HTML content for safety and structure
        Returns: (is_valid, error_message)
        """
        if not html_content or not isinstance(html_content, str):
            return False, "HTML content must be a non-empty string"
        
        if len(html_content) > 50000:
            return False, "HTML content exceeds maximum size (50KB)"
        
        # Check for dangerous patterns
        dangerous_patterns = [
            r'<script',
            r'javascript:',
            r'on\w+\s*=',  # Event handlers like onclick=
            r'<iframe',
            r'<object',
            r'<embed'
        ]
        
        for pattern in dangerous_patterns:
            if re.search(pattern, html_content, re.IGNORECASE):
                return False, f"HTML contains potentially dangerous content: {pattern}"
        
        return True, ""
    
    def validate_answer_extraction(self, rules: Dict[str, Any]) -> tuple[bool, str]:
        """
        Validate answer extraction rules
        Returns: (is_valid, error_message)
        """
        if not isinstance(rules, dict):
            return False, "Answer extraction rules must be a dictionary"
        
        if 'method' not in rules:
            return False, "Answer extraction rules must have a 'method' field"
        
        valid_methods = [
            'radio_button', 'checkbox', 'text_input', 'textarea',
            'dropdown', 'custom_javascript'
        ]
        
        if rules['method'] not in valid_methods:
            return False, f"Invalid extraction method. Must be one of: {', '.join(valid_methods)}"
        
        if 'selector' not in rules and rules['method'] != 'custom_javascript':
            return False, "Answer extraction rules must have a 'selector' field"
        
        # Validate CSS selector
        if 'selector' in rules:
            try:
                # Basic validation - just check it's not empty
                if not rules['selector'] or not isinstance(rules['selector'], str):
                    return False, "Selector must be a non-empty string"
            except Exception as e:
                return False, f"Invalid CSS selector: {str(e)}"
        
        return True, ""
    
    def validate_grading_rules(self, rules: Dict[str, Any]) -> tuple[bool, str]:
        """
        Validate grading rules
        Returns: (is_valid, error_message)
        """
        if not isinstance(rules, dict):
            return False, "Grading rules must be a dictionary"
        
        if 'method' not in rules:
            return False, "Grading rules must have a 'method' field"
        
        valid_methods = [
            'exact_match', 'similarity', 'custom_javascript', 'manual'
        ]
        
        if rules['method'] not in valid_methods:
            return False, f"Invalid grading method. Must be one of: {', '.join(valid_methods)}"
        
        if rules['method'] in ['exact_match', 'similarity']:
            if 'correct_answers' not in rules:
                return False, "Grading rules must have 'correct_answers' field"
            
            if not isinstance(rules['correct_answers'], (list, str)):
                return False, "correct_answers must be a list or string"
        
        if 'points' not in rules:
            return False, "Grading rules must have 'points' field"
        
        if not isinstance(rules['points'], (int, float)) or rules['points'] < 0:
            return False, "Points must be a non-negative number"
        
        return True, ""
    
    def create_html_question(self, track_id: str, section_id: str,
                            question_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new HTML-based question
        
        Args:
            track_id: ID of the track
            section_id: ID of the section
            question_data: Dictionary containing:
                - html_content: HTML string
                - answer_extraction: Answer extraction rules
                - grading_rules: Grading rules
                - question_number: Question number (optional)
                - marks: Points for question (default: 1)
                - difficulty: Difficulty level (default: 'medium')
        
        Returns:
            Dictionary with question data or error
        """
        try:
            # Validate HTML content
            is_valid, error = self.validate_html_content(question_data.get('html_content', ''))
            if not is_valid:
                return {'success': False, 'error': error}
            
            # Validate answer extraction rules
            is_valid, error = self.validate_answer_extraction(
                question_data.get('answer_extraction', {})
            )
            if not is_valid:
                return {'success': False, 'error': error}
            
            # Validate grading rules
            is_valid, error = self.validate_grading_rules(
                question_data.get('grading_rules', {})
            )
            if not is_valid:
                return {'success': False, 'error': error}
            
            # Create question
            question_id = f"q-html-{str(uuid.uuid4())[:8]}"
            now = datetime.now().isoformat()
            
            payload = {
                'text': question_data.get('text', ''),
                'type': 'custom_html'
            }
            
            conn = self.db.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO questions (
                    id, track_id, section_id, question_number, type,
                    payload, marks, difficulty, html_content,
                    answer_extraction, grading_rules, question_type, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                question_id,
                track_id,
                section_id,
                question_data.get('question_number', 1),
                'custom_html',
                json.dumps(payload),
                question_data.get('marks', 1),
                question_data.get('difficulty', 'medium'),
                question_data.get('html_content'),
                json.dumps(question_data.get('answer_extraction', {})),
                json.dumps(question_data.get('grading_rules', {})),
                'html',
                now
            ))
            
            conn.commit()
            conn.close()
            
            return {
                'success': True,
                'question_id': question_id,
                'message': 'HTML question created successfully'
            }
        
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_html_question(self, question_id: str) -> Optional[Dict[str, Any]]:
        """Get HTML question by ID"""
        try:
            conn = self.db.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, track_id, section_id, type, payload,
                       html_content, answer_extraction, grading_rules,
                       marks, difficulty, created_at
                FROM questions
                WHERE id = ? AND type = 'custom_html'
            ''', (question_id,))
            
            row = cursor.fetchone()
            conn.close()
            
            if not row:
                return None
            
            return {
                'id': row[0],
                'track_id': row[1],
                'section_id': row[2],
                'type': row[3],
                'payload': json.loads(row[4]) if row[4] else {},
                'html_content': row[5],
                'answer_extraction': json.loads(row[6]) if row[6] else {},
                'grading_rules': json.loads(row[7]) if row[7] else {},
                'marks': row[8],
                'difficulty': row[9],
                'created_at': row[10]
            }
        except Exception as e:
            print(f"Error getting HTML question: {e}")
            return None

# Create singleton instance
html_question_service = HtmlQuestionService()

