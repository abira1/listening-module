# 🛠️ QUESTION TYPES - IMPLEMENTATION GUIDE

**Date**: October 20, 2025  
**Status**: ✅ READY TO IMPLEMENT

---

## 📋 TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [Listening Types](#listening-types)
3. [Reading Types](#reading-types)
4. [Writing Types](#writing-types)
5. [Integration](#integration)

---

## 🚀 QUICK START

### Step 1: Import All Components
```javascript
import SentenceCompletion from './SentenceCompletion';
import MultipleChoiceSingle from './MultipleChoiceSingle';
import MultipleChoiceMultiple from './MultipleChoiceMultiple';
import TrueFalseNotGiven from './TrueFalseNotGiven';
import FillInGaps from './FillInGaps';
import FormCompletion from './FormCompletion';
import TableCompletion from './TableCompletion';
import FlowchartCompletion from './FlowchartCompletion';
import MapLabelling from './MapLabelling';
import Matching from './Matching';
import MatchingHeadings from './MatchingHeadings';
import MatchingFeatures from './MatchingFeatures';
import NoteCompletion from './NoteCompletion';
import SummaryCompletion from './SummaryCompletion';
import WritingTask1 from './WritingTask1';
import WritingTask2 from './WritingTask2';
```

### Step 2: Create Component Map
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

### Step 3: Create Dynamic Renderer
```javascript
function renderQuestion(question) {
  const Component = QUESTION_COMPONENTS[question.type];
  if (!Component) {
    return <div>Unknown question type: {question.type}</div>;
  }
  return <Component question={question} />;
}
```

---

## 🎧 LISTENING TYPES

### 1. Multiple Choice (Single)
```javascript
{
  type: 'mcq_single',
  text: 'What is the main topic?',
  options: [
    { id: 'a', text: 'Option A' },
    { id: 'b', text: 'Option B' },
    { id: 'c', text: 'Option C' }
  ],
  correctAnswer: 'a'
}
```

### 2. Multiple Choice (Multiple)
```javascript
{
  type: 'mcq_multiple',
  text: 'Which statements are correct?',
  options: [
    { id: 'a', text: 'Option A' },
    { id: 'b', text: 'Option B' },
    { id: 'c', text: 'Option C' },
    { id: 'd', text: 'Option D' }
  ],
  correctAnswers: ['a', 'c']
}
```

### 3. Sentence Completion
```javascript
{
  type: 'sentence_completion',
  text: 'The meeting will be held on _______',
  wordList: ['Monday', 'Tuesday', 'Wednesday'],
  correctAnswer: 'Monday'
}
```

### 4. Form Completion
```javascript
{
  type: 'form_completion',
  fields: [
    { label: 'Name', answer: 'John Smith' },
    { label: 'Email', answer: 'john@example.com' },
    { label: 'Phone', answer: '123-456-7890' }
  ]
}
```

### 5. Table Completion
```javascript
{
  type: 'table_completion',
  table: {
    headers: ['Date', 'Event', 'Location'],
    rows: [
      { cells: ['2024-01-15', '______', 'Room A'] },
      { cells: ['2024-01-20', 'Meeting', '______'] }
    ]
  }
}
```

### 6. Flowchart Completion
```javascript
{
  type: 'flowchart_completion',
  boxes: [
    { id: 'box1', text: 'Start', answer: null },
    { id: 'box2', text: '______', answer: 'Process' },
    { id: 'box3', text: 'End', answer: null }
  ]
}
```

### 7. Fill in the Gaps
```javascript
{
  type: 'fill_gaps',
  text: 'The ______ is very important for ______.',
  gaps: [
    { id: 'gap1', answer: 'education' },
    { id: 'gap2', answer: 'success' }
  ]
}
```

### 8. Fill in the Gaps (Short)
```javascript
{
  type: 'fill_gaps_short',
  text: 'The capital of France is ______.',
  answer: 'Paris'
}
```

### 9. Matching
```javascript
{
  type: 'matching',
  leftItems: ['A', 'B', 'C'],
  rightItems: ['1', '2', '3'],
  matches: { 'A': '1', 'B': '2', 'C': '3' }
}
```

### 10. Map Labelling
```javascript
{
  type: 'map_labelling',
  image: 'map.jpg',
  labels: [
    { id: 'label1', x: 100, y: 150, answer: 'Park' },
    { id: 'label2', x: 200, y: 250, answer: 'School' }
  ]
}
```

---

## 📖 READING TYPES

### 1. True/False/Not Given
```javascript
{
  type: 'true_false_ng',
  text: 'The author agrees with this statement.',
  options: ['True', 'False', 'Not Given'],
  correctAnswer: 'True'
}
```

### 2. Matching Headings
```javascript
{
  type: 'matching_headings',
  headings: ['Heading A', 'Heading B', 'Heading C'],
  paragraphs: [
    { id: 'p1', text: 'Paragraph 1...' },
    { id: 'p2', text: 'Paragraph 2...' }
  ],
  matches: { 'p1': 'Heading A', 'p2': 'Heading B' }
}
```

### 3. Matching Features
```javascript
{
  type: 'matching_features',
  features: ['Feature A', 'Feature B', 'Feature C'],
  items: ['Item 1', 'Item 2', 'Item 3'],
  matches: { 'Item 1': 'Feature A', 'Item 2': 'Feature B' }
}
```

### 4. Matching Sentence Endings
```javascript
{
  type: 'matching_endings',
  beginnings: ['The author...', 'The study...'],
  endings: ['...shows positive results', '...disagrees with this'],
  matches: { 'The author...': '...disagrees with this' }
}
```

### 5. Note Completion
```javascript
{
  type: 'note_completion',
  notes: [
    { label: 'Main idea', answer: 'Education is important' },
    { label: 'Supporting point', answer: 'Improves career prospects' }
  ]
}
```

### 6. Summary Completion
```javascript
{
  type: 'summary_completion',
  summary: 'The article discusses ______ and ______.',
  wordList: ['education', 'technology', 'health'],
  answers: ['education', 'technology']
}
```

---

## ✍️ WRITING TYPES

### 1. Writing Task 1
```javascript
{
  type: 'writing_task1',
  prompt: 'Write a letter describing...',
  minWords: 150,
  timeLimit: 20,
  userAnswer: 'Dear Sir/Madam...'
}
```

### 2. Writing Task 2
```javascript
{
  type: 'writing_task2',
  prompt: 'Write an essay about...',
  minWords: 250,
  timeLimit: 40,
  userAnswer: 'In today\'s world...'
}
```

---

## 🔗 INTEGRATION

### Connect to Exam Interface
```javascript
function loadQuestion(questionData) {
  const component = renderQuestion(questionData);
  document.getElementById('question-container').innerHTML = component;
}

function saveAnswer(questionId, answer) {
  const question = questions.find(q => q.id === questionId);
  question.userAnswer = answer;
  question.isAnswered = true;
}

function markForReview(questionId) {
  const question = questions.find(q => q.id === questionId);
  question.isReviewed = true;
}
```

### Validate Answers
```javascript
function validateAnswer(question, userAnswer) {
  if (question.type === 'mcq_single') {
    return userAnswer === question.correctAnswer;
  } else if (question.type === 'mcq_multiple') {
    return JSON.stringify(userAnswer.sort()) === 
           JSON.stringify(question.correctAnswers.sort());
  }
  // Add validation for other types
  return false;
}
```

---

## 📊 SCORING

```javascript
function calculateScore(questions) {
  let score = 0;
  questions.forEach(q => {
    if (validateAnswer(q, q.userAnswer)) {
      score += q.points;
    }
  });
  return score;
}
```

---

**Version**: 1.0  
**Last Updated**: October 20, 2025

