"""
Track System - Database Models and Schemas
Defines the Track-based architecture for IELTS exam management
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
import uuid


# ============================================
# QUESTION MODELS
# ============================================

class QuestionPayload(BaseModel):
    """Base payload structure - varies by question type"""
    pass


class QuestionImage(BaseModel):
    """Image attachment for questions"""
    url: Optional[str] = None
    alt: Optional[str] = None
    uploaded_at: Optional[str] = None


class Question(BaseModel):
    """Individual question within a section"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order: int = Field(ge=1, le=10, description="Position in section (1-10)")
    type: str = Field(description="Question type identifier")
    payload: Dict[str, Any] = Field(description="Question-specific data")
    image: Optional[QuestionImage] = None
    marks: int = Field(default=1, ge=0)
    metadata: Dict[str, Any] = Field(default_factory=dict)


# ============================================
# SECTION MODELS
# ============================================

class Section(BaseModel):
    """Section within a track (max 4 sections per track)"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order: int = Field(ge=1, le=4, description="Section number (1-4)")
    title: str = Field(default="", description="Section title")
    questions: List[Question] = Field(default_factory=list, max_items=10)
    
    @validator('questions')
    def validate_question_count(cls, questions):
        if len(questions) > 10:
            raise ValueError("Section cannot have more than 10 questions")
        return questions


# ============================================
# AUDIO MODELS
# ============================================

class AudioConfig(BaseModel):
    """Audio configuration for listening tracks"""
    method: Literal["upload", "url"] = Field(description="Upload method")
    url: str = Field(description="Audio file URL or path")
    original_filename: Optional[str] = None
    duration: Optional[int] = Field(None, description="Duration in seconds")
    size: Optional[int] = Field(None, description="File size in bytes")
    mime_type: Optional[str] = None


# ============================================
# TRACK MODELS
# ============================================

class TrackValidation(BaseModel):
    """Validation status of a track"""
    total_questions: int = 0
    has_sections: int = 0
    is_valid: bool = False
    errors: List[str] = Field(default_factory=list)


class TrackCreate(BaseModel):
    """Data required to create a new track"""
    title: str = Field(min_length=3, max_length=200)
    type: Literal["listening", "reading", "writing"]
    description: Optional[str] = ""
    time_limit_seconds: int = Field(default=2700, ge=60, le=7200)


class TrackUpdate(BaseModel):
    """Data that can be updated in a track"""
    title: Optional[str] = None
    description: Optional[str] = None
    time_limit_seconds: Optional[int] = None
    status: Optional[Literal["draft", "published", "archived"]] = None


class Track(BaseModel):
    """Complete track structure"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    type: Literal["listening", "reading", "writing"]
    description: Optional[str] = ""
    created_by: str = Field(description="Admin user ID")
    status: Literal["draft", "published", "archived"] = Field(default="draft")
    time_limit_seconds: int = Field(default=2700)
    
    # Audio (only for listening tracks)
    audio: Optional[AudioConfig] = None
    
    # Sections (4 sections with up to 10 questions each)
    sections: List[Section] = Field(default_factory=list, max_items=4)
    
    # Validation status
    validation: TrackValidation = Field(default_factory=TrackValidation)
    
    # Timestamps
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    
    @validator('sections')
    def validate_sections(cls, sections):
        if len(sections) > 4:
            raise ValueError("Track cannot have more than 4 sections")
        return sections
    
    def validate_track(self) -> TrackValidation:
        """Validate track structure and return validation result"""
        errors = []
        total_questions = sum(len(section.questions) for section in self.sections)
        has_sections = len(self.sections)
        
        # Check sections
        if has_sections != 4:
            errors.append(f"Track must have exactly 4 sections (found {has_sections})")
        
        # Check total questions
        if total_questions < 1:
            errors.append("Track must have at least 1 question")
        
        if total_questions > 40:
            errors.append(f"Track cannot have more than 40 questions (found {total_questions})")
        
        # Check audio for listening tracks
        if self.type == "listening" and not self.audio:
            errors.append("Listening track must have audio configured")
        
        # Validate each question has required fields
        for section in self.sections:
            for question in section.questions:
                if not question.payload.get('answer_key') and question.type != 'writing_task':
                    errors.append(f"Question {question.order} in section {section.order} missing answer_key")
        
        is_valid = len(errors) == 0 and has_sections == 4
        
        return TrackValidation(
            total_questions=total_questions,
            has_sections=has_sections,
            is_valid=is_valid,
            errors=errors
        )


