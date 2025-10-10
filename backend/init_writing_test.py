#!/usr/bin/env python3
"""
Initialize IELTS Writing Practice Test 1 on application startup
This ensures the writing test is always available in the database
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timezone

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Fixed exam ID for IELTS Writing Practice Test 1
WRITING_EXAM_ID = "ielts-writing-practice-test-1"

def generate_id():
    return str(uuid.uuid4())

def get_timestamp():
    return datetime.now(timezone.utc).isoformat()

async def init_writing_test():
    """Initialize IELTS Writing Practice Test 1 if it doesn't exist"""
    
    # Check if exam already exists
    existing_exam = await db.exams.find_one({"id": WRITING_EXAM_ID})
    
    if existing_exam:
        print(f"✓ IELTS Writing Practice Test 1 already exists (ID: {WRITING_EXAM_ID})")
        return
    
    print("Creating IELTS Writing Practice Test 1...")
    
    now = get_timestamp()
    
    # Create exam
    exam_data = {
        "id": WRITING_EXAM_ID,
        "_id": WRITING_EXAM_ID,
        "title": "IELTS Writing Practice Test 1",
        "description": "Complete IELTS Academic Writing test with 2 tasks. Task 1: Chart description (150 words minimum). Task 2: Essay writing (250 words minimum). Duration: 60 minutes.",
        "exam_type": "writing",  # NEW exam type
        "audio_url": None,  # No audio for writing test
        "audio_source_method": None,
        "loop_audio": False,
        "duration_seconds": 3600,  # 60 minutes
        "published": True,
        "created_at": now,
        "updated_at": now,
        "is_demo": False,
        "question_count": 2,  # 2 tasks
        "submission_count": 0,
        "is_active": False,
        "started_at": None,
        "stopped_at": None,
    }
    
    await db.exams.insert_one(exam_data)
    
    # Create 2 sections (one for each writing task)
    
    # TASK 1: Chart Description (150 words minimum)
    section1_id = f"{WRITING_EXAM_ID}-section-1"
    section1 = {
        "id": section1_id,
        "_id": section1_id,
        "exam_id": WRITING_EXAM_ID,
        "index": 1,
        "title": "Writing Task 1",
    }
    await db.sections.insert_one(section1)
    
    # Task 1 Question
    task1_question_id = f"{WRITING_EXAM_ID}-q1"
    task1_question = {
        "id": task1_question_id,
        "_id": task1_question_id,
        "exam_id": WRITING_EXAM_ID,
        "section_id": section1_id,
        "index": 1,
        "type": "writing_task",
        "payload": {
            "instructions": "You should spend about 20 minutes on this task.",
            "prompt": "The chart below shows the milk export figures from three European countries between 2008 and 2012.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
            "chart_image": "https://customer-assets.emergentagent.com/job_1523a646-29c2-4c15-9f56-ccbce541d758/artifacts/p5s6bsxw_writing%20task1.png",
            "min_words": 150,
            "task_number": 1,
            "answer_key": None  # Writing tasks don't have answer keys - manual grading only
        },
        "marks": 1,  # Placeholder - actual scoring done manually by admin
        "created_by": "system",
        "is_demo": False,
    }
    await db.questions.insert_one(task1_question)
    
    # TASK 2: Essay Writing (250 words minimum)
    section2_id = f"{WRITING_EXAM_ID}-section-2"
    section2 = {
        "id": section2_id,
        "_id": section2_id,
        "exam_id": WRITING_EXAM_ID,
        "index": 2,
        "title": "Writing Task 2",
    }
    await db.sections.insert_one(section2)
    
    # Task 2 Question
    task2_question_id = f"{WRITING_EXAM_ID}-q2"
    task2_question = {
        "id": task2_question_id,
        "_id": task2_question_id,
        "exam_id": WRITING_EXAM_ID,
        "section_id": section2_id,
        "index": 2,
        "type": "writing_task",
        "payload": {
            "instructions": "You should spend about 40 minutes on this task.",
            "prompt": "Write about the following topic:\n\nExposure to international media such as films, TV and magazines has significant impact on local culture.\n\nWhat do you think has been the impact?\nDo you think its advantages outweigh the disadvantages?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.",
            "chart_image": None,  # No chart for Task 2
            "min_words": 250,
            "task_number": 2,
            "answer_key": None  # Writing tasks don't have answer keys - manual grading only
        },
        "marks": 1,  # Placeholder - actual scoring done manually by admin
        "created_by": "system",
        "is_demo": False,
    }
    await db.questions.insert_one(task2_question)
    
    print(f"✓ IELTS Writing Practice Test 1 created successfully!")
    print(f"  - Exam ID: {WRITING_EXAM_ID}")
    print(f"  - Duration: 60 minutes")
    print(f"  - Tasks: 2 (Task 1: 150 words, Task 2: 250 words)")
    print(f"  - Status: Published and ready for students")

async def main():
    """Main initialization function"""
    try:
        await init_writing_test()
    except Exception as e:
        print(f"Error initializing writing test: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())
