from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Cookie, Request, Response
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import shutil
from auth_service import AuthService
from local_auth_routes import router as local_auth_router
from teacher_auth_routes import router as teacher_auth_router
from admin_teacher_routes import router as admin_teacher_router
from teacher_dashboard_routes import router as teacher_dashboard_router
from submission_routes import router as submission_router
from rbac_routes import router as rbac_router
from question_validation_routes import router as validation_router
from html_question_routes import router as html_question_router
from database import db


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# SQLite ONLY - No MongoDB or Firebase
logger.info("✓ Using SQLite database only - No MongoDB or Firebase")

# Import initialization functions
try:
    from init_ielts_test import init_ielts_test
    from init_reading_test import init_reading_test
    from init_writing_test import init_writing_test
except ImportError:
    logger.info("Initialization modules not available")
    init_ielts_test = None
    init_reading_test = None
    init_writing_test = None

# Import optional services - each with its own try-except
get_ai_import_router = None
get_track_router = None
get_json_upload_router = None

try:
    from ai_import_service import get_router as get_ai_import_router
except ImportError as e:
    logger.warning(f"AI import service not available: {e}")

try:
    from track_service import get_router as get_track_router
except ImportError as e:
    logger.warning(f"Track service not available: {e}")

try:
    from json_upload_service import get_router as get_json_upload_router
except ImportError as e:
    logger.warning(f"JSON upload service not available: {e}")

try:
    from question_type_schemas import detect_question_type, validate_question_structure
except ImportError as e:
    logger.warning(f"Question type schemas not available: {e}")

try:
    from auto_import_handler import AutoImportHandler
except ImportError as e:
    logger.warning(f"Auto import handler not available: {e}")

# Create listening tracks directory (use relative path for cross-platform compatibility)
LISTENING_TRACKS_DIR = ROOT_DIR / "listening_tracks"
LISTENING_TRACKS_DIR.mkdir(exist_ok=True)

# Create the main app without a prefix
app = FastAPI(title="IELTS Listening Test Platform API")

# Add CORS middleware FIRST (before routes)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore SQLite's _id field

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
    is_active: Optional[bool] = None
    started_at: Optional[str] = None
    stopped_at: Optional[str] = None
    is_visible: Optional[bool] = None

