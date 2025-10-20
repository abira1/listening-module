# IELTS Question Types - Gap Analysis & Implementation Plan

## 🚨 CRITICAL FINDING

The current system implements **only 12 question types** but IELTS officially uses **23+ distinct question types** across Listening and Reading tests. This document provides a comprehensive gap analysis and implementation roadmap.

---

## 📊 Current Implementation vs. Required Support

### LISTENING TEST

| # | Official IELTS Type | Current Implementation | Status | Priority |
|---|---------------------|------------------------|--------|----------|
| 1 | Multiple Choice (Single Answer) | ✅ `multiple_choice` | ✅ Implemented | - |
| 2 | Multiple Choice (Multiple Answer) | ❌ Missing | ❌ **NEEDS IMPLEMENTATION** | 🔴 High |
| 3 | Matching | ⚠️ `matching_draggable` (partial) | ⚠️ **NEEDS EXPANSION** | 🟡 Medium |
| 4 | Map / Plan / Diagram Labelling | ✅ `map_labeling`, `diagram_labeling` | ✅ Implemented | - |
| 5 | Form Completion | ❌ Missing | ❌ **NEEDS IMPLEMENTATION** | 🔴 High |
| 6 | Note Completion | ⚠️ `short_answer` (partial) | ⚠️ **NEEDS DEDICATED TYPE** | 🟡 Medium |
| 7 | Table Completion | ❌ Missing | ❌ **NEEDS IMPLEMENTATION** | 🔴 High |
| 8 | Flow-chart / Process Completion | ❌ Missing | ❌ **NEEDS IMPLEMENTATION** | 🟡 Medium |
| 9 | Summary Completion | ❌ Missing | ❌ **NEEDS IMPLEMENTATION** | 🟡 Medium |
| 10 | Sentence Completion | ⚠️ `short_answer` (partial) | ⚠️ **NEEDS DEDICATED TYPE** | 🟡 Medium |
| 11 | Short-Answer Questions | ✅ `short_answer` | ✅ Implemented | - |

**Summary**: 3/11 fully implemented, 8/11 missing or partial

---

### READING TEST

| # | Official IELTS Type | Current Implementation | Status | Priority |
|---|---------------------|------------------------|--------|----------|
| 1 | Multiple Choice with One Answer | ❌ Missing | ❌ **NEEDS IMPLEMENTATION** | 🔴 High |
| 2 | Multiple Choice with More Than One Answer | ❌ Missing | ❌ **NEEDS IMPLEMENTATION** | 🔴 High |
| 3 | Identifying Information (True/False/Not Given) | ✅ `true_false_not_given` | ✅ Implemented | - |
| 4 | Note Completion | ❌ Missing | ❌ **NEEDS IMPLEMENTATION** | 🔴 High |
| 5 | Matching Headings | ⚠️ `matching_paragraphs` (partial) | ⚠️ **NEEDS EXPANSION** | 🟡 Medium |
| 6 | Summary Completion (from Text) | ⚠️ `sentence_completion` (partial) | ⚠️ **NEEDS DEDICATED TYPE** | 🟡 Medium |
| 7 | Summary Completion (from List) | ✅ `sentence_completion_wordlist` | ✅ Implemented | - |
| 8 | Flow-chart Completion (from Text) | ❌ Missing | ❌ **NEEDS IMPLEMENTATION** | 🟡 Medium |
| 9 | Sentence Completion | ✅ `sentence_completion` | ✅ Implemented | - |
| 10 | Matching Sentence Endings | ❌ Missing | ❌ **NEEDS IMPLEMENTATION** | 🔴 High |
| 11 | Table Completion | ❌ Missing | ❌ **NEEDS IMPLEMENTATION** | 🔴 High |
| 12 | Matching Features | ⚠️ `matching_draggable` (partial) | ⚠️ **NEEDS EXPANSION** | 🟡 Medium |

**Summary**: 4/12 fully implemented, 8/12 missing or partial

---

## 🔴 MISSING QUESTION TYPES (High Priority)

