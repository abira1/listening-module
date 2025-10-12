# 🤖 AI Prompts for IELTS Test PDF Extraction

**Use these prompts with ChatGPT, Claude, or Gemini to extract questions from IELTS test PDFs**

---

## 📋 How to Use

1. **Copy the prompt** for your test type (Listening, Reading, or Writing)
2. **Open your AI tool** (ChatGPT, Claude, or Gemini)
3. **Paste the prompt**
4. **Copy your PDF text** and paste it at the end where it says `[PASTE YOUR PDF TEXT HERE]`
5. **Get the JSON output** - Copy ONLY the JSON (starting with `{` and ending with `}`)
6. **Go to Admin Panel** → AI Import → Paste JSON → Click "Validate JSON"

---

## 🎧 LISTENING TEST PROMPT

**Copy this entire prompt:**

```
You are an expert IELTS test extraction assistant. Your task is to extract questions from an IELTS Listening test PDF and convert them into a specific JSON format.

CRITICAL REQUIREMENTS:
- IELTS Listening tests have exactly 4 sections and 40 questions total (Q1-Q40)
- Questions must be numbered sequentially from 1 to 40
- Each section typically has 10 questions
- Duration is 2004 seconds (33 minutes 24 seconds: 30 min test + 2 min review + 1:24 audio intro)

QUESTION TYPES:
1. "short_answer" - Fill in the blank with words/numbers (e.g., "Name: __________")
2. "multiple_choice" - Choose A, B, C, or D
3. "map_labeling" - Label locations A-I on a map
4. "diagram_labeling" - Label parts A-F on a diagram

EXTRACTION RULES:
1. Keep question text EXACTLY as written in PDF (including blanks: __________)
2. For short_answer: Include max_words if specified (e.g., "NO MORE THAN TWO WORDS" = 2)
3. For multiple_choice: Include all options as array
4. For map/diagram_labeling: Use placeholder image URL (admin will update later)
5. Answer keys must be exact (case doesn't matter for text, exact letter for MC)

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown, no explanations, just pure JSON):

{
  "test_type": "listening",
  "title": "IELTS Listening Practice Test [NUMBER]",
  "description": "Complete IELTS Listening test with 4 sections and 40 questions covering social context, everyday situations, educational discussions, and academic lectures",
  "duration_seconds": 2004,
  "audio_url": "PLACEHOLDER_AUDIO_URL",
  "sections": [
    {
      "index": 1,
      "title": "Section 1",
      "instructions": "[Extract exact instructions from PDF, e.g., 'Complete the notes below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.']",
      "questions": [
        {
          "index": 1,
          "type": "short_answer",
          "prompt": "Type of job: __________",
          "answer_key": "part-time",
          "max_words": 2
        },
        {
          "index": 2,
          "type": "short_answer",
          "prompt": "Working days: __________ and Sunday",
          "answer_key": "Saturday",
          "max_words": 1
        },
        {
          "index": 3,
          "type": "multiple_choice",
          "prompt": "What time does the shop open on weekdays?",
          "answer_key": "B",
          "options": ["A. 8:00 AM", "B. 9:00 AM", "C. 10:00 AM", "D. 11:00 AM"]
        }
      ]
    },
    {
      "index": 2,
      "title": "Section 2",
      "instructions": "[Extract exact instructions, often includes map/diagram labeling]",
      "questions": [
        {
          "index": 11,
          "type": "map_labeling",
          "prompt": "Ferry Terminal",
          "answer_key": "A",
          "options": ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
          "image_url": "PLACEHOLDER_MAP_IMAGE_URL"
        },
        {
          "index": 12,
          "type": "map_labeling",
          "prompt": "Car Park",
          "answer_key": "E",
          "options": ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
          "image_url": "PLACEHOLDER_MAP_IMAGE_URL"
        },
        {
          "index": 17,
          "type": "multiple_choice",
          "prompt": "The tour begins at:",
          "answer_key": "C",
          "options": ["A. The museum entrance", "B. The gift shop", "C. The ferry terminal", "D. The car park"]
        }
      ]
    },
    {
      "index": 3,
      "title": "Section 3",
      "instructions": "[Extract exact instructions - usually discussion between students]",
      "questions": [
        {
          "index": 21,
          "type": "multiple_choice",
          "prompt": "What is the main topic of their presentation?",
          "answer_key": "B",
          "options": ["A. Climate change", "B. Renewable energy", "C. Solar panels", "D. Wind turbines"]
        }
      ]
    },
    {
      "index": 4,
      "title": "Section 4",
      "instructions": "[Extract exact instructions - usually academic lecture with diagram]",
      "questions": [
        {
          "index": 31,
          "type": "diagram_labeling",
          "prompt": "Control rods",
          "answer_key": "A",
          "options": ["A", "B", "C", "D", "E", "F"],
          "image_url": "PLACEHOLDER_DIAGRAM_IMAGE_URL"
        },
        {
          "index": 36,
          "type": "short_answer",
          "prompt": "The reactor uses __________ as fuel.",
          "answer_key": "uranium",
          "max_words": 1
        }
      ]
    }
  ]
}

IMPORTANT NOTES:
- You MUST include ALL 40 questions from the PDF
- Questions MUST be numbered 1-40 sequentially
- For images (maps/diagrams), use "PLACEHOLDER_MAP_IMAGE_URL" or "PLACEHOLDER_DIAGRAM_IMAGE_URL"
- For audio, use "PLACEHOLDER_AUDIO_URL"
- Admin will replace placeholders with real URLs later
- Do NOT include any text before or after the JSON
- Make sure JSON is valid (use online JSON validator if needed)

Now extract questions from this IELTS Listening test:

[PASTE YOUR PDF TEXT HERE]
```

