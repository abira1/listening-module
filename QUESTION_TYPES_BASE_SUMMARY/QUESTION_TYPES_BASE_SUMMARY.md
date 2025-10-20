# 📋 IELTS QUESTION TYPES - BASE SUMMARY

**Date**: October 20, 2025  
**Total Question Types**: 18  
**Status**: ✅ COMPLETE & READY TO USE

---

## 🎯 QUICK REFERENCE

### All 18 Question Types

```javascript
const QUESTION_TYPES = {
  // Listening (8 types)
  'mcq_single': 'Multiple Choice (Single Answer)',
  'mcq_multiple': 'Multiple Choice (Multiple Answers)',
  'sentence_completion': 'Sentence Completion',
  'form_completion': 'Form Completion',
  'table_completion': 'Table Completion',
  'flowchart_completion': 'Flowchart Completion',
  'fill_gaps': 'Fill in the Gaps',
  'fill_gaps_short': 'Fill in the Gaps (Short)',
  'matching': 'Matching',
  'map_labelling': 'Map Labelling',
  
  // Reading (8 types)
  'true_false_ng': 'True/False/Not Given',
  'matching_headings': 'Matching Headings',
  'matching_features': 'Matching Features',
  'matching_endings': 'Matching Sentence Endings',
  'note_completion': 'Note Completion',
  'summary_completion': 'Summary Completion',
  
  // Writing (2 types)
  'writing_task1': 'Writing Task 1',
  'writing_task2': 'Writing Task 2'
};
```

---

## 📚 LISTENING QUESTION TYPES (10)

### 1. Multiple Choice (Single Answer)
- **Code**: `mcq_single`
- **Description**: Choose one correct answer from 3-4 options
- **Format**: Radio buttons
- **Scoring**: 1 point per question

### 2. Multiple Choice (Multiple Answers)
- **Code**: `mcq_multiple`
- **Description**: Choose 2+ correct answers from 5-7 options
- **Format**: Checkboxes
- **Scoring**: 1 point per question

### 3. Sentence Completion
- **Code**: `sentence_completion`
- **Description**: Complete sentences with words from a list
- **Format**: Text input with dropdown suggestions
- **Scoring**: 1 point per question

### 4. Form Completion
- **Code**: `form_completion`
- **Description**: Fill in form fields with information
- **Format**: Text input fields
- **Scoring**: 1 point per field

### 5. Table Completion
- **Code**: `table_completion`
- **Description**: Fill in table cells with information
- **Format**: Text input in table cells
- **Scoring**: 1 point per cell

### 6. Flowchart Completion
- **Code**: `flowchart_completion`
- **Description**: Complete flowchart boxes with information
- **Format**: Text input in flowchart boxes
- **Scoring**: 1 point per box

### 7. Fill in the Gaps
- **Code**: `fill_gaps`
- **Description**: Fill in blanks in text (longer answers)
- **Format**: Text input fields
- **Scoring**: 1 point per gap

### 8. Fill in the Gaps (Short)
- **Code**: `fill_gaps_short`
- **Description**: Fill in blanks with short answers
- **Format**: Text input fields (1-3 words)
- **Scoring**: 1 point per gap

### 9. Matching
- **Code**: `matching`
- **Description**: Match items from two lists
- **Format**: Drag-and-drop or dropdown
- **Scoring**: 1 point per match

### 10. Map Labelling
- **Code**: `map_labelling`
- **Description**: Label locations on a map
- **Format**: Text input with map image
- **Scoring**: 1 point per label

---

## 📖 READING QUESTION TYPES (8)

### 1. Multiple Choice (Single Answer)
- **Code**: `mcq_single`
- **Description**: Choose one correct answer from 3-4 options
- **Format**: Radio buttons
- **Scoring**: 1 point per question

### 2. Multiple Choice (Multiple Answers)
- **Code**: `mcq_multiple`
- **Description**: Choose 2+ correct answers from 5-7 options
- **Format**: Checkboxes
- **Scoring**: 1 point per question

### 3. True/False/Not Given
- **Code**: `true_false_ng`
- **Description**: Determine if statements are True, False, or Not Given
- **Format**: Radio buttons (3 options)
- **Scoring**: 1 point per question

### 4. Matching Headings
- **Code**: `matching_headings`
- **Description**: Match paragraph headings to paragraphs
- **Format**: Dropdown or drag-and-drop
- **Scoring**: 1 point per match

### 5. Matching Features
- **Code**: `matching_features`
- **Description**: Match features/characteristics to items
- **Format**: Dropdown or drag-and-drop
- **Scoring**: 1 point per match

### 6. Matching Sentence Endings
- **Code**: `matching_endings`
- **Description**: Match sentence beginnings to endings
- **Format**: Dropdown or drag-and-drop
- **Scoring**: 1 point per match

