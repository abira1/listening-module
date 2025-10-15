# Track-Based Question Uploading & Rendering System
## Implementation Plan

**Created**: January 2025  
**Status**: In Progress  
**Reference Repo**: https://github.com/abira1/listening-module.git

---

## Overview

Rebuild the question uploading and rendering system using a **Track-based architecture** where:
- **Track** = 4 sections × up to 10 questions (40 questions total)
- Support for Listening, Reading, and Writing test types
- Admin can upload/edit tracks with media (audio, images)
- Exams are created from one or multiple tracks
- Sequential track execution with 120-second waiting screens
- Robust autosave and combined final submission

---

## Phase 1: Component Extraction & Standardization

### A. Question Type Inventory (from reference repo)

#### Listening (12 types):
1. `multiple_choice_single` - Single answer MCQ
2. `multiple_choice_multiple` - Multiple answers MCQ
3. `matching` - Drag-and-drop matching
4. `map_labeling` - Map with dropdown
5. `diagram_labeling` - Diagram with fill-ins
6. `form_completion` - Form fields
7. `note_completion_listening` - Note outline
8. `table_completion_listening` - Table cells
9. `flowchart_completion_listening` - Process steps
10. `summary_completion_listening` - Summary paragraph
11. `sentence_completion_listening` - Sentence blanks
12. `short_answer_listening` - Short text response

#### Reading (14 types):
1. `multiple_choice_single_reading` - Single answer MCQ
2. `multiple_choice_multiple_reading` - Multiple answers MCQ
3. `true_false_not_given` - 3-option choice
4. `yes_no_not_given` - 3-option choice (opinion)
5. `note_completion_reading` - Notes from passage
6. `matching_headings` - Match headings to paragraphs
7. `summary_completion_text` - Summary from text
8. `summary_completion_list` - Summary from word list
9. `flowchart_completion_reading` - Process completion
10. `sentence_completion_reading` - Sentence blanks
11. `matching_sentence_endings` - Match sentence parts
12. `table_completion_reading` - Table from passage
13. `matching_features` - Match features/categories
14. `matching_paragraphs` - Match info to paragraphs

#### Writing (1 type):
1. `writing_task` - Essay/report writing

### B. Component Standardization

Each component will follow this structure:

```jsx
// Standard component interface
function QuestionComponent({
  question,        // Full question object
  answer,          // Current answer (any type)
  onChange,        // Function(newAnswer)
  questionNumber,  // Display number
  readOnly         // For review mode
}) {
  // Component logic
}
```

**Payload Schema** (stored in DB):
```json
{
  "id": "uuid",
  "index": 1,
  "type": "question_type",
  "payload": {
    "prompt": "Question text",
    "options": [],
    "answer_key": "correct answer",
    "max_words": 2,
    // type-specific fields
  },
  "image": {
    "url": "https://...",
    "alt": "description"
  },
  "marks": 1
}
```

---

## Phase 2: Database Schema

### Collection: `tracks`

```javascript
{
  "_id": ObjectId(),
  "id": "track-uuid",
  "title": "Advanced Listening Track A",
  "type": "listening" | "reading" | "writing",
  "description": "Optional description",
  "createdBy": "admin-uid",
  "status": "draft" | "published" | "archived",
  "timeLimitSeconds": 2700,  // 45 minutes
  
  // Audio config (listening only)
  "audio": {
    "method": "upload" | "url",
    "url": "https://... or /listening_tracks/file.mp3",
    "originalFilename": "audio.mp3",
    "duration": 1800,
    "size": 12345678
  },
  
  // 4 sections structure
  "sections": [
    {
      "id": "section-uuid",
      "order": 1,
      "title": "Section 1",
      "questions": [
        {
          "id": "question-uuid",
          "order": 1,
          "type": "short_answer_listening",
          "payload": {
            "prompt": "What is the job type?",
            "answer_key": "part-time",
            "max_words": 2
          },
          "image": {
            "url": null,
            "alt": null
          },
          "marks": 1,
          "metadata": {}
        }
        // ... up to 10 questions
      ]
    }
    // ... 4 sections total
  ],
  
  "validation": {
    "totalQuestions": 40,
    "hasSections": 4,
    "isValid": true,
    "errors": []
  },
  
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T12:00:00Z"
}
```

### Collection: `exams`