### Listening Test - MISSING (5 types)

#### 1. **multiple_choice_multiple** (Multiple Answer)
**What it is**: Multiple choice where 2+ options are correct (e.g., "Choose TWO")

**Payload Structure**:
```json
{
  "type": "multiple_choice_multiple",
  "prompt": "Which TWO things does the speaker mention?",
  "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
  "answer_key": ["A", "C"],
  "select_count": 2
}
```

**UI Component**: Checkboxes instead of radio buttons, with counter showing "2 of 2 selected"

**Grading**: Check if selected answers match ALL correct answers (exact set match)

---

#### 2. **form_completion**
**What it is**: Fill in a form (registration, order form, etc.) with missing fields

**Payload Structure**:
```json
{
  "type": "form_completion",
  "form_title": "Job Application Form",
  "fields": [
    {"label": "Name:", "answer_key": "Sarah Johnson", "max_words": 3},
    {"label": "Phone:", "answer_key": "555-1234", "max_words": 1},
    {"label": "Start Date:", "answer_key": "15 March", "max_words": 2}
  ]
}
```

**UI Component**: Form layout with labels and input fields, styled like an actual form

**Grading**: Check each field independently (case-insensitive)

---

#### 3. **table_completion_listening**
**What it is**: Fill in missing cells in a table based on listening

**Payload Structure**:
```json
{
  "type": "table_completion_listening",
  "table_headers": ["Day", "Activity", "Time"],
  "rows": [
    {"cells": ["Monday", "__BLANK_1__", "9am"], "answer_key_1": "Swimming"},
    {"cells": ["Tuesday", "Yoga", "__BLANK_2__"], "answer_key_2": "10am"}
  ]
}
```

**UI Component**: HTML table with input fields in blank cells

**Grading**: Check each blank independently

---

#### 4. **flowchart_completion_listening**
**What it is**: Complete missing steps in a process/flowchart

**Payload Structure**:
```json
{
  "type": "flowchart_completion_listening",
  "title": "Manufacturing Process",
  "steps": [
    {"step": 1, "text": "Raw materials arrive"},
    {"step": 2, "text": "__BLANK_1__", "answer_key": "Quality inspection"},
    {"step": 3, "text": "Assembly begins"},
    {"step": 4, "text": "__BLANK_2__", "answer_key": "Packaging"}
  ]
}
```

**UI Component**: Visual flowchart with boxes and arrows, blanks as input fields

**Grading**: Case-insensitive match for each blank

---

#### 5. **summary_completion_listening**
**What it is**: Complete a summary paragraph with missing words

**Payload Structure**:
```json
{
  "type": "summary_completion_listening",
  "summary_text": "The company was founded in __BLANK_1__ and now employs __BLANK_2__ people.",
  "blanks": [
    {"blank_id": 1, "answer_key": "1985", "max_words": 1},
    {"blank_id": 2, "answer_key": "500", "max_words": 1}
  ]
}
```

**UI Component**: Paragraph with inline input fields for blanks

**Grading**: Case-insensitive match

---

### Reading Test - MISSING (5 types)

#### 1. **multiple_choice_single_reading**
**What it is**: Standard multiple choice with one correct answer

**Payload Structure**:
```json
{
  "type": "multiple_choice_single_reading",
  "prompt": "What is the main idea of paragraph C?",
  "options": ["A. Climate change", "B. Economic growth", "C. Social issues"],
  "answer_key": "B"
}
```

**UI Component**: Radio buttons with options

**Grading**: Exact match

---

#### 2. **multiple_choice_multiple_reading**
**What it is**: Multiple choice where 2+ options are correct

**Payload Structure**:
```json
{
  "type": "multiple_choice_multiple_reading",
  "prompt": "Which TWO statements are true according to the passage?",
  "options": ["A. Statement 1", "B. Statement 2", "C. Statement 3", "D. Statement 4"],
  "answer_key": ["A", "D"],
  "select_count": 2
}
```

**UI Component**: Checkboxes with counter

