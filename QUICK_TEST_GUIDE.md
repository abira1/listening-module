# 🚀 Quick Test Guide - AI Import System

**Fixed Issue**: Validation errors now display properly instead of showing "[object Object]"

---

## ✅ What Was Fixed:

1. **Enhanced error parsing** - Now properly extracts Pydantic validation errors
2. **Better error display** - Shows clear, readable error messages
3. **Improved error handling** - Handles all error types (JSON syntax, validation, backend)

---

## 🧪 Test It Now - 3 Easy Steps:

### Step 1: Go to Admin Panel
- Navigate to: **Admin Panel → AI Import**

### Step 2: Copy & Paste This Sample JSON

**LISTENING TEST** (Copy everything between the triple backticks):

```json
{
  "test_type": "listening",
  "title": "IELTS Listening Practice Test 2",
  "description": "Complete IELTS Listening test with 4 sections and 40 questions",
  "duration_seconds": 2004,
  "audio_url": "https://audio.jukehost.co.uk/F9irt6LcsYuP93ulaMo42JfXBEcABytV",
  "sections": [
    {
      "index": 1,
      "title": "Section 1",
      "instructions": "Complete the notes below. Write NO MORE THAN TWO WORDS for each answer.",
      "questions": [
        {"index": 1, "type": "short_answer", "prompt": "Type of job: __________", "answer_key": "part-time", "max_words": 2},
        {"index": 2, "type": "short_answer", "prompt": "Working days: __________", "answer_key": "Saturday", "max_words": 1},
        {"index": 3, "type": "short_answer", "prompt": "Hourly rate: £ __________", "answer_key": "8.50", "max_words": 1},
        {"index": 4, "type": "short_answer", "prompt": "Start time: __________ a.m.", "answer_key": "9:00", "max_words": 1},
        {"index": 5, "type": "short_answer", "prompt": "Break time: __________ minutes", "answer_key": "30", "max_words": 1},
        {"index": 6, "type": "short_answer", "prompt": "Lunch location: __________", "answer_key": "staff room", "max_words": 2},
        {"index": 7, "type": "short_answer", "prompt": "Uniform: __________ and shoes", "answer_key": "shirt", "max_words": 1},
        {"index": 8, "type": "short_answer", "prompt": "Training: __________ days", "answer_key": "three", "max_words": 1},
        {"index": 9, "type": "short_answer", "prompt": "Manager name: __________", "answer_key": "John Smith", "max_words": 2},
        {"index": 10, "type": "short_answer", "prompt": "Interview date: __________", "answer_key": "Monday", "max_words": 1}
      ]
    },
    {
      "index": 2,
      "title": "Section 2",
      "instructions": "Choose the correct letter, A, B, or C.",
      "questions": [
        {"index": 11, "type": "multiple_choice", "prompt": "The tour begins at:", "answer_key": "A", "options": ["A. Main entrance", "B. Gift shop", "C. Parking lot"]},
        {"index": 12, "type": "multiple_choice", "prompt": "Tour duration:", "answer_key": "B", "options": ["A. 1 hour", "B. 2 hours", "C. 3 hours"]},
        {"index": 13, "type": "multiple_choice", "prompt": "Booking method:", "answer_key": "C", "options": ["A. Phone only", "B. Email only", "C. Online or phone"]},
        {"index": 14, "type": "multiple_choice", "prompt": "Group discount available:", "answer_key": "A", "options": ["A. Yes, for 10+ people", "B. Yes, for 5+ people", "C. No"]},
        {"index": 15, "type": "multiple_choice", "prompt": "Facilities include:", "answer_key": "B", "options": ["A. Restaurant", "B. Cafe and toilets", "C. Hotel"]},
        {"index": 16, "type": "multiple_choice", "prompt": "Children under 5:", "answer_key": "C", "options": ["A. Pay half price", "B. Not allowed", "C. Enter free"]},
        {"index": 17, "type": "multiple_choice", "prompt": "Parking cost:", "answer_key": "A", "options": ["A. Free", "B. £3", "C. £5"]},
        {"index": 18, "type": "multiple_choice", "prompt": "Opening hours:", "answer_key": "B", "options": ["A. 8am-5pm", "B. 9am-6pm", "C. 10am-7pm"]},
        {"index": 19, "type": "multiple_choice", "prompt": "Best time to visit:", "answer_key": "C", "options": ["A. Morning", "B. Afternoon", "C. Early morning"]},
        {"index": 20, "type": "multiple_choice", "prompt": "Photography allowed:", "answer_key": "A", "options": ["A. Yes, everywhere", "B. No", "C. Outside only"]}
      ]
    },
    {
      "index": 3,
      "title": "Section 3",
      "instructions": "Answer the questions below.",
      "questions": [
        {"index": 21, "type": "multiple_choice", "prompt": "Topic of presentation:", "answer_key": "B", "options": ["A. Climate", "B. Energy", "C. Transport"]},
        {"index": 22, "type": "multiple_choice", "prompt": "Due date:", "answer_key": "C", "options": ["A. Next week", "B. Two weeks", "C. Three weeks"]},
        {"index": 23, "type": "multiple_choice", "prompt": "Format required:", "answer_key": "A", "options": ["A. Report and slides", "B. Video", "C. Poster"]},
        {"index": 24, "type": "short_answer", "prompt": "Research method: __________", "answer_key": "survey", "max_words": 1},
        {"index": 25, "type": "short_answer", "prompt": "Sample size: __________", "answer_key": "100", "max_words": 1},
        {"index": 26, "type": "short_answer", "prompt": "Location: __________", "answer_key": "campus", "max_words": 1},
        {"index": 27, "type": "short_answer", "prompt": "Main finding: __________", "answer_key": "positive response", "max_words": 2},
        {"index": 28, "type": "short_answer", "prompt": "Recommendation: __________", "answer_key": "more research", "max_words": 2},
        {"index": 29, "type": "short_answer", "prompt": "Next step: __________", "answer_key": "data analysis", "max_words": 2},
        {"index": 30, "type": "short_answer", "prompt": "Final deadline: __________", "answer_key": "December", "max_words": 1}
      ]
    },
    {
      "index": 4,
      "title": "Section 4",
      "instructions": "Complete the sentences below.",
      "questions": [
        {"index": 31, "type": "short_answer", "prompt": "The process is called __________.", "answer_key": "nuclear fission", "max_words": 2},
        {"index": 32, "type": "short_answer", "prompt": "Fuel type: __________", "answer_key": "uranium", "max_words": 1},
        {"index": 33, "type": "short_answer", "prompt": "Safety controlled by: __________", "answer_key": "control rods", "max_words": 2},
        {"index": 34, "type": "short_answer", "prompt": "Coolant used: __________", "answer_key": "water", "max_words": 1},
        {"index": 35, "type": "short_answer", "prompt": "Output: __________", "answer_key": "electricity", "max_words": 1},
        {"index": 36, "type": "short_answer", "prompt": "Efficiency rate: __________", "answer_key": "30 percent", "max_words": 2},
        {"index": 37, "type": "short_answer", "prompt": "Main advantage: __________", "answer_key": "low emissions", "max_words": 2},
        {"index": 38, "type": "short_answer", "prompt": "Main concern: __________", "answer_key": "waste disposal", "max_words": 2},
        {"index": 39, "type": "short_answer", "prompt": "Future development: __________", "answer_key": "fusion power", "max_words": 2},
        {"index": 40, "type": "short_answer", "prompt": "Expected timeline: __________", "answer_key": "2050", "max_words": 1}
      ]
    }
  ]
}
```

