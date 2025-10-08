import React, { useEffect, useRef, useState } from 'react';

/**
 * HighlightContextMenu Component
 * 
 * Context menu that appears when:
 * 1. User selects text (shows "Highlight" option)
 * 2. User right-clicks highlighted text (shows note if exists, "Add/Edit Note", "Clear Highlight", "Clear All")
 */

const HighlightContextMenu = ({
  x,
  y,
  type,
  onHighlight,
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
        maxWidth: '320px',
        minWidth: '200px'
      }}
    >
      {type === 'highlight' && (
        <button
          onClick={onHighlight}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-900 flex items-center gap-2"
        >
          <span className="inline-block w-4 h-4 bg-yellow-200 rounded"></span>
          Highlight
        </button>
      )}

      {type === 'highlighted' && (
        <>
          {/* Display saved note if exists */}
          {currentNote && (
            <div className="px-4 py-3 border-b border-gray-200 bg-blue-50">
              <div className="flex items-start gap-2 mb-1">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-blue-900 mb-1">Your Note:</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{currentNote}</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onAddNote}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {currentNote ? 'Edit Note' : 'Add Note'}
          </button>
          
          <button
            onClick={onClearHighlight}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-900 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Highlight
          </button>

          {hasHighlights && (
            <>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={onClearAll}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-900 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All Highlights
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default HighlightContextMenu;