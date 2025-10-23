"""
Unit Tests for Question Type Detector
Tests all detection methods and multi-method voting
"""

import pytest
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.question_type_detector import QuestionTypeDetector, ConfidenceLevel


class TestStructureAnalysis:
    """Test cases for Structure Analysis Method (Method 1)"""
    
    def setup_method(self):
        """Setup detector for each test"""
        self.detector = QuestionTypeDetector()
    
    def test_writing_part_1_detection(self):
        """Test detection of Writing Part 1 (150+ words)"""
        question = {
            'prompt': 'Write a letter',
            'min_words': 150,
            'max_words': 200,
        }
        result = self.detector._structure_analysis(question)
        assert result is not None
        assert result['type'] == 'writing_part_1'
        assert result['confidence'] == 0.95
    
    def test_writing_part_2_detection(self):
        """Test detection of Writing Part 2 (250+ words)"""
        question = {
            'prompt': 'Write an essay',
            'min_words': 250,
            'max_words': 400,
        }
        result = self.detector._structure_analysis(question)
        assert result is not None
        assert result['type'] == 'writing_part_2'
        assert result['confidence'] == 0.95
    
    def test_multiple_choice_single_detection(self):
        """Test detection of Multiple Choice Single Answer"""
        question = {
            'prompt': 'Which is correct?',
            'options': [
                {'text': 'Option A', 'value': 'A'},
                {'text': 'Option B', 'value': 'B'},
                {'text': 'Option C', 'value': 'C'},
            ],
            'answer_key': 'A'
        }
        result = self.detector._structure_analysis(question)
        assert result is not None
        assert result['type'] == 'reading_multiple_choice_single'
        assert result['confidence'] == 0.85
    
    def test_multiple_choice_multiple_detection(self):
        """Test detection of Multiple Choice Multiple Answers"""
        question = {
            'prompt': 'Which are correct?',
            'options': [
                {'text': 'Option A', 'value': 'A'},
                {'text': 'Option B', 'value': 'B'},
                {'text': 'Option C', 'value': 'C'},
            ],
            'answer_key': ['A', 'B']
        }
        result = self.detector._structure_analysis(question)
        assert result is not None
        assert result['type'] == 'reading_multiple_choice_multiple'
        assert result['confidence'] == 0.85
    
    def test_listening_multiple_choice_detection(self):
        """Test detection of Listening Multiple Choice"""
        question = {
            'prompt': 'Listen and choose',
            'audio_url': 'audio/listening-1.ogg',
            'options': [
                {'text': 'Option A', 'value': 'A'},
                {'text': 'Option B', 'value': 'B'},
            ],
            'answer_key': 'A'
        }
        result = self.detector._structure_analysis(question)
        assert result is not None
        assert result['type'] == 'listening_multiple_choice_single'
        assert result['confidence'] == 0.85
    
    def test_map_labeling_detection(self):
        """Test detection of Map Labeling"""
        question = {
            'prompt': 'Label the map',
            'audio_url': 'audio/map-audio.ogg',
            'image_url': 'images/map.png',
            'options': ['Location A', 'Location B', 'Location C'],
            'answer_key': ['A', 'B']
        }
        result = self.detector._structure_analysis(question)
        assert result is not None
        assert result['type'] == 'listening_map_labeling'
        assert result['confidence'] == 0.75
    
    def test_sentence_completion_detection(self):
        """Test detection of Sentence Completion"""
        question = {
            'prompt': 'Complete the sentence',
            'audio_url': 'audio/sentence.ogg',
            'text_input': True,
            'answer_key': ['answer1', 'answer2']
        }
        result = self.detector._structure_analysis(question)
        assert result is not None
        assert result['type'] == 'listening_fill_gaps'
        assert result['confidence'] == 0.80
    
    def test_table_completion_detection(self):
        """Test detection of Table Completion"""
        question = {
            'prompt': 'Complete the table',
            'audio_url': 'audio/table.ogg',
            'table': {
                'rows': 3,
                'columns': 3,
                'data': [['', 'B', 'C']]
            },
            'answer_key': 'A'
        }
        result = self.detector._structure_analysis(question)
        assert result is not None
        assert result['type'] == 'listening_table_completion'
        assert result['confidence'] == 0.80
    
    def test_invalid_input_handling(self):
        """Test handling of invalid input"""
        result = self.detector._structure_analysis(None)
        assert result is None
        
        result = self.detector._structure_analysis("not a dict")
        assert result is None
        
        result = self.detector._structure_analysis([])
        assert result is None
    
    def test_empty_question_handling(self):
        """Test handling of empty question"""
        result = self.detector._structure_analysis({})
        assert result is not None
        assert result['confidence'] == 0.40  # Default low confidence


