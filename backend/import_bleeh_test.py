#!/usr/bin/env python3
"""
Import IELTS Listening Bleeh test
"""
import asyncio
import json
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from auto_import_handler import AutoImportHandler

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]


async def import_bleeh_test():
    """Import the IELTS Listening Bleeh test"""
    
    print("=" * 80)
    print("🚀 Starting IELTS Listening Bleeh Test Import")
    print("=" * 80)
    
    # Load JSON file
    json_file = Path(__file__).parent.parent / "import_user_test.json"
    
    print(f"\n📁 Loading JSON from: {json_file}")
    
    with open(json_file, 'r') as f:
        json_data = json.load(f)
    
    print(f"✅ JSON loaded successfully")
    print(f"   - Title: {json_data.get('title')}")
    print(f"   - Type: {json_data.get('test_type')}")
    print(f"   - Sections: {len(json_data.get('sections', []))}")
    print(f"   - Audio URL: {json_data.get('audio_url')[:50]}...")
    
    # Initialize import handler
    handler = AutoImportHandler(db)
    
    print("\n🔍 Starting import process...")
    
    # Import
    results = await handler.import_from_json(json_data)
    
    print("\n" + "=" * 80)
    print("📊 IMPORT RESULTS")
    print("=" * 80)
    
    if results["success"]:
        print("✅ Import SUCCESSFUL!")
        print(f"\n📝 Exam ID: {results['exam_id']}")
        print(f"📂 Sections Created: {results['sections_created']}")
        print(f"❓ Questions Created: {results['questions_created']}")
        
        print("\n📋 Questions by Type:")
        for qtype, count in results["questions_detected"].items():
            print(f"   - {qtype}: {count} questions")
        
        if results["warnings"]:
            print("\n⚠️  Warnings:")
            for warning in results["warnings"]:
                print(f"   - {warning}")
        
        if results["errors"]:
            print("\n❌ Errors:")
            for error in results["errors"]:
                print(f"   - {error}")
    else:
        print("❌ Import FAILED!")
        print("\n❌ Errors:")
        for error in results["errors"]:
            print(f"   - {error}")
    
    print("\n" + "=" * 80)
    print("✨ Import process completed!")
    print("=" * 80)
    
    # Verify exam was created
    if results["success"]:
        exam = await db.exams.find_one({"id": results["exam_id"]})
        if exam:
            print(f"\n✅ Verification: Exam exists in database")
            print(f"   - Title: {exam['title']}")
            print(f"   - Published: {exam.get('published', False)}")
            print(f"   - Question Count: {exam.get('question_count', 0)}")
            print(f"   - Audio URL: {exam.get('audio_url', 'None')[:60]}...")
            
            # Check sections
            sections = await db.sections.find({"exam_id": results["exam_id"]}).to_list(100)
            print(f"\n   - Sections in DB: {len(sections)}")
            
            # Check questions
            questions = await db.questions.find({"exam_id": results["exam_id"]}).to_list(100)
            print(f"   - Questions in DB: {len(questions)}")
            
            # Show question type distribution
            type_dist = {}
            for q in questions:
                qtype = q.get('type', 'unknown')
                type_dist[qtype] = type_dist.get(qtype, 0) + 1
            
            print(f"\n   - Question Types Distribution:")
            for qtype, count in type_dist.items():
                print(f"      • {qtype}: {count}")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(import_bleeh_test())