class Exam(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    title: str
    description: str
    exam_type: Optional[str] = "listening"  # "listening" or "reading"
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
    is_active: bool = False
    started_at: Optional[str] = None
    stopped_at: Optional[str] = None
    is_visible: bool = True  # Controls visibility to students

# Section Models
class Section(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    exam_id: str
    index: int
    title: str
    passage_text: Optional[str] = None  # For reading passages

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
    exam_title: Optional[str] = None
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
    is_published: bool = False
    published_at: Optional[str] = None

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
# Includes both email addresses and local admin identifiers
ADMIN_EMAILS = [
    "shahsultanweb@gmail.com",
    "aminulislam004474@gmail.com",
    "admin"  # Local admin identifier for development/testing
]

# Admin authentication helper
def check_admin_access(request: Request) -> bool:
    """
    Check if request has admin access via email header
    Accepts X-Admin-Email header from authenticated requests
    Supports both email addresses and local admin identifiers
    """
    admin_email = request.headers.get("X-Admin-Email")
    if admin_email and admin_email in ADMIN_EMAILS:
        return True
    return False

def require_admin_access(request: Request):
    """Require admin access or raise 403"""
    if not check_admin_access(request):
        raise HTTPException(status_code=403, detail="Admin access required")

# Utility functions
def generate_id():
    return str(uuid.uuid4())

def get_timestamp():
    return datetime.now(timezone.utc).isoformat()

# Exam Routes - Map to SQLite tracks
@api_router.post("/exams", response_model=Exam)
async def create_exam(exam_data: ExamCreate):
    """Create exam from track data"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()

        exam_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        # Create track as exam
        cursor.execute('''
            INSERT INTO tracks (id, title, type, description, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (exam_id, exam_data.title, 'exam', exam_data.description, 'draft', now, now))

        conn.commit()
        conn.close()

        return Exam(
            id=exam_id,
            title=exam_data.title,
            description=exam_data.description,
            duration_seconds=exam_data.duration_seconds,
            is_demo=exam_data.is_demo,
            status='draft',
            created_at=now,
            updated_at=now
        )
    except Exception as e:
        logger.error(f"Error creating exam: {e}")
        raise HTTPException(status_code=500, detail="Failed to create exam")

@api_router.get("/exams", response_model=List[Exam])
async def get_all_exams():
    """Get all exams (tracks) from SQLite"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()

        # Get all tracks
        cursor.execute('''
            SELECT id, title, type, description, total_questions, total_sections,
                   status, created_at, updated_at, metadata
            FROM tracks
            ORDER BY created_at DESC
        ''')

        rows = cursor.fetchall()
        conn.close()

        exams = []
        for row in rows:
            # Parse metadata to get is_visible and other fields
            metadata = {}
            if row[9]:  # metadata column
                try:
                    import json
                    metadata = json.loads(row[9])
                except:
                    metadata = {}

            # Determine if published based on status
            is_published = row[6] in ['published', 'active']
            is_active = row[6] == 'active'
            is_visible = metadata.get('is_visible', True)

            exams.append(Exam(
                id=row[0],
                title=row[1],
                description=row[3],
                duration_seconds=1800,
                is_demo=False,
                published=is_published,
                is_active=is_active,
                is_visible=is_visible,
                status=row[6],
                created_at=row[7],
                updated_at=row[8]
            ))

        return exams
    except Exception as e:
        logger.error(f"Error fetching exams: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch exams")

@api_router.get("/exams/published")
async def get_published_exams():
    """Get published exams (tracks) from SQLite database"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()

        # Get all published tracks with metadata
        cursor.execute('''
            SELECT id, title, type, description, total_questions, total_sections,
                   status, created_at, updated_at, metadata
            FROM tracks
            WHERE status IN ('published', 'active')
            ORDER BY created_at DESC
        ''')

        tracks = cursor.fetchall()
        conn.close()

        # Format response
        exams = []
        for track in tracks:
            # Parse metadata to get is_visible
            metadata = {}
            if track[9]:  # metadata column
                try:
                    import json
                    metadata = json.loads(track[9])
                except:
                    metadata = {}

            # Determine if published and active based on status
            is_published = track[6] in ['published', 'active']
            is_active = track[6] == 'active'
            is_visible = bool(metadata.get('is_visible', True))

            exams.append({
                'id': track[0],
                'title': track[1],
                'exam_type': track[2],  # listening, reading, writing
                'description': track[3],
                'total_questions': track[4],
                'total_sections': track[5],
                'status': track[6],
                'published': is_published,
                'is_active': is_active,
                'is_visible': is_visible,
                'created_at': track[7],
                'updated_at': track[8]
            })

        return exams
    except Exception as e:
        logger.error(f"Error fetching published exams: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch published exams")

@api_router.get("/exams/{exam_id}", response_model=Exam)
async def get_exam(exam_id: str):
    """Get exam (track) by ID"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT id, title, type, description, total_questions, total_sections,
                   status, created_at, updated_at, metadata
            FROM tracks
            WHERE id = ?
        ''', (exam_id,))

        row = cursor.fetchone()
        conn.close()

        if not row:
            raise HTTPException(status_code=404, detail="Exam not found")

        # Parse metadata to get is_visible and other fields
        metadata = {}
        if row[9]:  # metadata column
            try:
                import json
                metadata = json.loads(row[9])
            except:
                metadata = {}

        # Determine if published based on status
        is_published = row[6] in ['published', 'active']
        is_active = row[6] == 'active'
        is_visible = metadata.get('is_visible', True)

        return Exam(
            id=row[0],
            title=row[1],
            description=row[3],
            duration_seconds=1800,
            is_demo=False,
            published=is_published,
            is_active=is_active,
            is_visible=is_visible,
            status=row[6],
            created_at=row[7],
            updated_at=row[8]
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching exam: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch exam")

@api_router.put("/exams/{exam_id}", response_model=Exam)
async def update_exam(exam_id: str, exam_data: ExamUpdate):
    """Update exam (track)"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()

        # Check if exam exists
        cursor.execute('SELECT id FROM tracks WHERE id = ?', (exam_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Exam not found")

        now = datetime.now(timezone.utc).isoformat()

        # Update track
        updates = []
        params = []
        if exam_data.title:
            updates.append('title = ?')
            params.append(exam_data.title)
        if exam_data.description:
            updates.append('description = ?')
            params.append(exam_data.description)

        updates.append('updated_at = ?')
        params.append(now)
        params.append(exam_id)

        cursor.execute(f'UPDATE tracks SET {", ".join(updates)} WHERE id = ?', params)
        conn.commit()

        # Fetch updated exam
        cursor.execute('''
            SELECT id, title, type, description, total_questions, total_sections,
                   status, created_at, updated_at
            FROM tracks
            WHERE id = ?
        ''', (exam_id,))

        row = cursor.fetchone()
        conn.close()

        return Exam(
            id=row[0],
            title=row[1],
            description=row[3],
            duration_seconds=1800,
            is_demo=False,
            status=row[6],
            created_at=row[7],
            updated_at=row[8]
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating exam: {e}")
        raise HTTPException(status_code=500, detail="Failed to update exam")

@api_router.delete("/exams/{exam_id}")
async def delete_exam(exam_id: str):
    """Delete exam (track)"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()

        # Check if exam exists
        cursor.execute('SELECT id FROM tracks WHERE id = ?', (exam_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Exam not found")

        # Delete associated data
        cursor.execute('DELETE FROM submission_answers WHERE question_id IN (SELECT id FROM questions WHERE track_id = ?)', (exam_id,))
        cursor.execute('DELETE FROM submissions WHERE track_id = ?', (exam_id,))
        cursor.execute('DELETE FROM questions WHERE track_id = ?', (exam_id,))
        cursor.execute('DELETE FROM sections WHERE track_id = ?', (exam_id,))
        cursor.execute('DELETE FROM tracks WHERE id = ?', (exam_id,))

        conn.commit()
        conn.close()

        return {"success": True, "message": "Exam deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting exam: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete exam")

# Section Routes
@api_router.get("/exams/{exam_id}/sections", response_model=List[Section])
async def get_exam_sections(exam_id: str):
    """Get exam (track) sections"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT id, track_id, section_number, title, description, question_count, duration_minutes, created_at
            FROM sections
            WHERE track_id = ?
            ORDER BY section_number ASC
        ''', (exam_id,))

        rows = cursor.fetchall()
        conn.close()

        sections = []
        for row in rows:
            sections.append(Section(
                id=row[0],
                exam_id=row[1],
                index=row[2],
                title=row[3],
                passage_text=row[4]
            ))

        return sections
    except Exception as e:
        logger.error(f"Error fetching exam sections: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch exam sections")

# Question Routes
@api_router.post("/questions", response_model=Question)
async def create_question(question_data: QuestionCreate):
    """Create question"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()

        question_id = str(uuid.uuid4())

        # Parse payload if it's a string
        payload = question_data.payload
        if isinstance(payload, str):
            import json
            payload = json.loads(payload)

        cursor.execute('''
            INSERT INTO questions (id, section_id, track_id, question_number, type, payload, marks, difficulty, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (question_id, question_data.section_id, question_data.track_id, 1,
              question_data.type, str(payload), question_data.marks, 'medium', datetime.now(timezone.utc).isoformat()))

        conn.commit()
        conn.close()

        return Question(
            id=question_id,
            exam_id=question_data.exam_id,
            section_id=question_data.section_id,
            index=1,
            type=question_data.type,
            payload=payload,
            marks=question_data.marks,
            created_by=question_data.created_by,
            is_demo=question_data.is_demo
        )
    except Exception as e:
        logger.error(f"Error creating question: {e}")
        raise HTTPException(status_code=500, detail="Failed to create question")

@api_router.get("/questions/{question_id}", response_model=Question)
async def get_question(question_id: str):
    """Get question by ID"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT id, section_id, track_id, question_number, type, payload, marks, difficulty, created_at
            FROM questions
            WHERE id = ?
        ''', (question_id,))

        row = cursor.fetchone()
        conn.close()

        if not row:
            raise HTTPException(status_code=404, detail="Question not found")

        # Parse payload if it's a string
        payload = row[5]
        if isinstance(payload, str):
            import json
            payload = json.loads(payload)

        return Question(
            id=row[0],
            exam_id=row[2],
            section_id=row[1],
            index=row[3],
            type=row[4],
            payload=payload,
            marks=row[6],
            created_by='admin',
            is_demo=False
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching question: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch question")

@api_router.put("/questions/{question_id}", response_model=Question)
async def update_question(question_id: str, question_data: Dict[str, Any]):
    """Update question - Use submission_routes for SQLite-based operations"""
    raise HTTPException(status_code=501, detail="Use track-based exam endpoints instead")

@api_router.delete("/questions/{question_id}")
async def delete_question(question_id: str):
    """Delete question - Use submission_routes for SQLite-based operations"""
    raise HTTPException(status_code=501, detail="Use track-based exam endpoints instead")

@api_router.get("/sections/{section_id}/questions", response_model=List[Question])
async def get_section_questions(section_id: str):
    """Get section questions"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT id, section_id, track_id, question_number, type, payload, marks, difficulty, created_at
            FROM questions
            WHERE section_id = ?
            ORDER BY question_number ASC
        ''', (section_id,))

        rows = cursor.fetchall()
        conn.close()

        questions = []
        for row in rows:
            # Parse payload if it's a string
            payload = row[5]
            if isinstance(payload, str):
                import json
                payload = json.loads(payload)

            questions.append(Question(
                id=row[0],
                exam_id=row[2],
                section_id=row[1],
                index=row[3],
                type=row[4],
                payload=payload,
                marks=row[6],
                created_by='admin',
                is_demo=False
            ))

        return questions
    except Exception as e:
        logger.error(f"Error fetching section questions: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch section questions")

