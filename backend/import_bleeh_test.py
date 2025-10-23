#!/usr/bin/env python3
"""
Import IELTS Listening Bleeh test
SQLite ONLY - No MongoDB or Firebase
"""
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# SQLite database - this is now handled by server.py
# This file is kept for compatibility but does nothing
# All initialization is done in server.py using SQLite

def import_bleeh_test():
    """Placeholder - initialization is now done in server.py with SQLite"""
    print("✓ Bleeh test import handled by SQLite database")
    return True

if __name__ == "__main__":
    import_bleeh_test()

