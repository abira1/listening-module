# IELTS Question Types - Visual Hierarchy & Flow Map

## 🌳 Question Type Hierarchy Tree

```
IELTS PRACTICE TEST PLATFORM
│
├── 🎧 LISTENING TEST (40 questions, 4 sections)
│   │
│   ├── TEXT INPUT BASED
│   │   ├── short_answer (fill-in-blank, inline input)
│   │   │   └── Used in: Sections 1, 3, 4
│   │   │   └── Examples: Q1-10, Q26-28, Q36-40
│   │   │
│   │   └── diagram_labeling (label diagram parts)
│   │       └── Used in: Section 4
│   │       └── Examples: Q31-35 (nuclear reactor diagram)
│   │
│   ├── SELECTION BASED
│   │   ├── multiple_choice (single selection, A/B/C/D)
│   │   │   └── Used in: Sections 2, 3
│   │   │   └── Examples: Q17-20, Q21-25, Q29-30
│   │   │
│   │   └── map_labeling (select letter on map)
│   │       └── Used in: Section 2
│   │       └── Examples: Q11-16 (ferry map)
│   │
│   └── INTERACTIVE (BONUS)
│       └── matching_draggable (drag-and-drop matching)
│           └── Custom implementation for complex matching
│
├── 📖 READING TEST (40 questions, 3 passages)
│   │
│   ├── TEXT INPUT BASED
│   │   ├── sentence_completion (complete with passage words)
│   │   │   └── Used in: Passages 1, 2
│   │   │   └── Examples: P1 Q6-8, P2 Q23-27
│   │   │
│   │   └── short_answer_reading (short passage-based answers)
│   │       └── Used in: Passage 2
│   │       └── Examples: Q19-22
│   │
│   ├── SELECTION BASED
│   │   ├── sentence_completion_wordlist (select from word list)
│   │   │   └── Used in: Passage 3
│   │   │   └── Examples: Q33-37
│   │   │
│   │   ├── matching_paragraphs (match to paragraph A-H)
│   │   │   └── Used in: All 3 passages
│   │   │   └── Examples: P1 Q1-5, P2 Q14-18, P3 Q28-32
│   │   │
│   │   ├── true_false_not_given (3-option selection)
│   │   │   └── Used in: Passages 1, 3
│   │   │   └── Examples: P1 Q9-13, P3 Q38-40
│   │   │
│   │   └── yes_no_not_given (variant of above)
│   │       └── Alternative format for certain passages
│   │
│   └── INTERACTIVE (BONUS)
│       └── matching_draggable (drag-and-drop for complex matching)
│           └── Available for reading matching tasks
│
└── ✍️ WRITING TEST (2 tasks, 2 sections)
    │
    └── ESSAY/COMPOSITION BASED
        └── writing_task (long-form writing)
            ├── Task 1: Chart description (150 words min)
            │   └── Includes chart/graph images
            └── Task 2: Essay writing (250 words min)
                └── Opinion/argument essays
```

---

## 🔄 Question Type Processing Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    STUDENT TAKES TEST                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              QUESTION TYPE ROUTING SYSTEM                   │
│  (ListeningTest.jsx / ReadingTest.jsx / WritingTest.jsx)  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────┴─────────────┐
              │   question.type CHECK     │
              └─────────────┬─────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌──────────────┐
│ TEXT INPUT    │   │ SELECTION     │   │ INTERACTIVE  │
│ BASED         │   │ BASED         │   │ BASED        │
└───────────────┘   └───────────────┘   └──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌──────────────┐
│ Render input  │   │ Render radio/ │   │ Render drag  │
│ with word     │   │ dropdown with │   │ and drop UI  │
│ validation    │   │ options       │   │ with options │
└───────────────┘   └───────────────┘   └──────────────┘
        │                   │                   │
        └───────────────────┴───────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  handleAnswerChange()   │
              │  Store answer in state  │
              └─────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │   SUBMIT TO BACKEND     │
              │   POST /api/submissions │
              └─────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     AUTO-GRADING ENGINE                      │
│              (server.py - lines 545-620)                     │
└─────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
    ┌─────────────────┐         ┌─────────────────┐
    │ WRITING TEST?   │         │ OTHER TEST TYPE │
    │ (Manual Grade)  │         │ (Auto Grade)    │
    └─────────────────┘         └─────────────────┘
              │                           │
              │                           ▼
              │         ┌─────────────────────────────────┐
              │         │ Compare student_answer with     │
              │         │ answer_key (case-insensitive    │
              │         │ for text, exact for choices)    │
              │         └─────────────────────────────────┘
              │                           │
              │                           ▼
              │         ┌─────────────────────────────────┐
              │         │ Calculate score and             │
              │         │ correct_answers count           │
              │         └─────────────────────────────────┘
              │                           │
              └───────────────┬───────────┘
                              │
                              ▼
              ┌─────────────────────────────┐
              │ Store submission in DB with │
              │ score (hidden from student) │
              └─────────────────────────────┘
                              │
                              ▼
              ┌─────────────────────────────┐
              │   ADMIN REVIEW & PUBLISH    │
              │   (Optional score editing)  │
              └─────────────────────────────┘
                              │
                              ▼
              ┌─────────────────────────────┐
              │  STUDENT SEES RESULTS       │
              │  (After admin publishes)    │
              └─────────────────────────────┘
