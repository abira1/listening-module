# 🚀 Auto-Import System for IELTS Tests

## Overview

The **Auto-Import System** allows you to upload JSON files from the admin panel, and the system will **automatically detect question types** and create the complete test with all questions properly configured.

### ✨ Key Features

- ✅ **Automatic Type Detection** - No need to specify question types manually
- ✅ **Structure Validation** - Ensures all questions meet IELTS standards
- ✅ **26 Question Types Supported** - All official IELTS question types
- ✅ **Smart Payload Building** - Automatically creates correct payload structure
- ✅ **Error Reporting** - Detailed feedback on any issues
- ✅ **Bulk Import** - Upload entire tests in one JSON file

---

## 📁 System Files Created

### Backend Files

1. **`/app/backend/question_type_schemas.py`** (8,000+ lines)
   - Complete schema definitions for all 26 question types
   - Auto-detection logic
   - Validation functions
   - Grading method specifications

2. **`/app/backend/auto_import_handler.py`** (600+ lines)
   - JSON file processing
   - Auto-detection engine
   - Database creation logic
   - API endpoints for import

3. **`/app/sample_test_jsons/sample_listening_test.json`**
   - Example test with multiple question types
   - Ready to upload and test

---

## 🎯 How It Works

### Step 1: Prepare Your JSON File

Create a JSON file with this structure:

```json
{
  "title": "Your Test Title",
  "description": "Test description",
  "test_type": "listening",  // or "reading" or "writing"
  "duration_seconds": 2400,
  "audio_url": "https://...",  // For listening only
  "published": true,
  "sections": [
    {
      "index": 1,
      "title": "Section 1",
      "instructions": "Section instructions...",
      "passage_text": "...",  // For reading only
      "questions": [
        {
          "index": 1,
          // Question data here (type will be auto-detected)
          "prompt": "What is the answer?",
          "answer_key": "correct answer",
          "max_words": 2
        }
      ]
    }
  ]
}
```

### Step 2: System Auto-Detects Question Type

The system looks at the question structure and automatically determines the type:

**Example 1: Short Answer**
```json
{
  "index": 1,
  "prompt": "What type of job?",
  "answer_key": "part-time",
  "max_words": 2
}
```
→ **Detected as**: `short_answer_listening`

**Example 2: Multiple Choice (Multiple)**
```json
{
  "index": 2,
  "prompt": "Which TWO benefits?",
  "options": ["A", "B", "C", "D"],
  "answer_key": ["A", "C"],
  "select_count": 2
}
```
→ **Detected as**: `multiple_choice_multiple`

**Example 3: Form Completion**
```json
{
  "index": 3,
  "form_title": "Application Form",
  "fields": [
    {"index": 3, "label": "Name:", "answer_key": "John", "max_words": 1},
    {"index": 4, "label": "Phone:", "answer_key": "555-1234", "max_words": 2}
  ]
}
```
→ **Detected as**: `form_completion`

### Step 3: System Validates Structure

For each question, the system:
1. Checks all required fields are present
2. Validates data types (string, integer, array, etc.)
3. Ensures values meet constraints (e.g., answer_key pattern)
4. Verifies relationships between fields

### Step 4: System Creates Database Entries

The system automatically creates:
- ✅ Exam document with metadata
- ✅ Section documents linked to exam
- ✅ Question documents with correct payload structure
- ✅ Proper indexing and relationships

---

## 🔧 API Endpoints

### 1. Import Test from JSON

**Endpoint**: `POST /api/admin/import-test-json`

**Request**: Upload JSON file

**Response**:
```json
{
  "status": "success",
  "exam_id": "exam-uuid",
  "summary": {
    "sections_created": 4,
    "questions_created": 40,
    "questions_by_type": {
      "short_answer_listening": 10,
      "multiple_choice_single": 8,
      "map_labeling": 6,
      "form_completion": 1,
      ...
    }
  },
  "errors": [],
  "warnings": []
}
```

### 2. Validate Test JSON (Without Importing)

**Endpoint**: `POST /api/admin/validate-test-json`

**Request**: Upload JSON file

**Response**:
```json
{
  "valid": true,
  "detected_types": {
    "short_answer_listening": 10,
    "multiple_choice_single": 5,
    ...
  },
  "errors": [],
  "warnings": [
    "Question 15: max_words not specified, using default"
  ]
}
```

### 3. Get All Question Type Schemas

**Endpoint**: `GET /api/question-types/schemas`

**Response**: Complete schema documentation for all 26 types

### 4. Get Question Types List

**Endpoint**: `GET /api/question-types/list`

