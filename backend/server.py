from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Cookie, Request, Response
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
from init_ielts_test import init_ielts_test
from auth_service import AuthService


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create listening tracks directory
LISTENING_TRACKS_DIR = Path("/app/listening_tracks")
LISTENING_TRACKS_DIR.mkdir(exist_ok=True)

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
    score: Optional[int] = None
    total_questions: Optional[int] = None
    correct_answers: Optional[int] = None
    student_name: Optional[str] = None
    student_email: Optional[str] = None

# Student Models
class StudentProfileComplete(BaseModel):
    full_name: str
    phone_number: str
    institution: str
    department: str
    roll_number: Optional[str] = None
    profile_picture: Optional[str] = None

class Student(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    email: str
    full_name: str
    phone_number: str
    institution: str
    department: str
    roll_number: Optional[str] = None
    profile_picture: Optional[str] = None
    google_id: str
    created_at: str
    updated_at: str

class SessionExchange(BaseModel):
    session_id: str

# Admin emails configuration
ADMIN_EMAILS = ["shahsultanweb@gmail.com"]

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
async def create_submission(
    submission_data: SubmissionCreate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    try:
        # Check if exam exists
        exam = await db.exams.find_one({"id": submission_data.exam_id}, {"_id": 0})
        if not exam:
            raise HTTPException(status_code=404, detail="Exam not found")
        
        # Get current user if authenticated
        user = await AuthService.get_current_user(request, db, session_token)
        
        # Use authenticated user ID or provided session ID
        user_id = user["id"] if user else (submission_data.user_id_or_session or f"anonymous_{generate_id()}")
        
        # Check if student has already submitted this exam
        if user:
            existing_submission = await db.submissions.find_one({
                "exam_id": submission_data.exam_id,
                "user_id_or_session": user_id
            })
            if existing_submission:
                raise HTTPException(
                    status_code=400,
                    detail="You have already submitted this exam. Each student can attempt an exam only once."
                )
        
        # Get all questions for auto-grading
        sections = await db.sections.find({"exam_id": submission_data.exam_id}, {"_id": 0}).to_list(1000)
        all_questions = []
        for section in sections:
            questions = await db.questions.find({"section_id": section["id"]}, {"_id": 0}).to_list(1000)
            all_questions.extend(questions)
        
        # Auto-grade submission
        correct_count = 0
        total_questions = len(all_questions)
        
        for question in all_questions:
            question_index = str(question["index"])
            student_answer = submission_data.answers.get(question_index, "").strip().lower()
            
            # Check if question has answer_key
            if "answer_key" in question.get("payload", {}):
                correct_answer = str(question["payload"]["answer_key"]).strip().lower()
                
                # For short answer questions, do case-insensitive comparison
                if question["type"] in ["short_answer", "diagram_labeling"]:
                    if student_answer == correct_answer:
                        correct_count += 1
                # For multiple choice and map labeling, exact match
                elif question["type"] in ["multiple_choice", "map_labeling"]:
                    if student_answer == correct_answer:
                        correct_count += 1
        
        # Calculate score (out of total questions)
        score = correct_count if total_questions > 0 else 0
        
        submission_id = generate_id()
        now = get_timestamp()
        
        new_submission = {
            "id": submission_id,
            "exam_id": submission_data.exam_id,
            "user_id_or_session": user_id,
            "started_at": submission_data.started_at or now,
            "finished_at": submission_data.finished_at or now,
            "answers": submission_data.answers,
            "progress_percent": submission_data.progress_percent,
            "last_playback_time": 0,
            "score": score,
            "total_questions": total_questions,
            "correct_answers": correct_count,
            "student_name": user.get("full_name", "Anonymous") if user else "Anonymous",
            "student_email": user.get("email", "") if user else ""
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

@api_router.get("/submissions/{submission_id}/detailed")
async def get_submission_detailed(submission_id: str):
    """
    Get detailed submission with all questions, student answers, and correct answers.
    Used for manual review and marking by teachers.
    """
    try:
        # Get submission
        submission = await db.submissions.find_one({"id": submission_id}, {"_id": 0})
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        # Get exam details
        exam = await db.exams.find_one({"id": submission["exam_id"]}, {"_id": 0})
        if not exam:
            raise HTTPException(status_code=404, detail="Exam not found")
        
        # Get all sections and questions for this exam
        sections = await db.sections.find({"exam_id": submission["exam_id"]}, {"_id": 0}).sort("index", 1).to_list(1000)
        
        detailed_sections = []
        for section in sections:
            questions = await db.questions.find({"section_id": section["id"]}, {"_id": 0}).sort("index", 1).to_list(1000)
            
            # Add student answer and correct answer to each question
            for question in questions:
                question_index = str(question["index"])
                question["student_answer"] = submission.get("answers", {}).get(question_index, "")
                question["correct_answer"] = question.get("payload", {}).get("answer_key", "")
                
                # Check if answer is correct
                student_ans = str(question["student_answer"]).strip().lower()
                correct_ans = str(question["correct_answer"]).strip().lower()
                question["is_correct"] = student_ans == correct_ans if correct_ans else None
            
            detailed_sections.append({
                **section,
                "questions": questions
            })
        
        return {
            "submission": submission,
            "exam": exam,
            "sections": detailed_sections
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching detailed submission: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch detailed submission")

@api_router.put("/submissions/{submission_id}/score")
async def update_submission_score(
    submission_id: str,
    score_data: Dict[str, Any],
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Update submission score manually. Can update individual question scores or overall score.
    Admin-only endpoint.
    """
    try:
        # Verify admin access
        user = await AuthService.get_current_user(request, db, session_token)
        if not user or user.get("email") != "shahsultanweb@gmail.com":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Get submission
        submission = await db.submissions.find_one({"id": submission_id}, {"_id": 0})
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        # Update score and correct_answers
        new_score = score_data.get("score")
        new_correct_answers = score_data.get("correct_answers")
        
        update_data = {"updated_at": get_timestamp()}
        
        if new_score is not None:
            update_data["score"] = new_score
        
        if new_correct_answers is not None:
            update_data["correct_answers"] = new_correct_answers
        
        # Add manual_grading flag to indicate this was manually adjusted
        update_data["manually_graded"] = True
        update_data["graded_by"] = user.get("email")
        update_data["graded_at"] = get_timestamp()
        
        await db.submissions.update_one(
            {"id": submission_id},
            {"$set": update_data}
        )
        
        # Fetch updated submission
        updated_submission = await db.submissions.find_one({"id": submission_id}, {"_id": 0})
        
        return {
            "message": "Score updated successfully",
            "submission": updated_submission
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating submission score: {e}")
        raise HTTPException(status_code=500, detail="Failed to update submission score")

# Audio File Upload Route
@api_router.post("/upload-audio")
async def upload_audio_file(file: UploadFile = File(...)):
    """
    Upload an audio file to the listening_tracks directory.
    Returns the URL path to access the uploaded file.
    """
    try:
        # Validate file type
        allowed_extensions = ['.mp3', '.wav', '.m4a', '.ogg', '.flac']
        file_ext = Path(file.filename).suffix.lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        # Generate unique filename
        unique_filename = f"{generate_id()}{file_ext}"
        file_path = LISTENING_TRACKS_DIR / unique_filename
        
        # Save file in chunks to handle large files
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return the URL path to access the file
        audio_url = f"/listening_tracks/{unique_filename}"
        
        logger.info(f"Audio file uploaded successfully: {unique_filename}")
        
        return {
            "message": "Audio file uploaded successfully",
            "filename": unique_filename,
            "audio_url": audio_url,
            "size": os.path.getsize(file_path)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading audio file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload audio file: {str(e)}")

# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@api_router.post("/auth/session")
async def create_auth_session(data: SessionExchange, response: Response):
    """
    Exchange session_id for session_token and user data.
    Creates new student if first time, otherwise returns existing student.
    """
    try:
        # Exchange session_id for user data
        user_data = await AuthService.exchange_session_id(data.session_id)
        
        google_id = user_data["id"]
        email = user_data["email"]
        name = user_data.get("name", "")
        picture = user_data.get("picture", "")
        session_token = user_data["session_token"]
        
        # Check if student already exists
        existing_student = await db.students.find_one({"email": email})
        
        if existing_student:
            # Student exists, create session and return
            await AuthService.create_session(db, existing_student["id"], session_token)
            
            # Set httpOnly cookie
            response.set_cookie(
                key="session_token",
                value=session_token,
                httponly=True,
                secure=True,
                samesite="none",
                max_age=7 * 24 * 60 * 60,  # 7 days
                path="/"
            )
            
            return {
                "user": Student(**existing_student).model_dump(),
                "is_new_user": False
            }
        else:
            # New student - create minimal profile
            student_id = generate_id()
            now = get_timestamp()
            
            student = {
                "id": student_id,
                "_id": student_id,
                "email": email,
                "full_name": name,
                "google_id": google_id,
                "profile_picture": picture,
                "phone_number": "",
                "institution": "",
                "department": "",
                "roll_number": "",
                "created_at": now,
                "updated_at": now,
                "profile_completed": False
            }
            
            await db.students.insert_one(student)
            await AuthService.create_session(db, student_id, session_token)
            
            # Set httpOnly cookie
            response.set_cookie(
                key="session_token",
                value=session_token,
                httponly=True,
                secure=True,
                samesite="none",
                max_age=7 * 24 * 60 * 60,
                path="/"
            )
            
            return {
                "user": {
                    "id": student_id,
                    "email": email,
                    "full_name": name,
                    "profile_picture": picture,
                    "google_id": google_id
                },
                "is_new_user": True
            }
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating auth session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/auth/me")
async def get_current_student(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get current authenticated student"""
    user = await AuthService.get_current_user(request, db, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return Student(**user).model_dump()

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response, session_token: Optional[str] = Cookie(None)):
    """Logout current user"""
    if session_token:
        await AuthService.delete_session(db, session_token)
    
    response.delete_cookie(
        key="session_token",
        path="/",
        samesite="none",
        secure=True
    )
    
    return {"message": "Logged out successfully"}

# ============================================================================
# STUDENT ENDPOINTS
# ============================================================================

@api_router.post("/students/complete-profile")
async def complete_student_profile(
    profile_data: StudentProfileComplete,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Complete student profile after first login"""
    user = await AuthService.get_current_user(request, db, session_token)
    AuthService.require_auth(user)
    
    # Update student profile
    update_data = profile_data.model_dump()
    update_data["updated_at"] = get_timestamp()
    update_data["profile_completed"] = True
    
    await db.students.update_one(
        {"id": user["id"]},
        {"$set": update_data}
    )
    
    # Get updated student
    updated_student = await db.students.find_one({"id": user["id"]})
    return Student(**updated_student).model_dump()

@api_router.get("/students/me")
async def get_my_profile(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get current student's full profile"""
    user = await AuthService.get_current_user(request, db, session_token)
    AuthService.require_auth(user)
    return Student(**user).model_dump()

@api_router.get("/students/me/submissions")
async def get_my_submissions(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get current student's exam submissions with scores"""
    user = await AuthService.get_current_user(request, db, session_token)
    AuthService.require_auth(user)
    
    # Get all submissions for this student
    submissions = await db.submissions.find(
        {"user_id_or_session": user["id"]},
        {"_id": 0}
    ).to_list(1000)
    
    # Enrich submissions with exam details
    enriched_submissions = []
    for sub in submissions:
        exam = await db.exams.find_one({"id": sub["exam_id"]}, {"_id": 0})
        if exam:
            enriched_submissions.append({
                **sub,
                "exam_title": exam["title"],
                "exam_description": exam.get("description", "")
            })
    
    return enriched_submissions

@api_router.get("/students/me/exam-status/{exam_id}")
async def get_exam_attempt_status(
    exam_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Check if student has already attempted this exam"""
    user = await AuthService.get_current_user(request, db, session_token)
    
    # If not authenticated, return not attempted
    if not user:
        return {"attempted": False, "submission": None}
    
    # Check for existing submission
    submission = await db.submissions.find_one(
        {
            "exam_id": exam_id,
            "user_id_or_session": user["id"]
        },
        {"_id": 0}
    )
    
    return {
        "attempted": submission is not None,
        "submission": submission
    }

# ============================================================================
# ADMIN ENDPOINTS - Student Management
# ============================================================================

@api_router.get("/admin/students")
async def get_all_students(request: Request, session_token: Optional[str] = Cookie(None)):
    """Admin only: Get all students"""
    user = await AuthService.get_current_user(request, db, session_token)
    AuthService.require_admin(user, ADMIN_EMAILS)
    
    students = await db.students.find({}, {"_id": 0}).to_list(10000)
    
    # Add submission counts
    for student in students:
        submission_count = await db.submissions.count_documents(
            {"user_id_or_session": student["id"]}
        )
        student["submission_count"] = submission_count
    
    return students

@api_router.get("/admin/submissions")
async def get_all_submissions_admin(request: Request, session_token: Optional[str] = Cookie(None)):
    """Admin only: Get all submissions with student details"""
    user = await AuthService.get_current_user(request, db, session_token)
    AuthService.require_admin(user, ADMIN_EMAILS)
    
    submissions = await db.submissions.find({}, {"_id": 0}).to_list(10000)
    
    # Enrich with student and exam data
    enriched_submissions = []
    for sub in submissions:
        # Get student info
        student = await db.students.find_one({"id": sub["user_id_or_session"]}, {"_id": 0})
        
        # Get exam info
        exam = await db.exams.find_one({"id": sub["exam_id"]}, {"_id": 0})
        
        enriched_submissions.append({
            **sub,
            "student_name": student.get("full_name", "Unknown") if student else "Unknown",
            "student_email": student.get("email", "Unknown") if student else "Unknown",
            "student_institution": student.get("institution", "") if student else "",
            "exam_title": exam.get("title", "Unknown") if exam else "Unknown"
        })
    
    return enriched_submissions

@api_router.delete("/admin/students/{student_id}")
async def delete_student(
    student_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Admin only: Delete a student"""
    user = await AuthService.get_current_user(request, db, session_token)
    AuthService.require_admin(user, ADMIN_EMAILS)
    
    result = await db.students.delete_one({"id": student_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Also delete their sessions and submissions
    await db.sessions.delete_many({"user_id": student_id})
    await db.submissions.delete_many({"user_id_or_session": student_id})
    
    return {"message": "Student deleted successfully"}

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

# Configure logging first (before using logger)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Include the router in the main app
app.include_router(api_router)

# Mount static files for serving audio files
app.mount("/listening_tracks", StaticFiles(directory=str(LISTENING_TRACKS_DIR)), name="listening_tracks")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db():
    """Initialize IELTS test on startup"""
    await init_ielts_test()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()