```

---

## 🎯 Question Type Feature Matrix

| Question Type | Input Method | Word Limit | Image Support | Options | Auto-Grade | Manual Grade |
|---------------|-------------|------------|---------------|---------|------------|--------------|
| **short_answer** | Text input (inline) | ✅ Yes (1-2) | ❌ No | ❌ No | ✅ Yes | ❌ No |
| **multiple_choice** | Radio buttons | ❌ No | ❌ No | ✅ Yes (A-D) | ✅ Yes | ❌ No |
| **map_labeling** | Dropdown select | ❌ No | ✅ Yes (map) | ✅ Yes (A-I) | ✅ Yes | ❌ No |
| **diagram_labeling** | Text input (inline) | ✅ Yes (1) | ✅ Yes (diagram) | ❌ No | ✅ Yes | ❌ No |
| **matching_paragraphs** | Paragraph click | ❌ No | ❌ No | ✅ Yes (A-H) | ✅ Yes | ❌ No |
| **sentence_completion** | Text input | ✅ Yes (1-3) | ❌ No | ❌ No | ✅ Yes | ❌ No |
| **sentence_completion_wordlist** | Dropdown select | ❌ No | ❌ No | ✅ Yes (wordlist) | ✅ Yes | ❌ No |
| **short_answer_reading** | Text input | ✅ Yes (3) | ❌ No | ❌ No | ✅ Yes | ❌ No |
| **true_false_not_given** | Button selection | ❌ No | ❌ No | ✅ Yes (3) | ✅ Yes | ❌ No |
| **yes_no_not_given** | Button selection | ❌ No | ❌ No | ✅ Yes (3) | ✅ Yes | ❌ No |
| **writing_task** | Large textarea | ✅ Yes (min) | ✅ Yes (charts) | ❌ No | ❌ No | ✅ Yes |
| **matching_draggable** | Drag & drop | ❌ No | ❌ No | ✅ Yes (custom) | ✅ Yes | ❌ No |

---

## 📊 Question Type Distribution by Test

### Listening Test Structure
```
Section 1 (Social Context)
├── Q1-10: short_answer (10 questions)
└── Theme: Job interview, everyday conversation

Section 2 (Social Context)
├── Q11-16: map_labeling (6 questions) 🗺️
├── Q17-20: multiple_choice (4 questions)
└── Theme: Tour description with map

Section 3 (Educational/Training Context)
├── Q21-25: multiple_choice (5 questions)
├── Q26-28: short_answer (3 questions)
└── Q29-30: multiple_choice (2 questions)
└── Theme: Academic discussion

Section 4 (Educational - Monologue)
├── Q31-35: diagram_labeling (5 questions) 📊
└── Q36-40: short_answer (5 questions)
└── Theme: Academic lecture with diagram
```

### Reading Test Structure
```
Passage 1: The Mozart Effect
├── Q1-5: matching_paragraphs (5 questions)
├── Q6-8: sentence_completion (3 questions)
└── Q9-13: true_false_not_given (5 questions)
└── Length: ~500 words, 8 paragraphs

Passage 2: Fears
├── Q14-18: matching_paragraphs (5 questions)
├── Q19-22: short_answer_reading (4 questions)
└── Q23-27: sentence_completion (5 questions)
└── Length: ~600 words, 9 paragraphs

Passage 3: The Myth of the Five Senses
├── Q28-32: matching_paragraphs (5 questions)
├── Q33-37: sentence_completion_wordlist (5 questions)
└── Q38-40: true_false_not_given (3 questions)
└── Length: ~600 words, 8 paragraphs
```

### Writing Test Structure
```
Task 1: Chart Description
├── Type: writing_task
├── Format: Report/description
├── Requirement: 150 words minimum
├── Visual: Bar chart (milk exports)
└── Time: 20 minutes recommended

Task 2: Essay Writing
├── Type: writing_task
├── Format: Argumentative essay
├── Requirement: 250 words minimum
├── Topic: Opinion on media impact
└── Time: 40 minutes recommended
```

---

## 🎨 UI Component Mapping

```
┌────────────────────────────────────────────────────────────────┐
│                    QUESTION TYPE COMPONENTS                     │
└────────────────────────────────────────────────────────────────┘

LISTENING TEST COMPONENTS
├── ListeningTest.jsx (main container)
│   ├── renderQuestionByType() method
│   │   ├── case 'short_answer' → inline input rendering
│   │   ├── case 'multiple_choice' → radio buttons
│   │   ├── case 'map_labeling' → dropdown select
│   │   ├── case 'diagram_labeling' → inline input
│   │   └── case 'matching_draggable' → MatchingDraggable component
│   └── QTI Navigation Bar (footer)