**Response**: List of all types organized by test category

---

## 📊 All 26 Supported Question Types

### Listening (12 types)

| Type Code | Name | Auto-Detect Key |
|-----------|------|-----------------|
| `multiple_choice_single` | Multiple Choice (Single) | has `options`, `answer_key` (string) |
| `multiple_choice_multiple` | Multiple Choice (Multiple) | has `options`, `answer_key` (array), `select_count` |
| `matching` | Matching | has `left_items`, `right_items`, `answer_key` (dict) |
| `map_labeling` | Map Labeling | has `image_url`, `options`, `answer_key` |
| `diagram_labeling` | Diagram Labeling | has `image_url`, `prompt` with blank |
| `form_completion` | Form Completion | has `form_title`, `fields` |
| `note_completion_listening` | Note Completion | has `title`, `notes` (array) |
| `table_completion_listening` | Table Completion | has `headers`, `rows` |
| `flowchart_completion_listening` | Flowchart Completion | has `title`, `steps` |
| `summary_completion_listening` | Summary Completion | has `summary` (text), `blanks` |
| `sentence_completion_listening` | Sentence Completion | has `prompt` with blank, `answer_key`, `max_words` |
| `short_answer_listening` | Short Answer | has `prompt` (question), `answer_key` |

### Reading (13 types)

| Type Code | Name | Auto-Detect Key |
|-----------|------|-----------------|
| `multiple_choice_single_reading` | Multiple Choice (Single) | has `options`, `answer_key` (string) |
| `multiple_choice_multiple_reading` | Multiple Choice (Multiple) | has `options`, `answer_key` (array), `select_count` |
| `true_false_not_given` | True/False/Not Given | `answer_key` in ["TRUE", "FALSE", "NOT GIVEN"] |
| `yes_no_not_given` | Yes/No/Not Given | `answer_key` in ["YES", "NO", "NOT GIVEN"] |
| `note_completion_reading` | Note Completion | has `title`, `notes` |
| `matching_headings` | Matching Headings | has `headings` (array), `paragraph_ref` |
| `summary_completion_text` | Summary Completion (Text) | has `summary`, `blanks`, no `word_list` |
| `summary_completion_list` | Summary Completion (List) | has `summary`, `blanks`, `word_list` |
| `flowchart_completion_reading` | Flowchart Completion | has `title`, `steps` |
| `sentence_completion_reading` | Sentence Completion | has `prompt` with blank, `max_words` |
| `matching_sentence_endings` | Matching Sentence Endings | has `sentence_beginning`, `endings` |
| `table_completion_reading` | Table Completion | has `headers`, `rows` |
| `matching_features` | Matching Features | has `statements`, `features`, `answer_key` (dict) |
| `matching_paragraphs` | Matching Paragraphs | has `prompt`, `options` (paragraph letters) |

### Writing (1 type)

| Type Code | Name | Auto-Detect Key |
|-----------|------|-----------------|
| `writing_task` | Writing Task | has `instructions`, `min_words`, `task_number` |

---

## 🎨 Question Structure Examples

### Example 1: Short Answer (Auto-detected)

```json
{
  "index": 1,
  "prompt": "What is the job type mentioned?",
  "answer_key": "part-time",
  "max_words": 2,
  "marks": 1
}
```

**Detection Logic**:
- ✅ Has `prompt` (question format)
- ✅ Has `answer_key` (string)
- ✅ Has `max_words`
- ✅ No `options` array
- ✅ No complex structures

**Detected Type**: `short_answer_listening`

---

### Example 2: Multiple Choice Multiple (Auto-detected)

```json
{
  "index": 2,
  "prompt": "Which TWO benefits are offered?",
  "options": ["Discount", "Parking", "Insurance", "Meals"],
  "answer_key": ["A", "B"],
  "select_count": 2,
  "marks": 1
}
```

**Detection Logic**:
- ✅ Has `options` (array)
- ✅ Has `answer_key` (ARRAY - multiple answers)
- ✅ Has `select_count` (integer >= 2)

**Detected Type**: `multiple_choice_multiple`

---

### Example 3: Form Completion (Auto-detected)

```json
{
  "index": 3,
  "form_title": "Registration Form",
  "fields": [
    {
      "index": 3,
      "label": "Full Name:",
      "answer_key": "Sarah Johnson",
      "max_words": 3
    },
    {
      "index": 4,
      "label": "Phone:",
      "answer_key": "555-1234",
      "max_words": 2
    }
  ],
  "marks": 2
}
```

