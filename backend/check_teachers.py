"""Check teachers in database"""
from database import db

teachers = db.get_all_teachers(limit=10)
print(f"Total teachers: {len(teachers)}")
print("\nTeachers in database:")
for t in teachers:
    print(f"  - ID: {t.get('teacher_id')}")
    print(f"    Name: {t.get('full_name')}")
    print(f"    Email: {t.get('email')}")
    print(f"    Status: {t.get('status')}")
    print()

