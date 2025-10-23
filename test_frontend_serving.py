#!/usr/bin/env python3
import requests
import time

BASE_URL = "http://localhost:8000"

# Wait for server
print("Waiting for server...")
for i in range(10):
    try:
        r = requests.get(f"{BASE_URL}/")
        print(f"✓ Server ready! Status: {r.status_code}")
        break
    except:
        if i < 9:
            time.sleep(1)

# Test main page
print("\n1. Testing main page (/):")
r = requests.get(f"{BASE_URL}/")
print(f"   Status: {r.status_code}")
print(f"   Has content: {len(r.text) > 100}")

# Test admin page
print("\n2. Testing admin page (/admin):")
r = requests.get(f"{BASE_URL}/admin")
print(f"   Status: {r.status_code}")
print(f"   Has content: {len(r.text) > 100}")

# Test admin login page
print("\n3. Testing admin login page (/admin/login):")
r = requests.get(f"{BASE_URL}/admin/login")
print(f"   Status: {r.status_code}")
print(f"   Has content: {len(r.text) > 100}")
if r.status_code == 200:
    print(f"   Has username field: {'username' in r.text}")
    print(f"   Has password field: {'password' in r.text}")
    print(f"   Has Google button: {'Sign in with Google' in r.text}")
    print(f"   Has local auth text: {'Local Authentication' in r.text}")

# Test API
print("\n4. Testing API (/api/tracks):")
r = requests.get(f"{BASE_URL}/api/tracks")
print(f"   Status: {r.status_code}")
print(f"   Has tracks: {len(r.json()) if r.status_code == 200 else 'N/A'}")

