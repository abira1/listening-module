# 🔍 AI-ASSISTED QUESTION IMPORT SYSTEM - THOROUGH INVESTIGATION

## 📋 EXECUTIVE SUMMARY

This document provides a comprehensive investigation into implementing an AI-assisted question import system where users:
1. Use their own AI tools (ChatGPT, Claude, Gemini) to extract questions from PDFs
2. Receive structured JSON output from AI
3. Paste JSON into admin panel
4. System automatically creates tracks with all questions

**Key Benefit**: Eliminates need for backend PDF parsing, OCR, or AI API integration while achieving the same goal.

---

## 🎯 SYSTEM OVERVIEW

### Current Manual Process (Slow):
```
PDF → Admin reads → Admin types each question → Admin sets options → Admin sets answer key
Time: ~30-60 minutes for 40 questions
```

### Proposed AI-Assisted Process (Fast):
```
PDF → AI extraction (user's tool) → Paste JSON → Automatic creation
Time: ~2-5 minutes for 40 questions
```

---

## 🔬 DETAILED WORKFLOW ANALYSIS

### Step 1: User Prepares PDF
**User Action**: Has IELTS test PDF (Listening/Reading/Writing)

**PDF Formats Supported**:
- Text-based PDFs (extractable text)
- Image/Scanned PDFs (user must use OCR first or AI with vision capabilities)

**Example PDF Content**:
```
IELTS Listening Practice Test 1
Section 1: Questions 1-10

Complete the notes below.
Write NO MORE THAN TWO WORDS for each answer.

Job enquiry at: 1. __________ shop
Available shifts: 2. __________ only
Start date: 3. __________

Questions 4-6: Choose the correct letter A, B, or C.
4. What is the hourly rate?
   A. £7.50
   B. £8.00
   C. £8.50

Answer Key:
1. part-time
2. weekend
3. Monday
4. C
...
```

---

### Step 2: AI Extraction with Structured Prompt

**User copies PDF text and uses this prompt with their AI tool:**

#### 🎵 LISTENING TEST EXTRACTION PROMPT:

```
You are an IELTS test parser. Extract questions from this IELTS Listening test and format as JSON.

Test Type: IELTS Listening
Sections: 4 sections, 40 questions total

For each question, identify:
- Question number (1-40)
- Section (1-4)
- Question type: "short_answer", "multiple_choice", "map_labeling", or "diagram_labeling"
- Prompt/question text
- Options (if multiple choice or labeling)
- Answer key (correct answer)
- Max words (if applicable)
- Image URL (if map/diagram, leave null if not provided)

Return ONLY valid JSON in this exact format:

{
  "test_type": "listening",
  "title": "IELTS Listening Practice Test X",
  "description": "Brief description",
  "duration_seconds": 2004,
  "sections": [
    {
      "index": 1,
      "title": "Section 1",
      "instructions": "Complete the notes below. Write NO MORE THAN TWO WORDS for each answer.",
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
        }
      ]
    }
  ]
}

Now extract from this test:
[PASTE PDF TEXT HERE]
```

#### 📖 READING TEST EXTRACTION PROMPT:

```
You are an IELTS test parser. Extract questions from this IELTS Reading test and format as JSON.

Test Type: IELTS Academic Reading
Sections: 3 passages, 40 questions total

For each passage, extract:
- Passage title
- Full passage text (all paragraphs)
- Instructions
- All questions with types: "true_false_not_given", "matching_paragraphs", "sentence_completion", "sentence_completion_wordlist", "short_answer_reading"

Return ONLY valid JSON in this exact format:

{
  "test_type": "reading",
  "title": "IELTS Reading Practice Test X",
  "description": "Brief description",
  "duration_seconds": 3600,
  "sections": [
    {
      "index": 1,
      "title": "Passage 1: [Title]",
      "passage_text": "Full passage text here with all paragraphs...",
      "instructions": "Questions 1-13",
      "questions": [
        {
          "index": 1,
          "type": "matching_paragraphs",
          "prompt": "Which paragraph contains the following information? The early history of chocolate.",
          "answer_key": "B",
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
        }
      ]
    }
  ]
}

Now extract from this test:
[PASTE PDF TEXT HERE]
```

#### ✍️ WRITING TEST EXTRACTION PROMPT:

