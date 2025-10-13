#!/usr/bin/env python3
"""
Script to import comprehensive test suite demonstrating all question types.

This script imports 3 comprehensive test files:
1. Comprehensive Listening Test (12 question types, 40 questions)
2. Comprehensive Reading Test (14 question types, 40 questions)
3. Comprehensive Writing Test (1 question type, 2 questions)

Total: 27 question types, 82 questions

Usage:
    python import_comprehensive_tests.py
"""

import requests
import json
import os
import sys
from pathlib import Path

# Configuration
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8001")
TEST_FILES = [
    {
        "file": "comprehensive_listening_test.json",
        "name": "Comprehensive Listening Test",
        "type": "listening"
    },
    {
        "file": "comprehensive_reading_test.json",
        "name": "Comprehensive Reading Test",
        "type": "reading"
    },
    {
        "file": "comprehensive_writing_test.json",
        "name": "Comprehensive Writing Test",
        "type": "writing"
    }
]

def load_json_file(file_path):
    """Load JSON file and return data"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ Error: File not found: {file_path}")
        return None
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON in {file_path}: {e}")
        return None

def validate_test(test_data):
    """Validate test data structure"""
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/tracks/validate-import",
            json=test_data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Validation passed: {result.get('message', 'Valid')}")
            return True
        else:
            error = response.json()
            print(f"   ❌ Validation failed: {error.get('detail', response.text)}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Error validating: {e}")
        return False

def import_test(test_data, test_name):
    """Import test via API"""
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/tracks/import-from-ai",
            json=test_data,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Import successful!")
            print(f"      Test Title: {result.get('title')}")
            print(f"      Exam ID: {result.get('exam_id')}")
            print(f"      Track ID: {result.get('track_id')}")
            print(f"      Status: {result.get('status')}")
            return True
        else:
            error = response.json() if response.headers.get('content-type') == 'application/json' else response.text
            print(f"   ❌ Import failed: {error}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Error importing: {e}")
        return False

def check_backend_connection():
    """Check if backend is accessible"""
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            print(f"✅ Backend connected: {BACKEND_URL}")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to backend at {BACKEND_URL}")
        print(f"   Error: {e}")
        return False

def display_summary(results):
    """Display import summary"""
    print("\n" + "="*70)
    print("IMPORT SUMMARY")
    print("="*70)
    
    total = len(results)
    successful = sum(1 for r in results if r['success'])
    failed = total - successful
    
    print(f"Total Tests: {total}")
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    print()
    
    for result in results:
        status = "✅ SUCCESS" if result['success'] else "❌ FAILED"
        print(f"{status} - {result['name']} ({result['type']})")
    
    print("="*70)

def count_questions(test_data):
    """Count questions in test data"""
    total = 0
    for section in test_data.get('sections', []):
        total += len(section.get('questions', []))
    return total

def main():
    """Main import process"""
    print("="*70)
    print("COMPREHENSIVE TEST SUITE IMPORT")
    print("="*70)
    print(f"Backend URL: {BACKEND_URL}")
    print()
    
    # Check backend connection
    if not check_backend_connection():
        print("\n⚠️  Please ensure the backend is running and accessible.")
        print("   Start backend with: sudo supervisorctl restart backend")
        sys.exit(1)
    
    print()
    
    # Get base directory (parent of scripts folder)
    base_dir = Path(__file__).parent.parent
    
    results = []
    
    # Process each test file
    for test_config in TEST_FILES:
        file_path = base_dir / test_config['file']
        test_name = test_config['name']
        test_type = test_config['type']
        
        print(f"\n{'='*70}")
        print(f"Processing: {test_name}")
        print(f"File: {test_config['file']}")
        print(f"Type: {test_type.upper()}")
        print('='*70)
        
        # Load JSON
        print(f"1️⃣  Loading JSON file...")
        test_data = load_json_file(file_path)
        
        if not test_data:
            results.append({
                'name': test_name,
                'type': test_type,
                'success': False,
                'error': 'File load failed'
            })
            continue
        
        # Display test info
        question_count = count_questions(test_data)
        section_count = len(test_data.get('sections', []))
        print(f"   ✅ Loaded successfully")
        print(f"      Sections: {section_count}")
        print(f"      Questions: {question_count}")
        print()
        
        # Validate
        print(f"2️⃣  Validating test structure...")
        if not validate_test(test_data):
            results.append({
                'name': test_name,
                'type': test_type,
                'success': False,
                'error': 'Validation failed'
            })
            continue
        
        print()
        
        # Import
        print(f"3️⃣  Importing test to database...")
        success = import_test(test_data, test_name)
        
        results.append({
            'name': test_name,
            'type': test_type,
            'success': success
        })
    
    # Display summary
    display_summary(results)
    
    # Exit with appropriate code
    all_success = all(r['success'] for r in results)
    sys.exit(0 if all_success else 1)

if __name__ == "__main__":
    main()
