"""
Firebase Integration Tests
Tests all CRUD operations with Firebase Realtime Database
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from firebase_service import FirebaseService
import json

def print_test(name, passed, message=""):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {name}")
    if message:
        print(f"   {message}")

def test_exam_operations():
    """Test exam CRUD operations"""
    print("\n=== Testing Exam Operations ===")
    
    try:
        # Create exam
        exam_data = {
            "title": "Test Exam",
            "description": "Test Description",
            "duration_seconds": 1800,
            "is_demo": False,
        }
        exam = FirebaseService.create_exam(exam_data)
        print_test("Create Exam", exam is not None and "id" in exam, f"Exam ID: {exam.get('id')}")
        
        exam_id = exam["id"]
        
        # Get exam
        retrieved_exam = FirebaseService.get_exam(exam_id)
        print_test("Get Exam", retrieved_exam is not None, f"Title: {retrieved_exam.get('title')}")
        
        # Update exam
        updated_exam = FirebaseService.update_exam(exam_id, {"title": "Updated Test Exam"})
        print_test("Update Exam", updated_exam.get("title") == "Updated Test Exam")
        
        # Get all exams
        all_exams = FirebaseService.get_all_exams()
        print_test("Get All Exams", len(all_exams) > 0, f"Found {len(all_exams)} exams")
        
        return exam_id
    except Exception as e:
        print_test("Exam Operations", False, str(e))
        return None

def test_section_operations(exam_id):
    """Test section operations"""
    print("\n=== Testing Section Operations ===")
    
    try:
        # Get sections for exam
        sections = FirebaseService.get_sections_by_exam(exam_id)
        print_test("Get Sections by Exam", len(sections) == 4, f"Found {len(sections)} sections")
        
        if sections:
            section_id = sections[0]["id"]
            
            # Get single section
            section = FirebaseService.get_section(section_id)
            print_test("Get Section", section is not None, f"Section: {section.get('title')}")
            
            # Update section
            updated_section = FirebaseService.update_section(section_id, {"title": "Updated Section"})
            print_test("Update Section", updated_section.get("title") == "Updated Section")
            
            return section_id
    except Exception as e:
        print_test("Section Operations", False, str(e))
        return None

def test_question_operations(exam_id, section_id):
    """Test question CRUD operations"""
    print("\n=== Testing Question Operations ===")
    
    try:
        # Create question
        question_data = {
            "exam_id": exam_id,
            "section_id": section_id,
            "type": "short_answer",
            "payload": {
                "prompt": "What is the capital of France?",
                "answer_key": "Paris",
                "max_words": 1
            },
            "marks": 1,
            "created_by": "test_user",
            "is_demo": False,
        }
        question = FirebaseService.create_question(question_data)
        print_test("Create Question", question is not None and "id" in question, f"Question ID: {question.get('id')}")
        
        question_id = question["id"]
        
        # Get question
        retrieved_question = FirebaseService.get_question(question_id)
        print_test("Get Question", retrieved_question is not None, f"Type: {retrieved_question.get('type')}")
        
        # Update question
        updated_question = FirebaseService.update_question(question_id, {
            "payload": {
                "prompt": "Updated prompt",
                "answer_key": "Paris",
                "max_words": 1
            }
        })
        print_test("Update Question", updated_question.get("payload", {}).get("prompt") == "Updated prompt")
        
        # Get questions by section
        questions = FirebaseService.get_questions_by_section(section_id)
        print_test("Get Questions by Section", len(questions) > 0, f"Found {len(questions)} questions")
        
        return question_id
    except Exception as e:
        print_test("Question Operations", False, str(e))
        return None

def test_submission_operations(exam_id):
    """Test submission operations"""
    print("\n=== Testing Submission Operations ===")
    
    try:
        # Create submission
        submission_data = {
            "exam_id": exam_id,
            "user_id_or_session": "test_user_123",
            "answers": {"1": "Paris"},
        }
        submission = FirebaseService.create_submission(submission_data)
        print_test("Create Submission", submission is not None and "id" in submission, f"Submission ID: {submission.get('id')}")
        
        submission_id = submission["id"]
        
        # Get submission
        retrieved_submission = FirebaseService.get_submission(submission_id)
        print_test("Get Submission", retrieved_submission is not None, f"Exam ID: {retrieved_submission.get('exam_id')}")
        
        # Update submission
        updated_submission = FirebaseService.update_submission(submission_id, {
            "answers": {"1": "Paris", "2": "London"},
            "progress_percent": 50
        })
        print_test("Update Submission", updated_submission.get("progress_percent") == 50)
        
        return submission_id
    except Exception as e:
        print_test("Submission Operations", False, str(e))
        return None

def test_delete_operations(exam_id, question_id):
    """Test delete operations"""
    print("\n=== Testing Delete Operations ===")
    
    try:
        # Delete question
        result = FirebaseService.delete_question(question_id)
        print_test("Delete Question", result is True)
        
        # Verify question is deleted
        deleted_question = FirebaseService.get_question(question_id)
        print_test("Verify Question Deleted", deleted_question is None)
        
        # Delete exam (and related data)
        result = FirebaseService.delete_exam(exam_id)
        print_test("Delete Exam", result is True)
        
        # Verify exam is deleted
        deleted_exam = FirebaseService.get_exam(exam_id)
        print_test("Verify Exam Deleted", deleted_exam is None)
        
    except Exception as e:
        print_test("Delete Operations", False, str(e))

def main():
    """Run all tests"""
    print("=" * 50)
    print("Firebase Integration Tests")
    print("=" * 50)
    
    # Test exam operations
    exam_id = test_exam_operations()
    
    if exam_id:
        # Test section operations
        section_id = test_section_operations(exam_id)
        
        if section_id:
            # Test question operations
            question_id = test_question_operations(exam_id, section_id)
        
        # Test submission operations
        submission_id = test_submission_operations(exam_id)
        
        # Test delete operations
        if question_id:
            test_delete_operations(exam_id, question_id)
    
    print("\n" + "=" * 50)
    print("Tests Complete!")
    print("=" * 50)

if __name__ == "__main__":
    main()

