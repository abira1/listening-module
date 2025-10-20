#!/usr/bin/env python3
"""
API Endpoint Tests for Question Upload Workflow
Tests the FastAPI endpoints with actual HTTP requests
"""

import requests
import json
import time
from pathlib import Path

# Configuration
BACKEND_URL = "http://localhost:8002"
API_BASE = f"{BACKEND_URL}/api"

# Test files
TEST_FILES = {
    "listening": "sample_test_files/listening_test_simple.json",
    "reading": "sample_test_files/reading_test_simple.json",
    "writing": "sample_test_files/writing_test_simple.json",
}

# Test results
results = {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "errors": []
}

def print_header(title):
    """Print test header"""
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}\n")

def print_test(name, passed, details=""):
    """Print test result"""
    status = "[PASS]" if passed else "[FAIL]"
    print(f"{status} - {name}")
    if details:
        print(f"   {details}")
    results["total"] += 1
    if passed:
        results["passed"] += 1
    else:
        results["failed"] += 1
        results["errors"].append(f"{name}: {details}")

def test_api_health():
    """Test 1: API Health Check"""
    print_header("TEST 1: API HEALTH CHECK")
    
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=5)
        passed = response.status_code in [200, 404]  # 404 is OK for root endpoint
        print_test("Backend is running", passed, f"Status: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print_test("Backend is running", False, "Connection refused - backend not running")
    except Exception as e:
        print_test("Backend is running", False, str(e))

def test_validate_json_endpoint():
    """Test 2: Validate JSON Endpoint"""
    print_header("TEST 2: VALIDATE JSON ENDPOINT")
    
    for test_type, file_path in TEST_FILES.items():
        if not Path(file_path).exists():
            print_test(f"Validate {test_type} JSON", False, f"File not found: {file_path}")
            continue
        
        try:
            with open(file_path, 'rb') as f:
                files = {'file': f}
                response = requests.post(
                    f"{API_BASE}/tracks/validate-json",
                    files=files,
                    timeout=10
                )
            
            passed = response.status_code == 200
            data = response.json() if response.status_code == 200 else {}
            
            details = f"Status: {response.status_code}"
            if passed:
                details += f", Valid: {data.get('is_valid')}, Questions: {data.get('total_questions')}"
            
            print_test(f"Validate {test_type} JSON", passed, details)
        except Exception as e:
            print_test(f"Validate {test_type} JSON", False, str(e))

def test_upload_json_endpoint():
    """Test 3: Upload JSON Endpoint"""
    print_header("TEST 3: UPLOAD JSON ENDPOINT")

    for test_type, file_path in TEST_FILES.items():
        if not Path(file_path).exists():
            print_test(f"Upload {test_type} JSON", False, f"File not found: {file_path}")
            continue

        try:
            with open(file_path, 'rb') as f:
                files = {'file': f}
                response = requests.post(
                    f"{API_BASE}/tracks/import-from-json",
                    files=files,
                    timeout=30  # Increased timeout for Firebase operations
                )

            passed = response.status_code == 200
            data = response.json() if response.status_code in [200, 400] else {}

            details = f"Status: {response.status_code}"
            if passed:
                details += f", Success: {data.get('success')}, Questions: {data.get('questions_created')}"
            else:
                # Show error details for debugging
                if 'detail' in data:
                    details += f", Error: {data.get('detail')}"
                elif 'error' in data:
                    details += f", Error: {data.get('error')}"

            print_test(f"Upload {test_type} JSON", passed, details)
        except Exception as e:
            print_test(f"Upload {test_type} JSON", False, str(e))

def test_invalid_file():
    """Test 4: Invalid File Handling"""
    print_header("TEST 4: INVALID FILE HANDLING")

    # Test 4.1: Non-JSON file (should be rejected by upload endpoint)
    try:
        files = {'file': ('test.txt', b'This is not JSON', 'text/plain')}
        response = requests.post(
            f"{API_BASE}/tracks/import-from-json",
            files=files,
            timeout=10
        )
        passed = response.status_code != 200
        print_test("Reject non-JSON file on upload", passed, f"Status: {response.status_code}")
    except Exception as e:
        print_test("Reject non-JSON file on upload", False, str(e))

    # Test 4.2: Invalid JSON syntax (validation endpoint should detect)
    try:
        files = {'file': ('test.json', b'{invalid json}', 'application/json')}
        response = requests.post(
            f"{API_BASE}/tracks/validate-json",
            files=files,
            timeout=10
        )
        data = response.json()
        passed = not data.get('is_valid') and len(data.get('errors', [])) > 0
        print_test("Detect invalid JSON syntax", passed, f"Valid: {data.get('is_valid')}, Errors: {len(data.get('errors', []))}")
    except Exception as e:
        print_test("Detect invalid JSON syntax", False, str(e))

    # Test 4.3: Missing required fields
    try:
        invalid_json = {
            "title": "Invalid Track",
            "sections": []
        }
        files = {'file': ('test.json', json.dumps(invalid_json).encode(), 'application/json')}
        response = requests.post(
            f"{API_BASE}/tracks/validate-json",
            files=files,
            timeout=10
        )
        data = response.json()
        passed = not data.get('is_valid') and len(data.get('errors', [])) > 0
        print_test("Detect missing required fields", passed, f"Valid: {data.get('is_valid')}, Errors: {len(data.get('errors', []))}")
    except Exception as e:
        print_test("Detect missing required fields", False, str(e))

def test_response_format():
    """Test 5: Response Format"""
    print_header("TEST 5: RESPONSE FORMAT")
    
    file_path = TEST_FILES["listening"]
    if not Path(file_path).exists():
        print_test("Response format validation", False, f"File not found: {file_path}")
        return
    
    try:
        with open(file_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(
                f"{API_BASE}/tracks/validate-json",
                files=files,
                timeout=10
            )
        
        if response.status_code != 200:
            print_test("Response format validation", False, f"Status: {response.status_code}")
            return
        
        data = response.json()
        
        # Check required fields
        required_fields = ["is_valid", "total_questions", "total_sections", "questions_by_type"]
        has_all_fields = all(field in data for field in required_fields)
        print_test("Response has required fields", has_all_fields, f"Fields: {list(data.keys())}")
        
        # Check data types
        is_valid_type = isinstance(data.get("is_valid"), bool)
        print_test("is_valid is boolean", is_valid_type, f"Type: {type(data.get('is_valid'))}")
        
        total_questions_type = isinstance(data.get("total_questions"), int)
        print_test("total_questions is integer", total_questions_type, f"Type: {type(data.get('total_questions'))}")
        
        questions_by_type_type = isinstance(data.get("questions_by_type"), dict)
        print_test("questions_by_type is dict", questions_by_type_type, f"Type: {type(data.get('questions_by_type'))}")
        
    except Exception as e:
        print_test("Response format validation", False, str(e))

def test_performance():
    """Test 6: Performance"""
    print_header("TEST 6: PERFORMANCE")

    file_path = TEST_FILES["listening"]
    if not Path(file_path).exists():
        print_test("Performance test", False, f"File not found: {file_path}")
        return

    try:
        with open(file_path, 'rb') as f:
            files = {'file': f}

            # Measure validation time
            start = time.time()
            response = requests.post(
                f"{API_BASE}/tracks/validate-json",
                files=files,
                timeout=10
            )
            validation_time = time.time() - start

            passed = validation_time < 5  # Should complete in less than 5 seconds
            print_test("Validation completes quickly", passed, f"Time: {validation_time:.2f}s")

        with open(file_path, 'rb') as f:
            files = {'file': f}

            # Measure upload time
            start = time.time()
            response = requests.post(
                f"{API_BASE}/tracks/import-from-json",
                files=files,
                timeout=30  # Increased timeout for Firebase operations
            )
            upload_time = time.time() - start

            passed = upload_time < 15  # Should complete in less than 15 seconds
            print_test("Upload completes quickly", passed, f"Time: {upload_time:.2f}s")

    except Exception as e:
        print_test("Performance test", False, str(e))

def main():
    """Run all tests"""
    print("\n" + "="*70)
    print("  API ENDPOINT TESTS - QUESTION UPLOAD WORKFLOW")
    print("="*70)
    
    # Run all tests
    test_api_health()
    test_validate_json_endpoint()
    test_upload_json_endpoint()
    test_invalid_file()
    test_response_format()
    test_performance()
    
    # Print summary
    print_header("TEST SUMMARY")
    print(f"Total Tests: {results['total']}")
    print(f"Passed: {results['passed']}")
    print(f"Failed: {results['failed']}")
    print(f"Success Rate: {(results['passed']/results['total']*100):.1f}%")
    
    if results['errors']:
        print("\nErrors:")
        for error in results['errors']:
            print(f"  - {error}")
    
    if results['failed'] == 0:
        print("\n[SUCCESS] ALL TESTS PASSED!")
        return 0
    else:
        print(f"\n[FAILED] {results['failed']} TESTS FAILED")
        return 1

if __name__ == "__main__":
    exit(main())

