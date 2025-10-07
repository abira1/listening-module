#!/usr/bin/env python3
"""
Script to create IELTS Listening Practice Test 1 with all 40 questions
"""
import asyncio
import sys
import os
sys.path.append('/app/backend')

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timezone

# Load environment variables
ROOT_DIR = Path('/app/backend')
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

def generate_id():
    return str(uuid.uuid4())

def get_timestamp():
    return datetime.now(timezone.utc).isoformat()

async def create_ielts_test():
    """Create the IELTS Listening Practice Test 1"""
    
    # Create exam
    exam_id = generate_id()
    now = get_timestamp()
    
    exam_data = {
        "id": exam_id,
        "_id": exam_id,
        "title": "IELTS Listening Practice Test 1",
        "description": "Complete IELTS Listening test with 4 sections and 40 questions. Duration: 31 minutes audio + 2 minutes review time.",
        "audio_url": "https://audio.jukehost.co.uk/F9irt6LcsYuP93ulaMo42JfXBEcABytV",
        "audio_source_method": "url",
        "loop_audio": False,
        "duration_seconds": 2004,  # 31:24 + 2:00 = 33:24
        "published": True,
        "created_at": now,
        "updated_at": now,
        "is_demo": False,
        "question_count": 40,
        "submission_count": 0,
    }
    
    await db.exams.insert_one(exam_data)
    print(f"✓ Created exam: {exam_id}")
    
    # Create 4 sections
    sections = []
    for i in range(1, 5):
        section_id = generate_id()
        section = {
            "id": section_id,
            "_id": section_id,
            "exam_id": exam_id,
            "index": i,
            "title": f"Section {i}",
        }
        sections.append(section)
        await db.sections.insert_one(section)
        print(f"✓ Created Section {i}: {section_id}")
    
    # SECTION 1: Questions 1-10 (Note completion)
    section1_questions = [
        {"index": 1, "type": "short_answer", "payload": {"prompt": "Job is _____ — 4 days a week", "max_words": 2, "answer_key": "part-time"}},
        {"index": 2, "type": "short_answer", "payload": {"prompt": "Working days vary — some evenings and some _____ mornings", "max_words": 2, "answer_key": "weekend"}},
        {"index": 3, "type": "short_answer", "payload": {"prompt": "Location: _____ Road branch; near the cinema", "max_words": 2, "answer_key": "Station"}},
        {"index": 4, "type": "short_answer", "payload": {"prompt": "Basic wages: £_____ per hour", "max_words": 1, "answer_key": "8.50"}},
        {"index": 5, "type": "short_answer", "payload": {"prompt": "_____: 20% on all supermarket items", "max_words": 2, "answer_key": "Staff discount"}},
        {"index": 6, "type": "short_answer", "payload": {"prompt": "Lunch/dinner from _____", "max_words": 2, "answer_key": "staff canteen"}},
        {"index": 7, "type": "short_answer", "payload": {"prompt": "_____ scheme for cyclists", "max_words": 2, "answer_key": "Secure parking"}},
        {"index": 8, "type": "short_answer", "payload": {"prompt": "Interview: Tuesday at _____", "max_words": 2, "answer_key": "3 pm"}},
        {"index": 9, "type": "short_answer", "payload": {"prompt": "Take _____ to interview", "max_words": 2, "answer_key": "ID documents"}},
        {"index": 10, "type": "short_answer", "payload": {"prompt": "Ask for Alex _____", "max_words": 2, "answer_key": "Martin"}},
    ]
    
    for q_data in section1_questions:
        question_id = generate_id()
        question = {
            "id": question_id,
            "_id": question_id,
            "exam_id": exam_id,
            "section_id": sections[0]["id"],
            "index": q_data["index"],
            "type": q_data["type"],
            "payload": q_data["payload"],
            "marks": 1,
            "created_by": "admin",
            "is_demo": False,
        }
        await db.questions.insert_one(question)
    print(f"✓ Created 10 questions for Section 1")
    
    # SECTION 2: Questions 11-20
    # Questions 11-16: Map labeling
    map_questions = [
        {"index": 11, "prompt": "Restaurant", "options": ["A", "B", "C", "D", "E", "F", "G", "H", "I"], "answer_key": "B"},
        {"index": 12, "prompt": "Cinema", "options": ["A", "B", "C", "D", "E", "F", "G", "H", "I"], "answer_key": "A"},
        {"index": 13, "prompt": "Kids Play Area", "options": ["A", "B", "C", "D", "E", "F", "G", "H", "I"], "answer_key": "D"},
        {"index": 14, "prompt": "Shop Zone", "options": ["A", "B", "C", "D", "E", "F", "G", "H", "I"], "answer_key": "G"},
        {"index": 15, "prompt": "Sun Lounge", "options": ["A", "B", "C", "D", "E", "F", "G", "H", "I"], "answer_key": "C"},
        {"index": 16, "prompt": "Observation Platform", "options": ["A", "B", "C", "D", "E", "F", "G", "H", "I"], "answer_key": "F"},
    ]
    
    for q_data in map_questions:
        question_id = generate_id()
        question = {
            "id": question_id,
            "_id": question_id,
            "exam_id": exam_id,
            "section_id": sections[1]["id"],
            "index": q_data["index"],
            "type": "map_labeling",
            "payload": {
                "prompt": q_data["prompt"],
                "options": q_data["options"],
                "answer_key": q_data["answer_key"],
                "image_url": "https://customer-assets.emergentagent.com/job_question-upload/artifacts/2cy0uwnc_Question%2011-16.png"
            },
            "marks": 1,
            "created_by": "admin",
            "is_demo": False,
        }
        await db.questions.insert_one(question)
    
    # Questions 17-20: Multiple choice
    mcq_questions = [
        {"index": 17, "prompt": "What time will the ferry arrive?", "options": ["10am", "9pm", "12am"], "answer_key": "B"},
        {"index": 18, "prompt": "What is available from the Main Entrance for a reduced price?", "options": ["train tickets", "bus tickets", "cabins"], "answer_key": "B"},
        {"index": 19, "prompt": "What can passengers get for no extra cost?", "options": ["a cabin upgrade", "a tour", "a map"], "answer_key": "C"},
        {"index": 20, "prompt": "What is available in the cabins?", "options": ["wireless internet", "computers", "a working space"], "answer_key": "A"},
    ]
    
    for q_data in mcq_questions:
        question_id = generate_id()
        question = {
            "id": question_id,
            "_id": question_id,
            "exam_id": exam_id,
            "section_id": sections[1]["id"],
            "index": q_data["index"],
            "type": "multiple_choice",
            "payload": {
                "prompt": q_data["prompt"],
                "options": q_data["options"],
                "answer_key": q_data["answer_key"]
            },
            "marks": 1,
            "created_by": "admin",
            "is_demo": False,
        }
        await db.questions.insert_one(question)
    print(f"✓ Created 10 questions for Section 2")
    
    # SECTION 3: Questions 21-30
    # Questions 21-25: Multiple choice
    section3_mcq = [
        {"index": 21, "prompt": "What do the speakers agree helped them most in their preparation?", "options": ["their professor's lectures", "a documentary on the internet", "interviewing an expert"], "answer_key": "B"},
        {"index": 22, "prompt": "One of the speakers struggled with", "options": ["finding relevant sources.", "summarising their research.", "identifying a theme."], "answer_key": "C"},
        {"index": 23, "prompt": "What do the speakers think about Cosmos Dollars?", "options": ["Its style is distracting.", "Its case studies are overly specific.", "Its content lacks depth."], "answer_key": "C"},
        {"index": 24, "prompt": "What do the speakers decide to omit from their presentation?", "options": ["projected slides", "handouts", "film clips"], "answer_key": "B"},
        {"index": 25, "prompt": "The speakers agree the most important thing is to make their", "options": ["presentation accessible.", "broad.", "memorable."], "answer_key": "A"},
    ]
    
    for q_data in section3_mcq:
        question_id = generate_id()
        question = {
            "id": question_id,
            "_id": question_id,
            "exam_id": exam_id,
            "section_id": sections[2]["id"],
            "index": q_data["index"],
            "type": "multiple_choice",
            "payload": {
                "prompt": q_data["prompt"],
                "options": q_data["options"],
                "answer_key": q_data["answer_key"]
            },
            "marks": 1,
            "created_by": "admin",
            "is_demo": False,
        }
        await db.questions.insert_one(question)
    
    # Questions 26-28: Note completion (one word)
    section3_notes = [
        {"index": 26, "prompt": "Private companies acted as _____ for governmental space agencies", "max_words": 1, "answer_key": "contractors"},
        {"index": 27, "prompt": "Privately owned _____ satellites allowed from 1962", "max_words": 1, "answer_key": "communication"},
        {"index": 28, "prompt": "Arianespace: first company to conduct private _____", "max_words": 1, "answer_key": "launches"},
    ]
    
    for q_data in section3_notes:
        question_id = generate_id()
        question = {
            "id": question_id,
            "_id": question_id,
            "exam_id": exam_id,
            "section_id": sections[2]["id"],
            "index": q_data["index"],
            "type": "short_answer",
            "payload": q_data,
            "marks": 1,
            "created_by": "admin",
            "is_demo": False,
        }
        await db.questions.insert_one(question)
    
    # Questions 29-30: Multiple choice with 4 options
    section3_mcq4 = [
        {"index": 29, "prompt": "Which of the entrepreneurs plan to operate a space tourism business?", 
         "options": ["Elon Musk & Jeff Bezos", "Jeff Bezos & Richard Branson", "Richard Branson & Elon Musk", "All three"], 
         "answer_key": "B"},
        {"index": 30, "prompt": "Which of the entrepreneurs competed for the same government contract?", 
         "options": ["Elon Musk & Jeff Bezos", "Jeff Bezos & Richard Branson", "Richard Branson & Elon Musk", "All three"], 
         "answer_key": "A"},
    ]
    
    for q_data in section3_mcq4:
        question_id = generate_id()
        question = {
            "id": question_id,
            "_id": question_id,
            "exam_id": exam_id,
            "section_id": sections[2]["id"],
            "index": q_data["index"],
            "type": "multiple_choice",
            "payload": q_data,
            "marks": 1,
            "created_by": "admin",
            "is_demo": False,
        }
        await db.questions.insert_one(question)
    print(f"✓ Created 10 questions for Section 3")
    
    # SECTION 4: Questions 31-40
    # Questions 31-35: Diagram labeling
    diagram_questions = [
        {"index": 31, "prompt": "_____ rods: uranium/plutonium isotope", "max_words": 1, "answer_key": "Fuel"},
        {"index": 32, "prompt": "control rods affect _____ of fission reaction", "max_words": 1, "answer_key": "speed"},
        {"index": 33, "prompt": "moderator made of _____", "max_words": 1, "answer_key": "graphite"},
        {"index": 34, "prompt": "coolant out — powers _____ to produce energy", "max_words": 1, "answer_key": "turbine"},
        {"index": 35, "prompt": "_____ shield", "max_words": 1, "answer_key": "concrete"},
    ]
    
    for q_data in diagram_questions:
        question_id = generate_id()
        question = {
            "id": question_id,
            "_id": question_id,
            "exam_id": exam_id,
            "section_id": sections[3]["id"],
            "index": q_data["index"],
            "type": "diagram_labeling",
            "payload": {
                "prompt": q_data["prompt"],
                "max_words": q_data["max_words"],
                "answer_key": q_data["answer_key"],
                "image_url": "https://customer-assets.emergentagent.com/job_question-upload/artifacts/trai7zjk_Questions%2031%20to%2035.png"
            },
            "marks": 1,
            "created_by": "admin",
            "is_demo": False,
        }
        await db.questions.insert_one(question)
    
    # Questions 36-40: Note completion
    section4_notes = [
        {"index": 36, "prompt": "poor _____ with the public", "max_words": 1, "answer_key": "relations"},
        {"index": 37, "prompt": "accidents e.g. Chernobyl: unsafe for _____ years", "max_words": 1, "answer_key": "20000"},
        {"index": 38, "prompt": "nuclear waste — safe _____ procedures yet to be developed", "max_words": 1, "answer_key": "disposal"},
        {"index": 39, "prompt": "Provides green energy; doesn't create _____", "max_words": 1, "answer_key": "pollution"},
        {"index": 40, "prompt": "technological _____ benefit other industries", "max_words": 1, "answer_key": "advances"},
    ]
    
    for q_data in section4_notes:
        question_id = generate_id()
        question = {
            "id": question_id,
            "_id": question_id,
            "exam_id": exam_id,
            "section_id": sections[3]["id"],
            "index": q_data["index"],
            "type": "short_answer",
            "payload": q_data,
            "marks": 1,
            "created_by": "admin",
            "is_demo": False,
        }
        await db.questions.insert_one(question)
    print(f"✓ Created 10 questions for Section 4")
    
    print(f"\n✅ IELTS Listening Practice Test 1 created successfully!")
    print(f"Exam ID: {exam_id}")
    print(f"Total Questions: 40")
    print(f"Test Duration: 33:24 (31:24 audio + 2:00 review)")
    print(f"Audio URL: {exam_data['audio_url']}")
    print(f"\nAccess the test at: http://localhost:3000/exam/{exam_id}")

if __name__ == "__main__":
    asyncio.run(create_ielts_test())
