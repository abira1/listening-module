# Track System Implementation - Agent Handoff Document

**Date:** January 2025  
**Status:** Phase 1 - Core Foundation Complete (40%)  
**Next Agent Tasks:** Complete Admin UI, Student Interface, Integration & Testing

---

## 📊 Current State Summary

### ✅ What's Been Completed

**Backend (100% of Phase 1 backend):**
- ✅ Complete data models with validation (`track_models.py`)
- ✅ Track CRUD API - 15 endpoints (`track_api.py`)
- ✅ Exam & Submission API - 8 endpoints (`exam_track_api.py`)
- ✅ Audio upload support (file + URL)
- ✅ Question management with re-indexing
- ✅ Track validation logic
- ✅ Sequential track progression with waiting screen support

**Frontend (70% of Phase 1 frontend):**
- ✅ 9 question type components built
- ✅ Universal QuestionWrapper for rendering
- ✅ Exact UI match from reference repository
- ✅ Read-only mode support
- ✅ Word count validation
- ✅ Image attachment support

**Documentation:**
- ✅ Complete implementation plan
- ✅ Database schemas documented
- ✅ API endpoint specifications

### ❌ What's Missing (Your Tasks)

1. **Server Integration** - Add new API routers to main server
2. **Admin Track Management UI** - Full CRUD interface for tracks
3. **Student Exam Interface** - Track rendering with autosave
4. **Waiting Screen Component** - 120-second countdown
5. **Migration Script** - Convert existing tests to tracks
6. **Testing** - Unit and E2E tests
7. **Documentation** - Usage guides

---

## 🎯 Task 1: Integrate Track APIs into Server

### **Prompt for Next Agent:**

```
Integrate the new Track System APIs into the main FastAPI server.

TASKS:
1. Update `/app/backend/server.py` to import and include the new routers:
   - Import from `track_api` and `exam_track_api`
   - Add routers: `app.include_router(track_api.get_router())`
   - Add routers: `app.include_router(exam_track_api.get_router())`

2. Ensure MongoDB connection is available in request.app.state.db

3. Test all endpoints with curl:
   - POST /api/tracks (create track)
   - GET /api/tracks (list tracks)
   - POST /api/exams/from-tracks (create exam)

FILES TO MODIFY:
- `/app/backend/server.py` - Add router imports and includes

VALIDATION:
- All endpoints should return 200/201 responses
- MongoDB collections 'tracks', 'exams', 'submissions' should be created
- Audio upload should work and save to /app/listening_tracks/

DO NOT modify existing endpoints - only add the new ones.
```

### Code Example:

```python
# Add to /app/backend/server.py

from track_api import get_router as get_track_router
from exam_track_api import get_router as get_exam_track_router

# After existing router includes:
app.include_router(get_track_router())
app.include_router(get_exam_track_router())
```

---

## 🎯 Task 2: Admin Track Management UI

### **Prompt for Next Agent:**

