# Highlight and Notes Feature - Implementation Guide

## Overview
The highlight and notes feature allows students to mark important text and add personal notes during IELTS listening tests. This feature is implemented using precise Range API for exact text selection and manipulation.

## Features Implemented

### ✅ 1. Text Selection Menu
When you select any text in the exam:
- A popup menu appears immediately with two options:
  - **Highlight** (with highlighter icon 🖍️)
  - **Notes** (with sticky note icon 📝)

### ✅ 2. Highlighting Text
- Click "Highlight" to mark selected text in **yellow background**
- Multiple highlights are supported
- Highlights stay exactly on the selected text (no missing or extra characters)
- Hover over highlights to see a brighter yellow shade

### ✅ 3. Adding Notes Without Highlighting
- Click "Notes" to add a note to text **without highlighting it**
- A note popup opens immediately for typing
- Text remains normal (no yellow background) but has a note attached
- A **📝 icon** appears next to the text with a note

### ✅ 4. Adding Notes to Highlighted Text
- When you highlight text, you can add notes by:
  1. Right-clicking on the highlighted text
  2. Selecting "Add Note" from the menu
  3. Typing your note in the popup
- The **📝 icon** appears next to highlighted text with notes

### ✅ 5. Clickable Note Icons
- The 📝 icon appears next to any text that has a note
- **Click the icon** to view or edit the note
- Icon scales up slightly on hover for better UX

### ✅ 6. Right-Click Context Menu on Highlights
Right-clicking on highlighted text shows:
- **Your Note:** (if a note exists - displayed at the top)
- **Edit Note** / **Add Note** - Opens note editor
- **Clear Highlight** - Removes the highlight (and note icon)
- **Clear All Highlights** - Removes all highlights from the entire page

### ✅ 7. Note Popup Features
The note popup includes:
- Text area for typing notes
- **Save Note** button
- **Cancel** button
- Auto-focus on textarea
- Press **Ctrl+Enter** (or Cmd+Enter on Mac) to save quickly
- Press **Escape** to cancel

### ✅ 8. Works Everywhere
The feature works on:
- ✅ Passage text
- ✅ Question text
- ✅ Answer options
- ✅ Instructions
- ✅ Any selectable text in the exam

### ✅ 9. Multiple Highlights & Notes
- Unlimited highlights and notes are supported
- Each highlight/note is tracked independently
- No conflicts between overlapping selections

### ✅ 10. Session Persistence
- Highlights and notes stay during the entire test session
- They remain as you navigate between questions
- They are cleared when you finish/submit the exam
- **Note:** This is intentional - highlights/notes are for exam-taking only, not permanently saved

### ✅ 11. Exact Text Selection
- Uses browser's Range API for precision
- Captures exactly the characters you select
- No extra spaces or missing characters
- Works with multi-line selections

## Technical Implementation

### Components
1. **TextHighlighter.jsx** - Main component handling selection and state
2. **HighlightContextMenu.jsx** - Popup menu for highlight/note actions
3. **NotePopup.jsx** - Note editor popup
4. **index.css** - Styling for highlights and note icons

### How It Works

#### Text Selection Flow
```
User selects text
  ↓
onMouseUp event captures selection
  ↓
Range API extracts exact text boundaries
  ↓
Context menu appears with "Highlight" and "Notes"
  ↓
User chooses action
```

#### Highlight Flow
```
User clicks "Highlight"
  ↓
Range.extractContents() extracts selected content
  ↓
Wrap content in <span class="highlighted-text">
  ↓
Insert back using Range.insertNode()
  ↓
Add note icon element (hidden by default)
  ↓
Store in state with unique ID
```

#### Note Flow
```
User clicks "Notes" or "Add Note"
  ↓
Note popup opens with textarea
  ↓
User types and saves
  ↓
Note text stored in state
  ↓
Note icon (📝) becomes visible
  ↓
Click icon to edit note anytime
```

### Key Technologies
- **Range API** - Precise text selection and manipulation
- **React Hooks** - State management (useState, useEffect, useCallback, useRef)
- **Lucide Icons** - Modern icons for UI (Highlighter, StickyNote)
- **Tailwind CSS** - Styling and animations
- **Event Handling** - Mouse events (click, mouseup, contextmenu)

## Usage Instructions for Students

### To Highlight Text:
1. Select the text you want to highlight
2. Click "Highlight" in the popup menu
3. The text turns yellow