**Detection Logic**:
- ✅ Has `form_title` (string)
- ✅ Has `fields` (array of field objects)
- ✅ Each field has `label`, `answer_key`, `index`

**Detected Type**: `form_completion`

---

### Example 4: Map Labeling (Auto-detected)

```json
{
  "index": 11,
  "prompt": "Restaurant",
  "options": ["A", "B", "C", "D", "E", "F"],
  "answer_key": "B",
  "image_url": "https://example.com/map.png",
  "marks": 1
}
```

**Detection Logic**:
- ✅ Has `image_url` (map/diagram indicator)
- ✅ Has `options` (letter choices)
- ✅ Has `answer_key` (single letter)
- ✅ Short `prompt` (label name, not question)

**Detected Type**: `map_labeling`

---

### Example 5: Matching (Auto-detected)

```json
{
  "index": 15,
  "instructions": "Match each person to their opinion",
  "left_items": [
    {"id": 15, "text": "Dr. Smith"},
    {"id": 16, "text": "Prof. Jones"}
  ],
  "right_items": [
    {"key": "A", "text": "Supports proposal"},
    {"key": "B", "text": "Opposes proposal"},
    {"key": "C", "text": "Neutral"}
  ],
  "answer_key": {"15": "A", "16": "B"},
  "marks": 2
}
```

**Detection Logic**:
- ✅ Has `left_items` (array)
- ✅ Has `right_items` (array)
- ✅ Has `answer_key` (OBJECT/DICT - mapping)
- ✅ Has `instructions`

**Detected Type**: `matching`

---

### Example 6: Table Completion (Auto-detected)

```json
{
  "index": 20,
  "table_title": "Schedule",
  "headers": ["Day", "Activity", "Time"],
  "rows": [
    {
      "index": 20,
      "cells": ["Monday", "__BLANK__", "9am"],
      "blank_position": 1,
      "answer_key": "Swimming",
      "max_words": 1
    },
    {
      "index": 21,
      "cells": ["Tuesday", "Yoga", "__BLANK__"],
      "blank_position": 2,
      "answer_key": "10am",
      "max_words": 1
    }
  ],
  "marks": 2
}
```

**Detection Logic**:
- ✅ Has `headers` (array)
- ✅ Has `rows` (array of row objects)
- ✅ Each row has `cells`, `blank_position`, `answer_key`
- ✅ Has `table_title` (optional)

**Detected Type**: `table_completion_listening` or `table_completion_reading`

---

## 🔍 How Auto-Detection Works

### Detection Algorithm

```python
def detect_question_type(question_data):
    """
    Scores each possible type based on structure match
    Returns type with highest score
    """
    
    scores = {}
    
    for type_name in all_question_types:
        score = 0
        
        # +10 points: All required fields present
        if has_all_required_fields(question_data, type_name):
            score += 10
        else:
            continue  # Skip if missing required fields
        
        # +5 points per matching field type
        if field_types_match(question_data, type_name):
            score += 5
        
        # +3 points per matching indicator
        if indicators_match(question_data, type_name):
            score += 3
        
        scores[type_name] = score
    
    # Return type with highest score (minimum 10 required)
    return max(scores, key=scores.get) if scores else None
```

### Detection Priority

1. **Required Fields** (10 points) - Must have all required fields
2. **Field Types** (5 points each) - Correct data types (string, array, dict)
3. **Indicators** (3 points each) - Special markers (e.g., `select_count >= 2`)

### Minimum Score

A type must score at least **10 points** to be considered a match. This ensures only valid structures are detected.

---

## 🛡️ Validation Process

After type detection, the system validates:

### 1. Required Fields Check
```python
✅ "prompt" must be present (if required)
✅ "answer_key" must be present (if required)
✅ "options" must be present (for choice questions)
```

### 2. Data Type Check
```python
✅ "index" must be integer
✅ "options" must be array
✅ "answer_key" must be string (single) or array (multiple)
✅ "max_words" must be integer
```

### 3. Value Constraints
```python
✅ "index" must be >= 1
✅ "max_words" must be between 1-10
✅ "select_count" must be >= 2
✅ "answer_key" must match pattern (e.g., ^[A-D]$ for MCQ)
```

### 4. Relationship Checks
```python
✅ If answer_key is array, must have select_count
✅ If has image_url, must be valid URL format
✅ If form_completion, fields array must not be empty
```

---

## ⚙️ Integration with Existing System

### Step 1: Update Backend Server

Add to `/app/backend/server.py`:

```python
from auto_import_handler import router as auto_import_router

# Include the router
app.include_router(auto_import_router)
```

### Step 2: Update Frontend Admin Panel