@api_router.get("/exams/{exam_id}/full")
async def get_exam_with_sections_and_questions(exam_id: str):
    """Get full exam data with sections and questions"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()

        # Get exam
        cursor.execute('''
            SELECT id, title, type, description, total_questions, total_sections,
                   status, created_at, updated_at
            FROM tracks
            WHERE id = ?
        ''', (exam_id,))

        exam_row = cursor.fetchone()
        if not exam_row:
            raise HTTPException(status_code=404, detail="Exam not found")

        # Get sections
        cursor.execute('''
            SELECT id, track_id, section_number, title, description, question_count, duration_minutes, created_at
            FROM sections
            WHERE track_id = ?
            ORDER BY section_number ASC
        ''', (exam_id,))

        section_rows = cursor.fetchall()

        sections = []
        for section_row in section_rows:
            # Get questions for this section
            cursor.execute('''
                SELECT id, section_id, track_id, question_number, type, payload, marks, difficulty, created_at
                FROM questions
                WHERE section_id = ?
                ORDER BY question_number ASC
            ''', (section_row[0],))

            question_rows = cursor.fetchall()
            questions = []
            for q in question_rows:
                # Parse payload if it's a string
                payload = q[5]
                if isinstance(payload, str):
                    import json
                    payload = json.loads(payload)

                # Ensure multiple_choice and map_labeling questions have options
                if q[4] in ['multiple_choice', 'map_labeling'] and 'options' not in payload:
                    # Generate default options if missing
                    payload['options'] = ['Option A', 'Option B', 'Option C', 'Option D']

                questions.append(Question(
                    id=q[0], exam_id=q[2], section_id=q[1], index=q[3],
                    type=q[4], payload=payload, marks=q[6], created_by='admin', is_demo=False
                ))

            sections.append({
                'id': section_row[0],
                'exam_id': section_row[1],
                'index': section_row[2],
                'title': section_row[3],
                'passage_text': section_row[4],
                'questions': questions
            })

        conn.close()

        return {
            'exam': Exam(
                id=exam_row[0], title=exam_row[1], description=exam_row[3],
                duration_seconds=1800, is_demo=False, status=exam_row[6],
                created_at=exam_row[7], updated_at=exam_row[8]
            ),
            'sections': sections
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching full exam data: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch full exam data")

# Submission Routes
@api_router.post("/submissions", response_model=Submission)
async def create_submission(
    submission_data: SubmissionCreate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create submission"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()

        submission_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        cursor.execute('''
            INSERT INTO submissions (id, track_id, student_id, status, started_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (submission_id, submission_data.track_id, submission_data.student_id, 'in_progress', now, now))

        conn.commit()
        conn.close()

        return Submission(
            id=submission_id,
            track_id=submission_data.track_id,
            student_id=submission_data.student_id,
            status='in_progress',
            started_at=now,
            created_at=now
        )
    except Exception as e:
        logger.error(f"Error creating submission: {e}")
        raise HTTPException(status_code=500, detail="Failed to create submission")

@api_router.get("/submissions/{submission_id}", response_model=Submission)
async def get_submission(submission_id: str):
    """Get submission"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT id, track_id, student_id, status, started_at, completed_at, time_spent_seconds,
                   total_questions, total_marks, obtained_marks, percentage, created_at
            FROM submissions
            WHERE id = ?
        ''', (submission_id,))

        row = cursor.fetchone()
        conn.close()

        if not row:
            raise HTTPException(status_code=404, detail="Submission not found")

        return Submission(
            id=row[0], track_id=row[1], student_id=row[2], status=row[3],
            started_at=row[4], completed_at=row[5], time_spent_seconds=row[6],
            total_questions=row[7], total_marks=row[8], obtained_marks=row[9],
            percentage=row[10], created_at=row[11]
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching submission: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch submission")

@api_router.get("/exams/{exam_id}/submissions", response_model=List[Submission])
async def get_exam_submissions(exam_id: str):
    """Get exam (track) submissions"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT id, track_id, student_id, status, started_at, completed_at, time_spent_seconds,
                   total_questions, total_marks, obtained_marks, percentage, created_at
            FROM submissions
            WHERE track_id = ?
            ORDER BY created_at DESC
        ''', (exam_id,))

        rows = cursor.fetchall()
        conn.close()

        submissions = []
        for row in rows:
            submissions.append(Submission(
                id=row[0], track_id=row[1], student_id=row[2], status=row[3],
                started_at=row[4], completed_at=row[5], time_spent_seconds=row[6],
                total_questions=row[7], total_marks=row[8], obtained_marks=row[9],
                percentage=row[10], created_at=row[11]
            ))

        return submissions
    except Exception as e:
        logger.error(f"Error fetching exam submissions: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch exam submissions")

