"""
Unit Tests for Error Reporter Service
Tests error report generation and formatting
"""

import pytest
import sys
import os
import json

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.error_reporter import ErrorReporter


class TestErrorReportGeneration:
    """Test cases for Error Report Generation"""
    
    def setup_method(self):
        """Setup error reporter for each test"""
        self.reporter = ErrorReporter()
    
    def test_generate_valid_report(self):
        """Test generating report for valid question"""
        validation_result = {
            'is_valid': True,
            'errors': [],
            'warnings': [],
            'summary': {
                'critical_count': 0,
                'high_count': 0,
                'medium_count': 0,
                'low_count': 0,
                'total_errors': 0,
                'total_warnings': 0,
                'can_deploy': True
            }
        }
        
        report = self.reporter.generate_report(validation_result, 'Q001')
        
        assert report['question_id'] == 'Q001'
        assert report['is_valid'] == True
        assert report['deployment_ready'] == True
        assert 'timestamp' in report
    
    def test_generate_invalid_report(self):
        """Test generating report for invalid question"""
        validation_result = {
            'is_valid': False,
            'errors': [
                {
                    'field': 'prompt',
                    'message': 'Prompt is missing',
                    'severity': 'CRITICAL',
                    'fix': 'Add prompt field'
                }
            ],
            'warnings': [],
            'summary': {
                'critical_count': 1,
                'high_count': 0,
                'medium_count': 0,
                'low_count': 0,
                'total_errors': 1,
                'total_warnings': 0,
                'can_deploy': False
            }
        }
        
        report = self.reporter.generate_report(validation_result, 'Q002')
        
        assert report['question_id'] == 'Q002'
        assert report['is_valid'] == False
        assert report['deployment_ready'] == False
        assert len(report['errors']) == 1
    
    def test_report_with_warnings(self):
        """Test generating report with warnings"""
        validation_result = {
            'is_valid': True,
            'errors': [],
            'warnings': [
                {
                    'field': 'options',
                    'message': 'Options list is empty',
                    'severity': 'MEDIUM',
                    'fix': 'Add options'
                }
            ],
            'summary': {
                'critical_count': 0,
                'high_count': 0,
                'medium_count': 1,
                'low_count': 0,
                'total_errors': 0,
                'total_warnings': 1,
                'can_deploy': True
            }
        }
        
        report = self.reporter.generate_report(validation_result, 'Q003')
        
        assert len(report['warnings']) == 1
        assert report['warnings'][0]['field'] == 'options'


class TestErrorFormatting:
    """Test cases for Error Formatting"""
    
    def setup_method(self):
        """Setup error reporter for each test"""
        self.reporter = ErrorReporter()
    
    def test_error_includes_example(self):
        """Test that formatted errors include examples"""
        validation_result = {
            'is_valid': False,
            'errors': [
                {
                    'field': 'prompt',
                    'message': 'Prompt is missing',
                    'severity': 'CRITICAL',
                    'fix': 'Add prompt field'
                }
            ],
            'warnings': [],
            'summary': {
                'critical_count': 1,
                'high_count': 0,
                'medium_count': 0,
                'low_count': 0,
                'total_errors': 1,
                'total_warnings': 0,
                'can_deploy': False
            }
        }
        
        report = self.reporter.generate_report(validation_result)
        
        assert report['errors'][0]['example'] is not None
        assert 'Which of the following' in report['errors'][0]['example']
    
    def test_error_formatting_preserves_severity(self):
        """Test that error formatting preserves severity levels"""
        validation_result = {
            'is_valid': False,
            'errors': [
                {
                    'field': 'options',
                    'message': 'Options must be a list',
                    'severity': 'HIGH',
                    'fix': 'Convert to list'
                }
            ],
            'warnings': [],
            'summary': {
                'critical_count': 0,
                'high_count': 1,
                'medium_count': 0,
                'low_count': 0,
                'total_errors': 1,
                'total_warnings': 0,
                'can_deploy': False
            }
        }
        
        report = self.reporter.generate_report(validation_result)
        
        assert report['errors'][0]['severity'] == 'HIGH'


