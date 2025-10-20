#!/usr/bin/env python3
"""
Comprehensive Test Suite for Question Upload Workflow
Tests all components: type detection, validation, track creation, and file upload
"""

import sys
import json
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / 'backend'))

from question_type_detector import QuestionTypeDetector, QuestionType
from question_validator import QuestionValidator, TrackValidator
from track_creation_service import TrackCreationService

# Test data
SIMPLE_LISTENING_JSON = {
    "test_type": "listening",
    "title": "IELTS Listening Test 1",
    "description": "Complete listening test",
    "duration_seconds": 2004,
    "audio_url": "https://example.com/audio.mp3",
    "sections": [
        {
            "section_number": 1,
            "title": "Section 1",
            "description": "Conversation",
            "questions": [
                {
                    "id": "q1",
                    "type": "mcq_single",
                    "text": "What is the main topic?",
                    "options": ["A", "B", "C", "D"],
                    "correctAnswers": ["A"]
                }
            ]
        }
    ]
}

MIXED_TYPES_JSON = {
    "test_type": "reading",
    "title": "IELTS Reading Test 1",
    "description": "Mixed reading questions",
    "duration_seconds": 3600,
    "sections": [
        {
            "section_number": 1,
            "title": "Passage 1",
            "questions": [
                {
                    "id": "q1",
                    "type": "true_false_ng",
                    "text": "Statement 1",
                    "correctAnswers": ["True"]
                },
                {
                    "id": "q2",
                    "type": "matching_headings",
                    "text": "Match headings",
                    "options": ["Heading A", "Heading B"],
                    "correctAnswers": ["Heading A"]
                },
                {
                    "id": "q3",
                    "text": "MCQ question",
                    "options": ["A", "B", "C", "D"],
                    "correctAnswers": ["A"]
                }
            ]
        }
    ]
}

INVALID_JSON = {
    "test_type": "listening",
    "title": "Invalid Test",
    "sections": [
        {
            "section_number": 1,
            "questions": [
                {
                    "id": "q1",
                    "text": "Missing type field"
                    # Missing type and options
                }
            ]
        }
    ]
}