---

## 📖 READING TEST PROMPT

**Copy this entire prompt:**

```
You are an expert IELTS test extraction assistant. Your task is to extract passages and questions from an IELTS Reading test PDF and convert them into a specific JSON format.

CRITICAL REQUIREMENTS:
- IELTS Reading tests have exactly 3 passages and 40 questions total (Q1-Q40)
- Questions must be numbered sequentially from 1 to 40
- Passage 1: Q1-13 (13 questions), Passage 2: Q14-27 (14 questions), Passage 3: Q28-40 (13 questions)
- Duration is 3600 seconds (60 minutes)

QUESTION TYPES:
1. "matching_paragraphs" - Which paragraph (A, B, C...) contains information
2. "sentence_completion" - Complete sentences with words from passage
3. "sentence_completion_wordlist" - Complete sentences from given word list
4. "true_false_not_given" - TRUE, FALSE, or NOT GIVEN questions
5. "short_answer_reading" - Short answer questions (max 3 words usually)

EXTRACTION RULES:
1. Extract COMPLETE passage text (800-1000 words each)
2. If passages have paragraph labels (A, B, C...), include them in passage_text
3. Keep question text EXACTLY as written
4. For completion questions, include blanks: "__________"
5. Answer keys must be exact

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown, no explanations, just pure JSON):

{
  "test_type": "reading",
  "title": "IELTS Reading Practice Test [NUMBER]",
  "description": "Complete IELTS Academic Reading test with 3 passages and 40 questions covering diverse topics",
  "duration_seconds": 3600,
  "audio_url": null,
  "sections": [
    {
      "index": 1,
      "title": "Passage 1: The History of Chocolate",
      "passage_text": "A. The cocoa tree, Theobroma cacao, was first cultivated by the Maya, Toltec, and Aztec peoples of Central America over 3,000 years ago. The Maya prepared a spicy drink from cocoa beans mixed with chillies, cornmeal and water. This bitter beverage was far from the sweet chocolate we know today.\n\nB. When Spanish conquistadors arrived in the Americas in the 16th century, they were introduced to this exotic drink. Hernán Cortés brought cocoa beans back to Spain in 1528, where sugar was added to make the drink more palatable to European tastes.\n\n[CONTINUE WITH FULL PASSAGE - Include ALL paragraphs labeled A, B, C, D, E, etc. Total: 800-1000 words]",
      "instructions": "Questions 1-13. Reading Passage 1 has six paragraphs, A-F.",
      "questions": [
        {
          "index": 1,
          "type": "matching_paragraphs",
          "prompt": "Which paragraph contains the following information? The origin of cocoa cultivation.",
          "answer_key": "A"
        },
        {
          "index": 6,
          "type": "sentence_completion",
          "prompt": "The Maya mixed cocoa beans with __________ to make a drink.",
          "answer_key": "chillies"
        },
        {
          "index": 9,
          "type": "true_false_not_given",
          "prompt": "Chocolate was initially consumed as a beverage.",
          "answer_key": "TRUE",
          "options": ["TRUE", "FALSE", "NOT GIVEN"]
        },
        {
          "index": 12,
          "type": "short_answer_reading",
          "prompt": "In what year did Cortés bring cocoa beans to Spain?",
          "answer_key": "1528",
          "max_words": 1
        }
      ]
    },
    {
      "index": 2,
      "title": "Passage 2: Artificial Intelligence in Healthcare",
      "passage_text": "[FULL PASSAGE TEXT - 800-1000 words with paragraphs labeled if applicable]",
      "instructions": "Questions 14-27. Reading Passage 2 has seven paragraphs, A-G.",
      "questions": [
        {
          "index": 14,
          "type": "matching_paragraphs",
          "prompt": "Which paragraph discusses AI in medical diagnosis?",
          "answer_key": "C"
        },
        {
          "index": 19,
          "type": "sentence_completion_wordlist",
          "prompt": "AI systems can analyze medical images with __________ accuracy.",
          "answer_key": "remarkable",
          "wordlist": ["remarkable", "limited", "questionable", "moderate"]
        }
      ]
    },
    {
      "index": 3,
      "title": "Passage 3: Urban Planning in the 21st Century",
      "passage_text": "[FULL PASSAGE TEXT - 800-1000 words]",
      "instructions": "Questions 28-40. Reading Passage 3 has eight paragraphs, A-H.",
      "questions": [
        {
          "index": 28,
          "type": "matching_paragraphs",
          "prompt": "Which paragraph mentions sustainable transportation?",
          "answer_key": "D"
        },
        {
          "index": 35,
          "type": "true_false_not_given",
          "prompt": "Modern cities prioritize green spaces.",
          "answer_key": "TRUE",
          "options": ["TRUE", "FALSE", "NOT GIVEN"]
        }
      ]
    }
  ]
}

IMPORTANT NOTES:
- You MUST include ALL 40 questions from the PDF
- You MUST include COMPLETE passage text (not just excerpts)
- Questions MUST be numbered 1-40 sequentially
- Preserve paragraph labels (A, B, C...) if present
- For wordlist questions, include the word list in "wordlist" field
- Do NOT include any text before or after the JSON
- Make sure JSON is valid

Now extract passages and questions from this IELTS Reading test:

[PASTE YOUR PDF TEXT HERE]
```