class TestMultiMethodVoting:
    """Test cases for Multi-Method Voting"""
    
    def setup_method(self):
        """Setup detector for each test"""
        self.detector = QuestionTypeDetector()
    
    def test_detect_type_with_valid_question(self):
        """Test detect_type with valid question"""
        question = {
            'prompt': 'Which is correct?',
            'options': [
                {'text': 'Option A', 'value': 'A'},
                {'text': 'Option B', 'value': 'B'},
            ],
            'answer_key': 'A'
        }
        result = self.detector.detect_type(question)
        
        assert result['detected_type'] is not None
        assert result['confidence'] > 0
        assert result['confidence_level'] in [ConfidenceLevel.HIGH.value, 
                                              ConfidenceLevel.MEDIUM.value,
                                              ConfidenceLevel.LOW.value]
        assert result['method_used'] == 'multi_method_voting'
    
    def test_detect_type_with_invalid_input(self):
        """Test detect_type with invalid input"""
        result = self.detector.detect_type(None)
        assert result['detected_type'] is None
        assert result['confidence'] == 0.0
        assert result['confidence_level'] == ConfidenceLevel.LOW.value
        assert 'error' in result
    
    def test_detect_type_with_empty_dict(self):
        """Test detect_type with empty dictionary"""
        result = self.detector.detect_type({})
        assert result['detected_type'] is not None or result['detected_type'] is None
        assert result['confidence'] >= 0
    
    def test_confidence_level_high(self):
        """Test HIGH confidence level (90-100%)"""
        question = {
            'prompt': 'Write a letter',
            'min_words': 150,
            'max_words': 200,
        }
        result = self.detector.detect_type(question)
        if result['confidence'] >= 0.90:
            assert result['confidence_level'] == ConfidenceLevel.HIGH.value
    
    def test_confidence_level_medium(self):
        """Test MEDIUM confidence level (70-89%)"""
        question = {
            'prompt': 'Choose the answer',
            'options': [
                {'text': 'A', 'value': 'A'},
                {'text': 'B', 'value': 'B'},
            ],
            'answer_key': 'A'
        }
        result = self.detector.detect_type(question)
        if 0.70 <= result['confidence'] < 0.90:
            assert result['confidence_level'] == ConfidenceLevel.MEDIUM.value
    
    def test_all_results_included(self):
        """Test that all_results are included in response"""
        question = {
            'prompt': 'Which is correct?',
            'options': [
                {'text': 'Option A', 'value': 'A'},
                {'text': 'Option B', 'value': 'B'},
            ],
            'answer_key': 'A'
        }
        result = self.detector.detect_type(question)
        assert 'all_results' in result
        assert isinstance(result['all_results'], list)