Add upload button in admin panel:

```jsx
<input 
  type="file" 
  accept=".json"
  onChange={handleFileUpload}
/>

async function handleFileUpload(e) {
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/admin/import-test-json', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  console.log('Import result:', result);
}
```

### Step 3: Test with Sample File

1. Use the provided sample file: `/app/sample_test_jsons/sample_listening_test.json`
2. Upload through admin panel
3. Check import results
4. Verify questions created correctly

---

## 🧪 Testing the System

### Test 1: Validate JSON Without Importing

```bash
curl -X POST http://localhost:8001/api/admin/validate-test-json \
  -F "file=@sample_listening_test.json"
```

**Expected Response**:
```json
{
  "valid": true,
  "detected_types": {
    "short_answer_listening": 1,
    "form_completion": 1,
    "multiple_choice_single": 1,
    "multiple_choice_multiple": 1,
    "map_labeling": 2,
    "note_completion_listening": 1,
    "matching": 1,
    "table_completion_listening": 1,
    "diagram_labeling": 1,
    "flowchart_completion_listening": 1,
    "summary_completion_listening": 1,
    "sentence_completion_listening": 1
  },
  "errors": [],
  "warnings": []
}
```

### Test 2: Import Complete Test

```bash
curl -X POST http://localhost:8001/api/admin/import-test-json \
  -F "file=@sample_listening_test.json"
```

**Expected Response**:
```json
{
  "status": "success",
  "exam_id": "uuid-here",
  "summary": {
    "sections_created": 4,
    "questions_created": 20,
    "questions_by_type": {
      "short_answer_listening": 1,
      "form_completion": 1,
      ...
    }
  },
  "errors": [],
  "warnings": []
}
```

### Test 3: Get All Schemas

```bash
curl http://localhost:8001/api/question-types/schemas
```

### Test 4: Get Question Types List

```bash
curl http://localhost:8001/api/question-types/list
```

---

## 📝 Creating Your Own JSON Files

### Template Structure

```json
{
  "title": "Your Test Title",
  "description": "Test description",
  "test_type": "listening",  // "listening", "reading", or "writing"
  "duration_seconds": 2400,  // 40 minutes
  "audio_url": "https://...",  // For listening only
  "published": true,
  
  "sections": [
    {
      "index": 1,
      "title": "Section 1",
      "instructions": "Instructions here...",
      "passage_text": "...",  // For reading only
      
      "questions": [
        // Add your questions here
        // Type will be auto-detected!
      ]
    }
  ]
}
```

### Tips for Writing Questions

1. **Don't specify type manually** - The system will detect it
2. **Use consistent structures** - Follow examples in this guide
3. **Include all required fields** - Check schema documentation
4. **Test with validation first** - Use validate endpoint before importing
5. **Check warnings** - They might indicate missing optional fields

---

## 🚨 Troubleshooting

### Problem: "Unable to detect question type"

**Cause**: Question structure doesn't match any known pattern

**Solution**:
1. Check that all required fields are present
2. Verify field names are correct (case-sensitive)
3. Ensure data types match (string vs array vs object)
4. Compare with examples in this guide

### Problem: "Validation failed"

**Cause**: Structure doesn't meet constraints

**Solution**:
1. Read error message carefully
2. Check field types (integer vs string)
3. Verify value constraints (e.g., index >= 1)
4. Ensure relationships are correct (e.g., array answer_key needs select_count)

### Problem: "Import succeeded but questions not showing"

**Cause**: Frontend not updated to support new question types

**Solution**:
1. Implement frontend components for new types
2. Update rendering switch statements
3. Add cases to question type handlers

---

## 📚 Additional Resources

- **Complete Schema Reference**: See `/app/backend/question_type_schemas.py`
- **Gap Analysis**: See `/app/QUESTION_TYPES_GAP_ANALYSIS.md`
- **Implementation Guide**: See `/app/QUESTION_TYPES_DOCUMENTATION.md`
- **Sample JSON Files**: See `/app/sample_test_jsons/`

---

## ✅ Summary

The Auto-Import System provides:

✨ **26 question types** fully supported
✨ **Automatic type detection** from JSON structure
✨ **Complete validation** before import
✨ **Smart payload building** for each type
✨ **Detailed error reporting** with warnings
✨ **API endpoints** for import and validation
✨ **Sample JSON files** ready to use

**You can now upload any properly structured IELTS test JSON file, and the system will automatically detect all question types and create the complete test!** 🎉

---

*Auto-Import System Guide v1.0*  
*IELTS Practice Test Platform - Full Automation Support*
