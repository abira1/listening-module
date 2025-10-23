import requests
import json

BASE_URL = 'http://localhost:8000/api'

print("=" * 60)
print("TESTING VISIBILITY AND CONTROL COLUMNS")
print("=" * 60)

# Get all exams
print("\n[Step 1] Fetching all exams...")
response = requests.get(f'{BASE_URL}/exams')
exams = response.json()

print(f"✅ Found {len(exams)} exams")

# Check first 5 exams
print("\n[Step 2] Checking first 5 exams for required fields...")
for i, exam in enumerate(exams[:5]):
    print(f"\n  Exam {i+1}: {exam['title']}")
    print(f"    - published: {exam.get('published', 'MISSING')}")
    print(f"    - is_active: {exam.get('is_active', 'MISSING')}")
    print(f"    - is_visible: {exam.get('is_visible', 'MISSING')}")
    print(f"    - status: {exam.get('status', 'MISSING')}")
    
    # Check if all required fields are present
    required_fields = ['published', 'is_active', 'is_visible']
    missing = [f for f in required_fields if f not in exam]
    if missing:
        print(f"    ⚠️  MISSING FIELDS: {missing}")
    else:
        print(f"    ✅ All required fields present")

print("\n" + "=" * 60)
print("✅ TEST COMPLETE")
print("=" * 60)