**Grading**: Exact set match

---

#### 3. **note_completion_reading**
**What it is**: Fill in notes/outline with words from passage

**Payload Structure**:
```json
{
  "type": "note_completion_reading",
  "notes_title": "Main Points",
  "notes": [
    {"line": "• First discovery: __BLANK_1__", "answer_key": "penicillin", "max_words": 1},
    {"line": "• Year: __BLANK_2__", "answer_key": "1928", "max_words": 1}
  ]
}
```

**UI Component**: Bulleted list with input fields

**Grading**: Case-insensitive, from passage

---

#### 4. **matching_sentence_endings**
**What it is**: Match sentence beginnings to correct endings

**Payload Structure**:
```json
{
  "type": "matching_sentence_endings",
  "sentence_beginnings": [
    {"id": 1, "text": "The researchers found that"},
    {"id": 2, "text": "According to the study"}
  ],
  "endings": [
    {"key": "A", "text": "pollution levels were high."},
    {"key": "B", "text": "climate change is accelerating."},
    {"key": "C", "text": "resources are limited."}
  ],
  "answer_key": {"1": "B", "2": "A"}
}
```

**UI Component**: Sentence beginnings with dropdown for endings

**Grading**: Exact match for each pairing

---

#### 5. **table_completion_reading**
**What it is**: Fill in missing information in a table from passage

**Payload Structure**:
```json
{
  "type": "table_completion_reading",
  "table_headers": ["Country", "Population", "GDP"],
  "rows": [
    {"cells": ["USA", "__BLANK_1__", "21 trillion"], "answer_key_1": "330 million"},
    {"cells": ["China", "1.4 billion", "__BLANK_2__"], "answer_key_2": "14 trillion"}
  ]
}
```

**UI Component**: HTML table with input fields

**Grading**: Case-insensitive from passage

---

## 🟡 PARTIAL IMPLEMENTATIONS (Needs Enhancement)

### 1. **matching** (Currently `matching_draggable`)
**Issue**: Current implementation is generic drag-and-drop but doesn't handle all IELTS matching scenarios

**Needs**:
- Support for matching names to statements
- Support for matching categories to items
- Support for matching opinions to people
- Support for matching causes to effects

**Enhancement Required**: Add different matching modes to payload

---

### 2. **matching_headings** (Currently `matching_paragraphs`)
**Issue**: Current implementation expects paragraph letters (A-H) but doesn't show heading text properly

**Needs**:
- Display full heading text as options
- Support for unused headings (more headings than paragraphs)
- Better visual distinction between heading and paragraph assignment

**Enhancement Required**: Dedicated component with heading display

---

### 3. **note_completion** / **sentence_completion** distinction
**Issue**: Currently using `short_answer` for both, but they should be separate types

**Needs**:
- `note_completion_listening` - for structured notes/outlines
- `sentence_completion_listening` - for completing sentences specifically
- Different UI presentation (notes look like notes, sentences look like sentences)

---

## 📋 IMPLEMENTATION ROADMAP

### Phase 1: Critical Missing Types (2-3 days)
**Priority**: 🔴 High Priority Types First

1. **Day 1: Multiple Choice Enhancements**
   - Add `multiple_choice_multiple` for both listening and reading
   - Update UI for checkbox behavior
   - Update grading for set matching
   - Test with sample questions

2. **Day 2: Form & Table Completion**
   - Implement `form_completion` for listening
   - Implement `table_completion_reading` and `table_completion_listening`
   - Create table UI component
   - Create form UI component
   - Add grading logic

3. **Day 3: Note & Sentence Completion**
   - Split `short_answer` into dedicated types
   - Implement `note_completion_reading` and `note_completion_listening`
   - Implement `sentence_completion_listening` (separate from reading)
   - Create note-style UI component

### Phase 2: Medium Priority Types (2 days)
**Priority**: 🟡 Medium Priority

4. **Day 4: Flowchart & Summary**
   - Implement `flowchart_completion_listening` and `flowchart_completion_reading`
   - Implement `summary_completion_listening` and `summary_completion_reading`
   - Create flowchart UI component (boxes with arrows)

