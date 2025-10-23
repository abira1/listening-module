"""
Test RBAC implementation
"""

import requests
import json

BASE_URL = "http://localhost:8000"
ADMIN_EMAIL = "shahsultanweb@gmail.com"

def test_get_roles():
    """Test getting all roles"""
    print("\n=== Testing GET /api/rbac/roles ===")
    response = requests.get(
        f"{BASE_URL}/api/rbac/roles",
        headers={"X-Admin-Email": ADMIN_EMAIL}
    )
    print(f"Status: {response.status_code}")
    if response.ok:
        roles = response.json()
        print(f"Roles found: {len(roles)}")
        for role in roles:
            print(f"  - {role['role_name']}: {role['description']}")
            print(f"    Permissions: {role['permissions']}")
    else:
        print(f"Error: {response.text}")

def test_get_specific_role():
    """Test getting a specific role"""
    print("\n=== Testing GET /api/rbac/roles/admin ===")
    response = requests.get(
        f"{BASE_URL}/api/rbac/roles/admin",
        headers={"X-Admin-Email": ADMIN_EMAIL}
    )
    print(f"Status: {response.status_code}")
    if response.ok:
        role = response.json()
        print(f"Role: {role['role_name']}")
        print(f"Description: {role['description']}")
        print(f"Permissions: {role['permissions']}")
    else:
        print(f"Error: {response.text}")

def test_check_permission():
    """Test checking permission"""
    print("\n=== Testing POST /api/rbac/check-permission ===")
    
    # First, create a test student
    print("Creating test student...")
    student_data = {
        "name": "Test Student",
        "email": "test@example.com",
        "mobile_number": "1234567890",
        "institute": "Test Institute",
        "department": "Test Department"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/auth/add-student",
        json=student_data,
        headers={"X-Admin-Email": ADMIN_EMAIL}
    )
    
    if response.ok:
        student = response.json()
        user_id = student['user_id']
        print(f"Student created: {user_id}")
        
        # Check permission
        response = requests.post(
            f"{BASE_URL}/api/rbac/check-permission",
            json={"user_id": user_id, "permission": "take_exams"},
            headers={"X-Admin-Email": ADMIN_EMAIL}
        )
        
        print(f"Status: {response.status_code}")
        if response.ok:
            result = response.json()
            print(f"User: {result['user_id']}")
            print(f"Permission: {result['permission']}")
            print(f"Has Permission: {result['has_permission']}")
        else:
            print(f"Error: {response.text}")
    else:
        print(f"Error creating student: {response.text}")

def test_get_user_permissions():
    """Test getting user permissions"""
    print("\n=== Testing GET /api/rbac/users/{user_id}/permissions ===")
    
    # Get first student
    response = requests.get(
        f"{BASE_URL}/api/auth/students",
        headers={"X-Admin-Email": ADMIN_EMAIL}
    )
    
    if response.ok:
        students = response.json()
        if students:
            user_id = students[0]['user_id']
            print(f"Testing with user: {user_id}")
            
            response = requests.get(
                f"{BASE_URL}/api/rbac/users/{user_id}/permissions",
                headers={"X-Admin-Email": ADMIN_EMAIL}
            )
            
            print(f"Status: {response.status_code}")
            if response.ok:
                result = response.json()
                print(f"User: {result['user_id']}")
                print(f"Role: {result['role']}")
                print(f"Permissions: {result['permissions']}")
            else:
                print(f"Error: {response.text}")
        else:
            print("No students found")
    else:
        print(f"Error: {response.text}")

def test_update_user_role():
    """Test updating user role"""
    print("\n=== Testing POST /api/rbac/users/{user_id}/role ===")
    
    # Get first student
    response = requests.get(
        f"{BASE_URL}/api/auth/students",
        headers={"X-Admin-Email": ADMIN_EMAIL}
    )
    
    if response.ok:
        students = response.json()
        if students:
            user_id = students[0]['user_id']
            print(f"Testing with user: {user_id}")
            
            # Update role to teacher
            response = requests.post(
                f"{BASE_URL}/api/rbac/users/{user_id}/role",
                json={"user_id": user_id, "new_role": "teacher"},
                headers={"X-Admin-Email": ADMIN_EMAIL}
            )
            
            print(f"Status: {response.status_code}")
            if response.ok:
                result = response.json()
                print(f"Success: {result['success']}")
                print(f"New Role: {result['new_role']}")
                print(f"Message: {result['message']}")
            else:
                print(f"Error: {response.text}")
        else:
            print("No students found")
    else:
        print(f"Error: {response.text}")

def test_get_audit_logs():
    """Test getting audit logs"""
    print("\n=== Testing GET /api/rbac/audit-logs ===")
    response = requests.get(
        f"{BASE_URL}/api/rbac/audit-logs?limit=10&offset=0",
        headers={"X-Admin-Email": ADMIN_EMAIL}
    )
    print(f"Status: {response.status_code}")
    if response.ok:
        result = response.json()
        print(f"Total logs: {result['total']}")
        print(f"Logs returned: {len(result['logs'])}")
        if result['logs']:
            print("Recent logs:")
            for log in result['logs'][:3]:
                print(f"  - {log['action']} by {log['user_id']} at {log['timestamp']}")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    print("Testing RBAC Implementation")
    print("=" * 50)
    
    try:
        test_get_roles()
        test_get_specific_role()
        test_check_permission()
        test_get_user_permissions()
        test_update_user_role()
        test_get_audit_logs()
        
        print("\n" + "=" * 50)
        print("All tests completed!")
    except Exception as e:
        print(f"Error: {e}")

