# IELTS Listening Test Platform - Complete Codebase Index

## 📋 Project Overview
Complete IELTS Listening practice test platform with admin management, student authentication, real-time test control, and auto-grading system.

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 with React Router, Tailwind CSS, Recharts
- **Backend**: FastAPI (Python) with async/await
- **Database**: MongoDB + Firebase Realtime Database
- **Authentication**: Firebase Google OAuth
- **File Storage**: Local file system for audio tracks

### Service Ports
- **Frontend**: Port 3000 (React Dev Server)
- **Backend**: Port 8001 (FastAPI with Uvicorn)
- **MongoDB**: Port 27017 (Internal)

---

## 📁 Directory Structure

```
/app/
├── backend/                      # FastAPI Backend
│   ├── server.py                # Main API server (1145 lines)
│   ├── auth_service.py          # Authentication & session management
│   ├── init_ielts_test.py      # Initialize default IELTS test
│   └── requirements.txt         # Python dependencies
│
├── frontend/                     # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/          # Admin Panel Components
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminLogin.jsx
│   │   │   │   ├── AdminRouter.jsx
│   │   │   │   ├── AudioUpload.jsx
│   │   │   │   ├── FirebaseSubmissionReview.jsx
│   │   │   │   ├── QuestionManager.jsx
│   │   │   │   ├── StudentManagement.jsx
│   │   │   │   ├── SubmissionManagement.jsx
│   │   │   │   └── TestManagement.jsx  # ⭐ Test Start/Stop Controls
│   │   │   │
│   │   │   ├── student/        # Student Components
│   │   │   │   ├── CompleteProfile.jsx
│   │   │   │   ├── ProgressChart.jsx
│   │   │   │   ├── StudentDashboard.jsx  # ⭐ Shows test status & polling
│   │   │   │   ├── StudentHome.jsx
│   │   │   │   └── WaitingForApproval.jsx
│   │   │   │
│   │   │   ├── common/         # Shared Components
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   └── Toast.jsx
│   │   │   │
│   │   │   ├── ExamTest.jsx    # Main exam interface
│   │   │   ├── Header.jsx
│   │   │   ├── Homepage.jsx
│   │   │   ├── ListeningInstructions.jsx
│   │   │   ├── ListeningTest.jsx  # Exam UI with timer
│   │   │   └── SoundTest.jsx
│   │   │
│   │   ├── services/           # API Service Layer
│   │   │   ├── BackendService.js      # ⭐ FastAPI endpoints
│   │   │   ├── FirebaseAuthService.js  # Firebase auth
│   │   │   ├── FirebaseService.js
│   │   │   └── AudioService.js
│   │   │
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx       # Global auth state
│   │   │
│   │   ├── config/
│   │   │   └── firebase.js          # Firebase configuration
│   │   │
│   │   ├── App.js               # Main app with routing
│   │   └── index.js             # React entry point
│   │
│   ├── public/                  # Static assets
│   ├── package.json            # Node dependencies
│   └── tailwind.config.js      # Tailwind configuration
│
├── listening_tracks/            # Audio file storage
│   ├── README.md
│   └── .gitignore
│
├── scripts/
│   └── create_ielts_test.py    # Test creation script
│
├── tests/                       # Test files
│
└── Documentation Files
    ├── README.md                # Main project documentation
    ├── CODEBASE_INDEX.md       # This file
    ├── test_result.md          # Testing logs & task tracking
    ├── FIREBASE_DEPLOYMENT.md
    ├── FIREBASE_MIGRATION_SUMMARY.md
    ├── STUDENT_APPROVAL_SYSTEM.md
    ├── SUBMISSION_MANAGEMENT_GUIDE.md
    ├── ADMIN_QUICK_GUIDE.md
    └── [Other documentation files]
```

---

## 🔑 Key Features Implementation

### 1. ⭐ Test Control System (Start/Stop Tests)

#### Backend Endpoints
**Location**: `/app/backend/server.py` (Lines 1032-1137)

