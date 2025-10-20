# 📁 Example AI Import JSON Files

These are **complete, working examples** of JSON files that can be imported into the AI Import system.

---

## 📄 Files

### 1. listening_test_example.json
✅ **Complete IELTS Listening Test**
- 4 sections, 40 questions (Q1-Q40)
- All question types: short_answer, multiple_choice, map_labeling, diagram_labeling
- Includes image URLs for maps and diagrams
- Includes audio URL
- Duration: 2004 seconds (33:24)

### 2. reading_test_example.json
✅ **Complete IELTS Reading Test**
- 3 passages, 40 questions (Q1-Q40)
- Full passage texts (800-1000 words each)
- All question types: matching_paragraphs, sentence_completion, true_false_not_given, short_answer_reading, sentence_completion_wordlist
- Duration: 3600 seconds (60 minutes)

### 3. writing_test_example.json
✅ **Complete IELTS Writing Test**
- 2 tasks
- Task 1: Report with chart (150 words minimum)
- Task 2: Essay (250 words minimum)
- Duration: 3600 seconds (60 minutes)

---

## 🚀 How to Use

### Method 1: Copy & Paste
1. Open any JSON file above
2. Copy the entire content
3. Go to Admin Panel → AI Import
4. Paste in the textarea
5. Click "Validate JSON"
6. Click "Create Track"

### Method 2: Modify Examples
1. Copy an example JSON
2. Update the content:
   - Change title and description
   - Update questions and answers
   - Replace image URLs if needed
   - Replace audio URL for listening tests
3. Validate and import

---

## ✏️ Quick Modifications

### Change Test Title:
```json
"title": "IELTS Listening Practice Test 3",  // Change number or name
```

### Change Questions:
```json
{
  "index": 1,
  "type": "short_answer",
  "prompt": "Your new question text: __________",
  "answer_key": "your answer",
  "max_words": 2
}
```

### Update Image URLs:
```json
"image_url": "https://your-new-image-url.jpg"
```

### Update Audio URL:
```json
"audio_url": "https://your-audio-url.mp3"
```

---

## ⚠️ Important Notes

### For Listening Tests:
- MUST have exactly 4 sections
- MUST have exactly 40 questions (Q1-Q40)
- MUST have audio_url (even if placeholder)
- duration_seconds: 2004

### For Reading Tests:
- MUST have exactly 3 sections
- MUST have exactly 40 questions (Q1-Q40)
- MUST have passage_text for each section (800+ words)
- duration_seconds: 3600

### For Writing Tests:
- MUST have exactly 2 sections
- MUST have exactly 2 questions (Q1-Q2)
- Task 1: min_words=150, chart_image required
- Task 2: min_words=250, chart_image=null
- duration_seconds: 3600

---

## 🔗 Related Documentation

- **AI Prompts**: See `/app/AI_PROMPTS_FOR_PDF_EXTRACTION.md` for prompts to use with ChatGPT/Claude/Gemini
- **Codebase Index**: See `/app/COMPREHENSIVE_CODEBASE_INDEX.md` for system documentation

---

## ✅ Validation Checklist

Before importing, check:
- [ ] JSON is valid (use jsonlint.com)
- [ ] Correct number of sections
- [ ] Correct number of questions
- [ ] Questions numbered sequentially (no gaps)
- [ ] All required fields present
- [ ] Image URLs are accessible
- [ ] Audio URL is accessible (for listening)

---

**These examples are production-ready and can be imported immediately!**
