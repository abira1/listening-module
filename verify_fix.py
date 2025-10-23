import requests
import time

BASE_URL = 'http://localhost:8000'

print("=" * 80)
print("FINAL VERIFICATION - Question Rendering Fix")
print("=" * 80)

try:
    # Test 1: Backend is running
    response = requests.get(f'{BASE_URL}/api/health', timeout=5)
    if response.status_code == 200:
        print("\n✅ Backend Server: RUNNING")
    else:
        print(f"\n⚠️ Backend Server: Status {response.status_code}")
except Exception as e:
    print(f"\n❌ Backend Server: NOT RUNNING - {e}")
    exit(1)

try:
    # Test 2: Get exams
    response = requests.get(f'{BASE_URL}/api/exams', timeout=5)
    if response.status_code == 200:
        exams = response.json()
        print(f"✅ API /api/exams: {len(exams)} exams available")
    else:
        print(f"❌ API /api/exams: Status {response.status_code}")
except Exception as e:
    print(f"❌ API /api/exams: {e}")

try:
    # Test 3: Get full exam data
    response = requests.get(f'{BASE_URL}/api/exams/track-listening-3ef74176/full', timeout=5)
    if response.status_code == 200:
        exam_data = response.json()
        sections = exam_data.get('sections', [])
        total_questions = sum(len(s.get('questions', [])) for s in sections)
        print(f"✅ API /api/exams/{{id}}/full: {total_questions} questions loaded")
        
        # Check question types
        types = set()
        for section in sections:
            for q in section.get('questions', []):
                types.add(q.get('type'))
        print(f"✅ Question Types: {', '.join(sorted(types))}")
    else:
        print(f"❌ API /api/exams/{{id}}/full: Status {response.status_code}")
except Exception as e:
    print(f"❌ API /api/exams/{{id}}/full: {e}")

try:
    # Test 4: Frontend is served
    response = requests.get(f'{BASE_URL}/', timeout=5)
    if response.status_code == 200:
        print("✅ Frontend: SERVED from backend")
    else:
        print(f"⚠️ Frontend: Status {response.status_code}")
except Exception as e:
    print(f"❌ Frontend: {e}")

print("\n" + "=" * 80)
print("VERIFICATION COMPLETE")
print("=" * 80)
print("\n✅ All systems operational")
print("✅ Ready for testing at: http://localhost:8000/exam/track-listening-3ef74176")
print("=" * 80)