5. **Day 5: Matching Enhancements**
   - Enhance `matching_draggable` with different modes
   - Implement `matching_sentence_endings`
   - Implement `matching_features` properly
   - Create dedicated `matching_headings` component

### Phase 3: Testing & Validation (1 day)
6. **Day 6: Integration Testing**
   - Test all question types with sample data
   - Verify auto-grading for each type
   - Test JSON import with all types
   - Mobile responsiveness check
   - Accessibility testing

---

## 🔧 TECHNICAL IMPLEMENTATION DETAILS

### Backend Changes Required

#### 1. Update `ai_import_service.py` Type Enum

**Current** (lines 22-33):
```python
type: Literal[
    "short_answer",
    "multiple_choice",
    "map_labeling",
    "diagram_labeling",
    "true_false_not_given",
    "matching_paragraphs",
    "sentence_completion",
    "sentence_completion_wordlist",
    "short_answer_reading",
    "writing_task"
]
```

**New (ALL TYPES)**:
```python
type: Literal[
    # LISTENING TYPES (11 total)
    "multiple_choice_single",           # Single answer MCQ
    "multiple_choice_multiple",         # Multiple answer MCQ
    "matching",                         # General matching
    "map_labeling",                     # Map/plan labeling
    "diagram_labeling",                 # Diagram labeling
    "form_completion",                  # Form filling
    "note_completion_listening",        # Note completion
    "table_completion_listening",       # Table filling
    "flowchart_completion_listening",   # Flowchart/process
    "summary_completion_listening",     # Summary paragraph
    "sentence_completion_listening",    # Sentence completion
    "short_answer_listening",           # Short answer questions
    
    # READING TYPES (12 total)
    "multiple_choice_single_reading",   # Single answer MCQ
    "multiple_choice_multiple_reading", # Multiple answer MCQ
    "true_false_not_given",            # T/F/NG identification
    "yes_no_not_given",                # Y/N/NG variant
    "note_completion_reading",         # Note completion
    "matching_headings",               # Heading matching
    "summary_completion_text",         # Summary from text
    "summary_completion_list",         # Summary from list
    "flowchart_completion_reading",    # Flowchart completion
    "sentence_completion_reading",     # Sentence completion
    "matching_sentence_endings",       # Sentence ending matching
    "table_completion_reading",        # Table completion
    "matching_features",               # Feature matching
    "matching_paragraphs",             # Paragraph matching
    
    # WRITING TYPE (1 total)
    "writing_task"                     # Essay/report writing
]
```

---

#### 2. Update Grading Logic in `server.py`

**New grading function**:
```python
def grade_answer(question_type, student_answer, correct_answer, payload):
    """
    Grade a single question based on type
    Returns: True if correct, False otherwise
    """
    student_answer = str(student_answer).strip().lower()
    
    # Multiple choice with multiple answers (set matching)
    if "multiple_choice_multiple" in question_type:
        correct_set = set(str(ans).strip().lower() for ans in correct_answer)
        student_set = set(str(ans).strip().lower() for ans in student_answer.split(','))
        return correct_set == student_set
    
    # Text-based questions (case-insensitive)
    text_types = [
        "short_answer", "note_completion", "sentence_completion",
        "summary_completion", "form_completion", "table_completion",
        "flowchart_completion", "diagram_labeling"
    ]
    if any(t in question_type for t in text_types):
        correct_answer = str(correct_answer).strip().lower()
        return student_answer == correct_answer
    
    # Choice-based questions (exact match)
    choice_types = [
        "multiple_choice_single", "map_labeling", "matching",
        "true_false_not_given", "yes_no_not_given", "matching_headings",
        "matching_features", "matching_sentence_endings"
    ]
    if any(t in question_type for t in choice_types):
        correct_answer = str(correct_answer).strip().lower()
        return student_answer == correct_answer
    
    # Default: exact match
    correct_answer = str(correct_answer).strip().lower()
    return student_answer == correct_answer
```