READING TEST COMPONENTS
├── ReadingTest.jsx (main container)
│   ├── renderQuestionComponent() method
│   │   ├── case 'matching_paragraphs' → MatchingParagraphs.jsx
│   │   ├── case 'sentence_completion' → SentenceCompletion.jsx
│   │   ├── case 'sentence_completion_wordlist' → SentenceCompletion.jsx
│   │   ├── case 'true_false_not_given' → TrueFalseNotGiven.jsx
│   │   ├── case 'yes_no_not_given' → TrueFalseNotGiven.jsx
│   │   ├── case 'short_answer_reading' → ShortAnswerReading.jsx
│   │   └── case 'matching_draggable' → MatchingDraggable.jsx
│   └── Horizontal Split Layout (passage left, questions right)

WRITING TEST COMPONENTS
├── WritingTest.jsx (main container)
│   ├── Task navigation via footer buttons
│   ├── Horizontal split (prompt left, textarea right)
│   ├── Real-time word counter
│   └── Note & highlight system for prompts

SHARED COMPONENTS
├── MatchingDraggable.jsx (interactive drag-and-drop)
│   ├── Drag options from right panel
│   ├── Drop on question slots
│   ├── Mobile click-to-place alternative
│   └── Visual feedback (green, gray, blue)
│
└── Navigation System (footer)
    ├── QTI-style question buttons (40 buttons)
    ├── State indicators (black, white, blue, circular)
    ├── Previous/Next navigation
    └── Review marking checkbox
```

---

## 🔧 Backend Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    MONGODB COLLECTIONS                       │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
   ┌────────┐         ┌──────────┐       ┌───────────┐
   │ exams  │────────▶│ sections │◀──────│ questions │
   └────────┘         └──────────┘       └───────────┘
        │                   │                   │
        │              ┌────┴────┐              │
        │              │         │              │
   id: "exam-1"   id: "sec-1" id: "sec-2"  type: "short_answer"
   title: "..."   exam_id: "exam-1"        index: 1
   exam_type: "listening"                  payload: {
   duration: 2004                            prompt: "...",
   published: true                           answer_key: "...",
                                             max_words: 2
                                           }

┌─────────────────────────────────────────────────────────────┐
│                    API ENDPOINTS                             │
└─────────────────────────────────────────────────────────────┘

GET /api/exams/{exam_id}/full
└── Returns complete exam with all sections and questions
    ├── Used by: ListeningTest, ReadingTest, WritingTest
    └── Structure: {exam: {...}, sections: [{questions: [...]}]}

POST /api/submissions
├── Receives: {exam_id, answers: {1: "answer1", 2: "answer2"}}
├── Auto-grades: Compares with answer_keys
├── Stores: {score, correct_answers, is_published: false}
└── Returns: Submission without score (hidden from student)

GET /api/submissions/{id}/detailed
├── Used by: Admin review interface
├── Returns: Submission + exam + questions with answers
└── Shows: Student answer vs correct answer for each question

PUT /api/admin/submissions/{id}/publish
├── Publishes results to student
├── Sets: is_published = true, published_at = timestamp
└── Triggers: Student dashboard to show score
```

---

## 📈 Complexity & Difficulty Levels

### By Question Type (Cognitive Load)

```
LOW COMPLEXITY
├── multiple_choice (simple selection)
├── map_labeling (visual matching)
└── true_false_not_given (binary + NG)

MEDIUM COMPLEXITY
├── short_answer (recall + spelling)
├── sentence_completion (comprehension + word limit)
├── diagram_labeling (visual + text)
└── short_answer_reading (comprehension + extraction)

HIGH COMPLEXITY
├── matching_paragraphs (global understanding)
├── sentence_completion_wordlist (comprehension + discrimination)
└── matching_draggable (multiple matches + strategy)

VERY HIGH COMPLEXITY
└── writing_task (creation + organization + grammar + coherence)
```

---

## 🚀 Extensibility & Future Types

### Easy to Add (Similar to Existing)
- **heading_matching** (like matching_paragraphs but for headings)
- **matching_features** (like matching_draggable but with categories)
- **summary_completion** (like sentence_completion with summary context)

### Moderate Effort (New UI Components)
- **table_completion** (fill table cells with data)
- **flow_chart_completion** (connect nodes in flowchart)
- **plan_map_completion** (similar to map_labeling but more complex)

### Complex (Significant Development)
- **note_completion_audio_timing** (timestamp-based note completion)
- **classify_multiple** (classify multiple items simultaneously)
- **interactive_diagram** (clickable diagram with hotspots)

---

## 🎓 Learning Curve for Developers

### To Add a New Question Type:

1. **Backend** (30 minutes)
   - Add type to `ai_import_service.py` Literal enum
   - Update auto-grading logic in `server.py` (if auto-gradable)
   - Create sample questions in init files

2. **Frontend** (1-2 hours)
   - Create component in `/components/reading/` or similar
   - Add case to `renderQuestionComponent()` switch
   - Implement answer handling logic
   - Style with Tailwind CSS

3. **Testing** (30 minutes)
   - Test rendering with sample data
   - Test answer submission
   - Verify auto-grading
   - Check mobile responsiveness

**Total Time per New Type**: ~2-3 hours for experienced developer

---

*Visual Map Generated: 2025-01-XX*  
*IELTS Practice Test Platform v1.0*
