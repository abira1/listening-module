from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import shutil


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="IELTS Listening Test Platform API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Exam Models
class ExamCreate(BaseModel):
    title: str
    description: str
    duration_seconds: int = 1800
    is_demo: bool = False

class ExamUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    duration_seconds: Optional[int] = None
    audio_url: Optional[str] = None
    audio_source_method: Optional[str] = None
    loop_audio: Optional[bool] = None
    published: Optional[bool] = None

class Exam(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    title: str
    description: str
    audio_url: Optional[str] = None
    audio_source_method: Optional[str] = None
    loop_audio: bool = False
    duration_seconds: int = 1800
    published: bool = False
    created_at: str
    updated_at: str
    is_demo: bool = False
    question_count: int = 0
    submission_count: int = 0

# Section Models
class Section(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    exam_id: str
    index: int
    title: str

# Question Models
class QuestionCreate(BaseModel):
    exam_id: str
    section_id: str
    type: str = "single_answer"
    payload: Dict[str, Any] = {}
    marks: int = 1
    created_by: str = "admin"
    is_demo: bool = False

class Question(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    exam_id: str
    section_id: str
    index: int
    type: str
    payload: Dict[str, Any]
    marks: int
    created_by: str
    is_demo: bool

# Submission Models
class SubmissionCreate(BaseModel):
    exam_id: str
    user_id_or_session: Optional[str] = None
    answers: Dict[str, Any] = {}
    started_at: Optional[str] = None
    finished_at: Optional[str] = None
    progress_percent: int = 100

class Submission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    exam_id: str
    user_id_or_session: str
    started_at: str
    finished_at: Optional[str] = None
    answers: Dict[str, Any]
    progress_percent: int = 0
    last_playback_time: int = 0

# Utility functions
def generate_id():
    return str(uuid.uuid4())

def get_timestamp():
    return datetime.now(timezone.utc).isoformat()

# Exam Routes
@api_router.post("/exams", response_model=Exam)
async def create_exam(exam_data: ExamCreate):
    try:
        exam_id = generate_id()
        now = get_timestamp()
        
        new_exam = {
            "id": exam_id,
            "title": exam_data.title,
            "description": exam_data.description,
            "audio_url": None,
            "audio_source_method": None,
            "loop_audio": False,
            "duration_seconds": exam_data.duration_seconds,
            "published": False,
            "created_at": now,
            "updated_at": now,
            "is_demo": exam_data.is_demo,
            "question_count": 0,
            "submission_count": 0,
        }
        
        # Insert exam
        await db.exams.insert_one({**new_exam, "_id": exam_id})
        
        # Create 4 sections for the exam
        sections = []
        for i in range(1, 5):
            section_id = generate_id()
            section = {
                "id": section_id,
                "exam_id": exam_id,
                "index": i,
                "title": f"Section {i}",
            }
            sections.append({**section, "_id": section_id})
        
        await db.sections.insert_many(sections)
        
        return Exam(**new_exam)
    except Exception as e:
        logger.error(f"Error creating exam: {e}")
        raise HTTPException(status_code=500, detail="Failed to create exam")

@api_router.get("/exams", response_model=List[Exam])
async def get_all_exams():
    try:
        exams = await db.exams.find({}, {"_id": 0}).to_list(1000)
        return [Exam(**exam) for exam in exams]
    except Exception as e:
        logger.error(f"Error fetching exams: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch exams")

@api_router.get("/exams/published", response_model=List[Exam])
async def get_published_exams():
    try:
        exams = await db.exams.find({"published": True}, {"_id": 0}).to_list(1000)
        return [Exam(**exam) for exam in exams]
    except Exception as e:
        logger.error(f"Error fetching published exams: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch published exams")

@api_router.get("/exams/{exam_id}", response_model=Exam)
async def get_exam(exam_id: str):
    try:
        exam = await db.exams.find_one({"id": exam_id}, {"_id": 0})
        if not exam:
            raise HTTPException(status_code=404, detail="Exam not found")
        return Exam(**exam)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching exam: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch exam")

@api_router.put("/exams/{exam_id}", response_model=Exam)
async def update_exam(exam_id: str, exam_data: ExamUpdate):
    try:
        update_data = {k: v for k, v in exam_data.model_dump().items() if v is not None}
        update_data["updated_at"] = get_timestamp()
        
        result = await db.exams.update_one(
            {"id": exam_id}, 
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Exam not found")
        
        exam = await db.exams.find_one({"id": exam_id}, {"_id": 0})
        return Exam(**exam)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating exam: {e}")
        raise HTTPException(status_code=500, detail="Failed to update exam")

@api_router.delete("/exams/{exam_id}")
async def delete_exam(exam_id: str):
    try:
        # Check if exam exists and is not demo
        exam = await db.exams.find_one({"id": exam_id}, {"_id": 0})
        if not exam:
            raise HTTPException(status_code=404, detail="Exam not found")
        
        if exam.get("is_demo", False):
            raise HTTPException(status_code=400, detail="Demo exams cannot be deleted")
        
        # Delete exam
        await db.exams.delete_one({"id": exam_id})
        
        # Delete related sections and questions
        sections = await db.sections.find({"exam_id": exam_id}, {"_id": 0}).to_list(1000)
        section_ids = [section["id"] for section in sections]
        
        await db.sections.delete_many({"exam_id": exam_id})
        if section_ids:
            await db.questions.delete_many({"section_id": {"$in": section_ids}})
        
        return {"message": "Exam deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting exam: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete exam")

# Section Routes
@api_router.get("/exams/{exam_id}/sections", response_model=List[Section])
async def get_exam_sections(exam_id: str):
    try:
        sections = await db.sections.find({"exam_id": exam_id}, {"_id": 0}).sort("index", 1).to_list(1000)
        return [Section(**section) for section in sections]
    except Exception as e:
        logger.error(f"Error fetching sections: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch sections")

# Question Routes
@api_router.post("/questions", response_model=Question)
async def create_question(question_data: QuestionCreate):
    try:
        # Check if section exists
        section = await db.sections.find_one({"id": question_data.section_id}, {"_id": 0})
        if not section:
            raise HTTPException(status_code=404, detail="Section not found")
        
        # Check if section already has 10 questions
        question_count = await db.questions.count_documents({"section_id": question_data.section_id})
        if question_count >= 10:
            raise HTTPException(status_code=400, detail="Maximum of 10 questions per section")
        
        question_id = generate_id()
        new_question = {
            "id": question_id,
            "exam_id": question_data.exam_id,
            "section_id": question_data.section_id,
            "index": question_count + 1,
            "type": question_data.type,
            "payload": question_data.payload,
            "marks": question_data.marks,
            "created_by": question_data.created_by,
            "is_demo": question_data.is_demo,
        }
        
        await db.questions.insert_one({**new_question, "_id": question_id})
        
        # Update question count on exam
        await db.exams.update_one(
            {"id": question_data.exam_id},
            {"$inc": {"question_count": 1}, "$set": {"updated_at": get_timestamp()}}
        )
        
        return Question(**new_question)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating question: {e}")
        raise HTTPException(status_code=500, detail="Failed to create question")

@api_router.get("/questions/{question_id}", response_model=Question)
async def get_question(question_id: str):
    try:
        question = await db.questions.find_one({"id": question_id}, {"_id": 0})
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        return Question(**question)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching question: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch question")

@api_router.put("/questions/{question_id}", response_model=Question)
async def update_question(question_id: str, question_data: Dict[str, Any]):
    try:
        # Check if question exists
        question = await db.questions.find_one({"id": question_id}, {"_id": 0})
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        # Update question
        result = await db.questions.update_one(
            {"id": question_id}, 
            {"$set": question_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Question not found")
        
        # Also update exam's updated_at timestamp
        await db.exams.update_one(
            {"id": question["exam_id"]},
            {"$set": {"updated_at": get_timestamp()}}
        )
        
        updated_question = await db.questions.find_one({"id": question_id}, {"_id": 0})
        return Question(**updated_question)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating question: {e}")
        raise HTTPException(status_code=500, detail="Failed to update question")

@api_router.delete("/questions/{question_id}")
async def delete_question(question_id: str):
    try:
        # Check if question exists
        question = await db.questions.find_one({"id": question_id}, {"_id": 0})
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        if question.get("is_demo", False):
            raise HTTPException(status_code=400, detail="Demo questions cannot be deleted")
        
        # Delete question
        await db.questions.delete_one({"id": question_id})
        
        # Update question count on exam and timestamp
        await db.exams.update_one(
            {"id": question["exam_id"]},
            {"$inc": {"question_count": -1}, "$set": {"updated_at": get_timestamp()}}
        )
        
        # Re-index remaining questions in the section
        remaining_questions = await db.questions.find(
            {"section_id": question["section_id"]}, 
            {"_id": 0}
        ).sort("index", 1).to_list(1000)
        
        for idx, q in enumerate(remaining_questions, 1):
            if q["index"] != idx:
                await db.questions.update_one(
                    {"id": q["id"]}, 
                    {"$set": {"index": idx}}
                )
        
        return {"message": "Question deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting question: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete question")

@api_router.get("/sections/{section_id}/questions", response_model=List[Question])
async def get_section_questions(section_id: str):
    try:
        questions = await db.questions.find({"section_id": section_id}, {"_id": 0}).sort("index", 1).to_list(1000)
        return [Question(**question) for question in questions]
    except Exception as e:
        logger.error(f"Error fetching questions: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch questions")

@api_router.get("/exams/{exam_id}/full")
async def get_exam_with_sections_and_questions(exam_id: str):
    try:
        # Get exam
        exam = await db.exams.find_one({"id": exam_id}, {"_id": 0})
        if not exam:
            raise HTTPException(status_code=404, detail="Exam not found")
        
        # Get sections
        sections = await db.sections.find({"exam_id": exam_id}, {"_id": 0}).sort("index", 1).to_list(1000)
        
        # Get questions for each section
        sections_with_questions = []
        for section in sections:
            questions = await db.questions.find({"section_id": section["id"]}, {"_id": 0}).sort("index", 1).to_list(1000)
            section["questions"] = questions
            sections_with_questions.append(section)
        
        return {
            "exam": exam,
            "sections": sections_with_questions
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching full exam data: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch exam data")

# Submission Routes
@api_router.post("/submissions", response_model=Submission)
async def create_submission(submission_data: SubmissionCreate):
    try:
        # Check if exam exists
        exam = await db.exams.find_one({"id": submission_data.exam_id}, {"_id": 0})
        if not exam:
            raise HTTPException(status_code=404, detail="Exam not found")
        
        submission_id = generate_id()
        now = get_timestamp()
        
        new_submission = {
            "id": submission_id,
            "exam_id": submission_data.exam_id,
            "user_id_or_session": submission_data.user_id_or_session or f"anonymous_{generate_id()}",
            "started_at": submission_data.started_at or now,
            "finished_at": submission_data.finished_at or now,
            "answers": submission_data.answers,
            "progress_percent": submission_data.progress_percent,
            "last_playback_time": 0,
        }
        
        await db.submissions.insert_one({**new_submission, "_id": submission_id})
        
        # Update exam submission count
        await db.exams.update_one(
            {"id": submission_data.exam_id},
            {"$inc": {"submission_count": 1}, "$set": {"updated_at": get_timestamp()}}
        )
        
        return Submission(**new_submission)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating submission: {e}")
        raise HTTPException(status_code=500, detail="Failed to create submission")

@api_router.get("/submissions/{submission_id}", response_model=Submission)
async def get_submission(submission_id: str):
    try:
        submission = await db.submissions.find_one({"id": submission_id}, {"_id": 0})
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        return Submission(**submission)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching submission: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch submission")

@api_router.get("/exams/{exam_id}/submissions", response_model=List[Submission])
async def get_exam_submissions(exam_id: str):
    try:
        submissions = await db.submissions.find({"exam_id": exam_id}, {"_id": 0}).to_list(1000)
        return [Submission(**submission) for submission in submissions]
    except Exception as e:
        logger.error(f"Error fetching submissions: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch submissions")

# Legacy status endpoints
@api_router.get("/")
async def root():
    return {"message": "IELTS Listening Test Platform API", "version": "1.0"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include the router in the main app
app.include_router(api_router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()