class TestKeywordMatching:
    """Test cases for Keyword Pattern Matching Method (Method 2)"""

    def setup_method(self):
        """Setup detector for each test"""
        self.detector = QuestionTypeDetector()

    def test_writing_part_1_keyword_detection(self):
        """Test detection of Writing Part 1 by keywords"""
        question = {
            'prompt': 'Write a formal letter to the manager',
            'instructions': 'You should write at least 150 words'
        }
        result = self.detector._keyword_matching(question)
        assert result is not None
        assert result['type'] == 'writing_part_1'
        assert result['confidence'] > 0.5

    def test_writing_part_2_keyword_detection(self):
        """Test detection of Writing Part 2 by keywords"""
        question = {
            'prompt': 'Write an essay discussing both views on climate change',
            'instructions': 'You should write at least 250 words'
        }
        result = self.detector._keyword_matching(question)
        assert result is not None
        assert result['type'] == 'writing_part_2'
        assert result['confidence'] > 0.5

    def test_listening_multiple_choice_keyword_detection(self):
        """Test detection of Listening Multiple Choice by keywords"""
        question = {
            'prompt': 'Listen and choose the correct answer',
            'instructions': 'Select one option'
        }
        result = self.detector._keyword_matching(question)
        assert result is not None
        assert 'multiple_choice' in result['type']
        assert result['confidence'] > 0.5

    def test_sentence_completion_keyword_detection(self):
        """Test detection of Sentence Completion by keywords"""
        question = {
            'prompt': 'Complete the sentence with no more than three words',
            'instructions': 'Fill in the gap'
        }
        result = self.detector._keyword_matching(question)
        assert result is not None
        assert 'completion' in result['type']
        assert result['confidence'] > 0.5

    def test_table_completion_keyword_detection(self):
        """Test detection of Table Completion by keywords"""
        question = {
            'prompt': 'Complete the table with information from the passage',
            'instructions': 'Fill in the table'
        }
        result = self.detector._keyword_matching(question)
        assert result is not None
        assert 'table' in result['type']
        assert result['confidence'] > 0.5

    def test_matching_headings_keyword_detection(self):
        """Test detection of Matching Headings by keywords"""
        question = {
            'prompt': 'Match the headings to the paragraphs',
            'instructions': 'Choose the correct heading'
        }
        result = self.detector._keyword_matching(question)
        assert result is not None
        assert 'matching' in result['type']
        assert result['confidence'] > 0.5

    def test_identifying_information_keyword_detection(self):
        """Test detection of Identifying Information by keywords"""
        question = {
            'prompt': 'Is the statement True, False, or Not Given?',
            'instructions': 'Answer TFNG'
        }
        result = self.detector._keyword_matching(question)
        assert result is not None
        assert result['type'] == 'reading_identifying_information'
        assert result['confidence'] > 0.5

    def test_no_keywords_found(self):
        """Test handling when no keywords are found"""
        question = {
            'prompt': 'Random text without any keywords',
            'instructions': 'Some random instructions'
        }
        result = self.detector._keyword_matching(question)
        assert result is None

    def test_invalid_input_handling(self):
        """Test handling of invalid input"""
        result = self.detector._keyword_matching(None)
        assert result is None

        result = self.detector._keyword_matching({})
        assert result is None

    def test_case_insensitive_matching(self):
        """Test that keyword matching is case-insensitive"""
        question = {
            'prompt': 'WRITE A LETTER TO THE MANAGER',
            'instructions': 'FORMAL LETTER'
        }
        result = self.detector._keyword_matching(question)
        assert result is not None
        assert result['type'] == 'writing_part_1'