```
Build the complete Admin Track Management interface with create, edit, list, and delete functionality.

REQUIREMENTS:

1. CREATE NEW PAGE: `/app/frontend/src/components/admin/TrackManagement.jsx`
   - List all tracks in a table (title, type, status, questions count, actions)
   - Filter by type (listening/reading/writing)
   - Search by title
   - "Create Track" button → opens TrackEditor
   - Edit/Delete actions for each track
   - Publish/Unpublish toggle

2. CREATE NEW PAGE: `/app/frontend/src/components/admin/TrackEditor.jsx`
   - Stepper UI with 4 steps:
     * Step 1: Metadata (title, type, description, time limit)
     * Step 2: Audio (only for listening - upload file OR URL)
     * Step 3: Sections & Questions (4 sections, add/edit/delete questions)
     * Step 4: Review & Publish
   
3. CREATE NEW COMPONENT: `/app/frontend/src/components/admin/QuestionEditorModal.jsx`
   - Modal for adding/editing questions
   - Question type dropdown (show only 9 implemented types)
   - Dynamic form fields based on selected type
   - Image upload for types that support it
   - Validation before save

4. CREATE SERVICE: `/app/frontend/src/services/TrackService.js`
   - API wrapper for all track endpoints
   - Methods: createTrack, listTracks, getTrack, updateTrack, deleteTrack
   - Audio upload: uploadAudio, setAudioUrl
   - Questions: addQuestion, updateQuestion, deleteQuestion
   - Validation: validateTrack, publishTrack

5. UPDATE ADMIN ROUTER: Add route `/admin/tracks` to AdminRouter.jsx

DESIGN PATTERN:
- Use existing admin panel styling (same as TestManagement.jsx)
- Use Tailwind CSS classes
- Add lucide-react icons
- Stepper from shadcn/ui or custom
- Drag-and-drop for question reordering (react-beautiful-dnd)

QUESTION TYPE MAPPING (for dropdown):
{
  "Listening": [
    { value: "short_answer_listening", label: "Short Answer" },
    { value: "multiple_choice_single", label: "Multiple Choice (Single)" },
    { value: "multiple_choice_multiple", label: "Multiple Choice (Multiple)" },
    { value: "matching", label: "Matching (Drag & Drop)" },
    { value: "diagram_labeling", label: "Diagram Labeling" }
  ],
  "Reading": [
    { value: "true_false_not_given", label: "True/False/Not Given" },
    { value: "sentence_completion_reading", label: "Sentence Completion" },
    { value: "matching_paragraphs", label: "Matching Paragraphs" }
  ],
  "Writing": [
    { value: "writing_task", label: "Writing Task (Essay/Report)" }
  ]
}

VALIDATION RULES:
- Track must have a title (3-200 chars)
- Track must have a type selected
- Listening tracks must have audio configured
- Each section can have 0-10 questions
- Questions must have all required payload fields
- Show validation errors prominently

FILE STRUCTURE:
/app/frontend/src/
  components/admin/
    TrackManagement.jsx          (main list page)
    TrackEditor.jsx              (stepper form)
    QuestionEditorModal.jsx      (question form modal)
  services/
    TrackService.js              (API wrapper)

REFERENCE EXISTING COMPONENTS:
- Look at `/app/frontend/src/components/admin/TestManagement.jsx` for styling
- Look at `/app/frontend/src/components/admin/QuestionManager.jsx` for patterns
- Use same button styles, card layouts, and spacing

TEST AFTER BUILDING:
1. Create a listening track with 2 questions
2. Upload audio file
3. Edit and add more questions
4. Validate track (should pass with 2 questions as draft)
5. Delete track
```

### UI Mockup for TrackEditor:

```
┌─────────────────────────────────────────────────────────┐
│  Create Track                                     [X]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ①──②──③──④                                            │
│  ▓  ▓  ░  ░                                            │
│  Metadata Audio Sections Review                        │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Step 2: Audio Configuration                      │ │
│  ├──────────────────────────────────────────────────┤ │
│  │                                                   │ │
│  │ Audio Upload Method:                             │ │
│  │ ⦿ Upload from device   ○ External URL            │ │
│  │                                                   │ │
│  │ ┌───────────────────────────────────┐            │ │
│  │ │  Drag & drop audio file here      │            │ │
│  │ │  or click to browse               │            │ │
│  │ │                                   │            │ │
│  │ │  Supported: MP3, WAV, M4A, OGG    │            │ │
│  │ └───────────────────────────────────┘            │ │
│  │                                                   │ │
│  │ Audio Preview:                                   │ │
│  │ ▶ ━━━━━━━━━━━━━━━━━━━ 🔊  2:34 / 31:24          │ │
│  │                                                   │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│               [← Back]        [Next: Sections →]       │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Task 3: Student Track Exam Interface

### **Prompt for Next Agent:**

```
Build the student exam interface that renders tracks with questions, timer, and autosave.

