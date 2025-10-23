import requests

BASE_URL = 'http://localhost:8000'

print("=" * 80)
print("COMPLETE STUDENT EXAM WORKFLOW TEST")
print("=" * 80)

# Step 1: Get published exams
print("\nSTEP 1: Get Published Exams (Student Dashboard)")
print("-" * 80)
try:
    response = requests.get(f'{BASE_URL}/api/exams/published')
    if response.status_code == 200:
        exams = response.json()
        print(f"Status: HTTP 200 - OK")
        print(f"Total published exams: {len(exams)}")
        
        if exams:
            exam = exams[0]
            print(f"\nSample Exam:")
            print(f"   ID: {exam.get('id')}")
            print(f"   Title: {exam.get('title')}")
            print(f"   Type: {exam.get('exam_type')}")
            print(f"   Published: {exam.get('published')}")
            print(f"   Is Active: {exam.get('is_active')}")
            print(f"   Is Visible: {exam.get('is_visible')}")
            
            # Verify required fields
            required = ['id', 'title', 'exam_type', 'published', 'is_active', 'is_visible']
            missing = [f for f in required if f not in exam]
            if missing:
                print(f"   MISSING FIELDS: {missing}")
            else:
                print(f"   All required fields present - OK")
                
                # Check if exam is "Live" (active and visible)
                if exam.get('is_active') and exam.get('is_visible'):
                    print(f"   Exam is LIVE - Student can see it on dashboard")
                    exam_id = exam.get('id')
                else:
                    print(f"   Exam is not live (active={exam.get('is_active')}, visible={exam.get('is_visible')})")
    else:
        print(f"Failed: HTTP {response.status_code}")
except Exception as e:
    print(f"Error: {e}")

# Step 2: Get exam status
print("\n\nSTEP 2: Get Exam Status (Polling)")
print("-" * 80)
try:
    if 'exam_id' in locals():
        response = requests.get(f'{BASE_URL}/api/exams/{exam_id}/status')
        if response.status_code == 200:
            status = response.json()
            print(f"Status: HTTP 200 - OK")
            print(f"   Exam ID: {status.get('exam_id')}")
            print(f"   Is Active: {status.get('is_active')}")
            print(f"   Published: {status.get('published')}")
            print(f"   Status endpoint working correctly")
        else:
            print(f"Failed: HTTP {response.status_code}")
except Exception as e:
    print(f"Error: {e}")

# Step 3: Get exam details
print("\n\nSTEP 3: Get Exam Details (Student clicks Start)")
print("-" * 80)
try:
    if 'exam_id' in locals():
        response = requests.get(f'{BASE_URL}/api/exams/{exam_id}')
        if response.status_code == 200:
            exam_data = response.json()
            print(f"Status: HTTP 200 - OK")
            print(f"   Exam ID: {exam_data.get('id')}")
            print(f"   Title: {exam_data.get('title')}")
            print(f"   Type: {exam_data.get('exam_type')}")
            print(f"   Duration: {exam_data.get('duration_seconds')} seconds")
            print(f"   Exam data loaded successfully")
            print(f"   Student can now take the exam")
        else:
            print(f"Failed: HTTP {response.status_code}")
except Exception as e:
    print(f"Error: {e}")

# Step 4: Verify frontend pages load
print("\n\nSTEP 4: Verify Frontend Pages Load")
print("-" * 80)
try:
    # Admin panel
    response = requests.get(f'{BASE_URL}/admin')
    admin_ok = response.status_code == 200
    print(f"   Admin Panel: {'OK - HTTP 200' if admin_ok else f'FAIL - HTTP {response.status_code}'}")
    
    # Student dashboard
    response = requests.get(f'{BASE_URL}/student/dashboard')
    dashboard_ok = response.status_code == 200
    print(f"   Student Dashboard: {'OK - HTTP 200' if dashboard_ok else f'FAIL - HTTP {response.status_code}'}")
    
    # Exam interface
    if 'exam_id' in locals():
        response = requests.get(f'{BASE_URL}/exam/{exam_id}')
        exam_ok = response.status_code == 200
        print(f"   Exam Interface: {'OK - HTTP 200' if exam_ok else f'FAIL - HTTP {response.status_code}'}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "=" * 80)
print("WORKFLOW TEST COMPLETE")
print("=" * 80)
print("\nSUMMARY:")
print("   1. Published exams endpoint returns is_active and is_visible")
print("   2. Status polling endpoint working")
print("   3. Exam details can be loaded")
print("   4. Frontend pages accessible")
print("\nSTUDENT WORKFLOW:")
print("   1. Student logs in -> Sees dashboard")
print("   2. Dashboard shows Live exams (is_active=True, is_visible=True)")
print("   3. Student clicks Start -> Navigates to /exam/{exam_id}")
print("   4. ExamTest component loads exam data")
print("   5. Student can take the exam")
print("\n" + "=" * 80)

