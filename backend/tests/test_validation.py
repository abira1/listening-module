"""
Unit Tests for Validation Service
Tests all 4 validation layers
"""

import pytest
import sys
import os
import tempfile

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.validation_service import ValidationService, ErrorSeverity


class TestSchemaValidation:
    """Test cases for Schema Validation Layer (Layer 1)"""
    
    def setup_method(self):
        """Setup validation service for each test"""
        self.validator = ValidationService()
    
    def test_valid_schema(self):
        """Test validation of valid schema"""
        question = {
            'prompt': 'Which is correct?',
            'answer_key': 'A'
        }
        result = self.validator.validate_question(question)
        assert result['is_valid'] == True
        assert len([e for e in result['errors'] if e['severity'] == ErrorSeverity.CRITICAL.value]) == 0
    
    def test_missing_prompt(self):
        """Test validation with missing prompt"""
        question = {
            'answer_key': 'A'
        }
        result = self.validator.validate_question(question)
        assert result['is_valid'] == False
        assert any(e['field'] == 'prompt' for e in result['errors'])
    
    def test_missing_answer_key(self):
        """Test validation with missing answer_key"""
        question = {
            'prompt': 'Which is correct?'
        }
        result = self.validator.validate_question(question)
        assert result['is_valid'] == False
        assert any(e['field'] == 'answer_key' for e in result['errors'])
    
    def test_invalid_root_type(self):
        """Test validation with invalid root type"""
        result = self.validator.validate_question("not a dict")
        assert result['is_valid'] == False
        assert any(e['field'] == 'root' for e in result['errors'])
    
    def test_type_specific_required_fields(self):
        """Test validation of type-specific required fields"""
        question = {
            'prompt': 'Which is correct?',
            'answer_key': 'A'
        }
        result = self.validator.validate_question(question, 'listening_multiple_choice_single')
        # Should have error for missing 'options'
        assert any(e['field'] == 'options' for e in result['errors'])


class TestDataTypeValidation:
    """Test cases for Data Type Validation Layer (Layer 2)"""
    
    def setup_method(self):
        """Setup validation service for each test"""
        self.validator = ValidationService()
    
    def test_valid_data_types(self):
        """Test validation of valid data types"""
        question = {
            'prompt': 'Which is correct?',
            'options': [
                {'text': 'A', 'value': 'A'},
                {'text': 'B', 'value': 'B'},
            ],
            'answer_key': 'A'
        }
        result = self.validator.validate_question(question)
        assert len([e for e in result['errors'] if 'type' in e['message'].lower()]) == 0
    
    def test_invalid_prompt_type(self):
        """Test validation with invalid prompt type"""
        question = {
            'prompt': 123,
            'answer_key': 'A'
        }
        result = self.validator.validate_question(question)
        # Should have error for invalid prompt type
        assert any(e['field'] == 'prompt' for e in result['errors'])
    
    def test_invalid_options_type(self):
        """Test validation with invalid options type"""
        question = {
            'prompt': 'Which is correct?',
            'options': 'not a list',
            'answer_key': 'A'
        }
        result = self.validator.validate_question(question)
        # Should have error for invalid options type
        assert any(e['field'] == 'options' for e in result['errors'])
    
    def test_invalid_answer_key_type(self):
        """Test validation with invalid answer_key type"""
        question = {
            'prompt': 'Which is correct?',
            'answer_key': {'invalid': 'type'}
        }
        result = self.validator.validate_question(question)
        # Dict is valid, so no error
        assert not any(e['field'] == 'answer_key' and 'type' in e['message'].lower() for e in result['errors'])
    
    def test_invalid_word_count_type(self):
        """Test validation with invalid word count type"""
        question = {
            'prompt': 'Write an essay',
            'min_words': 'not a number',
            'max_words': 500,
            'answer_key': 'essay'
        }
        result = self.validator.validate_question(question)
        assert any(e['field'] == 'min_words' for e in result['errors'])


class TestContentValidation:
    """Test cases for Content Validation Layer (Layer 3)"""
    
    def setup_method(self):
        """Setup validation service for each test"""
        self.validator = ValidationService()
    
    def test_empty_prompt(self):
        """Test validation with empty prompt"""
        question = {
            'prompt': '',
            'answer_key': 'A'
        }
        result = self.validator.validate_question(question)
        assert any(e['field'] == 'prompt' and 'empty' in e['message'].lower() for e in result['errors'])
    
    def test_empty_options_list(self):
        """Test validation with empty options list"""
        question = {
            'prompt': 'Which is correct?',
            'options': [],
            'answer_key': 'A'
        }
        result = self.validator.validate_question(question)
        assert any(w['field'] == 'options' and 'empty' in w['message'].lower() for w in result['warnings'])
    
    def test_empty_option_text(self):
        """Test validation with empty option text"""
        question = {
            'prompt': 'Which is correct?',
            'options': [
                {'text': '', 'value': 'A'},
                {'text': 'B', 'value': 'B'},
            ],
            'answer_key': 'A'
        }
        result = self.validator.validate_question(question)
        assert any('empty' in w['message'].lower() for w in result['warnings'])
    
    def test_answer_key_not_in_options(self):
        """Test validation when answer_key not in options"""
        question = {
            'prompt': 'Which is correct?',
            'options': [
                {'text': 'A', 'value': 'A'},
                {'text': 'B', 'value': 'B'},
            ],
            'answer_key': 'C'
        }
        result = self.validator.validate_question(question)
        assert any('not found' in w['message'].lower() for w in result['warnings'])
    
    def test_invalid_word_count_range(self):
        """Test validation with invalid word count range"""
        question = {
            'prompt': 'Write an essay',
            'min_words': 500,
            'max_words': 250,
            'answer_key': 'essay'
        }
        result = self.validator.validate_question(question)
        assert any(e['field'] == 'min_words/max_words' for e in result['errors'])


