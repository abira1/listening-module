#!/usr/bin/env python3
"""
Complete test for AI Import functionality
Tests validation and actual import with missing fields
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000/api"

def generate_test_json(test_name="Test"):
    """Generate a valid 40-question listening test with some missing fields"""
    sections = []
    question_index = 1
    
    for section_num in range(1, 5):
        questions = []
        for q_num in range(1, 11):  # 10 questions per section
            question = {
                "index": question_index,
                "type": "short_answer" if q_num % 2 == 0 else "multiple_choice",
                "prompt": f"Question {question_index}: What is the answer?",
                "answer_key": f"Answer{question_index}",
                "max_words": 2 if q_num % 2 == 0 else None,
                "options": [f"A. Option {i}" for i in range(1, 4)] if q_num % 2 == 1 else None
            }
            
            # Simulate AI-generated JSON with some missing answer_key
            if question_index % 8 == 0:
                del question["answer_key"]
            
            # Simulate some None types
            if question_index % 13 == 0:
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
        "title": f"AI Import Test - {test_name}",
        "description": "A complete listening test imported from AI with 40 questions",
        "duration_seconds": 2400,
        "audio_url": "https://example.com/audio.mp3",
        "sections": sections
    }

def test_validation(test_name, json_data):
    """Test validation endpoint"""
    print(f"\n{'='*60}")
    print(f"VALIDATION: {test_name}")
    print(f"{'='*60}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/tracks/validate-import",
            json=json_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Validation PASSED")
            print(f"   Questions: {result.get('total_questions')}")
            print(f"   Sections: {result.get('total_sections')}")
            return True, result
        else:
            print(f"❌ Validation FAILED (Status: {response.status_code})")
            error = response.json().get('detail', [])
            if isinstance(error, list) and len(error) > 0:
                print(f"   Error: {error[0].get('msg', 'Unknown')}")
            return False, None
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False, None

def test_import(test_name, json_data):
    """Test actual import endpoint"""
    print(f"\n{'='*60}")
    print(f"IMPORT: {test_name}")
    print(f"{'='*60}")

    try:
        response = requests.post(
            f"{BASE_URL}/tracks/import-from-ai",
            json=json_data,
            timeout=10
        )

        if response.status_code in [200, 201]:
            result = response.json()
            print(f"✅ Import SUCCESSFUL")
            print(f"   Track ID: {result.get('track_id')}")
            print(f"   Questions Created: {result.get('questions_created')}")
            print(f"   Sections Created: {result.get('sections_created')}")
            print(f"   Message: {result.get('message')}")
            return True, result
        else:
            print(f"❌ Import FAILED (Status: {response.status_code})")
            error = response.json().get('detail', [])
            if isinstance(error, list) and len(error) > 0:
                print(f"   Error: {error[0].get('msg', 'Unknown')}")
            else:
                print(f"   Error: {error}")
            return False, None

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False, None

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("AI IMPORT COMPLETE TEST")
    print("Testing validation and import with missing fields")
    print("="*60)
    
    # Wait for server
    print("\nWaiting for server...")
    time.sleep(2)
    
    # Generate test data
    test_data = generate_test_json("With Missing Fields")
    
    # Test 1: Validation
    print("\n[STEP 1] Testing Validation Endpoint")
    val_success, val_result = test_validation("AI-Generated JSON", test_data)
    
    if not val_success:
        print("\n❌ Validation failed - cannot proceed with import")
        return
    
    # Test 2: Import
    print("\n[STEP 2] Testing Import Endpoint")
    imp_success, imp_result = test_import("AI-Generated JSON", test_data)
    
    # Summary
    print(f"\n{'='*60}")
    print("FINAL RESULTS")
    print(f"{'='*60}")
    print(f"Validation: {'✅ PASSED' if val_success else '❌ FAILED'}")
    print(f"Import: {'✅ PASSED' if imp_success else '❌ FAILED'}")
    
    if val_success and imp_success:
        print(f"\n✅ ALL TESTS PASSED!")
        print(f"\nSuccessfully imported:")
        print(f"  - Track: {imp_result.get('title')}")
        print(f"  - Questions: {imp_result.get('questions_created')}")
        print(f"  - Sections: {imp_result.get('sections_created')}")
    else:
        print(f"\n❌ SOME TESTS FAILED")
    
    print(f"{'='*60}\n")

if __name__ == "__main__":
    main()

