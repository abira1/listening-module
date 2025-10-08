import React, { useEffect, useRef, useState } from 'react';
import { Highlighter, StickyNote } from 'lucide-react';

/**
 * HighlightContextMenu Component
 * 
 * Context menu that appears when:
 * 1. User selects text (shows "Highlight" and "Notes" options)
 * 2. User right-clicks highlighted text (shows "Edit Note", "Clear Highlight", "Clear All")
 */

const HighlightContextMenu = ({
  x,
  y,
  type,
  onHighlight,
  onHighlightAndNote,
  onNoteOnly,
  onAddNote,
  onClearHighlight,
  onClearAll,
  hasHighlights,
  currentNote
}) => {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ x, y, transform: 'translateX(-50%)' });

  useEffect(() => {
    if (menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      let adjustedX = x;
      let adjustedY = y;
      let transform = 'translateX(-50%)'; // Center by default

      // Check if menu goes off right edge
      if (x + menuRect.width / 2 > windowWidth - 10) {
        adjustedX = windowWidth - menuRect.width - 10;
        transform = 'translateX(0)';
      }
      
      // Check if menu goes off left edge
      if (x - menuRect.width / 2 < 10) {
        adjustedX = 10;
        transform = 'translateX(0)';
      }

      // Check if menu goes off bottom edge
      if (y + menuRect.height > windowHeight - 10) {
        adjustedY = y - menuRect.height - 10; // Position above instead
      }

      setPosition({ x: adjustedX, y: adjustedY, transform });
    }
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      className="context-menu fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[9999]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: position.transform,
        minWidth: '200px'
      }}
    >
      {type === 'selection' && (
        <>
          <button
            onClick={onHighlight}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-900 flex items-center gap-3 transition-colors"
          >
            <Highlighter className="w-4 h-4 text-yellow-500" />
            <span className="font-medium">Highlight</span>
          </button>
          
          <button
            onClick={onNoteOnly}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-3 transition-colors"
          >
            <StickyNote className="w-4 h-4 text-blue-500" />
            <span className="font-medium">Notes</span>
          </button>
        </>
      )}

      {type === 'highlighted' && (
        <>
          {/* Display saved note if exists */}
          {currentNote && (
            <div className="px-4 py-3 border-b border-gray-200 bg-blue-50">
              <div className="flex items-start gap-2 mb-1">
                <StickyNote className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-blue-900 mb-1">Your Note:</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{currentNote}</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onAddNote}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-3 transition-colors"
          >
            <StickyNote className="w-4 h-4 text-blue-500" />
            <span className="font-medium">{currentNote ? 'Edit Note' : 'Add Note'}</span>
          </button>
          
          <button
            onClick={onClearHighlight}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-900 flex items-center gap-3 transition-colors"
          >
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="font-medium">Clear Highlight</span>
          </button>

          {hasHighlights && (
            <>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={onClearAll}
                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-900 flex items-center gap-3 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="font-medium">Clear All Highlights</span>
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default HighlightContextMenu;