---

## ✍️ WRITING TEST PROMPT

**Copy this entire prompt:**

```
You are an expert IELTS test extraction assistant. Your task is to extract writing tasks from an IELTS Writing test PDF and convert them into a specific JSON format.

CRITICAL REQUIREMENTS:
- IELTS Writing tests have exactly 2 tasks
- Task 1: Report/describe visual data (150 words minimum, 20 minutes)
- Task 2: Essay on a topic (250 words minimum, 40 minutes)
- Duration is 3600 seconds (60 minutes)

EXTRACTION RULES:
1. Task 1 usually includes a chart, graph, table, diagram, or map
2. Task 2 is always an essay question
3. Keep prompts EXACTLY as written
4. Include word count requirements
5. answer_key is always null for writing tasks (manual grading)

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown, no explanations, just pure JSON):

{
  "test_type": "writing",
  "title": "IELTS Writing Practice Test [NUMBER]",
  "description": "Complete IELTS Academic Writing test with Task 1 (report/describe) and Task 2 (essay)",
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
          "prompt": "The chart below shows the export of milk from Italy, Russia, and Poland between 2008 and 2012.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          "answer_key": null,
          "min_words": 150,
          "task_number": 1,
          "chart_image": "PLACEHOLDER_CHART_IMAGE_URL",
          "instructions": "You should spend about 20 minutes on this task."
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
          "prompt": "Some people believe that international media coverage of a country often portrays only negative aspects. Others argue that media provides balanced reporting.\n\nTo what extent do you agree or disagree with this statement?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.",
          "answer_key": null,
          "min_words": 250,
          "task_number": 2,
          "chart_image": null,
          "instructions": "You should spend about 40 minutes on this task."
        }
      ]
    }
  ]
}

IMPORTANT NOTES:
- Task 1 always has chart_image (use "PLACEHOLDER_CHART_IMAGE_URL" - admin will replace)
- Task 2 never has chart_image (set to null)
- answer_key is always null for both tasks
- min_words: Task 1 = 150, Task 2 = 250
- Do NOT include any text before or after the JSON
- Make sure JSON is valid

Now extract writing tasks from this IELTS Writing test:

[PASTE YOUR PDF TEXT HERE]
```

