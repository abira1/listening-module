#!/usr/bin/env python3
"""Comprehensive verification of IELTS platform"""

import sqlite3
import sys
import os
import json

def check_database_tables():
    """Check all database tables"""
    print("\n" + "=" * 70)
    print("1. DATABASE TABLES VERIFICATION")
    print("=" * 70)
    
    try:
        conn = sqlite3.connect('data/ielts.db')
        cursor = conn.cursor()
        
        # Expected tables
        expected_tables = {
            'students': 'Phase 1',
            'student_sessions': 'Phase 1',
            'admin_logs': 'Phase 1',
            'student_credentials_history': 'Phase 1',
            'tracks': 'Phase 2',
            'sections': 'Phase 2',
            'questions': 'Phase 2',
            'submissions': 'Phase 3',
            'submission_answers': 'Phase 3'
        }
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        existing_tables = {t[0] for t in cursor.fetchall()}
        
        all_good = True
        for table, phase in expected_tables.items():
            if table in existing_tables:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                print(f"✓ {table:30} ({phase:8}) - {count} rows")
            else:
                print(f"✗ {table:30} ({phase:8}) - MISSING")
                all_good = False
        
        conn.close()
        return all_good
        
    except Exception as e:
        print(f"✗ Database check failed: {e}")
        return False

def check_backend_files():
    """Check backend service files"""
    print("\n" + "=" * 70)
    print("2. BACKEND SERVICE FILES")
    print("=" * 70)
    
    backend_files = {
        'Phase 1': ['local_auth_service.py', 'local_auth_routes.py'],
        'Phase 2': ['track_creation_service.py', 'question_type_detector.py', 'track_api.py'],
        'Phase 3': ['submission_service.py', 'submission_routes.py']
    }
    
    all_good = True
    for phase, files in backend_files.items():
        print(f"\n{phase}:")
        for file in files:
            if os.path.exists(file):
                size = os.path.getsize(file)
                print(f"  ✓ {file:40} ({size} bytes)")
            else:
                print(f"  ✗ {file:40} MISSING")
                all_good = False
    
    return all_good

def check_frontend_components():
    """Check frontend components"""
    print("\n" + "=" * 70)
    print("3. FRONTEND COMPONENTS")
    print("=" * 70)
    
    frontend_components = {
        'Phase 1': [
            'frontend/src/components/admin/LocalStudentManagement.jsx',
            'frontend/src/components/admin/AddStudentModal.jsx',
            'frontend/src/components/student/LocalStudentLogin.jsx'
        ],
        'Phase 2': [
            'frontend/src/components/admin/JSONFileUpload.jsx',
            'frontend/src/components/admin/TrackLibrary.jsx'
        ],
        'Phase 3': [
            'frontend/src/components/student/ExamInterface.jsx',
            'frontend/src/components/student/ResultsDisplay.jsx'
        ]
    }
    
    all_good = True
    for phase, components in frontend_components.items():
        print(f"\n{phase}:")
        for comp in components:
            if os.path.exists(comp):
                size = os.path.getsize(comp)
                print(f"  ✓ {comp.split('/')[-1]:40} ({size} bytes)")
            else:
                print(f"  ✗ {comp.split('/')[-1]:40} MISSING")
                all_good = False
    
    return all_good

def check_server_integration():
    """Check if routes are integrated in server.py"""
    print("\n" + "=" * 70)
    print("4. SERVER.PY ROUTE INTEGRATION")
    print("=" * 70)
    
    try:
        with open('server.py', 'r') as f:
            server_content = f.read()
        
        # Check for route imports
        checks = {
            'local_auth_router': 'Phase 1 - Local Auth',
            'submission_routes': 'Phase 3 - Submissions',
            'track_api': 'Phase 2 - Track API',
            'json_upload_router': 'Phase 2 - JSON Upload'
        }
        
        all_good = True
        for check, description in checks.items():
            if check in server_content:
                print(f"✓ {description:40} - IMPORTED")
            else:
                print(f"✗ {description:40} - NOT IMPORTED")
                all_good = False
        
        # Check for router inclusion
        print("\nRouter Inclusion:")
        if 'app.include_router(local_auth_router)' in server_content:
            print("✓ local_auth_router included")
        else:
            print("✗ local_auth_router NOT included")
            all_good = False
        
        return all_good
        
    except Exception as e:
        print(f"✗ Server check failed: {e}")
        return False

def check_test_files():
    """Check test files"""
    print("\n" + "=" * 70)
    print("5. TEST FILES")
    print("=" * 70)
    
    test_files = {
        'Phase 2': ['test_phase2_workflow.py', 'test_phase2_integration.py'],
        'Phase 3': ['test_phase3_workflow.py', 'test_phase3_integration.py']
    }
    
    all_good = True
    for phase, files in test_files.items():
        print(f"\n{phase}:")
        for file in files:
            if os.path.exists(file):
                size = os.path.getsize(file)
                print(f"  ✓ {file:40} ({size} bytes)")
            else:
                print(f"  ✗ {file:40} MISSING")
                all_good = False
    
    return all_good

def main():
    """Run all verification checks"""
    print("\n" + "=" * 70)
    print("COMPREHENSIVE IELTS PLATFORM VERIFICATION")
    print("=" * 70)
    
    results = {
        'Database Tables': check_database_tables(),
        'Backend Files': check_backend_files(),
        'Frontend Components': check_frontend_components(),
        'Server Integration': check_server_integration(),
        'Test Files': check_test_files()
    }
    
    # Summary
    print("\n" + "=" * 70)
    print("VERIFICATION SUMMARY")
    print("=" * 70)
    
    for check, result in results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{check:40} {status}")
    
    all_passed = all(results.values())
    
    print("\n" + "=" * 70)
    if all_passed:
        print("✓ ALL CHECKS PASSED")
    else:
        print("✗ SOME CHECKS FAILED - SEE ABOVE FOR DETAILS")
    print("=" * 70 + "\n")
    
    return 0 if all_passed else 1

if __name__ == '__main__':
    sys.exit(main())

