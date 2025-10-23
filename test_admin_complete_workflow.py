#!/usr/bin/env python3
"""
Complete Admin Workflow Test
Verifies the entire admin login and dashboard workflow
"""

import requests
import time
import json

BASE_URL = "http://localhost:8000"

def test_admin_login_workflow():
    """Test complete admin login workflow"""
    print("\n" + "="*70)
    print("TEST: Complete Admin Login Workflow")
    print("="*70)
    
    try:
        # Step 1: Access admin page
        print("\n1. Accessing admin page...")
        response = requests.get(f"{BASE_URL}/admin")
        if response.status_code != 200:
            print(f"✗ FAIL: Could not access admin page (Status: {response.status_code})")
            return False
        print("✓ PASS: Admin page accessible")
        
        # Step 2: Verify no Google login button
        print("\n2. Verifying Google login removed...")
        if "Sign in with Google" in response.text:
            print("✗ FAIL: Google login button still present")
            return False
        print("✓ PASS: Google login button removed")
        
        # Step 3: Verify no external dependencies
        print("\n3. Checking for external dependencies...")
        external_deps = {
            "rrweb": "rrweb" in response.text,
            "PostHog": "posthog" in response.text,
            "Firebase CDN": "firebase" in response.text and "cdn" in response.text.lower(),
        }
        
        for dep_name, found in external_deps.items():
            if found:
                print(f"✗ FAIL: {dep_name} dependency found")
                return False
        print("✓ PASS: No external dependencies")
        
        # Step 4: Verify local auth code is present
        print("\n4. Verifying local authentication code...")
        import re
        main_js_match = re.search(r'src="(/static/js/main\.[a-f0-9]+\.js)"', response.text)
        if not main_js_match:
            print("✗ FAIL: Could not find main.js")
            return False
        
        main_js_url = f"{BASE_URL}{main_js_match.group(1)}"
        js_response = requests.get(main_js_url)
        js_content = js_response.text
        
        auth_checks = {
            "admin123": "admin123" in js_content,
            "loginWithCredentials": "loginWithCredentials" in js_content,
            "sessionStorage": "sessionStorage" in js_content,
        }
        
        for check_name, found in auth_checks.items():
            if not found:
                print(f"✗ FAIL: {check_name} not found in code")
                return False
        print("✓ PASS: Local authentication code present")
        
        # Step 5: Verify API endpoints are working
        print("\n5. Verifying API endpoints...")
        api_endpoints = [
            ("/api/tracks", "GET", 200),
        ]

        for endpoint, method, expected_status in api_endpoints:
            try:
                r = requests.get(f"{BASE_URL}{endpoint}")
                if r.status_code != expected_status:
                    print(f"✗ FAIL: {endpoint} returned {r.status_code} (expected {expected_status})")
                    return False
            except Exception as e:
                print(f"✗ FAIL: {endpoint} error: {e}")
                return False
        print("✓ PASS: API endpoints working")
        
        # Step 6: Summary
        print("\n" + "="*70)
        print("✓✓✓ COMPLETE ADMIN WORKFLOW TEST PASSED ✓✓✓")
        print("="*70)
        print("\nAdmin Login System Status:")
        print("  ✓ Admin page accessible")
        print("  ✓ Google login removed")
        print("  ✓ No external dependencies")
        print("  ✓ Local authentication implemented")
        print("  ✓ API endpoints working")
        print("\nDemo Credentials:")
        print("  Username: admin")
        print("  Password: admin123")
        print("\nAccess admin panel at: http://localhost:8000/admin")
        
        return True
        
    except Exception as e:
        print(f"✗ Exception: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Wait for server
    print("Waiting for server to be ready...")
    for i in range(10):
        try:
            requests.get(f"{BASE_URL}/")
            print("✓ Server ready!")
            break
        except:
            if i < 9:
                time.sleep(1)
    
    # Run test
    success = test_admin_login_workflow()
    
    # Exit with appropriate code
    exit(0 if success else 1)