---

### Frontend Changes Required

#### New Component Structure

```
/app/frontend/src/components/
├── listening/
│   ├── MultipleChoiceMultiple.jsx       ✨ NEW
│   ├── FormCompletion.jsx               ✨ NEW
│   ├── TableCompletion.jsx              ✨ NEW
│   ├── FlowchartCompletion.jsx          ✨ NEW
│   ├── SummaryCompletion.jsx            ✨ NEW
│   └── NoteCompletion.jsx               ✨ NEW
│
├── reading/
│   ├── MultipleChoiceSingle.jsx         ✨ NEW
│   ├── MultipleChoiceMultiple.jsx       ✨ NEW
│   ├── NoteCompletion.jsx               ✨ NEW
│   ├── MatchingHeadings.jsx             ✨ NEW (enhance existing)
│   ├── MatchingSentenceEndings.jsx      ✨ NEW
│   ├── TableCompletion.jsx              ✨ NEW
│   ├── FlowchartCompletion.jsx          ✨ NEW
│   └── MatchingFeatures.jsx             ✨ NEW (enhance existing)
│
└── shared/
    ├── TableComponent.jsx               ✨ NEW (reusable table)
    ├── FlowchartComponent.jsx           ✨ NEW (reusable flowchart)
    └── CheckboxGroup.jsx                ✨ NEW (for multiple choice multiple)
```

---

## 📊 Payload Examples for ALL Question Types

### Complete Listening Question Types

#### 1. Multiple Choice (Single Answer) - ✅ IMPLEMENTED
```json
{
  "index": 1,
  "type": "multiple_choice_single",
  "prompt": "What is the man's occupation?",
  "options": ["Teacher", "Doctor", "Engineer"],
  "answer_key": "B",
  "marks": 1
}
```

#### 2. Multiple Choice (Multiple Answer) - ❌ NEW
```json
{
  "index": 2,
  "type": "multiple_choice_multiple",
  "prompt": "Which TWO facilities are mentioned?",
  "options": ["Library", "Gym", "Pool", "Cafeteria"],
  "answer_key": ["A", "C"],
  "select_count": 2,
  "marks": 1
}
```

#### 3. Matching - ⚠️ ENHANCE
```json
{
  "index": 3,
  "type": "matching",
  "instructions": "Match each person to their opinion",
  "left_items": [
    {"id": 1, "text": "Dr. Smith"},
    {"id": 2, "text": "Prof. Jones"}
  ],
  "right_items": [
    {"key": "A", "text": "Supports the proposal"},
    {"key": "B", "text": "Against the proposal"},
    {"key": "C", "text": "Neutral stance"}
  ],
  "answer_key": {"1": "A", "2": "B"},
  "marks": 2
}
```

#### 4. Map/Plan/Diagram Labelling - ✅ IMPLEMENTED
```json
{
  "index": 4,
  "type": "map_labeling",
  "prompt": "Restaurant",
  "options": ["A", "B", "C", "D", "E"],
  "answer_key": "B",
  "image_url": "https://example.com/map.png",
  "marks": 1
}
```

#### 5. Form Completion - ❌ NEW
```json
{
  "index": 5,
  "type": "form_completion",
  "form_title": "Library Registration Form",
  "questions": [
    {"index": 5, "label": "Surname:", "answer_key": "Johnson", "max_words": 1},
    {"index": 6, "label": "Date of Birth:", "answer_key": "15 March 1995", "max_words": 3},
    {"index": 7, "label": "Address:", "answer_key": "42 Park Street", "max_words": 3}
  ],
  "marks": 3
}
```

#### 6. Note Completion - ❌ NEW
```json
{
  "index": 8,
  "type": "note_completion_listening",
  "title": "Tourist Information",
  "notes": [
    {"index": 8, "text": "Opening hours: __BLANK__", "answer_key": "9am to 5pm", "max_words": 3},
    {"index": 9, "text": "Cost: $__BLANK__ per person", "answer_key": "15", "max_words": 1}
  ],
  "marks": 2
}
```