REQUIREMENTS:

1. CREATE NEW COMPONENT: `/app/frontend/src/components/TrackExam.jsx`
   - Displays one track at a time
   - Fixed header with timer and student info
   - Renders all questions using QuestionWrapper
   - Fixed footer with QTI-style navigation (40 questions)
   - Audio player for listening tracks
   - Auto-submit when timer expires
   - Autosave answers every 3 seconds (debounced)

2. CREATE NEW COMPONENT: `/app/frontend/src/components/WaitingScreen.jsx`
   - 120-second countdown timer (large display)
   - Track progress indicator ("Track 1 of 3 completed")
   - Optional "Skip Wait & Start Now" button
   - Motivational message
   - Auto-navigates to next track when countdown ends

3. CREATE SERVICE: `/app/frontend/src/services/ExamTrackService.js`
   - startExam(examId) → returns { submission_id, first_track, settings }
   - nextTrack(submissionId) → returns { has_next, next_track, wait_seconds }
   - autosaveAnswer(submissionId, trackId, questionId, answer)
   - submitExam(submissionId)

4. MODIFY EXISTING: `/app/frontend/src/components/ExamTest.jsx`
   - Detect if exam is track-based (check exam.tracks)
   - If track-based, use TrackExam component
   - Otherwise, use existing ListeningTest/ReadingTest

LAYOUT STRUCTURE:

TrackExam.jsx:
┌─────────────────────────────────────────────────┐
│ HEADER (fixed)                                  │
│ ⏱ Timer: 42:15 | Track 1 of 3 | Student: John │
├─────────────────────────────────────────────────┤
│                                                 │
│ [Audio Player] (if listening track)             │
│                                                 │
│ Section 1                                       │
│ ┌─────────────────────────────────────────────┐ │
│ │ 1. Question rendered via QuestionWrapper    │ │
│ │ 2. Question rendered via QuestionWrapper    │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Section 2                                       │
│ [Questions 11-20...]                            │
│                                                 │
├─────────────────────────────────────────────────┤
│ FOOTER (fixed) - QTI Navigation                 │
│ [1][2][3][4][5]...[40]  [← Prev] [Next →]     │
└─────────────────────────────────────────────────┘

WaitingScreen.jsx:
┌─────────────────────────────────────────────────┐
│                                                 │
│            Next Track Starting In               │
│                                                 │
│                  [ 1:47 ]                      │
│               (large countdown)                 │
│                                                 │
│         Track 2 of 3: Reading Test             │
│                                                 │
│      ✓ Track 1 completed (35/40 correct)       │
│                                                 │
│         [Skip Wait & Start Now]                │
│                                                 │
└─────────────────────────────────────────────────┘

AUTOSAVE LOGIC:

```javascript
import { debounce } from 'lodash';

const [answers, setAnswers] = useState({});

// Debounced autosave function
const autosave = useCallback(
  debounce(async (questionId, answer) => {
    try {
      await ExamTrackService.autosaveAnswer(
        submissionId,
        currentTrack.id,
        questionId,
        answer
      );
      console.log('✓ Saved:', questionId);
    } catch (error) {
      console.error('✗ Autosave failed:', error);
      // Store in localStorage as backup
      localStorage.setItem(
        `backup_${submissionId}_${questionId}`,
        JSON.stringify({ questionId, answer, timestamp: Date.now() })
      );
    }
  }, 3000),
  [submissionId, currentTrack]
);

const handleAnswerChange = (questionId, answer) => {
  // Update state immediately (optimistic UI)
  setAnswers(prev => ({ ...prev, [questionId]: answer }));
  
  // Trigger debounced autosave
  autosave(questionId, answer);
};
```

TIMER LOGIC:

```javascript
const [timeRemaining, setTimeRemaining] = useState(track.time_limit_seconds);

useEffect(() => {
  const timer = setInterval(() => {
    setTimeRemaining(prev => {
      if (prev <= 1) {
        // Time's up - auto submit
        handleAutoSubmit();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  
  return () => clearInterval(timer);
}, []);

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

TRACK PROGRESSION FLOW:

```javascript
const handleTrackComplete = async () => {
  try {
    // Get next track
    const response = await ExamTrackService.nextTrack(submissionId);
    
    if (!response.has_next) {
      // All tracks done - show completion
      navigate('/exam-complete');
      return;
    }
    
    if (response.waiting_required) {
      // Show waiting screen
      setShowWaiting(true);
      setWaitSeconds(response.wait_seconds);
      setNextTrack(response.next_track);
    } else {
      // Load next track immediately
      setCurrentTrack(response.next_track);
      setTrackIndex(prev => prev + 1);
    }
  } catch (error) {
    console.error('Error progressing:', error);
  }
};
```

QUESTION RENDERING:

```javascript
import { QuestionWrapper } from './track-questions/QuestionWrapper';

// In TrackExam.jsx
{track.sections.map(section => (
  <div key={section.id} className="mb-8">
    <h2 className="text-xl font-bold mb-4">{section.title}</h2>
    
    {section.questions.map((question, idx) => {
      const questionNumber = calculateGlobalNumber(section.order, idx);
      
      return (
        <QuestionWrapper
          key={question.id}
          question={question}
          answer={answers[question.id]}
          onChange={(answer) => handleAnswerChange(question.id, answer)}
          questionNumber={questionNumber}
        />
      );
    })}
  </div>
))}
```

FILES TO CREATE:
- `/app/frontend/src/components/TrackExam.jsx` - Main exam interface
- `/app/frontend/src/components/WaitingScreen.jsx` - Countdown between tracks
- `/app/frontend/src/services/ExamTrackService.js` - API wrapper

FILES TO MODIFY:
- `/app/frontend/src/components/ExamTest.jsx` - Add track-based detection
- `/app/frontend/src/App.js` - Add route for track exams if needed

TESTING:
1. Start a track-based exam
2. Answer 5 questions
3. Check browser network tab - autosave should fire every 3s
4. Refresh page - answers should persist (from autosave)
5. Complete track 1
6. Waiting screen should show with countdown
7. After countdown, track 2 should load
8. Complete all tracks
9. Final submission should combine all answers
```

---

## 🎯 Task 4: Migration Script

### **Prompt for Next Agent:**

```
Create a migration script to convert existing IELTS tests to the new Track format.

REQUIREMENTS:

Create: `/app/scripts/migrate_to_tracks.py`

The script should:
1. Read existing exams from MongoDB (exams, sections, questions collections)
2. Convert each exam to a Track:
   - Exam → Track (with same title, type, audio_url)
   - Sections → Track.sections (4 sections)
   - Questions → Track.sections[n].questions
   - Map old question types to new types
3. Validate each track
4. Insert into 'tracks' collection
5. Create a new exam using the track
6. Mark old exam as 'archived' (don't delete)

QUESTION TYPE MAPPING:

Old Type → New Type:
- "short_answer" → "short_answer_listening"
- "multiple_choice" → "multiple_choice_single"
- "map_labeling" → "map_labeling" (if has image)
- "diagram_labeling" → "diagram_labeling"
- "matching_paragraphs" → "matching_paragraphs"
- "true_false_not_given" → "true_false_not_given"
- "sentence_completion" → "sentence_completion_reading"
- "writing_task" → "writing_task"

SCRIPT STRUCTURE:

```python
#!/usr/bin/env python3
"""
Migration Script: Convert Old Exams to Track Format
Usage: python scripts/migrate_to_tracks.py
"""

import sys
sys.path.append('/app/backend')

from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from track_models import Track, Section, Question, AudioConfig
from datetime import datetime

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'ielts_platform')

