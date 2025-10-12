# IELTS Question Types - Complete Guide

## 📚 Overview

This document lists ALL supported IELTS question types in the platform and how to use them with AI Import.

---

## 🎧 LISTENING TEST QUESTION TYPES

### 1. **short_answer**
Fill in the blank questions.

**Example:**
```json
{
  "type": "short_answer",
  "prompt": "Job enquiry at: __________ shop",
  "answer_key": "part-time",
  "max_words": 2
}
```

### 2. **multiple_choice**
Choose from A, B, C, D options.

**Example:**
```json
{
  "type": "multiple_choice",
  "prompt": "What is the hourly rate?",
  "answer_key": "C",
  "options": ["A. £7.50", "B. £8.00", "C. £8.50"]
}
```

### 3. **map_labeling**
Label locations on a map.

**Example:**
```json
{
  "type": "map_labeling",
  "prompt": "Ferry Terminal",
  "answer_key": "A",
  "options": ["A", "B", "C", "D", "E", "F", "G"],
  "image_url": "https://example.com/map.jpg"
}
```

### 4. **diagram_labeling**
Fill in parts of a diagram.

**Example:**
```json
{
  "type": "diagram_labeling",
  "prompt": "The __________ connects to the main chamber",
  "answer_key": "reactor",
  "max_words": 1,
  "image_url": "https://example.com/diagram.jpg"
}
```

### 5. **matching_draggable** ✨ NEW!
Drag and drop matching (e.g., "Choose SIX answers from the box A-G").

**Example:**
```json
{
  "type": "matching_draggable",
  "prompt": "Match each statement to the correct person.",
  "payload": {
    "instructions": "Choose SIX answers from the box and write the correct letter, A-G, next to the questions.",
    "questions": [
      {"label": "14. First person's achievement", "answer_key": "A"},
      {"label": "15. Second person's achievement", "answer_key": "C"},
      {"label": "16. Third person's achievement", "answer_key": "B"}
    ],
    "options": [
      {"key": "A", "text": "Invented the telephone"},
      {"key": "B", "text": "Discovered electricity"},
      {"key": "C", "text": "Created the internet"},
      {"key": "D", "text": "Founded Microsoft"}
    ]
  }
}
```

**Features:**
- Drag options from the right box to question fields on the left
- Options become grayed out when used (one-time use)
- Can undo/remove answers
- Works on mobile with tap-to-select

---

## 📖 READING TEST QUESTION TYPES

### 1. **true_false_not_given**
TRUE/FALSE/NOT GIVEN questions.

**Example:**
```json
{
  "type": "true_false_not_given",
  "prompt": "Chocolate was initially consumed as a beverage.",
  "answer_key": "TRUE",
  "options": ["TRUE", "FALSE", "NOT GIVEN"]
}
```

### 2. **yes_no_not_given**
YES/NO/NOT GIVEN questions (for opinions).

**Example:**
```json
{
  "type": "yes_no_not_given",
  "prompt": "The author believes technology has improved education.",
  "answer_key": "YES",
  "options": ["YES", "NO", "NOT GIVEN"]
}
```

### 3. **matching_paragraphs**
Which paragraph contains information (answer with paragraph letter A, B, C).

**Example:**
```json
{
  "type": "matching_paragraphs",
  "prompt": "Which paragraph contains information about early chocolate cultivation?",
  "answer_key": "A"
}
```

### 4. **sentence_completion**
Complete sentences with words from the passage.

**Example:**
```json
{
  "type": "sentence_completion",
  "prompt": "The cocoa tree was first cultivated in __________.",
  "answer_key": "Central America"
}
```

### 5. **sentence_completion_wordlist**
Complete sentences from a given word list.

**Example:**
```json
{
  "type": "sentence_completion_wordlist",
  "prompt": "Many scientists believe that our __________ list of senses lacks other important elements.",
  "answer_key": "initial",
  "wordlist": ["initial", "placement", "sensory organs", "limb", "movement", "stability"]
}
```

### 6. **short_answer_reading**
Short answer questions (Write NO MORE THAN...).

**Example:**
```json
{
  "type": "short_answer_reading",
  "prompt": "What reaction did the monkey start with when they were gazed at expressionless?",
  "answer_key": "defensive aggression"
}
```

