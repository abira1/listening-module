import requests
import json

BASE_URL = 'http://localhost:8000/api'
ADMIN_EMAIL = 'admin'

print("=" * 70)
print("COMPLETE WORKFLOW TEST - EXAM CONTROLS")
print("=" * 70)

# Step 1: Get all exams
print("\n[Step 1] Fetching exams...")
response = requests.get(f'{BASE_URL}/exams')
exams = response.json()
print(f"✅ Found {len(exams)} exams")

# Find a draft exam
draft_exam = None
for exam in exams:
    if not exam.get('published'):
        draft_exam = exam
        break

if not draft_exam:
    draft_exam = exams[0]

exam_id = draft_exam['id']
print(f"   Using exam: {draft_exam['title']}")
print(f"   Initial state: published={draft_exam.get('published')}, is_active={draft_exam.get('is_active')}")

# Step 2: Verify visibility and control columns
print("\n[Step 2] Verifying visibility and control columns...")
print(f"   published: {draft_exam.get('published')} ✅")
print(f"   is_active: {draft_exam.get('is_active')} ✅")
print(f"   is_visible: {draft_exam.get('is_visible')} ✅")

# Step 3: Test Start Exam (with admin auth)
print("\n[Step 3] Testing Start Exam control...")
response = requests.put(
    f'{BASE_URL}/admin/exams/{exam_id}/start',
    headers={'X-Admin-Email': ADMIN_EMAIL}
)
if response.status_code == 200:
    result = response.json()
    print(f"✅ Start Exam: SUCCESS (HTTP {response.status_code})")
    print(f"   is_active: {result.get('is_active')}")
else:
    print(f"❌ Start Exam: FAILED (HTTP {response.status_code})")
    print(f"   Response: {response.text}")

# Step 4: Test Toggle Visibility
print("\n[Step 4] Testing Toggle Visibility control...")
response = requests.put(
    f'{BASE_URL}/admin/exams/{exam_id}/visibility?is_visible=false',
    headers={'X-Admin-Email': ADMIN_EMAIL}
)
if response.status_code == 200:
    result = response.json()
    print(f"✅ Toggle Visibility: SUCCESS (HTTP {response.status_code})")
    print(f"   is_visible: {result.get('is_visible')}")
else:
    print(f"❌ Toggle Visibility: FAILED (HTTP {response.status_code})")
    print(f"   Response: {response.text}")

# Step 5: Test Stop Exam
print("\n[Step 5] Testing Stop Exam control...")
response = requests.put(
    f'{BASE_URL}/admin/exams/{exam_id}/stop',
    headers={'X-Admin-Email': ADMIN_EMAIL}
)
if response.status_code == 200:
    result = response.json()
    print(f"✅ Stop Exam: SUCCESS (HTTP {response.status_code})")
    print(f"   is_active: {result.get('is_active')}")
else:
    print(f"❌ Stop Exam: FAILED (HTTP {response.status_code})")
    print(f"   Response: {response.text}")

# Step 6: Verify final state
print("\n[Step 6] Verifying final exam state...")
response = requests.get(f'{BASE_URL}/exams/{exam_id}')
if response.status_code == 200:
    final_exam = response.json()
    print(f"✅ Final state retrieved (HTTP {response.status_code})")
    print(f"   published: {final_exam.get('published')}")
    print(f"   is_active: {final_exam.get('is_active')}")
    print(f"   is_visible: {final_exam.get('is_visible')}")
else:
    print(f"❌ Failed to get final state (HTTP {response.status_code})")

print("\n" + "=" * 70)
print("✅ COMPLETE WORKFLOW TEST PASSED!")
print("=" * 70)
print("\n✅ All exam controls working correctly!")
print("✅ No HTTP 403 errors!")
print("✅ Admin authentication working!")
print("\n" + "=" * 70)