```
You are an IELTS test parser. Extract tasks from this IELTS Writing test and format as JSON.

Test Type: IELTS Academic Writing
Tasks: 2 tasks (Task 1: 150 words, Task 2: 250 words)

Return ONLY valid JSON in this exact format:

{
  "test_type": "writing",
  "title": "IELTS Writing Practice Test X",
  "description": "Brief description",
  "duration_seconds": 3600,
  "sections": [
    {
      "index": 1,
      "title": "Writing Task 1",
      "instructions": "You should spend about 20 minutes on this task.",
      "questions": [
        {
          "index": 1,
          "type": "writing_task",
          "prompt": "The chart below shows the export of milk from Italy, Russia, and Poland between 2008 and 2012. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
          "min_words": 150,
          "task_number": 1,
          "chart_image": null,
          "answer_key": null
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
          "prompt": "Some people believe that international media has a positive influence on society, while others think it has negative effects. Discuss both views and give your opinion.",
          "min_words": 250,
          "task_number": 2,
          "chart_image": null,
          "answer_key": null
        }
      ]
    }
  ]
}

Now extract from this test:
[PASTE PDF TEXT HERE]
```

---

### Step 3: AI Returns Structured JSON

**AI Output Example (Listening Test - Abbreviated)**:

```json
{
  "test_type": "listening",
  "title": "IELTS Listening Practice Test 2",
  "description": "Complete IELTS Listening test with 4 sections and 40 questions",
  "duration_seconds": 2004,
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
          "index": 2,
          "type": "short_answer",
          "prompt": "Available shifts: __________ only",
          "answer_key": "weekend",
          "max_words": 2,
          "options": null,
          "image_url": null
        },
        {
          "index": 3,
          "type": "short_answer",
          "prompt": "Start date: __________",
          "answer_key": "Monday",
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
        }
      ]
    },
    {
      "index": 2,
      "title": "Section 2",
      "instructions": "Label the map below. Choose the correct letter, A–I.",
      "questions": [
        {
          "index": 11,
          "type": "map_labeling",
          "prompt": "Ferry Terminal",
          "answer_key": "A",
          "max_words": null,
          "options": ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
          "image_url": "https://example.com/map.jpg"
        }
      ]
    }
  ]
}
```

---

### Step 4: User Pastes JSON into Admin Panel

**UI Design for Import Interface**:

```
┌────────────────────────────────────────────────────────────┐
│  📥 IMPORT QUESTIONS FROM AI                               │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Step 1: Extract questions using AI                        │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 1. Copy your PDF text                                 │ │
│  │ 2. Use ChatGPT/Claude/Gemini with our prompt         │ │
│  │ 3. Get JSON output from AI                           │ │
│  │ 4. Copy the JSON and paste below                     │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  [View Prompts for Each Test Type ▼]                       │
│                                                             │
│  Step 2: Paste AI-generated JSON                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ {                                                     │ │
│  │   "test_type": "listening",                          │ │
│  │   "title": "IELTS Listening Test 2",                │ │
│  │   "sections": [                                      │ │
│  │     ...                                              │ │
│  │   ]                                                  │ │
│  │ }                                                     │ │
│  │                                                       │ │
│  │                                                       │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  [Validate JSON]  [Preview Questions]                      │
│                                                             │
│  ✅ JSON Valid: 40 questions detected                      │
│  ✅ Test Type: Listening                                   │
│  ✅ Sections: 4                                            │
│  ✅ All questions have answer keys                         │
│                                                             │
│  Step 3: Configure track details                           │
│  Track Name: [IELTS Listening Practice Test 2          ]  │
│  Description: [Auto-imported from AI extraction        ]  │
│                                                             │
│  ⚠️ Audio Required for Listening Tests:                   │
│  ○ Upload audio file from device                           │
│  ○ Enter audio URL: [________________________]  [Test URL] │
│                                                             │
│  [Cancel]  [Create Track from JSON]                        │
└────────────────────────────────────────────────────────────┘
```

**Validation Display**:
```
┌────────────────────────────────────────────────────────────┐
│  ✅ VALIDATION SUCCESSFUL                                  │
├────────────────────────────────────────────────────────────┤
│  Test Type: Listening                                      │
│  Total Questions: 40                                       │
│  Sections: 4                                               │
│                                                             │
│  Section Breakdown:                                        │
│  • Section 1: 10 questions (10 short_answer)              │
│  • Section 2: 10 questions (6 map_labeling, 4 multiple)   │
│  • Section 3: 10 questions (7 multiple, 3 short_answer)   │
│  • Section 4: 10 questions (5 diagram_labeling, 5 short)  │
│                                                             │
│  All questions validated ✅                                │
│  All answer keys present ✅                                │
│  Question indices sequential (1-40) ✅                     │
└────────────────────────────────────────────────────────────┘
```