@api_router.get("/submissions/{submission_id}/detailed")
async def get_submission_detailed(submission_id: str):
    """Get detailed submission with answers"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()

        # Get submission
        cursor.execute('''
            SELECT id, track_id, student_id, status, started_at, completed_at, time_spent_seconds,
                   total_questions, total_marks, obtained_marks, percentage, created_at
            FROM submissions
            WHERE id = ?
        ''', (submission_id,))

        submission_row = cursor.fetchone()
        if not submission_row:
            raise HTTPException(status_code=404, detail="Submission not found")

        # Get answers
        cursor.execute('''
            SELECT id, submission_id, question_id, question_number, question_type, student_answer,
                   correct_answer, is_correct, marks_obtained, marks_total, feedback, created_at
            FROM submission_answers
            WHERE submission_id = ?
            ORDER BY question_number ASC
        ''', (submission_id,))

        answer_rows = cursor.fetchall()
        conn.close()

        answers = [dict(row) for row in answer_rows]

        return {
            'submission': Submission(
                id=submission_row[0], track_id=submission_row[1], student_id=submission_row[2],
                status=submission_row[3], started_at=submission_row[4], completed_at=submission_row[5],
                time_spent_seconds=submission_row[6], total_questions=submission_row[7],
                total_marks=submission_row[8], obtained_marks=submission_row[9],
                percentage=submission_row[10], created_at=submission_row[11]
            ),
            'answers': answers
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
    """Update submission score - Use submission_routes for SQLite-based operations"""
    raise HTTPException(status_code=501, detail="Use submission_routes endpoints instead")

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
# AUTO-IMPORT TEST FROM JSON
# ============================================================================

@api_router.post("/admin/import-test-json")
async def import_test_from_json_data(test_data: Dict[str, Any]):
    """
    Import a complete test from JSON data.
    Automatically detects question types and creates test.
    """
    try:
        handler = AutoImportHandler(db)
        results = await handler.import_from_json(test_data)
        
        return {
            "status": "success" if results["success"] else "failed",
            "exam_id": results["exam_id"],
            "summary": {
                "sections_created": results["sections_created"],
                "questions_created": results["questions_created"],
                "questions_by_type": results["questions_detected"]
            },
            "errors": results["errors"],
            "warnings": results["warnings"]
        }
    except Exception as e:
        logger.error(f"Error importing test: {e}")
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")

@api_router.post("/admin/import-test-file")
async def import_test_from_file(file: UploadFile = File(...)):
    """
    Upload a JSON file and import as IELTS test.
    Automatically detects question types.
    """
    try:
        import json
        
        # Read JSON file
        content = await file.read()
        json_data = json.loads(content)
        
        # Import
        handler = AutoImportHandler(db)
        results = await handler.import_from_json(json_data)
        
        return {
            "status": "success" if results["success"] else "failed",
            "exam_id": results["exam_id"],
            "summary": {
                "sections_created": results["sections_created"],
                "questions_created": results["questions_created"],
                "questions_by_type": results["questions_detected"]
            },
            "errors": results["errors"],
            "warnings": results["warnings"]
        }
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON file: {str(e)}")
    except Exception as e:
        logger.error(f"Error importing test: {e}")
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")

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

        # Check if student already exists (using SQLite)
        existing_student = db.get_student_by_email(email)

        if existing_student:
            # Student exists, create session and return
            await AuthService.create_session(db, existing_student["user_id"], session_token)

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

            # Add student to database (using SQLite)
            result = db.add_student(
                name=name,
                email=email,
                mobile="",
                institute="",
                department="",
                roll_number="",
                photo_path="",
                created_by="oauth"
            )

            if not result.get('success'):
                raise HTTPException(status_code=500, detail="Failed to create student")

            student_id = result['user_id']
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
                    "user_id": student_id,
                    "email": email,
                    "name": name,
                    "photo_path": "",
                    "registration_number": result.get('registration_number', '')
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

    # Update student profile (using SQLite)
    # Note: This endpoint is not fully implemented for SQLite yet
    # For now, just return the current user
    return Student(**user).model_dump()

@api_router.get("/students/me")
async def get_my_profile(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get current student's full profile"""
    user = await AuthService.get_current_user(request, db, session_token)
    AuthService.require_auth(user)
    return Student(**user).model_dump()