### Step 3: Click "Validate JSON"

**Expected Result**: ✅ You should see:
- "✅ Validation Successful" message
- Test details (Type: LISTENING, Questions: 40, Sections: 4)
- Section breakdown showing question types

**Then click** "🚀 Create Track from JSON"

**Expected Result**: 
- Track created successfully
- Redirects to Track Library
- New test appears in Test Management

---

## 🐛 Test Error Messages

Want to see the improved error messages? Try these intentional errors:

### Error Test 1: Wrong Section Count
Change `"index": 4` to `"index": 5` in Section 4 and validate.
**Expected**: Clear error message about section count

### Error Test 2: Wrong Question Count
Remove questions 39-40 and validate.
**Expected**: Error message "must have exactly 40 questions (found 38)"

### Error Test 3: Missing Audio URL
Remove the `"audio_url"` line and validate.
**Expected**: Error message "Listening test requires audio_url"

---

## 📁 More Examples

Full working examples are in:
- `/app/EXAMPLE_AI_IMPORT_JSONS/listening_test_example.json`
- `/app/EXAMPLE_AI_IMPORT_JSONS/reading_test_example.json`
- `/app/EXAMPLE_AI_IMPORT_JSONS/writing_test_example.json`

You can copy these files directly!

---

## 💡 What Changed?

**Before**: 
```
❌ Validation Errors
[object Object]
```

**After**:
```
❌ Validation Errors
• sections → 1: Listening test must have exactly 4 sections (found 3)
• Question indices must be sequential from 1 to 40. Found: [1, 2, 3, ..., 35]
• audio_url: Listening test requires audio_url
```

---

## 🎯 Next Steps

1. **Test the sample JSON above** ✅
2. **Try your own PDF** with ChatGPT using prompts from `/app/AI_PROMPTS_FOR_PDF_EXTRACTION.md`
3. **Upload images** to imgur.com and replace placeholder URLs
4. **Create your first test**! 🚀

---

**Need help? Check:**
- `/app/AI_PROMPTS_FOR_PDF_EXTRACTION.md` - AI prompts for all test types
- `/app/EXAMPLE_AI_IMPORT_JSONS/README.md` - Example files and usage guide
- `/app/COMPREHENSIVE_CODEBASE_INDEX.md` - Full system documentation