### 7. Note Completion
- **Code**: `note_completion`
- **Description**: Complete notes with information from text
- **Format**: Text input fields
- **Scoring**: 1 point per note

### 8. Summary Completion
- **Code**: `summary_completion`
- **Description**: Complete summary with words from text
- **Format**: Text input or dropdown
- **Scoring**: 1 point per item

---

## ✍️ WRITING QUESTION TYPES (2)

### 1. Writing Task 1
- **Code**: `writing_task1`
- **Description**: Descriptive writing (letter, report, etc.)
- **Format**: Text area (150+ words)
- **Scoring**: Band score (0-9)
- **Time**: 20 minutes

### 2. Writing Task 2
- **Code**: `writing_task2`
- **Description**: Essay writing
- **Format**: Text area (250+ words)
- **Scoring**: Band score (0-9)
- **Time**: 40 minutes

---

## 🔄 TYPE MAPPING

```javascript
// Path to Type Mapping
const pathToTypeMap = {
  'Fill in the gaps short': 'fill_gaps_short',
  'Fill in the gaps': 'fill_gaps',
  'Multiple Choice (one answer)': 'mcq_single',
  'Multiple Choice (more than one)': 'mcq_multiple',
  'True/False/Not Given': 'true_false_ng',
  'Identifying Information': 'true_false_ng',
  'Matching': 'matching',
  'Sentence Completion': 'sentence_completion',
  'Table Completion': 'table_completion',
  'Flow-chart Completion': 'flowchart_completion',
  'Form Completion': 'form_completion',
  'Note Completion': 'note_completion',
  'Summary Completion': 'summary_completion',
  'Matching Headings': 'matching_headings',
  'Matching Features': 'matching_features',
  'Matching Sentence Endings': 'matching_endings',
  'Labelling on a map': 'map_labelling',
  'writing-part-1': 'writing_task1',
  'writing-part-2': 'writing_task2'
};
```

---

## 📊 STATISTICS

| Category | Count |
|----------|-------|
| Listening Types | 10 |
| Reading Types | 8 |
| Writing Types | 2 |
| **Total** | **18** |

---

## 🎨 COMPONENT MAPPING

```javascript
const QUESTION_COMPONENTS = {
  'sentence_completion': SentenceCompletion,
  'mcq_single': MultipleChoiceSingle,
  'mcq_multiple': MultipleChoiceMultiple,
  'true_false_ng': TrueFalseNotGiven,
  'fill_gaps': FillInGaps,
  'fill_gaps_short': FillInGaps,
  'form_completion': FormCompletion,
  'table_completion': TableCompletion,
  'flowchart_completion': FlowchartCompletion,
  'map_labelling': MapLabelling,
  'matching': Matching,
  'matching_headings': MatchingHeadings,
  'matching_features': MatchingFeatures,
  'matching_endings': MatchingFeatures,
  'note_completion': NoteCompletion,
  'summary_completion': SummaryCompletion,
  'writing_task1': WritingTask1,
  'writing_task2': WritingTask2
};
```

---

## 🚀 USAGE

### Detect Question Type from Path
```javascript
function detectQuestionType(path) {
  for (const [key, value] of Object.entries(pathToTypeMap)) {
    if (path.includes(key)) {
      return value;
    }
  }
  return 'unknown';
}
```

### Get Component for Question Type
```javascript
function getComponent(questionType) {
  return QUESTION_COMPONENTS[questionType] || null;
}
```

### Validate Question Type
```javascript
function isValidType(type) {
  return Object.keys(QUESTION_COMPONENTS).includes(type);
}
```

---

## 📝 QUESTION STRUCTURE

```javascript
{
  id: 'q_1',
  number: 1,
  type: 'mcq_single',
  section: 'Listening',
  text: 'Question text here',
  options: [
    { id: 'a', text: 'Option A' },
    { id: 'b', text: 'Option B' },
    { id: 'c', text: 'Option C' }
  ],
  correctAnswer: 'a',
  points: 1,
  userAnswer: null,
  isAnswered: false,
  isReviewed: false
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

- [ ] Import all question type components
- [ ] Set up component mapping
- [ ] Implement type detection
- [ ] Create dynamic renderer
- [ ] Add validation
- [ ] Test all types
- [ ] Integrate with exam interface

---

## 📞 QUICK LINKS

- **Listening Types**: See section "LISTENING QUESTION TYPES"
- **Reading Types**: See section "READING QUESTION TYPES"
- **Writing Types**: See section "WRITING QUESTION TYPES"
- **Type Mapping**: See section "TYPE MAPPING"
- **Component Mapping**: See section "COMPONENT MAPPING"

---

**Version**: 1.0  
**Last Updated**: October 20, 2025  
**Status**: ✅ READY TO USE

