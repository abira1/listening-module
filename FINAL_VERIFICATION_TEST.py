#!/usr/bin/env python3
"""
Final Verification Test for Student Dashboard
Tests all critical endpoints to ensure dashboard works correctly
"""

import requests
import json
import sys
from datetime import datetime

BASE_URL = 'http://localhost:8000'
TEST_USER_ID = 'STU-2025-022'
TEST_REG_NUMBER = 'REG-2025-022'

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_header(text):
    print(f"\n{BLUE}{'='*60}")
    print(f"{text}")
    print(f"{'='*60}{RESET}\n")

def print_success(text):
    print(f"{GREEN}✓ {text}{RESET}")

def print_error(text):
    print(f"{RED}✗ {text}{RESET}")

def print_info(text):
    print(f"{YELLOW}ℹ {text}{RESET}")

def test_login():
    """Test student login endpoint"""
    print_header("TEST 1: Student Login")
    
    try:
        data = {
            'user_id': TEST_USER_ID,
            'registration_number': TEST_REG_NUMBER
        }
        
        response = requests.post(
            f'{BASE_URL}/api/auth/student-login',
            data=data
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success') and result.get('token'):
                token = result['token']
                print_success(f"Login successful")
                print_info(f"Token: {token[:20]}...")
                print_info(f"User: {result['user']['name']}")
                return token
            else:
                print_error(f"Login response missing token or success flag")
                return None
        else:
            print_error(f"Login failed with status {response.status_code}")
            print_info(f"Response: {response.text}")
            return None
    except Exception as e:
        print_error(f"Login test failed: {e}")
        return None

def test_profile(token):
    """Test student profile endpoint"""
    print_header("TEST 2: Student Profile")
    
    try:
        response = requests.get(
            f'{BASE_URL}/api/auth/student/profile',
            headers={'Authorization': f'Bearer {token}'}
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success') and result.get('student'):
                student = result['student']
                print_success(f"Profile loaded successfully")
                print_info(f"Name: {student['name']}")
                print_info(f"Email: {student['email']}")
                print_info(f"Institute: {student['institute']}")
                return True
            else:
                print_error(f"Profile response missing student data")
                return False
        else:
            print_error(f"Profile fetch failed with status {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
    except Exception as e:
        print_error(f"Profile test failed: {e}")
        return False

def test_rbac(token):
    """Test RBAC endpoint"""
    print_header("TEST 3: RBAC - User Role")
    
    try:
        response = requests.get(
            f'{BASE_URL}/api/rbac/users/{TEST_USER_ID}/role',
            headers={'Authorization': f'Bearer {token}'}
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('role') and result.get('permissions'):
                print_success(f"RBAC endpoint working")
                print_info(f"Role: {result['role']}")
                print_info(f"Permissions: {', '.join(result['permissions'])}")
                return True
            else:
                print_error(f"RBAC response missing role or permissions")
                return False
        else:
            print_error(f"RBAC fetch failed with status {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
    except Exception as e:
        print_error(f"RBAC test failed: {e}")
        return False

def test_published_exams():
    """Test published exams endpoint"""
    print_header("TEST 4: Published Exams")
    
    try:
        response = requests.get(f'{BASE_URL}/api/exams/published')
        
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list):
                print_success(f"Published exams endpoint working")
                print_info(f"Number of published exams: {len(result)}")
                if len(result) == 0:
                    print_info("No exams published yet (this is normal)")
                else:
                    for exam in result[:3]:  # Show first 3
                        print_info(f"  - {exam.get('title', 'Unknown')}")
                return True
            else:
                print_error(f"Published exams response is not a list")
                return False
        else:
            print_error(f"Published exams fetch failed with status {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
    except Exception as e:
        print_error(f"Published exams test failed: {e}")
        return False

def main():
    """Run all tests"""
    print_header("STUDENT DASHBOARD - FINAL VERIFICATION TEST")
    print_info(f"Backend URL: {BASE_URL}")
    print_info(f"Test User: {TEST_USER_ID}")
    print_info(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = {}
    
    # Test 1: Login
    token = test_login()
    results['login'] = token is not None
    
    if not token:
        print_error("Cannot continue without valid token")
        return False
    
    # Test 2: Profile
    results['profile'] = test_profile(token)
    
    # Test 3: RBAC
    results['rbac'] = test_rbac(token)
    
    # Test 4: Published Exams
    results['published_exams'] = test_published_exams()
    
    # Summary
    print_header("TEST SUMMARY")
    
    all_passed = all(results.values())
    
    for test_name, passed in results.items():
        status = f"{GREEN}PASS{RESET}" if passed else f"{RED}FAIL{RESET}"
        print(f"  {test_name.upper()}: {status}")
    
    print()
    if all_passed:
        print_success("ALL TESTS PASSED!")
        print_info("Student dashboard is fully functional")
        return True
    else:
        print_error("SOME TESTS FAILED")
        print_info("Please check the errors above")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)