#### 7. Table Completion - ❌ NEW
```json
{
  "index": 10,
  "type": "table_completion_listening",
  "table_title": "Course Schedule",
  "headers": ["Day", "Subject", "Time"],
  "rows": [
    {"index": 10, "cells": ["Monday", "__BLANK__", "9am"], "blank_position": 1, "answer_key": "Mathematics"},
    {"index": 11, "cells": ["Tuesday", "Science", "__BLANK__"], "blank_position": 2, "answer_key": "10am"}
  ],
  "marks": 2
}
```

#### 8. Flowchart/Process Completion - ❌ NEW
```json
{
  "index": 12,
  "type": "flowchart_completion_listening",
  "title": "Application Process",
  "steps": [
    {"index": 12, "text": "__BLANK__", "answer_key": "Submit form", "max_words": 2},
    {"text": "Interview"},
    {"index": 13, "text": "__BLANK__", "answer_key": "Medical check", "max_words": 2},
    {"text": "Confirmation"}
  ],
  "marks": 2
}
```

#### 9. Summary Completion - ❌ NEW
```json
{
  "index": 14,
  "type": "summary_completion_listening",
  "summary": "The company was established in __14__ and now has __15__ branches worldwide.",
  "blanks": [
    {"index": 14, "answer_key": "1985", "max_words": 1},
    {"index": 15, "answer_key": "50", "max_words": 1}
  ],
  "marks": 2
}
```

#### 10. Sentence Completion - ✅ IMPLEMENTED (as short_answer)
```json
{
  "index": 16,
  "type": "sentence_completion_listening",
  "prompt": "The meeting will be held in the ____ room.",
  "answer_key": "conference",
  "max_words": 1,
  "marks": 1
}
```

#### 11. Short-Answer Questions - ✅ IMPLEMENTED
```json
{
  "index": 17,
  "type": "short_answer_listening",
  "prompt": "What time does the tour start?",
  "answer_key": "2:30pm",
  "max_words": 2,
  "marks": 1
}
```

---

### Complete Reading Question Types

*(Similar detailed payload structures for all 12 reading types...)*

---

## ✅ ACCEPTANCE CRITERIA

For the system to fully support JSON imports, ALL of the following must work:

### Functional Requirements
- [ ] All 11 listening question types render correctly
- [ ] All 12 reading question types render correctly
- [ ] All question types accept and validate answers
- [ ] All auto-gradable types grade correctly
- [ ] JSON import validates all question types
- [ ] Database stores all question types properly

### UI/UX Requirements
- [ ] Each question type has appropriate UI component
- [ ] Mobile-responsive for all types
- [ ] Keyboard navigation works for all types
- [ ] Screen readers announce all types correctly
- [ ] Visual feedback for all interaction types

### Technical Requirements
- [ ] Backend API handles all types
- [ ] Grading logic covers all auto-gradable types
- [ ] Word limit enforcement where applicable
- [ ] Answer validation for each type
- [ ] Error handling for invalid payloads

---

## 🎯 SUCCESS METRICS

1. **Coverage**: 23/23 question types fully supported (100%)
2. **Auto-Grading**: 22/23 types auto-graded (writing excluded)
3. **JSON Import**: Any valid IELTS test JSON can be imported without errors
4. **User Experience**: All question types render within 2 seconds
5. **Accuracy**: Auto-grading accuracy > 99.9%

---

## 📞 NEXT STEPS

Would you like me to:

1. **Start implementation immediately** - Begin with Phase 1 (Critical types)
2. **Create detailed implementation guide** - Step-by-step for each type
3. **Generate sample JSON files** - Test data for all 23 question types
4. **Update backend first** - Start with API and grading logic
5. **Update frontend first** - Start with UI components

Please let me know which approach you prefer, and I'll begin the implementation!

---

*Gap Analysis Document v1.0*  
*Generated: 2025-01-XX*  
*IELTS Practice Test Platform - Full IELTS Compliance*
