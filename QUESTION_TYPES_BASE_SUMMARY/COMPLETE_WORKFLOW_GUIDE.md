# 🚀 COMPLETE WORKFLOW GUIDE

**Purpose**: End-to-end guide from AI prompt to working exam  
**Status**: ✅ COMPLETE  
**Version**: 1.0

---

## 📊 COMPLETE WORKFLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLETE WORKFLOW                             │
└─────────────────────────────────────────────────────────────────┘

STEP 1: PREPARE
├─ Define exam section (Listening/Reading/Writing)
├─ Define parts (1-4)
├─ Define question types (18 available)
└─ Define total questions

STEP 2: CREATE PROMPT
├─ Use AI_PROMPT_TEMPLATE_FOR_QUESTIONS.md
├─ Customize for your needs
├─ Specify JSON format required
└─ Request valid JSON only

STEP 3: GENERATE WITH AI
├─ Send prompt to AI (ChatGPT, Claude, etc.)
├─ Receive JSON response
├─ Copy JSON to file
└─ Save as questions.json

STEP 4: VALIDATE JSON
├─ Check syntax (valid JSON)
├─ Verify all required fields
├─ Check type codes (18 types)
├─ Verify answer format
└─ Check ID uniqueness

STEP 5: PARSE & STRUCTURE
├─ Extract exam metadata
├─ Extract parts
├─ Extract questions
├─ Map types to components
└─ Prepare for Firebase

STEP 6: UPLOAD TO FIREBASE
├─ Create exam record
├─ Add all questions
├─ Set permissions
├─ Verify upload
└─ Test retrieval

STEP 7: INITIALIZE TRACK MANAGER
├─ Load all questions
├─ Create TrackManager instance
├─ Initialize progress tracking
├─ Set up event listeners
└─ Ready for student

STEP 8: DETECT QUESTION TYPES
├─ Read question.type field
├─ Validate against 18 types
├─ Map to component
├─ Prepare renderer
└─ Ready to display

STEP 9: RENDER QUESTIONS
├─ Get current question
├─ Get component for type
├─ Render in container
├─ Attach event listeners
└─ Display to student

STEP 10: TRACK PROGRESS
├─ Student answers question
├─ Save answer to Firebase
├─ Update TrackManager
├─ Update UI (question status)
├─ Update progress bar
└─ Ready for next question

STEP 11: NAVIGATE
├─ Student clicks question number
├─ TrackManager navigates
├─ Render new question
├─ Update current indicator
└─ Continue exam

STEP 12: SUBMIT EXAM
├─ Calculate score
├─ Save results to Firebase
├─ Generate report
├─ Display to student
└─ Complete
```

---

## 📋 STEP-BY-STEP IMPLEMENTATION

### STEP 1: Prepare Your Exam

```javascript
const examConfig = {
  section: 'Listening',        // Listening/Reading/Writing
  parts: 4,                    // 1-4
  questionsPerPart: 10,        // Total questions
  duration: 2700,              // Seconds
  types: [
    'mcq_single',
    'mcq_multiple',
    'sentence_completion',
    'fill_gaps'
  ]
};
```

### STEP 2: Create AI Prompt

Use template from `AI_PROMPT_TEMPLATE_FOR_QUESTIONS.md`:
- Copy master template
- Customize section/part/type
- Specify JSON format
- Send to AI

### STEP 3: Receive & Save JSON

```javascript
// Save response as questions.json
const questionsJSON = {
  exam: { /* metadata */ },
  parts: [ /* all parts */ ]
};