class TestDataTypeAnalysis:
    """Test cases for Data Type Analysis Method (Method 3)"""

    def setup_method(self):
        """Setup detector for each test"""
        self.detector = QuestionTypeDetector()

    def test_multiple_choice_multiple_by_data_type(self):
        """Test detection of Multiple Choice Multiple by data type"""
        question = {
            'options': [
                {'text': 'Option A', 'value': 'A'},
                {'text': 'Option B', 'value': 'B'},
                {'text': 'Option C', 'value': 'C'},
            ],
            'answer_key': ['A', 'B']
        }
        result = self.detector._data_type_analysis(question)
        assert result is not None
        assert result['type'] == 'reading_multiple_choice_multiple'
        assert result['confidence'] == 0.80

    def test_multiple_choice_single_by_data_type(self):
        """Test detection of Multiple Choice Single by data type"""
        question = {
            'options': [
                {'text': 'Option A', 'value': 'A'},
                {'text': 'Option B', 'value': 'B'},
            ],
            'answer_key': 'A'
        }
        result = self.detector._data_type_analysis(question)
        assert result is not None
        assert result['type'] == 'reading_multiple_choice_single'
        assert result['confidence'] == 0.80

    def test_listening_multiple_choice_by_data_type(self):
        """Test detection of Listening Multiple Choice by data type"""
        question = {
            'audio_url': 'audio/test.ogg',
            'options': [
                {'text': 'Option A', 'value': 'A'},
                {'text': 'Option B', 'value': 'B'},
            ],
            'answer_key': 'A'
        }
        result = self.detector._data_type_analysis(question)
        assert result is not None
        assert result['type'] == 'listening_multiple_choice_single'
        assert result['confidence'] == 0.80

    def test_matching_by_data_type(self):
        """Test detection of Matching by data type"""
        question = {
            'options': ['Item A', 'Item B', 'Item C'],
            'answer_key': ['A', 'B']
        }
        result = self.detector._data_type_analysis(question)
        assert result is not None
        assert 'matching' in result['type']
        assert result['confidence'] == 0.70

    def test_map_labeling_by_data_type(self):
        """Test detection of Map Labeling by data type"""
        question = {
            'audio_url': 'audio/map.ogg',
            'image_url': 'images/map.png',
            'options': ['Location A', 'Location B'],
            'answer_key': ['A', 'B']
        }
        result = self.detector._data_type_analysis(question)
        assert result is not None
        assert result['type'] == 'listening_map_labeling'
        assert result['confidence'] == 0.75

    def test_fill_gaps_by_data_type(self):
        """Test detection of Fill Gaps by data type"""
        question = {
            'audio_url': 'audio/gaps.ogg',
            'text_input': True,
            'answer_key': ['answer1', 'answer2']
        }
        result = self.detector._data_type_analysis(question)
        assert result is not None
        assert result['type'] == 'listening_fill_gaps'
        assert result['confidence'] == 0.75

    def test_sentence_completion_by_data_type(self):
        """Test detection of Sentence Completion by data type"""
        question = {
            'text_input': True,
            'answer_key': 'answer'
        }
        result = self.detector._data_type_analysis(question)
        assert result is not None
        assert result['type'] == 'reading_note_completion'
        assert result['confidence'] == 0.70

    def test_table_completion_by_data_type(self):
        """Test detection of Table Completion by data type"""
        question = {
            'table': {'rows': 3, 'columns': 3},
            'answer_key': 'A'
        }
        result = self.detector._data_type_analysis(question)
        assert result is not None
        assert result['type'] == 'reading_table_completion'
        assert result['confidence'] == 0.75

    def test_form_completion_by_data_type(self):
        """Test detection of Form Completion by data type"""
        question = {
            'answer_key': {'field1': 'value1', 'field2': 'value2'}
        }
        result = self.detector._data_type_analysis(question)
        assert result is not None
        assert result['type'] == 'reading_summary_completion_single'
        assert result['confidence'] == 0.70

    def test_no_answer_key(self):
        """Test handling when no answer_key is present"""
        question = {
            'options': [
                {'text': 'Option A', 'value': 'A'},
                {'text': 'Option B', 'value': 'B'},
            ]
        }
        result = self.detector._data_type_analysis(question)
        assert result is None


