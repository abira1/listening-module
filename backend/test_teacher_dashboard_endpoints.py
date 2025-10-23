"""
Test script for teacher dashboard endpoints
Tests the new /api/teachers/{teacherId}/dashboard and related endpoints
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api"

def test_teacher_dashboard_endpoints():
    """Test teacher dashboard endpoints"""
    print("\n" + "="*60)
    print("TESTING TEACHER DASHBOARD ENDPOINTS")
    print("="*60)
    
    # Step 1: Login as teacher
    print("\n[1] Testing teacher login...")
    login_data = {
        'teacher_id': 'TCH-QGMQF3',
        'password': 'TestPassword123!'
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/teacher-login",
            data=login_data
        )
        
        if response.status_code == 200:
            login_result = response.json()
            token = login_result.get('token')
            teacher = login_result.get('teacher')
            print(f"✓ Login successful")
            print(f"  Teacher ID: {teacher.get('teacher_id')}")
            print(f"  Full Name: {teacher.get('full_name')}")
            print(f"  Token: {token[:20]}...")
        else:
            print(f"✗ Login failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return
    except Exception as e:
        print(f"✗ Login error: {e}")
        return
    
    # Step 2: Test dashboard endpoint
    print("\n[2] Testing /api/teachers/{teacherId}/dashboard endpoint...")
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get(
            f"{BASE_URL}/teachers/{teacher.get('teacher_id')}/dashboard",
            headers=headers
        )
        
        if response.status_code == 200:
            dashboard_data = response.json()
            print(f"✓ Dashboard endpoint works")
            print(f"  Success: {dashboard_data.get('success')}")
            print(f"  Teacher: {dashboard_data.get('teacher', {}).get('full_name')}")
            stats = dashboard_data.get('statistics', {})
            print(f"  Statistics:")
            print(f"    - Pending Submissions: {stats.get('pending_submissions')}")
            print(f"    - Graded Submissions: {stats.get('graded_submissions')}")
            print(f"    - Total Students: {stats.get('total_students')}")
        else:
            print(f"✗ Dashboard endpoint failed: {response.status_code}")
            print(f"  Response: {response.text}")
    except Exception as e:
        print(f"✗ Dashboard endpoint error: {e}")
    
    # Step 3: Test pending submissions endpoint
    print("\n[3] Testing /api/teachers/{teacherId}/pending-submissions endpoint...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/teachers/{teacher.get('teacher_id')}/pending-submissions",
            headers=headers
        )
        
        if response.status_code == 200:
            submissions_data = response.json()
            print(f"✓ Pending submissions endpoint works")
            print(f"  Success: {submissions_data.get('success')}")
            submissions = submissions_data.get('submissions', [])
            print(f"  Pending Submissions Count: {len(submissions)}")
            if submissions:
                print(f"  First submission:")
                print(f"    - Submission ID: {submissions[0].get('submission_id')}")
                print(f"    - Student: {submissions[0].get('student_name')}")
                print(f"    - Exam: {submissions[0].get('exam_title')}")
        else:
            print(f"✗ Pending submissions endpoint failed: {response.status_code}")
            print(f"  Response: {response.text}")
    except Exception as e:
        print(f"✗ Pending submissions endpoint error: {e}")
    
    # Step 4: Test students endpoint
    print("\n[4] Testing /api/teachers/{teacherId}/students endpoint...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/teachers/{teacher.get('teacher_id')}/students",
            headers=headers
        )
        
        if response.status_code == 200:
            students_data = response.json()
            print(f"✓ Students endpoint works")
            print(f"  Success: {students_data.get('success')}")
            students = students_data.get('students', [])
            print(f"  Students Count: {len(students)}")
            if students:
                print(f"  First student:")
                print(f"    - Student ID: {students[0].get('student_id')}")
                print(f"    - Name: {students[0].get('full_name')}")
                print(f"    - Email: {students[0].get('email')}")
        else:
            print(f"✗ Students endpoint failed: {response.status_code}")
            print(f"  Response: {response.text}")
    except Exception as e:
        print(f"✗ Students endpoint error: {e}")
    
    # Step 5: Test unauthorized access
    print("\n[5] Testing unauthorized access (no token)...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/teachers/{teacher.get('teacher_id')}/dashboard"
        )
        
        if response.status_code == 401:
            print(f"✓ Correctly rejected unauthorized request")
            print(f"  Status: {response.status_code}")
        else:
            print(f"✗ Should have rejected unauthorized request")
            print(f"  Status: {response.status_code}")
    except Exception as e:
        print(f"✗ Unauthorized test error: {e}")
    
    print("\n" + "="*60)
    print("TESTING COMPLETE")
    print("="*60 + "\n")

if __name__ == "__main__":
    test_teacher_dashboard_endpoints()

