from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import JSONResponse
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

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

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

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()