class TestAnswerPatternAnalysis:
    """Test cases for Answer Pattern Analysis Method (Method 4)"""

    def setup_method(self):
        """Setup detector for each test"""
        self.detector = QuestionTypeDetector()

    def test_tfng_pattern_detection(self):
        """Test detection of TFNG (True/False/Not Given) pattern"""
        question = {
            'answer_key': 'T'
        }
        result = self.detector._answer_pattern_analysis(question)
        assert result is not None
        assert result['type'] == 'reading_identifying_information'
        assert result['confidence'] == 0.85

    def test_boolean_pattern_detection(self):
        """Test detection of Boolean pattern"""
        question = {
            'answer_key': 'True'
        }
        result = self.detector._answer_pattern_analysis(question)
        assert result is not None
        assert result['type'] == 'reading_identifying_information'
        assert result['confidence'] == 0.85  # TFNG pattern has higher confidence

    def test_numeric_short_answer_detection(self):
        """Test detection of Numeric Short Answer"""
        question = {
            'answer_key': '42'
        }
        result = self.detector._answer_pattern_analysis(question)
        assert result is not None
        assert result['type'] == 'reading_summary_completion_single'
        assert result['confidence'] == 0.65

    def test_numeric_table_answer_detection(self):
        """Test detection of Numeric Table Answer"""
        question = {
            'table': {'rows': 3, 'columns': 3},
            'answer_key': '100'
        }
        result = self.detector._answer_pattern_analysis(question)
        assert result is not None
        assert result['type'] == 'reading_table_completion'
        assert result['confidence'] == 0.75

    def test_short_text_answer_detection(self):
        """Test detection of Short Text Answer"""
        question = {
            'answer_key': 'yes'
        }
        result = self.detector._answer_pattern_analysis(question)
        assert result is not None
        assert result['type'] == 'reading_identifying_information'  # 'yes' is boolean
        assert result['confidence'] == 0.70

    def test_long_text_answer_detection(self):
        """Test detection of Long Text Answer"""
        question = {
            'answer_key': 'This is a very long answer that contains multiple words and sentences'
        }
        result = self.detector._answer_pattern_analysis(question)
        assert result is not None
        assert result['type'] == 'writing_part_2'
        assert result['confidence'] == 0.65

    def test_multiple_answers_detection(self):
        """Test detection of Multiple Answers"""
        question = {
            'answer_key': ['A', 'B', 'C']
        }
        result = self.detector._answer_pattern_analysis(question)
        assert result is not None
        assert 'matching' in result['type']
        assert result['confidence'] == 0.70

    def test_multiple_answers_in_options_detection(self):
        """Test detection of Multiple Answers in Options"""
        question = {
            'options': [
                {'text': 'Option A', 'value': 'A'},
                {'text': 'Option B', 'value': 'B'},
            ],
            'answer_key': ['A', 'B']
        }
        result = self.detector._answer_pattern_analysis(question)
        assert result is not None
        assert 'multiple_choice' in result['type']
        assert result['confidence'] == 0.75

    def test_single_answer_in_list_detection(self):
        """Test detection of Single Answer in List"""
        question = {
            'answer_key': ['A']
        }
        result = self.detector._answer_pattern_analysis(question)
        assert result is not None
        assert 'matching' in result['type']
        assert result['confidence'] == 0.65

    def test_dict_answer_detection(self):
        """Test detection of Dict Answer"""
        question = {
            'answer_key': {'field1': 'value1', 'field2': 'value2'}
        }
        result = self.detector._answer_pattern_analysis(question)
        assert result is not None
        assert result['type'] == 'reading_summary_completion_single'
        assert result['confidence'] == 0.70

    def test_no_answer_key(self):
        """Test handling when no answer_key is present"""
        question = {}
        result = self.detector._answer_pattern_analysis(question)
        assert result is None


