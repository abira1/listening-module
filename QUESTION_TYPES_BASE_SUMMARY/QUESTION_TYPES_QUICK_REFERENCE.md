# 📇 QUESTION TYPES - QUICK REFERENCE

**Quick lookup for all 18 question types**

---

## 🎯 ALL TYPES AT A GLANCE

| # | Type Code | Name | Category | Format |
|---|-----------|------|----------|--------|
| 1 | `mcq_single` | Multiple Choice (Single) | Listening/Reading | Radio |
| 2 | `mcq_multiple` | Multiple Choice (Multiple) | Listening/Reading | Checkbox |
| 3 | `sentence_completion` | Sentence Completion | Listening/Reading | Text Input |
| 4 | `form_completion` | Form Completion | Listening | Text Input |
| 5 | `table_completion` | Table Completion | Listening/Reading | Text Input |
| 6 | `flowchart_completion` | Flowchart Completion | Listening/Reading | Text Input |
| 7 | `fill_gaps` | Fill in the Gaps | Listening | Text Input |
| 8 | `fill_gaps_short` | Fill in the Gaps (Short) | Listening | Text Input |
| 9 | `matching` | Matching | Listening | Dropdown |
| 10 | `map_labelling` | Map Labelling | Listening | Text Input |
| 11 | `true_false_ng` | True/False/Not Given | Reading | Radio |
| 12 | `matching_headings` | Matching Headings | Reading | Dropdown |
| 13 | `matching_features` | Matching Features | Reading | Dropdown |
| 14 | `matching_endings` | Matching Sentence Endings | Reading | Dropdown |
| 15 | `note_completion` | Note Completion | Reading | Text Input |
| 16 | `summary_completion` | Summary Completion | Reading | Text Input |
| 17 | `writing_task1` | Writing Task 1 | Writing | Text Area |
| 18 | `writing_task2` | Writing Task 2 | Writing | Text Area |

---

## 🎧 LISTENING (10 Types)

```
mcq_single              → Multiple Choice (Single)
mcq_multiple            → Multiple Choice (Multiple)
sentence_completion     → Sentence Completion
form_completion         → Form Completion
table_completion        → Table Completion
flowchart_completion    → Flowchart Completion
fill_gaps               → Fill in the Gaps
fill_gaps_short         → Fill in the Gaps (Short)
matching                → Matching
map_labelling           → Map Labelling
```

---

## 📖 READING (8 Types)

```
mcq_single              → Multiple Choice (Single)
mcq_multiple            → Multiple Choice (Multiple)
true_false_ng           → True/False/Not Given
matching_headings       → Matching Headings
matching_features       → Matching Features
matching_endings        → Matching Sentence Endings
note_completion         → Note Completion
summary_completion      → Summary Completion
```

---

## ✍️ WRITING (2 Types)

```
writing_task1           → Writing Task 1 (150+ words)
writing_task2           → Writing Task 2 (250+ words)
```

---

## 🔄 TYPE DETECTION

### From File Path
```javascript
'Fill in the gaps short'        → fill_gaps_short
'Fill in the gaps'              → fill_gaps
'Multiple Choice (one answer)'  → mcq_single
'Multiple Choice (more than one)' → mcq_multiple
'True/False/Not Given'          → true_false_ng
'Identifying Information'       → true_false_ng
'Matching'                      → matching
'Sentence Completion'           → sentence_completion
'Table Completion'              → table_completion
'Flow-chart Completion'         → flowchart_completion
'Form Completion'               → form_completion
'Note Completion'               → note_completion
'Summary Completion'            → summary_completion
'Matching Headings'             → matching_headings
'Matching Features'             → matching_features
'Matching Sentence Endings'     → matching_endings
'Labelling on a map'            → map_labelling
'writing-part-1'                → writing_task1
'writing-part-2'                → writing_task2
```

---

## 💻 COMPONENT MAPPING

```javascript
mcq_single              → MultipleChoiceSingle
mcq_multiple            → MultipleChoiceMultiple
sentence_completion     → SentenceCompletion
form_completion         → FormCompletion
table_completion        → TableCompletion
flowchart_completion    → FlowchartCompletion
fill_gaps               → FillInGaps
fill_gaps_short         → FillInGaps
matching                → Matching
map_labelling           → MapLabelling
true_false_ng           → TrueFalseNotGiven
matching_headings       → MatchingHeadings
matching_features       → MatchingFeatures
matching_endings        → MatchingFeatures
note_completion         → NoteCompletion
summary_completion      → SummaryCompletion
writing_task1           → WritingTask1
writing_task2           → WritingTask2
```

---

## 📊 STATISTICS

```
Total Types:            18
Listening Types:        10
Reading Types:          8
Writing Types:          2

Shared Types:           3 (mcq_single, mcq_multiple, sentence_completion)
Listening Only:         7
Reading Only:           5
Writing Only:           2
```

---

## 🎯 COMMON PATTERNS

### Input Types
```
Radio Button:           mcq_single, true_false_ng
Checkbox:               mcq_multiple
Text Input:             sentence_completion, form_completion, 
                        table_completion, flowchart_completion,
                        fill_gaps, fill_gaps_short, note_completion,
                        summary_completion, map_labelling
Dropdown:               matching, matching_headings, 
                        matching_features, matching_endings
Text Area:              writing_task1, writing_task2
```

### Scoring
```
Most Types:             1 point per question
Writing Tasks:          Band score (0-9)
```

---

## 🚀 QUICK USAGE

### Detect Type
```javascript
const type = detectQuestionType(path);
```

### Get Component
```javascript
const Component = QUESTION_COMPONENTS[type];
```

### Render Question
```javascript
<Component question={question} />
```

### Validate Answer
```javascript
const isCorrect = validateAnswer(question, userAnswer);
```

---

## 📝 QUESTION STRUCTURE

```javascript
{
  id: 'q_1',
  number: 1,
  type: 'mcq_single',           // Type code
  section: 'Listening',          // Section
  text: 'Question text',         // Question text
  options: [...],                // Options/choices
  correctAnswer: 'a',            // Correct answer
  points: 1,                     // Points
  userAnswer: null,              // User's answer
  isAnswered: false,             // Answered flag
  isReviewed: false              // Review flag
}
```

---

## ✅ IMPLEMENTATION STEPS

1. Import all components
2. Create component map
3. Implement type detection
4. Create dynamic renderer
5. Add validation logic
6. Integrate with exam interface
7. Test all types

---

## 📚 RELATED FILES

- **QUESTION_TYPES_BASE_SUMMARY.md** - Detailed descriptions
- **QUESTION_TYPES_IMPLEMENTATION_GUIDE.md** - Implementation examples
- **QUESTION_TYPES_QUICK_REFERENCE.md** - This file

---

**Version**: 1.0  
**Last Updated**: October 20, 2025

