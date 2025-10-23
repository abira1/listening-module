"""
Validation Service
Implements 4-layer validation system for question data
"""

from typing import Dict, List, Tuple, Optional
from enum import Enum
import os


class ErrorSeverity(Enum):
    """Error severity levels"""
    CRITICAL = "CRITICAL"  # Blocks deployment
    HIGH = "HIGH"          # Should be fixed
    MEDIUM = "MEDIUM"      # Should review
    LOW = "LOW"            # Nice to have


class ValidationService:
    """
    4-layer validation system for question data
    Layers: Schema, Data Type, Content, Asset
    """

    # Required fields for all questions
    REQUIRED_FIELDS = {'prompt', 'answer_key'}

    # Type-specific required fields
    TYPE_REQUIRED_FIELDS = {
        'listening_multiple_choice_single': {'options'},
        'listening_multiple_choice_multiple': {'options'},
        'listening_sentence_completion': {'text_input'},
        'listening_fill_gaps': {'text_input'},
        'listening_form_completion': {},
        'listening_table_completion': {'table'},
        'listening_matching': {'options'},
        'listening_map_labeling': {'image_url', 'options'},
        'reading_multiple_choice_single': {'options'},
        'reading_multiple_choice_multiple': {'options'},
        'reading_sentence_completion': {'text_input'},
        'reading_note_completion': {'text_input'},
        'reading_table_completion': {'table'},
        'reading_flowchart_completion': {'image_url'},
        'reading_summary_completion_single': {},
        'reading_summary_completion_multiple': {},
        'reading_matching_headings': {'options'},
        'reading_matching_sentence_endings': {'options'},
        'reading_matching_features': {'options'},
        'reading_identifying_information': {},
        'writing_part_1': {'min_words', 'max_words'},
        'writing_part_2': {'min_words', 'max_words'},
    }

    def __init__(self):
        """Initialize validation service"""
        self.errors = []
        self.warnings = []

    def validate_question(self, question_data: Dict, question_type: str = None, asset_path: str = None) -> Dict:
        """
        Main validation method using 4-layer validation

        Args:
            question_data: Question JSON data
            question_type: Detected question type
            asset_path: Path to assets directory

        Returns:
            Dictionary with validation results
        """
        self.errors = []
        self.warnings = []

        # Layer 1: Schema Validation
        self._validate_schema(question_data, question_type)

        # Layer 2: Data Type Validation
        self._validate_data_types(question_data)

        # Layer 3: Content Validation
        self._validate_content(question_data, question_type)

        # Layer 4: Asset Validation
        if asset_path:
            self._validate_assets(question_data, asset_path)

        # Categorize errors
        categorized = self._categorize_errors()

        return {
            'is_valid': len([e for e in self.errors if e['severity'] == ErrorSeverity.CRITICAL.value]) == 0,
            'errors': self.errors,
            'warnings': self.warnings,
            'summary': categorized
        }

    def _validate_schema(self, question_data: Dict, question_type: str = None) -> None:
        """Layer 1: Schema Validation"""
        if not isinstance(question_data, dict):
            self.errors.append({
                'field': 'root',
                'message': 'Question data must be a dictionary',
                'severity': ErrorSeverity.CRITICAL.value,
                'fix': 'Ensure question data is a valid JSON object'
            })
            return

        # Check required fields
        for field in self.REQUIRED_FIELDS:
            if field not in question_data:
                self.errors.append({
                    'field': field,
                    'message': f'Required field "{field}" is missing',
                    'severity': ErrorSeverity.CRITICAL.value,
                    'fix': f'Add the "{field}" field to the question'
                })

        # Check type-specific required fields
        if question_type and question_type in self.TYPE_REQUIRED_FIELDS:
            required = self.TYPE_REQUIRED_FIELDS[question_type]
            for field in required:
                if field not in question_data:
                    self.errors.append({
                        'field': field,
                        'message': f'Required field "{field}" for {question_type} is missing',
                        'severity': ErrorSeverity.HIGH.value,
                        'fix': f'Add the "{field}" field for this question type'
                    })

    def _validate_data_types(self, question_data: Dict) -> None:
        """Layer 2: Data Type Validation"""
        if not isinstance(question_data, dict):
            return  # Already caught in schema validation

        # Validate prompt is string
        if 'prompt' in question_data and not isinstance(question_data['prompt'], str):
            self.errors.append({
                'field': 'prompt',
                'message': 'Prompt must be a string',
                'severity': ErrorSeverity.HIGH.value,
                'fix': 'Convert prompt to string'
            })

        # Validate options is list
        if 'options' in question_data and not isinstance(question_data['options'], list):
            self.errors.append({
                'field': 'options',
                'message': 'Options must be a list',
                'severity': ErrorSeverity.HIGH.value,
                'fix': 'Convert options to a list'
            })

        # Validate answer_key format
        answer_key = question_data.get('answer_key')
        if answer_key is not None:
            if not isinstance(answer_key, (str, list, dict, int, float, bool)):
                self.errors.append({
                    'field': 'answer_key',
                    'message': 'Answer key has invalid type',
                    'severity': ErrorSeverity.HIGH.value,
                    'fix': 'Answer key must be string, list, dict, number, or boolean'
                })

        # Validate min_words and max_words are numbers
        for field in ['min_words', 'max_words']:
            if field in question_data and not isinstance(question_data[field], (int, float)):
                self.errors.append({
                    'field': field,
                    'message': f'{field} must be a number',
                    'severity': ErrorSeverity.HIGH.value,
                    'fix': f'Convert {field} to a number'
                })

    def _validate_content(self, question_data: Dict, question_type: str = None) -> None:
        """Layer 3: Content Validation"""
        if not isinstance(question_data, dict):
            return  # Already caught in schema validation

        # Validate prompt is not empty
        prompt = question_data.get('prompt', '')
        if isinstance(prompt, str) and len(prompt.strip()) == 0:
            self.errors.append({
                'field': 'prompt',
                'message': 'Prompt cannot be empty',
                'severity': ErrorSeverity.HIGH.value,
                'fix': 'Add content to the prompt field'
            })

        # Validate options have content
        options = question_data.get('options', [])
        if isinstance(options, list):
            if len(options) == 0:
                self.warnings.append({
                    'field': 'options',
                    'message': 'Options list is empty',
                    'severity': ErrorSeverity.MEDIUM.value,
                    'fix': 'Add options to the question'
                })
            else:
                for i, option in enumerate(options):
                    if isinstance(option, dict):
                        if 'text' in option and not option['text']:
                            self.warnings.append({
                                'field': f'options[{i}].text',
                                'message': 'Option text is empty',
                                'severity': ErrorSeverity.MEDIUM.value,
                                'fix': f'Add text to option {i}'
                            })
                        if 'value' in option and not option['value']:
                            self.warnings.append({
                                'field': f'options[{i}].value',
                                'message': 'Option value is empty',
                                'severity': ErrorSeverity.MEDIUM.value,
                                'fix': f'Add value to option {i}'
                            })

        # Validate answer_key is in options (if applicable)
        answer_key = question_data.get('answer_key')
        if answer_key and isinstance(options, list) and len(options) > 0:
            first_option = options[0]
            if isinstance(first_option, dict) and 'value' in first_option:
                option_values = [opt.get('value') for opt in options if isinstance(opt, dict)]
                if isinstance(answer_key, str) and answer_key not in option_values:
                    self.warnings.append({
                        'field': 'answer_key',
                        'message': f'Answer key "{answer_key}" not found in options',
                        'severity': ErrorSeverity.MEDIUM.value,
                        'fix': 'Ensure answer_key matches one of the option values'
                    })
                elif isinstance(answer_key, list):
                    for key in answer_key:
                        if key not in option_values:
                            self.warnings.append({
                                'field': 'answer_key',
                                'message': f'Answer key "{key}" not found in options',
                                'severity': ErrorSeverity.MEDIUM.value,
                                'fix': 'Ensure all answer_key values match option values'
                            })

        # Validate word count constraints
        min_words = question_data.get('min_words')
        max_words = question_data.get('max_words')
        if min_words and max_words and isinstance(min_words, (int, float)) and isinstance(max_words, (int, float)):
            if min_words > max_words:
                self.errors.append({
                    'field': 'min_words/max_words',
                    'message': 'min_words cannot be greater than max_words',
                    'severity': ErrorSeverity.HIGH.value,
                    'fix': 'Ensure min_words <= max_words'
                })

    def _validate_assets(self, question_data: Dict, asset_path: str) -> None:
        """Layer 4: Asset Validation"""
        # Check audio files
        for audio_field in ['audio_url', 'audio']:
            if audio_field in question_data:
                audio_url = question_data[audio_field]
                if isinstance(audio_url, str) and audio_url:
                    full_path = os.path.join(asset_path, audio_url)
                    if not os.path.exists(full_path):
                        self.errors.append({
                            'field': audio_field,
                            'message': f'Audio file not found: {audio_url}',
                            'severity': ErrorSeverity.CRITICAL.value,
                            'fix': f'Ensure audio file exists at {full_path}'
                        })

        # Check image files
        for image_field in ['image_url', 'image']:
            if image_field in question_data:
                image_url = question_data[image_field]
                if isinstance(image_url, str) and image_url:
                    full_path = os.path.join(asset_path, image_url)
                    if not os.path.exists(full_path):
                        self.errors.append({
                            'field': image_field,
                            'message': f'Image file not found: {image_url}',
                            'severity': ErrorSeverity.CRITICAL.value,
                            'fix': f'Ensure image file exists at {full_path}'
                        })

    def _categorize_errors(self) -> Dict:
        """Categorize errors by severity"""
        critical = [e for e in self.errors if e['severity'] == ErrorSeverity.CRITICAL.value]
        high = [e for e in self.errors if e['severity'] == ErrorSeverity.HIGH.value]
        medium = [e for e in self.warnings if e['severity'] == ErrorSeverity.MEDIUM.value]
        low = [e for e in self.warnings if e['severity'] == ErrorSeverity.LOW.value]

        return {
            'critical_count': len(critical),
            'high_count': len(high),
            'medium_count': len(medium),
            'low_count': len(low),
            'total_errors': len(self.errors),
            'total_warnings': len(self.warnings),
            'can_deploy': len(critical) == 0 and len(high) == 0
        }