```python
# Admin Only - Start Test
PUT /api/admin/exams/{exam_id}/start
- Sets is_active = True
- Records started_at timestamp
- Requires admin authentication

# Admin Only - Stop Test
PUT /api/admin/exams/{exam_id}/stop
- Sets is_active = False
- Records stopped_at timestamp
- Requires admin authentication

# Public - Poll Test Status
GET /api/exams/{exam_id}/status
- Returns is_active, started_at, stopped_at, published
- No authentication required
- Used by students for real-time status checking
```

#### Frontend Admin Interface
**Location**: `/app/frontend/src/components/admin/TestManagement.jsx` (Lines 118-144, 230-254)

**Features:**
- Green "Start" button when test is inactive
- Red "Stop" button when test is active
- Only appears for published tests
- Shows toast notifications on success/failure
- Updates exam list in real-time

**Functions:**
- `handleStartTest(testId)` - Calls BackendService.startExam()
- `handleStopTest(testId)` - Calls BackendService.stopExam() with confirmation

#### Frontend Student Interface
**Location**: `/app/frontend/src/components/student/StudentDashboard.jsx` (Lines 71-98, 246-249)

**Features:**
- Polls exam status every 3 seconds using `useEffect` hook
- Shows yellow banner: "Please wait for the test to begin." when test is not active
- Disables "Start Exam" button until test is active
- Button states:
  - ✅ "Start Exam" (blue) - When test is active and not completed
  - ❌ "Test Not Active" (gray) - When test is inactive
  - 🔒 "Already Completed" (gray) - When student has completed

**Polling Logic:**
```javascript
useEffect(() => {
  const pollStatuses = async () => {
    for (const exam of exams) {
      const status = await BackendService.getExamStatus(exam.id);
      statuses[exam.id] = status;
    }
    setExamStatuses(statuses);
  };
  
  pollStatuses(); // Initial poll
  const interval = setInterval(pollStatuses, 3000); // Poll every 3s
  return () => clearInterval(interval);
}, [exams]);
```

#### Service Layer
**Location**: `/app/frontend/src/services/BackendService.js` (Lines 101-129)

```javascript
BackendService = {
  startExam: async (examId) => {
    const response = await api.put(`/admin/exams/${examId}/start`);
    return response.data;
  },
  
  stopExam: async (examId) => {
    const response = await api.put(`/admin/exams/${examId}/stop`);
    return response.data;
  },
  
  getExamStatus: async (examId) => {
    const response = await api.get(`/exams/${examId}/status`);
    return response.data;
  }
}
```

---

### 2. 🎓 Student Authentication & Management

#### Firebase Google OAuth
**Location**: `/app/frontend/src/services/FirebaseAuthService.js`

**Features:**
- Google Sign-In integration
- Admin whitelist (aminulislam004474@gmail.com, shahsultanweb@gmail.com)
- Profile completion workflow
- Student approval system (pending → approved/rejected)
- Submission tracking

#### Student Dashboard
**Location**: `/app/frontend/src/components/student/StudentDashboard.jsx`

**Features:**
- Available exams list with real-time status
- Submission history with scores
- Progress chart (Recharts bar chart)
- Statistics cards
- One-time exam attempt enforcement

---

### 3. 📝 Exam Management

#### Test Management
**Location**: `/app/frontend/src/components/admin/TestManagement.jsx`

**Features:**
- Create/Edit/Delete exams
- Publish/Unpublish
- Start/Stop test controls
- Search functionality
- Question count and duration display

#### Question Manager
**Location**: `/app/frontend/src/components/admin/QuestionManager.jsx`

**Features:**
- 4 sections management
- Question CRUD operations
- Supports 4 question types:
  - Short Answer
  - Multiple Choice
  - Map Labeling (with images)
  - Diagram Labeling (with images)
- Audio upload integration

---

### 4. 🎵 Audio System

#### Audio Upload
**Location**: `/app/frontend/src/components/admin/AudioUpload.jsx`

**Features:**
- File upload to `/listening_tracks/` directory
- Supports MP3, WAV, M4A, OGG, FLAC
- Backend endpoint: POST /api/upload-audio
- UUID-based file naming
- Static file serving at /listening_tracks/

**Backend Implementation:**
**Location**: `/app/backend/server.py` (Lines 950-980)