### 7. **matching_draggable** ✨ NEW!
Drag and drop matching for reading tests too!

**Example:**
```json
{
  "type": "matching_draggable",
  "prompt": "Match each discovery to the correct scientist.",
  "payload": {
    "instructions": "Choose SIX answers from the box and write the correct letter, A-G, next to the questions.",
    "questions": [
      {"label": "14. Theory of Relativity", "answer_key": "A"},
      {"label": "15. Laws of Motion", "answer_key": "C"},
      {"label": "16. Vaccination", "answer_key": "B"}
    ],
    "options": [
      {"key": "A", "text": "Albert Einstein"},
      {"key": "B", "text": "Louis Pasteur"},
      {"key": "C", "text": "Isaac Newton"},
      {"key": "D", "text": "Marie Curie"}
    ]
  }
}
```

---

## ✍️ WRITING TEST TASK TYPES

### **writing_task**
Essay or report writing tasks.

**Example:**
```json
{
  "type": "writing_task",
  "prompt": "The chart below shows... Summarize the information...",
  "answer_key": null,
  "min_words": 150,
  "task_number": 1,
  "chart_image": "https://example.com/chart.jpg"
}
```

---

## 🤖 AI EXTRACTION TIPS

### For Listening Tests:
1. **Look for keywords:**
   - "Write NO MORE THAN..." → `short_answer`
   - "Choose A, B, C, or D" → `multiple_choice`
   - "Label the map" → `map_labeling`
   - "Label the diagram" → `diagram_labeling`
   - "Choose SIX answers from the box" → `matching_draggable`

2. **Audio URL:**
   - ALWAYS include `"audio_url": "PASTE_YOUR_AUDIO_URL_HERE"`
   - Use direct links (.mp3, .wav, .m4a)
   - Recommended hosts: JukeHost, Cloudinary, Google Drive

### For Reading Tests:
1. **Look for keywords:**
   - "TRUE/FALSE/NOT GIVEN" → `true_false_not_given`
   - "YES/NO/NOT GIVEN" → `yes_no_not_given`
   - "Which paragraph contains" → `matching_paragraphs`
   - "Complete the sentences" → `sentence_completion`
   - "Choose words from the list" → `sentence_completion_wordlist`
   - "Write NO MORE THAN THREE WORDS" → `short_answer_reading`
   - "Match the following" / "Choose from the box" → `matching_draggable`

2. **Passage Text:**
   - Include FULL passage (800-1000 words)
   - Keep paragraph labels (A, B, C, etc.)

---

## 📝 COMMON MISTAKES TO AVOID

### ❌ Wrong Format for matching_draggable:
```json
{
  "type": "matching_draggable",
  "prompt": "Match items",
  "answer_key": "A",  // ❌ WRONG - Don't use single answer_key
  "options": ["A. Option 1", "B. Option 2"]  // ❌ WRONG - Wrong format
}
```

### ✅ Correct Format for matching_draggable:
```json
{
  "type": "matching_draggable",
  "prompt": "Match items",
  "payload": {  // ✅ Use nested payload
    "questions": [  // ✅ Array of questions
      {"label": "14. Statement 1", "answer_key": "A"}
    ],
    "options": [  // ✅ Array of option objects
      {"key": "A", "text": "Full option text"}
    ]
  }
}
```

---

## 🎯 Testing Your JSON

Before importing:
1. Use **AI Import** page
2. Click **"View AI Prompts"**
3. Copy the appropriate prompt (Listening/Reading/Writing)
4. Paste into ChatGPT/Claude/Gemini with your PDF text
5. Copy ONLY the JSON output (starting with `{` and ending with `}`)
6. Paste into AI Import textarea
7. Click **"Validate JSON"**
8. Review validation results
9. Click **"Create Track from JSON"**

---

## 🆘 Need Help?

If you encounter issues:
1. Check that your JSON starts with `{` and ends with `}`
2. No Python code (no `import`, no `data =`, no `None` - use `null`)
3. All strings in double quotes `"like this"`
4. Answer keys are EXACT (case matters for text answers)
5. For listening, audio_url must be a direct link to audio file

---

Last Updated: 2025
