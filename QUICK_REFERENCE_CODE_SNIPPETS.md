# 🔧 Quick Reference - Code Snippets

## Backend Usage

### 1. Type Detection

```python
from question_type_detector import QuestionTypeDetector

# Detect type from question
question = {
    "id": "q1",
    "text": "Choose the correct answer",
    "options": ["A", "B", "C", "D"],
    "correctAnswers": ["A"]
}

detected_type = QuestionTypeDetector.detect_type(question)
# Returns: "mcq_single"

# Batch questions by type
questions = [...]
batches = QuestionTypeDetector.batch_by_type(questions)
# Returns: {"mcq_single": [...], "true_false_ng": [...], ...}
```

### 2. Validation

```python
from question_validator import QuestionValidator, TrackValidator

# Validate single question
is_valid, errors = QuestionValidator.validate_question(question)

# Validate complete track
result = TrackValidator.validate_complete_track(track_data)
# Returns: {
#   "is_valid": True/False,
#   "total_questions": 40,
#   "questions_by_type": {...},
#   "errors": [...],
#   "warnings": [...]
# }
```

### 3. Track Creation

```python
from track_creation_service import TrackCreationService

# Create track from JSON
result = TrackCreationService.create_track_from_json(
    json_data=track_json,
    admin_id="admin@example.com"
)
# Returns: {
#   "success": True,
#   "track_id": "track_123",
#   "questions_created": 40,
#   "questions_by_type": {...}
# }
```

### 4. File Upload Endpoint

```python
from json_upload_service import get_router

# In server.py
app.include_router(get_json_upload_router())

# Endpoints available:
# POST /api/tracks/import-from-json
# POST /api/tracks/validate-json
```

---

## Frontend Usage

### 1. Upload File

```javascript
import { BackendService } from '@/services/BackendService';

// Upload with progress
const result = await BackendService.uploadJSONFile(
  file,
  (progress) => console.log(`${progress}% uploaded`)
);

// Returns: {
//   success: true,
//   track_id: "...",
//   questions_created: 40,
//   questions_by_type: {...}
// }
```

### 2. Validate File

```javascript
// Validate without uploading
const result = await BackendService.validateJSONFile(file);

// Returns: {
//   is_valid: true,
//   total_questions: 40,
//   questions_by_type: {...},
//   errors: [],
//   warnings: []
// }
```

### 3. Use Upload Component

```jsx
import { JSONFileUpload } from '@/components/admin/JSONFileUpload';

export function MyComponent() {
  return (
    <div>
      <JSONFileUpload />
    </div>
  );
}
```

### 4. Use Enhanced AIImport

```jsx
import { AIImport } from '@/components/admin/AIImport';

export function AdminDashboard() {
  return (
    <div>
      <AIImport />
      {/* Now has both Paste and Upload tabs */}
    </div>
  );
}
```

---

## JSON File Format

### Minimal Example

```json
{
  "test_type": "listening",
  "title": "Test Title",
  "description": "Test Description",
  "duration_seconds": 2004,
  "sections": [
    {
      "section_number": 1,
      "title": "Section 1",
      "questions": [
        {
          "id": "q1",
          "type": "mcq_single",
          "text": "Question text?",
          "options": ["A", "B", "C", "D"],
          "correctAnswers": ["A"]
        }
      ]
    }
  ]
}
```

### Complete Example

```json
{
  "test_type": "reading",
  "title": "IELTS Reading Test 1",
  "description": "Full reading test",
  "duration_seconds": 3600,
  "sections": [
    {
      "section_number": 1,
      "title": "Passage 1",
      "description": "Academic passage",
      "passage_text": "Long passage text...",
      "questions": [
        {
          "id": "q1",
          "type": "true_false_ng",
          "text": "Statement 1",
          "correctAnswers": ["True"],
          "explanation": "Because..."
        },
        {
          "id": "q2",
          "type": "matching_headings",
          "text": "Match headings",
          "options": ["Heading A", "Heading B", "Heading C"],
          "correctAnswers": ["Heading A"]
        }
      ]
    }
  ]
}
```

---

## All 18 Question Types

### Listening (10)
- `mcq_single` - Multiple choice (one answer)
- `mcq_multiple` - Multiple choice (multiple answers)
- `sentence_completion` - Complete sentences
- `form_completion` - Fill form fields
- `table_completion` - Fill table cells
- `flowchart_completion` - Complete flowchart
- `fill_gaps` - Fill blanks (longer)
- `fill_gaps_short` - Fill blanks (short)
- `matching` - Match items
- `map_labelling` - Label map locations

### Reading (6)
- `true_false_ng` - True/False/Not Given
- `matching_headings` - Match headings
- `matching_features` - Match features
- `matching_endings` - Match sentence endings
- `note_completion` - Complete notes
- `summary_completion` - Complete summary

### Writing (2)
- `writing_task1` - Descriptive writing
- `writing_task2` - Essay writing

---

## Error Handling

### Frontend

```javascript
try {
  const result = await BackendService.uploadJSONFile(file);
  if (result.success) {
    // Track created
    navigate('/admin/tracks');
  }
} catch (error) {
  console.error('Upload failed:', error.message);
  // Show error to user
}
```

### Backend

```python
try:
    result = TrackCreationService.create_track_from_json(json_data)
    if not result["success"]:
        raise HTTPException(
            status_code=400,
            detail={"message": "Failed", "errors": result["errors"]}
        )
except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
```

---

## Testing

### Test Upload

```bash
curl -X POST http://localhost:8001/api/tracks/import-from-json \
  -F "file=@test.json"
```

### Test Validation

```bash
curl -X POST http://localhost:8001/api/tracks/validate-json \
  -F "file=@test.json"
```

---

## Debugging

### Check Type Detection

```python
from question_type_detector import QuestionTypeDetector

question = {...}
print(QuestionTypeDetector.detect_type(question))
print(QuestionTypeDetector.VALID_TYPES)
```

### Check Validation

```python
from question_validator import TrackValidator

result = TrackValidator.validate_complete_track(track_data)
print(result["errors"])
print(result["warnings"])
```

### Check Frontend

```javascript
// In browser console
console.log(await BackendService.validateJSONFile(file));
```

---

**Ready to code! 🚀**

