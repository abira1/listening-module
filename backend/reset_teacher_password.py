"""Reset teacher password for testing"""
from database import db
from teacher_auth_service import teacher_auth_service

# Reset password for TCH-QGMQF3
teacher_id = 'TCH-QGMQF3'
new_password = 'TestPassword123!'

# Hash the password
password_hash = teacher_auth_service.hash_password(new_password)

# Update in database
result = db.update_teacher_password(teacher_id, password_hash)

if result['success']:
    print(f"✓ Password reset successfully for {teacher_id}")
    print(f"  New password: {new_password}")
else:
    print(f"✗ Failed to reset password: {result.get('error')}")

