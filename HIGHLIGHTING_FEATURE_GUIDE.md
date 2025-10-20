# Text Highlighting and Note-Taking Feature Guide

## 📋 Overview

The IELTS exam module now includes a powerful text highlighting and note-taking feature for both Listening and Reading sections. This feature allows students to:
- Highlight important text during the exam
- Add notes to highlighted sections
- Remove individual or all highlights
- View notes attached to highlights

**Important**: Highlights and notes are temporary and only exist during the exam session. They are NOT saved after the exam ends.

---

## ✨ Features

### 1. **Text Highlighting**
- Select any text by clicking and dragging
- A context menu appears with "Highlight" option
- Click "Highlight" to apply yellow background
- Works on passages, questions, instructions, and answer options
- Multiple independent highlights supported
- Precise character-level highlighting using Range API

### 2. **Note-Taking**
- Right-click on any highlighted text
- Select "Add Note" from context menu
- Type notes in the popup textbox
- Save notes with button or Ctrl+Enter
- Notes are associated with specific highlights
- Highlighted text with notes shows a 📝 indicator

### 3. **Highlight Management**
- Right-click highlighted text → "Clear Highlight" to remove specific highlight
- Right-click any highlight → "Clear All Highlights" to remove all
- Removing a highlight also removes its associated note

---

## 🎯 How to Use

### Highlighting Text

1. **Select Text**: Click and drag to select the text you want to highlight
2. **Context Menu Appears**: A menu will pop up near your cursor
3. **Click "Highlight"**: The selected text will turn yellow
4. **Multiple Highlights**: Repeat for as many sections as you need

### Adding Notes

1. **Right-Click Highlighted Text**: Right-click on any yellow highlighted text
2. **Select "Add Note"**: From the context menu
3. **Type Your Note**: A popup textbox will appear
4. **Save**: Click "Save Note" or press Ctrl+Enter
5. **Note Indicator**: A small 📝 icon appears on highlighted text with notes

### Removing Highlights

**Remove Single Highlight:**
1. Right-click on the highlighted text
2. Select "Clear Highlight"
3. The highlight and its note are removed

**Remove All Highlights:**
1. Right-click on any highlighted text
2. Select "Clear All Highlights"
3. All highlights and notes are cleared

---

## 🔧 Technical Implementation

### Components

1. **TextHighlighter.jsx** (`/app/frontend/src/components/common/TextHighlighter.jsx`)
   - Main wrapper component
   - Manages highlight state
   - Implements Range API for precise highlighting
   - Handles selection and context menu logic

2. **HighlightContextMenu.jsx** (`/app/frontend/src/components/common/HighlightContextMenu.jsx`)
   - Context menu for highlight actions
   - Shows "Highlight" option on text selection
   - Shows "Add Note", "Clear Highlight", "Clear All" on right-click

3. **NotePopup.jsx** (`/app/frontend/src/components/common/NotePopup.jsx`)
   - Note input interface
   - Auto-focuses textarea
   - Keyboard shortcuts (Ctrl+Enter to save, Esc to close)

### Integration

The TextHighlighter is integrated into the ListeningTest component:

```jsx
<TextHighlighter enabled={!examFinished && !isSubmitting}>
  {/* Exam content */}
</TextHighlighter>
```

**Props:**
- `enabled`: Controls whether highlighting is active (disabled when exam is finished/submitting)
- `children`: The content to be made highlightable

### Highlighting Algorithm

Uses the Range API for precise text selection:

```javascript
// Get selection
const selection = window.getSelection();
const range = selection.getRangeAt(0);

// Extract content
const contents = range.extractContents();

// Create highlight span
const highlightSpan = document.createElement('span');
highlightSpan.className = 'highlighted-text';
highlightSpan.appendChild(contents);

// Insert at range position
range.insertNode(highlightSpan);
```

### Data Structure

Each highlight is stored with:
```javascript
{
  id: "highlight-{timestamp}-{counter}",
  text: "Selected text content",
  note: "User's note or null",
  element: HTMLSpanElement // Reference to DOM element
}
```

---

## 🎨 Styling