**Error Display**:
```
┌────────────────────────────────────────────────────────────┐
│  ❌ VALIDATION ERRORS                                      │
├────────────────────────────────────────────────────────────┤
│  Please fix the following issues:                          │
│                                                             │
│  • Question 15: Missing answer_key field                   │
│  • Question 23: Invalid question type "multi_choice"       │
│    (should be "multiple_choice")                           │
│  • Section 3: Missing required field "instructions"        │
│  • Total questions: 38 (expected 40 for listening test)   │
│                                                             │
│  [Edit JSON]  [View Documentation]                         │
└────────────────────────────────────────────────────────────┘
```

---

### Step 5: Preview Before Creation

**Preview Interface**:

```
┌────────────────────────────────────────────────────────────┐
│  👁️ PREVIEW: IELTS Listening Practice Test 2              │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  📋 SECTION 1: Questions 1-10                              │
│  Instructions: Complete the notes below. Write NO MORE...  │
│                                                             │
│  1. [short_answer] Job enquiry at: __________ shop        │
│     ✅ Answer: part-time                                   │
│                                                             │
│  2. [short_answer] Available shifts: __________ only      │
│     ✅ Answer: weekend                                     │
│                                                             │
│  3. [short_answer] Start date: __________                 │
│     ✅ Answer: Monday                                      │
│                                                             │
│  4. [multiple_choice] What is the hourly rate?            │
│     Options: A. £7.50 | B. £8.00 | C. £8.50              │
│     ✅ Answer: C                                           │
│                                                             │
│  ... [36 more questions] ...                               │
│                                                             │
│  [◀ Back to Edit]  [Confirm & Create Track ▶]             │
└────────────────────────────────────────────────────────────┘
```

---

### Step 6: System Creates Track

**Backend Processing**:
1. Validate JSON schema
2. Create track record in database
3. Create exam record
4. Create section records (4 for listening, 3 for reading, 2 for writing)
5. Create 40+ question records (bulk insert)
6. Link audio URL if provided (listening only)
7. Set track status to "published"
8. Return success with track ID

**Success Message**:
```
┌────────────────────────────────────────────────────────────┐
│  🎉 TRACK CREATED SUCCESSFULLY!                            │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Track: IELTS Listening Practice Test 2                   │
│  Track ID: track-a1b2c3d4                                  │
│  Exam ID: ielts-listening-practice-test-2                  │
│                                                             │
│  ✅ 40 questions created                                   │
│  ✅ 4 sections created                                     │
│  ✅ Audio linked                                           │
│  ✅ Track published and ready                              │
│                                                             │
│  What's next?                                              │
│  • [View Track in Library]                                 │
│  • [Edit Questions]                                        │
│  • [Create Another Track]                                  │
│  • [Create Mock Test with This Track]                      │
└────────────────────────────────────────────────────────────┘
```

---

## 🔧 TECHNICAL IMPLEMENTATION

### Backend API Endpoint

**File**: `/app/backend/ai_import_service.py`

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, validator
from typing import List, Optional, Literal
import uuid
from datetime import datetime

router = APIRouter()

# ============================================
# PYDANTIC MODELS FOR VALIDATION
# ============================================

class QuestionImport(BaseModel):
    index: int
    type: Literal["short_answer", "multiple_choice", "map_labeling", 
                  "diagram_labeling", "true_false_not_given", 
                  "matching_paragraphs", "sentence_completion",
                  "sentence_completion_wordlist", "short_answer_reading",
                  "writing_task"]
    prompt: str
    answer_key: Optional[str] = None
    max_words: Optional[int] = None
    min_words: Optional[int] = None
    options: Optional[List[str]] = None
    image_url: Optional[str] = None
    wordlist: Optional[List[str]] = None
    task_number: Optional[int] = None
    chart_image: Optional[str] = None

    @validator('answer_key')
    def validate_answer_key(cls, v, values):
        q_type = values.get('type')
        # Writing tasks don't need answer keys
        if q_type == 'writing_task':
            return None
        # All other types require answer key
        if not v:
            raise ValueError(f"answer_key is required for type {q_type}")
        return v


class SectionImport(BaseModel):
    index: int
    title: str
    instructions: str
    passage_text: Optional[str] = None  # For reading tests
    questions: List[QuestionImport]

    @validator('questions')
    def validate_questions(cls, v):
        if not v:
            raise ValueError("Section must have at least one question")
        # Validate question indices are sequential within section
        indices = [q.index for q in v]
        if indices != sorted(indices):
            raise ValueError("Question indices must be sequential")
        return v