async def migrate():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🔄 Starting migration...")
    
    # Get all published exams
    exams = await db.exams.find({"published": True}).to_list(length=100)
    print(f"Found {len(exams)} exams to migrate")
    
    for exam in exams:
        print(f"\n📝 Migrating: {exam['title']}")
        
        try:
            # Get sections for this exam
            sections_data = await db.sections.find(
                {"exam_id": exam['id']}
            ).sort("index", 1).to_list(length=10)
            
            # Create track sections
            track_sections = []
            for idx, section_data in enumerate(sections_data[:4], 1):
                # Get questions for this section
                questions_data = await db.questions.find(
                    {"section_id": section_data['id']}
                ).sort("index", 1).to_list(length=20)
                
                # Convert questions
                track_questions = []
                for q_idx, q in enumerate(questions_data[:10], 1):
                    # Map old type to new type
                    new_type = map_question_type(q['type'], exam['exam_type'])
                    
                    question = Question(
                        order=q_idx,
                        type=new_type,
                        payload=q.get('payload', {}),
                        marks=q.get('marks', 1)
                    )
                    track_questions.append(question)
                
                section = Section(
                    order=idx,
                    title=section_data.get('title', f'Section {idx}'),
                    questions=track_questions
                )
                track_sections.append(section)
            
            # Ensure 4 sections (add empty if needed)
            while len(track_sections) < 4:
                track_sections.append(Section(
                    order=len(track_sections) + 1,
                    title=f'Section {len(track_sections) + 1}',
                    questions=[]
                ))
            
            # Create audio config if listening
            audio_config = None
            if exam.get('exam_type') == 'listening' and exam.get('audio_url'):
                audio_config = AudioConfig(
                    method='url',
                    url=exam['audio_url']
                )
            
            # Create track
            track = Track(
                title=exam['title'],
                type=exam.get('exam_type', 'listening'),
                description=exam.get('description', ''),
                created_by='migration_script',
                status='published',
                time_limit_seconds=exam.get('duration_seconds', 2700),
                audio=audio_config,
                sections=track_sections
            )
            
            # Validate
            validation = track.validate_track()
            if not validation.is_valid:
                print(f"  ⚠️  Validation warnings: {validation.errors}")
            
            # Insert track
            track_dict = track.dict(by_alias=True)
            await db.tracks.insert_one(track_dict)
            print(f"  ✓ Track created: {track.id}")
            
            # Archive old exam (don't delete)
            await db.exams.update_one(
                {"id": exam['id']},
                {"$set": {"archived": True, "archived_at": datetime.utcnow().isoformat()}}
            )
            
        except Exception as e:
            print(f"  ✗ Error: {e}")
            continue
    
    print("\n✅ Migration complete!")
    client.close()

def map_question_type(old_type, exam_type):
    """Map old question type to new type"""
    mapping = {
        'listening': {
            'short_answer': 'short_answer_listening',
            'multiple_choice': 'multiple_choice_single',
            'map_labeling': 'map_labeling',
            'diagram_labeling': 'diagram_labeling',
        },
        'reading': {
            'matching_paragraphs': 'matching_paragraphs',
            'sentence_completion': 'sentence_completion_reading',
            'true_false_not_given': 'true_false_not_given',
            'short_answer_reading': 'short_answer_reading',
        },
        'writing': {
            'writing_task': 'writing_task',
        }
    }
    
    return mapping.get(exam_type, {}).get(old_type, old_type)

if __name__ == '__main__':
    asyncio.run(migrate())
```

RUN THE SCRIPT:
```bash
cd /app
python scripts/migrate_to_tracks.py
```

VERIFY MIGRATION:
1. Check MongoDB: db.tracks.find().count() should match exam count
2. Check all tracks have 4 sections
3. Check audio URLs are preserved
4. Check question types are correctly mapped
```

---

## 🎯 Task 5: Testing

### **Prompt for Next Agent:**