def print_header(title):
    """Print test header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def print_test(name, passed, details=""):
    """Print test result"""
    status = "[PASS]" if passed else "[FAIL]"
    print(f"{status} - {name}")
    if details:
        print(f"   {details}")

def test_type_detection():
    """Test 1: Type Detection"""
    print_header("TEST 1: TYPE DETECTION")
    
    tests_passed = 0
    tests_total = 0
    
    # Test 1.1: Detect explicit type
    tests_total += 1
    question = {
        "id": "q1",
        "type": "mcq_single",
        "text": "Question?",
        "options": ["A", "B", "C", "D"],
        "correctAnswers": ["A"]
    }
    detected = QuestionTypeDetector.detect_type(question)
    passed = detected == "mcq_single"
    print_test("Detect explicit type", passed, f"Detected: {detected}")
    if passed: tests_passed += 1
    
    # Test 1.2: Detect by structure (MCQ)
    tests_total += 1
    question = {
        "id": "q2",
        "text": "Question?",
        "options": ["A", "B", "C", "D"],
        "correctAnswers": ["A"]
    }
    detected = QuestionTypeDetector.detect_type(question)
    passed = detected == "mcq_single"
    print_test("Detect MCQ by structure", passed, f"Detected: {detected}")
    if passed: tests_passed += 1
    
    # Test 1.3: Detect True/False/NG
    tests_total += 1
    question = {
        "id": "q3",
        "text": "Statement",
        "correctAnswers": ["True"]
    }
    detected = QuestionTypeDetector.detect_type(question)
    passed = detected == "true_false_ng"
    print_test("Detect True/False/NG", passed, f"Detected: {detected}")
    if passed: tests_passed += 1
    
    # Test 1.4: Batch by type
    tests_total += 1
    questions = [
        {"id": "q1", "type": "mcq_single", "text": "Q1", "options": ["A", "B"], "correctAnswers": ["A"]},
        {"id": "q2", "type": "true_false_ng", "text": "Q2", "correctAnswers": ["True"]},
        {"id": "q3", "type": "mcq_single", "text": "Q3", "options": ["A", "B"], "correctAnswers": ["A"]}
    ]
    batches = QuestionTypeDetector.batch_by_type(questions)
    passed = len(batches) == 2 and len(batches.get("mcq_single", [])) == 2
    print_test("Batch questions by type", passed, f"Batches: {list(batches.keys())}")
    if passed: tests_passed += 1
    
    print(f"\nType Detection: {tests_passed}/{tests_total} tests passed\n")
    return tests_passed, tests_total

def test_validation():
    """Test 2: Validation"""
    print_header("TEST 2: VALIDATION")
    
    tests_passed = 0
    tests_total = 0
    
    # Test 2.1: Validate valid question
    tests_total += 1
    question = {
        "id": "q1",
        "type": "mcq_single",
        "text": "Question?",
        "options": ["A", "B", "C", "D"],
        "correctAnswers": ["A"]
    }
    is_valid, errors = QuestionValidator.validate_question(question)
    passed = is_valid and len(errors) == 0
    print_test("Validate valid question", passed, f"Valid: {is_valid}, Errors: {len(errors)}")
    if passed: tests_passed += 1
    
    # Test 2.2: Validate question with auto-detected type (type field optional)
    tests_total += 1
    question = {
        "id": "q1",
        "text": "Question?",
        "options": ["A", "B"]
    }
    is_valid, errors = QuestionValidator.validate_question(question)
    passed = is_valid and len(errors) == 0
    print_test("Auto-detect type when missing", passed, f"Valid: {is_valid}, Errors: {len(errors)}")
    if passed: tests_passed += 1
    
    # Test 2.3: Validate complete track
    tests_total += 1
    result = TrackValidator.validate_complete_track(SIMPLE_LISTENING_JSON)
    passed = result["is_valid"] and result["total_questions"] == 1
    print_test("Validate complete track", passed, f"Valid: {result['is_valid']}, Questions: {result['total_questions']}")
    if passed: tests_passed += 1
    
    # Test 2.4: Detect validation errors
    tests_total += 1
    result = TrackValidator.validate_complete_track(INVALID_JSON)
    passed = not result["is_valid"] and len(result["errors"]) > 0
    print_test("Detect validation errors", passed, f"Valid: {result['is_valid']}, Errors: {len(result['errors'])}")
    if passed: tests_passed += 1
    
    print(f"\nValidation: {tests_passed}/{tests_total} tests passed\n")
    return tests_passed, tests_total

def test_type_detection_in_track():
    """Test 3: Type Detection in Track"""
    print_header("TEST 3: TYPE DETECTION IN TRACK")
    
    tests_passed = 0
    tests_total = 0
    
    # Test 3.1: Detect types in mixed track
    tests_total += 1
    result = TrackValidator.validate_complete_track(MIXED_TYPES_JSON)
    types_found = list(result["questions_by_type"].keys())
    passed = "true_false_ng" in types_found and "matching_headings" in types_found
    print_test("Detect multiple types in track", passed, f"Types found: {types_found}")
    if passed: tests_passed += 1
    
    # Test 3.2: Count questions by type
    tests_total += 1
    result = TrackValidator.validate_complete_track(MIXED_TYPES_JSON)
    total_by_type = sum(result["questions_by_type"].values())
    passed = total_by_type == 3
    print_test("Count questions by type", passed, f"Total: {total_by_type}, By type: {result['questions_by_type']}")
    if passed: tests_passed += 1
    
    print(f"\nType Detection in Track: {tests_passed}/{tests_total} tests passed\n")
    return tests_passed, tests_total

def test_track_creation():
    """Test 4: Track Creation"""
    print_header("TEST 4: TRACK CREATION")
    
    tests_passed = 0
    tests_total = 0
    
    # Test 4.1: Create track from simple JSON
    tests_total += 1
    try:
        result = TrackCreationService.create_track_from_json(SIMPLE_LISTENING_JSON)
        passed = result["success"] and result["questions_created"] == 1
        print_test("Create track from JSON", passed, f"Success: {result['success']}, Questions: {result['questions_created']}")
        if passed: tests_passed += 1
    except Exception as e:
        print_test("Create track from JSON", False, f"Error: {str(e)}")
    
    # Test 4.2: Create track with mixed types
    tests_total += 1
    try:
        result = TrackCreationService.create_track_from_json(MIXED_TYPES_JSON)
        passed = result["success"] and result["questions_created"] == 3
        error_msg = f"Success: {result['success']}, Questions: {result['questions_created']}"
        if result.get("errors"):
            error_msg += f", Errors: {result['errors']}"
        print_test("Create track with mixed types", passed, error_msg)
        if passed: tests_passed += 1
    except Exception as e:
        print_test("Create track with mixed types", False, f"Error: {str(e)}")
    
    # Test 4.3: Verify track ID generated
    tests_total += 1
    try:
        result = TrackCreationService.create_track_from_json(SIMPLE_LISTENING_JSON)
        passed = result["success"] and "track_id" in result and result["track_id"]
        print_test("Track ID generated", passed, f"Track ID: {result.get('track_id', 'N/A')}")
        if passed: tests_passed += 1
    except Exception as e:
        print_test("Track ID generated", False, f"Error: {str(e)}")
    
    print(f"\nTrack Creation: {tests_passed}/{tests_total} tests passed\n")
    return tests_passed, tests_total

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("  QUESTION UPLOAD WORKFLOW - COMPREHENSIVE TEST SUITE")
    print("="*60)
    
    total_passed = 0
    total_tests = 0
    
    # Run all test suites
    p, t = test_type_detection()
    total_passed += p
    total_tests += t
    
    p, t = test_validation()
    total_passed += p
    total_tests += t
    
    p, t = test_type_detection_in_track()
    total_passed += p
    total_tests += t
    
    p, t = test_track_creation()
    total_passed += p
    total_tests += t
    
    # Print summary
    print_header("TEST SUMMARY")
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {total_passed}")
    print(f"Failed: {total_tests - total_passed}")
    print(f"Success Rate: {(total_passed/total_tests)*100:.1f}%")
    
    if total_passed == total_tests:
        print("\n[SUCCESS] ALL TESTS PASSED!")
        return 0
    else:
        print(f"\n[FAILED] {total_tests - total_passed} TESTS FAILED")
        return 1

if __name__ == "__main__":
    exit(main())