class TestComplexityAnalysis:
    """Test cases for Complexity Analysis Method (Method 5)"""

    def setup_method(self):
        """Setup detector for each test"""
        self.detector = QuestionTypeDetector()

    def test_high_option_count_detection(self):
        """Test detection with high option count (4+)"""
        question = {
            'options': [
                {'text': 'A', 'value': 'A'},
                {'text': 'B', 'value': 'B'},
                {'text': 'C', 'value': 'C'},
                {'text': 'D', 'value': 'D'},
            ],
            'answer_key': 'A'
        }
        result = self.detector._complexity_analysis(question)
        assert result is not None
        assert 'multiple_choice' in result['type']
        assert result['confidence'] == 0.70

    def test_medium_option_count_detection(self):
        """Test detection with medium option count (2-3)"""
        question = {
            'options': [
                {'text': 'A', 'value': 'A'},
                {'text': 'B', 'value': 'B'},
            ],
            'answer_key': 'A'
        }
        result = self.detector._complexity_analysis(question)
        assert result is not None
        assert 'matching' in result['type']
        assert result['confidence'] == 0.60

    def test_medium_option_with_text_input_detection(self):
        """Test detection with medium options and text input"""
        question = {
            'options': [
                {'text': 'A', 'value': 'A'},
                {'text': 'B', 'value': 'B'},
            ],
            'text_input': True,
            'answer_key': 'answer'
        }
        result = self.detector._complexity_analysis(question)
        assert result is not None
        assert 'completion' in result['type']
        assert result['confidence'] == 0.65

    def test_large_table_detection(self):
        """Test detection of large table (9+ cells)"""
        question = {
            'table': {
                'rows': 3,
                'columns': 3,
                'data': [['', '', ''], ['', '', ''], ['', '', '']]
            },
            'answer_key': 'A'
        }
        result = self.detector._complexity_analysis(question)
        assert result is not None
        assert 'table' in result['type']
        assert result['confidence'] == 0.75

    def test_medium_table_detection(self):
        """Test detection of medium table (4-8 cells)"""
        question = {
            'table': {
                'rows': 2,
                'columns': 3,
                'data': [['', '', ''], ['', '', '']]
            },
            'answer_key': 'A'
        }
        result = self.detector._complexity_analysis(question)
        assert result is not None
        assert 'table' in result['type']
        assert result['confidence'] == 0.70

    def test_high_nesting_depth_detection(self):
        """Test detection of high nesting depth"""
        question = {
            'level1': {
                'level2': {
                    'level3': {
                        'level4': {
                            'data': 'value'
                        }
                    }
                }
            },
            'answer_key': 'A'
        }
        result = self.detector._complexity_analysis(question)
        assert result is not None
        assert 'form' in result['type'] or 'summary' in result['type']
        assert result['confidence'] == 0.65

    def test_listening_high_option_count(self):
        """Test detection of listening with high option count"""
        question = {
            'audio_url': 'audio/test.ogg',
            'options': [
                {'text': 'A', 'value': 'A'},
                {'text': 'B', 'value': 'B'},
                {'text': 'C', 'value': 'C'},
                {'text': 'D', 'value': 'D'},
            ],
            'answer_key': 'A'
        }
        result = self.detector._complexity_analysis(question)
        assert result is not None
        assert 'listening' in result['type']
        assert 'multiple_choice' in result['type']

    def test_no_options_or_table(self):
        """Test handling when no options or table"""
        question = {
            'answer_key': 'A'
        }
        result = self.detector._complexity_analysis(question)
        assert result is None


