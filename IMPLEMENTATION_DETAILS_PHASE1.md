# 🛠️ PHASE 1: FOUNDATION SETUP - DETAILED IMPLEMENTATION

**Objective**: Create the type system infrastructure and universal renderer  
**Duration**: 2 days  
**Status**: READY TO START

---

## 📋 TASK BREAKDOWN

### Task 1.1: Create Question Types Constants
**File**: `frontend/src/constants/questionTypes.js`

```javascript
// All 18 question types with metadata
export const QUESTION_TYPES = {
  // Listening (10)
  'mcq_single': { name: 'Multiple Choice (Single)', section: 'Listening' },
  'mcq_multiple': { name: 'Multiple Choice (Multiple)', section: 'Listening' },
  'sentence_completion': { name: 'Sentence Completion', section: 'Listening' },
  'form_completion': { name: 'Form Completion', section: 'Listening' },
  'table_completion': { name: 'Table Completion', section: 'Listening' },
  'flowchart_completion': { name: 'Flowchart Completion', section: 'Listening' },
  'fill_gaps': { name: 'Fill in the Gaps', section: 'Listening' },
  'fill_gaps_short': { name: 'Fill in the Gaps (Short)', section: 'Listening' },
  'matching': { name: 'Matching', section: 'Listening' },
  'map_labelling': { name: 'Map Labelling', section: 'Listening' },
  
  // Reading (6)
  'true_false_ng': { name: 'True/False/Not Given', section: 'Reading' },
  'matching_headings': { name: 'Matching Headings', section: 'Reading' },
  'matching_features': { name: 'Matching Features', section: 'Reading' },
  'matching_endings': { name: 'Matching Sentence Endings', section: 'Reading' },
  'note_completion': { name: 'Note Completion', section: 'Reading' },
  'summary_completion': { name: 'Summary Completion', section: 'Reading' },
  
  // Writing (2)
  'writing_task1': { name: 'Writing Task 1', section: 'Writing' },
  'writing_task2': { name: 'Writing Task 2', section: 'Writing' }
};

// Path to type mapping (for AI-generated questions)
export const PATH_TO_TYPE_MAP = {
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

// Component imports (lazy loaded)
export const QUESTION_COMPONENTS = {
  // Listening
  'mcq_single': () => import('@/components/track-questions/listening/MultipleChoiceSingle'),
  'mcq_multiple': () => import('@/components/track-questions/listening/MultipleChoiceMultiple'),
  'sentence_completion': () => import('@/components/track-questions/listening/SentenceCompletion'),
  'form_completion': () => import('@/components/track-questions/listening/FormCompletion'),
  'table_completion': () => import('@/components/track-questions/listening/TableCompletion'),
  'flowchart_completion': () => import('@/components/track-questions/listening/FlowchartCompletion'),
  'fill_gaps': () => import('@/components/track-questions/listening/ShortAnswerListening'),
  'fill_gaps_short': () => import('@/components/track-questions/listening/ShortAnswerListening'),
  'matching': () => import('@/components/track-questions/listening/MatchingDraggable'),
  'map_labelling': () => import('@/components/track-questions/listening/DiagramLabeling'),
  
  // Reading
  'true_false_ng': () => import('@/components/track-questions/reading/TrueFalseNotGiven'),
  'matching_headings': () => import('@/components/track-questions/reading/MatchingHeadings'),
  'matching_features': () => import('@/components/track-questions/reading/MatchingFeatures'),
  'matching_endings': () => import('@/components/track-questions/reading/MatchingEndings'),
  'note_completion': () => import('@/components/track-questions/reading/NoteCompletion'),
  'summary_completion': () => import('@/components/track-questions/reading/SummaryCompletion'),
  
  // Writing
  'writing_task1': () => import('@/components/track-questions/writing/WritingTask1'),
  'writing_task2': () => import('@/components/track-questions/writing/WritingTask2')
};
```

---

### Task 1.2: Create Type Detection Utility
**File**: `frontend/src/utils/typeDetection.js`

```javascript
import { QUESTION_TYPES, PATH_TO_TYPE_MAP, QUESTION_COMPONENTS } from '@/constants/questionTypes';

export function detectQuestionType(path) {
  for (const [key, value] of Object.entries(PATH_TO_TYPE_MAP)) {
    if (path && path.includes(key)) {
      return value;
    }
  }
  return null;
}

export function isValidType(type) {
  return Object.keys(QUESTION_TYPES).includes(type);
}

export async function getComponentForType(type) {
  if (!isValidType(type)) {
    throw new Error(`Unknown question type: ${type}`);
  }
  const componentLoader = QUESTION_COMPONENTS[type];
  const module = await componentLoader();
  return module.default;
}

export function getTypeMetadata(type) {
  return QUESTION_TYPES[type] || null;
}

export function getTypesBySection(section) {
  return Object.entries(QUESTION_TYPES)
    .filter(([_, meta]) => meta.section === section)
    .map(([type, _]) => type);
}
```

---

### Task 1.3: Create Validation Framework
**File**: `frontend/src/utils/questionValidation.js`

```javascript
import { isValidType } from './typeDetection';

export function validateQuestion(question) {
  const errors = [];
  
  // Required fields
  if (!question.id) errors.push('Missing question id');
  if (!question.type) errors.push('Missing question type');
  if (!isValidType(question.type)) errors.push(`Invalid type: ${question.type}`);
  if (!question.text && !question.prompt) errors.push('Missing question text/prompt');
  
  // Type-specific validation
  switch (question.type) {
    case 'mcq_single':
    case 'mcq_multiple':
      if (!question.options || question.options.length < 2) {
        errors.push('MCQ requires at least 2 options');
      }
      break;
    case 'writing_task1':
    case 'writing_task2':
      if (!question.minWords) errors.push('Writing task requires minWords');
      break;
  }
  
  return { valid: errors.length === 0, errors };
}

export function validateAnswer(question, answer) {
  if (!answer) return false;
  
  switch (question.type) {
    case 'mcq_single':
      return answer === question.correctAnswer;
    case 'mcq_multiple':
      return JSON.stringify(answer.sort()) === 
             JSON.stringify(question.correctAnswers.sort());
    case 'true_false_ng':
      return answer === question.correctAnswer;
    default:
      return true; // Manual grading for other types
  }
}

export function calculateScore(question, answer) {
  if (validateAnswer(question, answer)) {
    return question.points || 1;
  }
  return 0;
}
```

---

### Task 1.4: Create Universal Question Renderer
**File**: `frontend/src/components/QuestionRenderer.jsx`

```javascript
import React, { Suspense, lazy } from 'react';
import { getComponentForType } from '@/utils/typeDetection';

export function QuestionRenderer({ question, onAnswer, onReview }) {
  const [Component, setComponent] = React.useState(null);
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    getComponentForType(question.type)
      .then(setComponent)
      .catch(err => setError(err.message));
  }, [question.type]);
  
  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }
  
  if (!Component) {
    return <div className="text-gray-500">Loading...</div>;
  }
  
  return (
    <Suspense fallback={<div>Loading question...</div>}>
      <Component 
        question={question}
        onAnswer={onAnswer}
        onReview={onReview}
      />
    </Suspense>
  );
}
```

---

## ✅ DELIVERABLES

- [x] Question types constants file
- [x] Type detection utility
- [x] Validation framework
- [x] Universal renderer component
- [ ] Unit tests for all utilities
- [ ] Integration tests

---

**Next**: PHASE 2 - Listening Components

