"""
Question Type Detector Service
Implements 6 detection methods with multi-method voting for AI-powered question type detection
"""

from typing import Dict, List, Tuple, Optional
from enum import Enum
import json


class ConfidenceLevel(Enum):
    """Confidence level enumeration"""
    HIGH = "HIGH"      # 90-100%
    MEDIUM = "MEDIUM"  # 70-89%
    LOW = "LOW"        # 50-69%


class QuestionTypeDetector:
    """
    AI-powered question type detector using 6 detection methods
    with multi-method voting and confidence scoring
    """
    
    # Question type definitions
    LISTENING_TYPES = {
        'listening_multiple_choice_single',
        'listening_multiple_choice_multiple',
        'listening_sentence_completion',
        'listening_fill_gaps',
        'listening_fill_gaps_short_answer',
        'listening_form_completion',
        'listening_table_completion',
        'listening_matching',
        'listening_map_labeling',
    }
    
    READING_TYPES = {
        'reading_multiple_choice_single',
        'reading_multiple_choice_multiple',
        'reading_sentence_completion',
        'reading_note_completion',
        'reading_table_completion',
        'reading_flowchart_completion',
        'reading_summary_completion_single',
        'reading_summary_completion_multiple',
        'reading_matching_headings',
        'reading_matching_sentence_endings',
        'reading_matching_features',
        'reading_identifying_information',
    }
    
    WRITING_TYPES = {
        'writing_part_1',
        'writing_part_2',
    }
    
    ALL_TYPES = LISTENING_TYPES | READING_TYPES | WRITING_TYPES
    
    def __init__(self):
        """Initialize the detector"""
        self.detection_methods = [
            ('structure_analysis', self._structure_analysis, 0.25),
            ('keyword_matching', self._keyword_matching, 0.20),
            ('data_type_analysis', self._data_type_analysis, 0.20),
            ('answer_pattern_analysis', self._answer_pattern_analysis, 0.15),
            ('complexity_analysis', self._complexity_analysis, 0.10),
            ('asset_detection', self._asset_detection, 0.10),
        ]
    
    def detect_type(self, question_data: Dict) -> Dict:
        """
        Main detection method using multi-method voting
        
        Args:
            question_data: Question JSON data
            
        Returns:
            Dictionary with detected_type, confidence, method_used, all_results
        """
        if not isinstance(question_data, dict):
            return {
                'detected_type': None,
                'confidence': 0.0,
                'confidence_level': ConfidenceLevel.LOW.value,
                'method_used': 'error',
                'error': 'Invalid question data format',
                'all_results': []
            }
        
        # Run all detection methods
        results = []
        for method_name, method_func, weight in self.detection_methods:
            try:
                result = method_func(question_data)
                if result:
                    result['method'] = method_name
                    result['weight'] = weight
                    results.append(result)
            except Exception as e:
                # Log error but continue with other methods
                pass
        
        # Perform multi-method voting
        if not results:
            return {
                'detected_type': None,
                'confidence': 0.0,
                'confidence_level': ConfidenceLevel.LOW.value,
                'method_used': 'none',
                'error': 'No detection methods succeeded',
                'all_results': []
            }
        
        # Calculate weighted votes
        type_votes = {}
        for result in results:
            detected_type = result.get('type')
            confidence = result.get('confidence', 0.0)
            weight = result.get('weight', 1.0)
            
            if detected_type:
                weighted_confidence = confidence * weight
                if detected_type not in type_votes:
                    type_votes[detected_type] = {'total_confidence': 0, 'count': 0, 'methods': []}
                
                type_votes[detected_type]['total_confidence'] += weighted_confidence
                type_votes[detected_type]['count'] += 1
                type_votes[detected_type]['methods'].append(result['method'])
        
        # Find best match
        if not type_votes:
            return {
                'detected_type': None,
                'confidence': 0.0,
                'confidence_level': ConfidenceLevel.LOW.value,
                'method_used': 'voting',
                'error': 'No valid types detected',
                'all_results': results
            }
        
        best_type = max(type_votes.items(), key=lambda x: x[1]['total_confidence'])
        detected_type = best_type[0]
        total_confidence = best_type[1]['total_confidence']
        methods_used = best_type[1]['methods']
        
        # Normalize confidence to 0-1 range
        final_confidence = min(total_confidence / len(methods_used), 1.0)
        
        # Determine confidence level
        if final_confidence >= 0.90:
            confidence_level = ConfidenceLevel.HIGH.value
        elif final_confidence >= 0.70:
            confidence_level = ConfidenceLevel.MEDIUM.value
        else:
            confidence_level = ConfidenceLevel.LOW.value
        
        return {
            'detected_type': detected_type,
            'confidence': round(final_confidence, 3),
            'confidence_level': confidence_level,
            'method_used': 'multi_method_voting',
            'methods': methods_used,
            'all_results': results
        }
    
    def _structure_analysis(self, question_data: Dict) -> Optional[Dict]:
        """
        METHOD 1: Structure Analysis
        Analyze question payload structure and check for specific field combinations
        
        Args:
            question_data: Question JSON data
            
        Returns:
            Dictionary with detected type and confidence, or None
        """
        try:
            # Check for required base fields
            if not isinstance(question_data, dict):
                return None
            
            # Get question structure
            has_prompt = 'prompt' in question_data
            has_options = 'options' in question_data
            has_answer_key = 'answer_key' in question_data
            has_audio = 'audio_url' in question_data or 'audio' in question_data
            has_image = 'image_url' in question_data or 'image' in question_data
            has_text_input = 'text_input' in question_data
            has_table = 'table' in question_data
            has_word_count = 'min_words' in question_data or 'max_words' in question_data
            
            # Analyze options structure
            options = question_data.get('options', [])
            if isinstance(options, list) and len(options) > 0:
                first_option = options[0]
                has_option_text = isinstance(first_option, dict) and 'text' in first_option
                has_option_value = isinstance(first_option, dict) and 'value' in first_option
                option_count = len(options)
            else:
                has_option_text = False
                has_option_value = False
                option_count = 0
            
            # Analyze answer key structure
            answer_key = question_data.get('answer_key')
            is_array_answer = isinstance(answer_key, list)
            is_string_answer = isinstance(answer_key, str)
            
            # DETECTION LOGIC
            
            # Writing questions: have word count requirements
            if has_word_count and has_prompt and not has_options:
                return {
                    'type': 'writing_part_1' if question_data.get('min_words', 0) < 200 else 'writing_part_2',
                    'confidence': 0.95
                }
            
            # Multiple choice: has options with text/value
            if has_options and has_option_text and has_option_value and has_answer_key:
                if is_array_answer:
                    return {
                        'type': 'listening_multiple_choice_multiple' if has_audio else 'reading_multiple_choice_multiple',
                        'confidence': 0.85
                    }
                else:
                    return {
                        'type': 'listening_multiple_choice_single' if has_audio else 'reading_multiple_choice_single',
                        'confidence': 0.85
                    }
            
            # Matching questions: has options but no text/value structure
            if has_options and not has_option_text and not has_option_value:
                if has_image:
                    return {
                        'type': 'listening_map_labeling' if has_audio else 'reading_matching_headings',
                        'confidence': 0.75
                    }
                else:
                    return {
                        'type': 'listening_matching' if has_audio else 'reading_matching_sentence_endings',
                        'confidence': 0.70
                    }
            
            # Text entry: has text_input field
            if has_text_input and has_prompt:
                if is_array_answer:
                    return {
                        'type': 'listening_fill_gaps' if has_audio else 'reading_sentence_completion',
                        'confidence': 0.80
                    }
                else:
                    return {
                        'type': 'listening_sentence_completion' if has_audio else 'reading_note_completion',
                        'confidence': 0.75
                    }
            
            # Table questions: has table field
            if has_table:
                return {
                    'type': 'listening_table_completion' if has_audio else 'reading_table_completion',
                    'confidence': 0.80
                }
            
            # Audio-based: has audio
            if has_audio and has_prompt:
                return {
                    'type': 'listening_multiple_choice_single',
                    'confidence': 0.60
                }
            
            # Default: low confidence
            return {
                'type': 'reading_multiple_choice_single',
                'confidence': 0.40
            }
            
        except Exception as e:
            return None
    
    def _keyword_matching(self, question_data: Dict) -> Optional[Dict]:
        """
        METHOD 2: Keyword Pattern Matching
        Extract keywords from prompt/instructions and match against type-specific patterns

        Args:
            question_data: Question JSON data

        Returns:
            Dictionary with detected type and confidence, or None
        """
        try:
            # Extract text from question
            prompt = str(question_data.get('prompt', '')).lower()
            instructions = str(question_data.get('instructions', '')).lower()
            text = prompt + ' ' + instructions

            # Define keyword patterns for each question type
            keyword_patterns = {
                'writing_part_1': [
                    'write a letter', 'write an email', 'write a note',
                    'formal letter', 'informal letter', 'business letter',
                    'complaint letter', 'thank you letter'
                ],
                'writing_part_2': [
                    'write an essay', 'write a report', 'write a proposal',
                    'discuss both views', 'advantages and disadvantages',
                    'problem and solution', 'opinion essay'
                ],
                'listening_multiple_choice_single': [
                    'choose one answer', 'select the correct answer',
                    'choose the correct answer', 'listen and choose',
                    'which one', 'what is', 'who is', 'where is',
                    'when is', 'why', 'how'
                ],
                'listening_multiple_choice_multiple': [
                    'choose two', 'choose three', 'select all that apply',
                    'which of the following', 'more than one'
                ],
                'listening_sentence_completion': [
                    'complete the sentence', 'fill in the gap',
                    'complete the following', 'write no more than'
                ],
                'listening_fill_gaps': [
                    'fill in the gaps', 'complete the notes',
                    'fill in the blanks', 'write the missing words'
                ],
                'listening_form_completion': [
                    'complete the form', 'fill in the form',
                    'form completion', 'application form'
                ],
                'listening_table_completion': [
                    'complete the table', 'fill in the table',
                    'table completion', 'complete the chart'
                ],
                'listening_matching': [
                    'match the', 'matching', 'connect the',
                    'pair the', 'associate'
                ],
                'listening_map_labeling': [
                    'label the map', 'mark the location',
                    'identify the location', 'map labeling'
                ],
                'reading_multiple_choice_single': [
                    'choose one answer', 'select the correct answer',
                    'which statement', 'according to the text'
                ],
                'reading_multiple_choice_multiple': [
                    'choose two', 'choose three', 'select all',
                    'which statements'
                ],
                'reading_sentence_completion': [
                    'complete the sentence', 'finish the sentence',
                    'complete the following sentence'
                ],
                'reading_note_completion': [
                    'complete the notes', 'fill in the notes',
                    'note completion'
                ],
                'reading_table_completion': [
                    'complete the table', 'fill in the table',
                    'table completion'
                ],
                'reading_flowchart_completion': [
                    'complete the flowchart', 'fill in the flowchart',
                    'flowchart completion'
                ],
                'reading_summary_completion_single': [
                    'complete the summary', 'fill in the summary',
                    'summary completion'
                ],
                'reading_summary_completion_multiple': [
                    'complete the summary', 'choose from the list',
                    'summary completion'
                ],
                'reading_matching_headings': [
                    'match the headings', 'matching headings',
                    'choose the heading'
                ],
                'reading_matching_sentence_endings': [
                    'match the sentence endings', 'complete the sentences',
                    'sentence endings'
                ],
                'reading_matching_features': [
                    'match the features', 'matching features',
                    'which paragraph'
                ],
                'reading_identifying_information': [
                    'true false not given', 'tfng', 'identify',
                    'is the statement', 'according to the passage'
                ],
            }

            # Find matching patterns
            best_match = None
            best_score = 0

            for question_type, keywords in keyword_patterns.items():
                score = 0
                for keyword in keywords:
                    if keyword in text:
                        score += 1

                if score > best_score:
                    best_score = score
                    best_match = question_type

            # Return result if match found
            if best_match and best_score > 0:
                # Confidence based on number of matching keywords
                confidence = min(0.95, 0.5 + (best_score * 0.15))
                return {
                    'type': best_match,
                    'confidence': confidence,
                    'keywords_matched': best_score
                }

            return None

        except Exception as e:
            return None
    
    def _data_type_analysis(self, question_data: Dict) -> Optional[Dict]:
        """
        METHOD 3: Data Type Analysis
        Analyze answer_key format, check options structure

        Args:
            question_data: Question JSON data

        Returns:
            Dictionary with detected type and confidence, or None
        """
        try:
            answer_key = question_data.get('answer_key')
            options = question_data.get('options', [])
            has_audio = 'audio_url' in question_data or 'audio' in question_data

            # Analyze answer_key type
            is_list_answer = isinstance(answer_key, list)
            is_string_answer = isinstance(answer_key, str)
            is_dict_answer = isinstance(answer_key, dict)

            # Analyze options structure
            if isinstance(options, list) and len(options) > 0:
                first_option = options[0]
                has_text_value = isinstance(first_option, dict) and 'text' in first_option and 'value' in first_option
                has_only_text = isinstance(first_option, dict) and 'text' in first_option and 'value' not in first_option
                is_string_options = isinstance(first_option, str)
                option_count = len(options)
            else:
                has_text_value = False
                has_only_text = False
                is_string_options = False
                option_count = 0

            # Check for text input field
            has_text_input = 'text_input' in question_data

            # Check for table structure
            has_table = 'table' in question_data

            # DETECTION LOGIC

            # Multiple answers (array) with text/value options = Multiple Choice Multiple
            if is_list_answer and has_text_value and option_count >= 2:
                return {
                    'type': 'listening_multiple_choice_multiple' if has_audio else 'reading_multiple_choice_multiple',
                    'confidence': 0.80
                }

            # Single answer (string) with text/value options = Multiple Choice Single
            if is_string_answer and has_text_value and option_count >= 2:
                return {
                    'type': 'listening_multiple_choice_single' if has_audio else 'reading_multiple_choice_single',
                    'confidence': 0.80
                }

            # List answer with string options = Matching or Labeling
            if is_list_answer and is_string_options:
                if 'image_url' in question_data or 'image' in question_data:
                    return {
                        'type': 'listening_map_labeling' if has_audio else 'reading_matching_headings',
                        'confidence': 0.75
                    }
                else:
                    return {
                        'type': 'listening_matching' if has_audio else 'reading_matching_sentence_endings',
                        'confidence': 0.70
                    }

            # Text input with list answer = Fill Gaps
            if has_text_input and is_list_answer:
                return {
                    'type': 'listening_fill_gaps' if has_audio else 'reading_sentence_completion',
                    'confidence': 0.75
                }

            # Text input with string answer = Sentence Completion
            if has_text_input and is_string_answer:
                return {
                    'type': 'listening_sentence_completion' if has_audio else 'reading_note_completion',
                    'confidence': 0.70
                }

            # Table with answer key = Table Completion
            if has_table and answer_key is not None:
                return {
                    'type': 'listening_table_completion' if has_audio else 'reading_table_completion',
                    'confidence': 0.75
                }

            # Dict answer = Form Completion
            if is_dict_answer:
                return {
                    'type': 'listening_form_completion' if has_audio else 'reading_summary_completion_single',
                    'confidence': 0.70
                }

            return None

        except Exception as e:
            return None
    
    def _answer_pattern_analysis(self, question_data: Dict) -> Optional[Dict]:
        """
        METHOD 4: Answer Pattern Analysis
        Analyze answer patterns and detect matching patterns

        Args:
            question_data: Question JSON data

        Returns:
            Dictionary with detected type and confidence, or None
        """
        try:
            answer_key = question_data.get('answer_key')
            options = question_data.get('options', [])
            has_audio = 'audio_url' in question_data or 'audio' in question_data

            if answer_key is None:
                return None

            # Analyze answer pattern
            is_list_answer = isinstance(answer_key, list)
            is_string_answer = isinstance(answer_key, str)
            is_dict_answer = isinstance(answer_key, dict)

            # Check answer length patterns
            if is_string_answer:
                answer_length = len(str(answer_key))
                is_short_answer = answer_length <= 5
                is_long_answer = answer_length > 20
            else:
                answer_length = 0
                is_short_answer = False
                is_long_answer = False

            # Check if answer is numeric
            if is_string_answer:
                try:
                    float(answer_key)
                    is_numeric_answer = True
                except (ValueError, TypeError):
                    is_numeric_answer = False
            else:
                is_numeric_answer = False

            # Check if answer is boolean-like
            is_boolean_answer = is_string_answer and answer_key.lower() in ['true', 'false', 'yes', 'no']

            # Check if answer is TFNG (True/False/Not Given)
            is_tfng_answer = is_string_answer and answer_key.upper() in ['T', 'F', 'NG', 'TRUE', 'FALSE', 'NOT GIVEN']

            # Check if answer matches option values
            if isinstance(options, list) and len(options) > 0:
                first_option = options[0]
                if isinstance(first_option, dict) and 'value' in first_option:
                    option_values = [opt.get('value') for opt in options if isinstance(opt, dict)]
                    answer_in_options = answer_key in option_values if is_string_answer else any(a in option_values for a in answer_key) if is_list_answer else False
                else:
                    answer_in_options = False
            else:
                answer_in_options = False

            # DETECTION LOGIC

            # TFNG pattern = Identifying Information
            if is_tfng_answer:
                return {
                    'type': 'reading_identifying_information',
                    'confidence': 0.85
                }

            # Boolean answer = Identifying Information or Yes/No
            if is_boolean_answer:
                return {
                    'type': 'reading_identifying_information',
                    'confidence': 0.70
                }

            # Numeric answer = Form Completion or Table Completion
            if is_numeric_answer and is_short_answer:
                if 'table' in question_data:
                    return {
                        'type': 'listening_table_completion' if has_audio else 'reading_table_completion',
                        'confidence': 0.75
                    }
                else:
                    return {
                        'type': 'listening_form_completion' if has_audio else 'reading_summary_completion_single',
                        'confidence': 0.65
                    }

            # Short answer = Sentence Completion or Note Completion
            if is_short_answer and is_string_answer:
                return {
                    'type': 'listening_sentence_completion' if has_audio else 'reading_note_completion',
                    'confidence': 0.70
                }

            # Long answer = Summary Completion or Writing
            if is_long_answer and is_string_answer:
                return {
                    'type': 'writing_part_2' if not has_audio else 'reading_summary_completion_single',
                    'confidence': 0.65
                }

            # Multiple answers = Multiple Choice Multiple or Matching
            if is_list_answer and len(answer_key) > 1:
                if answer_in_options:
                    return {
                        'type': 'listening_multiple_choice_multiple' if has_audio else 'reading_multiple_choice_multiple',
                        'confidence': 0.75
                    }
                else:
                    return {
                        'type': 'listening_matching' if has_audio else 'reading_matching_sentence_endings',
                        'confidence': 0.70
                    }

            # Single answer in list = Matching
            if is_list_answer and len(answer_key) == 1:
                return {
                    'type': 'listening_matching' if has_audio else 'reading_matching_headings',
                    'confidence': 0.65
                }

            # Dict answer = Form Completion
            if is_dict_answer:
                return {
                    'type': 'listening_form_completion' if has_audio else 'reading_summary_completion_single',
                    'confidence': 0.70
                }

            return None

        except Exception as e:
            return None
    
    def _complexity_analysis(self, question_data: Dict) -> Optional[Dict]:
        """
        METHOD 5: Complexity Analysis
        Count options/items, analyze nesting depth

        Args:
            question_data: Question JSON data

        Returns:
            Dictionary with detected type and confidence, or None
        """
        try:
            options = question_data.get('options', [])
            table = question_data.get('table')
            has_audio = 'audio_url' in question_data or 'audio' in question_data

            # Count options
            option_count = len(options) if isinstance(options, list) else 0

            # Analyze table structure
            if isinstance(table, dict):
                rows = table.get('rows', 0)
                columns = table.get('columns', 0)
                table_size = rows * columns if rows and columns else 0
            else:
                table_size = 0

            # Analyze nesting depth
            def get_nesting_depth(obj, max_depth=0):
                if isinstance(obj, dict):
                    if not obj:
                        return max_depth
                    return max(get_nesting_depth(v, max_depth + 1) for v in obj.values())
                elif isinstance(obj, list):
                    if not obj:
                        return max_depth
                    return max(get_nesting_depth(item, max_depth + 1) for item in obj)
                else:
                    return max_depth

            nesting_depth = get_nesting_depth(question_data)

            # DETECTION LOGIC

            # High option count (4+) = Multiple Choice
            if option_count >= 4:
                answer_key = question_data.get('answer_key')
                is_multiple = isinstance(answer_key, list)
                return {
                    'type': 'listening_multiple_choice_multiple' if (has_audio and is_multiple) else 'listening_multiple_choice_single' if has_audio else 'reading_multiple_choice_multiple' if is_multiple else 'reading_multiple_choice_single',
                    'confidence': 0.70
                }

            # Medium option count (2-3) = Matching or Sentence Completion
            if 2 <= option_count <= 3:
                if 'text_input' in question_data:
                    return {
                        'type': 'listening_sentence_completion' if has_audio else 'reading_note_completion',
                        'confidence': 0.65
                    }
                else:
                    return {
                        'type': 'listening_matching' if has_audio else 'reading_matching_sentence_endings',
                        'confidence': 0.60
                    }

            # Large table (9+ cells) = Table Completion
            if table_size >= 9:
                return {
                    'type': 'listening_table_completion' if has_audio else 'reading_table_completion',
                    'confidence': 0.75
                }

            # Medium table (4-8 cells) = Table Completion
            if 4 <= table_size < 9:
                return {
                    'type': 'listening_table_completion' if has_audio else 'reading_table_completion',
                    'confidence': 0.70
                }

            # High nesting depth (4+) = Complex structure (Form or Summary)
            if nesting_depth >= 4:
                return {
                    'type': 'listening_form_completion' if has_audio else 'reading_summary_completion_single',
                    'confidence': 0.65
                }

            return None

        except Exception as e:
            return None
    
    def _asset_detection(self, question_data: Dict) -> Optional[Dict]:
        """
        METHOD 6: Asset Detection
        Check for audio files, images, detect visual elements

        Args:
            question_data: Question JSON data

        Returns:
            Dictionary with detected type and confidence, or None
        """
        try:
            # Check for audio
            has_audio = 'audio_url' in question_data or 'audio' in question_data
            audio_url = question_data.get('audio_url', '') or question_data.get('audio', '')

            # Check for images
            has_image = 'image_url' in question_data or 'image' in question_data
            image_url = question_data.get('image_url', '') or question_data.get('image', '')

            # Check for video
            has_video = 'video_url' in question_data or 'video' in question_data

            # Check for document
            has_document = 'document_url' in question_data or 'pdf_url' in question_data

            # Analyze audio type
            if has_audio:
                audio_lower = str(audio_url).lower()
                is_listening_audio = any(ext in audio_lower for ext in ['.ogg', '.mp3', '.wav', '.m4a'])
            else:
                is_listening_audio = False

            # Analyze image type
            if has_image:
                image_lower = str(image_url).lower()
                is_map_image = any(keyword in image_lower for keyword in ['map', 'location', 'diagram', 'floor', 'layout'])
                is_chart_image = any(keyword in image_lower for keyword in ['chart', 'graph', 'table', 'figure'])
            else:
                is_map_image = False
                is_chart_image = False

            # Check for options
            options = question_data.get('options', [])
            option_count = len(options) if isinstance(options, list) else 0

            # DETECTION LOGIC

            # Audio + Map Image = Map Labeling
            if has_audio and is_listening_audio and has_image and is_map_image:
                return {
                    'type': 'listening_map_labeling',
                    'confidence': 0.85
                }

            # Audio only = Listening type
            if has_audio and is_listening_audio and not has_image:
                if option_count >= 2:
                    return {
                        'type': 'listening_multiple_choice_single',
                        'confidence': 0.70
                    }
                else:
                    return {
                        'type': 'listening_sentence_completion',
                        'confidence': 0.65
                    }

            # Image + Chart = Chart/Table related
            if has_image and is_chart_image:
                return {
                    'type': 'reading_table_completion',
                    'confidence': 0.70
                }

            # Image only (not map/chart) = Reading type
            if has_image and not is_map_image and not is_chart_image:
                return {
                    'type': 'reading_multiple_choice_single',
                    'confidence': 0.60
                }

            # Video = Listening type
            if has_video:
                return {
                    'type': 'listening_multiple_choice_single',
                    'confidence': 0.65
                }

            # Document = Reading type
            if has_document:
                return {
                    'type': 'reading_multiple_choice_single',
                    'confidence': 0.60
                }

            return None

        except Exception as e:
            return None

