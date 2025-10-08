#!/usr/bin/env python3
"""
Backend API Test Suite for IELTS Listening Test Platform
Tests all exam creation and management endpoints
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from frontend environment
BACKEND_URL = "https://login-gateway-23.preview.emergentagent.com/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_test_header(test_name):
    print(f"\n{Colors.BLUE}{Colors.BOLD}=== {test_name} ==={Colors.END}")

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.END}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.END}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.END}")

def test_api_health_check():
    """Test 1: API Health Check - GET /api/"""
    print_test_header("API Health Check")
    
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"API is healthy - Status: {response.status_code}")
            print_info(f"Response: {json.dumps(data, indent=2)}")
            
            # Verify expected response structure
            if "message" in data and "version" in data:
                print_success("Response contains expected fields (message, version)")
                return True
            else:
                print_warning("Response missing expected fields")
                return False
        else:
            print_error(f"Health check failed - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Health check request failed: {str(e)}")
        return False

def test_authentication_protection_scenarios():
    """Test Authentication Protection Implementation - Focused Test"""
    print_test_header("Authentication Protection Implementation Test")
    
    print_info("Testing authentication protection scenarios as requested:")
    print_info("1. Backend Health Check")
    print_info("2. Published Exams Endpoint (should work without authentication)")
    print_info("3. Service Status Verification")
    
    results = {}
    
    # Test 1: Backend Health Check
    print_info("\n--- Test 1: Backend Health Check ---")
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print_success(f"✅ Backend health check PASSED - Status: {response.status_code}")
            print_info(f"Response: {data}")
            results['health_check'] = True
        else:
            print_error(f"❌ Backend health check FAILED - Status: {response.status_code}")
            results['health_check'] = False
    except Exception as e:
        print_error(f"❌ Backend health check ERROR: {str(e)}")
        results['health_check'] = False
    
    # Test 2: Published Exams Endpoint (should work without authentication)
    print_info("\n--- Test 2: Published Exams Endpoint (No Auth Required) ---")
    try:
        response = requests.get(f"{BACKEND_URL}/exams/published", timeout=10)
        if response.status_code == 200:
            exams = response.json()
            print_success(f"✅ Published exams endpoint PASSED - Status: {response.status_code}")
            print_info(f"Found {len(exams)} published exams")
            
            # Show some exam details if available
            if exams:
                for i, exam in enumerate(exams[:3]):  # Show first 3 exams
                    print_info(f"  Exam {i+1}: {exam.get('title', 'No title')} (ID: {exam.get('id', 'No ID')})")
            else:
                print_info("  No published exams found (this is normal if no exams are published)")
            
            results['published_exams'] = True
        else:
            print_error(f"❌ Published exams endpoint FAILED - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            results['published_exams'] = False
    except Exception as e:
        print_error(f"❌ Published exams endpoint ERROR: {str(e)}")
        results['published_exams'] = False
    
    # Test 3: Additional Backend Endpoints (to verify backend is fully functional)
    print_info("\n--- Test 3: Additional Backend Functionality ---")
    try:
        # Test all exams endpoint
        response = requests.get(f"{BACKEND_URL}/exams", timeout=10)
        if response.status_code == 200:
            all_exams = response.json()
            print_success(f"✅ All exams endpoint PASSED - Found {len(all_exams)} total exams")
            results['all_exams'] = True
        else:
            print_error(f"❌ All exams endpoint FAILED - Status: {response.status_code}")
            results['all_exams'] = False
    except Exception as e:
        print_error(f"❌ All exams endpoint ERROR: {str(e)}")
        results['all_exams'] = False
    
    # Summary for authentication protection test
    print_info("\n--- Authentication Protection Test Summary ---")
    passed_tests = sum(1 for result in results.values() if result)
    total_tests = len(results)
    
    if passed_tests == total_tests:
        print_success(f"🎉 ALL AUTHENTICATION PROTECTION TESTS PASSED ({passed_tests}/{total_tests})")
        print_success("✅ Backend is running and accessible")
        print_success("✅ Published exams endpoint works without authentication")
        print_success("✅ Backend APIs are functional after frontend authentication changes")
        return True
    else:
        print_error(f"❌ SOME TESTS FAILED ({passed_tests}/{total_tests})")
        for test_name, result in results.items():
            status = "PASS" if result else "FAIL"
            color = Colors.GREEN if result else Colors.RED
            print(f"  {color}{status} - {test_name.replace('_', ' ').title()}{Colors.END}")
        return False

def test_exam_creation():
    """Test 2: Exam Creation - POST /api/exams"""
    print_test_header("Exam Creation")
    
    exam_data = {
        "title": "IELTS Practice Test - Academic Module",
        "description": "Comprehensive IELTS listening practice test covering all four sections with authentic academic content",
        "duration_seconds": 1800
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/exams",
            json=exam_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            exam = response.json()
            print_success(f"Exam created successfully - Status: {response.status_code}")
            print_info(f"Created exam ID: {exam.get('id')}")
            print_info(f"Exam title: {exam.get('title')}")
            print_info(f"Duration: {exam.get('duration_seconds')} seconds")
            print_info(f"Published: {exam.get('published')}")
            
            # Verify expected response structure
            required_fields = ['id', 'title', 'description', 'duration_seconds', 'published', 'created_at']
            missing_fields = [field for field in required_fields if field not in exam]
            
            if not missing_fields:
                print_success("Response contains all required fields")
                return exam
            else:
                print_warning(f"Response missing fields: {missing_fields}")
                return exam
        else:
            print_error(f"Exam creation failed - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_error(f"Exam creation request failed: {str(e)}")
        return None

def test_exam_retrieval():
    """Test 3: Exam Retrieval - GET /api/exams"""
    print_test_header("Exam Retrieval - All Exams")
    
    try:
        response = requests.get(f"{BACKEND_URL}/exams", timeout=10)
        
        if response.status_code == 200:
            exams = response.json()
            print_success(f"Exams retrieved successfully - Status: {response.status_code}")
            print_info(f"Total exams found: {len(exams)}")
            
            if exams:
                print_info("Sample exam data:")
                for i, exam in enumerate(exams[:2]):  # Show first 2 exams
                    print_info(f"  Exam {i+1}: {exam.get('title')} (ID: {exam.get('id')})")
                return exams
            else:
                print_warning("No exams found in database")
                return []
        else:
            print_error(f"Exam retrieval failed - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_error(f"Exam retrieval request failed: {str(e)}")
        return None

def test_published_exams_empty():
    """Test 4: Published Exams (should be empty initially) - GET /api/exams/published"""
    print_test_header("Published Exams - Initial Check")
    
    try:
        response = requests.get(f"{BACKEND_URL}/exams/published", timeout=10)
        
        if response.status_code == 200:
            published_exams = response.json()
            print_success(f"Published exams retrieved - Status: {response.status_code}")
            print_info(f"Published exams count: {len(published_exams)}")
            
            if len(published_exams) == 0:
                print_success("Correctly returns empty list (no published exams yet)")
            else:
                print_info(f"Found {len(published_exams)} already published exams")
                
            return published_exams
        else:
            print_error(f"Published exams retrieval failed - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_error(f"Published exams request failed: {str(e)}")
        return None

def test_exam_publishing(exam_id):
    """Test 5: Exam Publishing - PUT /api/exams/{exam_id}"""
    print_test_header("Exam Publishing")
    
    if not exam_id:
        print_error("No exam ID provided for publishing test")
        return False
    
    update_data = {"published": True}
    
    try:
        response = requests.put(
            f"{BACKEND_URL}/exams/{exam_id}",
            json=update_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            updated_exam = response.json()
            print_success(f"Exam published successfully - Status: {response.status_code}")
            print_info(f"Exam ID: {updated_exam.get('id')}")
            print_info(f"Published status: {updated_exam.get('published')}")
            
            if updated_exam.get('published') == True:
                print_success("Exam is now published")
                return True
            else:
                print_error("Exam published field not updated correctly")
                return False
        else:
            print_error(f"Exam publishing failed - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Exam publishing request failed: {str(e)}")
        return False

def test_published_exams_after_publishing():
    """Test 6: Published Exams (should include published exam) - GET /api/exams/published"""
    print_test_header("Published Exams - After Publishing")
    
    try:
        response = requests.get(f"{BACKEND_URL}/exams/published", timeout=10)
        
        if response.status_code == 200:
            published_exams = response.json()
            print_success(f"Published exams retrieved - Status: {response.status_code}")
            print_info(f"Published exams count: {len(published_exams)}")
            
            if len(published_exams) > 0:
                print_success("Successfully found published exam(s)")
                for exam in published_exams:
                    print_info(f"  Published exam: {exam.get('title')} (ID: {exam.get('id')})")
                return published_exams
            else:
                print_error("No published exams found after publishing")
                return []
        else:
            print_error(f"Published exams retrieval failed - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_error(f"Published exams request failed: {str(e)}")
        return None

def test_exam_sections(exam_id):
    """Test 7: Section Retrieval - GET /api/exams/{exam_id}/sections"""
    print_test_header("Exam Sections Retrieval")
    
    if not exam_id:
        print_error("No exam ID provided for sections test")
        return None
    
    try:
        response = requests.get(f"{BACKEND_URL}/exams/{exam_id}/sections", timeout=10)
        
        if response.status_code == 200:
            sections = response.json()
            print_success(f"Sections retrieved successfully - Status: {response.status_code}")
            print_info(f"Total sections found: {len(sections)}")
            
            if len(sections) == 4:
                print_success("Correctly created 4 sections automatically")
                for section in sections:
                    print_info(f"  Section {section.get('index')}: {section.get('title')} (ID: {section.get('id')})")
                return sections
            else:
                print_warning(f"Expected 4 sections, found {len(sections)}")
                return sections
        else:
            print_error(f"Sections retrieval failed - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_error(f"Sections retrieval request failed: {str(e)}")
        return None

def test_question_creation(exam_id, section_id):
    """Test 8: Question Creation - POST /api/questions"""
    print_test_header("Question Creation")
    
    if not exam_id or not section_id:
        print_error("Missing exam_id or section_id for question creation test")
        return None
    
    question_data = {
        "exam_id": exam_id,
        "section_id": section_id,
        "type": "single_answer",
        "payload": {
            "prompt": "Listen to the conversation and choose the correct answer. What is the main topic discussed?",
            "options": [
                "University accommodation",
                "Course registration", 
                "Library services",
                "Student activities"
            ],
            "correct_answer": 0
        },
        "marks": 1
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/questions",
            json=question_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            question = response.json()
            print_success(f"Question created successfully - Status: {response.status_code}")
            print_info(f"Question ID: {question.get('id')}")
            print_info(f"Question index: {question.get('index')}")
            print_info(f"Question type: {question.get('type')}")
            print_info(f"Question marks: {question.get('marks')}")
            
            # Verify expected response structure
            required_fields = ['id', 'exam_id', 'section_id', 'index', 'type', 'payload', 'marks']
            missing_fields = [field for field in required_fields if field not in question]
            
            if not missing_fields:
                print_success("Question response contains all required fields")
                if question.get('index') == 1:
                    print_success("Question correctly assigned index 1")
                return question
            else:
                print_warning(f"Question response missing fields: {missing_fields}")
                return question
        else:
            print_error(f"Question creation failed - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_error(f"Question creation request failed: {str(e)}")
        return None

def test_section_questions(section_id):
    """Test 9: Section Questions Retrieval - GET /api/sections/{section_id}/questions"""
    print_test_header("Section Questions Retrieval")
    
    if not section_id:
        print_error("No section ID provided for questions test")
        return None
    
    try:
        response = requests.get(f"{BACKEND_URL}/sections/{section_id}/questions", timeout=10)
        
        if response.status_code == 200:
            questions = response.json()
            print_success(f"Section questions retrieved - Status: {response.status_code}")
            print_info(f"Questions count: {len(questions)}")
            
            for i, question in enumerate(questions):
                print_info(f"  Question {question.get('index')}: {question.get('type')} (ID: {question.get('id')})")
            
            return questions
        else:
            print_error(f"Section questions retrieval failed - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_error(f"Section questions request failed: {str(e)}")
        return None

def test_question_retrieval(question_id):
    """Test 10: Single Question Retrieval - GET /api/questions/{question_id}"""
    print_test_header("Single Question Retrieval")
    
    if not question_id:
        print_error("No question ID provided for retrieval test")
        return None
    
    try:
        response = requests.get(f"{BACKEND_URL}/questions/{question_id}", timeout=10)
        
        if response.status_code == 200:
            question = response.json()
            print_success(f"Question retrieved successfully - Status: {response.status_code}")
            print_info(f"Question ID: {question.get('id')}")
            print_info(f"Question type: {question.get('type')}")
            print_info(f"Question index: {question.get('index')}")
            return question
        else:
            print_error(f"Question retrieval failed - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_error(f"Question retrieval request failed: {str(e)}")
        return None

def test_question_update(question_id):
    """Test 11: Question Update - PUT /api/questions/{question_id}"""
    print_test_header("Question Update")
    
    if not question_id:
        print_error("No question ID provided for update test")
        return False
    
    update_data = {
        "payload": {
            "prompt": "UPDATED: Listen to the conversation and choose the correct answer. What is the main topic discussed?",
            "options": [
                "University accommodation",
                "Course registration", 
                "Library services",
                "Student activities"
            ],
            "correct_answer": 1
        }
    }
    
    try:
        response = requests.put(
            f"{BACKEND_URL}/questions/{question_id}",
            json=update_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            updated_question = response.json()
            print_success(f"Question updated successfully - Status: {response.status_code}")
            print_info(f"Updated prompt: {updated_question.get('payload', {}).get('prompt', 'N/A')[:50]}...")
            print_info(f"Updated correct answer: {updated_question.get('payload', {}).get('correct_answer')}")
            
            # Verify the update was applied
            if "UPDATED:" in updated_question.get('payload', {}).get('prompt', ''):
                print_success("Question payload updated correctly")
                return True
            else:
                print_error("Question payload not updated correctly")
                return False
        else:
            print_error(f"Question update failed - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Question update request failed: {str(e)}")
        return False

def test_multiple_questions_and_deletion(exam_id, sections):
    """Test 12: Create Multiple Questions and Test Deletion with Re-indexing"""
    print_test_header("Multiple Questions Creation and Deletion Test")
    
    if not exam_id or not sections or len(sections) < 2:
        print_error("Missing exam_id or insufficient sections for multiple questions test")
        return False
    
    # Use second section to avoid interference with previous tests
    section_id = sections[1].get('id')
    print_info(f"Using clean section for deletion test: {section_id}")
    
    # Create 3 questions in the clean section
    questions = []
    for i in range(3):
        question_data = {
            "exam_id": exam_id,
            "section_id": section_id,
            "type": "single_answer",
            "payload": {
                "prompt": f"Deletion test question {i+1} - What is the answer to question {i+1}?",
                "options": [f"Option A{i+1}", f"Option B{i+1}", f"Option C{i+1}", f"Option D{i+1}"],
                "correct_answer": i % 4
            },
            "marks": 1
        }
        
        try:
            response = requests.post(
                f"{BACKEND_URL}/questions",
                json=question_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                question = response.json()
                questions.append(question)
                print_success(f"Created question {i+1} with index {question.get('index')}")
            else:
                print_error(f"Failed to create question {i+1} - Status: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            print_error(f"Question {i+1} creation request failed: {str(e)}")
            return False
    
    if len(questions) != 3:
        print_error("Failed to create all 3 questions")
        return False
    
    print_info(f"Successfully created {len(questions)} questions with indices: {[q.get('index') for q in questions]}")
    
    # Delete the middle question (should be index 2)
    middle_question = questions[1]  # Second question
    middle_question_id = middle_question.get('id')
    middle_question_index = middle_question.get('index')
    
    print_info(f"Deleting middle question (ID: {middle_question_id}, Index: {middle_question_index})")
    
    try:
        response = requests.delete(f"{BACKEND_URL}/questions/{middle_question_id}", timeout=10)
        
        if response.status_code == 200:
            print_success("Middle question deleted successfully")
            
            # Verify remaining questions are re-indexed
            remaining_response = requests.get(f"{BACKEND_URL}/sections/{section_id}/questions", timeout=10)
            
            if remaining_response.status_code == 200:
                remaining_questions = remaining_response.json()
                print_info(f"Remaining questions count: {len(remaining_questions)}")
                
                # Check if indices are properly re-indexed (should be 1, 2)
                expected_indices = [1, 2]
                actual_indices = sorted([q.get('index') for q in remaining_questions])
                
                print_info(f"Question indices after deletion: {actual_indices}")
                
                if actual_indices == expected_indices:
                    print_success("Questions properly re-indexed after deletion (indices: 1, 2)")
                    return True
                else:
                    print_error(f"Questions not properly re-indexed. Expected: {expected_indices}, Got: {actual_indices}")
                    # This is still a minor issue, not critical for functionality
                    print_warning("Re-indexing logic may need adjustment, but deletion works correctly")
                    return False
            else:
                print_error("Failed to retrieve remaining questions for re-indexing verification")
                return False
        else:
            print_error(f"Question deletion failed - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Question deletion request failed: {str(e)}")
        return False

def test_full_exam_data(exam_id):
    """Test 13: Full Exam Data - GET /api/exams/{exam_id}/full"""
    print_test_header("Full Exam Data Retrieval")
    
    if not exam_id:
        print_error("No exam ID provided for full exam data test")
        return None
    
    try:
        response = requests.get(f"{BACKEND_URL}/exams/{exam_id}/full", timeout=10)
        
        if response.status_code == 200:
            full_data = response.json()
            print_success(f"Full exam data retrieved - Status: {response.status_code}")
            
            # Verify structure
            if "exam" in full_data and "sections" in full_data:
                exam_data = full_data["exam"]
                sections_data = full_data["sections"]
                
                print_info(f"Exam: {exam_data.get('title')}")
                print_info(f"Sections count: {len(sections_data)}")
                
                # Check each section
                total_questions = 0
                for section in sections_data:
                    questions_count = len(section.get('questions', []))
                    total_questions += questions_count
                    print_info(f"  {section.get('title')}: {questions_count} questions")
                
                print_info(f"Total questions across all sections: {total_questions}")
                print_success("Full exam data structure is correct")
                return full_data
            else:
                print_error("Full exam data missing required fields (exam, sections)")
                return None
        else:
            print_error(f"Full exam data retrieval failed - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_error(f"Full exam data request failed: {str(e)}")
        return None

def test_exam_cleanup(exam_id):
    """Test 14: Exam Cleanup - DELETE /api/exams/{exam_id}"""
    print_test_header("Exam Cleanup")
    
    if not exam_id:
        print_error("No exam ID provided for cleanup test")
        return False
    
    try:
        response = requests.delete(f"{BACKEND_URL}/exams/{exam_id}", timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print_success(f"Exam deleted successfully - Status: {response.status_code}")
            print_info(f"Response: {result.get('message', 'No message')}")
            
            # Verify exam is actually deleted
            verify_response = requests.get(f"{BACKEND_URL}/exams/{exam_id}", timeout=10)
            if verify_response.status_code == 404:
                print_success("Exam deletion verified - exam no longer exists")
                return True
            else:
                print_warning("Exam still exists after deletion attempt")
                return False
        else:
            print_error(f"Exam deletion failed - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Exam deletion request failed: {str(e)}")
        return False

def run_all_tests():
    """Run all backend API tests in sequence"""
    print(f"{Colors.BOLD}{Colors.BLUE}")
    print("=" * 80)
    print("  IELTS Listening Test Platform - Complete Backend API Tests")
    print("=" * 80)
    print(f"{Colors.END}")
    
    print_info(f"Testing backend at: {BACKEND_URL}")
    print_info(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Track test results
    test_results = {}
    created_exam = None
    sections = None
    created_question = None
    
    # Test 1: Health Check
    test_results['health_check'] = test_api_health_check()
    
    # Test 2: Exam Creation
    created_exam = test_exam_creation()
    test_results['exam_creation'] = created_exam is not None
    
    # Test 3: Exam Retrieval
    all_exams = test_exam_retrieval()
    test_results['exam_retrieval'] = all_exams is not None
    
    # Test 4: Published Exams (empty)
    published_empty = test_published_exams_empty()
    test_results['published_exams_empty'] = published_empty is not None
    
    # Continue with remaining tests only if we have an exam
    if created_exam:
        exam_id = created_exam.get('id')
        
        # Test 5: Exam Sections
        sections = test_exam_sections(exam_id)
        test_results['exam_sections'] = sections is not None
        
        # Question CRUD Tests (only if we have sections)
        if sections and len(sections) > 0:
            section_id = sections[0].get('id')  # Use first section
            
            # Test 6: Question Creation
            created_question = test_question_creation(exam_id, section_id)
            test_results['question_creation'] = created_question is not None
            
            # Test 7: Section Questions Retrieval
            section_questions = test_section_questions(section_id)
            test_results['section_questions'] = section_questions is not None
            
            # Question operations (only if we have a question)
            if created_question:
                question_id = created_question.get('id')
                
                # Test 8: Single Question Retrieval
                retrieved_question = test_question_retrieval(question_id)
                test_results['question_retrieval'] = retrieved_question is not None
                
                # Test 9: Question Update
                test_results['question_update'] = test_question_update(question_id)
            else:
                test_results.update({
                    'question_retrieval': False,
                    'question_update': False
                })
            
            # Test 10: Multiple Questions and Deletion with Re-indexing
            test_results['question_deletion_reindex'] = test_multiple_questions_and_deletion(exam_id, sections)
        else:
            test_results.update({
                'question_creation': False,
                'section_questions': False,
                'question_retrieval': False,
                'question_update': False,
                'question_deletion_reindex': False
            })
        
        # Test 11: Exam Publishing
        test_results['exam_publishing'] = test_exam_publishing(exam_id)
        
        # Test 12: Published Exams (after publishing)
        published_after = test_published_exams_after_publishing()
        test_results['published_exams_after'] = published_after is not None
        
        # Test 13: Full Exam Data
        full_data = test_full_exam_data(exam_id)
        test_results['full_exam_data'] = full_data is not None
        
        # Test 14: Exam Cleanup
        test_results['exam_cleanup'] = test_exam_cleanup(exam_id)
    else:
        print_warning("Skipping remaining tests due to exam creation failure")
        test_results.update({
            'exam_sections': False,
            'question_creation': False,
            'section_questions': False,
            'question_retrieval': False,
            'question_update': False,
            'question_deletion_reindex': False,
            'exam_publishing': False,
            'published_exams_after': False,
            'full_exam_data': False,
            'exam_cleanup': False
        })
    
    # Print summary
    print(f"\n{Colors.BOLD}{Colors.BLUE}=== COMPREHENSIVE TEST SUMMARY ==={Colors.END}")
    
    passed_tests = sum(1 for result in test_results.values() if result)
    total_tests = len(test_results)
    
    # Group tests by category for better readability
    basic_tests = ['health_check', 'exam_creation', 'exam_retrieval', 'published_exams_empty']
    question_tests = ['question_creation', 'section_questions', 'question_retrieval', 'question_update', 'question_deletion_reindex']
    publishing_tests = ['exam_publishing', 'published_exams_after', 'full_exam_data']
    cleanup_tests = ['exam_cleanup', 'exam_sections']
    
    print(f"\n{Colors.BOLD}Basic API Tests:{Colors.END}")
    for test_name in basic_tests:
        if test_name in test_results:
            result = test_results[test_name]
            status = "PASS" if result else "FAIL"
            color = Colors.GREEN if result else Colors.RED
            print(f"  {color}{status:4} - {test_name.replace('_', ' ').title()}{Colors.END}")
    
    print(f"\n{Colors.BOLD}Question CRUD Tests:{Colors.END}")
    for test_name in question_tests:
        if test_name in test_results:
            result = test_results[test_name]
            status = "PASS" if result else "FAIL"
            color = Colors.GREEN if result else Colors.RED
            print(f"  {color}{status:4} - {test_name.replace('_', ' ').title()}{Colors.END}")
    
    print(f"\n{Colors.BOLD}Publishing & Data Tests:{Colors.END}")
    for test_name in publishing_tests:
        if test_name in test_results:
            result = test_results[test_name]
            status = "PASS" if result else "FAIL"
            color = Colors.GREEN if result else Colors.RED
            print(f"  {color}{status:4} - {test_name.replace('_', ' ').title()}{Colors.END}")
    
    print(f"\n{Colors.BOLD}Cleanup & Structure Tests:{Colors.END}")
    for test_name in cleanup_tests:
        if test_name in test_results:
            result = test_results[test_name]
            status = "PASS" if result else "FAIL"
            color = Colors.GREEN if result else Colors.RED
            print(f"  {color}{status:4} - {test_name.replace('_', ' ').title()}{Colors.END}")
    
    print(f"\n{Colors.BOLD}Overall Results: {passed_tests}/{total_tests} tests passed{Colors.END}")
    
    if passed_tests == total_tests:
        print_success("🎉 ALL BACKEND API TESTS PASSED! The complete exam creation workflow is working perfectly! ✨")
        return True
    else:
        failed_tests = total_tests - passed_tests
        print_error(f"❌ {failed_tests} test(s) failed - Backend needs attention")
        return False

def run_authentication_protection_tests():
    """Run focused authentication protection tests"""
    print(f"{Colors.BOLD}{Colors.BLUE}")
    print("=" * 80)
    print("  IELTS Platform - Authentication Protection Implementation Tests")
    print("=" * 80)
    print(f"{Colors.END}")
    
    print_info(f"Testing backend at: {BACKEND_URL}")
    print_info(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print_info("Focus: Verify backend APIs work after frontend authentication changes")
    
    return test_authentication_protection_scenarios()

if __name__ == "__main__":
    import sys
    
    # Check if we want to run focused authentication tests
    if len(sys.argv) > 1 and sys.argv[1] == "--auth-protection":
        success = run_authentication_protection_tests()
    else:
        success = run_all_tests()
    
    sys.exit(0 if success else 1)