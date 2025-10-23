#!/usr/bin/env python3
"""
Test the corrected JSON
"""

import json
import sys
sys.path.insert(0, 'backend')
from question_validator import TrackValidator

with open('listening_test_fixed.json', 'r') as f:
    data = json.load(f)

result = TrackValidator.validate_complete_track(data)

print('=' * 70)
print('CORRECTED JSON VALIDATION RESULTS')
print('=' * 70)
print(f'\n✅ Is Valid: {result["is_valid"]}')
print(f'📊 Total Questions: {result["total_questions"]}')
print(f'📚 Total Sections: {result["total_sections"]}')
print(f'📋 Questions by Type: {result["questions_by_type"]}')

if result['errors']:
    print(f'\n❌ ERRORS ({len(result["errors"])}):', result['errors'][:3])
else:
    print('\n✅ No errors found!')

if result['warnings']:
    print(f'\n⚠️  WARNINGS ({len(result["warnings"])}):', result['warnings'][:3])
else:
    print('\n✅ No warnings found!')

print('\n' + '=' * 70)

