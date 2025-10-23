"""
Integration tests for Teacher Authentication System
Tests the complete workflow: admin creates teacher, teacher logs in, updates profile, changes password
"""

import pytest
import json
from datetime import datetime
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import Database
from teacher_auth_service import TeacherAuthService
from teacher_auth_routes import router as teacher_router
from admin_teacher_routes import router as admin_router


class TestTeacherAuthIntegration:
    """Integration tests for teacher authentication system"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test database and services"""
        self.db = Database()
        self.auth_service = TeacherAuthService()
        self.admin_email = 'admin'
        
        # Clean up any existing test teachers
        try:
            self.db.delete_teacher('TCH-TEST01')
        except:
            pass
        
        yield
        
        # Cleanup after tests
        try:
            self.db.delete_teacher('TCH-TEST01')
        except:
            pass

    def test_01_generate_teacher_credentials(self):
        """Test 1: Generate unique teacher ID and password"""
        teacher_id = self.auth_service.generate_teacher_id()
        password = self.auth_service.generate_password()
        
        # Verify format
        assert teacher_id.startswith('TCH-'), "Teacher ID should start with TCH-"
        assert len(teacher_id) == 10, "Teacher ID should be 10 characters (TCH-XXXXXX)"
        assert len(password) == 8, "Password should be 8 characters"
        assert any(c.isdigit() for c in password), "Password should contain digits"
        
        print(f"✓ Generated Teacher ID: {teacher_id}")
        print(f"✓ Generated Password: {password}")

    def test_02_hash_and_verify_password(self):
        """Test 2: Hash password and verify it"""
        password = "TestPass123!"
        hashed = self.auth_service.hash_password(password)
        
        # Verify hash is different from original
        assert hashed != password, "Hash should be different from original"
        
        # Verify password matches hash
        is_valid = self.auth_service.verify_password(password, hashed)
        assert is_valid, "Password should verify against hash"
        
        # Verify wrong password doesn't match
        is_invalid = self.auth_service.verify_password("WrongPassword", hashed)
        assert not is_invalid, "Wrong password should not verify"
        
        print("✓ Password hashing and verification working correctly")

    def test_03_create_teacher_account(self):
        """Test 3: Admin creates a teacher account"""
        teacher_id = self.auth_service.generate_teacher_id()
        password = self.auth_service.generate_password()
        password_hash = self.auth_service.hash_password(password)
        
        # Create teacher
        teacher_data = {
            'teacher_id': teacher_id,
            'full_name': 'John Smith',
            'email': 'john.smith@test.com',
            'phone_number': '+1234567890',
            'subject': 'English',
            'bio': 'Experienced IELTS instructor',
            'password_hash': password_hash,
            'created_by': self.admin_email,
        }
        
        result = self.db.add_teacher(**teacher_data)
        assert result, "Teacher should be created successfully"
        
        # Verify teacher exists
        teacher = self.db.get_teacher(teacher_id)
        assert teacher is not None, "Teacher should exist in database"
        assert teacher['full_name'] == 'John Smith'
        assert teacher['email'] == 'john.smith@test.com'
        assert teacher['status'] == 'active'
        
        print(f"✓ Teacher account created: {teacher_id}")
        print(f"  Name: {teacher['full_name']}")
        print(f"  Email: {teacher['email']}")

    def test_04_teacher_login(self):
        """Test 4: Teacher logs in with credentials"""
        # First create a teacher
        teacher_id = self.auth_service.generate_teacher_id()
        password = "TestPass123"
        password_hash = self.auth_service.hash_password(password)
        
        teacher_data = {
            'teacher_id': teacher_id,
            'full_name': 'Jane Doe',
            'email': 'jane.doe@test.com',
            'password_hash': password_hash,
            'created_by': self.admin_email,
        }
        
        self.db.add_teacher(**teacher_data)
        
        # Now test login
        is_valid, teacher, message = self.auth_service.validate_teacher_credentials(
            teacher_id, password
        )
        
        assert is_valid, f"Login should succeed: {message}"
        assert teacher['teacher_id'] == teacher_id
        assert teacher['full_name'] == 'Jane Doe'
        
        print(f"✓ Teacher login successful: {teacher_id}")

    def test_05_teacher_login_invalid_password(self):
        """Test 5: Teacher login fails with wrong password"""
        # Create a teacher
        teacher_id = self.auth_service.generate_teacher_id()
        password = "CorrectPass123"
        password_hash = self.auth_service.hash_password(password)
        
        teacher_data = {
            'teacher_id': teacher_id,
            'full_name': 'Bob Wilson',
            'email': 'bob.wilson@test.com',
            'password_hash': password_hash,
            'created_by': self.admin_email,
        }
        
        self.db.add_teacher(**teacher_data)
        
        # Try login with wrong password
        is_valid, teacher, message = self.auth_service.validate_teacher_credentials(
            teacher_id, "WrongPassword"
        )
        
        assert not is_valid, "Login should fail with wrong password"
        assert "Invalid" in message or "not found" in message
        
        print(f"✓ Login correctly rejected with wrong password")

    def test_06_create_teacher_session(self):
        """Test 6: Create and validate teacher session"""
        # Create a teacher
        teacher_id = self.auth_service.generate_teacher_id()
        password = "SessionTest123"
        password_hash = self.auth_service.hash_password(password)
        
        teacher_data = {
            'teacher_id': teacher_id,
            'full_name': 'Alice Johnson',
            'email': 'alice.johnson@test.com',
            'password_hash': password_hash,
            'created_by': self.admin_email,
        }
        
        self.db.add_teacher(**teacher_data)
        
        # Create session
        session_result = self.auth_service.create_teacher_session(
            teacher_id=teacher_id,
            ip_address='127.0.0.1',
            device_info='Test Device'
        )
        
        assert session_result['success'], "Session should be created"
        session_token = session_result['session_token']
        
        # Validate session
        is_valid, session_data, message = self.auth_service.validate_session_token(session_token)
        assert is_valid, f"Session should be valid: {message}"
        assert session_data['teacher_id'] == teacher_id
        
        print(f"✓ Teacher session created and validated")
        print(f"  Token: {session_token[:20]}...")

    def test_07_update_teacher_password(self):
        """Test 7: Teacher updates password"""
        # Create a teacher
        teacher_id = self.auth_service.generate_teacher_id()
        old_password = "OldPassword123"
        old_hash = self.auth_service.hash_password(old_password)
        
        teacher_data = {
            'teacher_id': teacher_id,
            'full_name': 'Charlie Brown',
            'email': 'charlie.brown@test.com',
            'password_hash': old_hash,
            'created_by': self.admin_email,
        }
        
        self.db.add_teacher(**teacher_data)
        
        # Update password
        new_password = "NewPassword456"
        new_hash = self.auth_service.hash_password(new_password)
        self.db.update_teacher_password(teacher_id, new_hash)
        
        # Verify old password doesn't work
        is_valid, _, _ = self.auth_service.validate_teacher_credentials(
            teacher_id, old_password
        )
        assert not is_valid, "Old password should not work"
        
        # Verify new password works
        is_valid, _, _ = self.auth_service.validate_teacher_credentials(
            teacher_id, new_password
        )
        assert is_valid, "New password should work"
        
        print(f"✓ Teacher password updated successfully")

    def test_08_reset_teacher_password(self):
        """Test 8: Admin resets teacher password"""
        # Create a teacher
        teacher_id = self.auth_service.generate_teacher_id()
        old_password = "OldPass789"
        old_hash = self.auth_service.hash_password(old_password)
        
        teacher_data = {
            'teacher_id': teacher_id,
            'full_name': 'Diana Prince',
            'email': 'diana.prince@test.com',
            'password_hash': old_hash,
            'created_by': self.admin_email,
        }
        
        self.db.add_teacher(**teacher_data)
        
        # Admin resets password
        new_password = self.auth_service.generate_password()
        new_hash = self.auth_service.hash_password(new_password)
        self.db.update_teacher_password(teacher_id, new_hash)
        
        # Verify new password works
        is_valid, _, _ = self.auth_service.validate_teacher_credentials(
            teacher_id, new_password
        )
        assert is_valid, "Reset password should work"
        
        print(f"✓ Teacher password reset by admin")
        print(f"  New password: {new_password}")

    def test_09_list_all_teachers(self):
        """Test 9: Admin lists all teachers"""
        # Create multiple teachers
        teacher_ids = []
        for i in range(3):
            teacher_id = self.auth_service.generate_teacher_id()
            password_hash = self.auth_service.hash_password("TestPass123")
            
            teacher_data = {
                'teacher_id': teacher_id,
                'full_name': f'Teacher {i+1}',
                'email': f'teacher{i+1}@test.com',
                'password_hash': password_hash,
                'created_by': self.admin_email,
            }
            
            self.db.add_teacher(**teacher_data)
            teacher_ids.append(teacher_id)
        
        # List all teachers
        teachers = self.db.get_all_teachers(limit=100, offset=0)
        assert len(teachers) >= 3, "Should have at least 3 teachers"
        
        print(f"✓ Listed {len(teachers)} teachers")

    def test_10_complete_workflow(self):
        """Test 10: Complete workflow - create, login, update, change password"""
        print("\n=== COMPLETE TEACHER WORKFLOW TEST ===\n")
        
        # Step 1: Admin creates teacher
        print("Step 1: Admin creates teacher account...")
        teacher_id = self.auth_service.generate_teacher_id()
        initial_password = self.auth_service.generate_password()
        password_hash = self.auth_service.hash_password(initial_password)
        
        teacher_data = {
            'teacher_id': teacher_id,
            'full_name': 'Complete Test Teacher',
            'email': 'complete.test@test.com',
            'phone_number': '+1234567890',
            'subject': 'English',
            'bio': 'Test teacher for workflow',
            'password_hash': password_hash,
            'created_by': self.admin_email,
        }
        
        self.db.add_teacher(**teacher_data)
        print(f"✓ Teacher created: {teacher_id}")
        print(f"  Initial password: {initial_password}")
        
        # Step 2: Teacher logs in
        print("\nStep 2: Teacher logs in...")
        is_valid, teacher, message = self.auth_service.validate_teacher_credentials(
            teacher_id, initial_password
        )
        assert is_valid, f"Login failed: {message}"
        print(f"✓ Login successful")
        
        # Step 3: Create session
        print("\nStep 3: Create session...")
        session_result = self.auth_service.create_teacher_session(
            teacher_id=teacher_id,
            ip_address='127.0.0.1',
            device_info='Test Device'
        )
        assert session_result['success']
        session_token = session_result['session_token']
        print(f"✓ Session created")
        
        # Step 4: Validate session
        print("\nStep 4: Validate session...")
        is_valid, session_data, message = self.auth_service.validate_session_token(session_token)
        assert is_valid
        print(f"✓ Session valid")
        
        # Step 5: Change password
        print("\nStep 5: Teacher changes password...")
        new_password = "NewPassword999"
        new_hash = self.auth_service.hash_password(new_password)
        self.db.update_teacher_password(teacher_id, new_hash)
        print(f"✓ Password changed to: {new_password}")
        
        # Step 6: Verify new password works
        print("\nStep 6: Verify new password...")
        is_valid, _, _ = self.auth_service.validate_teacher_credentials(
            teacher_id, new_password
        )
        assert is_valid
        print(f"✓ New password works")
        
        print("\n=== WORKFLOW TEST COMPLETE ===\n")


if __name__ == '__main__':
    pytest.main([__file__, '-v', '-s'])