// Save to file
fs.writeFileSync('questions.json', JSON.stringify(questionsJSON, null, 2));
```

### STEP 4: Validate JSON

```javascript
function validateQuestionsJSON(json) {
  const errors = [];
  
  // Check exam metadata
  if (!json.exam || !json.exam.id) errors.push('Missing exam.id');
  if (!json.exam.section) errors.push('Missing exam.section');
  
  // Check parts
  if (!json.parts || json.parts.length === 0) {
    errors.push('No parts found');
    return errors;
  }
  
  // Check each question
  json.parts.forEach((part, partIdx) => {
    part.questions.forEach((q, qIdx) => {
      // Required fields
      if (!q.id) errors.push(`Part ${partIdx}, Q ${qIdx}: Missing id`);
      if (!q.type) errors.push(`Part ${partIdx}, Q ${qIdx}: Missing type`);
      if (!q.text) errors.push(`Part ${partIdx}, Q ${qIdx}: Missing text`);
      
      // Validate type
      const validTypes = [
        'mcq_single', 'mcq_multiple', 'sentence_completion',
        'fill_gaps', 'fill_gaps_short', 'form_completion',
        'table_completion', 'flowchart_completion', 'matching',
        'map_labelling', 'true_false_ng', 'matching_headings',
        'matching_features', 'matching_endings', 'note_completion',
        'summary_completion', 'writing_task1', 'writing_task2'
      ];
      
      if (!validTypes.includes(q.type)) {
        errors.push(`Part ${partIdx}, Q ${qIdx}: Invalid type "${q.type}"`);
      }
      
      // Type-specific validation
      if (q.type === 'mcq_single' && !q.correctAnswer) {
        errors.push(`Part ${partIdx}, Q ${qIdx}: Missing correctAnswer`);
      }
    });
  });
  
  return errors;
}

// Usage
const errors = validateQuestionsJSON(questionsJSON);
if (errors.length > 0) {
  console.error('Validation errors:', errors);
} else {
  console.log('✅ JSON is valid!');
}
```

### STEP 5: Parse & Structure

```javascript
function parseQuestionsJSON(json) {
  const exam = {
    id: json.exam.id,
    title: json.exam.title,
    section: json.exam.section,
    totalQuestions: json.exam.totalQuestions,
    duration: json.exam.duration,
    parts: []
  };
  
  json.parts.forEach(part => {
    const parsedPart = {
      partNumber: part.partNumber,
      partTitle: part.partTitle,
      questions: part.questions.map(q => ({
        ...q,
        section: exam.section,
        part: part.partNumber
      }))
    };
    exam.parts.push(parsedPart);
  });
  
  return exam;
}
```

### STEP 6: Upload to Firebase

```javascript
async function uploadExamToFirebase(exam) {
  const db = firebase.database();
  
  try {
    // Create exam record
    await db.ref(`exams/${exam.id}`).set({
      title: exam.title,
      section: exam.section,
      totalQuestions: exam.totalQuestions,
      duration: exam.duration,
      createdAt: Date.now()
    });
    
    // Add all questions
    exam.parts.forEach(part => {
      part.questions.forEach(question => {
        db.ref(`exams/${exam.id}/questions/${question.id}`).set(question);
      });
    });
    
    console.log('✅ Exam uploaded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Upload failed:', error);
    return false;
  }
}
```

### STEP 7: Initialize Track Manager

```javascript
class TrackManager {
  constructor(examId, studentId) {
    this.examId = examId;
    this.studentId = studentId;
    this.questions = [];
    this.currentIndex = 0;
    this.answered = new Set();
    this.reviewed = new Set();
  }

  async init() {
    // Load questions from Firebase
    const snapshot = await firebase.database()
      .ref(`exams/${this.examId}/questions`)
      .once('value');
    
    this.questions = Object.values(snapshot.val() || {});
    this.totalQuestions = this.questions.length;
    
    // Load existing progress
    const progressSnapshot = await firebase.database()
      .ref(`progress/${this.examId}/${this.studentId}`)
      .once('value');
    
    const progress = progressSnapshot.val() || {};
    this.answered = new Set(progress.answered || []);
    this.reviewed = new Set(progress.reviewed || []);
    
    return this;
  }

  getCurrentQuestion() {
    return this.questions[this.currentIndex];
  }

  navigateToQuestion(index) {
    if (index >= 0 && index < this.questions.length) {
      this.currentIndex = index;
      return this.getCurrentQuestion();
    }
    return null;
  }

  markAnswered(questionId) {
    this.answered.add(questionId);
    this.saveProgress();
  }