```javascript
{
  "_id": ObjectId(),
  "id": "exam-uuid",
  "title": "Full IELTS Mock Exam 1",
  "description": "Complete exam with listening + reading",
  "createdBy": "admin-uid",
  "status": "scheduled" | "active" | "completed",
  
  // Track configuration
  "tracks": [
    {
      "trackId": "track-uuid-1",
      "order": 1,
      "trackType": "listening"
    },
    {
      "trackId": "track-uuid-2",
      "order": 2,
      "trackType": "reading"
    }
  ],
  
  // Settings
  "settings": {
    "waitBetweenTracksSeconds": 120,  // 2 minutes
    "allowEarlyStart": false,
    "autoPublishResults": false,
    "showScoreBetweenTracks": false
  },
  
  "totalQuestions": 80,  // Sum of all tracks
  "totalDuration": 5400,  // Sum of all track durations
  
  "published": true,
  "is_visible": true,
  
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T12:00:00Z"
}
```

### Collection: `submissions`

```javascript
{
  "_id": ObjectId(),
  "id": "submission-uuid",
  "examId": "exam-uuid",
  "userId": "student-uid",
  "userEmail": "student@example.com",
  "userName": "John Doe",
  
  "status": "in_progress" | "completed" | "reviewed",
  
  // Track-level data
  "tracks": [
    {
      "trackId": "track-uuid-1",
      "trackType": "listening",
      "status": "completed",
      
      "answers": {
        "1": "part-time",
        "2": "B",
        "3": "restaurant",
        // ... all 40 answers
      },
      
      "metadata": {
        "markedForReview": [5, 12, 28],
        "timeSpentPerQuestion": {
          "1": 45,
          "2": 30
        }
      },
      
      "startedAt": "2025-01-15T14:00:00Z",
      "completedAt": "2025-01-15T14:45:00Z",
      "timeSpent": 2700,
      
      "scoreAuto": 32,
      "scoreManual": null,
      "totalQuestions": 40
    }
    // ... more tracks
  ],
  
  // Combined scoring
  "finalScore": 65,
  "totalQuestions": 80,
  "percentage": 81.25,
  "isPublished": false,
  
  "submittedAt": "2025-01-15T15:50:00Z",
  "createdAt": "2025-01-15T14:00:00Z"
}
```

---

## Phase 3: API Endpoints

### Tracks API

```
POST   /api/tracks                     - Create new track
GET    /api/tracks                     - List tracks (with filters)
GET    /api/tracks/:id                 - Get single track
PUT    /api/tracks/:id                 - Update track
DELETE /api/tracks/:id                 - Delete track
POST   /api/tracks/:id/upload-audio    - Upload audio file
POST   /api/tracks/:id/upload-image    - Upload question image
POST   /api/tracks/:id/validate        - Validate track structure
POST   /api/tracks/:id/publish         - Publish track
```

### Exams API

```
POST   /api/exams/from-tracks          - Create exam from tracks
GET    /api/exams/:id/tracks           - Get exam with all tracks
GET    /api/exams/:id/start            - Start exam (create submission)
GET    /api/exams/:id/next-track       - Get next track in sequence
```

### Submissions API

```
POST   /api/submissions/:id/autosave   - Autosave answer
POST   /api/submissions/:id/track-complete - Mark track done
POST   /api/submissions/:id/submit     - Final submission
GET    /api/submissions/:id            - Get submission
```

---

## Phase 4: Admin UI Implementation

### A. Track Management Page (`/admin/tracks`)

**Features:**
- List all tracks (table view)
- Filter by type (listening/reading/writing)
- Search by title
- Create new track button
- Edit/Delete actions
- Publish/Unpublish toggle

### B. Track Editor (`/admin/tracks/new` or `/admin/tracks/:id/edit`)

**Stepper UI:**

#### Step 1: Track Metadata
- Track title (input)
- Test type (dropdown: listening/reading/writing)
- Description (textarea)
- Time limit (input, seconds)
- For listening: Audio upload method
  - Radio: "Upload from device" or "External URL"
  - If upload: File picker (MP3, WAV, M4A, OGG, FLAC)
  - If URL: Text input with validation
  - Audio preview player

#### Step 2: Sections & Questions
- 4 section cards (collapsible)
- Each section:
  - Section title (editable)
  - "Add Question" button (opens modal)
  - List of questions (drag-and-drop reorder)
  - Question preview cards showing:
    - Question number
    - Question type badge
    - Prompt text
    - Edit/Delete actions

