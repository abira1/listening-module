import React, { useState, useEffect, useRef } from 'react';

/**
 * NotePopup Component
 * 
 * Small popup that appears when user adds a note to highlighted text.
 * Allows typing and saving notes associated with specific highlights.
 */

const NotePopup = ({ x, y, highlightId, currentNote, onSave, onClose }) => {
  const [noteText, setNoteText] = useState(currentNote || '');
  const [position, setPosition] = useState({ x, y, transform: 'translateX(-50%)' });
  const textareaRef = useRef(null);
  const popupRef = useRef(null);

  // Update noteText when currentNote prop changes
  useEffect(() => {
    setNoteText(currentNote || '');
    console.log('NotePopup opened with note:', currentNote);
  }, [currentNote]);

  // Smart positioning to keep popup on screen
  useEffect(() => {
    if (popupRef.current) {
      const popupRect = popupRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      let adjustedX = x;
      let adjustedY = y;
      let transform = 'translateX(-50%)'; // Center by default

      // Check if popup goes off right edge
      if (x + popupRect.width / 2 > windowWidth - 10) {
        adjustedX = windowWidth - popupRect.width - 10;
        transform = 'translateX(0)';
      }
      
      // Check if popup goes off left edge
      if (x - popupRect.width / 2 < 10) {
        adjustedX = 10;
        transform = 'translateX(0)';
      }

      // Check if popup goes off bottom edge
      if (y + popupRect.height > windowHeight - 10) {
        adjustedY = y - popupRect.height - 10; // Position above instead
      }

      setPosition({ x: adjustedX, y: adjustedY, transform });
    }
  }, [x, y]);

  useEffect(() => {
    // Focus on textarea when popup opens
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end of text
      textareaRef.current.selectionStart = textareaRef.current.value.length;
      textareaRef.current.selectionEnd = textareaRef.current.value.length;
    }
  }, []);

  const handleSave = () => {
    console.log('Saving note from popup:', noteText);
    onSave(highlightId, noteText);
  };

  const handleKeyDown = (e) => {
    // Save on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSave();
    }
    // Close on Escape
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      ref={popupRef}
      className="note-popup fixed bg-white rounded-lg shadow-2xl border-2 border-blue-300 p-3 z-[9999]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: position.transform,
        minWidth: '280px',
        maxWidth: '400px',
      }}
    >
      <div className="mb-2">
        <label className="text-xs font-semibold text-gray-700 mb-1 block">
          {currentNote ? 'Edit Note' : 'Add Note'}
        </label>
        <textarea
          ref={textareaRef}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your note here..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
          rows="3"
        />
      </div>
      
      <div className="flex gap-2 justify-end">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        >
          Save Note
        </button>
      </div>

      {currentNote && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500 italic">
            Tip: Press Ctrl+Enter to save quickly
          </p>
        </div>
      )}
    </div>
  );
};

export default NotePopup;