class TestAssetValidation:
    """Test cases for Asset Validation Layer (Layer 4)"""
    
    def setup_method(self):
        """Setup validation service for each test"""
        self.validator = ValidationService()
        # Create temporary directory for testing
        self.temp_dir = tempfile.mkdtemp()
    
    def teardown_method(self):
        """Cleanup temporary directory"""
        import shutil
        if os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir)
    
    def test_valid_audio_file(self):
        """Test validation with valid audio file"""
        # Create a dummy audio file
        audio_path = os.path.join(self.temp_dir, 'audio', 'test.ogg')
        os.makedirs(os.path.dirname(audio_path), exist_ok=True)
        with open(audio_path, 'w') as f:
            f.write('dummy audio')
        
        question = {
            'prompt': 'Listen and choose',
            'audio_url': 'audio/test.ogg',
            'options': [
                {'text': 'A', 'value': 'A'},
                {'text': 'B', 'value': 'B'},
            ],
            'answer_key': 'A'
        }
        result = self.validator.validate_question(question, asset_path=self.temp_dir)
        assert not any(e['field'] == 'audio_url' for e in result['errors'])
    
    def test_missing_audio_file(self):
        """Test validation with missing audio file"""
        question = {
            'prompt': 'Listen and choose',
            'audio_url': 'audio/missing.ogg',
            'options': [
                {'text': 'A', 'value': 'A'},
                {'text': 'B', 'value': 'B'},
            ],
            'answer_key': 'A'
        }
        result = self.validator.validate_question(question, asset_path=self.temp_dir)
        assert any(e['field'] == 'audio_url' and 'not found' in e['message'].lower() for e in result['errors'])
    
    def test_valid_image_file(self):
        """Test validation with valid image file"""
        # Create a dummy image file
        image_path = os.path.join(self.temp_dir, 'images', 'test.png')
        os.makedirs(os.path.dirname(image_path), exist_ok=True)
        with open(image_path, 'w') as f:
            f.write('dummy image')
        
        question = {
            'prompt': 'Look at the image',
            'image_url': 'images/test.png',
            'options': [
                {'text': 'A', 'value': 'A'},
                {'text': 'B', 'value': 'B'},
            ],
            'answer_key': 'A'
        }
        result = self.validator.validate_question(question, asset_path=self.temp_dir)
        assert not any(e['field'] == 'image_url' for e in result['errors'])
    
    def test_missing_image_file(self):
        """Test validation with missing image file"""
        question = {
            'prompt': 'Look at the image',
            'image_url': 'images/missing.png',
            'options': [
                {'text': 'A', 'value': 'A'},
                {'text': 'B', 'value': 'B'},
            ],
            'answer_key': 'A'
        }
        result = self.validator.validate_question(question, asset_path=self.temp_dir)
        assert any(e['field'] == 'image_url' and 'not found' in e['message'].lower() for e in result['errors'])


class TestErrorCategorization:
    """Test cases for Error Categorization"""
    
    def setup_method(self):
        """Setup validation service for each test"""
        self.validator = ValidationService()
    
    def test_critical_errors_block_deployment(self):
        """Test that critical errors block deployment"""
        question = {
            'answer_key': 'A'
        }
        result = self.validator.validate_question(question)
        assert result['is_valid'] == False
        assert result['summary']['can_deploy'] == False
    
    def test_high_errors_block_deployment(self):
        """Test that high errors block deployment"""
        question = {
            'prompt': 'Which is correct?',
            'options': 'not a list',
            'answer_key': 'A'
        }
        result = self.validator.validate_question(question)
        assert result['summary']['can_deploy'] == False
    
    def test_medium_warnings_allow_deployment(self):
        """Test that medium warnings allow deployment"""
        question = {
            'prompt': 'Which is correct?',
            'options': [
                {'text': 'A', 'value': 'A'},
                {'text': 'B', 'value': 'B'},
            ],
            'answer_key': 'C'  # Not in options - warning
        }
        result = self.validator.validate_question(question)
        assert result['is_valid'] == True
        assert result['summary']['can_deploy'] == True
        assert result['summary']['medium_count'] > 0


if __name__ == '__main__':
    pytest.main([__file__, '-v'])

