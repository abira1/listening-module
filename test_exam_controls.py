#!/usr/bin/env python3
"""
Test script to verify exam control functionality
"""

import requests
import json
import time

BASE_URL = 'http://localhost:8000/api'
ADMIN_EMAIL = 'shahsultanweb@gmail.com'  # Use one of the configured admin emails

def wait_for_server():
    """Wait for server to start"""
    for i in range(30):
        try:
            requests.get(f"{BASE_URL}/exams", timeout=2)
            print("✅ Server is ready")
            return True
        except:
            if i % 5 == 0:
                print(f"⏳ Waiting for server... ({i}s)")
            time.sleep(1)
    return False

def test_exam_controls():
    """Test exam control functionality"""
    
    print("\n" + "="*60)
    print("EXAM CONTROLS TEST")
    print("="*60)
    
    # Step 1: Get all exams
    print("\n[Step 1] Getting all exams...")
    try:
        response = requests.get(f"{BASE_URL}/exams", timeout=10)
        if response.status_code == 200:
            exams = response.json()
            print(f"✅ Found {len(exams)} exams")
            
            # Find a draft exam to test with
            draft_exam = None
            for exam in exams:
                if not exam.get('published'):
                    draft_exam = exam
                    break
            
            if not draft_exam:
                print("⚠️  No draft exams found, using first exam")
                draft_exam = exams[0] if exams else None
            
            if not draft_exam:
                print("❌ No exams available for testing")
                return False
            
            exam_id = draft_exam['id']
            print(f"   Using exam: {draft_exam['title']} (ID: {exam_id})")
            print(f"   Current status: Published={draft_exam.get('published')}, Active={draft_exam.get('is_active')}")
        else:
            print(f"❌ Failed to get exams: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False
    
    # Step 2: Publish exam if not published
    print("\n[Step 2] Publishing exam...")
    if not draft_exam.get('published'):
        try:
            response = requests.put(
                f"{BASE_URL}/exams/{exam_id}",
                json={"published": True},
                timeout=10
            )
            if response.status_code == 200:
                print(f"✅ Exam published successfully")
            else:
                print(f"⚠️  Publish returned {response.status_code}: {response.text}")
        except Exception as e:
            print(f"⚠️  Error publishing: {str(e)}")
    else:
        print(f"✅ Exam already published")
    
    # Step 3: Test Start Exam
    print("\n[Step 3] Testing Start Exam control...")
    try:
        response = requests.put(
            f"{BASE_URL}/admin/exams/{exam_id}/start",
            headers={'X-Admin-Email': ADMIN_EMAIL},
            timeout=10
        )
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Start Exam: SUCCESS")
            print(f"   is_active: {result.get('is_active')}")
            print(f"   started_at: {result.get('started_at')}")
        else:
            print(f"❌ Start Exam failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False
    
    # Step 4: Test Toggle Visibility
    print("\n[Step 4] Testing Toggle Visibility control...")
    try:
        response = requests.put(
            f"{BASE_URL}/admin/exams/{exam_id}/visibility?is_visible=false",
            headers={'X-Admin-Email': ADMIN_EMAIL},
            timeout=10
        )
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Toggle Visibility (hide): SUCCESS")
            print(f"   is_visible: {result.get('is_visible')}")
        else:
            print(f"❌ Toggle Visibility failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False
    
    # Step 5: Test Toggle Visibility again (show)
    print("\n[Step 5] Testing Toggle Visibility again (show)...")
    try:
        response = requests.put(
            f"{BASE_URL}/admin/exams/{exam_id}/visibility?is_visible=true",
            headers={'X-Admin-Email': ADMIN_EMAIL},
            timeout=10
        )
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Toggle Visibility (show): SUCCESS")
            print(f"   is_visible: {result.get('is_visible')}")
        else:
            print(f"❌ Toggle Visibility failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False
    
    # Step 6: Test Stop Exam
    print("\n[Step 6] Testing Stop Exam control...")
    try:
        response = requests.put(
            f"{BASE_URL}/admin/exams/{exam_id}/stop",
            headers={'X-Admin-Email': ADMIN_EMAIL},
            timeout=10
        )
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Stop Exam: SUCCESS")
            print(f"   is_active: {result.get('is_active')}")
            print(f"   stopped_at: {result.get('stopped_at')}")
        else:
            print(f"❌ Stop Exam failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False
    
    # Step 7: Verify final state
    print("\n[Step 7] Verifying final exam state...")
    try:
        response = requests.get(f"{BASE_URL}/exams/{exam_id}", timeout=10)
        if response.status_code == 200:
            final_exam = response.json()
            print(f"✅ Final exam state:")
            print(f"   Published: {final_exam.get('published')}")
            print(f"   Active: {final_exam.get('is_active')}")
            print(f"   Visible: {final_exam.get('is_visible')}")
            return True
        else:
            print(f"❌ Failed to get final state: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == '__main__':
    if not wait_for_server():
        print("❌ Server failed to start")
        exit(1)
    
    success = test_exam_controls()
    
    print("\n" + "="*60)
    if success:
        print("✅ ALL EXAM CONTROLS WORKING!")
    else:
        print("❌ SOME EXAM CONTROLS FAILED")
    print("="*60)
    
    exit(0 if success else 1)