#### Step 3: Question Editor Modal
- Question type selector (dropdown)
- Dynamic form based on selected type
- Fields based on question schema:
  - Prompt (textarea)
  - Options (list input for MCQ)
  - Answer key (input)
  - Max words (number input)
  - Image upload (for types that support it)
- Preview pane showing how question will render
- Validation errors display
- Save/Cancel buttons

#### Step 4: Review & Publish
- Track summary
- Validation checks:
  - ✓ Has 4 sections
  - ✓ Total 40 questions (or allow partial for draft)
  - ✓ All questions have answer keys
  - ✓ Audio file accessible (if listening)
  - ✓ All images uploaded
- Publish button (saves as published)
- Save as Draft button

---

## Phase 5: Student Exam Interface

### A. Exam Start Flow

```
1. Student clicks "Start Exam"
2. GET /api/exams/:id/start
   → Creates submission record
   → Returns first track + settings
3. Load first track interface
```

### B. Track Interface

**Layout:**
- Fixed header (timer, student info, track progress)
- Main content area (questions)
- Fixed footer (QTI-style navigation)

**Features:**
- Render all questions using standardized components
- Timer countdown (track duration)
- Auto-submit on timer expiry
- Mark for review checkbox
- Autosave every 3 seconds (debounced)
- Track completion button

**Audio Player (Listening):**
- Embedded audio player
- Play/pause controls
- Volume control
- Progress bar
- Cannot skip ahead (optional setting)

### C. Waiting Screen (Between Tracks)

**Design:**
- Large countdown timer (120 seconds)
- Track progress indicator: "Track 1 of 3 completed"
- Optional: Previous track summary (if allowed)
- Optional: "I'm ready - start now" button
- Motivational tips/instructions
- Auto-starts next track when countdown ends

**Countdown Display:**
```
┌─────────────────────────────────┐
│                                 │
│     Next Track Starting In      │
│                                 │
│          [  1:47  ]            │
│                                 │
│     Track 2 of 3: Reading      │
│                                 │
│  ✓ Track 1 completed (40/40)   │
│                                 │
│   [Skip Wait & Start Now]      │
│                                 │
└─────────────────────────────────┘
```

### D. Final Submission

**After last track:**
1. POST /api/submissions/:id/submit
2. Show completion message
3. Display: "Results will be published by instructor"
4. Button: "Return to Dashboard"

---

## Phase 6: Autosave Implementation

### Strategy
- **Client-side buffer**: IndexedDB or sessionStorage
- **Debounced API calls**: Save every 3 seconds after answer change
- **Optimistic UI**: Update immediately, sync in background
- **Conflict resolution**: Server timestamp wins

### Autosave Flow

```javascript
// On answer change
function handleAnswerChange(questionId, answer) {
  // 1. Update local state immediately
  setAnswers(prev => ({ ...prev, [questionId]: answer }));
  
  // 2. Save to local storage (instant)
  localStorage.setItem(`exam_${examId}_answers`, JSON.stringify(answers));
  
  // 3. Queue API call (debounced 3s)
  debouncedAutosave(questionId, answer);
}

// Debounced save
const debouncedAutosave = debounce(async (questionId, answer) => {
  try {
    await api.post(`/api/submissions/${submissionId}/autosave`, {
      questionId,
      answer,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Queue for retry
    addToRetryQueue({ questionId, answer });
  }
}, 3000);
```

### Recovery on Reconnect
```javascript
// On page load/reconnect
useEffect(() => {
  const localAnswers = localStorage.getItem(`exam_${examId}_answers`);
  if (localAnswers) {
    const answers = JSON.parse(localAnswers);
    // Sync with server
    syncAnswers(answers);
  }
}, []);
```

---

## Phase 7: Testing Plan

### Unit Tests
- [ ] Question component rendering
- [ ] Track validation logic
- [ ] Answer autosave function
- [ ] Timer countdown logic
- [ ] Audio upload validation

### Integration Tests
- [ ] POST /api/tracks - Create track
- [ ] PUT /api/tracks/:id - Update track
- [ ] POST /api/exams/from-tracks - Create exam
- [ ] GET /api/exams/:id/start - Start exam
- [ ] POST /api/submissions/:id/autosave - Autosave
- [ ] POST /api/submissions/:id/submit - Submit exam

