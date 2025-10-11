# 🏗️ DETAILED IMPLEMENTATION SPECIFICATION
## AI-Assisted Track Import System + Mock Test System

---

# TABLE OF CONTENTS

1. [System Architecture](#system-architecture)
2. [Database Structure](#database-structure)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [AI Extraction Prompts](#ai-extraction-prompts)
6. [Implementation Phases](#implementation-phases)
7. [Testing Procedures](#testing-procedures)
8. [Deployment Guide](#deployment-guide)

---

# SYSTEM ARCHITECTURE

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Student    │  │    Admin     │  │  AI Import   │          │
│  │  Dashboard   │  │    Panel     │  │  Interface   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                 │                   │                   │
└─────────┼─────────────────┼───────────────────┼──────────────────┘
          │                 │                   │
          ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      REACT FRONTEND                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │  Services  │  │ Components │  │  Contexts  │                │
│  └────────────┘  └────────────┘  └────────────┘                │
└─────────────────────────────────────────────────────────────────┘
                            │
                    API Calls (Axios)
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FASTAPI BACKEND (Python)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  server.py (Main Router)                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│  │   Track    │  │  Mock Test │  │ AI Import  │              │
│  │  Service   │  │  Service   │  │  Service   │              │
│  └────────────┘  └────────────┘  └────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                            │
                    MongoDB Driver
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MONGODB DATABASE                            │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────┐        │
│  │  exams  │ │sections │ │questions │ │ submissions  │        │
│  └─────────┘ └─────────┘ └──────────┘ └──────────────┘        │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐                         │
│  │ tracks  │ │mock_tests│ │ students │                         │
│  └─────────┘ └──────────┘ └──────────┘                         │
└─────────────────────────────────────────────────────────────────┘
                            │
                   Static File Storage
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FILE SYSTEM                                     │
│  /app/listening_tracks/  (Audio files for listening tests)     │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18+
- **Routing**: React Router v6
- **State Management**: React Context API + useState/useEffect
- **HTTP Client**: Axios
- **UI Components**: Custom components with Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite/Create React App

### Backend
- **Framework**: FastAPI (Python 3.9+)
- **Database**: MongoDB (Motor async driver)
- **Validation**: Pydantic models
- **File Upload**: FastAPI UploadFile
- **CORS**: FastAPI CORS middleware
- **Authentication**: JWT tokens + session management

### Database
- **Type**: MongoDB (NoSQL document database)
- **Collections**: exams, sections, questions, submissions, students, tracks, mock_tests, mock_sessions
- **Indexes**: Optimized for queries

### External Dependencies
- **Audio Storage**: Local filesystem or external CDN
- **AI Tools**: ChatGPT, Claude, or Gemini (user's account)

---

# DATABASE STRUCTURE

## Collection Schemas

### 1. `tracks` Collection

**Purpose**: Store reusable test tracks that can be used individually or in mock tests

```javascript
{
  "_id": "track-uuid-here",                    // Primary key (UUID)
  "track_type": "listening",                   // "listening" | "reading" | "writing"
  "title": "IELTS Listening Practice Test 2",
  "description": "Complete IELTS Listening test with 4 sections and 40 questions",
  "exam_id": "ielts-listening-practice-test-2", // Link to exams collection
  "created_by": "admin@example.com",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "status": "published",                       // "draft" | "published" | "archived"
  "version": 1,                                // Version number for tracking changes
  "metadata": {
    "question_count": 40,
    "duration_seconds": 2004,
    "has_audio": true,
    "audio_url": "https://audio.host.com/file.mp3",
    "sections_count": 4,
    "total_submissions": 0,
    "average_score": null
  },
  "tags": ["official", "academic", "2024"],   // Optional tags for organization
  "source": "ai_import"                        // "ai_import" | "manual" | "converted"
}
```

**Indexes**:
```javascript
db.tracks.createIndex({ track_type: 1, status: 1 });
db.tracks.createIndex({ created_by: 1 });
db.tracks.createIndex({ exam_id: 1 });
db.tracks.createIndex({ "metadata.question_count": 1 });
```

---

### 2. `mock_tests` Collection

**Purpose**: Store mock test configurations (combination of 3 tracks)

```javascript
{
  "_id": "mock-test-uuid",                     // Primary key (UUID)
  "title": "Full IELTS Mock Test 1",
  "description": "Complete mock test with Listening, Reading, and Writing",
  "listening_track_id": "track-listening-uuid",
  "reading_track_id": "track-reading-uuid",
  "writing_track_id": "track-writing-uuid",
  "review_time_seconds": 120,                  // 2 minutes between tests
  "total_duration_seconds": 8808,              // Sum of all tests + 2 review periods
  "test_order": ["listening", "reading", "writing"], // Fixed or configurable
  "published": true,
  "is_active": false,                          // Admin control (start/stop)
  "started_at": null,
  "stopped_at": null,
  "created_at": "2024-01-15T10:30:00Z",
  "created_by": "admin@example.com",
  "submission_count": 0,
  "metadata": {
    "total_questions": 82,                     // 40 + 40 + 2
    "listening_duration": 2004,
    "reading_duration": 3600,
    "writing_duration": 3600,
    "has_review_periods": true
  },
  "settings": {
    "allow_pause": false,
    "allow_skip": false,
    "show_timer": true,
    "auto_progress": true                      // Auto-move to next test when time expires
  }
}
```

**Indexes**:
```javascript
db.mock_tests.createIndex({ published: 1, is_active: 1 });
db.mock_tests.createIndex({ created_by: 1 });
db.mock_tests.createIndex({ listening_track_id: 1 });
db.mock_tests.createIndex({ reading_track_id: 1 });
db.mock_tests.createIndex({ writing_track_id: 1 });
```

---

### 3. `mock_sessions` Collection

**Purpose**: Track student progress through mock test stages

```javascript
{
  "_id": "session-uuid",
  "mock_test_id": "mock-test-uuid",
  "student_id": "student-uuid",
  "student_email": "student@example.com",
  "current_stage": "listening",                // "listening" | "review1" | "reading" | "review2" | "writing" | "complete"
  "stage_start_time": "2024-01-15T10:00:00Z",
  "stage_end_time": "2024-01-15T10:33:24Z",   // Calculated based on duration
  "stages_completed": ["listening"],
  "stages_remaining": ["review1", "reading", "review2", "writing"],
  "submissions": {
    "listening_submission_id": "sub-uuid-1",
    "reading_submission_id": null,             // Not yet submitted
    "writing_submission_id": null
  },
  "started_at": "2024-01-15T10:00:00Z",
  "completed_at": null,
  "status": "in_progress",                     // "in_progress" | "completed" | "abandoned"
  "metadata": {
    "listening_exam_id": "exam-uuid-1",
    "reading_exam_id": "exam-uuid-2",
    "writing_exam_id": "exam-uuid-3",
    "review_time_seconds": 120
  }
}
```

**Indexes**:
```javascript
db.mock_sessions.createIndex({ mock_test_id: 1, student_id: 1 });
db.mock_sessions.createIndex({ student_id: 1, status: 1 });
db.mock_sessions.createIndex({ current_stage: 1 });
```

---

### 4. Updated `submissions` Collection

**Purpose**: Store test submissions (linked to mock test if applicable)

```javascript
{
  "_id": "submission-uuid",
  "exam_id": "exam-uuid",
  "student_id": "student-uuid",                // null for anonymous
  "mock_test_id": "mock-test-uuid",            // NEW: Link to mock test (null for individual)
  "mock_session_id": "session-uuid",           // NEW: Link to session (null for individual)
  "test_type": "listening",                    // NEW: Which test in mock (null for individual)
  "answers": {
    "1": "answer1",
    "2": "answer2",
    // ... all answers
  },
  "score": 35,
  "total_questions": 40,
  "correct_answers": 35,
  "is_published": false,                       // Admin control
  "published_at": null,
  "submitted_at": "2024-01-15T10:33:24Z",
  "graded_at": null,
  "graded_by": null,
  "question_marks": {                          // For interactive scoring
    "1": "correct",
    "2": "incorrect",
    // ...
  }
}
```

---

### 5. Existing Collections (No Changes)

#### `exams` Collection
```javascript
{
  "_id": "exam-uuid",
  "title": "IELTS Listening Practice Test 2",
  "description": "Complete IELTS Listening test",
  "exam_type": "listening",                    // "listening" | "reading" | "writing"
  "audio_url": "https://audio.host.com/file.mp3",
  "audio_source_method": "url",                // "url" | "upload"
  "loop_audio": false,
  "duration_seconds": 2004,
  "published": true,
  "is_active": false,
  "started_at": null,
  "stopped_at": null,
  "question_count": 40,
  "submission_count": 0,
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### `sections` Collection
```javascript
{
  "_id": "section-uuid",
  "exam_id": "exam-uuid",
  "index": 1,                                  // Section number (1-4 for listening)
  "title": "Section 1",
  "instructions": "Complete the notes below...",
  "passage_text": null                         // Only for reading tests
}
```

#### `questions` Collection
```javascript
{
  "_id": "question-uuid",
  "section_id": "section-uuid",
  "index": 1,                                  // Global question number (1-40)
  "type": "short_answer",                      // Question type
  "payload": {
    "prompt": "Question text",
    "answer_key": "correct answer",
    "max_words": 2,
    "options": null,
    "image_url": null
  }
}
```

#### `students` Collection
```javascript
{
  "_id": "student-uuid",
  "email": "student@example.com",
  "full_name": "Student Name",
  "profile_picture": "url",
  "phone": "+1234567890",
  "institution": "University Name",
  "department": "Computer Science",
  "roll_number": "CS2024001",
  "created_at": "2024-01-15T10:30:00Z",
  "profile_completed": true
}
```

---

# BACKEND IMPLEMENTATION

## Project Structure

```
/app/backend/
├── server.py                 # Main FastAPI application
├── track_service.py          # NEW: Track management service
├── ai_import_service.py      # NEW: AI import validation and creation
├── mock_test_service.py      # NEW: Mock test management
├── mock_session_service.py   # NEW: Mock test session handling
├── auth_service.py           # Existing: Authentication
├── init_ielts_test.py        # Existing: Initialize default tests
├── init_reading_test.py
├── init_writing_test.py
└── requirements.txt
```

---

## 1. AI Import Service (`ai_import_service.py`)

**File**: `/app/backend/ai_import_service.py`

```python
"""
AI Import Service
Handles validation and creation of tracks from AI-extracted JSON
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, validator, Field
from typing import List, Optional, Literal, Dict, Any
import uuid
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()

# ============================================
# PYDANTIC MODELS
# ============================================

class QuestionImportPayload(BaseModel):
    """Question payload that varies by type"""
    prompt: str
    answer_key: Optional[str] = None
    max_words: Optional[int] = None
    min_words: Optional[int] = None
    options: Optional[List[str]] = None
    image_url: Optional[str] = None
    wordlist: Optional[List[str]] = None
    task_number: Optional[int] = None
    chart_image: Optional[str] = None
    instructions: Optional[str] = None


class QuestionImport(BaseModel):
    """Individual question in the import"""
    index: int = Field(..., ge=1, description="Question number (1-40 for L/R, 1-2 for W)")
    type: Literal[
        "short_answer",
        "multiple_choice",
        "map_labeling",
        "diagram_labeling",
        "true_false_not_given",
        "matching_paragraphs",
        "sentence_completion",
        "sentence_completion_wordlist",
        "short_answer_reading",
        "writing_task"
    ]
    prompt: str = Field(..., min_length=1, description="Question text")
    answer_key: Optional[str] = Field(None, description="Correct answer (null for writing)")
    max_words: Optional[int] = Field(None, ge=1, le=10, description="Max words allowed")
    min_words: Optional[int] = Field(None, ge=50, le=500, description="Min words required (writing)")
    options: Optional[List[str]] = Field(None, description="Multiple choice options")
    image_url: Optional[str] = Field(None, description="URL for map/diagram images")
    wordlist: Optional[List[str]] = Field(None, description="Word list for completion")
    task_number: Optional[int] = Field(None, ge=1, le=2, description="Writing task number")
    chart_image: Optional[str] = Field(None, description="Chart image for writing task 1")

    @validator('answer_key')
    def validate_answer_key(cls, v, values):
        """Answer key required for all types except writing_task"""
        q_type = values.get('type')
        if q_type == 'writing_task':
            return None  # Writing tasks don't have answer keys
        if not v:
            raise ValueError(f"answer_key is required for question type '{q_type}'")
        return v

    @validator('options')
    def validate_options(cls, v, values):
        """Validate options for question types that need them"""
        q_type = values.get('type')
        if q_type in ['multiple_choice', 'map_labeling', 'true_false_not_given']:
            if not v or len(v) < 2:
                raise ValueError(f"{q_type} requires at least 2 options")
        return v

    @validator('min_words')
    def validate_min_words(cls, v, values):
        """Min words required for writing tasks"""
        q_type = values.get('type')
        if q_type == 'writing_task' and not v:
            raise ValueError("writing_task requires min_words field")
        return v


class SectionImport(BaseModel):
    """Section with questions"""
    index: int = Field(..., ge=1, le=4, description="Section number")
    title: str = Field(..., min_length=1, description="Section title")
    instructions: str = Field(..., min_length=1, description="Section instructions")
    passage_text: Optional[str] = Field(None, description="Full passage text (reading only)")
    questions: List[QuestionImport] = Field(..., min_items=1, description="Questions in section")

    @validator('questions')
    def validate_questions_sequential(cls, v):
        """Ensure question indices are sequential"""
        if not v:
            raise ValueError("Section must have at least one question")
        indices = [q.index for q in v]
        # Check if indices are unique
        if len(indices) != len(set(indices)):
            raise ValueError("Duplicate question indices found in section")
        return v


class AIImportRequest(BaseModel):
    """Complete import request from AI"""
    test_type: Literal["listening", "reading", "writing"]
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10, max_length=1000)
    duration_seconds: int = Field(..., ge=60, le=7200, description="Test duration (1 min - 2 hours)")
    audio_url: Optional[str] = Field(None, description="Audio URL (required for listening)")
    sections: List[SectionImport] = Field(..., min_items=1, description="Test sections")

    @validator('sections')
    def validate_sections_by_type(cls, v, values):
        """Validate section count and question count by test type"""
        test_type = values.get('test_type')
        if not v:
            raise ValueError("Must have at least one section")
        
        # Validate section count
        section_count_rules = {
            "listening": 4,
            "reading": 3,
            "writing": 2
        }
        expected_sections = section_count_rules.get(test_type)
        if len(v) != expected_sections:
            raise ValueError(
                f"{test_type.title()} test must have exactly {expected_sections} sections "
                f"(found {len(v)})"
            )
        
        # Validate total question count
        total_questions = sum(len(section.questions) for section in v)
        question_count_rules = {
            "listening": 40,
            "reading": 40,
            "writing": 2
        }
        expected_questions = question_count_rules.get(test_type)
        if total_questions != expected_questions:
            raise ValueError(
                f"{test_type.title()} test must have exactly {expected_questions} questions "
                f"(found {total_questions})"
            )
        
        # Validate question indices are globally sequential (1 to N)
        all_indices = []
        for section in v:
            all_indices.extend([q.index for q in section.questions])
        all_indices.sort()
        expected_indices = list(range(1, len(all_indices) + 1))
        if all_indices != expected_indices:
            raise ValueError(
                f"Question indices must be sequential from 1 to {len(all_indices)}. "
                f"Found: {all_indices}"
            )
        
        # Validate reading tests have passage_text
        if test_type == "reading":
            for i, section in enumerate(v, 1):
                if not section.passage_text or len(section.passage_text) < 100:
                    raise ValueError(
                        f"Reading test Section {i} must have passage_text "
                        f"(at least 100 characters)"
                    )
        
        return v

    @validator('audio_url')
    def validate_audio_url_for_listening(cls, v, values):
        """Audio URL required for listening tests"""
        test_type = values.get('test_type')
        if test_type == "listening" and not v:
            raise ValueError("Listening test requires audio_url")
        if test_type in ["reading", "writing"] and v:
            raise ValueError(f"{test_type.title()} test should not have audio_url")
        return v

    @validator('duration_seconds')
    def validate_duration_by_type(cls, v, values):
        """Validate duration is reasonable for test type"""
        test_type = values.get('test_type')
        duration_rules = {
            "listening": (1500, 2400),   # 25-40 minutes
            "reading": (3000, 4200),     # 50-70 minutes
            "writing": (3000, 4200)      # 50-70 minutes
        }
        if test_type in duration_rules:
            min_dur, max_dur = duration_rules[test_type]
            if not (min_dur <= v <= max_dur):
                raise ValueError(
                    f"{test_type.title()} test duration should be between "
                    f"{min_dur//60}-{max_dur//60} minutes (got {v//60} minutes)"
                )
        return v


class TrackCreateResponse(BaseModel):
    """Response after successful track creation"""
    success: bool
    track_id: str
    exam_id: str
    questions_created: int
    sections_created: int
    message: str


class ValidationResponse(BaseModel):
    """Response for validation-only request"""
    valid: bool
    test_type: Optional[str] = None
    title: Optional[str] = None
    total_questions: Optional[int] = None
    total_sections: Optional[int] = None
    duration_minutes: Optional[int] = None
    has_audio: Optional[bool] = None
    section_breakdown: Optional[List[Dict[str, Any]]] = None
    errors: Optional[List[str]] = None


# ============================================
# HELPER FUNCTIONS
# ============================================

def get_database() -> AsyncIOMotorDatabase:
    """Get database instance from server.py"""
    from server import get_db
    return get_db()


async def create_exam_from_import(
    db: AsyncIOMotorDatabase,
    import_data: AIImportRequest
) -> str:
    """Create exam document in database"""
    exam_id = f"ielts-{import_data.test_type}-{uuid.uuid4().hex[:8]}"
    
    exam_data = {
        "_id": exam_id,
        "title": import_data.title,
        "description": import_data.description,
        "exam_type": import_data.test_type,
        "audio_url": import_data.audio_url,
        "audio_source_method": "url" if import_data.audio_url else None,
        "loop_audio": False,
        "duration_seconds": import_data.duration_seconds,
        "published": True,
        "is_active": False,
        "started_at": None,
        "stopped_at": None,
        "question_count": sum(len(s.questions) for s in import_data.sections),
        "submission_count": 0,
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    
    await db.exams.replace_one({"_id": exam_id}, exam_data, upsert=True)
    return exam_id


async def create_sections_from_import(
    db: AsyncIOMotorDatabase,
    exam_id: str,
    sections: List[SectionImport]
) -> List[str]:
    """Create section documents in database"""
    section_ids = []
    
    for section in sections:
        section_id = f"{exam_id}-section-{section.index}"
        section_data = {
            "_id": section_id,
            "exam_id": exam_id,
            "index": section.index,
            "title": section.title,
            "instructions": section.instructions
        }
        
        # Add passage_text for reading tests
        if section.passage_text:
            section_data["passage_text"] = section.passage_text
        
        await db.sections.replace_one({"_id": section_id}, section_data, upsert=True)
        section_ids.append(section_id)
    
    return section_ids


async def create_questions_from_import(
    db: AsyncIOMotorDatabase,
    exam_id: str,
    sections: List[SectionImport]
) -> int:
    """Create question documents in database"""
    questions_created = 0
    
    for section in sections:
        section_id = f"{exam_id}-section-{section.index}"
        
        for question in section.questions:
            question_id = f"{exam_id}-q{question.index}"
            
            # Build payload
            payload = {
                "prompt": question.prompt,
                "answer_key": question.answer_key
            }
            
            # Add optional fields if present
            if question.max_words is not None:
                payload["max_words"] = question.max_words
            if question.min_words is not None:
                payload["min_words"] = question.min_words
            if question.options:
                payload["options"] = question.options
            if question.image_url:
                payload["image_url"] = question.image_url
            if question.wordlist:
                payload["wordlist"] = question.wordlist
            if question.task_number is not None:
                payload["task_number"] = question.task_number
            if question.chart_image:
                payload["chart_image"] = question.chart_image
            
            question_data = {
                "_id": question_id,
                "section_id": section_id,
                "index": question.index,
                "type": question.type,
                "payload": payload
            }
            
            await db.questions.replace_one(
                {"_id": question_id},
                question_data,
                upsert=True
            )
            questions_created += 1
    
    return questions_created


async def create_track_record(
    db: AsyncIOMotorDatabase,
    import_data: AIImportRequest,
    exam_id: str,
    admin_email: str = "admin@example.com"
) -> str:
    """Create track document in database"""
    track_id = str(uuid.uuid4())
    
    track_data = {
        "_id": track_id,
        "track_type": import_data.test_type,
        "title": import_data.title,
        "description": import_data.description,
        "exam_id": exam_id,
        "created_by": admin_email,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "updated_at": datetime.utcnow().isoformat() + "Z",
        "status": "published",
        "version": 1,
        "metadata": {
            "question_count": sum(len(s.questions) for s in import_data.sections),
            "duration_seconds": import_data.duration_seconds,
            "has_audio": import_data.audio_url is not None,
            "audio_url": import_data.audio_url,
            "sections_count": len(import_data.sections),
            "total_submissions": 0,
            "average_score": None
        },
        "tags": [],
        "source": "ai_import"
    }
    
    await db.tracks.replace_one({"_id": track_id}, track_data, upsert=True)
    return track_id


# ============================================
# API ENDPOINTS
# ============================================

@router.post("/api/tracks/validate-import", response_model=ValidationResponse)
async def validate_import(import_data: AIImportRequest):
    """
    Validate AI-generated JSON without creating anything
    
    Returns validation summary with section breakdown
    """
    try:
        # If we get here, Pydantic validation passed
        
        # Build section breakdown
        section_breakdown = []
        for section in import_data.sections:
            # Count question types
            question_types = {}
            for q in section.questions:
                question_types[q.type] = question_types.get(q.type, 0) + 1
            
            section_breakdown.append({
                "section_number": section.index,
                "title": section.title,
                "question_count": len(section.questions),
                "question_types": question_types,
                "has_passage": section.passage_text is not None and len(section.passage_text) > 0
            })
        
        return ValidationResponse(
            valid=True,
            test_type=import_data.test_type,
            title=import_data.title,
            total_questions=sum(len(s.questions) for s in import_data.sections),
            total_sections=len(import_data.sections),
            duration_minutes=import_data.duration_seconds // 60,
            has_audio=import_data.audio_url is not None,
            section_breakdown=section_breakdown
        )
        
    except Exception as e:
        # Return validation errors
        error_message = str(e)
        if hasattr(e, 'errors'):
            # Pydantic validation errors
            errors = [f"{err['loc'][-1]}: {err['msg']}" for err in e.errors()]
        else:
            errors = [error_message]
        
        return ValidationResponse(
            valid=False,
            errors=errors
        )


@router.post("/api/tracks/import-from-ai", response_model=TrackCreateResponse)
async def import_track_from_ai(
    import_data: AIImportRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Create track from AI-generated JSON
    
    Steps:
    1. Validate JSON structure (Pydantic)
    2. Create exam document
    3. Create section documents
    4. Create question documents
    5. Create track record
    6. Return success response
    """
    try:
        # Step 1: Create exam
        exam_id = await create_exam_from_import(db, import_data)
        
        # Step 2: Create sections
        section_ids = await create_sections_from_import(db, exam_id, import_data.sections)
        
        # Step 3: Create questions
        questions_created = await create_questions_from_import(db, exam_id, import_data.sections)
        
        # Step 4: Create track record
        track_id = await create_track_record(db, import_data, exam_id)
        
        # Step 5: Return success
        return TrackCreateResponse(
            success=True,
            track_id=track_id,
            exam_id=exam_id,
            questions_created=questions_created,
            sections_created=len(section_ids),
            message=f"Track '{import_data.title}' created successfully with {questions_created} questions"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create track: {str(e)}"
        )


@router.post("/api/tracks/from-exam/{exam_id}")
async def convert_exam_to_track(
    exam_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Convert existing exam to track
    
    Useful for converting the 3 existing tests to tracks
    """
    try:
        # Get exam
        exam = await db.exams.find_one({"_id": exam_id})
        if not exam:
            raise HTTPException(status_code=404, detail="Exam not found")
        
        # Check if track already exists for this exam
        existing_track = await db.tracks.find_one({"exam_id": exam_id})
        if existing_track:
            return {
                "success": True,
                "track_id": existing_track["_id"],
                "message": "Track already exists for this exam"
            }
        
        # Create track
        track_id = str(uuid.uuid4())
        track_data = {
            "_id": track_id,
            "track_type": exam.get("exam_type", "listening"),
            "title": exam["title"],
            "description": exam["description"],
            "exam_id": exam_id,
            "created_by": "admin@example.com",
            "created_at": datetime.utcnow().isoformat() + "Z",
            "updated_at": datetime.utcnow().isoformat() + "Z",
            "status": "published",
            "version": 1,
            "metadata": {
                "question_count": exam.get("question_count", 0),
                "duration_seconds": exam.get("duration_seconds", 0),
                "has_audio": exam.get("audio_url") is not None,
                "audio_url": exam.get("audio_url"),
                "sections_count": await db.sections.count_documents({"exam_id": exam_id}),
                "total_submissions": exam.get("submission_count", 0),
                "average_score": None
            },
            "tags": ["official"],
            "source": "converted"
        }
        
        await db.tracks.replace_one({"_id": track_id}, track_data, upsert=True)
        
        return {
            "success": True,
            "track_id": track_id,
            "exam_id": exam_id,
            "message": f"Exam '{exam['title']}' converted to track successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Export router
def get_router():
    return router
```

---

## 2. Track Service (`track_service.py`)

**File**: `/app/backend/track_service.py`

```python
"""
Track Management Service
CRUD operations for tracks
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()

# ============================================
# PYDANTIC MODELS
# ============================================

class TrackResponse(BaseModel):
    """Track response model"""
    id: str
    track_type: str
    title: str
    description: str
    exam_id: str
    status: str
    created_at: str
    metadata: dict


class TrackUpdateRequest(BaseModel):
    """Update track fields"""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[Literal["draft", "published", "archived"]] = None
    tags: Optional[List[str]] = None


# ============================================
# API ENDPOINTS
# ============================================

def get_database():
    from server import get_db
    return get_db()


@router.get("/api/tracks")
async def get_all_tracks(
    track_type: Optional[str] = Query(None, regex="^(listening|reading|writing)$"),
    status: Optional[str] = Query(None, regex="^(draft|published|archived)$"),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get all tracks with optional filtering
    
    Query params:
    - track_type: Filter by listening/reading/writing
    - status: Filter by draft/published/archived
    """
    try:
        # Build query
        query = {}
        if track_type:
            query["track_type"] = track_type
        if status:
            query["status"] = status
        
        # Get tracks
        cursor = db.tracks.find(query).sort("created_at", -1)
        tracks = await cursor.to_list(length=100)
        
        # Format response
        return [
            {
                "id": track["_id"],
                "track_type": track["track_type"],
                "title": track["title"],
                "description": track["description"],
                "exam_id": track["exam_id"],
                "status": track["status"],
                "created_at": track["created_at"],
                "created_by": track.get("created_by"),
                "metadata": track.get("metadata", {})
            }
            for track in tracks
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/tracks/{track_id}")
async def get_track(
    track_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get single track with full details"""
    try:
        track = await db.tracks.find_one({"_id": track_id})
        if not track:
            raise HTTPException(status_code=404, detail="Track not found")
        
        # Get associated exam details
        exam = await db.exams.find_one({"_id": track["exam_id"]})
        
        return {
            "id": track["_id"],
            "track_type": track["track_type"],
            "title": track["title"],
            "description": track["description"],
            "exam_id": track["exam_id"],
            "status": track["status"],
            "created_at": track["created_at"],
            "updated_at": track.get("updated_at"),
            "created_by": track.get("created_by"),
            "metadata": track.get("metadata", {}),
            "tags": track.get("tags", []),
            "exam_details": {
                "published": exam.get("published") if exam else False,
                "is_active": exam.get("is_active") if exam else False,
                "submission_count": exam.get("submission_count") if exam else 0
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/api/tracks/{track_id}")
async def update_track(
    track_id: str,
    update_data: TrackUpdateRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update track metadata"""
    try:
        track = await db.tracks.find_one({"_id": track_id})
        if not track:
            raise HTTPException(status_code=404, detail="Track not found")
        
        # Build update
        update_fields = {"updated_at": datetime.utcnow().isoformat() + "Z"}
        
        if update_data.title:
            update_fields["title"] = update_data.title
        if update_data.description:
            update_fields["description"] = update_data.description
        if update_data.status:
            update_fields["status"] = update_data.status
        if update_data.tags is not None:
            update_fields["tags"] = update_data.tags
        
        # Update track
        await db.tracks.update_one(
            {"_id": track_id},
            {"$set": update_fields}
        )
        
        # Also update exam title/description if changed
        if update_data.title or update_data.description:
            exam_update = {}
            if update_data.title:
                exam_update["title"] = update_data.title
            if update_data.description:
                exam_update["description"] = update_data.description
            
            await db.exams.update_one(
                {"_id": track["exam_id"]},
                {"$set": exam_update}
            )
        
        return {
            "success": True,
            "message": "Track updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/api/tracks/{track_id}")
async def delete_track(
    track_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Delete track (soft delete - archive it)
    
    Does not delete underlying exam/sections/questions
    """
    try:
        track = await db.tracks.find_one({"_id": track_id})
        if not track:
            raise HTTPException(status_code=404, detail="Track not found")
        
        # Check if track is used in any mock tests
        mock_test_count = await db.mock_tests.count_documents({
            "$or": [
                {"listening_track_id": track_id},
                {"reading_track_id": track_id},
                {"writing_track_id": track_id}
            ]
        })
        
        if mock_test_count > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete track: used in {mock_test_count} mock test(s)"
            )
        
        # Soft delete (archive)
        await db.tracks.update_one(
            {"_id": track_id},
            {"$set": {
                "status": "archived",
                "updated_at": datetime.utcnow().isoformat() + "Z"
            }}
        )
        
        return {
            "success": True,
            "message": "Track archived successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Export router
def get_router():
    return router
```

---

## 3. Integration in `server.py`

**File**: `/app/backend/server.py` (additions)

```python
# Add these imports at the top
from ai_import_service import get_router as get_ai_import_router
from track_service import get_router as get_track_router
# from mock_test_service import get_router as get_mock_test_router  # Phase 3
# from mock_session_service import get_router as get_mock_session_router  # Phase 4

# Include routers (add after existing routers)
app.include_router(get_ai_import_router())
app.include_router(get_track_router())
# app.include_router(get_mock_test_router())  # Phase 3
# app.include_router(get_mock_session_router())  # Phase 4

# Add startup event to create indexes
@app.on_event("startup")
async def create_indexes():
    """Create database indexes for performance"""
    # Tracks indexes
    await tracks_collection.create_index([("track_type", 1), ("status", 1)])
    await tracks_collection.create_index([("created_by", 1)])
    await tracks_collection.create_index([("exam_id", 1)])
    
    # Mock tests indexes (Phase 3)
    # await mock_tests_collection.create_index([("published", 1), ("is_active", 1)])
    
    logger.info("Database indexes created")
```

---

# FRONTEND IMPLEMENTATION

## Project Structure

```
/app/frontend/src/
├── components/
│   ├── admin/
│   │   ├── TestManagement.jsx         # Existing
│   │   ├── TrackLibrary.jsx           # NEW: Track list/management
│   │   ├── AIImport.jsx               # NEW: AI import interface
│   │   ├── TrackEditor.jsx            # NEW: Edit track details
│   │   ├── MockTestBuilder.jsx        # NEW (Phase 3)
│   │   └── MockTestManagement.jsx     # NEW (Phase 3)
│   ├── student/
│   │   ├── StudentDashboard.jsx       # Existing
│   │   └── MockTestInterface.jsx      # NEW (Phase 4)
│   ├── ListeningTest.jsx              # Existing
│   ├── ReadingTest.jsx                # Existing
│   └── WritingTest.jsx                # Existing
├── services/
│   ├── BackendService.js              # Existing - add new methods
│   └── TrackService.js                # NEW: Track API calls
└── contexts/
    └── AdminAuthContext.jsx           # Existing
```

---

## 1. AIImport Component (`AIImport.jsx`)

**File**: `/app/frontend/src/components/admin/AIImport.jsx`

```jsx
import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, Eye, AlertCircle, Copy, Download } from 'lucide-react';
import { BackendService } from '../../services/BackendService';
import { useToast } from '../common/Toast';
import { useNavigate } from 'react-router-dom';

export function AIImport() {
  const [jsonInput, setJsonInput] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Handle JSON validation
  const handleValidate = async () => {
    if (!jsonInput.trim()) {
      showToast('Please paste JSON data', 'error');
      return;
    }

    setIsValidating(true);
    setValidationResult(null);
    setPreviewData(null);

    try {
      // Parse JSON first
      const jsonData = JSON.parse(jsonInput);
      
      // Call backend validation endpoint
      const result = await BackendService.validateAIImport(jsonData);
      
      setValidationResult(result);
      
      if (result.valid) {
        setPreviewData(jsonData);
        showToast('✅ JSON validated successfully!', 'success');
      } else {
        showToast('❌ Validation errors found', 'error');
      }
    } catch (error) {
      if (error.message.includes('JSON')) {
        setValidationResult({
          valid: false,
          errors: ['Invalid JSON format. Please check your syntax.']
        });
      } else {
        setValidationResult({
          valid: false,
          errors: [error.message || 'Validation failed']
        });
      }
      showToast('Validation failed', 'error');
    } finally {
      setIsValidating(false);
    }
  };

  // Handle track creation
  const handleCreateTrack = async () => {
    if (!validationResult?.valid) {
      showToast('Please validate JSON first', 'error');
      return;
    }

    setIsCreating(true);
    try {
      const jsonData = JSON.parse(jsonInput);
      const result = await BackendService.createTrackFromAI(jsonData);
      
      showToast(
        `🎉 Track created successfully! ${result.questions_created} questions added.`,
        'success'
      );
      
      // Reset form
      setJsonInput('');
      setValidationResult(null);
      setPreviewData(null);
      
      // Navigate to track library
      setTimeout(() => {
        navigate('/admin/tracks');
      }, 2000);
      
    } catch (error) {
      showToast(error.message || 'Failed to create track', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Upload className="w-8 h-8 text-blue-600" />
            Import Questions from AI
          </h2>
          <p className="text-gray-600">
            Extract questions from PDF using AI tools, then paste the JSON here to create a track.
          </p>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-lg">
          <h3 className="font-semibold mb-3 text-lg text-blue-900">📋 How to Use:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-2">
            <li className="pl-2">Copy your PDF text content</li>
            <li className="pl-2">Use <strong>ChatGPT</strong>, <strong>Claude</strong>, or <strong>Gemini</strong> with our extraction prompt below</li>
            <li className="pl-2">Copy the <strong>JSON output</strong> from AI (only the JSON, no other text)</li>
            <li className="pl-2">Paste it in the textarea below and click <strong>Validate JSON</strong></li>
            <li className="pl-2">Review the preview and click <strong>Create Track</strong></li>
          </ol>
          
          <button
            onClick={() => setShowPrompts(!showPrompts)}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {showPrompts ? 'Hide' : 'View'} AI Prompts for Each Test Type
          </button>
        </div>

        {/* Prompts Section */}
        {showPrompts && (
          <div className="mb-6">
            <PromptTemplates />
          </div>
        )}

        {/* JSON Input */}
        <div className="mb-6">
          <label className="block font-semibold mb-2 text-lg">
            Paste AI-Generated JSON:
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full h-96 p-4 border-2 border-gray-300 rounded-lg font-mono text-sm focus:border-blue-500 focus:outline-none"
            placeholder={`{\n  "test_type": "listening",\n  "title": "IELTS Listening Test 2",\n  "description": "Complete test with 40 questions",\n  "duration_seconds": 2004,\n  "audio_url": "https://...",\n  "sections": [\n    ...\n  ]\n}`}
          />
          <p className="mt-2 text-sm text-gray-500">
            💡 <strong>Tip:</strong> Make sure to paste ONLY the JSON object (starting with <code>{'{'}</code> and ending with <code>{'}'}</code>)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleValidate}
            disabled={isValidating || !jsonInput.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
          >
            {isValidating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Validating...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Validate JSON
              </>
            )}
          </button>

          {validationResult?.valid && (
            <button
              onClick={() => setPreviewData(previewData ? null : JSON.parse(jsonInput))}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 font-medium transition-colors"
            >
              <Eye className="w-5 h-5" />
              {previewData ? 'Hide Preview' : 'Preview Questions'}
            </button>
          )}

          {jsonInput.trim() && (
            <button
              onClick={() => {
                setJsonInput('');
                setValidationResult(null);
                setPreviewData(null);
              }}
              className="px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Validation Result */}
        {validationResult && (
          <ValidationDisplay result={validationResult} />
        )}

        {/* Preview */}
        {previewData && validationResult?.valid && (
          <PreviewDisplay data={previewData} />
        )}

        {/* Create Button */}
        {validationResult?.valid && (
          <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-r-lg">
            <p className="mb-4 text-sm text-green-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <strong>JSON validated successfully. Ready to create track!</strong>
            </p>
            
            {previewData.test_type === 'listening' && !previewData.audio_url && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 inline mr-2 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Listening test requires an audio URL. Please add it to your JSON.
                </span>
              </div>
            )}
            
            <button
              onClick={handleCreateTrack}
              disabled={isCreating}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-lg transition-colors flex items-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Creating Track...
                </>
              ) : (
                <>
                  🚀 Create Track from JSON
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function ValidationDisplay({ result }) {
  if (result.valid) {
    return (
      <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg mb-6">
        <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2 text-lg">
          <CheckCircle className="w-6 h-6 text-green-600" />
          ✅ Validation Successful
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white p-3 rounded-lg border border-green-200">
            <p className="text-xs text-gray-600 mb-1">Test Type</p>
            <p className="font-bold text-gray-900">{result.test_type.toUpperCase()}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-green-200">
            <p className="text-xs text-gray-600 mb-1">Total Questions</p>
            <p className="font-bold text-gray-900">{result.total_questions}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-green-200">
            <p className="text-xs text-gray-600 mb-1">Sections</p>
            <p className="font-bold text-gray-900">{result.total_sections}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-green-200">
            <p className="text-xs text-gray-600 mb-1">Duration</p>
            <p className="font-bold text-gray-900">{result.duration_minutes} min</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-green-200">
            <p className="text-xs text-gray-600 mb-1">Audio</p>
            <p className="font-bold text-gray-900">{result.has_audio ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>
        
        <div className="mt-4 bg-white p-4 rounded-lg border border-green-200">
          <strong className="block mb-3 text-gray-900">Section Breakdown:</strong>
          <div className="space-y-2">
            {result.section_breakdown.map(section => (
              <div key={section.section_number} className="flex items-start gap-2 text-sm">
                <span className="font-semibold text-blue-600">Section {section.section_number}:</span>
                <div>
                  <p className="text-gray-800">{section.question_count} questions</p>
                  <p className="text-gray-600 text-xs">
                    {Object.entries(section.question_types).map(([type, count]) => 
                      `${count} ${type.replace(/_/g, ' ')}`
                    ).join(', ')}
                  </p>
                  {section.has_passage && (
                    <p className="text-green-600 text-xs">✓ Has passage text</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg mb-6">
        <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2 text-lg">
          <XCircle className="w-6 h-6 text-red-600" />
          ❌ Validation Errors
        </h3>
        <div className="bg-white p-4 rounded-lg border border-red-200">
          <p className="text-sm text-red-800 mb-3">Please fix the following issues:</p>
          <ul className="list-disc list-inside space-y-2 text-sm text-red-700">
            {result.errors.map((error, idx) => (
              <li key={idx} className="pl-2">{error}</li>
            ))}
          </ul>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          💡 <strong>Tip:</strong> Check your JSON format and ensure all required fields are present with correct values.
        </p>
      </div>
    );
  }
}

function PreviewDisplay({ data }) {
  return (
    <div className="p-6 bg-gray-50 border-2 border-gray-300 rounded-lg mb-6">
      <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
        <Eye className="w-6 h-6 text-blue-600" />
        👁️ Preview: {data.title}
      </h3>
      
      <div className="space-y-6">
        {data.sections.map(section => (
          <div key={section.index} className="bg-white p-4 rounded-lg border border-gray-300">
            <h4 className="font-bold text-lg mb-2 text-blue-900">
              📋 {section.title}
            </h4>
            <p className="text-sm text-gray-600 mb-3 italic">{section.instructions}</p>
            
            {section.passage_text && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                <strong className="block mb-1 text-blue-900">Passage Preview:</strong>
                <p className="text-gray-700">{section.passage_text.substring(0, 300)}...</p>
              </div>
            )}
            
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">
                Questions ({section.questions.length} total):
              </p>
              {section.questions.slice(0, 3).map(q => (
                <div key={q.index} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                  <p className="mb-1">
                    <strong>Q{q.index}.</strong> [{q.type.replace(/_/g, ' ')}]
                  </p>
                  <p className="text-gray-700 mb-2">{q.prompt}</p>
                  {q.options && (
                    <p className="text-xs text-gray-600 ml-4">
                      <strong>Options:</strong> {q.options.join(' | ')}
                    </p>
                  )}
                  {q.answer_key && (
                    <p className="text-xs text-green-700 ml-4 font-medium">
                      ✅ Answer: {q.answer_key}
                    </p>
                  )}
                </div>
              ))}
              {section.questions.length > 3 && (
                <p className="text-sm text-gray-500 ml-2 italic">
                  ... and {section.questions.length - 3} more questions
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PromptTemplates() {
  const [selectedType, setSelectedType] = useState('listening');
  const [copied, setCopied] = useState(false);
  
  const prompts = {
    listening: `You are an IELTS test parser. Extract questions from this IELTS Listening test and format as JSON.

Test Type: IELTS Listening
Sections: 4 sections, 40 questions total

For each question, identify:
- Question number (1-40)
- Section (1-4)
- Question type: "short_answer", "multiple_choice", "map_labeling", or "diagram_labeling"
- Prompt/question text (keep exactly as is, including any blank spaces like __________)
- Options (if multiple choice or labeling)
- Answer key (correct answer)
- Max words (if applicable, e.g., "TWO WORDS" = 2, "ONE WORD AND/OR A NUMBER" = 2)
- Image URL (if map/diagram, otherwise null)

Return ONLY valid JSON in this EXACT format (no additional text before or after):

{
  "test_type": "listening",
  "title": "IELTS Listening Practice Test X",
  "description": "Complete IELTS Listening test with 4 sections and 40 questions",
  "duration_seconds": 2004,
  "audio_url": "PASTE_AUDIO_URL_HERE_OR_NULL",
  "sections": [
    {
      "index": 1,
      "title": "Section 1",
      "instructions": "Complete the notes below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
      "questions": [
        {
          "index": 1,
          "type": "short_answer",
          "prompt": "Job enquiry at: __________ shop",
          "answer_key": "part-time",
          "max_words": 2,
          "options": null,
          "image_url": null
        },
        {
          "index": 4,
          "type": "multiple_choice",
          "prompt": "What is the hourly rate?",
          "answer_key": "C",
          "max_words": null,
          "options": ["A. £7.50", "B. £8.00", "C. £8.50"],
          "image_url": null
        },
        {
          "index": 11,
          "type": "map_labeling",
          "prompt": "Ferry Terminal",
          "answer_key": "A",
          "max_words": null,
          "options": ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
          "image_url": "https://example.com/map.jpg"
        },
        {
          "index": 31,
          "type": "diagram_labeling",
          "prompt": "The reactor core contains __________",
          "answer_key": "uranium",
          "max_words": 1,
          "options": null,
          "image_url": "https://example.com/diagram.jpg"
        }
      ]
    }
  ]
}

IMPORTANT:
- Extract ALL 40 questions across ALL 4 sections
- Keep question text exactly as written in PDF
- For short_answer questions, include the blank (__________)
- Answer keys must be exact (case-insensitive for text, exact letter for multiple choice)
- If there's a map or diagram, include image URL or set to null
- Audio URL can be added later if you don't have it

Now extract from this test:
[PASTE YOUR PDF TEXT HERE]`,
    
    reading: `You are an IELTS test parser. Extract questions from this IELTS Reading test and format as JSON.

Test Type: IELTS Academic Reading
Sections: 3 passages, 40 questions total

For each passage, extract:
- Passage number and title
- FULL passage text (all paragraphs, labeled A, B, C, etc. if applicable)
- Instructions
- All questions with correct types

Question Types:
- "true_false_not_given" - TRUE/FALSE/NOT GIVEN questions
- "matching_paragraphs" - Which paragraph contains information
- "sentence_completion" - Complete sentences with words from passage
- "sentence_completion_wordlist" - Complete from given word list
- "short_answer_reading" - Short answer questions

Return ONLY valid JSON in this EXACT format:

{
  "test_type": "reading",
  "title": "IELTS Reading Practice Test X",
  "description": "Complete IELTS Academic Reading test with 3 passages and 40 questions",
  "duration_seconds": 3600,
  "audio_url": null,
  "sections": [
    {
      "index": 1,
      "title": "Passage 1: The History of Chocolate",
      "passage_text": "A. The cocoa tree was first cultivated by the Maya, Toltec, and Aztec peoples, who prepared chocolate as a drink, flavored with vanilla and chili peppers...\n\nB. When the Spanish conquistadors arrived in Mexico in 1519...\n\n[FULL PASSAGE TEXT HERE - 800-1000 words]",
      "instructions": "Questions 1-13",
      "questions": [
        {
          "index": 1,
          "type": "matching_paragraphs",
          "prompt": "Which paragraph contains the following information? The early history of chocolate cultivation.",
          "answer_key": "A",
          "options": null,
          "wordlist": null
        },
        {
          "index": 6,
          "type": "sentence_completion",
          "prompt": "The cocoa tree was first cultivated in __________.",
          "answer_key": "Central America",
          "options": null,
          "wordlist": null
        },
        {
          "index": 9,
          "type": "true_false_not_given",
          "prompt": "Chocolate was initially consumed as a beverage.",
          "answer_key": "TRUE",
          "options": ["TRUE", "FALSE", "NOT GIVEN"],
          "wordlist": null
        },
        {
          "index": 11,
          "type": "sentence_completion_wordlist",
          "prompt": "The experiment required careful __________ of the data.",
          "answer_key": "analysis",
          "options": null,
          "wordlist": ["analysis", "measurement", "observation", "recording"]
        }
      ]
    }
  ]
}

IMPORTANT:
- Extract ALL 40 questions across ALL 3 passages
- Include COMPLETE passage text (800-1000 words each)
- If passages have paragraph labels (A, B, C), include them
- Answer keys must be exact
- For TRUE/FALSE/NOT GIVEN, answer must be one of these three exactly
- For matching_paragraphs, answer is the paragraph letter

Now extract from this test:
[PASTE YOUR PDF TEXT HERE]`,
    
    writing: `You are an IELTS test parser. Extract tasks from this IELTS Writing test and format as JSON.

Test Type: IELTS Academic Writing
Tasks: 2 tasks (Task 1: 150 words minimum, Task 2: 250 words minimum)

Return ONLY valid JSON in this EXACT format:

{
  "test_type": "writing",
  "title": "IELTS Writing Practice Test X",
  "description": "Complete IELTS Academic Writing test with 2 tasks",
  "duration_seconds": 3600,
  "audio_url": null,
  "sections": [
    {
      "index": 1,
      "title": "Writing Task 1",
      "instructions": "You should spend about 20 minutes on this task.",
      "questions": [
        {
          "index": 1,
          "type": "writing_task",
          "prompt": "The chart below shows the export of milk from Italy, Russia, and Poland between 2008 and 2012. Summarize the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
          "answer_key": null,
          "min_words": 150,
          "task_number": 1,
          "chart_image": "https://example.com/chart.jpg"
        }
      ]
    },
    {
      "index": 2,
      "title": "Writing Task 2",
      "instructions": "You should spend about 40 minutes on this task.",
      "questions": [
        {
          "index": 2,
          "type": "writing_task",
          "prompt": "Some people believe that international media has a positive influence on society, while others think it has negative effects. Discuss both views and give your opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.",
          "answer_key": null,
          "min_words": 250,
          "task_number": 2,
          "chart_image": null
        }
      ]
    }
  ]
}

IMPORTANT:
- Extract BOTH tasks (2 questions total)
- Include complete task prompts
- Task 1: min_words = 150, task_number = 1
- Task 2: min_words = 250, task_number = 2
- answer_key is always null for writing tasks
- chart_image URL for Task 1 if there's a chart/graph

Now extract from this test:
[PASTE YOUR PDF TEXT HERE]`
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(prompts[selectedType]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="p-5 bg-white border-2 border-gray-300 rounded-lg">
      <h3 className="font-bold mb-4 text-lg">🤖 AI Extraction Prompts</h3>
      
      <div className="flex gap-2 mb-4">
        {['listening', 'reading', 'writing'].map(type => (
          <button
            key={type}
            onClick={() => {
              setSelectedType(type);
              setCopied(false);
            }}
            className={`px-5 py-2 rounded-lg font-medium transition-colors ${
              selectedType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
      
      <div className="relative">
        <pre className="p-4 bg-gray-50 border border-gray-300 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto">
          {prompts[selectedType]}
        </pre>
        
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Prompt
            </>
          )}
        </button>
      </div>
      
      <p className="mt-4 text-sm text-gray-600">
        <strong>How to use:</strong> Copy this prompt, paste it into ChatGPT/Claude/Gemini along with your PDF text, and the AI will extract questions in JSON format.
      </p>
    </div>
  );
}

export default AIImport;
```

---

# AI EXTRACTION PROMPTS

## Detailed Prompts for Each Test Type

*These prompts are already included in the frontend component above, but here they are again for reference:*

[The prompts are already fully detailed in the `PromptTemplates` component above - they include:
- Listening Test Prompt with examples for all 4 question types
- Reading Test Prompt with examples for all 5 question types  
- Writing Test Prompt with examples for both tasks]

---

# IMPLEMENTATION PHASES

## Phase 1: AI Import System (Days 1-5)

### Day 1: Backend Foundation
- [x] Create `ai_import_service.py` with Pydantic models
- [x] Implement validation endpoint
- [x] Implement creation endpoint
- [x] Add convert-exam-to-track endpoint
- [x] Test with sample JSON

### Day 2: Track Service
- [x] Create `track_service.py`
- [x] Implement CRUD endpoints
- [x] Create database indexes
- [x] Test track management

### Day 3: Frontend Import Component
- [x] Create `AIImport.jsx`
- [x] Implement JSON input and validation UI
- [x] Add prompt templates component
- [x] Add validation display
- [x] Add preview display

### Day 4: Integration
- [x] Update `BackendService.js` with new methods
- [x] Add AI Import to admin navigation
- [x] Test end-to-end flow
- [x] Create sample test data

### Day 5: Testing & Polish
- [x] Test all 3 test types (listening, reading, writing)
- [x] Test error handling
- [x] UI polish and refinements
- [x] Documentation

---

## Phase 2: Track Library (Days 6-7)

### Day 6: Track Library Component
- [ ] Create `TrackLibrary.jsx`
- [ ] Display tracks grouped by type
- [ ] Add search and filter
- [ ] Add create/edit/delete actions
- [ ] Navigation integration

### Day 7: Track Editor
- [ ] Create `TrackEditor.jsx`
- [ ] Reuse Question Manager interface
- [ ] Add track metadata editing
- [ ] Audio upload for listening tracks
- [ ] Testing

---

## Phase 3: Mock Test System (Days 8-11)

### Day 8: Mock Test Backend
- [ ] Create `mock_test_service.py`
- [ ] Implement CRUD endpoints
- [ ] Add validation logic
- [ ] Create database indexes

### Day 9: Mock Test Builder UI
- [ ] Create `MockTestBuilder.jsx`
- [ ] Track selection interface
- [ ] Preview and validation
- [ ] Creation flow

### Day 10: Mock Test Management
- [ ] Create `MockTestManagement.jsx`
- [ ] List all mock tests
- [ ] Start/Stop controls
- [ ] Edit/Delete actions

### Day 11: Testing
- [ ] Test mock test creation
- [ ] Test track selection
- [ ] Integration testing
- [ ] Bug fixes

---

## Phase 4: Sequential Test Flow (Days 12-15)

### Day 12: Session Management Backend
- [ ] Create `mock_session_service.py`
- [ ] Implement session creation
- [ ] Stage progression logic
- [ ] Timer management

### Day 13-14: Mock Test Interface
- [ ] Create `MockTestInterface.jsx`
- [ ] Stage routing logic
- [ ] Review screen component
- [ ] Timer and auto-progression

### Day 15: Testing & Polish
- [ ] End-to-end mock test flow
- [ ] Session persistence
- [ ] Bug fixes
- [ ] Documentation

---

# TESTING PROCEDURES

## Unit Tests

### Backend Tests
```python
# test_ai_import.py
import pytest
from ai_import_service import AIImportRequest

def test_valid_listening_json():
    """Test valid listening test import"""
    data = {
        "test_type": "listening",
        "title": "Test",
        "description": "Description",
        "duration_seconds": 2004,
        "audio_url": "https://test.com/audio.mp3",
        "sections": [...]  # 4 sections, 40 questions
    }
    result = AIImportRequest(**data)
    assert result.test_type == "listening"
    assert len(result.sections) == 4

def test_invalid_question_count():
    """Test validation fails with wrong question count"""
    data = {
        "test_type": "listening",
        "sections": [...]  # Only 38 questions
    }
    with pytest.raises(ValueError):
        AIImportRequest(**data)
```

### Frontend Tests
```javascript
// AIImport.test.jsx
import { render, fireEvent } from '@testing-library/react';
import AIImport from './AIImport';

test('validates JSON correctly', async () => {
  const { getByText, getByRole } = render(<AIImport />);
  
  // Paste JSON
  const textarea = getByRole('textbox');
  fireEvent.change(textarea, { target: { value: validJSON } });
  
  // Click validate
  const validateBtn = getByText('Validate JSON');
  fireEvent.click(validateBtn);
  
  // Check success message
  await waitFor(() => {
    expect(getByText(/validated successfully/i)).toBeInTheDocument();
  });
});
```

---

## Integration Tests

### Test Case 1: Complete Listening Test Import
```
Steps:
1. Admin opens AI Import page
2. Copies listening prompt
3. Uses ChatGPT to extract questions from PDF
4. Pastes JSON into textarea
5. Clicks "Validate JSON"
6. Verifies validation success
7. Clicks "Preview Questions"
8. Reviews all 40 questions
9. Adds audio URL
10. Clicks "Create Track"
11. Verifies success message
12. Checks track appears in Track Library

Expected: Track created with 40 questions, 4 sections, audio URL
```

### Test Case 2: Reading Test Import
```
Steps:
1. Extract reading test with ChatGPT
2. Paste JSON
3. Validate
4. Preview (check passage text is included)
5. Create track
6. Verify all 3 passages loaded correctly

Expected: Track created with 40 questions, 3 passages with full text
```

### Test Case 3: Error Handling
```
Steps:
1. Paste invalid JSON (malformed)
2. Click validate
3. Verify error message shows line number

Expected: Clear error message with fix suggestion
```

---

# DEPLOYMENT GUIDE

## Prerequisites
- Python 3.9+
- Node.js 16+
- MongoDB running
- FastAPI backend running
- React frontend running

## Installation Steps

### Backend
```bash
cd /app/backend

# Add new dependencies to requirements.txt
echo "pydantic>=2.0.0" >> requirements.txt

# Install dependencies
pip install -r requirements.txt

# Run database migrations (create indexes)
python -c "
from server import create_indexes
import asyncio
asyncio.run(create_indexes())
"
```

### Frontend
```bash
cd /app/frontend

# Install dependencies (if any new ones)
yarn install

# Build for production
yarn build
```

### Database Setup
```bash
# Create indexes
mongosh ielts_platform --eval "
db.tracks.createIndex({ track_type: 1, status: 1 });
db.tracks.createIndex({ created_by: 1 });
db.tracks.createIndex({ exam_id: 1 });
"
```

## Environment Variables
```bash
# Backend .env
MONGO_URL=mongodb://localhost:27017/ielts_platform

# Frontend .env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## Restart Services
```bash
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

## Verification
```bash
# Check backend health
curl http://localhost:8001/health

# Check tracks endpoint
curl http://localhost:8001/api/tracks

# Check AI import validation endpoint
curl -X POST http://localhost:8001/api/tracks/validate-import \
  -H "Content-Type: application/json" \
  -d '{"test_type": "listening", ...}'
```

---

# APPENDIX

## A. JSON Schema Reference

[Already covered in detail above in AI Import Service section]

## B. Question Type Reference

| Question Type | Test Type | Description | Answer Key Format |
|--------------|-----------|-------------|-------------------|
| short_answer | Listening | Fill in blank | Text (e.g., "part-time") |
| multiple_choice | Listening, Reading | Choose A/B/C/D | Letter (e.g., "C") |
| map_labeling | Listening | Label map locations | Letter (e.g., "A") |
| diagram_labeling | Listening | Label diagram | Text (e.g., "uranium") |
| true_false_not_given | Reading | TRUE/FALSE/NOT GIVEN | Exact text (e.g., "TRUE") |
| matching_paragraphs | Reading | Match to paragraph | Letter (e.g., "B") |
| sentence_completion | Reading | Complete sentence | Text (e.g., "Central America") |
| sentence_completion_wordlist | Reading | Complete from word list | Word from list |
| short_answer_reading | Reading | Answer question | Text |
| writing_task | Writing | Write essay/report | null (manual grading) |

## C. Error Codes Reference

| Error Code | Description | Solution |
|------------|-------------|----------|
| 400 | Validation failed | Check JSON format and field values |
| 404 | Track not found | Verify track ID exists |
| 409 | Duplicate track | Track with same exam_id already exists |
| 500 | Server error | Check backend logs |

---

# SUMMARY

This detailed implementation specification provides:

✅ **Complete system architecture**
✅ **Database schemas with indexes**
✅ **Full backend implementation** (Python/FastAPI)
✅ **Full frontend implementation** (React)
✅ **Ready-to-use AI prompts** for all 3 test types
✅ **Step-by-step implementation phases**
✅ **Testing procedures**
✅ **Deployment guide**

**Total Implementation Time: 15 days**
- Phase 1 (AI Import): 5 days
- Phase 2 (Track Library): 2 days
- Phase 3 (Mock Tests): 4 days
- Phase 4 (Sequential Flow): 4 days

**Ready to start implementation!** 🚀
