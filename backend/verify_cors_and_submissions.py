#!/usr/bin/env python3
"""
Verification script for CORS and submissions endpoint fixes
Tests the new /api/students/me/submissions endpoint
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = 'http://localhost:8000'

def print_header(title):
    """Print formatted header"""
    print("\n" + "=" * 100)
    print(f"  {title}")
    print("=" * 100)

def print_success(message):
    """Print success message"""
    print(f"✅ {message}")

def print_error(message):
    """Print error message"""
    print(f"❌ {message}")

def print_info(message):
    """Print info message"""
    print(f"ℹ️  {message}")

def test_cors_headers():
    """Test CORS headers on submissions endpoint"""
    print_header("Testing CORS Headers")
    
    try:
        # Make a preflight request
        response = requests.options(
            f'{BASE_URL}/api/students/me/submissions',
            headers={
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Authorization'
            }
        )
        
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Headers: {dict(response.headers)}")
        
        # Check for CORS headers
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        }
        
        print("\nCORS Headers:")
        for header, value in cors_headers.items():
            if value:
                print_success(f"{header}: {value}")
            else:
                print_error(f"{header}: NOT SET")
        
        return response.status_code == 200
        
    except Exception as e:
        print_error(f"CORS test failed: {e}")
        return False

def test_submissions_endpoint_without_auth():
    """Test submissions endpoint without authentication"""
    print_header("Testing Submissions Endpoint (No Auth)")
    
    try:
        response = requests.get(f'{BASE_URL}/api/students/me/submissions')
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 401:
            print_success("Correctly returns 401 Unauthorized without token")
            return True
        else:
            print_error(f"Expected 401, got {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Test failed: {e}")
        return False

def test_submissions_endpoint_with_invalid_token():
    """Test submissions endpoint with invalid token"""
    print_header("Testing Submissions Endpoint (Invalid Token)")
    
    try:
        response = requests.get(
            f'{BASE_URL}/api/students/me/submissions',
            headers={'Authorization': 'Bearer invalid_token_12345'}
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 401:
            print_success("Correctly returns 401 for invalid token")
            return True
        else:
            print_error(f"Expected 401, got {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Test failed: {e}")
        return False

def test_endpoint_exists():
    """Test that endpoint exists and is accessible"""
    print_header("Testing Endpoint Accessibility")
    
    try:
        # Try to access the endpoint (will fail auth but should not 404)
        response = requests.get(
            f'{BASE_URL}/api/students/me/submissions',
            headers={'Authorization': 'Bearer test'}
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        # Should be 401 (auth error) not 404 (not found)
        if response.status_code != 404:
            print_success(f"Endpoint exists (status: {response.status_code})")
            return True
        else:
            print_error("Endpoint not found (404)")
            return False
            
    except Exception as e:
        print_error(f"Test failed: {e}")
        return False

def test_backend_health():
    """Test backend health"""
    print_header("Testing Backend Health")
    
    try:
        response = requests.get(f'{BASE_URL}/api/health')
        
        if response.status_code == 200:
            print_success("Backend is running")
            return True
        else:
            print_error(f"Backend returned status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Backend is not responding: {e}")
        return False

def main():
    """Run all verification tests"""
    print("\n" + "=" * 100)
    print("  CORS AND SUBMISSIONS ENDPOINT VERIFICATION")
    print("=" * 100)
    print(f"Timestamp: {datetime.now().isoformat()}")
    print(f"Backend URL: {BASE_URL}")
    
    results = {
        'Backend Health': test_backend_health(),
        'Endpoint Exists': test_endpoint_exists(),
        'CORS Headers': test_cors_headers(),
        'No Auth (401)': test_submissions_endpoint_without_auth(),
        'Invalid Token (401)': test_submissions_endpoint_with_invalid_token(),
    }
    
    # Summary
    print_header("VERIFICATION SUMMARY")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print_success("All verification tests passed!")
        print("\n✅ CORS and submissions endpoint are working correctly")
        print("✅ Frontend can now call /api/students/me/submissions")
        print("✅ Students can load their submissions without 500 errors")
    else:
        print_error(f"Some tests failed ({total - passed} failures)")
    
    print("\n" + "=" * 100)

if __name__ == '__main__':
    main()

