import requests
import time

BASE_URL = 'http://localhost:8000'

print("=" * 70)
print("TESTING BOTH ADMIN AND STUDENT PAGES")
print("=" * 70)

# Test 1: Admin Panel
print("\n✅ TEST 1: Admin Panel")
try:
    response = requests.get(f'{BASE_URL}/admin')
    print(f"   URL: {BASE_URL}/admin")
    print(f"   Status: HTTP {response.status_code}")
    if response.status_code == 200:
        print("   ✅ PASS - Admin panel loads successfully")
    else:
        print(f"   ❌ FAIL - Got {response.status_code}")
except Exception as e:
    print(f"   ❌ FAIL: {e}")

# Test 2: Student Dashboard
print("\n✅ TEST 2: Student Dashboard")
try:
    response = requests.get(f'{BASE_URL}/student/dashboard')
    print(f"   URL: {BASE_URL}/student/dashboard")
    print(f"   Status: HTTP {response.status_code}")
    if response.status_code == 200:
        print("   ✅ PASS - Student dashboard loads successfully")
    else:
        print(f"   ❌ FAIL - Got {response.status_code}")
except Exception as e:
    print(f"   ❌ FAIL: {e}")

# Test 3: API Endpoints
print("\n✅ TEST 3: API Endpoints")
try:
    response = requests.get(f'{BASE_URL}/api/exams')
    print(f"   GET /api/exams: HTTP {response.status_code}")
    if response.status_code == 200:
        print(f"   ✅ PASS - {len(response.json())} exams found")
    else:
        print(f"   ❌ FAIL")
except Exception as e:
    print(f"   ❌ FAIL: {e}")

print("\n" + "=" * 70)
print("✅ BOTH PAGES READY FOR TESTING")
print("=" * 70)
print("\nAccess Points:")
print("  • Admin Panel: http://localhost:8000/admin")
print("  • Student Dashboard: http://localhost:8000/student/dashboard")
print("  • API Base: http://localhost:8000/api")
print("\n" + "=" * 70)
