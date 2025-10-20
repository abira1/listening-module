# 🎨 COMPONENT SPECIFICATIONS - DETAILED REQUIREMENTS

**Date**: October 20, 2025  
**Status**: READY FOR DEVELOPMENT

---

## 📋 LISTENING COMPONENTS (5 Missing)

### 1. SentenceCompletion.jsx
**Purpose**: Complete sentences with words from a provided list

**Props**:
```javascript
{
  question: {
    id: string,
    type: 'sentence_completion',
    text: string,           // "The meeting will be held on _______"
    wordList: string[],     // ["Monday", "Tuesday", "Wednesday"]
    correctAnswer: string,  // "Monday"
    points: number
  },
  onAnswer: (answer) => void,
  onReview: () => void
}
```

**Features**:
- Display sentence with blank
- Dropdown or autocomplete input
- Word list suggestions
- Answer validation
- Review mode (show correct answer)

---

### 2. FormCompletion.jsx
**Purpose**: Fill in form fields with information

**Props**:
```javascript
{
  question: {
    id: string,
    type: 'form_completion',
    fields: [
      { id: string, label: string, answer: string, maxLength?: number },
      ...
    ],
    points: number
  },
  onAnswer: (answers) => void,
  onReview: () => void
}
```

**Features**:
- Multiple text input fields
- Field labels
- Optional max length
- Answer validation
- Review mode

---

### 3. TableCompletion.jsx
**Purpose**: Fill in table cells with information

**Props**:
```javascript
{
  question: {
    id: string,
    type: 'table_completion',
    table: {
      headers: string[],
      rows: [
        { cells: [string, string, ...] },
        ...
      ]
    },
    answers: { [cellId]: string },
    points: number
  },
  onAnswer: (answers) => void,
  onReview: () => void
}
```

**Features**:
- Table with headers and rows
- Fillable cells (marked with _____)
- Text input in cells
- Answer validation
- Review mode

---

### 4. FlowchartCompletion.jsx
**Purpose**: Complete flowchart boxes with information

**Props**:
```javascript
{
  question: {
    id: string,
    type: 'flowchart_completion',
    boxes: [
      { id: string, text: string, answer?: string },
      ...
    ],
    connections: [
      { from: string, to: string },
      ...
    ],
    points: number
  },
  onAnswer: (answers) => void,
  onReview: () => void
}
```

**Features**:
- Flowchart visualization
- Fillable boxes
- Text input in boxes
- Connection lines
- Answer validation
- Review mode

---

### 5. MapLabelling.jsx
**Purpose**: Label locations on a map image

**Props**:
```javascript
{
  question: {
    id: string,
    type: 'map_labelling',
    image: string,          // URL to map image
    labels: [
      { id: string, x: number, y: number, answer: string },
      ...
    ],
    points: number
  },
  onAnswer: (answers) => void,
  onReview: () => void
}
```

**Features**:
- Map image display
- Clickable label points
- Text input for labels
- Coordinate tracking
- Answer validation
- Review mode

---

## 📖 READING COMPONENTS (5 Missing)

### 1. MatchingHeadings.jsx
**Purpose**: Match paragraph headings to paragraphs

**Props**:
```javascript
{
  question: {
    id: string,
    type: 'matching_headings',
    headings: string[],
    paragraphs: [
      { id: string, text: string },
      ...
    ],
    matches: { [paragraphId]: string },
    points: number
  },
  onAnswer: (answers) => void,
  onReview: () => void
}
```

**Features**:
- List of headings
- List of paragraphs
- Dropdown or drag-drop matching
- Answer validation
- Review mode

---

### 2. MatchingFeatures.jsx
**Purpose**: Match features/characteristics to items

**Props**:
```javascript
{
  question: {
    id: string,
    type: 'matching_features',
    features: string[],
    items: string[],
    matches: { [item]: string },
    points: number
  },
  onAnswer: (answers) => void,
  onReview: () => void
}
```

**Features**:
- Feature list
- Item list
- Dropdown or drag-drop matching
- Answer validation
- Review mode

---

### 3. MatchingEndings.jsx
**Purpose**: Match sentence beginnings to endings

**Props**:
```javascript
{
  question: {
    id: string,
    type: 'matching_endings',
    beginnings: string[],
    endings: string[],
    matches: { [beginning]: string },
    points: number
  },
  onAnswer: (answers) => void,
  onReview: () => void
}
```

**Features**:
- Sentence beginnings
- Sentence endings
- Dropdown or drag-drop matching
- Answer validation
- Review mode

---

### 4. NoteCompletion.jsx
**Purpose**: Complete notes with information from text

**Props**:
```javascript
{
  question: {
    id: string,
    type: 'note_completion',
    notes: [
      { id: string, label: string, answer: string },
      ...
    ],
    points: number
  },
  onAnswer: (answers) => void,
  onReview: () => void
}
```

**Features**:
- Note labels
- Text input fields
- Answer validation
- Review mode

---

### 5. SummaryCompletion.jsx
**Purpose**: Complete summary with words from text

**Props**:
```javascript
{
  question: {
    id: string,
    type: 'summary_completion',
    summary: string,        // "The article discusses ______ and ______."
    wordList: string[],
    answers: string[],
    points: number
  },
  onAnswer: (answers) => void,
  onReview: () => void
}
```

**Features**:
- Summary text with blanks
- Word list dropdown
- Multiple blanks
- Answer validation
- Review mode

---

## ✍️ WRITING COMPONENTS (2)

### 1. WritingTask1.jsx
**Purpose**: Descriptive writing (letter, report, etc.)

**Props**:
```javascript
{
  question: {
    id: string,
    type: 'writing_task1',
    prompt: string,
    minWords: 150,
    timeLimit: 20,          // minutes
    userAnswer: string
  },
  onAnswer: (answer) => void,
  onReview: () => void
}
```

**Features**:
- Large text area
- Word count display
- Timer display
- Auto-save
- Character limit warning

---

### 2. WritingTask2.jsx
**Purpose**: Essay writing

**Props**:
```javascript
{
  question: {
    id: string,
    type: 'writing_task2',
    prompt: string,
    minWords: 250,
    timeLimit: 40,          // minutes
    userAnswer: string
  },
  onAnswer: (answer) => void,
  onReview: () => void
}
```

**Features**:
- Large text area
- Word count display
- Timer display
- Auto-save
- Character limit warning

---

## 🎯 COMMON COMPONENT FEATURES

All components should include:
- ✅ Proper error handling
- ✅ Loading states
- ✅ Accessibility (WCAG 2.1)
- ✅ Responsive design
- ✅ Consistent styling (Tailwind)
- ✅ Answer validation
- ✅ Review mode
- ✅ Event callbacks (onAnswer, onReview)

---

**Version**: 1.0  
**Last Updated**: October 20, 2025

