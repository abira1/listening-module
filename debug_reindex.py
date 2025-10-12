#!/usr/bin/env python3
"""
Debug script to test question re-indexing after deletion
"""

import requests
import json

BACKEND_URL = "https://index-explorer.preview.emergentagent.com/api"

def debug_reindex_test():
    print("=== DEBUG: Question Re-indexing Test ===")
    
    # Create a test exam
    exam_data = {
        "title": "Debug Test Exam",
        "description": "Testing question re-indexing",
        "duration_seconds": 1800
    }
    
    exam_response = requests.post(f"{BACKEND_URL}/exams", json=exam_data)
    if exam_response.status_code != 200:
        print(f"Failed to create exam: {exam_response.text}")
        return
    
    exam = exam_response.json()
    exam_id = exam['id']
    print(f"Created exam: {exam_id}")
    
    # Get sections
    sections_response = requests.get(f"{BACKEND_URL}/exams/{exam_id}/sections")
    sections = sections_response.json()
    section_id = sections[0]['id']
    print(f"Using section: {section_id}")
    
    # Create 3 questions
    question_ids = []
    for i in range(3):
        question_data = {
            "exam_id": exam_id,
            "section_id": section_id,
            "type": "single_answer",
            "payload": {"prompt": f"Question {i+1}"},
            "marks": 1
        }
        
        response = requests.post(f"{BACKEND_URL}/questions", json=question_data)
        if response.status_code == 200:
            question = response.json()
            question_ids.append(question['id'])
            print(f"Created question {i+1}: ID={question['id']}, Index={question['index']}")
        else:
            print(f"Failed to create question {i+1}: {response.text}")
            return
    
    # Check questions before deletion
    print("\n--- Questions before deletion ---")
    questions_response = requests.get(f"{BACKEND_URL}/sections/{section_id}/questions")
    questions = questions_response.json()
    for q in questions:
        print(f"Question ID: {q['id']}, Index: {q['index']}")
    
    # Delete middle question (index 2)
    middle_question_id = question_ids[1]
    print(f"\n--- Deleting middle question: {middle_question_id} ---")
    
    delete_response = requests.delete(f"{BACKEND_URL}/questions/{middle_question_id}")
    if delete_response.status_code == 200:
        print("Question deleted successfully")
    else:
        print(f"Failed to delete question: {delete_response.text}")
        return
    
    # Check questions after deletion
    print("\n--- Questions after deletion ---")
    questions_response = requests.get(f"{BACKEND_URL}/sections/{section_id}/questions")
    questions = questions_response.json()
    for q in questions:
        print(f"Question ID: {q['id']}, Index: {q['index']}")
    
    # Expected: indices should be 1, 2
    expected_indices = [1, 2]
    actual_indices = sorted([q['index'] for q in questions])
    
    if actual_indices == expected_indices:
        print("\n✅ SUCCESS: Questions properly re-indexed!")
    else:
        print(f"\n❌ FAILURE: Expected indices {expected_indices}, got {actual_indices}")
    
    # Cleanup
    requests.delete(f"{BACKEND_URL}/exams/{exam_id}")
    print(f"\nCleaned up exam: {exam_id}")

if __name__ == "__main__":
    debug_reindex_test()