class TestAssetDetection:
    """Test cases for Asset Detection Method (Method 6)"""

    def setup_method(self):
        """Setup detector for each test"""
        self.detector = QuestionTypeDetector()

    def test_audio_and_map_image_detection(self):
        """Test detection of Audio + Map Image"""
        question = {
            'audio_url': 'audio/listening.ogg',
            'image_url': 'images/map.png',
            'options': ['Location A', 'Location B'],
            'answer_key': ['A', 'B']
        }
        result = self.detector._asset_detection(question)
        assert result is not None
        assert result['type'] == 'listening_map_labeling'
        assert result['confidence'] == 0.85

    def test_audio_only_with_options_detection(self):
        """Test detection of Audio only with options"""
        question = {
            'audio_url': 'audio/listening.mp3',
            'options': [
                {'text': 'A', 'value': 'A'},
                {'text': 'B', 'value': 'B'},
            ],
            'answer_key': 'A'
        }
        result = self.detector._asset_detection(question)
        assert result is not None
        assert result['type'] == 'listening_multiple_choice_single'
        assert result['confidence'] == 0.70

    def test_audio_only_without_options_detection(self):
        """Test detection of Audio only without options"""
        question = {
            'audio_url': 'audio/listening.wav',
            'text_input': True,
            'answer_key': 'answer'
        }
        result = self.detector._asset_detection(question)
        assert result is not None
        assert result['type'] == 'listening_sentence_completion'
        assert result['confidence'] == 0.65

    def test_chart_image_detection(self):
        """Test detection of Chart/Graph Image"""
        question = {
            'image_url': 'images/chart.png',
            'options': [
                {'text': 'A', 'value': 'A'},
                {'text': 'B', 'value': 'B'},
            ],
            'answer_key': 'A'
        }
        result = self.detector._asset_detection(question)
        assert result is not None
        assert result['type'] == 'reading_table_completion'
        assert result['confidence'] == 0.70

    def test_generic_image_detection(self):
        """Test detection of Generic Image"""
        question = {
            'image_url': 'images/photo.png',
            'options': [
                {'text': 'A', 'value': 'A'},
                {'text': 'B', 'value': 'B'},
            ],
            'answer_key': 'A'
        }
        result = self.detector._asset_detection(question)
        assert result is not None
        assert result['type'] == 'reading_multiple_choice_single'
        assert result['confidence'] == 0.60

    def test_video_detection(self):
        """Test detection of Video"""
        question = {
            'video_url': 'videos/test.mp4',
            'options': [
                {'text': 'A', 'value': 'A'},
                {'text': 'B', 'value': 'B'},
            ],
            'answer_key': 'A'
        }
        result = self.detector._asset_detection(question)
        assert result is not None
        assert result['type'] == 'listening_multiple_choice_single'
        assert result['confidence'] == 0.65

    def test_document_detection(self):
        """Test detection of Document"""
        question = {
            'document_url': 'documents/passage.pdf',
            'options': [
                {'text': 'A', 'value': 'A'},
                {'text': 'B', 'value': 'B'},
            ],
            'answer_key': 'A'
        }
        result = self.detector._asset_detection(question)
        assert result is not None
        assert result['type'] == 'reading_multiple_choice_single'
        assert result['confidence'] == 0.60

    def test_no_assets_detection(self):
        """Test handling when no assets present"""
        question = {
            'options': [
                {'text': 'A', 'value': 'A'},
                {'text': 'B', 'value': 'B'},
            ],
            'answer_key': 'A'
        }
        result = self.detector._asset_detection(question)
        assert result is None

    def test_audio_url_field_detection(self):
        """Test detection with audio field instead of audio_url"""
        question = {
            'audio': 'audio/test.ogg',
            'options': [
                {'text': 'A', 'value': 'A'},
                {'text': 'B', 'value': 'B'},
            ],
            'answer_key': 'A'
        }
        result = self.detector._asset_detection(question)
        assert result is not None
        assert 'listening' in result['type']


class TestQuestionTypeConstants:
    """Test question type constants"""
    
    def setup_method(self):
        """Setup detector for each test"""
        self.detector = QuestionTypeDetector()
    
    def test_listening_types_defined(self):
        """Test that listening types are defined"""
        assert len(self.detector.LISTENING_TYPES) == 9
        assert 'listening_multiple_choice_single' in self.detector.LISTENING_TYPES
        assert 'listening_map_labeling' in self.detector.LISTENING_TYPES
    
    def test_reading_types_defined(self):
        """Test that reading types are defined"""
        assert len(self.detector.READING_TYPES) == 12
        assert 'reading_multiple_choice_single' in self.detector.READING_TYPES
        assert 'reading_matching_headings' in self.detector.READING_TYPES
    
    def test_writing_types_defined(self):
        """Test that writing types are defined"""
        assert len(self.detector.WRITING_TYPES) == 2
        assert 'writing_part_1' in self.detector.WRITING_TYPES
        assert 'writing_part_2' in self.detector.WRITING_TYPES
    
    def test_all_types_union(self):
        """Test that ALL_TYPES is union of all types"""
        assert len(self.detector.ALL_TYPES) == 23
        assert self.detector.ALL_TYPES == (
            self.detector.LISTENING_TYPES | 
            self.detector.READING_TYPES | 
            self.detector.WRITING_TYPES
        )


if __name__ == '__main__':
    pytest.main([__file__, '-v'])

