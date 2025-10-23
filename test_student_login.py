#!/usr/bin/env python
"""Test student login API"""

import requests
import json

BASE_URL = 'http://localhost:8000'

# Test credentials
USER_ID = 'STU-2025-022'
REGISTRATION_NUMBER = 'REG-2025-022'

print(f"Testing student login...")
print(f"URL: {BASE_URL}/api/auth/student-login")
print(f"User ID: {USER_ID}")
print(f"Registration Number: {REGISTRATION_NUMBER}")
print()

try:
    # Make login request
    response = requests.post(
        f'{BASE_URL}/api/auth/student-login',
        data={
            'user_id': USER_ID,
            'registration_number': REGISTRATION_NUMBER
        }
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Content-Type: {response.headers.get('content-type')}")
    print(f"Response Text: {response.text[:500]}")
    print()
    
    if response.status_code == 200:
        try:
            data = response.json()
            print("✓ Login successful!")
            print(f"Response JSON:")
            print(json.dumps(data, indent=2))
        except json.JSONDecodeError as e:
            print(f"✗ Failed to parse JSON: {e}")
            print(f"Raw response: {response.text}")
    else:
        print(f"✗ Login failed with status {response.status_code}")
        try:
            error = response.json()
            print(f"Error: {error}")
        except:
            print(f"Response: {response.text}")

except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()

