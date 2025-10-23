"""
Migration script to add HTML question support to the database
Adds columns: html_content, answer_extraction, grading_rules
"""

import sqlite3
import json
from datetime import datetime

def migrate_database():
    """Add HTML question columns to questions table"""
    
    db_path = 'data/ielts.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("Starting database migration for HTML questions...")
        
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(questions)")
        columns = [col[1] for col in cursor.fetchall()]
        
        # Add html_content column if it doesn't exist
        if 'html_content' not in columns:
            print("Adding html_content column...")
            cursor.execute('''
                ALTER TABLE questions ADD COLUMN html_content TEXT
            ''')
            print("✅ html_content column added")
        else:
            print("⚠️ html_content column already exists")
        
        # Add answer_extraction column if it doesn't exist
        if 'answer_extraction' not in columns:
            print("Adding answer_extraction column...")
            cursor.execute('''
                ALTER TABLE questions ADD COLUMN answer_extraction TEXT
            ''')
            print("✅ answer_extraction column added")
        else:
            print("⚠️ answer_extraction column already exists")
        
        # Add grading_rules column if it doesn't exist
        if 'grading_rules' not in columns:
            print("Adding grading_rules column...")
            cursor.execute('''
                ALTER TABLE questions ADD COLUMN grading_rules TEXT
            ''')
            print("✅ grading_rules column added")
        else:
            print("⚠️ grading_rules column already exists")
        
        # Add question_type column if it doesn't exist (for categorization)
        if 'question_type' not in columns:
            print("Adding question_type column...")
            cursor.execute('''
                ALTER TABLE questions ADD COLUMN question_type VARCHAR(50) DEFAULT 'standard'
            ''')
            print("✅ question_type column added")
        else:
            print("⚠️ question_type column already exists")
        
        conn.commit()
        print("\n✅ Migration completed successfully!")
        
        # Show table structure
        print("\nUpdated questions table structure:")
        cursor.execute("PRAGMA table_info(questions)")
        for col in cursor.fetchall():
            print(f"  - {col[1]} ({col[2]})")
        
        return True
        
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print(f"⚠️ Column already exists: {e}")
            conn.commit()
            return True
        else:
            print(f"❌ Error during migration: {e}")
            conn.rollback()
            return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

if __name__ == '__main__':
    success = migrate_database()
    exit(0 if success else 1)

