# 📚 IELTS Test Platform - Comprehensive Codebase Index

**Last Updated**: Post-System Reinitialization
**Total Files**: 107 Frontend + 7 Backend Python files
**Status**: ✅ All Services Running

---

## 📖 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Backend Components](#backend-components)
4. [Frontend Components](#frontend-components)
5. [API Endpoints Reference](#api-endpoints-reference)
6. [Database Schema](#database-schema)
7. [Feature Implementation Map](#feature-implementation-map)
8. [Development Guide](#development-guide)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 System Overview

### Project Description
Full-featured IELTS practice test platform with three test types (Listening, Reading, Writing), admin management, student authentication, real-time test control, auto-grading, and comprehensive analytics.

### Tech Stack
- **Frontend**: React 19.2.0 + React Router 7.9.3 + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI 0.110.1 + Uvicorn 0.25.0
- **Database**: MongoDB 4.5.0 + Firebase Realtime Database
- **Authentication**: Firebase Google OAuth + Emergent OAuth
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

### Service URLs
- **Frontend**: Port 3000 (React Dev Server with Hot Reload)
- **Backend**: Port 8001 (FastAPI with Auto-reload)
- **MongoDB**: Port 27017 (Internal)
- **Backend API Docs**: http://localhost:8001/docs

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│                      (React + Tailwind)                     │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐  │
│  │   Student  │  │   Admin    │  │  Common Components  │  │
│  │   Portal   │  │   Portal   │  │  (Highlight, Notes) │  │
│  └────────────┘  └────────────┘  └─────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ REST API / WebSocket
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                        BACKEND                              │
│                    (FastAPI + Python)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │   Auth       │  │   Exam       │  │   AI Import      │ │
│  │   Service    │  │   Service    │  │   Service        │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌─────▼──────┐ ┌─────▼──────────┐
│   MongoDB    │ │  Firebase   │ │  File System   │
│  (Exams,     │ │  (Students, │ │  (Audio Files) │
│  Questions)  │ │ Submissions)│ │                │
└──────────────┘ └─────────────┘ └────────────────┘
```

### Data Flow

**Student Taking Test:**
```
Student Login → Firebase Auth → Complete Profile → Approval Pending
    → Admin Approves → Student Dashboard → Select Exam
    → Wait for Admin to Start Test → Status Polling (3s interval)
    → Test Active → Take Test → Submit Answers
    → Auto-Grading → Score Hidden → Admin Publishes Results
    → Score Visible in Dashboard
```

**Admin Managing Tests:**
```
Admin Login → Firebase Auth (Whitelist Check) → Admin Dashboard
    → Create/Edit Exams → Add Questions → Upload Audio
    → Publish Exam → Start Test (Real-time Control)
    → Monitor Submissions → Review Answers → Grade/Publish Results
```

---

## 🔧 Backend Components

### File Structure
```
/app/backend/
├── server.py                    # Main FastAPI application (1500+ lines)
├── auth_service.py             # Authentication & session management
├── ai_import_service.py        # AI-generated test import
├── track_service.py            # Track library management
├── init_ielts_test.py          # Initialize default listening test
├── init_reading_test.py        # Initialize default reading test
├── init_writing_test.py        # Initialize default writing test
└── requirements.txt            # Python dependencies
```

### 1. server.py (Main Application)

**Lines of Code**: ~1500 lines
**Purpose**: Central FastAPI application with all endpoints

#### Key Sections:

**Configuration (Lines 1-50)**
```python
MONGO_URL = os.environ.get('MONGO_URL')
ADMIN_EMAILS = ["aminulislam004474@gmail.com", "shahsultanweb@gmail.com"]
CORS configuration for frontend
Static file serving for audio tracks
```

**Database Models (Lines 51-200)**
- ExamCreate, ExamUpdate, Exam
- SectionCreate, Section
- QuestionCreate, QuestionUpdate, Question
- SubmissionCreate, Submission
- UserSession

**Core Endpoints:**

1. **Health Check** (Lines 201-210)
   - `GET /api/health` - Service status check

2. **Exam Management** (Lines 211-450)
   - `POST /api/exams` - Create exam
   - `GET /api/exams` - List all exams
   - `GET /api/exams/published` - List published exams
   - `GET /api/exams/{id}` - Get exam details
   - `PUT /api/exams/{id}` - Update exam
   - `DELETE /api/exams/{id}` - Delete exam
   - `GET /api/exams/{id}/sections` - Get exam sections
   - `GET /api/exams/{id}/full` - Get complete exam with questions

3. **Section Management** (Lines 451-600)
   - `POST /api/sections` - Create section
   - `GET /api/sections/{id}` - Get section
   - `PUT /api/sections/{id}` - Update section
   - `DELETE /api/sections/{id}` - Delete section

4. **Question Management** (Lines 601-850)
   - `POST /api/questions` - Create question
   - `GET /api/questions/{id}` - Get question
   - `PUT /api/questions/{id}` - Update question
   - `DELETE /api/questions/{id}` - Delete question (with re-indexing)
   - `GET /api/sections/{section_id}/questions` - Get all questions in section

5. **Submission Management** (Lines 851-1000)
   - `POST /api/submissions` - Submit answers (with auto-grading)
   - `GET /api/submissions/{id}` - Get submission
   - `GET /api/submissions/{id}/detailed` - Get submission with questions
   - `PUT /api/submissions/{id}/score` - Update score (admin only)
   - `GET /api/exams/{exam_id}/submissions` - Get all exam submissions

6. **Test Control System** (Lines 1001-1150) ⭐
   - `PUT /api/admin/exams/{exam_id}/start` - Start test (admin only)
   - `PUT /api/admin/exams/{exam_id}/stop` - Stop test (admin only)
   - `GET /api/exams/{exam_id}/status` - Poll test status (public)

7. **Result Publishing** (Lines 1151-1250)
   - `PUT /api/admin/submissions/{id}/publish` - Publish single result
   - `PUT /api/admin/exams/{exam_id}/publish-results` - Bulk publish

8. **Audio Upload** (Lines 1251-1300)
   - `POST /api/upload-audio` - Upload audio files (multipart/form-data)
   - Supports: MP3, WAV, M4A, OGG, FLAC
   - Storage: `/app/listening_tracks/`
   - Serving: `/listening_tracks/{filename}`

9. **Authentication** (Lines 1301-1400)
   - `POST /api/auth/session` - Create session
   - `GET /api/auth/me` - Get current user
   - `POST /api/auth/logout` - Logout

10. **Student Management** (Lines 1401-1500)
    - `POST /api/students/complete-profile` - Complete student profile
    - `GET /api/students/me` - Get current student
    - `GET /api/admin/students` - List all students (admin)
    - `DELETE /api/admin/students/{id}` - Delete student (admin)

### 2. auth_service.py

**Purpose**: Authentication and session management
**Key Features**:
- Session token generation
- User session storage
- Emergent OAuth integration
- Token validation

**Key Functions**:
```python
create_session(user_data) -> str
get_session(token: str) -> dict
delete_session(token: str)
validate_admin(email: str) -> bool
```

### 3. ai_import_service.py

**Purpose**: Import AI-generated test content
**Key Features**:
- JSON validation for test structure
- Automatic exam/section/question creation
- Question count validation (40 for listening/reading, 2 for writing)
- Sequential index assignment

**Endpoints**:
- `POST /api/tracks/validate-import` - Validate JSON structure
- `POST /api/tracks/import-from-ai` - Create exam from JSON

**Validation Rules**:
- Listening: 4 sections, 40 questions total
- Reading: 3 sections, 40 questions total
- Writing: 2 sections, 2 questions total

### 4. track_service.py

**Purpose**: Track library CRUD operations
**Key Features**:
- Track creation and management
- Soft delete (status = 'archived')
- Track filtering by type/status
- Sync with exam title/description

**Endpoints**:
- `POST /api/tracks` - Create track
- `GET /api/tracks` - List tracks (with filters)
- `GET /api/tracks/{id}` - Get track details
- `PUT /api/tracks/{id}` - Update track
- `DELETE /api/tracks/{id}` - Soft delete track

### 5. init_*.py Files

**Purpose**: Initialize default tests on startup

**init_ielts_test.py**:
- Creates IELTS Listening Practice Test 1
- Exam ID: `ielts-listening-practice-test-1`
- 4 sections, 40 questions
- Question types: short_answer, multiple_choice, map_labeling, diagram_labeling
- Duration: 2004 seconds (33:24)

**init_reading_test.py**:
- Creates IELTS Reading Practice Test 1
- 3 passages, 40 questions
- Question types: matching_paragraphs, sentence_completion, true_false_not_given, short_answer_reading
- Duration: 3600 seconds (60 minutes)

**init_writing_test.py**:
- Creates IELTS Writing Practice Test 1
- 2 tasks (Task 1: 150 words, Task 2: 250 words)
- Question type: writing_task
- Duration: 3600 seconds (60 minutes)

---

## 🎨 Frontend Components

### Directory Structure
```
/app/frontend/src/
├── components/
│   ├── admin/                 # Admin portal (12 components)
│   ├── student/              # Student portal (6 components)
│   ├── common/               # Shared utilities (7 components)
│   ├── reading/              # Reading question types (4 components)
│   ├── ui/                   # shadcn/ui library (50+ components)
│   └── [Root components]     # Main exam interfaces (13 components)
├── services/                 # API service layer (5 files)
├── contexts/                 # React contexts (2 files)
├── config/                   # Configuration (1 file)
├── lib/                      # Utilities (2 files)
├── hooks/                    # Custom hooks (1 file)
├── App.js                    # Main application
└── index.js                  # Entry point
```

### Root Components (13 files)

| Component | File | Purpose | Key Features |
|-----------|------|---------|--------------|
| Main App | App.js | Root component with routing | React Router setup, context providers |
| Homepage | Homepage.jsx | Landing page | Authentication protection, feature showcase |
| Header | Header.jsx | Global navigation | Logo, user info, logout |
| Exam Test | ExamTest.jsx | Exam wrapper | Sound test, instructions, test interface |
| Listening Test | ListeningTest.jsx | Listening exam UI | Audio player, timer, QTI navigation, 40 questions |
| Listening Instructions | ListeningInstructions.jsx | Test guidelines | Pre-test instructions |
| Reading Test | ReadingTest.jsx | Reading exam UI | 3 passages, split-screen, highlighting |
| Reading Instructions | ReadingInstructions.jsx | Test guidelines | Pre-test instructions |
| Writing Test | WritingTest.jsx | Writing exam UI | 2 tasks, word counter, split-screen |
| Writing Instructions | WritingInstructions.jsx | Test guidelines | Pre-test instructions |
| Sound Test | SoundTest.jsx | Audio check | Volume test before exam |
| Confirm Details | ConfirmDetails.jsx | Student info form | Name, email before anonymous test |
| Homepage Old | Homepage_old.jsx | Legacy version | Backup file |

### Admin Components (12 files)

| Component | File | Purpose | Key Features |
|-----------|------|---------|--------------|
| Admin Router | AdminRouter.jsx | Admin routing | Protected routes, layout wrapper |
| Admin Layout | AdminLayout.jsx | Layout wrapper | Sidebar, header, content area |
| Admin Login | AdminLogin.jsx | Admin authentication | Google OAuth, whitelist check |
| Dashboard | Dashboard.jsx | Admin overview | Stats, analytics, quick actions |
| Test Management | TestManagement.jsx | Exam CRUD | Create/edit/delete exams, **Start/Stop buttons** ⭐ |
| Question Manager | QuestionManager.jsx | Question CRUD | Add/edit/delete questions, 4 question types |
| Audio Upload | AudioUpload.jsx | Audio file upload | Drag-drop, file validation |
| Student Management | StudentManagement.jsx | Student CRUD | Approve/reject students, view submissions |
| Submission Management | SubmissionManagement.jsx | 3-level hierarchy | Tests → Students → Answers |
| Submission Review | SubmissionReview.jsx | Answer review (MongoDB) | Score editing, publish results |
| Firebase Submission Review | FirebaseSubmissionReview.jsx | Answer review (Firebase) | Interactive marking, tick/cross buttons |
| Analytics | Analytics.jsx | Statistics dashboard | Charts, graphs, insights |
| AI Import | AIImport.jsx | AI test import | JSON upload, validation |
| AI Prompts | AIPrompts.jsx | Prompt templates | Pre-built prompts for AI |
| Track Library | TrackLibrary.jsx | Saved tests | Track management |
| Settings | Settings.jsx | Configuration | System settings |
| Admin Header | AdminHeader.jsx | Admin navigation | Logo, user info |
| Sidebar | Sidebar.jsx | Side navigation | Menu items, active state |
| Protected Route | ProtectedRoute.jsx | Route protection | Auth check, redirect |

### Student Components (6 files)

| Component | File | Purpose | Key Features |
|-----------|------|---------|--------------|
| Student Home | StudentHome.jsx | Login page | Google OAuth button |
| Student Dashboard | StudentDashboard.jsx | Main dashboard | Available exams, **status polling** ⭐, submissions, progress chart |
| Complete Profile | CompleteProfile.jsx | Profile form | Name, phone, institution, roll number |
| Waiting For Approval | WaitingForApproval.jsx | Pending state | Message while admin reviews |
| Progress Chart | ProgressChart.jsx | Performance graph | Recharts bar chart, color-coded |
| Student Dashboard Old | StudentDashboard_old.jsx | Legacy version | Backup file |

### Common Components (7 files)

| Component | File | Purpose | Key Features |
|-----------|------|---------|--------------|
| Toast | Toast.jsx | Notifications | Success/error messages, auto-dismiss |
| Button | Button.jsx | Custom button | Styled button component |
| Info Notice | InfoNotice.jsx | Information boxes | Blue info boxes |
| Text Highlighter | TextHighlighter.jsx | Text highlighting | Select text, highlight, save |
| Highlight Context Menu | HighlightContextMenu.jsx | Right-click menu | Add note, delete highlight |
| Note Popup | NotePopup.jsx | Note editor | Add/edit notes on highlights |
| Notes Panel | NotesPanel.jsx | Notes sidebar | View all notes, navigate |

### Reading Question Components (4 files)

| Component | File | Purpose | Supported in |
|-----------|------|---------|-------------|
| Matching Paragraphs | MatchingParagraphs.jsx | Match info to paragraphs | Reading Test |
| Sentence Completion | SentenceCompletion.jsx | Fill in blanks | Reading Test |
| Short Answer Reading | ShortAnswerReading.jsx | Short text answers | Reading Test |
| True False Not Given | TrueFalseNotGiven.jsx | T/F/NG questions | Reading Test |

### UI Components (50+ files)

**shadcn/ui Library**: Fully styled, accessible components
- Forms: Input, Textarea, Select, Checkbox, Radio, Switch
- Data Display: Table, Card, Badge, Avatar, Progress
- Overlays: Dialog, Sheet, Popover, Tooltip, Hover Card
- Navigation: Tabs, Accordion, Breadcrumb, Navigation Menu
- Feedback: Alert, Toast, Skeleton
- Layout: Separator, Scroll Area, Resizable
- And more...

---

## 🔌 API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| POST | `/api/auth/session` | No | Create session token |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/logout` | Yes | Logout user |

### Exam Endpoints

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| GET | `/api/health` | No | Health check |
| POST | `/api/exams` | Admin | Create exam |
| GET | `/api/exams` | No | List all exams |
| GET | `/api/exams/published` | No | List published exams |
| GET | `/api/exams/{id}` | No | Get exam details |
| PUT | `/api/exams/{id}` | Admin | Update exam |
| DELETE | `/api/exams/{id}` | Admin | Delete exam |
| GET | `/api/exams/{id}/sections` | No | Get exam sections |
| GET | `/api/exams/{id}/full` | No | Get complete exam structure |

### Test Control Endpoints ⭐

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| PUT | `/api/admin/exams/{id}/start` | Admin | Start test (sets is_active=true) |
| PUT | `/api/admin/exams/{id}/stop` | Admin | Stop test (sets is_active=false) |
| GET | `/api/exams/{id}/status` | No | Poll test status (for students) |

**Status Polling Response:**
```json
{
  "exam_id": "ielts-listening-practice-test-1",
  "is_active": true,
  "started_at": "2025-01-15T10:30:00Z",
  "stopped_at": null,
  "published": true
}
```

### Question Endpoints

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| POST | `/api/questions` | Admin | Create question |
| GET | `/api/questions/{id}` | No | Get question |
| PUT | `/api/questions/{id}` | Admin | Update question |
| DELETE | `/api/questions/{id}` | Admin | Delete question (auto re-index) |
| GET | `/api/sections/{id}/questions` | No | Get section questions |

### Submission Endpoints

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| POST | `/api/submissions` | Optional | Submit answers (auto-grades) |
| GET | `/api/submissions/{id}` | Optional | Get submission |
| GET | `/api/submissions/{id}/detailed` | Optional | Get submission with questions |
| PUT | `/api/submissions/{id}/score` | Admin | Update score manually |
| GET | `/api/exams/{id}/submissions` | Admin | Get all exam submissions |
| PUT | `/api/admin/submissions/{id}/publish` | Admin | Publish single result |
| PUT | `/api/admin/exams/{id}/publish-results` | Admin | Bulk publish results |

**Submission Request:**
```json
{
  "exam_id": "ielts-listening-practice-test-1",
  "user_id_or_session": "user123",
  "answers": {
    "1": "answer1",
    "2": "answer2",
    ...
    "40": "answer40"
  }
}
```

**Submission Response:**
```json
{
  "id": "submission-uuid",
  "exam_id": "ielts-listening-practice-test-1",
  "score": 35,
  "total_questions": 40,
  "correct_answers": 35,
  "is_published": false,
  "submitted_at": "2025-01-15T10:45:00Z"
}
```

### Student Endpoints

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| POST | `/api/students/complete-profile` | Yes | Complete student profile |
| GET | `/api/students/me` | Yes | Get current student |
| GET | `/api/admin/students` | Admin | List all students |
| DELETE | `/api/admin/students/{id}` | Admin | Delete student |

### Audio Endpoints

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| POST | `/api/upload-audio` | Admin | Upload audio file |
| GET | `/listening_tracks/{filename}` | No | Serve audio file |

**Audio Upload Request:**
```
Content-Type: multipart/form-data

file: <audio_file>
```

**Audio Upload Response:**
```json
{
  "filename": "uuid.mp3",
  "url": "/listening_tracks/uuid.mp3",
  "size": 15728640
}
```

### AI Import Endpoints

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| POST | `/api/tracks/validate-import` | Admin | Validate JSON structure |
| POST | `/api/tracks/import-from-ai` | Admin | Create exam from JSON |

### Track Library Endpoints

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| POST | `/api/tracks` | Admin | Create track |
| GET | `/api/tracks` | Admin | List tracks (with filters) |
| GET | `/api/tracks/{id}` | Admin | Get track details |
| PUT | `/api/tracks/{id}` | Admin | Update track |
| DELETE | `/api/tracks/{id}` | Admin | Soft delete track |

---

## 🗄️ Database Schema

### MongoDB Collections

#### exams
```javascript
{
  _id: ObjectId,
  id: "uuid",                        // Primary key
  title: "IELTS Listening Practice Test 1",
  description: "Complete listening test with 40 questions",
  exam_type: "listening|reading|writing",
  duration_seconds: 2004,
  question_count: 40,
  audio_url: "https://...",          // For listening tests
  published: true,
  is_active: false,                  // ⭐ Test control
  started_at: "2025-01-15T10:30:00Z", // ⭐ Test control
  stopped_at: null,                  // ⭐ Test control
  submission_count: 0,
  created_at: "2025-01-10T00:00:00Z",
  updated_at: "2025-01-10T00:00:00Z"
}
```

#### sections
```javascript
{
  _id: ObjectId,
  id: "uuid",
  exam_id: "uuid",
  index: 1,
  title: "Section 1",
  description: "Conversation in a social context",
  passage_text: "...",               // For reading tests
  created_at: "2025-01-10T00:00:00Z"
}
```

#### questions
```javascript
{
  _id: ObjectId,
  id: "uuid",
  section_id: "uuid",
  index: 1,                          // Question number (1-40)
  question_type: "short_answer|multiple_choice|map_labeling|diagram_labeling|matching_paragraphs|sentence_completion|true_false_not_given|short_answer_reading|sentence_completion_wordlist|writing_task",
  prompt: "What is the main topic?",
  payload: {
    // For multiple_choice:
    options: ["A", "B", "C", "D"],
    answer_key: "B",
    
    // For map/diagram_labeling:
    image_url: "https://...",
    answer_key: "library",
    
    // For short_answer:
    answer_key: "part-time",
    
    // For writing_task:
    instructions: "You should spend about 20 minutes...",
    chart_image: "https://...",
    min_words: 150,
    task_number: 1
  },
  created_at: "2025-01-10T00:00:00Z"
}
```

#### submissions
```javascript
{
  _id: ObjectId,
  id: "uuid",
  exam_id: "uuid",
  user_id_or_session: "uuid|session_token",
  exam_type: "listening|reading|writing",
  answers: {
    "1": "answer1",
    "2": "answer2",
    ...
    "40": "answer40"
  },
  score: 35,
  total_questions: 40,
  correct_answers: 35,
  progress_percent: 87.5,
  manually_graded: false,
  is_published: false,               // Score visibility control
  published_at: null,
  submitted_at: "2025-01-15T10:45:00Z"
}
```

#### tracks
```javascript
{
  _id: ObjectId,
  id: "uuid",
  title: "Track 1",
  description: "Collection of tests",
  track_type: "listening|reading|writing",
  exam_id: "uuid",                   // Associated exam
  status: "active|archived",
  created_at: "2025-01-10T00:00:00Z",
  updated_at: "2025-01-10T00:00:00Z"
}
```

### Firebase Realtime Database

#### /students/{uid}
```javascript
{
  uid: "firebase_uid",
  email: "student@example.com",
  displayName: "John Doe",
  photoURL: "https://...",
  phone: "+1234567890",
  institution: "ABC University",
  department: "Computer Science",
  rollNumber: "CS-2021-001",
  status: "pending|approved|rejected|inactive",
  createdAt: "2025-01-10T00:00:00Z",
  lastLogin: "2025-01-15T09:00:00Z"
}
```

#### /submissions/{submissionId}
```javascript
{
  examId: "ielts-listening-practice-test-1",
  studentId: "firebase_uid",
  examTitle: "IELTS Listening Practice Test 1",
  answers: {
    "1": "answer1",
    "2": "answer2",
    ...
  },
  score: 35,
  totalQuestions: 40,
  correctAnswers: 35,
  percentage: 87.5,
  isPublished: false,                // Score visibility
  publishedAt: null,
  questionMarks: {                   // Interactive marking
    "1": "correct",
    "2": "incorrect",
    ...
  },
  submittedAt: "2025-01-15T10:45:00Z"
}
```

#### /approvals/{uid}
```javascript
{
  uid: "firebase_uid",
  email: "student@example.com",
  displayName: "John Doe",
  status: "pending",
  requestedAt: "2025-01-10T00:00:00Z"
}
```

---

## 🎯 Feature Implementation Map

### 1. Test Control System (Start/Stop Tests) ⭐

**User Story**: Admin can start/stop tests, students see real-time status

**Backend**:
- `/app/backend/server.py` (Lines 1001-1150)
  - `PUT /api/admin/exams/{id}/start` - Sets is_active=true, records started_at
  - `PUT /api/admin/exams/{id}/stop` - Sets is_active=false, records stopped_at
  - `GET /api/exams/{id}/status` - Public endpoint for polling

**Frontend - Admin**:
- `/app/frontend/src/components/admin/TestManagement.jsx`
  - Lines 118-144: Start/Stop button UI
  - Lines 230-254: handleStartTest(), handleStopTest() functions
  - Green "Start" button when inactive, Red "Stop" button when active

**Frontend - Student**:
- `/app/frontend/src/components/student/StudentDashboard.jsx`
  - Lines 71-98: Status polling (3-second interval)
  - Lines 246-249: Button states (enabled/disabled based on is_active)
  - Yellow banner: "Please wait for the test to begin."

**Service Layer**:
- `/app/frontend/src/services/BackendService.js`
  - Lines 101-129: startExam(), stopExam(), getExamStatus() methods

**Database**:
- MongoDB `exams` collection: is_active, started_at, stopped_at fields

### 2. Student Authentication & Approval

**User Story**: Students sign up with Google, complete profile, wait for admin approval

**Backend**:
- `/app/backend/auth_service.py` - Session management
- `/app/backend/server.py`
  - `POST /api/auth/session` - Create session
  - `POST /api/students/complete-profile` - Save profile data

**Frontend**:
- `/app/frontend/src/components/student/StudentHome.jsx` - Login page
- `/app/frontend/src/components/student/CompleteProfile.jsx` - Profile form
- `/app/frontend/src/components/student/WaitingForApproval.jsx` - Pending state
- `/app/frontend/src/components/student/StudentDashboard.jsx` - Main dashboard

**Services**:
- `/app/frontend/src/services/FirebaseAuthService.js` - Google OAuth, approval logic
- `/app/frontend/src/contexts/AuthContext.jsx` - Global auth state

**Database**:
- Firebase `/students/{uid}` - Student profiles
- Firebase `/approvals/{uid}` - Approval requests

### 3. Exam Creation & Management

**User Story**: Admin creates exams with multiple sections and questions

**Backend**:
- `/app/backend/server.py`
  - Lines 211-450: Exam CRUD endpoints
  - Lines 451-600: Section CRUD endpoints
  - Lines 601-850: Question CRUD endpoints (with auto re-indexing on delete)

**Frontend**:
- `/app/frontend/src/components/admin/TestManagement.jsx` - Exam list, create/edit/delete
- `/app/frontend/src/components/admin/QuestionManager.jsx` - Question management
  - Supports 4 question types for listening
  - Supports 6 question types for reading
  - Supports 1 question type for writing

**Services**:
- `/app/frontend/src/services/BackendService.js` - API calls

**Database**:
- MongoDB `exams`, `sections`, `questions` collections

### 4. Audio Upload System

**User Story**: Admin uploads audio files for listening tests

**Backend**:
- `/app/backend/server.py` (Lines 1251-1300)
  - `POST /api/upload-audio` - Multipart file upload
  - Files stored in `/app/listening_tracks/` with UUID naming
  - Static file serving at `/listening_tracks/`

**Frontend**:
- `/app/frontend/src/components/admin/AudioUpload.jsx` - Drag-drop upload UI

**Services**:
- `/app/frontend/src/services/AudioService.js` - Upload logic

**Storage**:
- Local filesystem: `/app/listening_tracks/`
- Supported formats: MP3, WAV, M4A, OGG, FLAC

### 5. Auto-Grading System

**User Story**: System automatically grades objective questions

**Backend**:
- `/app/backend/server.py` (Submission creation endpoint)
  - Case-insensitive matching for short_answer
  - Exact matching for multiple_choice
  - Stores score, correct_answers count
  - Skips writing tasks (manual grading only)

**Grading Logic**:
```python
for index, student_answer in answers.items():
    question = get_question_by_index(index)
    correct_answer = question.payload.get('answer_key')
    
    if question.type in ['short_answer', 'diagram_labeling']:
        if student_answer.lower().strip() == correct_answer.lower().strip():
            correct_count += 1
    elif question.type in ['multiple_choice', 'map_labeling']:
        if student_answer == correct_answer:
            correct_count += 1
```

### 6. Score Visibility Control

**User Story**: Scores hidden until admin publishes results

**Backend**:
- `/app/backend/server.py`
  - `POST /api/submissions` - Auto-grades but sets is_published=false
  - `PUT /api/admin/submissions/{id}/publish` - Publish single result
  - `PUT /api/admin/exams/{id}/publish-results` - Bulk publish

**Frontend**:
- `/app/frontend/src/components/student/StudentDashboard.jsx`
  - Shows "Results Pending" for unpublished submissions
  - Shows score/percentage only for published results
- `/app/frontend/src/components/admin/SubmissionManagement.jsx`
  - "Publish" button for each submission
  - "Publish All Results" for bulk publishing

**Database**:
- MongoDB `submissions`: is_published, published_at fields
- Firebase `/submissions/{id}`: isPublished field

### 7. Interactive Scoring System

**User Story**: Admin marks questions as correct/incorrect with tick/cross buttons

**Frontend**:
- `/app/frontend/src/components/admin/FirebaseSubmissionReview.jsx`
  - Tick (✔) and cross (✖) buttons for each question
  - Real-time score calculation
  - Green background for correct, red for incorrect, gray for unmarked
  - Publish workflow saves marks to Firebase

**Services**:
- `/app/frontend/src/services/FirebaseAuthService.js`
  - updateSubmissionWithMarks() - Saves questionMarks and calculated score

**Database**:
- Firebase `/submissions/{id}`:
  - questionMarks: {"1": "correct", "2": "incorrect", ...}
  - score: calculated from tick count

### 8. Progress Chart

**User Story**: Students see performance graph across all completed tests

**Frontend**:
- `/app/frontend/src/components/student/ProgressChart.jsx`
  - Recharts bar chart
  - Color-coded bars: Green (≥80%), Blue (60-79%), Orange (40-59%), Red (<40%)
  - Filters for published submissions only
  - Real-time updates via Firebase listener

**Dependencies**:
- recharts library

### 9. Enhanced Timer with Auto-Submit

**User Story**: Timer shows countdown, animates in final 2 minutes, auto-submits when expires

**Frontend**:
- `/app/frontend/src/components/ListeningTest.jsx`
  - 3D gradient design with shadow effects
  - Red/white pulsing animation in final 2 minutes
  - Auto-submit on timer expiry
  - Completion screen

**Styling**:
- `/app/frontend/tailwind.config.js`
  - Custom 'timer-fade' keyframe animation

### 10. QTI-Style Navigation

**User Story**: Exam interface shows all questions in footer with state indicators

**Frontend**:
- `/app/frontend/src/components/ListeningTest.jsx`
  - Dual view modes: Minimised (1em buttons) and Maximised (1.6em buttons)
  - Question states: Black (unanswered), White (answered), Blue (current), Circular border (review)
  - Section-based organization
  - Previous/Next buttons with sprite images
  - Review checkbox
  - Hover tooltips

**Styling**:
- `/app/frontend/src/styles/navigation.css`
  - QTI-compliant CSS with data attributes

**Assets**:
- button.png - Question button backgrounds
- nav-buttons.png - Previous/Next sprite (112px×56px, 4 states)
- iconMinimise.png - Compact view icon
- iconMaximise.png - Detailed view icon

### 11. Text Highlighting & Notes

**User Story**: Students can highlight text and add notes during reading tests

**Frontend**:
- `/app/frontend/src/components/common/TextHighlighter.jsx` - Highlight functionality
- `/app/frontend/src/components/common/HighlightContextMenu.jsx` - Right-click menu
- `/app/frontend/src/components/common/NotePopup.jsx` - Note editor
- `/app/frontend/src/components/common/NotesPanel.jsx` - Notes sidebar

**Library**:
- `/app/frontend/src/lib/HighlightManager.js` - Highlight persistence

**Storage**:
- localStorage: Highlights and notes persist across sessions

### 12. AI Import System

**User Story**: Admin imports AI-generated test content via JSON

**Backend**:
- `/app/backend/ai_import_service.py`
  - JSON validation
  - Automatic exam/section/question creation
  - Question count validation

**Frontend**:
- `/app/frontend/src/components/admin/AIImport.jsx` - JSON upload UI
- `/app/frontend/src/components/admin/AIPrompts.jsx` - Prompt templates

**Endpoints**:
- `POST /api/tracks/validate-import` - Validate JSON
- `POST /api/tracks/import-from-ai` - Create exam

### 13. Submission Management (3-Level Hierarchy)

**User Story**: Admin reviews submissions in hierarchical view: Tests → Students → Answers

**Frontend**:
- `/app/frontend/src/components/admin/SubmissionManagement.jsx`
  - Level 1: Test cards with participant count
  - Level 2: Student list with status indicators
  - Level 3: Detailed answer review

**Features**:
- Search at each level
- Navigation breadcrumbs
- Real-time updates
- CSV export

---

## 🚀 Development Guide

### Starting the Application

```bash
# Start all services
sudo supervisorctl restart all

# Start individual services
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
sudo supervisorctl restart mongodb

# Check service status
sudo supervisorctl status

# View logs
tail -f /var/log/supervisor/backend.*.log
tail -f /var/log/supervisor/frontend.*.log
```

### Backend Development

**File**: `/app/backend/server.py`

1. Edit the file
2. Hot reload enabled (FastAPI auto-reloads)
3. Check logs for errors
4. Test with API docs: http://localhost:8001/docs

**Adding a New Endpoint**:
```python
@app.post("/api/new-endpoint")
async def new_endpoint(data: RequestModel):
    # Your logic here
    return {"status": "success"}
```

**Database Operations**:
```python
# Get MongoDB client
from pymongo import MongoClient
client = MongoClient(MONGO_URL)
db = client.ielts_platform

# Insert document
result = db.exams.insert_one(exam_dict)

# Find documents
exams = list(db.exams.find({"published": True}))

# Update document
db.exams.update_one({"id": exam_id}, {"$set": update_data})

# Delete document
db.exams.delete_one({"id": exam_id})
```

### Frontend Development

**Files**: `/app/frontend/src/components/`

1. Edit React components
2. Hot reload enabled (React Dev Server)
3. Changes reflect immediately
4. Check browser console for errors

**Creating a New Component**:
```jsx
import React, { useState } from 'react';

const NewComponent = () => {
  const [state, setState] = useState(initialValue);
  
  return (
    <div className="p-4">
      {/* Your JSX here */}
    </div>
  );
};

export default NewComponent;
```

**Making API Calls**:
```javascript
import BackendService from '../services/BackendService';

// In component
const fetchData = async () => {
  try {
    const data = await BackendService.getExams();
    setExams(data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

**Adding a New Route**:
```javascript
// In App.js
import NewComponent from './components/NewComponent';

// In Router
<Route path="/new-path" element={<NewComponent />} />
```

### Installing Dependencies

**Backend**:
```bash
cd /app/backend
pip install package-name
# Add to requirements.txt
echo "package-name==version" >> requirements.txt
sudo supervisorctl restart backend
```

**Frontend**:
```bash
cd /app/frontend
yarn add package-name
# Restart not needed (hot reload)
```

### Environment Variables

**Backend**: `/app/backend/.env`
```
MONGO_URL=mongodb://localhost:27017/ielts_platform
```

**Frontend**: `/app/frontend/.env`
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

**Important**: Never modify existing .env URLs unless instructed

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend not starting
```bash
# Check logs
tail -n 50 /var/log/supervisor/backend.err.log

# Common issues:
# 1. Missing dependencies
cd /app/backend && pip install -r requirements.txt

# 2. Syntax errors
python3 -m py_compile server.py

# 3. Port already in use
sudo lsof -i :8001
sudo kill -9 <PID>

# Restart
sudo supervisorctl restart backend
```

**Problem**: MongoDB connection failed
```bash
# Check MongoDB status
sudo supervisorctl status mongodb

# Check connection string
echo $MONGO_URL

# Restart MongoDB
sudo supervisorctl restart mongodb
```

**Problem**: Authentication errors
```bash
# Check admin emails in server.py
grep ADMIN_EMAILS /app/backend/server.py

# Verify Firebase credentials
ls -la /app/frontend/src/config/firebase.js
```

### Frontend Issues

**Problem**: Frontend not loading
```bash
# Check logs
tail -n 50 /var/log/supervisor/frontend.err.log

# Common issues:
# 1. Missing dependencies
cd /app/frontend && yarn install

# 2. Build errors
cd /app/frontend && yarn build

# 3. Port already in use
sudo lsof -i :3000
sudo kill -9 <PID>

# Restart
sudo supervisorctl restart frontend
```

**Problem**: API calls failing
```bash
# Check backend URL
grep REACT_APP_BACKEND_URL /app/frontend/.env

# Test backend
curl http://localhost:8001/api/health

# Check CORS settings in backend
grep CORS /app/backend/server.py
```

**Problem**: Firebase errors
```bash
# Check Firebase config
cat /app/frontend/src/config/firebase.js

# Verify Firebase project
# - Check API key
# - Check project ID
# - Check database URL
```

### Database Issues

**Problem**: Empty collections
```bash
# Check if init scripts ran
grep "IELTS Listening Practice Test 1" /var/log/supervisor/backend.*.log

# Manually run init scripts
cd /app/backend
python3 init_ielts_test.py
python3 init_reading_test.py
python3 init_writing_test.py
```

**Problem**: Questions not appearing
```bash
# Check question indices
mongo ielts_platform --eval "db.questions.find().forEach(function(q) { print(q.index); })"

# Re-index questions if needed
python3 /app/debug_reindex.py
```

### Performance Issues

**Problem**: High CPU usage
```bash
# Check CPU usage
top -bn1 | grep "Cpu(s)"

# Identify heavy processes
ps aux --sort=-%cpu | head -10

# Restart services to clear memory
sudo supervisorctl restart all
```

**Problem**: Slow API responses
```bash
# Check MongoDB performance
mongo ielts_platform --eval "db.currentOp()"

# Add indexes if needed
mongo ielts_platform --eval "db.exams.createIndex({id: 1})"

# Monitor backend logs
tail -f /var/log/supervisor/backend.*.log | grep "slow"
```

---

## 📝 Quick Reference

### Important File Locations

| File | Path | Purpose |
|------|------|---------|
| Main Backend | `/app/backend/server.py` | FastAPI application |
| Main Frontend | `/app/frontend/src/App.js` | React root component |
| Test Results | `/app/test_result.md` | Testing logs & task tracking |
| Codebase Index | `/app/COMPREHENSIVE_CODEBASE_INDEX.md` | This file |
| Requirements | `/app/backend/requirements.txt` | Python dependencies |
| Package JSON | `/app/frontend/package.json` | Node dependencies |
| Firebase Config | `/app/frontend/src/config/firebase.js` | Firebase credentials |
| Backend Env | `/app/backend/.env` | Backend environment variables |
| Frontend Env | `/app/frontend/.env` | Frontend environment variables |

### Admin Emails

- aminulislam004474@gmail.com
- shahsultanweb@gmail.com

### Default Tests

| Test | Exam ID | Duration | Questions |
|------|---------|----------|-----------|
| Listening | ielts-listening-practice-test-1 | 33:24 | 40 |
| Reading | ielts-reading-practice-test-1 | 60:00 | 40 |
| Writing | ielts-writing-practice-test-1 | 60:00 | 2 |

### Service URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001/api
- **API Documentation**: http://localhost:8001/docs
- **MongoDB**: mongodb://localhost:27017/ielts_platform

### Common Commands

```bash
# Services
sudo supervisorctl status
sudo supervisorctl restart all
sudo supervisorctl restart backend
sudo supervisorctl restart frontend

# Logs
tail -f /var/log/supervisor/backend.*.log
tail -f /var/log/supervisor/frontend.*.log

# MongoDB
mongo ielts_platform
db.exams.find().pretty()
db.questions.count()
db.submissions.find().limit(5)

# Testing
curl http://localhost:8001/api/health
curl http://localhost:8001/api/exams/published

# Dependencies
cd /app/backend && pip install -r requirements.txt
cd /app/frontend && yarn install
```

---

## ✅ Feature Checklist

### Core Features
- ✅ Student authentication (Google OAuth)
- ✅ Admin authentication (whitelist-based)
- ✅ Student profile completion
- ✅ Student approval workflow
- ✅ Exam creation and management
- ✅ Question CRUD operations
- ✅ Three test types (Listening, Reading, Writing)
- ✅ Audio upload system
- ✅ Test control (Start/Stop)
- ✅ Status polling (3-second interval)
- ✅ Auto-grading system
- ✅ Manual grading (interactive marking)
- ✅ Score visibility control
- ✅ Result publishing
- ✅ Submission management (3-level hierarchy)
- ✅ Progress chart
- ✅ Enhanced timer with auto-submit
- ✅ QTI-style navigation
- ✅ Text highlighting and notes
- ✅ AI import system
- ✅ Track library management
- ✅ Analytics dashboard
- ✅ CSV export

### Question Types Supported
**Listening**:
- ✅ Short Answer
- ✅ Multiple Choice
- ✅ Map Labeling
- ✅ Diagram Labeling

**Reading**:
- ✅ Matching Paragraphs
- ✅ Sentence Completion
- ✅ True/False/Not Given
- ✅ Short Answer Reading
- ✅ Sentence Completion Wordlist

**Writing**:
- ✅ Writing Task (with word counter)

---

## 📊 System Status

### Services
- ✅ Backend: RUNNING on port 8001
- ✅ Frontend: RUNNING on port 3000
- ✅ MongoDB: RUNNING on port 27017
- ❌ Code Server: STOPPED (not required)

### Statistics
- **Total Lines of Code**: ~20,000+ lines
- **Backend Files**: 7 Python files
- **Frontend Components**: 107 JS/JSX files
- **API Endpoints**: 50+ endpoints
- **Database Collections**: 6 MongoDB + 3 Firebase
- **Question Types**: 10 types across 3 test formats

---

**Last Updated**: After System Reinitialization (Post Memory Limit Exceeded)
**Status**: ✅ Comprehensive Index Complete
**Next Steps**: Ready for development tasks

---

## 📞 Support

For issues or questions:
1. Check logs: `tail -f /var/log/supervisor/*.log`
2. Verify service status: `sudo supervisorctl status`
3. Review test_result.md for known issues
4. Check this index for implementation details
5. Use troubleshooting section above

---

**End of Comprehensive Codebase Index**