class AIImportRequest(BaseModel):
    test_type: Literal["listening", "reading", "writing"]
    title: str
    description: str
    duration_seconds: int
    audio_url: Optional[str] = None
    sections: List[SectionImport]

    @validator('sections')
    def validate_sections(cls, v, values):
        test_type = values.get('test_type')
        if not v:
            raise ValueError("Must have at least one section")
        
        # Validate section count based on test type
        if test_type == "listening" and len(v) != 4:
            raise ValueError("Listening test must have exactly 4 sections")
        elif test_type == "reading" and len(v) != 3:
            raise ValueError("Reading test must have exactly 3 sections")
        elif test_type == "writing" and len(v) != 2:
            raise ValueError("Writing test must have exactly 2 sections")
        
        # Validate total question count
        total_questions = sum(len(section.questions) for section in v)
        if test_type in ["listening", "reading"] and total_questions != 40:
            raise ValueError(f"{test_type.title()} test must have exactly 40 questions (found {total_questions})")
        elif test_type == "writing" and total_questions != 2:
            raise ValueError(f"Writing test must have exactly 2 tasks (found {total_questions})")
        
        return v

    @validator('audio_url')
    def validate_audio_url(cls, v, values):
        test_type = values.get('test_type')
        if test_type == "listening" and not v:
            raise ValueError("Listening test requires audio_url")
        return v


# ============================================
# IMPORT ENDPOINT
# ============================================

@router.post("/api/tracks/import-from-ai")
async def import_track_from_ai(import_data: AIImportRequest):
    """
    Import track from AI-generated JSON
    
    Validates JSON structure, creates track, exam, sections, and questions
    """
    try:
        # Generate IDs
        track_id = str(uuid.uuid4())
        exam_id = f"ielts-{import_data.test_type}-{uuid.uuid4().hex[:8]}"
        
        # Create exam document
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
            "question_count": sum(len(s.questions) for s in import_data.sections),
            "submission_count": 0,
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        await exams_collection.replace_one({"_id": exam_id}, exam_data, upsert=True)
        
        # Create sections
        for section in import_data.sections:
            section_id = f"{exam_id}-section-{section.index}"
            section_data = {
                "_id": section_id,
                "exam_id": exam_id,
                "index": section.index,
                "title": section.title,
                "instructions": section.instructions
            }
            if section.passage_text:
                section_data["passage_text"] = section.passage_text
            
            await sections_collection.replace_one(
                {"_id": section_id}, 
                section_data, 
                upsert=True
            )
            
            # Create questions for this section
            for question in section.questions:
                question_id = f"{exam_id}-q{question.index}"
                
                # Build payload based on question type
                payload = {
                    "prompt": question.prompt,
                    "answer_key": question.answer_key
                }
                
                if question.max_words:
                    payload["max_words"] = question.max_words
                if question.min_words:
                    payload["min_words"] = question.min_words
                if question.options:
                    payload["options"] = question.options
                if question.image_url:
                    payload["image_url"] = question.image_url
                if question.wordlist:
                    payload["wordlist"] = question.wordlist
                if question.task_number:
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
                
                await questions_collection.replace_one(
                    {"_id": question_id},
                    question_data,
                    upsert=True
                )
        
        # Create track record
        track_data = {
            "_id": track_id,
            "track_type": import_data.test_type,
            "title": import_data.title,
            "description": import_data.description,
            "exam_id": exam_id,
            "created_by": "admin@example.com",  # Get from auth context
            "created_at": datetime.utcnow().isoformat() + "Z",
            "updated_at": datetime.utcnow().isoformat() + "Z",
            "status": "published",
            "metadata": {
                "question_count": exam_data["question_count"],
                "duration_seconds": import_data.duration_seconds,
                "has_audio": import_data.audio_url is not None,
                "audio_url": import_data.audio_url,
                "sections_count": len(import_data.sections)
            }
        }
        await tracks_collection.replace_one({"_id": track_id}, track_data, upsert=True)
        
        return {
            "success": True,
            "track_id": track_id,
            "exam_id": exam_id,
            "questions_created": exam_data["question_count"],
            "sections_created": len(import_data.sections),
            "message": "Track created successfully from AI import"
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================
# VALIDATION ENDPOINT (Preview without creating)
# ============================================

@router.post("/api/tracks/validate-import")
async def validate_import(import_data: AIImportRequest):
    """
    Validate AI-generated JSON without creating anything
    Returns validation results and preview data
    """
    try:
        # Pydantic validation already happened
        # Build preview summary
        preview = {
            "valid": True,
            "test_type": import_data.test_type,
            "title": import_data.title,
            "total_questions": sum(len(s.questions) for s in import_data.sections),
            "total_sections": len(import_data.sections),
            "duration_minutes": import_data.duration_seconds // 60,
            "has_audio": import_data.audio_url is not None,
            "section_breakdown": []
        }
        
        for section in import_data.sections:
            question_types = {}
            for q in section.questions:
                question_types[q.type] = question_types.get(q.type, 0) + 1
            
            preview["section_breakdown"].append({
                "section_number": section.index,
                "title": section.title,
                "question_count": len(section.questions),
                "question_types": question_types,
                "has_passage": section.passage_text is not None
            })
        
        return preview
        
    except Exception as e:
        return {
            "valid": False,
            "errors": [str(e)]
        }
```

---

### Frontend Component

**File**: `/app/frontend/src/components/admin/AIImport.jsx`

```jsx
import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, Eye, AlertCircle } from 'lucide-react';
import { BackendService } from '../../services/BackendService';
import { useToast } from '../common/Toast';