@api_router.get("/students/me/submissions")
async def get_my_submissions(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get current student's exam submissions with scores"""
    try:
        user = await AuthService.get_current_user(request, db, session_token)
        AuthService.require_auth(user)

        # Get all submissions for this student using SQLite
        submissions = db.get_student_submissions(user["id"])

        if not submissions:
            return []

        # Enrich submissions with track details
        enriched_submissions = []
        for sub in submissions:
            # Get track details
            track = db.get_track(sub.get('track_id'))
            if track:
                enriched_submissions.append({
                    **sub,
                    "track_title": track.get('title', 'Unknown Track'),
                    "track_description": track.get('description', '')
                })
            else:
                enriched_submissions.append(sub)

        return enriched_submissions
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting student submissions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get submissions")

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

    # Check for existing submission in SQLite
    try:
        conn = db.get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT id, exam_id, user_id, score, status, submitted_at
            FROM submissions
            WHERE exam_id = ? AND user_id = ?
        ''', (exam_id, user.get("id")))

        row = cursor.fetchone()
        conn.close()

        if row:
            submission = {
                "id": row[0],
                "exam_id": row[1],
                "user_id": row[2],
                "score": row[3],
                "status": row[4],
                "submitted_at": row[5]
            }
        else:
            submission = None

        return {
            "attempted": submission is not None,
            "submission": submission
        }
    except Exception as e:
        logger.error(f"Error checking exam attempt status: {e}")
        return {"attempted": False, "submission": None}

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

# Test Control Endpoints (Admin only)
@api_router.put("/admin/exams/{exam_id}/start")
async def start_exam(
    exam_id: str,
    request: Request
):
    """Admin only: Start an exam - enables students to take the test"""
    require_admin_access(request)

    try:
        conn = db.get_connection()
        cursor = conn.cursor()

        # Check if exam exists
        cursor.execute('SELECT id FROM tracks WHERE id = ?', (exam_id,))
        if not cursor.fetchone():
            conn.close()
            raise HTTPException(status_code=404, detail="Exam not found")

        # Update exam status to active
        now = datetime.utcnow().isoformat()
        cursor.execute('''
            UPDATE tracks
            SET status = 'active', updated_at = ?
            WHERE id = ?
        ''', (now, exam_id))
        conn.commit()

        # Get updated exam
        cursor.execute('''
            SELECT id, title, type, description, total_questions, total_sections,
                   status, created_at, updated_at
            FROM tracks
            WHERE id = ?
        ''', (exam_id,))

        row = cursor.fetchone()
        conn.close()

        if not row:
            raise HTTPException(status_code=404, detail="Exam not found")

        return Exam(
            id=row[0],
            title=row[1],
            description=row[3],
            duration_seconds=1800,
            is_demo=False,
            status=row[6],
            created_at=row[7],
            updated_at=row[8],
            is_active=True,
            started_at=now
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting exam: {e}")
        raise HTTPException(status_code=500, detail="Failed to start exam")

@api_router.put("/admin/exams/{exam_id}/stop")
async def stop_exam(
    exam_id: str,
    request: Request
):
    """Admin only: Stop an exam - disables students from taking the test"""
    require_admin_access(request)

    try:
        conn = db.get_connection()
        cursor = conn.cursor()

        # Check if exam exists
        cursor.execute('SELECT id FROM tracks WHERE id = ?', (exam_id,))
        if not cursor.fetchone():
            conn.close()
            raise HTTPException(status_code=404, detail="Exam not found")

        # Update exam status to inactive
        now = datetime.utcnow().isoformat()
        cursor.execute('''
            UPDATE tracks
            SET status = 'inactive', updated_at = ?
            WHERE id = ?
        ''', (now, exam_id))
        conn.commit()

        # Get updated exam
        cursor.execute('''
            SELECT id, title, type, description, total_questions, total_sections,
                   status, created_at, updated_at
            FROM tracks
            WHERE id = ?
        ''', (exam_id,))

        row = cursor.fetchone()
        conn.close()

        if not row:
            raise HTTPException(status_code=404, detail="Exam not found")

        return Exam(
            id=row[0],
            title=row[1],
            description=row[3],
            duration_seconds=1800,
            is_demo=False,
            status=row[6],
            created_at=row[7],
            updated_at=row[8],
            is_active=False,
            stopped_at=now
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error stopping exam: {e}")
        raise HTTPException(status_code=500, detail="Failed to stop exam")

@api_router.get("/exams/{exam_id}/status")
async def get_exam_status(exam_id: str):
    """Public endpoint: Get exam status for polling"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()

        # Get exam status from SQLite
        cursor.execute('''
            SELECT id, status, created_at, updated_at, metadata
            FROM tracks
            WHERE id = ?
        ''', (exam_id,))

        row = cursor.fetchone()
        conn.close()

        if not row:
            raise HTTPException(status_code=404, detail="Exam not found")

        # Parse metadata to get is_visible and other fields
        metadata = {}
        if row[4]:  # metadata column
            try:
                import json
                metadata = json.loads(row[4])
            except:
                metadata = {}

        # Determine if published based on status
        is_published = row[1] in ['published', 'active']
        is_active = row[1] == 'active'

        return {
            "exam_id": exam_id,
            "is_active": is_active,
            "started_at": metadata.get("started_at"),
            "stopped_at": metadata.get("stopped_at"),
            "published": is_published
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching exam status: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch exam status")

@api_router.put("/admin/exams/{exam_id}/visibility")
async def toggle_exam_visibility(
    exam_id: str,
    is_visible: bool,
    request: Request
):
    """Admin only: Toggle exam visibility to students"""
    require_admin_access(request)

    try:
        conn = db.get_connection()
        cursor = conn.cursor()

        # Check if exam exists
        cursor.execute('SELECT id FROM tracks WHERE id = ?', (exam_id,))
        if not cursor.fetchone():
            conn.close()
            raise HTTPException(status_code=404, detail="Exam not found")

        # Update visibility
        now = datetime.utcnow().isoformat()
        cursor.execute('''
            UPDATE tracks
            SET metadata = json_set(COALESCE(metadata, '{}'), '$.is_visible', ?), updated_at = ?
            WHERE id = ?
        ''', (is_visible, now, exam_id))
        conn.commit()

        # Get updated exam
        cursor.execute('''
            SELECT id, title, type, description, total_questions, total_sections,
                   status, created_at, updated_at
            FROM tracks
            WHERE id = ?
        ''', (exam_id,))

        row = cursor.fetchone()
        conn.close()

        if not row:
            raise HTTPException(status_code=404, detail="Exam not found")

        admin_email = request.headers.get("X-Admin-Email", "unknown")
        logger.info(f"Admin {admin_email} set exam {exam_id} visibility to {is_visible}")

        return Exam(
            id=row[0],
            title=row[1],
            description=row[3],
            duration_seconds=1800,
            is_demo=False,
            status=row[6],
            created_at=row[7],
            updated_at=row[8],
            is_visible=is_visible
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error toggling exam visibility: {e}")
        raise HTTPException(status_code=500, detail="Failed to toggle exam visibility")

# Result Publishing Endpoints (Admin only)
@api_router.put("/admin/exams/{exam_id}/publish-results")
async def publish_exam_results(
    exam_id: str,
    request: Request
):
    """Admin only: Publish all results for an exam - makes all submission scores visible to students"""
    require_admin_access(request)
    
    try:
        # Check if exam exists
        exam = await db.exams.find_one({"id": exam_id}, {"_id": 0})
        if not exam:
            raise HTTPException(status_code=404, detail="Exam not found")
        
        # Update all submissions for this exam to published
        now = get_timestamp()
        result = await db.submissions.update_many(
            {"exam_id": exam_id, "is_published": False},
            {
                "$set": {
                    "is_published": True,
                    "published_at": now
                }
            }
        )
        
        return {
            "message": "Results published successfully",
            "exam_id": exam_id,
            "exam_title": exam.get("title", ""),
            "published_count": result.modified_count,
            "published_at": now
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error publishing exam results: {e}")
        raise HTTPException(status_code=500, detail="Failed to publish exam results")

@api_router.put("/admin/submissions/{submission_id}/publish")
async def publish_single_submission(
    submission_id: str,
    request: Request
):
    """Admin only: Publish a single submission result"""
    require_admin_access(request)
    
    try:
        # Check if submission exists
        submission = await db.submissions.find_one({"id": submission_id}, {"_id": 0})
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        # Update submission to published
        now = get_timestamp()
        result = await db.submissions.update_one(
            {"id": submission_id},
            {
                "$set": {
                    "is_published": True,
                    "published_at": now
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        # Return updated submission
        updated_submission = await db.submissions.find_one({"id": submission_id}, {"_id": 0})
        return Submission(**updated_submission)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error publishing submission: {e}")
        raise HTTPException(status_code=500, detail="Failed to publish submission")

# Legacy status endpoints
@api_router.get("/")
async def root():
    return {"message": "IELTS Listening Test Platform API", "version": "1.0"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)

    # Convert to dict and serialize datetime to ISO string for SQLite
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()

    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # If SQLite is not available, return empty list
    if db is None:
        return []

    try:
        # Exclude SQLite's _id field from the query results
        status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)

        # Convert ISO string timestamps back to datetime objects
        for check in status_checks:
            if isinstance(check['timestamp'], str):
                check['timestamp'] = datetime.fromisoformat(check['timestamp'])

        return status_checks
    except Exception as e:
        logger.warning(f"Error fetching status checks: {e}")
        return []

# Include the router in the main app
app.include_router(api_router)

# Include local authentication router
app.include_router(local_auth_router)

# Include teacher authentication router
app.include_router(teacher_auth_router)

# Include admin teacher management router
app.include_router(admin_teacher_router)

# Include teacher dashboard router
app.include_router(teacher_dashboard_router)

# Include RBAC router
app.include_router(rbac_router)

# Include submission router
app.include_router(submission_router)

# Include validation router
app.include_router(validation_router)

# Include HTML question router
app.include_router(html_question_router)

# Include new routers for AI import and track management (if available)
if get_ai_import_router:
    try:
        app.include_router(get_ai_import_router(), prefix="/api/tracks")
    except Exception as e:
        logger.warning(f"Could not include AI import router: {e}")

if get_track_router:
    try:
        app.include_router(get_track_router())
    except Exception as e:
        logger.warning(f"Could not include track router: {e}")

if get_json_upload_router:
    try:
        app.include_router(get_json_upload_router(), prefix="/api/tracks")
    except Exception as e:
        logger.warning(f"Could not include JSON upload router: {e}")

# Include Phase 3 submission router
app.include_router(submission_router)

# Mount static files for serving audio files
app.mount("/listening_tracks", StaticFiles(directory=str(LISTENING_TRACKS_DIR)), name="listening_tracks")

# Mount uploads directory for serving student photos
UPLOADS_DIR = ROOT_DIR / "uploads"
if UPLOADS_DIR.exists():
    logger.info(f"✓ Uploads directory found at {UPLOADS_DIR}")

    # Add a custom endpoint to serve photos with CORS headers
    @app.api_route("/uploads/student_photos/{filename}", methods=["GET", "HEAD", "OPTIONS"])
    async def serve_student_photo(filename: str, request: Request):
        """Serve student photos with CORS headers"""
        logger.info(f"[PHOTO ENDPOINT] Request received: {request.method} {filename}")

        # Handle CORS preflight requests
        if request.method == "OPTIONS":
            logger.info(f"[PHOTO ENDPOINT] Handling OPTIONS preflight for {filename}")
            response = Response()
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "GET, HEAD, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            response.headers["Access-Control-Max-Age"] = "3600"
            logger.info(f"[PHOTO ENDPOINT] OPTIONS response headers set")
            return response

        try:
            file_path = UPLOADS_DIR / "student_photos" / filename
            logger.info(f"[PHOTO ENDPOINT] Looking for file: {file_path}")

            if not file_path.exists():
                logger.error(f"[PHOTO ENDPOINT] File not found: {file_path}")
                raise HTTPException(status_code=404, detail="Photo not found")

            logger.info(f"[PHOTO ENDPOINT] File found, serving: {file_path}")

            # Return FileResponse with CORS headers
            file_response = FileResponse(file_path, media_type="image/jpeg")
            file_response.headers["Access-Control-Allow-Origin"] = "*"
            file_response.headers["Access-Control-Allow-Methods"] = "GET, HEAD, OPTIONS"
            file_response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            file_response.headers["Access-Control-Expose-Headers"] = "Content-Length, Content-Type"

            logger.info(f"[PHOTO ENDPOINT] Returning file with CORS headers")
            return file_response
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"[PHOTO ENDPOINT] Error serving photo: {e}")
            raise HTTPException(status_code=500, detail="Error serving photo")

# Mount frontend static files
# Try multiple locations for frontend build directory
FRONTEND_BUILD_DIR = None
possible_paths = [
    ROOT_DIR.parent / "build" / "frontend" / "build",  # Development
    ROOT_DIR / "build",  # Staging directory (EXE location)
    Path.cwd() / "build",  # Current working directory
]

for path in possible_paths:
    if path.exists():
        FRONTEND_BUILD_DIR = path
        logger.info(f"✓ Found frontend build at {path}")
        break

if FRONTEND_BUILD_DIR:
    # Mount static subdirectory
    app.mount("/static", StaticFiles(directory=str(FRONTEND_BUILD_DIR / "static")), name="static")
    logger.info(f"✓ Frontend static files mounted from {FRONTEND_BUILD_DIR / 'static'}")
else:
    logger.warning(f"Frontend build directory not found. Tried: {possible_paths}")

# Root route handler - serve index.html for SPA
@app.get("/")
async def serve_root():
    """Serve the frontend index.html"""
    index_file = FRONTEND_BUILD_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    else:
        return {"message": "IELTS Platform API - Frontend not found"}

# Serve root-level JavaScript files (rangy-core.min.js, rangy-classapplier.min.js, etc.)
@app.get("/{filename:path}")
async def serve_root_files(filename: str):
    """Serve files from the root of the build directory"""
    # Skip API routes - let them be handled by routers
    if filename.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not Found")

    # Skip static routes (handled by mount)
    if filename.startswith("static/"):
        raise HTTPException(status_code=404, detail="Not Found")

    # Skip admin routes - but let frontend handle them for SPA routing
    # if filename.startswith("admin/"):
    #     raise HTTPException(status_code=404, detail="Not Found")

    # Skip student routes - but let frontend handle them for SPA routing
    # if filename.startswith("student/"):
    #     raise HTTPException(status_code=404, detail="Not Found")

    # Check if it's a file in the root build directory
    if FRONTEND_BUILD_DIR:
        file_path = FRONTEND_BUILD_DIR / filename
        if file_path.exists() and file_path.is_file():
            # Determine MIME type based on file extension
            if filename.endswith('.js'):
                return FileResponse(file_path, media_type="application/javascript")
            elif filename.endswith('.css'):
                return FileResponse(file_path, media_type="text/css")
            elif filename.endswith('.html'):
                return FileResponse(file_path, media_type="text/html")
            else:
                return FileResponse(file_path)

    # If not found, serve index.html for SPA routing
    index_file = FRONTEND_BUILD_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    else:
        raise HTTPException(status_code=404, detail="Not Found")

@app.on_event("startup")
async def startup_db():
    """Initialize IELTS tests and database indexes on startup"""
    try:
        logger.info("✓ SQLite database initialized on startup")

        # Initialize default tests (if available)
        try:
            if init_ielts_test:
                init_ielts_test()
            if init_reading_test:
                init_reading_test()
            if init_writing_test:
                init_writing_test()
            logger.info("✓ IELTS tests initialized successfully")
        except Exception as e:
            logger.warning(f"Error initializing IELTS tests: {e}")

    except Exception as e:
        logger.error(f"Error during startup: {e}")
        # Don't fail startup, just log the error

@app.on_event("shutdown")
async def shutdown_db_client():
    """Shutdown database connection"""
    logger.info("✓ Shutting down SQLite database")


if __name__ == "__main__":
    import uvicorn
    import sys

    # Fix for PyInstaller windowed mode - sys.stdout is None
    # This prevents the "AttributeError: 'NoneType' object has no attribute 'isatty'" error
    if sys.stdout is None:
        # Redirect stdout/stderr to avoid logging errors in windowed mode
        import io
        sys.stdout = io.StringIO()
        sys.stderr = io.StringIO()

    # Run uvicorn with custom logging config for windowed mode
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
        access_log=False  # Disable access logs to avoid console issues
    )