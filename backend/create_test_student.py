#!/usr/bin/env python
"""Create test student for login testing"""

from database import db

# Add a test student
result = db.add_student(
    name='Test Student',
    email='student@test.com',
    mobile='1234567890',
    institute='Test Institute',
    department='Engineering',
    roll_number='001',
    photo_path='',
    created_by='admin'
)

if result['success']:
    print('✓ Student created successfully!')
    print(f'  User ID: {result["user_id"]}')
    print(f'  Registration Number: {result["registration_number"]}')
    print(f'  Name: {result["name"]}')
    print(f'  Email: {result["email"]}')
    print()
    print('Use these credentials to login:')
    print(f'  User ID: {result["user_id"]}')
    print(f'  Registration Number: {result["registration_number"]}')
else:
    print('✗ Failed to create student:')
    print(f'  Error: {result.get("error", "Unknown error")}')

