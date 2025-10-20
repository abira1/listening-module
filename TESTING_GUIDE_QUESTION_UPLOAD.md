# 🧪 Testing Guide - Question Upload Workflow

## Quick Start Testing

### Test 1: Upload a Simple JSON File

**File**: `test_listening.json`
```json
{
  "test_type": "listening",
  "title": "IELTS Listening Test 1",
  "description": "Complete listening test with 40 questions",
  "duration_seconds": 2004,
  "audio_url": "https://example.com/audio.mp3",
  "sections": [
    {
      "section_number": 1,
      "title": "Section 1",
      "description": "Conversation",
      "questions": [
        {
          "id": "q1",
          "type": "mcq_single",
          "text": "What is the main topic?",
          "options": ["A", "B", "C", "D"],
          "correctAnswers": ["A"]
        }
      ]
    }
  ]
}
```

**Steps**:
1. Go to Admin Dashboard → Import Questions
2. Click "📁 Upload File" tab
3. Select `test_listening.json`
4. Click "Validate"
5. Verify: ✅ 1 question, 1 section, mcq_single type
6. Click "🚀 Upload & Create Track"
7. Verify: Track appears in Track Library

---

### Test 2: Upload Mixed Question Types

**File**: `test_mixed.json`
```json
{
  "test_type": "reading",
  "title": "IELTS Reading Test 1",
  "description": "Mixed reading questions",
  "duration_seconds": 3600,
  "sections": [
    {
      "section_number": 1,
      "title": "Passage 1",
      "questions": [
        {
          "id": "q1",
          "type": "true_false_ng",
          "text": "Statement 1",
          "correctAnswers": ["True"]
        },
        {
          "id": "q2",
          "type": "matching_headings",
          "text": "Match headings",
          "options": ["Heading A", "Heading B"],
          "correctAnswers": ["Heading A"]
        }
      ]
    }
  ]
}
```

**Expected Results**:
- ✅ 2 questions detected
- ✅ 2 types detected: true_false_ng, matching_headings
- ✅ Track created successfully

---

### Test 3: Validation Error Handling

**File**: `test_invalid.json`
```json
{
  "test_type": "listening",
  "title": "Invalid Test",
  "sections": [
    {
      "section_number": 1,
      "questions": [
        {
          "id": "q1",
          "text": "Missing type field"
          // Missing type and options
        }
      ]
    }
  ]
}
```

**Expected Results**:
- ✅ Validation fails
- ✅ Error message shows: "Missing required field: type"
- ✅ Upload button disabled

---

### Test 4: Drag & Drop Upload

**Steps**:
1. Go to Admin Dashboard → Import Questions
2. Click "📁 Upload File" tab
3. Drag a JSON file onto the upload area
4. File should appear in the upload box
5. Click "Validate"
6. Verify validation works

---

### Test 5: Question Rendering

**After uploading a track**:
1. Go to Track Library
2. Click "View" on the newly created track
3. Verify all questions render correctly
4. Test each question type:
   - ✅ Multiple choice (single/multiple)
   - ✅ True/False/Not Given
   - ✅ Matching questions
   - ✅ Completion questions
   - ✅ Writing tasks

---

### Test 6: Progress Indicator

**Steps**:
1. Upload a large JSON file (100+ questions)
2. Verify progress bar appears
3. Verify percentage updates
4. Verify upload completes successfully

---

### Test 7: Track Library Display

**After uploading**:
1. Go to Track Library
2. Verify new track appears
3. Check metadata:
   - ✅ Question count
   - ✅ Duration
   - ✅ Source badge ("🤖 AI Import")
   - ✅ Created date
4. Verify filtering works:
   - ✅ Filter by type
   - ✅ Filter by status
   - ✅ Search by title

---

### Test 8: Student Access

**Steps**:
1. Log in as student
2. Go to "Available Tests"
3. Verify newly created track appears
4. Click to start test
5. Verify all questions render correctly
6. Verify answers can be submitted

---

## Validation Rules to Test

### Required Fields
- ✅ `id` - Question ID
- ✅ `type` - Question type (auto-detected if missing)
- ✅ `text` - Question text

### Optional Fields
- ✅ `options` - For MCQ and matching
- ✅ `correctAnswers` - Answer key
- ✅ `explanation` - Answer explanation

### Constraints
- ✅ 2-4 options per question
- ✅ 1-10 questions per section
- ✅ 1-4 sections per track
- ✅ 1-40 total questions

---

## Error Scenarios to Test

| Scenario | Expected Behavior |
|----------|-------------------|
| Invalid JSON syntax | Show parse error |
| Missing required fields | Show field name in error |
| Invalid question type | Auto-detect or default to mcq_single |
| Too many questions | Show warning but allow |
| Empty file | Show error |
| Non-JSON file | Show file type error |
| Network error | Show retry option |

---

## Performance Testing

- [ ] Upload 100 questions - should complete in < 5 seconds
- [ ] Upload 500 questions - should complete in < 15 seconds
- [ ] Verify no memory leaks
- [ ] Check browser console for errors
- [ ] Verify Firebase storage updates

---

## Browser Compatibility

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

---

## Success Criteria

✅ All tests pass  
✅ No console errors  
✅ Track appears in library  
✅ All questions render  
✅ Students can access  
✅ Metadata displays correctly  
✅ Validation works properly  

---

**Ready to test!** 🚀