### E2E Tests (Cypress)
- [ ] Admin creates track with audio and images
- [ ] Admin creates exam from multiple tracks
- [ ] Student starts exam
- [ ] Student completes first track
- [ ] 120-second waiting screen displays
- [ ] Student completes second track
- [ ] Final submission saved
- [ ] Answers persist across page refresh

### Load Tests
- [ ] 100 concurrent students autosaving
- [ ] Audio streaming performance
- [ ] Large track (40 questions) load time

---

## Phase 8: Migration & Data Seeding

### Migration Script: `scripts/extract_question_templates.js`

**Purpose**: Extract existing question types from reference repo and create seed data

```javascript
// Pseudo-code
async function migrateQuestionTemplates() {
  const refRepo = '/tmp/listening-module';
  const templates = [];
  
  // 1. Scan all question components
  const components = scanDirectory(refRepo + '/frontend/src/components/questions');
  
  // 2. Extract payload schemas
  for (const component of components) {
    const schema = extractPayloadSchema(component);
    templates.push(schema);
  }
  
  // 3. Generate sample tracks
  const sampleListeningTrack = createSampleTrack('listening', templates);
  const sampleReadingTrack = createSampleTrack('reading', templates);
  
  // 4. Save to database
  await db.collection('tracks').insertMany([
    sampleListeningTrack,
    sampleReadingTrack
  ]);
  
  console.log('✓ Migrated', templates.length, 'question templates');
  console.log('✓ Created', 2, 'sample tracks');
}
```

### Seed Data Files
- `/app/sample_track_jsons/listening_track_1.json`
- `/app/sample_track_jsons/reading_track_1.json`
- `/app/sample_track_jsons/writing_track_1.json`

---

## Phase 9: Documentation

### Files to Create
1. `/app/docs/TRACK_UPLOAD_IMPLEMENTATION.md` - Implementation details
2. `/app/docs/QUESTION_TYPE_REFERENCE.md` - All question types documented
3. `/app/docs/ADMIN_TRACK_GUIDE.md` - Admin user guide
4. `/app/docs/API_TRACK_ENDPOINTS.md` - API documentation
5. `/app/docs/COMPONENT_MAPPING.md` - Question type to component mapping

### Developer Notes
- Component reuse strategy
- Payload schema evolution
- Migration from old system (if applicable)
- Performance optimization notes

---

## Phase 10: Rollout Checklist

- [ ] All 27 question components extracted and tested
- [ ] Track CRUD operations working
- [ ] Audio upload (file + URL) functional
- [ ] Image upload for questions working
- [ ] Exam creation from tracks working
- [ ] Student exam interface rendering correctly
- [ ] Waiting screen between tracks functional
- [ ] Autosave working with offline resilience
- [ ] Final submission combining all tracks
- [ ] Admin can review submissions by track
- [ ] All API endpoints secured
- [ ] E2E tests passing
- [ ] Documentation complete
- [ ] Migration script tested

---

## Technical Decisions

### Why Track-based Architecture?
- **Modularity**: Tracks are reusable across exams
- **Flexibility**: Mix and match listening + reading + writing
- **Maintenance**: Update track once, affects all exams using it
- **Analytics**: Track-level performance metrics

### Why 4 Sections × 10 Questions?
- Matches IELTS official format
- Manageable chunks for UI rendering
- Allows section-based navigation
- Industry standard

### Why Sequential Track Execution?
- Prevents cheating (can't skip ahead)
- Simulates real exam conditions
- Clear mental breaks between test types
- Enforces time management

### Why 120-Second Waiting Screen?
- Official IELTS has 2-minute breaks
- Time to mentally reset
- Prevent burnout
- Review previous track mentally

---

## Success Metrics

- **Admin Efficiency**: Create track in < 15 minutes
- **Student Experience**: Zero loading delays between questions
- **Reliability**: 99.9% autosave success rate
- **Performance**: Page load < 2 seconds with 40 questions
- **Compatibility**: Works on Chrome, Firefox, Safari, Edge

---

## Future Enhancements

- [ ] Bulk import tracks from CSV/Excel
- [ ] Question bank (reusable questions across tracks)
- [ ] AI-assisted question generation
- [ ] Collaborative track editing (multiple admins)
- [ ] Version history for tracks
- [ ] Track cloning/templates
- [ ] Advanced analytics per track
- [ ] A/B testing different track variants

---

**End of Implementation Plan**