```
Write comprehensive tests for the Track System.

REQUIREMENTS:

1. BACKEND UNIT TESTS: `/app/tests/test_track_api.py`

```python
import pytest
from httpx import AsyncClient
from backend.server import app

@pytest.mark.asyncio
async def test_create_track():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/api/tracks", json={
            "title": "Test Listening Track",
            "type": "listening",
            "description": "Test track",
            "time_limit_seconds": 2700
        })
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Listening Track"
        assert len(data["sections"]) == 4

@pytest.mark.asyncio
async def test_add_question_to_section():
    # Create track first
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Create track
        track_resp = await client.post("/api/tracks", json={
            "title": "Test Track",
            "type": "listening",
            "time_limit_seconds": 2700
        })
        track_id = track_resp.json()["id"]
        
        # Add question
        response = await client.post(
            f"/api/tracks/{track_id}/sections/1/questions",
            json={
                "type": "short_answer_listening",
                "payload": {
                    "prompt": "What is the job type?",
                    "answer_key": "part-time",
                    "max_words": 2
                },
                "marks": 1
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["sections"][0]["questions"]) == 1

@pytest.mark.asyncio
async def test_upload_audio():
    # Test audio file upload
    pass  # Implement with file upload

@pytest.mark.asyncio
async def test_create_exam_from_tracks():
    # Test exam creation
    pass  # Implement
```

2. FRONTEND COMPONENT TESTS: `/app/frontend/src/components/track-questions/__tests__/`

Create test files for each question component:
- `ShortAnswerListening.test.jsx`
- `MultipleChoiceSingle.test.jsx`
- `TrueFalseNotGiven.test.jsx`

Example test:

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { ShortAnswerListening } from '../listening/ShortAnswerListening';

describe('ShortAnswerListening', () => {
  const mockQuestion = {
    payload: {
      prompt: 'What is the job type?',
      max_words: 2
    }
  };

  it('renders prompt correctly', () => {
    render(
      <ShortAnswerListening
        question={mockQuestion}
        answer=""
        onChange={() => {}}
        questionNumber={1}
      />
    );
    
    expect(screen.getByText('What is the job type?')).toBeInTheDocument();
  });

  it('calls onChange when input changes', () => {
    const handleChange = jest.fn();
    render(
      <ShortAnswerListening
        question={mockQuestion}
        answer=""
        onChange={handleChange}
        questionNumber={1}
      />
    );
    
    const input = screen.getByPlaceholderText('Type your answer here');
    fireEvent.change(input, { target: { value: 'part-time' } });
    
    expect(handleChange).toHaveBeenCalledWith('part-time');
  });

  it('shows word count warning when exceeded', () => {
    render(
      <ShortAnswerListening
        question={mockQuestion}
        answer="this is three words"
        onChange={() => {}}
        questionNumber={1}
      />
    );
    
    expect(screen.getByText(/Word limit exceeded/i)).toBeInTheDocument();
  });
});
```

3. E2E TESTS: `/app/tests/e2e/test_track_flow.py`

Use Playwright or Cypress to test:
- Admin creates track
- Admin uploads audio
- Admin adds questions
- Admin publishes track
- Admin creates exam from track
- Student starts exam
- Student completes first track
- Waiting screen shows
- Student completes second track
- Final submission succeeds

RUN TESTS:
```bash
# Backend
cd /app
pytest tests/test_track_api.py -v

# Frontend
cd /app/frontend
yarn test

# E2E
cd /app
pytest tests/e2e/test_track_flow.py -v
```
```

---

## 🎯 Task 6: Documentation

### **Prompt for Next Agent:**

```
Create user-facing documentation for the Track System.

FILES TO CREATE:

1. `/app/docs/ADMIN_TRACK_GUIDE.md`
   - How to create a track
   - How to add questions
   - How to upload audio
   - How to validate and publish
   - Screenshots/examples

2. `/app/docs/QUESTION_TYPE_GUIDE.md`
   - Complete reference for all 9 question types
   - Payload structure for each
   - Examples for each type
   - When to use which type

3. `/app/docs/API_TRACK_REFERENCE.md`
   - Complete API documentation
   - All endpoints with examples
   - Request/response schemas
   - Error codes

4. `/app/docs/TRACK_MIGRATION_GUIDE.md`
   - How to migrate from old system
   - What changes
   - How to run migration script
   - Rollback instructions

5. `/app/README.md` (update)
   - Add Track System section
   - Update architecture diagram
   - Add new features to list

EXAMPLE STRUCTURE for ADMIN_TRACK_GUIDE.md:

```markdown
# Admin Guide: Creating Tracks

## What is a Track?

A Track is a self-contained test module with:
- 4 sections
- Up to 10 questions per section (40 total)
- Audio file (for listening tests)
- Configurable time limit

## Creating Your First Track

### Step 1: Navigate to Track Management

1. Login to admin panel
2. Click "Tracks" in sidebar
3. Click "Create Track" button

### Step 2: Basic Information

Fill in:
- **Title**: e.g., "IELTS Listening Practice Test 1"
- **Type**: Listening / Reading / Writing
- **Description**: Optional details
- **Time Limit**: In seconds (e.g., 2700 = 45 minutes)

Click "Next" to continue.

### Step 3: Audio Configuration (Listening Only)

Choose upload method:
- **Upload File**: Browse and select MP3/WAV/M4A file
- **External URL**: Paste audio URL

Supported formats: MP3, WAV, M4A, OGG, FLAC
Max file size: 50MB

Click "Next" to continue.

### Step 4: Add Questions

For each section (1-4):

1. Click "+ Add Question" button
2. Select question type from dropdown
3. Fill in required fields:
   - Prompt text
   - Answer key
   - Options (for MCQ)
   - Max words (for text input)
4. Upload image (if needed)
5. Click "Save Question"

Repeat until you have your questions (max 10 per section).

### Step 5: Validate & Publish

1. Click "Review" tab
2. Check validation results:
   - ✓ Must have 4 sections
   - ✓ Must have at least 1 question
   - ✓ Listening tracks must have audio
   - ✓ All questions must have answer keys
3. Fix any errors
4. Click "Publish Track"

Your track is now ready to use in exams!

## Creating Exams from Tracks

1. Go to "Exams" → "Create Exam"
2. Select "From Tracks" option
3. Choose 1-3 tracks
4. Configure settings:
   - Wait time between tracks (default: 120 seconds)
   - Allow early start
   - Auto-publish results
5. Click "Create Exam"

Students will now see this exam in their dashboard.
```
```

---

## 📋 Quick Reference: File Locations

### Backend Files Already Created:
```
/app/backend/
  ├── track_models.py          ✅ Complete
  ├── track_api.py             ✅ Complete
  └── exam_track_api.py        ✅ Complete
```

### Frontend Files Already Created:
```
/app/frontend/src/components/track-questions/
  ├── QuestionWrapper.jsx      ✅ Complete
  ├── listening/
  │   ├── ShortAnswerListening.jsx           ✅
  │   ├── MultipleChoiceSingle.jsx           ✅
  │   ├── MultipleChoiceMultiple.jsx         ✅
  │   ├── MatchingDraggable.jsx              ✅
  │   └── DiagramLabeling.jsx                ✅
  ├── reading/
  │   ├── TrueFalseNotGiven.jsx              ✅
  │   ├── SentenceCompletion.jsx             ✅
  │   └── MatchingParagraphs.jsx             ✅
  └── writing/
      └── WritingTask.jsx                    ✅
```

### Files You Need to Create:
```
Backend:
  (none - all backend complete)

Frontend:
  /app/frontend/src/
    components/admin/
      ├── TrackManagement.jsx          ❌ TODO
      ├── TrackEditor.jsx              ❌ TODO
      └── QuestionEditorModal.jsx      ❌ TODO
    components/
      ├── TrackExam.jsx                ❌ TODO
      └── WaitingScreen.jsx            ❌ TODO
    services/
      ├── TrackService.js              ❌ TODO
      └── ExamTrackService.js          ❌ TODO

Scripts:
  /app/scripts/
    └── migrate_to_tracks.py           ❌ TODO

Tests:
  /app/tests/
    ├── test_track_api.py              ❌ TODO
    └── e2e/test_track_flow.py         ❌ TODO
  /app/frontend/src/components/track-questions/__tests__/
    ├── ShortAnswerListening.test.jsx  ❌ TODO
    └── ... (more test files)          ❌ TODO

Documentation:
  /app/docs/
    ├── ADMIN_TRACK_GUIDE.md           ❌ TODO
    ├── QUESTION_TYPE_GUIDE.md         ❌ TODO
    ├── API_TRACK_REFERENCE.md         ❌ TODO
    └── TRACK_MIGRATION_GUIDE.md       ❌ TODO
```

---

## 🔧 Environment Setup (Already Done)

The following are already set up and working:
- ✅ MongoDB connection
- ✅ FastAPI server running
- ✅ React frontend compiling
- ✅ Audio storage directory: `/app/listening_tracks/`
- ✅ Supervisor for process management

---

## 🎯 Priority Order for Next Agent

**Recommended completion order:**

1. **SERVER INTEGRATION** (30 min) - Get APIs running
2. **TRACK SERVICE** (1 hour) - API wrapper for frontend
3. **TRACK MANAGEMENT UI** (4 hours) - Admin interface
4. **STUDENT INTERFACE** (3 hours) - Exam taking UI
5. **WAITING SCREEN** (1 hour) - Countdown component
6. **MIGRATION SCRIPT** (2 hours) - Convert old data
7. **TESTING** (3 hours) - Write and run tests
8. **DOCUMENTATION** (2 hours) - User guides

**Total estimated time: 16-18 hours of development work**

---

## ⚠️ Important Notes

1. **Do NOT delete or modify existing components** in `/app/frontend/src/components/questions/` - they're still used by old exams
2. **Keep both systems running** until migration is complete
3. **Test thoroughly** - this is a critical replacement system
4. **Audio files are large** - test upload with small files first
5. **Autosave is critical** - test offline/online scenarios
6. **Validation is essential** - tracks must be valid before publishing

---

## 🐛 Known Issues to Watch For

1. **Question re-indexing**: When deleting questions, ensure remaining questions are re-indexed properly
2. **Audio CORS**: External audio URLs may have CORS issues - validate before saving
3. **Autosave race conditions**: Debounce properly to avoid overwriting newer answers with older ones
4. **Timer accuracy**: Use server time when possible, not just client-side timer
5. **Memory leaks**: Clean up intervals and listeners on component unmount

---

## 📞 Questions to Clarify Before Starting

Before you begin, confirm:

1. Should old exams be archived or deleted after migration?
2. What should happen if a student refreshes during a track?
3. Should admins see student progress in real-time?
4. Do we need analytics per track (completion rates, average scores)?
5. Should tracks be reusable across multiple exams? (Yes, that's the design)

---

## ✅ Success Criteria

The Track System is complete when:

- [ ] Admin can create a listening track with audio and 10 questions
- [ ] Admin can create an exam from 2 tracks (listening + reading)
- [ ] Student can start the exam and see first track
- [ ] Student's answers autosave every 3 seconds
- [ ] Timer counts down and auto-submits when expired
- [ ] After track 1, waiting screen shows for 120 seconds
- [ ] Track 2 loads automatically after waiting
- [ ] Final submission combines all track answers
- [ ] All existing exams migrate successfully to tracks
- [ ] Tests pass (backend API + frontend components)

---

**Ready to Continue? Use the prompts above for each task!**

Good luck! 🚀