---

### 5. ✅ Auto-Grading System

**Location**: `/app/backend/server.py` (Submission creation endpoint)

**Features:**
- Automatic answer comparison
- Case-insensitive for short_answer/diagram_labeling
- Exact match for multiple_choice/map_labeling
- Calculates score and percentage
- Stores correct_answers count

---

### 6. 📊 Submission Management

#### Admin Submission Review
**Location**: `/app/frontend/src/components/admin/SubmissionManagement.jsx`

**Features:**
- View all submissions
- Filter by student/exam/status
- Sort by date/score/percentage
- Manual score editing
- CSV export
- Pass/Fail badges
- Progress bars

#### Backend Endpoints
```python
GET /api/submissions/{id}/detailed  # Full submission with questions
PUT /api/submissions/{id}/score     # Update score manually (admin only)
GET /api/exams/{exam_id}/submissions # All submissions for exam
```

---

### 7. ⏱️ Enhanced Timer System

**Location**: `/app/frontend/src/components/ListeningTest.jsx`

**Features:**
- 3D gradient design with shadow effects
- Red/white pulsing animation in final 2 minutes
- Auto-submit when timer expires
- Completion screen
- Dynamic padding for fixed header

**Tailwind Animation:**
**Location**: `/app/frontend/tailwind.config.js`

```javascript
keyframes: {
  'timer-fade': {
    '0%, 100%': { backgroundColor: '#ef4444', color: '#fff' },
    '50%': { backgroundColor: '#fef2f2', color: '#ef4444' }
  }
}
```

---

## 🔐 Authentication Flow

### Admin Flow
1. Navigate to `/admin/login`
2. Sign in with Google OAuth
3. Check email against whitelist
4. Redirect to `/admin/dashboard`

### Student Flow
1. Navigate to `/student/login`
2. Sign in with Google OAuth
3. If new user → Complete profile → Approval pending
4. If approved → Student dashboard
5. Select exam → Wait for admin to start → Take test → View results

---

## 🗄️ Database Schema

### MongoDB Collections

#### Exams
```javascript
{
  id: "uuid",
  title: "string",
  description: "string",
  duration: 2004, // seconds
  question_count: 40,
  audio_url: "string",
  published: true,
  is_active: false,  // ⭐ Test control
  started_at: null,  // ⭐ Test control
  stopped_at: null,  // ⭐ Test control
  created_at: "timestamp",
  updated_at: "timestamp"
}
```

#### Sections
```javascript
{
  id: "uuid",
  exam_id: "uuid",
  section_number: 1,
  title: "Section 1",
  description: "string"
}
```

#### Questions
```javascript
{
  id: "uuid",
  section_id: "uuid",
  index: 1,
  question_type: "short_answer|multiple_choice|map_labeling|diagram_labeling",
  prompt: "string",
  options: ["A", "B", "C", "D"],  // for multiple choice
  image_url: "string",  // for map/diagram labeling
  answer_key: "correct_answer"
}
```

#### Submissions
```javascript
{
  id: "uuid",
  exam_id: "uuid",
  student_id: "uuid", // Firebase UID
  answers: {"1": "answer1", "2": "answer2", ...},
  score: 35,
  total_questions: 40,
  correct_answers: 35,
  manually_graded: false,
  submitted_at: "timestamp"
}
```

### Firebase Realtime Database

#### Students
```javascript
/students/{uid}
{
  uid: "string",
  email: "string",
  displayName: "string",
  photoURL: "string",
  phone: "string",
  institution: "string",
  department: "string",
  rollNumber: "string",
  status: "pending|approved|rejected|inactive",
  createdAt: "timestamp"
}
```

#### Submissions (Firebase)
```javascript
/submissions/{submissionId}
{
  examId: "string",
  studentId: "uid",
  examTitle: "string",
  score: 35,
  totalQuestions: 40,
  submittedAt: "timestamp"
}
```

---

## 🚀 Running the Application

### Start All Services
```bash
sudo supervisorctl restart all
```

### Individual Services
```bash
sudo supervisorctl restart frontend
sudo supervisorctl restart backend
```

