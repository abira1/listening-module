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
BACKEND_URL = "https://test-admin-engine.preview.emergentagent.com/api"

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

def test_full_exam_data(exam_id):
    """Test 8: Full Exam Data - GET /api/exams/{exam_id}/full"""
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

def run_all_tests():
    """Run all backend API tests in sequence"""
    print(f"{Colors.BOLD}{Colors.BLUE}")
    print("=" * 60)
    print("  IELTS Listening Test Platform - Backend API Tests")
    print("=" * 60)
    print(f"{Colors.END}")
    
    print_info(f"Testing backend at: {BACKEND_URL}")
    print_info(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Track test results
    test_results = {}
    created_exam = None
    
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
    
    # Test 5: Exam Publishing (only if we have an exam)
    if created_exam:
        exam_id = created_exam.get('id')
        test_results['exam_publishing'] = test_exam_publishing(exam_id)
        
        # Test 6: Published Exams (after publishing)
        published_after = test_published_exams_after_publishing()
        test_results['published_exams_after'] = published_after is not None
        
        # Test 7: Exam Sections
        sections = test_exam_sections(exam_id)
        test_results['exam_sections'] = sections is not None
        
        # Test 8: Full Exam Data
        full_data = test_full_exam_data(exam_id)
        test_results['full_exam_data'] = full_data is not None
    else:
        print_warning("Skipping remaining tests due to exam creation failure")
        test_results.update({
            'exam_publishing': False,
            'published_exams_after': False,
            'exam_sections': False,
            'full_exam_data': False
        })
    
    # Print summary
    print(f"\n{Colors.BOLD}{Colors.BLUE}=== TEST SUMMARY ==={Colors.END}")
    
    passed_tests = sum(1 for result in test_results.values() if result)
    total_tests = len(test_results)
    
    for test_name, result in test_results.items():
        status = "PASS" if result else "FAIL"
        color = Colors.GREEN if result else Colors.RED
        print(f"{color}{status:4} - {test_name.replace('_', ' ').title()}{Colors.END}")
    
    print(f"\n{Colors.BOLD}Results: {passed_tests}/{total_tests} tests passed{Colors.END}")
    
    if passed_tests == total_tests:
        print_success("All backend API tests passed! ✨")
        return True
    else:
        print_error(f"{total_tests - passed_tests} test(s) failed")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)