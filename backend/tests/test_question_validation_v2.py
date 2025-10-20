"""
Tests for Enhanced Question Validation (All 18 IELTS Types)
"""

import pytest
from question_validation_v2 import (
    validate_question,
    get_all_question_types,
    is_valid_question_type,
    get_question_type_schema,
    QuestionType
)


class TestQuestionValidation:
    """Test question validation for all 18 types"""
    
    def test_all_18_types_are_supported(self):
        """Verify all 18 question types are in the validation schema"""
        all_types = get_all_question_types()
        assert len(all_types) == 18
        
        expected_types = [
            # Listening (10)
            'mcq_single', 'mcq_multiple', 'sentence_completion', 'form_completion',
            'table_completion', 'flowchart_completion', 'fill_gaps', 'fill_gaps_short',
            'matching', 'map_labelling',
            # Reading (6)
            'true_false_ng', 'matching_headings', 'matching_features', 'matching_endings',
            'note_completion', 'summary_completion',
            # Writing (2)
            'writing_task1', 'writing_task2'
        ]
        
        for expected_type in expected_types:
            assert expected_type in all_types
    
    def test_validate_mcq_single(self):
        """Test MCQ single validation"""
        valid_question = {
            'id': 'q1',
            'type': 'mcq_single',
            'text': 'What is the answer?',
            'options': [
                {'id': 'a', 'text': 'Option A'},
                {'id': 'b', 'text': 'Option B'}
            ],
            'correctAnswer': 'a'
        }
        
        is_valid, errors = validate_question(valid_question, 'mcq_single')
        assert is_valid
        assert len(errors) == 0
    
    def test_validate_mcq_multiple(self):
        """Test MCQ multiple validation"""
        valid_question = {
            'id': 'q1',
            'type': 'mcq_multiple',
            'text': 'Select all correct answers',
            'options': [
                {'id': 'a', 'text': 'Option A'},
                {'id': 'b', 'text': 'Option B'},
                {'id': 'c', 'text': 'Option C'}
            ],
            'correctAnswers': ['a', 'c']
        }
        
        is_valid, errors = validate_question(valid_question, 'mcq_multiple')
        assert is_valid
        assert len(errors) == 0
    
    def test_validate_true_false_ng(self):
        """Test True/False/Not Given validation"""
        valid_question = {
            'id': 'q1',
            'type': 'true_false_ng',
            'text': 'The statement is true',
            'correctAnswer': 'True'
        }
        
        is_valid, errors = validate_question(valid_question, 'true_false_ng')
        assert is_valid
        assert len(errors) == 0
    
    def test_validate_writing_task1(self):
        """Test Writing Task 1 validation"""
        valid_question = {
            'id': 'q1',
            'type': 'writing_task1',
            'prompt': 'Describe the chart',
            'minWords': 150
        }
        
        is_valid, errors = validate_question(valid_question, 'writing_task1')
        assert is_valid
        assert len(errors) == 0
    
    def test_validate_writing_task2(self):
        """Test Writing Task 2 validation"""
        valid_question = {
            'id': 'q1',
            'type': 'writing_task2',
            'prompt': 'Write an essay about...',
            'minWords': 250
        }
        
        is_valid, errors = validate_question(valid_question, 'writing_task2')
        assert is_valid
        assert len(errors) == 0
    
    def test_missing_required_field(self):
        """Test validation fails when required field is missing"""
        invalid_question = {
            'id': 'q1',
            'type': 'mcq_single',
            'text': 'What is the answer?',
            # Missing 'options' and 'correctAnswer'
        }
        
        is_valid, errors = validate_question(invalid_question, 'mcq_single')
        assert not is_valid
        assert len(errors) > 0
        assert any('options' in error for error in errors)
    
    def test_invalid_field_type(self):
        """Test validation fails when field type is wrong"""
        invalid_question = {
            'id': 'q1',
            'type': 'mcq_single',
            'text': 'What is the answer?',
            'options': 'not a list',  # Should be list
            'correctAnswer': 'a'
        }
        
        is_valid, errors = validate_question(invalid_question, 'mcq_single')
        assert not is_valid
        assert any('options' in error for error in errors)
    
    def test_invalid_question_type(self):
        """Test validation fails for unknown question type"""
        question = {
            'id': 'q1',
            'type': 'unknown_type',
            'text': 'Test'
        }
        
        is_valid, errors = validate_question(question, 'unknown_type')
        assert not is_valid
        assert any('Unknown question type' in error for error in errors)
    
    def test_is_valid_question_type(self):
        """Test type validation function"""
        assert is_valid_question_type('mcq_single')
        assert is_valid_question_type('writing_task1')
        assert not is_valid_question_type('invalid_type')
    
    def test_get_question_type_schema(self):
        """Test schema retrieval"""
        schema = get_question_type_schema('mcq_single')
        assert schema is not None
        assert 'required_fields' in schema
        assert 'field_types' in schema
        
        invalid_schema = get_question_type_schema('invalid_type')
        assert invalid_schema is None
    
    def test_enum_constraint_validation(self):
        """Test enum constraint validation"""
        invalid_question = {
            'id': 'q1',
            'type': 'true_false_ng',
            'text': 'Test',
            'correctAnswer': 'Maybe'  # Invalid - must be True/False/Not Given
        }
        
        is_valid, errors = validate_question(invalid_question, 'true_false_ng')
        assert not is_valid
        assert any('correctAnswer' in error for error in errors)
    
    def test_numeric_constraint_validation(self):
        """Test numeric constraint validation"""
        invalid_question = {
            'id': 'q1',
            'type': 'writing_task1',
            'prompt': 'Test',
            'minWords': 50  # Too low - minimum is 100
        }
        
        is_valid, errors = validate_question(invalid_question, 'writing_task1')
        assert not is_valid
        assert any('minWords' in error for error in errors)


class TestAllQuestionTypes:
    """Test that all 18 question types can be validated"""
    
    @pytest.mark.parametrize("question_type", [
        'mcq_single', 'mcq_multiple', 'sentence_completion', 'form_completion',
        'table_completion', 'flowchart_completion', 'fill_gaps', 'fill_gaps_short',
        'matching', 'map_labelling', 'true_false_ng', 'matching_headings',
        'matching_features', 'matching_endings', 'note_completion', 'summary_completion',
        'writing_task1', 'writing_task2'
    ])
    def test_all_types_have_schema(self, question_type):
        """Test that all 18 types have validation schemas"""
        schema = get_question_type_schema(question_type)
        assert schema is not None
        assert 'required_fields' in schema
        assert 'field_types' in schema