class TestActionItems:
    """Test cases for Action Items Generation"""
    
    def setup_method(self):
        """Setup error reporter for each test"""
        self.reporter = ErrorReporter()
    
    def test_action_items_for_critical_errors(self):
        """Test action items include critical error message"""
        validation_result = {
            'is_valid': False,
            'errors': [],
            'warnings': [],
            'summary': {
                'critical_count': 2,
                'high_count': 0,
                'medium_count': 0,
                'low_count': 0,
                'total_errors': 2,
                'total_warnings': 0,
                'can_deploy': False
            }
        }
        
        report = self.reporter.generate_report(validation_result)
        
        assert any('CRITICAL' in action for action in report['action_items'])
        assert any('2' in action for action in report['action_items'])
    
    def test_action_items_for_valid_question(self):
        """Test action items for valid question"""
        validation_result = {
            'is_valid': True,
            'errors': [],
            'warnings': [],
            'summary': {
                'critical_count': 0,
                'high_count': 0,
                'medium_count': 0,
                'low_count': 0,
                'total_errors': 0,
                'total_warnings': 0,
                'can_deploy': True
            }
        }
        
        report = self.reporter.generate_report(validation_result)
        
        assert any('✅' in action for action in report['action_items'])


class TestReportStorage:
    """Test cases for Report Storage and Retrieval"""
    
    def setup_method(self):
        """Setup error reporter for each test"""
        self.reporter = ErrorReporter()
    
    def test_store_multiple_reports(self):
        """Test storing multiple reports"""
        validation_result = {
            'is_valid': True,
            'errors': [],
            'warnings': [],
            'summary': {
                'critical_count': 0,
                'high_count': 0,
                'medium_count': 0,
                'low_count': 0,
                'total_errors': 0,
                'total_warnings': 0,
                'can_deploy': True
            }
        }
        
        self.reporter.generate_report(validation_result, 'Q001')
        self.reporter.generate_report(validation_result, 'Q002')
        self.reporter.generate_report(validation_result, 'Q003')
        
        all_reports = self.reporter.get_all_reports()
        assert len(all_reports) == 3
    
    def test_retrieve_report_by_id(self):
        """Test retrieving specific report by ID"""
        validation_result = {
            'is_valid': True,
            'errors': [],
            'warnings': [],
            'summary': {
                'critical_count': 0,
                'high_count': 0,
                'medium_count': 0,
                'low_count': 0,
                'total_errors': 0,
                'total_warnings': 0,
                'can_deploy': True
            }
        }
        
        self.reporter.generate_report(validation_result, 'Q001')
        self.reporter.generate_report(validation_result, 'Q002')
        
        report = self.reporter.get_report_by_id('Q002')
        
        assert report is not None
        assert report['question_id'] == 'Q002'
    
    def test_retrieve_nonexistent_report(self):
        """Test retrieving nonexistent report returns None"""
        report = self.reporter.get_report_by_id('NONEXISTENT')
        assert report is None


class TestReportExport:
    """Test cases for Report Export Formats"""
    
    def setup_method(self):
        """Setup error reporter for each test"""
        self.reporter = ErrorReporter()
    
    def test_export_as_json(self):
        """Test exporting report as JSON"""
        validation_result = {
            'is_valid': True,
            'errors': [],
            'warnings': [],
            'summary': {
                'critical_count': 0,
                'high_count': 0,
                'medium_count': 0,
                'low_count': 0,
                'total_errors': 0,
                'total_warnings': 0,
                'can_deploy': True
            }
        }
        
        report = self.reporter.generate_report(validation_result, 'Q001')
        json_str = self.reporter.export_report_json(report)
        
        # Should be valid JSON
        parsed = json.loads(json_str)
        assert parsed['question_id'] == 'Q001'
    
    def test_export_as_text(self):
        """Test exporting report as human-readable text"""
        validation_result = {
            'is_valid': False,
            'errors': [
                {
                    'field': 'prompt',
                    'message': 'Prompt is missing',
                    'severity': 'CRITICAL',
                    'fix': 'Add prompt field'
                }
            ],
            'warnings': [],
            'summary': {
                'critical_count': 1,
                'high_count': 0,
                'medium_count': 0,
                'low_count': 0,
                'total_errors': 1,
                'total_warnings': 0,
                'can_deploy': False
            }
        }
        
        report = self.reporter.generate_report(validation_result, 'Q001')
        text = self.reporter.export_report_text(report)
        
        assert 'ERROR REPORT' in text
        assert 'Q001' in text
        assert 'CRITICAL' in text
        assert 'Prompt is missing' in text


if __name__ == '__main__':
    pytest.main([__file__, '-v'])

