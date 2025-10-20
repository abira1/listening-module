# 🚀 Getting Started - Question Upload Workflow

## 5-Minute Quick Start

### Step 1: Prepare Your JSON File

Extract questions from PDF using DeepSeek prompt. You should have a JSON file like:

```json
{
  "test_type": "listening",
  "title": "IELTS Listening Test 1",
  "description": "Complete test",
  "duration_seconds": 2004,
  "audio_url": "https://example.com/audio.mp3",
  "sections": [
    {
      "section_number": 1,
      "title": "Section 1",
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

### Step 2: Access Admin Dashboard

1. Log in as admin
2. Go to **Admin Dashboard**
3. Click **"Import Questions"**

### Step 3: Upload JSON File

1. Click **"📁 Upload File"** tab
2. Drag & drop your JSON file OR click to select
3. Click **"Validate"** button
4. Review validation results

### Step 4: Create Track

1. Click **"🚀 Upload & Create Track"**
2. Wait for upload to complete
3. You'll be redirected to Track Library

### Step 5: Verify Track

1. Find your track in Track Library
2. Click **"View"** to see questions
3. Verify all questions render correctly

---

## What Happens Behind the Scenes

```
Your JSON File
    ↓
Uploaded to Backend
    ↓
Validated (structure, fields, types)
    ↓
Types Auto-Detected (all 18 types)
    ↓
Questions Batched by Type
    ↓
Track Created in Firebase
    ↓
Track Appears in Library
    ↓
Students Can Access
```

---

## Features You Get

✅ **Automatic Type Detection**
- System detects all 18 IELTS question types
- No manual type selection needed
- Defaults to mcq_single if uncertain

✅ **Comprehensive Validation**
- Checks JSON structure
- Validates required fields
- Provides detailed error messages
- Shows warnings for potential issues

✅ **User-Friendly Upload**
- Drag & drop interface
- File validation before upload
- Progress indicator
- Clear success/error messages

✅ **Metadata Display**
- Shows question count
- Shows questions by type
- Shows total duration
- Shows source badge (AI Import)

✅ **Dual Input Methods**
- Upload JSON file (new)
- Paste JSON directly (existing)
- Easy switching between methods

---

## Troubleshooting

### Issue: "File must be a JSON file"
**Solution**: Make sure your file ends with `.json` extension

### Issue: "Validation errors found"
**Solution**: 
1. Check error message for specific field
2. Verify JSON structure matches format
3. Ensure all required fields present
4. Check question types are valid

### Issue: "Upload failed"
**Solution**:
1. Check browser console for errors
2. Verify backend is running
3. Check network connection
4. Try smaller file first

### Issue: "Questions not rendering"
**Solution**:
1. Check question types are valid
2. Verify all required fields present
3. Check browser console for errors
4. Try different question type

---

## JSON File Requirements

### Required Fields
- `test_type` - "listening", "reading", or "writing"
- `title` - Track title
- `sections` - Array of sections
- `section_number` - Section number (1-4)
- `questions` - Array of questions
- `id` - Question ID
- `text` - Question text

### Optional Fields
- `description` - Track description
- `duration_seconds` - Test duration
- `audio_url` - For listening tests
- `type` - Question type (auto-detected if missing)
- `options` - For MCQ and matching
- `correctAnswers` - Answer key
- `explanation` - Answer explanation

### Constraints
- 1-4 sections per track
- 1-10 questions per section
- 1-40 total questions
- 2-4 options per question (for MCQ)

---

## All 18 Question Types

### Listening (10)
1. **mcq_single** - Multiple choice (one answer)
2. **mcq_multiple** - Multiple choice (multiple answers)
3. **sentence_completion** - Complete sentences
4. **form_completion** - Fill form fields
5. **table_completion** - Fill table cells
6. **flowchart_completion** - Complete flowchart
7. **fill_gaps** - Fill blanks (longer answers)
8. **fill_gaps_short** - Fill blanks (short answers)
9. **matching** - Match items from lists
10. **map_labelling** - Label map locations

### Reading (6)
11. **true_false_ng** - True/False/Not Given
12. **matching_headings** - Match paragraph headings
13. **matching_features** - Match features/characteristics
14. **matching_endings** - Match sentence endings
15. **note_completion** - Complete notes
16. **summary_completion** - Complete summary

### Writing (2)
17. **writing_task1** - Descriptive writing
18. **writing_task2** - Essay writing

---

## Next Steps

1. **Test Upload** - Try uploading a sample JSON file
2. **Verify Rendering** - Check all questions display correctly
3. **Test with Students** - Have students take the test
4. **Monitor Performance** - Check upload speeds
5. **Provide Feedback** - Report any issues

---

## Support Resources

- **IMPLEMENTATION_COMPLETE_SUMMARY.md** - Full implementation details
- **TESTING_GUIDE_QUESTION_UPLOAD.md** - Comprehensive testing guide
- **QUICK_REFERENCE_CODE_SNIPPETS.md** - Code examples
- **QUESTION_UPLOAD_IMPLEMENTATION_COMPLETE.md** - Technical details

---

## Success Indicators

✅ JSON file uploads successfully  
✅ Validation passes without errors  
✅ Track appears in Track Library  
✅ All questions render correctly  
✅ Metadata displays properly  
✅ Students can access track  
✅ Questions can be answered  
✅ Results are saved  

---

**You're all set! Start uploading your first track now! 🎉**

