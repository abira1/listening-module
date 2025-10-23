#!/usr/bin/env python3
"""
Simple test for AI Import validation fix
Tests that questions with missing answer_key or type fields are properly handled
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000/api"

def generate_test_json(include_missing_answer_key=False, include_none_types=False):
    """Generate a valid 40-question listening test"""
    sections = []
    question_index = 1
    
    for section_num in range(1, 5):
        questions = []
        for q_num in range(1, 11):  # 10 questions per section
            question = {
                "index": question_index,
                "type": "short_answer" if q_num % 2 == 0 else "multiple_choice",
                "prompt": f"Question {question_index}?",
                "answer_key": f"Answer{question_index}",
                "max_words": 2 if q_num % 2 == 0 else None,
                "options": [f"A. Option {i}" for i in range(1, 4)] if q_num % 2 == 1 else None
            }
            
            # Test: Remove answer_key from some questions
            if include_missing_answer_key and question_index % 5 == 0:
                del question["answer_key"]
            
            # Test: Set type to None for some questions
            if include_none_types and question_index % 7 == 0:
                question["type"] = None
            
            questions.append(question)
            question_index += 1
        
        sections.append({
            "index": section_num,
            "title": f"Section {section_num}",
            "instructions": f"Instructions for section {section_num}",
            "questions": questions
        })
    
    return {
        "test_type": "listening",
        "title": "Test Listening Practice",
        "description": "A complete listening test with 40 questions",
        "duration_seconds": 2400,
        "audio_url": "https://example.com/audio.mp3",
        "sections": sections
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
            error_detail = response.json().get('detail', [])
            if isinstance(error_detail, list) and len(error_detail) > 0:
                print(f"   Error: {error_detail[0].get('msg', 'Unknown error')}")
            else:
                print(f"   Error: {error_detail}")
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
    
    # Test 1: Valid JSON
    print("\n[Test 1] Valid JSON with all required fields")
    result1 = test_validation(
        "Valid JSON",
        generate_test_json(include_missing_answer_key=False, include_none_types=False)
    )
    
    # Test 2: Missing answer_key
    print("\n[Test 2] JSON with missing answer_key fields (should auto-fill)")
    result2 = test_validation(
        "Missing answer_key fields",
        generate_test_json(include_missing_answer_key=True, include_none_types=False)
    )
    
    # Test 3: None type fields
    print("\n[Test 3] JSON with None type fields (should auto-detect)")
    result3 = test_validation(
        "None type fields (auto-detection)",
        generate_test_json(include_missing_answer_key=False, include_none_types=True)
    )
    
    # Test 4: Both missing answer_key and None types
    print("\n[Test 4] JSON with both missing answer_key and None types")
    result4 = test_validation(
        "Missing answer_key + None types",
        generate_test_json(include_missing_answer_key=True, include_none_types=True)
    )
    
    # Summary
    print(f"\n{'='*60}")
    print("TEST SUMMARY")
    print(f"{'='*60}")
    print(f"Test 1 (Valid JSON): {'✅ PASSED' if result1 else '❌ FAILED'}")
    print(f"Test 2 (Missing answer_key): {'✅ PASSED' if result2 else '❌ FAILED'}")
    print(f"Test 3 (None types): {'✅ PASSED' if result3 else '❌ FAILED'}")
    print(f"Test 4 (Both issues): {'✅ PASSED' if result4 else '❌ FAILED'}")
    print(f"\nOverall: {'✅ ALL TESTS PASSED' if all([result1, result2, result3, result4]) else '❌ SOME TESTS FAILED'}")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    main()

