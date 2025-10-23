"""
Error Reporter Service
Generates detailed error reports for questions
"""

from typing import Dict, List, Optional
from datetime import datetime
import json


class ErrorReporter:
    """
    Error reporting service for question validation
    Generates detailed, actionable error reports
    """

    def __init__(self):
        """Initialize error reporter"""
        self.reports = []

    def generate_report(self, validation_result: Dict, question_id: str = None, question_data: Dict = None) -> Dict:
        """
        Generate error report from validation result

        Args:
            validation_result: Result from ValidationService.validate_question()
            question_id: Optional question identifier
            question_data: Optional original question data

        Returns:
            Formatted error report with actionable fixes
        """
        report = {
            'timestamp': datetime.now().isoformat(),
            'question_id': question_id or 'unknown',
            'is_valid': validation_result.get('is_valid', False),
            'summary': validation_result.get('summary', {}),
            'errors': self._format_errors(validation_result.get('errors', [])),
            'warnings': self._format_errors(validation_result.get('warnings', [])),
            'action_items': self._generate_action_items(validation_result),
            'deployment_ready': validation_result.get('summary', {}).get('can_deploy', False)
        }

        self.reports.append(report)
        return report

    def _format_errors(self, errors: List[Dict]) -> List[Dict]:
        """Format errors with enhanced details"""
        formatted = []
        for error in errors:
            formatted.append({
                'field': error.get('field'),
                'message': error.get('message'),
                'severity': error.get('severity'),
                'fix': error.get('fix'),
                'example': self._get_example_fix(error.get('field'))
            })
        return formatted

    def _get_example_fix(self, field: str) -> Optional[str]:
        """Get example fix for common fields"""
        examples = {
            'prompt': 'Example: "Which of the following is correct?"',
            'options': 'Example: [{"text": "A", "value": "A"}, {"text": "B", "value": "B"}]',
            'answer_key': 'Example: "A" or ["A", "B"] for multiple answers',
            'audio_url': 'Example: "audio/listening_1.ogg"',
            'image_url': 'Example: "images/map_1.png"',
            'min_words': 'Example: 150 (minimum word count)',
            'max_words': 'Example: 250 (maximum word count)',
        }
        return examples.get(field)

    def _generate_action_items(self, validation_result: Dict) -> List[str]:
        """Generate prioritized action items"""
        actions = []
        summary = validation_result.get('summary', {})

        if summary.get('critical_count', 0) > 0:
            actions.append(f"🔴 CRITICAL: Fix {summary['critical_count']} critical error(s) before deployment")

        if summary.get('high_count', 0) > 0:
            actions.append(f"🟠 HIGH: Address {summary['high_count']} high-priority error(s)")

        if summary.get('medium_count', 0) > 0:
            actions.append(f"🟡 MEDIUM: Review {summary['medium_count']} warning(s)")

        if summary.get('low_count', 0) > 0:
            actions.append(f"🟢 LOW: Consider {summary['low_count']} suggestion(s)")

        if validation_result.get('is_valid'):
            actions.append("✅ Question is valid and ready for deployment")

        return actions

    def get_all_reports(self) -> List[Dict]:
        """Get all generated reports"""
        return self.reports

    def get_report_by_id(self, question_id: str) -> Optional[Dict]:
        """Get report for specific question"""
        for report in self.reports:
            if report['question_id'] == question_id:
                return report
        return None

    def export_report_json(self, report: Dict) -> str:
        """Export report as JSON string"""
        return json.dumps(report, indent=2)

    def export_report_text(self, report: Dict) -> str:
        """Export report as human-readable text"""
        lines = []
        lines.append("=" * 60)
        lines.append(f"ERROR REPORT - {report['question_id']}")
        lines.append(f"Generated: {report['timestamp']}")
        lines.append("=" * 60)
        lines.append("")

        # Status
        status = "✅ VALID" if report['is_valid'] else "❌ INVALID"
        lines.append(f"Status: {status}")
        lines.append(f"Deployment Ready: {'Yes' if report['deployment_ready'] else 'No'}")
        lines.append("")

        # Summary
        summary = report['summary']
        lines.append("SUMMARY:")
        lines.append(f"  Critical Errors: {summary.get('critical_count', 0)}")
        lines.append(f"  High Errors: {summary.get('high_count', 0)}")
        lines.append(f"  Medium Warnings: {summary.get('medium_count', 0)}")
        lines.append(f"  Low Warnings: {summary.get('low_count', 0)}")
        lines.append("")

        # Errors
        if report['errors']:
            lines.append("ERRORS:")
            for error in report['errors']:
                lines.append(f"  [{error['severity']}] {error['field']}")
                lines.append(f"    Message: {error['message']}")
                lines.append(f"    Fix: {error['fix']}")
                if error.get('example'):
                    lines.append(f"    Example: {error['example']}")
                lines.append("")

        # Warnings
        if report['warnings']:
            lines.append("WARNINGS:")
            for warning in report['warnings']:
                lines.append(f"  [{warning['severity']}] {warning['field']}")
                lines.append(f"    Message: {warning['message']}")
                lines.append(f"    Fix: {warning['fix']}")
                if warning.get('example'):
                    lines.append(f"    Example: {warning['example']}")
                lines.append("")

        # Action Items
        if report['action_items']:
            lines.append("ACTION ITEMS:")
            for i, action in enumerate(report['action_items'], 1):
                lines.append(f"  {i}. {action}")
            lines.append("")

        lines.append("=" * 60)
        return "\n".join(lines)