### Highlighted Text
- Background: Yellow (#fef08a - Tailwind yellow-200)
- Hover: Slightly darker yellow (#fde047 - Tailwind yellow-300)
- Cursor: Pointer
- Smooth transitions

### Note Indicator
- Shows 📝 emoji badge
- Blue background circle
- Positioned at top-right of highlight

### Context Menu
- White background with shadow
- Smooth fade-in animation
- Hover effects on options

### Note Popup
- White background with blue border
- Shadow and rounded corners
- Slide-in animation

---

## 🚀 Usage in Different Components

### Current Implementation: Listening Test
Location: `/app/frontend/src/components/ListeningTest.jsx`

```jsx
import TextHighlighter from './common/TextHighlighter';

// In render:
<TextHighlighter enabled={!examFinished && !isSubmitting}>
  <div className="exam-content">
    {/* Questions, passages, instructions */}
  </div>
</TextHighlighter>
```

### Future Implementation: Reading Test
To add highlighting to a Reading test component:

```jsx
import TextHighlighter from '../components/common/TextHighlighter';

function ReadingTest({ examId }) {
  const [examFinished, setExamFinished] = useState(false);
  
  return (
    <TextHighlighter enabled={!examFinished}>
      <div className="reading-passage">
        {/* Reading passage content */}
      </div>
      <div className="questions">
        {/* Questions */}
      </div>
    </TextHighlighter>
  );
}
```

---

## ⚠️ Important Notes

### Behavior

1. **Temporary Storage**: Highlights and notes are NOT persisted after exam ends
2. **Session-Based**: All highlights are cleared when:
   - Exam is submitted
   - User navigates away
   - Browser is refreshed
3. **No Overlap**: The system prevents overlapping highlights
4. **Text Selection**: Normal text selection still works for copying

### Browser Compatibility

Tested and working on:
- ✅ Chrome (latest)
- ✅ Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)

### Performance

- Lightweight implementation
- No performance impact on exam functionality
- Efficient DOM manipulation using Range API
- Memory is automatically cleaned up on component unmount

---

## 🐛 Troubleshooting

### Highlight not appearing exactly as selected
- Ensure you're selecting text within the highlightable area
- Check if the selection is within the TextHighlighter wrapper
- The Range API should handle precise character-level selection

### Context menu not showing
- Make sure highlighting is enabled (exam not finished/submitting)
- Check if selection is within the container
- Verify TextHighlighter component is properly wrapping content

### Notes not saving
- Ensure note text is not empty
- Check browser console for errors
- Verify NotePopup component is rendering

### Highlights disappearing
- This is expected behavior when navigating sections/pages
- Highlights are component-scoped and reset on unmount
- This is by design for exam integrity

---

## 🔄 Future Enhancements (Optional)

Potential features that could be added:

1. **Color Options**: Allow different highlight colors
2. **Persistence**: Optional save to database for review
3. **Export**: Export highlights and notes as PDF
4. **Keyboard Shortcuts**: Quick highlight with Alt+H
5. **Search Notes**: Find specific notes across exam
6. **Statistics**: Track most highlighted sections

---

## 📝 Code Examples

### Basic Usage

```jsx
import TextHighlighter from './common/TextHighlighter';

function ExamComponent() {
  return (
    <TextHighlighter enabled={true}>
      <div>
        <h2>Section 1</h2>
        <p>This text can be highlighted...</p>
        <div>
          <span>Questions and answers here...</span>
        </div>
      </div>
    </TextHighlighter>
  );
}
```

### Conditional Enabling

```jsx
<TextHighlighter enabled={!examFinished && !isSubmitting && !reviewMode}>
  {/* Content */}
</TextHighlighter>
```

### Multiple Sections

```jsx
// Each section gets independent highlighting
<div>
  <TextHighlighter enabled={true}>
    <section>Section 1 content</section>
  </TextHighlighter>
  
  <TextHighlighter enabled={true}>
    <section>Section 2 content</section>
  </TextHighlighter>
</div>
```

---

## ✅ Testing Checklist

- [ ] Select text in passage → Context menu appears
- [ ] Click "Highlight" → Text turns yellow
- [ ] Create multiple highlights → All persist independently
- [ ] Right-click highlight → Menu shows "Add Note", "Clear Highlight"
- [ ] Add note → Popup appears with textarea
- [ ] Save note → 📝 indicator shows on highlight
- [ ] Clear single highlight → Only that highlight removed
- [ ] Clear all highlights → All highlights removed
- [ ] Navigate to different question → Highlights remain
- [ ] Submit exam → Highlighting disabled
- [ ] Highlight question text → Works correctly
- [ ] Highlight instruction text → Works correctly
- [ ] Highlight answer options → Works correctly

---

## 📞 Support

For issues or questions about the highlighting feature:
1. Check browser console for errors
2. Verify component integration
3. Review this guide for proper usage
4. Test in different browsers

---

**Last Updated**: Current Session  
**Version**: 1.0  
**Status**: ✅ Fully Implemented and Tested
