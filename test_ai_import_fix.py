#!/usr/bin/env python3
"""
Test script for AI Import validation fix
Tests that questions with missing answer_key or type fields are properly handled
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000/api"

# Test 1: JSON with missing answer_key fields
test_json_missing_answer_key = {
    "test_type": "listening",
    "title": "Test Listening - Missing Answer Keys",
    "description": "Test with missing answer_key fields to verify auto-detection",
    "duration_seconds": 2400,
    "audio_url": "https://example.com/audio.mp3",
    "sections": [
        {
            "index": 1,
            "title": "Section 1",
            "instructions": "Complete the notes",
            "questions": [
                {
                    "index": 1,
                    "type": "short_answer",
                    "prompt": "Name: __________",
                    "answer_key": "John Smith",
                    "max_words": 2
                },
                {
                    "index": 2,
                    "type": "short_answer",
                    "prompt": "Address: __________",
                    # Missing answer_key - should be auto-filled
                    "max_words": 3
                }
            ]
        },
        {
            "index": 2,
            "title": "Section 2",
            "instructions": "Choose the correct answer",
            "questions": [
                {
                    "index": 3,
                    "type": "multiple_choice",
                    "prompt": "What is the main topic?",
                    "answer_key": "B",
                    "options": ["A. Option 1", "B. Option 2", "C. Option 3"]
                },
                {
                    "index": 4,
                    "type": "multiple_choice",
                    "prompt": "Which statement is correct?",
                    # Missing answer_key
                    "options": ["A. Statement 1", "B. Statement 2"]
                }
            ]
        },
        {
            "index": 3,
            "title": "Section 3",
            "instructions": "Label the map",
            "questions": [
                {
                    "index": 5,
                    "type": "map_labeling",
                    "prompt": "Ferry Terminal",
                    "answer_key": "A",
                    "image_url": "https://example.com/map.jpg"
                },
                {
                    "index": 6,
                    "type": "map_labeling",
                    "prompt": "Train Station",
                    # Missing answer_key
                    "image_url": "https://example.com/map.jpg"
                }
            ]
        },
        {
            "index": 4,
            "title": "Section 4",
            "instructions": "Complete the sentences",
            "questions": [
                {
                    "index": 7,
                    "type": "sentence_completion",
                    "prompt": "The weather was __________",
                    "answer_key": "sunny"
                },
                {
                    "index": 8,
                    "type": "sentence_completion",
                    "prompt": "They decided to __________",
                    # Missing answer_key
                }
            ]
        }
    ]
}

# Test 2: JSON with None type fields
test_json_none_type = {
    "test_type": "listening",
    "title": "Test Listening - None Types",
    "description": "Test with None type fields to verify auto-detection",
    "duration_seconds": 2400,
    "audio_url": "https://example.com/audio.mp3",
    "sections": [
        {
            "index": 1,
            "title": "Section 1",
            "instructions": "Complete the notes",
            "questions": [
                {
                    "index": 1,
                    "type": None,  # None type - should auto-detect
                    "prompt": "Name: __________",
                    "answer_key": "John"
                },
                {
                    "index": 2,
                    "type": None,  # None type
                    "prompt": "What is the answer?",
                    "answer_key": "B",
                    "options": ["A. Option 1", "B. Option 2"]
                }
            ]
        },
        {
            "index": 2,
            "title": "Section 2",
            "instructions": "Choose answers",
            "questions": [
                {
                    "index": 3,
                    "type": "multiple_choice",
                    "prompt": "Question 3?",
                    "answer_key": "A",
                    "options": ["A. Yes", "B. No"]
                },
                {
                    "index": 4,
                    "type": "multiple_choice",
                    "prompt": "Question 4?",
                    "answer_key": "B",
                    "options": ["A. Yes", "B. No"]
                }
            ]
        },
        {
            "index": 3,
            "title": "Section 3",
            "instructions": "Label items",
            "questions": [
                {
                    "index": 5,
                    "type": "map_labeling",
                    "prompt": "Location A",
                    "answer_key": "A",
                    "image_url": "https://example.com/map.jpg"
                },
                {
                    "index": 6,
                    "type": "map_labeling",
                    "prompt": "Location B",
                    "answer_key": "B",
                    "image_url": "https://example.com/map.jpg"
                }
            ]
        },
        {
            "index": 4,
            "title": "Section 4",
            "instructions": "Complete",
            "questions": [
                {
                    "index": 7,
                    "type": "sentence_completion",
                    "prompt": "The answer is __________",
                    "answer_key": "correct"
                },
                {
                    "index": 8,
                    "type": "sentence_completion",
                    "prompt": "This is __________",
                    "answer_key": "test"
                }
            ]
        }
    ]
}

def test_validation(test_name, json_data):
    """Test validation endpoint"""
    print(f"\n{'='*60}")
    print(f"Testing: {test_name}")
    print(f"{'='*60}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/tracks/validate-import",
            json=json_data,
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Validation PASSED")
            print(f"   Test Type: {result.get('test_type')}")
            print(f"   Title: {result.get('title')}")
            print(f"   Total Questions: {result.get('total_questions')}")
            print(f"   Total Sections: {result.get('total_sections')}")
            print(f"   Valid: {result.get('valid')}")
            
            if result.get('section_breakdown'):
                print(f"\n   Section Breakdown:")
                for section in result['section_breakdown']:
                    print(f"     - Section {section['section_number']}: {section['question_count']} questions")
                    print(f"       Types: {section['question_types']}")
            
            return True
        else:
            print(f"❌ Validation FAILED")
            print(f"Response: {response.text[:500]}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("AI IMPORT VALIDATION FIX TEST")
    print("="*60)
    
    # Wait for server to start
    print("\nWaiting for server to start...")
    time.sleep(3)
    
    # Test 1: Missing answer_key
    result1 = test_validation(
        "Missing answer_key fields",
        test_json_missing_answer_key
    )
    
    # Test 2: None type fields
    result2 = test_validation(
        "None type fields (auto-detection)",
        test_json_none_type
    )
    
    # Summary
    print(f"\n{'='*60}")
    print("TEST SUMMARY")
    print(f"{'='*60}")
    print(f"Test 1 (Missing answer_key): {'✅ PASSED' if result1 else '❌ FAILED'}")
    print(f"Test 2 (None types): {'✅ PASSED' if result2 else '❌ FAILED'}")
    print(f"\nOverall: {'✅ ALL TESTS PASSED' if result1 and result2 else '❌ SOME TESTS FAILED'}")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    main()