---

## 🖼️ HANDLING IMAGES

### For Listening Tests (Maps & Diagrams):
1. **Upload images to an image hosting service:**
   - imgur.com (free, no signup needed)
   - imgbb.com
   - postimages.org
   
2. **Get direct image URL** (must end with .jpg, .png, or .gif)

3. **Replace placeholder URLs in JSON:**
   ```json
   "image_url": "https://i.imgur.com/abc123.jpg"
   ```

### For Writing Tests (Charts):
1. Upload chart image to hosting service
2. Replace "PLACEHOLDER_CHART_IMAGE_URL" with real URL
3. Or upload in Admin Panel after creating test

---

## 🎵 HANDLING AUDIO

### For Listening Tests:

**Option 1: External Audio Hosting**
- Upload to: SoundCloud, Google Drive (public link), Dropbox (public link)
- Get direct MP3 URL
- Replace "PLACEHOLDER_AUDIO_URL" in JSON

**Option 2: Upload in Admin Panel**
- Create test with placeholder URL first
- Go to Test Management → Edit Test → Upload Audio
- Audio saved automatically

---

## ✅ VALIDATION CHECKLIST

Before clicking "Validate JSON", make sure:

**Listening Tests:**
- [ ] 4 sections
- [ ] 40 questions total (Q1-Q40)
- [ ] duration_seconds: 2004
- [ ] audio_url provided (or placeholder)
- [ ] Question indices are 1-40 sequential

**Reading Tests:**
- [ ] 3 sections (passages)
- [ ] 40 questions total (Q1-Q40)
- [ ] duration_seconds: 3600
- [ ] Each section has passage_text
- [ ] Passage text is complete (800+ words each)

**Writing Tests:**
- [ ] 2 sections (Task 1 & Task 2)
- [ ] 2 questions total (Q1-Q2)
- [ ] duration_seconds: 3600
- [ ] Task 1: min_words=150, chart_image provided
- [ ] Task 2: min_words=250, chart_image=null
- [ ] answer_key is null for both

---

## 🐛 COMMON ERRORS & FIXES

### Error: "Invalid JSON format"
**Fix:** Copy ONLY the JSON from AI output (starting with `{`, ending with `}`)

### Error: "Listening test must have exactly 4 sections"
**Fix:** Check sections array - must have 4 items with index 1, 2, 3, 4

### Error: "Listening test must have exactly 40 questions"
**Fix:** Count all questions across all sections - must total 40

### Error: "Question indices must be sequential from 1 to 40"
**Fix:** Questions must be numbered 1, 2, 3, ..., 40 (no gaps, no duplicates)

### Error: "answer_key is required for question type 'short_answer'"
**Fix:** Every question (except writing_task) needs answer_key field

### Error: "Reading test Section 1 must have passage_text"
**Fix:** Each reading section needs complete passage text (800+ words)

### Error: "Listening test requires audio_url"
**Fix:** Add audio_url field (even if placeholder)

---

## 📞 NEED HELP?

1. **Test your JSON**: Use jsonlint.com to validate JSON syntax
2. **Check examples**: See complete examples in `/app/EXAMPLE_AI_IMPORT_JSONS/`
3. **View current tests**: Check existing tests in Admin Panel for reference

---

**Happy testing! 🚀**