export function AIImport() {
  const [jsonInput, setJsonInput] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const { showToast } = useToast();

  const handleValidate = async () => {
    if (!jsonInput.trim()) {
      showToast('Please paste JSON data', 'error');
      return;
    }

    setIsValidating(true);
    try {
      const jsonData = JSON.parse(jsonInput);
      const result = await BackendService.validateAIImport(jsonData);
      setValidationResult(result);
      
      if (result.valid) {
        setPreviewData(jsonData);
        showToast('JSON validated successfully!', 'success');
      } else {
        showToast('Validation errors found', 'error');
      }
    } catch (error) {
      setValidationResult({
        valid: false,
        errors: [error.message || 'Invalid JSON format']
      });
      showToast('Invalid JSON format', 'error');
    } finally {
      setIsValidating(false);
    }
  };

  const handleCreateTrack = async () => {
    if (!validationResult?.valid) {
      showToast('Please validate JSON first', 'error');
      return;
    }

    setIsCreating(true);
    try {
      const jsonData = JSON.parse(jsonInput);
      const result = await BackendService.createTrackFromAI(jsonData);
      
      showToast(`Track created successfully! ${result.questions_created} questions added.`, 'success');
      
      // Reset form
      setJsonInput('');
      setValidationResult(null);
      setPreviewData(null);
      
      // Navigate to track library or track editor
      // navigate(`/admin/tracks/${result.track_id}`);
      
    } catch (error) {
      showToast(error.message || 'Failed to create track', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Upload className="w-6 h-6" />
          Import Questions from AI
        </h2>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold mb-2">📋 How to Use:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Copy your PDF text content</li>
            <li>Use ChatGPT, Claude, or Gemini with our extraction prompt</li>
            <li>Copy the JSON output from AI</li>
            <li>Paste it below and validate</li>
            <li>Preview and create your track</li>
          </ol>
          
          <button
            onClick={() => setShowPrompts(!showPrompts)}
            className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showPrompts ? '▼ Hide' : '▶'} View AI Prompts for Each Test Type
          </button>
        </div>

        {/* Prompts Section */}
        {showPrompts && (
          <div className="mb-6 p-4 bg-gray-50 border rounded">
            <PromptTemplates />
          </div>
        )}

        {/* JSON Input */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">
            Paste AI-Generated JSON:
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full h-96 p-4 border border-gray-300 rounded font-mono text-sm"
            placeholder='{\n  "test_type": "listening",\n  "title": "IELTS Listening Test 2",\n  ...\n}'
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleValidate}
            disabled={isValidating || !jsonInput.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 flex items-center gap-2"
          >
            {isValidating ? (
              <>Loading...</>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Validate JSON
              </>
            )}
          </button>

          {validationResult?.valid && (
            <button
              onClick={() => setPreviewData(previewData ? null : JSON.parse(jsonInput))}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {previewData ? 'Hide Preview' : 'Preview Questions'}
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
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
            <p className="mb-3 text-sm text-green-800">
              ✅ JSON validated successfully. Ready to create track.
            </p>
            
            {previewData.test_type === 'listening' && !previewData.audio_url && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <AlertCircle className="w-4 h-4 inline mr-2 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Don't forget to add audio URL for listening test!
                </span>
              </div>
            )}
            
            <button
              onClick={handleCreateTrack}
              disabled={isCreating}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 font-semibold"
            >
              {isCreating ? 'Creating Track...' : '🚀 Create Track from JSON'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Validation Display Component
function ValidationDisplay({ result }) {
  if (result.valid) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded mb-6">
        <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          ✅ Validation Successful
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Test Type:</strong> {result.test_type}</p>
            <p><strong>Total Questions:</strong> {result.total_questions}</p>
            <p><strong>Sections:</strong> {result.total_sections}</p>
          </div>
          <div>
            <p><strong>Duration:</strong> {result.duration_minutes} minutes</p>
            <p><strong>Has Audio:</strong> {result.has_audio ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <strong className="block mb-2">Section Breakdown:</strong>
          {result.section_breakdown.map(section => (
            <div key={section.section_number} className="ml-4 mb-2 text-sm">
              <p>• Section {section.section_number}: {section.question_count} questions</p>
              <p className="ml-4 text-gray-600">
                Types: {Object.entries(section.question_types).map(([type, count]) => 
                  `${count} ${type}`
                ).join(', ')}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded mb-6">
        <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
          <XCircle className="w-5 h-5" />
          ❌ Validation Errors
        </h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
          {result.errors.map((error, idx) => (
            <li key={idx}>{error}</li>
          ))}
        </ul>
      </div>
    );
  }
}

// Preview Display Component
function PreviewDisplay({ data }) {
  return (
    <div className="p-4 bg-gray-50 border rounded mb-6">
      <h3 className="font-semibold mb-4">👁️ Preview: {data.title}</h3>
      
      {data.sections.map(section => (
        <div key={section.index} className="mb-6">
          <h4 className="font-semibold text-lg mb-2">
            📋 {section.title}
          </h4>
          <p className="text-sm text-gray-600 mb-3">{section.instructions}</p>
          
          {section.passage_text && (
            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
              <strong>Passage:</strong> {section.passage_text.substring(0, 200)}...
            </div>
          )}
          
          <div className="space-y-2">
            {section.questions.slice(0, 3).map(q => (
              <div key={q.index} className="p-2 bg-white border rounded text-sm">
                <p><strong>Q{q.index}.</strong> [{q.type}] {q.prompt}</p>
                {q.options && (
                  <p className="text-xs text-gray-600 ml-4">
                    Options: {q.options.join(' | ')}
                  </p>
                )}
                {q.answer_key && (
                  <p className="text-xs text-green-600 ml-4">
                    ✅ Answer: {q.answer_key}
                  </p>
                )}
              </div>
            ))}
            {section.questions.length > 3 && (
              <p className="text-sm text-gray-500 ml-2">
                ... and {section.questions.length - 3} more questions
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Prompt Templates Component
function PromptTemplates() {
  const [selectedType, setSelectedType] = useState('listening');
  
  const prompts = {
    listening: `You are an IELTS test parser. Extract questions from this IELTS Listening test and format as JSON.

Test Type: IELTS Listening
Sections: 4 sections, 40 questions total

For each question, identify:
- Question number (1-40)
- Section (1-4)
- Question type: "short_answer", "multiple_choice", "map_labeling", or "diagram_labeling"
- Prompt/question text
- Options (if multiple choice or labeling)
- Answer key (correct answer)
- Max words (if applicable)

Return ONLY valid JSON in this exact format: {...}

Now extract from this test:
[PASTE PDF TEXT HERE]`,
    
    reading: `You are an IELTS test parser. Extract questions from this IELTS Reading test and format as JSON.

Test Type: IELTS Academic Reading
Sections: 3 passages, 40 questions total

Extract full passage text and all questions.

Return ONLY valid JSON in this exact format: {...}

Now extract from this test:
[PASTE PDF TEXT HERE]`,
    
    writing: `You are an IELTS test parser. Extract tasks from this IELTS Writing test and format as JSON.

Test Type: IELTS Academic Writing
Tasks: 2 tasks

Return ONLY valid JSON in this exact format: {...}

Now extract from this test:
[PASTE PDF TEXT HERE]`
  };
  
  return (
    <div>
      <div className="flex gap-2 mb-3">
        {['listening', 'reading', 'writing'].map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded ${
              selectedType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
      
      <pre className="p-4 bg-white border rounded text-xs overflow-x-auto whitespace-pre-wrap">
        {prompts[selectedType]}
      </pre>
      
      <button
        onClick={() => navigator.clipboard.writeText(prompts[selectedType])}
        className="mt-2 px-4 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
      >
        📋 Copy Prompt
      </button>
    </div>
  );
}
```

---

## 📊 JSON SCHEMA SPECIFICATIONS

### Complete JSON Schema for All Test Types

**Listening Test Full Schema**:
```json
{
  "test_type": "listening",
  "title": "IELTS Listening Practice Test X",
  "description": "Complete IELTS Listening test with 4 sections and 40 questions",
  "duration_seconds": 2004,
  "audio_url": "https://audio-host.com/file.mp3",
  "sections": [
    {
      "index": 1,
      "title": "Section 1",
      "instructions": "Complete the notes below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
      "questions": [
        {
          "index": 1,
          "type": "short_answer",
          "prompt": "Question text with blank: __________",
          "answer_key": "correct answer",
          "max_words": 2,
          "options": null,
          "image_url": null
        },
        {
          "index": 4,
          "type": "multiple_choice",
          "prompt": "Question text?",
          "answer_key": "B",
          "max_words": null,
          "options": ["A. Option 1", "B. Option 2", "C. Option 3"],
          "image_url": null
        }
      ]
    },
    {
      "index": 2,
      "title": "Section 2",
      "instructions": "Label the map below. Choose the correct letter, A–I.",
      "questions": [
        {
          "index": 11,
          "type": "map_labeling",
          "prompt": "Location name",
          "answer_key": "A",
          "max_words": null,
          "options": ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
          "image_url": "https://image-host.com/map.jpg"
        }
      ]
    }
  ]
}
```

**Reading Test Full Schema**:
```json
{
  "test_type": "reading",
  "title": "IELTS Reading Practice Test X",
  "description": "Complete IELTS Academic Reading test with 3 passages and 40 questions",
  "duration_seconds": 3600,
  "audio_url": null,
  "sections": [
    {
      "index": 1,
      "title": "Passage 1: Title of Passage",
      "passage_text": "Full text of the reading passage goes here. This should be 800-1000 words typically. Include all paragraphs labeled A, B, C, etc. if needed for matching questions...",
      "instructions": "Questions 1-13",
      "questions": [
        {
          "index": 1,
          "type": "matching_paragraphs",
          "prompt": "Which paragraph contains the following information? The early history of the subject.",
          "answer_key": "B",
          "options": null,
          "wordlist": null
        },
        {
          "index": 6,
          "type": "sentence_completion",
          "prompt": "The process began in __________.",
          "answer_key": "the early 1900s",
          "options": null,
          "wordlist": null
        },
        {
          "index": 9,
          "type": "true_false_not_given",
          "prompt": "The method was initially used for commercial purposes.",
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
```

**Writing Test Full Schema**:
```json
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
          "prompt": "The chart below shows... Summarize the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
          "answer_key": null,
          "min_words": 150,
          "task_number": 1,
          "chart_image": "https://image-host.com/chart.jpg"
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
          "prompt": "Some people believe that... Discuss both views and give your opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.",
          "answer_key": null,
          "min_words": 250,
          "task_number": 2,
          "chart_image": null
        }
      ]
    }
  ]
}
```

---

## ⚠️ EDGE CASES & ERROR HANDLING

### Common Issues and Solutions

**Issue 1: AI Returns Invalid JSON**
- **Problem**: AI adds commentary before/after JSON or malformed JSON
- **Solution**: Frontend detects and prompts user to extract only JSON portion
- **Detection**: Try parse, if fails, show error with line number

**Issue 2: Missing Answer Keys**
- **Problem**: AI forgets to include answer keys
- **Solution**: Validation catches this, user must manually add or re-prompt AI

**Issue 3: Wrong Question Count**
- **Problem**: AI extracts 38 questions instead of 40
- **Solution**: Validation shows count mismatch, user reviews PDF and re-prompts

**Issue 4: Incorrect Question Types**
- **Problem**: AI uses "multi_choice" instead of "multiple_choice"
- **Solution**: Validation shows allowed types, suggests corrections

**Issue 5: Large Passage Text**
- **Problem**: Reading passages are very long (1000+ words)
- **Solution**: Database fields support large text, no truncation

**Issue 6: Special Characters in Questions**
- **Problem**: Questions have quotes, apostrophes, special symbols
- **Solution**: JSON escaping handled automatically by parser

**Issue 7: Image URLs Missing**
- **Problem**: Map/diagram questions without images
- **Solution**: Allow null, admin can add images later via track editor

**Issue 8: Audio URL Not Working**
- **Problem**: User provides broken audio URL
- **Solution**: Add "Test URL" button that pings URL before creation

---

## 🧪 TESTING SCENARIOS

### Test Case 1: Perfect Listening Test Import
```
Input: Valid JSON with 40 questions, 4 sections, audio URL
Expected: ✅ Track created, all questions imported
Result: Success message, navigate to track
```

### Test Case 2: Reading Test with Long Passages
```
Input: 3 passages, each 900 words, 40 questions
Expected: ✅ All passage text stored, questions linked
Result: Reading test with full passages displayed
```

### Test Case 3: Invalid JSON Format
```
Input: Malformed JSON (missing bracket)
Expected: ❌ Parse error with line number
Result: Error message "Invalid JSON at line 15"
```

### Test Case 4: Wrong Question Count
```
Input: Listening test with only 38 questions
Expected: ❌ Validation error
Result: "Listening test must have exactly 40 questions (found 38)"
```

### Test Case 5: Missing Answer Keys
```
Input: Questions without answer_key field
Expected: ❌ Validation error for each question
Result: "Question 15: Missing answer_key field"
```

### Test Case 6: Writing Test Import
```
Input: 2 tasks, no answer keys (null)
Expected: ✅ Track created for manual grading
Result: Writing track ready, marked as manual grading
```

---

## 💡 ENHANCEMENTS & FUTURE IMPROVEMENTS

### Phase 1 Enhancements (Quick Wins):

1. **JSON Templates Download**
   - Provide downloadable JSON templates for each test type
   - Pre-filled with correct structure
   - Users can manually edit and import

2. **Bulk Edit After Import**
   - After import, show all questions in editable table
   - Quick corrections before finalizing
   - Inline editing of answer keys

3. **Audio URL Validator**
   - Test audio URL before saving
   - Show audio player preview
   - Verify file accessibility

4. **Image URL Bulk Upload**
   - For map/diagram questions
   - Upload multiple images at once
   - Auto-link to questions by number

### Phase 2 Enhancements (Advanced):

1. **AI Integration in Admin Panel**
   - Direct API integration with OpenAI/Claude
   - User provides their API key
   - Upload PDF → Auto-extract → Review → Create
   - No copy-paste needed

2. **CSV Import Alternative**
   - Simpler format for non-technical users
   - Excel/Google Sheets compatible
   - Template provided

3. **Question Bank Library**
   - Save individual questions to library
   - Reuse questions across tests
   - Tag and categorize questions

4. **Version Control for Tracks**
   - Track editing history
   - Revert to previous versions
   - Compare versions

---

## 📈 IMPLEMENTATION TIMELINE

### Week 1: Core Import System
- **Days 1-2**: Backend validation endpoint + database integration
- **Days 3-4**: Frontend import component + validation display
- **Day 5**: Testing and bug fixes

### Week 2: Enhancements
- **Days 6-7**: Preview system + audio URL validator
- **Days 8-9**: Integration with track library
- **Day 10**: Documentation and admin training

**Total: 10 days for complete AI import system**

---

## 🎯 SUCCESS METRICS

### Before AI Import:
- Time to create 40-question test: **30-60 minutes**
- Error rate: **High** (manual typing errors)
- Admin effort: **Very High**

### After AI Import:
- Time to create 40-question test: **2-5 minutes**
- Error rate: **Low** (validated by AI + system)
- Admin effort: **Very Low** (copy-paste + review)

### ROI:
- **10-15x faster** test creation
- **90% reduction** in manual data entry
- **Higher quality** (AI catches formatting issues)

---

## ❓ RECOMMENDATIONS

### Recommended Approach:

**Option 1: AI-Assisted Import (Recommended)**
- ✅ No API costs (users use their AI accounts)
- ✅ Flexibility (works with any AI tool)
- ✅ User control (review before import)
- ✅ Fast implementation (10 days)
- ✅ Low maintenance

**vs**

**Option 2: Direct PDF Upload**
- ❌ Requires PDF parsing library
- ❌ Requires OCR for scanned PDFs
- ❌ API costs if using AI integration
- ❌ Complex implementation (20+ days)
- ❌ Higher maintenance

**Verdict: Go with Option 1 (AI-Assisted Import)**

---

## 🚀 NEXT STEPS

1. **Confirm Approach**: Do you approve the AI-assisted import system?

2. **Review JSON Format**: Are the JSON schemas appropriate for your needs?

3. **Test with Sample**: Try the prompt with ChatGPT/Claude on a sample PDF

4. **Start Implementation**: I'll build the system in 10 days

5. **Iterate**: Refine based on your feedback after testing

---

## 📝 QUESTIONS TO ANSWER

1. **Do you want this AI-assisted import system?** (Yes/No)

2. **Which AI tools do you use?** (ChatGPT, Claude, Gemini, other?)

3. **Do you have sample PDFs to test with?** (Can you share one?)

4. **Audio hosting**: Will you use external URLs or upload files?

5. **Priority**: Is this higher priority than Mock Test system?

---

**This thorough investigation provides everything needed to make an informed decision. Ready to proceed when you give the green light! 🚀**
