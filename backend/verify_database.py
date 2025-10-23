#!/usr/bin/env python3
"""Verify database structure and tables"""

import sqlite3
import sys

def verify_database():
    """Check all tables in the database"""
    try:
        conn = sqlite3.connect('data/ielts.db')
        cursor = conn.cursor()
        
        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        tables = cursor.fetchall()
        
        print("=" * 60)
        print("DATABASE VERIFICATION REPORT")
        print("=" * 60)
        print(f"\nTotal Tables: {len(tables)}\n")
        
        for table in tables:
            table_name = table[0]
            print(f"✓ {table_name}")
            
            # Get column info
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = cursor.fetchall()
            print(f"  Columns: {len(columns)}")
            
            # Get row count
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            row_count = cursor.fetchone()[0]
            print(f"  Rows: {row_count}\n")
        
        # Check for Phase 3 tables
        print("\n" + "=" * 60)
        print("PHASE 3 TABLES CHECK")
        print("=" * 60)
        
        phase3_tables = ['submissions', 'submission_answers']
        for table in phase3_tables:
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
            exists = cursor.fetchone() is not None
            status = "✓ EXISTS" if exists else "✗ MISSING"
            print(f"{table}: {status}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == '__main__':
    success = verify_database()
    sys.exit(0 if success else 1)