  getProgress() {
    return {
      total: this.totalQuestions,
      answered: this.answered.size,
      reviewed: this.reviewed.size,
      percentage: (this.answered.size / this.totalQuestions) * 100
    };
  }

  async saveProgress() {
    await firebase.database()
      .ref(`progress/${this.examId}/${this.studentId}`)
      .set({
        answered: Array.from(this.answered),
        reviewed: Array.from(this.reviewed),
        lastUpdated: Date.now()
      });
  }
}
```

### STEP 8: Detect Question Types

```javascript
const TYPE_TO_COMPONENT = {
  'mcq_single': MultipleChoiceSingle,
  'mcq_multiple': MultipleChoiceMultiple,
  'sentence_completion': SentenceCompletion,
  'fill_gaps': FillInGaps,
  'fill_gaps_short': FillInGaps,
  'form_completion': FormCompletion,
  'table_completion': TableCompletion,
  'flowchart_completion': FlowchartCompletion,
  'matching': Matching,
  'map_labelling': MapLabelling,
  'true_false_ng': TrueFalseNotGiven,
  'matching_headings': MatchingHeadings,
  'matching_features': MatchingFeatures,
  'matching_endings': MatchingFeatures,
  'note_completion': NoteCompletion,
  'summary_completion': SummaryCompletion,
  'writing_task1': WritingTask1,
  'writing_task2': WritingTask2
};

function getComponentForQuestion(question) {
  const Component = TYPE_TO_COMPONENT[question.type];
  if (!Component) {
    throw new Error(`Unknown question type: ${question.type}`);
  }
  return Component;
}
```

### STEP 9: Render Questions

```javascript
function renderQuestion(question, container) {
  const Component = getComponentForQuestion(question);
  const instance = new Component(question);
  
  container.innerHTML = '';
  instance.render(container);
  
  // Attach event listeners
  instance.on('answer', (answer) => {
    handleAnswer(question.id, answer);
  });
  
  instance.on('review', () => {
    handleReview(question.id);
  });
}
```

### STEP 10: Track Progress

```javascript
async function handleAnswer(questionId, answer) {
  // Save answer
  await firebase.database()
    .ref(`responses/${examId}/${studentId}/${questionId}`)
    .set({
      answer: answer,
      timestamp: Date.now()
    });
  
  // Update track manager
  trackManager.markAnswered(questionId);
  
  // Update UI
  updateQuestionStatus(questionId, 'answered');
  updateProgressBar();
}
```

### STEP 11: Navigate

```javascript
function navigateToQuestion(index) {
  const question = trackManager.navigateToQuestion(index);
  if (question) {
    renderQuestion(question, container);
    updateCurrentIndicator(index);
  }
}
```

### STEP 12: Submit Exam

```javascript
async function submitExam() {
  // Calculate score
  const score = calculateScore();
  
  // Save results
  await firebase.database()
    .ref(`results/${examId}/${studentId}`)
    .set({
      score: score,
      totalQuestions: trackManager.totalQuestions,
      answeredQuestions: trackManager.answered.size,
      submittedAt: Date.now()
    });
  
  // Display results
  displayResults(score);
}
```

---

## 📁 FILES YOU NEED

1. **QUESTION_JSON_FORMAT_SPECIFICATION.md** - JSON structure
2. **AI_PROMPT_TEMPLATE_FOR_QUESTIONS.md** - How to create prompts
3. **COMPREHENSIVE_IMPLEMENTATION_PLAN.md** - Implementation details
4. **COMPLETE_WORKFLOW_GUIDE.md** - This file

---

## ✅ CHECKLIST

- [ ] Prepare exam configuration
- [ ] Create AI prompt
- [ ] Generate questions JSON
- [ ] Validate JSON
- [ ] Parse and structure
- [ ] Upload to Firebase
- [ ] Initialize TrackManager
- [ ] Detect question types
- [ ] Render questions
- [ ] Track progress
- [ ] Test navigation
- [ ] Test submission

---

**Version**: 1.0  
**Last Updated**: October 20, 2025  
**Status**: ✅ COMPLETE & READY

