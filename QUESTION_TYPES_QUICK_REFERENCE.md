# IELTS Question Types - Quick Reference Guide

## 📊 Overview

The system supports **26 distinct question types** across 3 test categories:

| Category | Question Types | Total in Comprehensive Test |
|----------|---------------|----------------------------|
| 🎧 **Listening** | 12 types | 40 questions |
| 📖 **Reading** | 14 types | 40 questions |
| ✍️ **Writing** | 1 type | 2 questions |
| **TOTAL** | **27 types*** | **82 questions** |

---

## 🎧 LISTENING (12 Types)

1. **short_answer_listening** - Short text answers
2. **multiple_choice_single** - Choose one option
3. **multiple_choice_multiple** - Choose multiple options
4. **sentence_completion_listening** - Fill sentence blanks
5. **form_completion** - Complete form fields
6. **map_labeling** - Label map locations
7. **diagram_labeling** - Label diagram parts
8. **matching** - Match two lists
9. **note_completion_listening** - Complete notes
10. **table_completion_listening** - Fill table cells
11. **flowchart_completion_listening** - Complete flowchart
12. **summary_completion_listening** - Complete summary

## 📖 READING (14 Types)

1. **matching_paragraphs** - Match info to paragraphs
2. **matching_headings** - Match headings to paragraphs
3. **sentence_completion_reading** - Complete sentences
4. **multiple_choice_single_reading** - Choose one
5. **true_false_not_given** - Fact verification
6. **yes_no_not_given** - Opinion verification
7. **multiple_choice_multiple_reading** - Choose multiple
8. **matching_sentence_endings** - Match sentence parts
9. **matching_features** - Match to categories
10. **note_completion_reading** - Complete notes
11. **table_completion_reading** - Fill tables
12. **flowchart_completion_reading** - Complete flowchart
13. **summary_completion_text** - Complete from text
14. **summary_completion_list** - Complete from word list

## ✍️ WRITING (1 Type)

1. **writing_task** - Essay/report writing

---

## 📝 Files Created

### Test Files
- `comprehensive_listening_test.json` - 40 questions, 12 types
- `comprehensive_reading_test.json` - 40 questions, 14 types
- `comprehensive_writing_test.json` - 2 questions, 1 type

### Documentation
- `COMPREHENSIVE_TEST_DOCUMENTATION.md` - Full documentation
- `QUESTION_TYPES_QUICK_REFERENCE.md` - This file

### Scripts
- `scripts/import_comprehensive_tests.py` - Import script

---

## 🚀 How to Import Tests

```bash
# Method 1: Run import script
python /app/scripts/import_comprehensive_tests.py

# Method 2: Manual API calls
curl -X POST http://localhost:8001/api/tracks/import-from-ai \
  -H "Content-Type: application/json" \
  -d @comprehensive_listening_test.json
```

---

## ✅ All Question Types Demonstrated

✅ **Listening:** 12 types with 2+ examples each
✅ **Reading:** 14 types with 2+ examples each  
✅ **Writing:** 1 type with 2 examples (Task 1 & 2)

**Total: 82 questions demonstrating 26 unique question types**