### Check Status
```bash
sudo supervisorctl status
```

### View Logs
```bash
# Backend logs
tail -f /var/log/supervisor/backend.*.log

# Frontend logs
tail -f /var/log/supervisor/frontend.*.log
```

---

## 🔧 Development Workflow

### Backend Development
1. Edit `/app/backend/server.py`
2. Hot reload enabled (FastAPI auto-reloads)
3. Check logs: `tail -f /var/log/supervisor/backend.*.log`

### Frontend Development
1. Edit files in `/app/frontend/src/`
2. Hot reload enabled (React Dev Server)
3. Changes reflect immediately in browser

### Database Changes
1. Backend connects via `MONGO_URL` env variable
2. Firebase config in `/app/frontend/src/config/firebase.js`

---

## 📝 Important Files to Modify

### Change Test Status Message
**File**: `/app/frontend/src/components/student/StudentDashboard.jsx`
**Line**: 248
```jsx
// Changed from: "Waiting for admin to start this test..."
// Changed to: "Please wait for the test to begin."
```

### Add Admin Emails
**File**: `/app/backend/server.py`
**Variable**: `ADMIN_EMAILS`

### Modify Test Control
**Files**:
- Backend: `/app/backend/server.py` (lines 1032-1137)
- Frontend Admin: `/app/frontend/src/components/admin/TestManagement.jsx`
- Frontend Student: `/app/frontend/src/components/student/StudentDashboard.jsx`
- Service: `/app/frontend/src/services/BackendService.js`

---

## 🧪 Testing

### Backend Testing
Use the testing agent to test backend endpoints:
- Test control endpoints (start/stop/status)
- Submission endpoints
- Exam CRUD operations

### Frontend Testing
Manual testing workflow:
1. Admin login → Start test
2. Student login → See "Please wait for test to begin" message
3. Verify button is disabled
4. Admin starts test
5. Student polls status (every 3s)
6. Button becomes enabled
7. Student takes test

---

## 📚 Key Documentation Files

1. **test_result.md** - Complete testing logs and task tracking
2. **FIREBASE_DEPLOYMENT.md** - Firebase deployment guide
3. **STUDENT_APPROVAL_SYSTEM.md** - Approval workflow documentation
4. **SUBMISSION_MANAGEMENT_GUIDE.md** - Admin submission management
5. **ADMIN_QUICK_GUIDE.md** - Quick reference for admins

---

## ✅ Recent Changes (Current Session)

### 1. Text Update
**File**: `/app/frontend/src/components/student/StudentDashboard.jsx`
**Line**: 248
**Change**: "Waiting for admin to start this test..." → "Please wait for the test to begin."
**Status**: ✅ Completed, frontend restarted

### 2. Test Control Verification
**Status**: ✅ Verified - All components working:
- Backend endpoints exist and tested
- Admin UI has Start/Stop buttons
- Student UI has polling mechanism
- Service layer methods implemented

---

## 🎯 System Status

### Services
- ✅ Backend: RUNNING (pid 447, uptime 0:02:19)
- ✅ Frontend: RUNNING (pid 527, uptime 0:01:48)
- ✅ MongoDB: RUNNING (pid 42, uptime 0:06:37)
- ✅ Code Server: RUNNING (pid 39, uptime 0:06:37)

### Features
- ✅ Test Control System (Start/Stop)
- ✅ Student Status Polling (3 second interval)
- ✅ Auto-grading System
- ✅ Manual Score Editing
- ✅ Firebase Authentication
- ✅ Student Approval Workflow
- ✅ Progress Charts
- ✅ Enhanced Timer with Auto-submit
- ✅ Audio Upload System
- ✅ Submission Management

---

## 🔗 Quick Links

### URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001/api
- API Docs: http://localhost:8001/docs

### Admin Emails
- aminulislam004474@gmail.com
- shahsultanweb@gmail.com

### Default Test
- ID: ielts-listening-practice-test-1
- Title: IELTS Listening Practice Test 1
- Duration: 2004 seconds (33:24 min)
- Questions: 40

---

**Last Updated**: Current Session
**Codebase Status**: ✅ Fully Indexed and Documented