# ============================================
# EXAM MODELS
# ============================================

class ExamTrack(BaseModel):
    """Track reference in an exam"""
    track_id: str
    order: int = Field(ge=1)
    track_type: Literal["listening", "reading", "writing"]


class ExamSettings(BaseModel):
    """Exam execution settings"""
    wait_between_tracks_seconds: int = Field(default=120, ge=0, le=600)
    allow_early_start: bool = Field(default=False)
    auto_publish_results: bool = Field(default=False)
    show_score_between_tracks: bool = Field(default=False)


class ExamFromTracks(BaseModel):
    """Data to create an exam from tracks"""
    title: str = Field(min_length=3, max_length=200)
    description: Optional[str] = ""
    track_ids: List[str] = Field(min_items=1, max_items=3)
    settings: Optional[ExamSettings] = Field(default_factory=ExamSettings)
    published: bool = Field(default=False)
    is_visible: bool = Field(default=True)


class Exam(BaseModel):
    """Exam composed of one or more tracks"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = ""
    created_by: str
    status: Literal["scheduled", "active", "completed"] = Field(default="scheduled")
    
    # Track configuration
    tracks: List[ExamTrack] = Field(min_items=1, max_items=3)
    
    # Settings
    settings: ExamSettings = Field(default_factory=ExamSettings)
    
    # Computed fields
    total_questions: int = 0
    total_duration: int = 0
    
    # Visibility
    published: bool = False
    is_visible: bool = True
    
    # Timestamps
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


# ============================================
# SUBMISSION MODELS
# ============================================

class TrackAnswers(BaseModel):
    """Answers for a single track"""
    track_id: str
    track_type: Literal["listening", "reading", "writing"]
    status: Literal["not_started", "in_progress", "completed"] = "not_started"
    
    # Answer data
    answers: Dict[str, Any] = Field(default_factory=dict, description="Question ID to answer mapping")
    
    # Metadata
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    # Timing
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    time_spent: int = 0
    
    # Scoring
    score_auto: Optional[int] = None
    score_manual: Optional[int] = None
    total_questions: int = 0


class SubmissionCreate(BaseModel):
    """Data to create a new submission"""
    exam_id: str
    user_id: str
    user_email: str
    user_name: str


class SubmissionAutosave(BaseModel):
    """Data for autosaving an answer"""
    track_id: str
    question_id: str
    answer: Any
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class Submission(BaseModel):
    """Complete submission for an exam"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    exam_id: str
    user_id: str
    user_email: str
    user_name: str
    
    status: Literal["in_progress", "completed", "reviewed"] = "in_progress"
    
    # Track-level data
    tracks: List[TrackAnswers] = Field(default_factory=list)
    
    # Current track being worked on
    current_track_index: int = 0
    
    # Combined scoring
    final_score: Optional[int] = None
    total_questions: int = 0
    percentage: Optional[float] = None
    is_published: bool = False
    
    # Timestamps
    submitted_at: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


# ============================================
# RESPONSE MODELS
# ============================================

class TrackListResponse(BaseModel):
    """Response for track list endpoint"""
    tracks: List[Track]
    total: int
    page: int
    page_size: int


class ExamStartResponse(BaseModel):
    """Response when starting an exam"""
    submission_id: str
    exam: Exam
    first_track: Track
    settings: ExamSettings


class NextTrackResponse(BaseModel):
    """Response for next track request"""
    has_next: bool
    waiting_required: bool
    wait_seconds: int
    next_track: Optional[Track] = None
    progress: Dict[str, Any]


class ValidationResponse(BaseModel):
    """Response for validation requests"""
    is_valid: bool
    errors: List[str]
    warnings: List[str] = Field(default_factory=list)
