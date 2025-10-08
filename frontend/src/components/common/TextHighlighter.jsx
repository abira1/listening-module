import React, { useState, useEffect, useCallback, useRef } from 'react';
import HighlightContextMenu from './HighlightContextMenu';
import NotePopup from './NotePopup';

/**
 * TextHighlighter Component
 * 
 * Provides text highlighting and note-taking functionality for IELTS exam modules.
 * Uses Range API for precise character-level highlighting.
 * 
 * Features:
 * - Precise text highlighting using Range API
 * - Multiple independent highlights
 * - Note-taking on highlighted text
 * - Clear individual or all highlights
 * - No persistence after exam ends
 */

const TextHighlighter = ({ children, enabled = true }) => {
  const [highlights, setHighlights] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [notePopup, setNotePopup] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null);
  const containerRef = useRef(null);
  const highlightIdCounter = useRef(0);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenu && !e.target.closest('.context-menu')) {
        setContextMenu(null);
      }
      if (notePopup && !e.target.closest('.note-popup') && !e.target.closest('.highlighted-text')) {
        setNotePopup(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu, notePopup]);

  // Handle text selection
  const handleMouseUp = useCallback((e) => {
    if (!enabled) return;

    // Ignore if clicking on existing highlight controls
    if (e.target.closest('.context-menu') || e.target.closest('.note-popup')) {
      return;
    }

    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText.length > 0) {
      // Get the range
      const range = selection.getRangeAt(0);
      
      // Check if selection is within our container
      if (!containerRef.current.contains(range.commonAncestorContainer)) {
        return;
      }

      // Store the range for later use
      setSelectedRange({
        range: range.cloneRange(),
        text: selectedText
      });

      // Show context menu for highlighting
      const rect = range.getBoundingClientRect();
      setContextMenu({
        x: e.pageX,
        y: e.pageY,
        type: 'highlight'
      });
    }
  }, [enabled]);

  // Handle right-click on highlighted text
  const handleContextMenu = useCallback((e) => {
    if (!enabled) return;

    // Check if right-clicking on highlighted text
    const highlightedElement = e.target.closest('.highlighted-text');
    if (highlightedElement) {
      e.preventDefault();
      
      const highlightId = highlightedElement.dataset.highlightId;
      const highlight = highlights.find(h => h.id === highlightId);

      if (highlight) {
        setContextMenu({
          x: e.pageX,
          y: e.pageY,
          type: 'highlighted',
          highlightId: highlightId,
          highlight: highlight
        });
      }
    }
  }, [enabled, highlights]);

  // Apply highlight using Range API
  const applyHighlight = useCallback(() => {
    if (!selectedRange) return;

    try {
      const { range, text } = selectedRange;
      
      // Create unique ID for this highlight
      const highlightId = `highlight-${Date.now()}-${highlightIdCounter.current++}`;

      // Create span element for highlight
      const highlightSpan = document.createElement('span');
      highlightSpan.className = 'highlighted-text';
      highlightSpan.style.backgroundColor = '#fef08a'; // Tailwind yellow-200
      highlightSpan.style.cursor = 'pointer';
      highlightSpan.setAttribute('data-highlight-id', highlightId);

      // Use Range API to wrap the selected content
      try {
        // Extract the contents of the range
        const contents = range.extractContents();
        
        // Append the contents to our highlight span
        highlightSpan.appendChild(contents);
        
        // Insert the highlight span at the range position
        range.insertNode(highlightSpan);
        
        // Clear the selection
        window.getSelection().removeAllRanges();

        // Store highlight data
        const newHighlight = {
          id: highlightId,
          text: text,
          note: null,
          element: highlightSpan
        };

        setHighlights(prev => [...prev, newHighlight]);
        
      } catch (err) {
        console.error('Error applying highlight:', err);
      }

      setContextMenu(null);
      setSelectedRange(null);

    } catch (error) {
      console.error('Error in applyHighlight:', error);
    }
  }, [selectedRange]);

  // Add note to highlight
  const addNote = useCallback((highlightId) => {
    const highlight = highlights.find(h => h.id === highlightId);
    if (!highlight) return;

    const rect = highlight.element.getBoundingClientRect();
    setNotePopup({
      highlightId: highlightId,
      x: rect.left + window.pageXOffset,
      y: rect.bottom + window.pageYOffset + 5,
      currentNote: highlight.note || ''
    });

    setContextMenu(null);
  }, [highlights]);

  // Save note
  const saveNote = useCallback((highlightId, noteText) => {
    setHighlights(prev => 
      prev.map(h => {
        if (h.id === highlightId) {
          const hasNote = noteText.trim() !== '';
          // Update the element's data attribute for CSS styling
          if (h.element) {
            h.element.setAttribute('data-has-note', hasNote.toString());
          }
          return { ...h, note: noteText.trim() || null };
        }
        return h;
      })
    );
    setNotePopup(null);
  }, []);

  // Clear specific highlight
  const clearHighlight = useCallback((highlightId) => {
    const highlight = highlights.find(h => h.id === highlightId);
    if (!highlight) return;

    try {
      // Get the highlight element
      const highlightElement = highlight.element;
      
      // Replace the highlight span with its text content
      if (highlightElement && highlightElement.parentNode) {
        const parent = highlightElement.parentNode;
        const textNode = document.createTextNode(highlightElement.textContent);
        parent.replaceChild(textNode, highlightElement);
        
        // Normalize the parent to merge adjacent text nodes
        parent.normalize();
      }

      // Remove from state
      setHighlights(prev => prev.filter(h => h.id !== highlightId));
      
    } catch (error) {
      console.error('Error clearing highlight:', error);
    }

    setContextMenu(null);
  }, [highlights]);

  // Clear all highlights
  const clearAllHighlights = useCallback(() => {
    highlights.forEach(highlight => {
      try {
        const highlightElement = highlight.element;
        if (highlightElement && highlightElement.parentNode) {
          const parent = highlightElement.parentNode;
          const textNode = document.createTextNode(highlightElement.textContent);
          parent.replaceChild(textNode, highlightElement);
          parent.normalize();
        }
      } catch (error) {
        console.error('Error clearing highlight:', error);
      }
    });

    setHighlights([]);
    setContextMenu(null);
  }, [highlights]);

  return (
    <div
      ref={containerRef}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
      className="text-highlighter-container"
    >
      {children}

      {/* Context Menu */}
      {contextMenu && (
        <HighlightContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={contextMenu.type}
          onHighlight={applyHighlight}
          onAddNote={() => addNote(contextMenu.highlightId)}
          onClearHighlight={() => clearHighlight(contextMenu.highlightId)}
          onClearAll={clearAllHighlights}
          hasHighlights={highlights.length > 0}
          currentNote={contextMenu.highlight?.note || null}
        />
      )}

      {/* Note Popup */}
      {notePopup && (
        <NotePopup
          x={notePopup.x}
          y={notePopup.y}
          highlightId={notePopup.highlightId}
          currentNote={notePopup.currentNote}
          onSave={saveNote}
          onClose={() => setNotePopup(null)}
        />
      )}
    </div>
  );
};

export default TextHighlighter;