### To Add a Note (without highlighting):
1. Select the text
2. Click "Notes" in the popup menu
3. Type your note
4. Click "Save Note" or press Ctrl+Enter

### To Add a Note to Highlighted Text:
1. Right-click on the highlighted text
2. Click "Add Note" or "Edit Note"
3. Type your note
4. Click "Save Note"

### To View/Edit a Note:
1. Look for the 📝 icon next to text
2. Click the icon
3. The note popup opens with your existing note
4. Edit and save as needed

### To Remove a Highlight:
1. Right-click on the highlighted text
2. Click "Clear Highlight"

### To Remove All Highlights:
1. Right-click on any highlighted text
2. Click "Clear All Highlights"

## Styling Details

### Highlight Colors
- **Normal highlight:** Light yellow (#fef08a)
- **Hover:** Brighter yellow (#fde047)
- **Note-only:** Transparent (no background)
- **Note-only hover:** Light gray (#f3f4f6)

### Note Icon
- **Emoji:** 📝
- **Size:** 14px
- **Position:** Superscript (next to text)
- **Hover effect:** Scales to 1.2x
- **Visibility:** Hidden until note is saved

### Context Menu
- **Background:** White with subtle shadow
- **Border:** Light gray
- **Hover:** Colored backgrounds (yellow for highlight, blue for notes)
- **Animation:** Smooth fade-in (0.15s)
- **Position:** Smart positioning (stays on screen)

## Browser Compatibility
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (with touch selection)

## Known Limitations
1. **No persistence across sessions** - By design, highlights/notes are cleared after exam submission
2. **No highlighting across form elements** - Cannot highlight text inside input fields
3. **No PDF support** - Works only on HTML content

## Future Enhancements (Optional)
- [ ] Export highlights and notes to PDF
- [ ] Different highlight colors
- [ ] Search through notes
- [ ] Keyboard shortcuts for quick highlighting
- [ ] Voice notes (audio recording)

## Testing Checklist
- [x] Select text and see popup menu
- [x] Click "Highlight" and see yellow background
- [x] Click "Notes" and add note without highlight
- [x] Right-click highlight and see context menu
- [x] Add note to highlight and see 📝 icon
- [x] Click note icon to edit note
- [x] Clear individual highlight
- [x] Clear all highlights
- [x] Test on questions, passages, and answers
- [x] Test multiple highlights
- [x] Test exact text selection (no character loss)
- [x] Test note icon visibility

## Troubleshooting

### Menu not appearing?
- Check if `enabled={true}` prop is set on TextHighlighter
- Ensure you're selecting inside the TextHighlighter container
- Check browser console for errors

### Highlights not applying?
- Verify the Range API is supported in your browser
- Check if selection is within the container
- Look for JavaScript errors in console

### Notes not saving?
- Ensure the save button is clicked
- Check state updates in React DevTools
- Verify note icon appears after saving

### Note icon not showing?
- Confirm the note has text (not empty)
- Check if noteIconElement exists in state
- Verify CSS is loaded correctly

## Code Examples

### Using TextHighlighter in a Component
```jsx
import TextHighlighter from './common/TextHighlighter';

function MyComponent() {
  return (
    <TextHighlighter enabled={true}>
      <div>
        <p>This text can be highlighted and annotated.</p>
        <p>Multiple paragraphs work perfectly.</p>
      </div>
    </TextHighlighter>
  );
}
```

### Disabling During Exam Submission
```jsx
<TextHighlighter enabled={!examFinished && !isSubmitting}>
  {/* exam content */}
</TextHighlighter>
```

## Performance Considerations
- Uses `useCallback` to prevent unnecessary re-renders
- `useRef` for accessing latest state without re-renders
- Efficient DOM manipulation with Range API
- Event delegation for better performance

## Accessibility
- Keyboard shortcuts supported (Ctrl+Enter to save, Escape to cancel)
- Clear visual indicators for interactive elements
- Proper hover states for clickable elements
- Note icons have title attributes for tooltips

## Security Notes
- No data is sent to servers (session-only storage)
- No localStorage or cookies used
- Highlights/notes stay only in browser memory
- Cleared on exam submission or page refresh

---

**Implementation Date:** January 2025  
**Last Updated:** January 2025  
**Status:** ✅ Fully Functional and Tested
