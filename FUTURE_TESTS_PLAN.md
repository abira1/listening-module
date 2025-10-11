# 📋 PLAN FOR ADDING FUTURE TESTS

## 🎯 CURRENT TEST INVENTORY (FINAL INTERFACES)

### ✅ Test 1: IELTS Listening Practice Test 1
- **Exam ID**: `ielts-listening-practice-test-1`
- **Type**: `listening`
- **Audio**: ✅ YES (https://audio.jukehost.co.uk/F9irt6LcsYuP93ulaMo42JfXBEcABytV)
- **Duration**: 2004 seconds (33:24 - includes 31:24 audio + 2:00 review time)
- **Questions**: 40 questions across 4 sections
- **Question Types**: short_answer, multiple_choice, map_labeling, diagram_labeling
- **Features**: Audio playback, Timer, Section navigation, Auto-grading
- **Interface**: ListeningTest.jsx (FINAL - footer height 60px)

### ✅ Test 2: IELTS Reading Practice Test 1
- **Exam ID**: `ielts-reading-practice-test-1`
- **Type**: `reading`
- **Audio**: ❌ NO (audio_url = null)
- **Duration**: 3600 seconds (60 minutes)
- **Questions**: 40 questions across 3 sections (3 passages)
- **Question Types**: matching_paragraphs, sentence_completion, true_false_not_given, short_answer_reading, sentence_completion_wordlist
- **Features**: Split-screen (passage on left, questions on right), Timer, Highlighting, Auto-grading
- **Interface**: ReadingTest.jsx (FINAL - footer height 60px)

### ✅ Test 3: IELTS Writing Practice Test 1
- **Exam ID**: `ielts-writing-practice-test-1`
- **Type**: `writing`
- **Audio**: ❌ NO (audio_url = null)
- **Duration**: 3600 seconds (60 minutes)
- **Questions**: 2 tasks (Task 1: 150 words min, Task 2: 250 words min)
- **Question Types**: writing_task
- **Features**: Split-screen (prompt on left, writing on right), Word counter, Manual grading only
- **Interface**: WritingTest.jsx (FINAL - footer height 60px)

---

## 📊 DATABASE STRUCTURE

### Exam Collection Schema
```json
{
  "_id": "exam-id-here",
  "title": "Test Title",
  "description": "Test description",
  "exam_type": "listening" | "reading" | "writing",
  "audio_url": "url-here" | null,           // ONLY for listening tests
  "audio_source_method": "url" | "upload" | null,
  "loop_audio": false,
  "duration_seconds": 3600,
  "published": true | false,
  "is_active": false,                       // For start/stop control
  "started_at": null,
  "stopped_at": null,
  "question_count": 40,
  "submission_count": 0,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Section Collection Schema
```json
{
  "_id": "section-id",
  "exam_id": "exam-id-here",
  "index": 1,
  "title": "Section 1" | "Passage 1" | "Writing Task 1",
  "instructions": "Section instructions",
  "passage_text": "Full passage text..."    // ONLY for reading tests
}
```

### Question Collection Schema
```json
{
  "_id": "question-id",
  "section_id": "section-id",
  "index": 1,                               // Global question number (1-40)
  "type": "short_answer | multiple_choice | map_labeling | diagram_labeling | writing_task | true_false_not_given | etc",
  "payload": {
    "prompt": "Question text",
    "options": ["A", "B", "C"],            // For multiple_choice
    "answer_key": "correct answer",         // For auto-grading (null for writing)
    "max_words": 2,
    "min_words": 150,                      // For writing tasks
    "image_url": "url",                    // For map/diagram questions
    "task_number": 1                       // For writing tasks
  }
}
```

---

## 🚀 HOW TO ADD NEW TESTS

### METHOD 1: Via Admin Panel (Recommended for Quick Tests)

#### Step-by-Step Process:
1. **Admin Login**: Go to `/admin/login` (admin@example.com / password)
2. **Create Test Shell**:
   - Click "Create Test" button
   - Fill in:
     - Title (e.g., "IELTS Listening Practice Test 2")
     - Description
     - Duration in minutes (e.g., 60 for reading/writing, 33 for listening with review time)
   - Click "Publish Test" → This creates exam with 4 empty sections

3. **Add Questions**:
   - Click on test name to open Question Manager
   - For each section, click "Add Question"
   - Fill in question details based on test type

4. **For LISTENING Tests ONLY - Upload Audio**:
   - In Question Manager, scroll to "Upload Audio File" section
   - Select MP3/WAV/M4A file
   - Click "Upload Audio"
   - Audio URL is automatically linked to exam

5. **Publish & Activate**:
   - Go back to Test Management
   - Click "Start" button to activate test for students

#### ⚠️ AUDIO REQUIREMENTS (LISTENING ONLY):
- **Supported Formats**: MP3, WAV, M4A, OGG, FLAC
- **Storage Location**: `/app/listening_tracks/`
- **Upload Endpoint**: `POST /api/upload-audio` (multipart/form-data)
- **URL Format**: `/listening_tracks/{uuid-filename}.mp3`
- **Important**: Reading and Writing tests should have `audio_url: null`

---

### METHOD 2: Programmatic Creation (Recommended for Complete Tests)

#### For LISTENING Tests (with audio):

**File**: `/app/backend/init_listening_test_2.py`

```python
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime

MONGO_URL = os.environ.get('MONGO_URL')
EXAM_ID = "ielts-listening-practice-test-2"  # Unique ID

async def init_listening_test_2():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.ielts_platform
    
    # 1. CREATE EXAM
    exam_data = {
        "_id": EXAM_ID,
        "title": "IELTS Listening Practice Test 2",
        "description": "Your description here",
        "exam_type": "listening",              # IMPORTANT
        "audio_url": "YOUR_AUDIO_URL_HERE",   # Required for listening
        "audio_source_method": "url",          # or "upload"
        "loop_audio": False,
        "duration_seconds": 2004,              # 33:24 (31:24 audio + 2:00 review)
        "published": True,
        "is_active": False,
        "question_count": 40,
        "submission_count": 0,
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    await db.exams.replace_one({"_id": EXAM_ID}, exam_data, upsert=True)
    
    # 2. CREATE SECTIONS (4 sections for listening)
    sections = []
    for i in range(1, 5):
        section_id = f"{EXAM_ID}-section-{i}"
        section_data = {
            "_id": section_id,
            "exam_id": EXAM_ID,
            "index": i,
            "title": f"Section {i}",
            "instructions": f"Instructions for section {i}"
        }
        await db.sections.replace_one({"_id": section_id}, section_data, upsert=True)
        sections.append(section_id)
    
    # 3. CREATE QUESTIONS (40 questions)
    question_index = 1
    for section_idx, section_id in enumerate(sections, 1):
        questions_in_section = 10  # Adjust as needed
        
        for q in range(questions_in_section):
            question_id = f"{EXAM_ID}-q{question_index}"
            question_data = {
                "_id": question_id,
                "section_id": section_id,
                "index": question_index,
                "type": "short_answer",  # or multiple_choice, map_labeling, etc.
                "payload": {
                    "prompt": f"Question {question_index} text here",
                    "answer_key": "correct answer",  # For auto-grading
                    "max_words": 2
                }
            }
            await db.questions.replace_one({"_id": question_id}, question_data, upsert=True)
            question_index += 1
    
    print(f"✅ Listening Test 2 created successfully!")
    print(f"Exam ID: {EXAM_ID}")

if __name__ == "__main__":
    asyncio.run(init_listening_test_2())
```

**To run**: `python /app/backend/init_listening_test_2.py`

---

#### For READING Tests (no audio):

**File**: `/app/backend/init_reading_test_2.py`

```python
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime

MONGO_URL = os.environ.get('MONGO_URL')
EXAM_ID = "ielts-reading-practice-test-2"

async def init_reading_test_2():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.ielts_platform
    
    # 1. CREATE EXAM
    exam_data = {
        "_id": EXAM_ID,
        "title": "IELTS Reading Practice Test 2",
        "description": "Your description here",
        "exam_type": "reading",               # IMPORTANT
        "audio_url": None,                    # NO AUDIO for reading
        "audio_source_method": None,
        "loop_audio": False,
        "duration_seconds": 3600,             # 60 minutes
        "published": True,
        "is_active": False,
        "question_count": 40,
        "submission_count": 0,
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    await db.exams.replace_one({"_id": EXAM_ID}, exam_data, upsert=True)
    
    # 2. CREATE SECTIONS (3 passages for reading)
    passages = [
        {
            "title": "Passage 1",
            "passage_text": "Full passage text here... (800-1000 words)"
        },
        {
            "title": "Passage 2", 
            "passage_text": "Full passage text here... (800-1000 words)"
        },
        {
            "title": "Passage 3",
            "passage_text": "Full passage text here... (800-1000 words)"
        }
    ]
    
    sections = []
    for i, passage in enumerate(passages, 1):
        section_id = f"{EXAM_ID}-section-{i}"
        section_data = {
            "_id": section_id,
            "exam_id": EXAM_ID,
            "index": i,
            "title": passage["title"],
            "instructions": "Read the passage and answer the questions",
            "passage_text": passage["passage_text"]  # IMPORTANT for reading
        }
        await db.sections.replace_one({"_id": section_id}, section_data, upsert=True)
        sections.append(section_id)
    
    # 3. CREATE QUESTIONS (40 questions across 3 passages)
    question_index = 1
    questions_per_passage = [13, 14, 13]  # Typical IELTS distribution
    
    for section_idx, (section_id, q_count) in enumerate(zip(sections, questions_per_passage), 1):
        for q in range(q_count):
            question_id = f"{EXAM_ID}-q{question_index}"
            question_data = {
                "_id": question_id,
                "section_id": section_id,
                "index": question_index,
                "type": "true_false_not_given",  # or matching_paragraphs, sentence_completion, etc.
                "payload": {
                    "prompt": f"Question {question_index} text here",
                    "answer_key": "TRUE",  # or "FALSE", "NOT GIVEN"
                }
            }
            await db.questions.replace_one({"_id": question_id}, question_data, upsert=True)
            question_index += 1
    
    print(f"✅ Reading Test 2 created successfully!")
    print(f"Exam ID: {EXAM_ID}")

if __name__ == "__main__":
    asyncio.run(init_reading_test_2())
```

**To run**: `python /app/backend/init_reading_test_2.py`

---

#### For WRITING Tests (no audio):

**File**: `/app/backend/init_writing_test_2.py`

```python
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime

MONGO_URL = os.environ.get('MONGO_URL')
EXAM_ID = "ielts-writing-practice-test-2"

async def init_writing_test_2():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.ielts_platform
    
    # 1. CREATE EXAM
    exam_data = {
        "_id": EXAM_ID,
        "title": "IELTS Writing Practice Test 2",
        "description": "Your description here",
        "exam_type": "writing",               # IMPORTANT
        "audio_url": None,                    # NO AUDIO for writing
        "audio_source_method": None,
        "loop_audio": False,
        "duration_seconds": 3600,             # 60 minutes
        "published": True,
        "is_active": False,
        "question_count": 2,                  # Only 2 tasks
        "submission_count": 0,
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    await db.exams.replace_one({"_id": EXAM_ID}, exam_data, upsert=True)
    
    # 2. CREATE SECTIONS (2 tasks for writing)
    tasks = [
        {
            "title": "Writing Task 1",
            "instructions": "You should spend about 20 minutes on this task.",
            "prompt": "The chart below shows... Summarize the information...",
            "chart_image": "CHART_IMAGE_URL_HERE",  # Optional
            "min_words": 150,
            "task_number": 1
        },
        {
            "title": "Writing Task 2",
            "instructions": "You should spend about 40 minutes on this task.",
            "prompt": "Some people believe that... Discuss both views and give your opinion.",
            "chart_image": None,
            "min_words": 250,
            "task_number": 2
        }
    ]
    
    sections = []
    for i, task in enumerate(tasks, 1):
        section_id = f"{EXAM_ID}-section-{i}"
        section_data = {
            "_id": section_id,
            "exam_id": EXAM_ID,
            "index": i,
            "title": task["title"],
            "instructions": task["instructions"]
        }
        await db.sections.replace_one({"_id": section_id}, section_data, upsert=True)
        sections.append((section_id, task))
    
    # 3. CREATE QUESTIONS (2 writing tasks)
    for question_index, (section_id, task) in enumerate(sections, 1):
        question_id = f"{EXAM_ID}-q{question_index}"
        question_data = {
            "_id": question_id,
            "section_id": section_id,
            "index": question_index,
            "type": "writing_task",           # IMPORTANT
            "payload": {
                "instructions": task["instructions"],
                "prompt": task["prompt"],
                "chart_image": task["chart_image"],
                "min_words": task["min_words"],
                "task_number": task["task_number"],
                "answer_key": None            # NO auto-grading for writing
            }
        }
        await db.questions.replace_one({"_id": question_id}, question_data, upsert=True)
    
    print(f"✅ Writing Test 2 created successfully!")
    print(f"Exam ID: {EXAM_ID}")

if __name__ == "__main__":
    asyncio.run(init_writing_test_2())
```

**To run**: `python /app/backend/init_writing_test_2.py`

---

## 🎵 AUDIO FILE MANAGEMENT (LISTENING TESTS ONLY)

### Option 1: Upload via Admin Panel
1. Go to Question Manager for the listening test
2. Scroll to "Upload Audio File" section
3. Select your audio file (MP3, WAV, M4A, OGG, FLAC)
4. Click "Upload Audio"
5. Audio URL is automatically linked to the exam

### Option 2: Upload via API
```bash
curl -X POST "http://localhost:8001/api/upload-audio" \
  -F "file=@/path/to/audio.mp3" \
  -F "exam_id=your-exam-id"
```

Response:
```json
{
  "message": "Audio file uploaded successfully",
  "filename": "uuid-filename.mp3",
  "audio_url": "/listening_tracks/uuid-filename.mp3",
  "size": 12345678
}
```

### Option 3: Use External URL (Recommended)
- Upload to service like JukeHost, SoundCloud, or your own CDN
- Copy direct audio URL
- Set in exam: `"audio_url": "https://your-audio-url.com/file.mp3"`

### Audio Storage Details:
- **Local Path**: `/app/listening_tracks/`
- **Public URL**: `/listening_tracks/{filename}`
- **Naming**: UUID-based (e.g., `30427646-60cc-4c12-bc1d-8e06fe24f11e.mp3`)
- **Git Ignored**: Audio files are not committed to repository
- **Persistence**: Files persist across server restarts

---

## 📝 QUESTION TYPES REFERENCE

### Listening Test Question Types:
- `short_answer` - Text input for short answers
- `multiple_choice` - Radio buttons with options
- `map_labeling` - Dropdown select from map locations
- `diagram_labeling` - Text input inline within diagram description

### Reading Test Question Types:
- `matching_paragraphs` - Match statements to paragraphs
- `sentence_completion` - Complete sentences with words from passage
- `sentence_completion_wordlist` - Complete sentences from word list
- `true_false_not_given` - Three-option select
- `short_answer_reading` - Text input for short answers

### Writing Test Question Types:
- `writing_task` - Large textarea for essay/report writing

---

## ✅ CHECKLIST FOR ADDING NEW TESTS

### For LISTENING Tests:
- [ ] Create exam with `exam_type: "listening"`
- [ ] Set duration (typically 2004 seconds = 33:24)
- [ ] Create 4 sections
- [ ] Add 40 questions total (10 per section typical)
- [ ] **Upload or link audio file** ⭐
- [ ] Set `audio_url` in exam document
- [ ] Include image URLs for map_labeling/diagram_labeling questions
- [ ] Test audio playback in exam interface
- [ ] Verify auto-grading with answer_keys
- [ ] Publish and activate test

### For READING Tests:
- [ ] Create exam with `exam_type: "reading"`
- [ ] Set `audio_url: null` ⭐
- [ ] Set duration (3600 seconds = 60 minutes)
- [ ] Create 3 sections (3 passages)
- [ ] Add full passage text to each section's `passage_text` field
- [ ] Add 40 questions total (13-14 per passage typical)
- [ ] Verify auto-grading with answer_keys
- [ ] Test split-screen layout with passage on left
- [ ] Publish and activate test

### For WRITING Tests:
- [ ] Create exam with `exam_type: "writing"`
- [ ] Set `audio_url: null` ⭐
- [ ] Set duration (3600 seconds = 60 minutes)
- [ ] Create 2 sections (Task 1 & Task 2)
- [ ] Add 2 questions (1 per task)
- [ ] Set `answer_key: null` for both tasks (no auto-grading) ⭐
- [ ] Set min_words (150 for Task 1, 250 for Task 2)
- [ ] Include chart_image URL for Task 1 if needed
- [ ] Test word counter functionality
- [ ] Test split-screen layout with prompt on left
- [ ] Note: Manual grading required by admin

---

## 🔧 AUTO-INITIALIZATION ON SERVER STARTUP

To make tests automatically available when server starts, add to `/app/backend/server.py`:

```python
# At the top of server.py
from init_ielts_test import init_ielts_test
from init_reading_test import init_reading_test
from init_writing_test import init_writing_test
from init_listening_test_2 import init_listening_test_2  # Your new test
from init_reading_test_2 import init_reading_test_2      # Your new test
from init_writing_test_2 import init_writing_test_2      # Your new test

# In startup event
@app.on_event("startup")
async def startup_event():
    global exams_collection, sections_collection, questions_collection, students_collection, submissions_collection
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.ielts_platform
    
    exams_collection = db.exams
    sections_collection = db.sections
    questions_collection = db.questions
    students_collection = db.students
    submissions_collection = db.submissions
    
    # Initialize all tests
    await init_ielts_test()
    await init_reading_test()
    await init_writing_test()
    await init_listening_test_2()  # Your new tests
    await init_reading_test_2()
    await init_writing_test_2()
    
    logger.info("All tests initialized successfully!")
```

---

## 🎯 RECOMMENDED WORKFLOW

### For Adding Test 4, 5, 6, etc:

1. **Decide test type**: Listening, Reading, or Writing?

2. **Create initialization script**:
   - Copy appropriate template from above
   - Rename file: `init_[type]_test_[number].py`
   - Update EXAM_ID: `ielts-[type]-practice-test-[number]`
   - Update title, description, questions

3. **For Listening ONLY - Prepare audio**:
   - Upload to external service OR
   - Place in `/app/listening_tracks/` OR
   - Upload via admin panel after creating test shell

4. **Run initialization**:
   ```bash
   python /app/backend/init_[type]_test_[number].py
   ```

5. **Add to server.py startup** (optional for persistence)

6. **Test the exam**:
   - Login as student
   - Start the test
   - Verify all questions display correctly
   - Verify audio (if listening test)
   - Submit test
   - Check admin panel for submission

7. **Admin workflow**:
   - Review submissions
   - Mark answers (interactive scoring for listening/reading)
   - Manually grade writing tasks
   - Publish results

---

## 🚨 IMPORTANT REMINDERS

### ⚠️ CRITICAL DIFFERENCES BY TEST TYPE:

| Feature | Listening | Reading | Writing |
|---------|-----------|---------|---------|
| **audio_url** | ✅ Required | ❌ null | ❌ null |
| **exam_type** | "listening" | "reading" | "writing" |
| **Sections** | 4 | 3 | 2 |
| **Questions** | 40 | 40 | 2 |
| **Duration** | ~2004s (33min) | 3600s (60min) | 3600s (60min) |
| **Auto-grading** | ✅ Yes | ✅ Yes | ❌ No (manual) |
| **passage_text** | ❌ No | ✅ Required | ❌ No |
| **answer_key** | ✅ Required | ✅ Required | ❌ null |

### 🎵 Audio Requirements (LISTENING ONLY):
- **Must upload audio file or provide external URL**
- **Audio plays during exam and cannot be paused/replayed by default**
- **Duration should match audio length + review time**
- **Test will not work properly without audio**

### 📖 Reading Requirements:
- **Must include full passage_text in each section**
- **Passages displayed on left side of split-screen**
- **No audio needed**

### ✍️ Writing Requirements:
- **Only 2 questions (Task 1 & Task 2)**
- **No auto-grading - admin must manually grade**
- **answer_key must be null**
- **min_words required for word counter**

---

## 📞 NEED HELP?

If you need me to:
- Create a specific test for you
- Add multiple tests at once
- Modify test structure
- Debug any issues

Just let me know the details and I'll handle it! 🚀
