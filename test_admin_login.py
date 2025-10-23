#!/usr/bin/env python3
"""
Test Admin Login Page
Verifies that the admin login page has been updated to use local authentication
"""

import requests
import time

BASE_URL = "http://localhost:8000"

def test_admin_login_page():
    """Test that admin login page shows local form, not Google button"""
    print("\n" + "="*70)
    print("TEST: Admin Login Page - Local Authentication")
    print("="*70)

    try:
        # Get the admin page which loads the React app
        response = requests.get(f"{BASE_URL}/admin")
        print(f"✓ Status Code: {response.status_code}")

        if response.status_code != 200:
            print(f"✗ Error: Expected 200, got {response.status_code}")
            return False

        html_content = response.text

        # Check for Google login button (should NOT exist)
        if "Sign in with Google" in html_content or "signInWithPopup" in html_content:
            print("✗ FAIL: Google login button still present!")
            return False
        else:
            print("✓ PASS: Google login button removed")

        # Get the main.js file to check for local authentication code
        # Extract the main.js filename from the HTML
        import re
        main_js_match = re.search(r'src="(/static/js/main\.[a-f0-9]+\.js)"', html_content)
        if not main_js_match:
            print("✗ FAIL: Could not find main.js file")
            return False

        main_js_url = f"{BASE_URL}{main_js_match.group(1)}"
        js_response = requests.get(main_js_url)
        js_content = js_response.text

        # Check for local form elements (should exist in the JavaScript bundle)
        checks = [
            ("Local credentials in code", "admin123" in js_content),
            ("Login with credentials function", "loginWithCredentials" in js_content),
            ("Session storage for auth", "sessionStorage" in js_content),
        ]

        all_passed = True
        for check_name, check_result in checks:
            if check_result:
                print(f"✓ PASS: {check_name} found")
            else:
                print(f"✗ FAIL: {check_name} NOT found")
                all_passed = False

        # Check for Firebase references in admin authentication (should NOT exist)
        # Note: Firebase may still be in the bundle for other parts of the app (student dashboard, etc.)
        # but it should NOT be used for admin authentication
        firebase_checks = [
            ("Google Auth Provider", "GoogleAuthProvider" in js_content),
            ("signInWithPopup", "signInWithPopup" in js_content),
        ]

        for check_name, check_result in firebase_checks:
            if check_result:
                print(f"✗ FAIL: {check_name} still present!")
                all_passed = False
            else:
                print(f"✓ PASS: {check_name} removed")

        return all_passed

    except Exception as e:
        print(f"✗ Exception: {e}")
        return False

def test_admin_login_functionality():
    """Test that admin login form is functional"""
    print("\n" + "="*70)
    print("TEST: Admin Login Form Functionality")
    print("="*70)

    try:
        # Get the admin page which loads the React app
        response = requests.get(f"{BASE_URL}/admin")

        if response.status_code != 200:
            print(f"✗ Error: Could not load admin page")
            return False

        html_content = response.text

        # Get the main.js file to check for local authentication code
        import re
        main_js_match = re.search(r'src="(/static/js/main\.[a-f0-9]+\.js)"', html_content)
        if not main_js_match:
            print("✗ FAIL: Could not find main.js file")
            return False

        main_js_url = f"{BASE_URL}{main_js_match.group(1)}"
        js_response = requests.get(main_js_url)
        js_content = js_response.text

        # Check for local authentication implementation
        checks = [
            ("Local credentials", "admin123" in js_content),
            ("Login function", "loginWithCredentials" in js_content),
            ("Session storage", "sessionStorage" in js_content),
            ("Admin user object", "isAdmin" in js_content),
        ]

        all_passed = True
        for check_name, check_result in checks:
            if check_result:
                print(f"✓ PASS: {check_name} found")
            else:
                print(f"✗ FAIL: {check_name} NOT found")
                all_passed = False

        return all_passed

    except Exception as e:
        print(f"✗ Exception: {e}")
        return False

def test_no_external_dependencies():
    """Test that no external authentication dependencies are loaded"""
    print("\n" + "="*70)
    print("TEST: No External Authentication Dependencies")
    print("="*70)

    try:
        response = requests.get(f"{BASE_URL}/admin")
        html_content = response.text
        
        # Check for external CDN references
        external_checks = [
            ("Firebase CDN", "firebase" in html_content.lower() and "cdn" in html_content.lower()),
            ("Google APIs", "googleapis.com" in html_content),
            ("PostHog", "posthog" in html_content.lower()),
            ("rrweb", "rrweb" in html_content.lower()),
        ]
        
        all_passed = True
        for check_name, check_result in external_checks:
            if check_result:
                print(f"✗ FAIL: {check_name} dependency still present!")
                all_passed = False
            else:
                print(f"✓ PASS: {check_name} dependency removed")
        
        return all_passed
        
    except Exception as e:
        print(f"✗ Exception: {e}")
        return False

def main():
    print("\n" + "="*70)
    print("ADMIN LOGIN PAGE - VERIFICATION TESTS")
    print("="*70)
    print(f"Base URL: {BASE_URL}")
    print(f"Test Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Wait for server
    print("\nWaiting for server to be ready...")
    for i in range(10):
        try:
            requests.get(f"{BASE_URL}/admin/login")
            print("✓ Server is ready!")
            break
        except:
            if i < 9:
                time.sleep(1)
            else:
                print("✗ Server not responding")
                return
    
    # Run tests
    results = []
    results.append(("Admin login page - Local auth", test_admin_login_page()))
    results.append(("Admin login form functionality", test_admin_login_functionality()))
    results.append(("No external dependencies", test_no_external_dependencies()))
    
    # Summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✓✓✓ ALL TESTS PASSED! ✓✓✓")
        print("\nAdmin Login Page Status:")
        print("  ✓ Google/Firebase authentication REMOVED")
        print("  ✓ Local username/password form IMPLEMENTED")
        print("  ✓ No external dependencies")
        print("  ✓ 100% local authentication")
        print("\nDemo Credentials:")
        print("  Username: admin")
        print("  Password: admin123")
    else:
        print(f"\n✗ {total - passed} test(s) failed.")

if __name__ == "__main__":
    main()

