#!/usr/bin/env python3
"""
Authentication System Test Suite for IELTS Platform
Tests authentication endpoints and protected routes
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

def test_auth_endpoints():
    """Test authentication-related endpoints"""
    print_test_header("Authentication Endpoints Test")
    
    results = {}
    
    # Test 1: GET /api/auth/me (should return 401 without authentication)
    print_info("Testing GET /api/auth/me (should require authentication)")
    try:
        response = requests.get(f"{BACKEND_URL}/auth/me", timeout=10)
        if response.status_code == 401:
            print_success("✅ /auth/me correctly returns 401 for unauthenticated requests")
            results['auth_me_unauthorized'] = True
        else:
            print_error(f"❌ /auth/me returned unexpected status: {response.status_code}")
            results['auth_me_unauthorized'] = False
    except Exception as e:
        print_error(f"❌ /auth/me request failed: {str(e)}")
        results['auth_me_unauthorized'] = False
    
    # Test 2: POST /api/auth/logout (should work without authentication)
    print_info("Testing POST /api/auth/logout")
    try:
        response = requests.post(f"{BACKEND_URL}/auth/logout", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print_success(f"✅ /auth/logout works - Status: {response.status_code}")
            print_info(f"Response: {data}")
            results['auth_logout'] = True
        else:
            print_warning(f"⚠️  /auth/logout returned status: {response.status_code}")
            results['auth_logout'] = False
    except Exception as e:
        print_error(f"❌ /auth/logout request failed: {str(e)}")
        results['auth_logout'] = False
    
    # Test 3: GET /api/students/me (should require authentication)
    print_info("Testing GET /api/students/me (should require authentication)")
    try:
        response = requests.get(f"{BACKEND_URL}/students/me", timeout=10)
        if response.status_code == 401:
            print_success("✅ /students/me correctly returns 401 for unauthenticated requests")
            results['students_me_unauthorized'] = True
        else:
            print_error(f"❌ /students/me returned unexpected status: {response.status_code}")
            results['students_me_unauthorized'] = False
    except Exception as e:
        print_error(f"❌ /students/me request failed: {str(e)}")
        results['students_me_unauthorized'] = False
    
    # Test 4: GET /api/admin/students (should require admin authentication)
    print_info("Testing GET /api/admin/students (should require admin authentication)")
    try:
        response = requests.get(f"{BACKEND_URL}/admin/students", timeout=10)
        if response.status_code == 401:
            print_success("✅ /admin/students correctly returns 401 for unauthenticated requests")
            results['admin_students_unauthorized'] = True
        else:
            print_error(f"❌ /admin/students returned unexpected status: {response.status_code}")
            results['admin_students_unauthorized'] = False
    except Exception as e:
        print_error(f"❌ /admin/students request failed: {str(e)}")
        results['admin_students_unauthorized'] = False
    
    return results

def test_public_endpoints():
    """Test public endpoints that should work without authentication"""
    print_test_header("Public Endpoints Test")
    
    results = {}
    
    # Test 1: GET /api/exams/published
    print_info("Testing GET /api/exams/published (public endpoint)")
    try:
        response = requests.get(f"{BACKEND_URL}/exams/published", timeout=10)
        if response.status_code == 200:
            exams = response.json()
            print_success(f"✅ /exams/published works - Found {len(exams)} published exams")
            results['published_exams'] = True
        else:
            print_error(f"❌ /exams/published failed - Status: {response.status_code}")
            results['published_exams'] = False
    except Exception as e:
        print_error(f"❌ /exams/published request failed: {str(e)}")
        results['published_exams'] = False
    
    # Test 2: GET /api/exams/{exam_id}/full (should work for published exams)
    print_info("Testing GET /api/exams/{exam_id}/full (public for published exams)")
    try:
        # Use the IELTS test exam ID
        exam_id = "ielts-listening-practice-test-1"
        response = requests.get(f"{BACKEND_URL}/exams/{exam_id}/full", timeout=10)
        if response.status_code == 200:
            exam_data = response.json()
            print_success(f"✅ /exams/{exam_id}/full works - Retrieved full exam data")
            print_info(f"Exam: {exam_data.get('exam', {}).get('title', 'Unknown')}")
            print_info(f"Sections: {len(exam_data.get('sections', []))}")
            results['exam_full_data'] = True
        else:
            print_error(f"❌ /exams/{exam_id}/full failed - Status: {response.status_code}")
            results['exam_full_data'] = False
    except Exception as e:
        print_error(f"❌ /exams/full request failed: {str(e)}")
        results['exam_full_data'] = False
    
    return results

def test_submission_endpoints():
    """Test submission endpoints"""
    print_test_header("Submission Endpoints Test")
    
    results = {}
    
    # Test 1: POST /api/submissions (should work without authentication for anonymous submissions)
    print_info("Testing POST /api/submissions (anonymous submission)")
    try:
        submission_data = {
            "exam_id": "ielts-listening-practice-test-1",
            "user_id_or_session": "test_anonymous_user",
            "answers": {
                "1": "test answer 1",
                "2": "test answer 2",
                "3": "A"
            },
            "progress_percent": 100
        }
        
        response = requests.post(
            f"{BACKEND_URL}/submissions",
            json=submission_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            submission = response.json()
            print_success(f"✅ Anonymous submission works - ID: {submission.get('id')}")
            print_info(f"Score: {submission.get('score', 'N/A')}/{submission.get('total_questions', 'N/A')}")
            results['anonymous_submission'] = True
            return results, submission.get('id')
        else:
            print_error(f"❌ Anonymous submission failed - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            results['anonymous_submission'] = False
            return results, None
    except Exception as e:
        print_error(f"❌ Anonymous submission request failed: {str(e)}")
        results['anonymous_submission'] = False
        return results, None

def run_authentication_tests():
    """Run all authentication-related tests"""
    print(f"{Colors.BOLD}{Colors.BLUE}")
    print("=" * 80)
    print("  IELTS Platform - Authentication System Tests")
    print("=" * 80)
    print(f"{Colors.END}")
    
    print_info(f"Testing backend at: {BACKEND_URL}")
    print_info(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    all_results = {}
    
    # Test authentication endpoints
    auth_results = test_auth_endpoints()
    all_results.update(auth_results)
    
    # Test public endpoints
    public_results = test_public_endpoints()
    all_results.update(public_results)
    
    # Test submission endpoints
    submission_results, submission_id = test_submission_endpoints()
    all_results.update(submission_results)
    
    # Summary
    print_test_header("Authentication System Test Summary")
    
    passed_tests = sum(1 for result in all_results.values() if result)
    total_tests = len(all_results)
    
    print(f"\n{Colors.BOLD}Test Results:{Colors.END}")
    for test_name, result in all_results.items():
        status = "PASS" if result else "FAIL"
        color = Colors.GREEN if result else Colors.RED
        print(f"  {color}{status:4} - {test_name.replace('_', ' ').title()}{Colors.END}")
    
    print(f"\n{Colors.BOLD}Overall Results: {passed_tests}/{total_tests} tests passed{Colors.END}")
    
    if passed_tests == total_tests:
        print_success("🎉 ALL AUTHENTICATION TESTS PASSED!")
        print_success("✅ Protected endpoints correctly require authentication")
        print_success("✅ Public endpoints work without authentication")
        print_success("✅ Anonymous submissions work correctly")
        return True
    else:
        failed_tests = total_tests - passed_tests
        print_error(f"❌ {failed_tests} test(s) failed - Authentication system needs attention")
        return False

if __name__ == "__main__":
    success = run_authentication_tests()
    sys.exit(0 if success else 1)