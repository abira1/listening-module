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
 * - Note-taking with or without highlighting
 * - Clickable note icons to edit notes
 * - Clear individual or all highlights
 * - No persistence after exam ends (session-only)
 */

const TextHighlighter = ({ children, enabled = true }) => {
  const [highlights, setHighlights] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [notePopup, setNotePopup] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null);
  const containerRef = useRef(null);
  const highlightIdCounter = useRef(0);
  const highlightsRef = useRef(highlights);

  // Keep ref in sync with state
  useEffect(() => {
    highlightsRef.current = highlights;
  }, [highlights]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenu && !e.target.closest('.context-menu')) {
        setContextMenu(null);
      }
      if (notePopup && !e.target.closest('.note-popup') && !e.target.closest('.highlighted-text') && !e.target.closest('.note-icon')) {
        setNotePopup(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu, notePopup]);

  // Handle text selection
  const handleMouseUp = useCallback((e) => {
    if (!enabled) return;

    // Ignore if clicking on existing highlight controls or note icons
    if (e.target.closest('.context-menu') || e.target.closest('.note-popup') || e.target.closest('.note-icon')) {
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

      // Get selection rectangle for better positioning
      const rect = range.getBoundingClientRect();
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      // Position menu right below the selection
      setContextMenu({
        x: rect.left + scrollX + (rect.width / 2), // Center horizontally
        y: rect.bottom + scrollY + 5, // 5px below selection
        type: 'selection' // Show both Highlight and Notes options
      });
    }
  }, [enabled]);

  // Handle click on note icon
  const handleNoteIconClick = useCallback((e, highlightId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const highlight = highlightsRef.current.find(h => h.id === highlightId);
    if (highlight) {
      const rect = e.target.getBoundingClientRect();
      setNotePopup({
        highlightId: highlightId,
        x: rect.left + window.pageXOffset,
        y: rect.bottom + window.pageYOffset + 5,
        currentNote: highlight.note || ''
      });
    }
  }, []);

  // Handle right-click on highlighted text
  const handleContextMenu = useCallback((e) => {
    if (!enabled) return;

    // Check if right-clicking on highlighted text
    const highlightedElement = e.target.closest('.highlighted-text');
    if (highlightedElement) {
      e.preventDefault();
      
      const highlightId = highlightedElement.dataset.highlightId;
      const highlight = highlightsRef.current.find(h => h.id === highlightId);

      if (highlight) {
        // Get highlight element position for better menu placement
        const rect = highlightedElement.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;

        setContextMenu({
          x: rect.left + scrollX + (rect.width / 2), // Center horizontally
          y: rect.bottom + scrollY + 5, // 5px below highlight
          type: 'highlighted',
          highlightId: highlightId,
          highlight: highlight
        });
      }
    }
  }, [enabled]);

  // Apply highlight using Range API
  const applyHighlight = useCallback((withNote = false) => {
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
      highlightSpan.style.position = 'relative';
      highlightSpan.style.display = 'inline';
      highlightSpan.setAttribute('data-highlight-id', highlightId);

      // Use Range API to wrap the selected content
      try {
        // Extract the contents of the range
        const contents = range.extractContents();
        
        // Append the contents to our highlight span
        highlightSpan.appendChild(contents);
        
        // Insert the highlight span at the range position
        range.insertNode(highlightSpan);
        
        // Create note icon element
        const noteIcon = document.createElement('span');
        noteIcon.className = 'note-icon';
        noteIcon.style.cssText = 'cursor: pointer; font-size: 14px; margin-left: 2px; vertical-align: super;';
        noteIcon.textContent = '📝';
        noteIcon.title = 'Click to edit note';
        noteIcon.style.display = 'none'; // Hidden by default
        noteIcon.onclick = (e) => handleNoteIconClick(e, highlightId);
        
        // Insert note icon after highlight
        highlightSpan.parentNode.insertBefore(noteIcon, highlightSpan.nextSibling);
        
        // Clear the selection
        window.getSelection().removeAllRanges();

        // Store highlight data
        const newHighlight = {
          id: highlightId,
          text: text,
          note: null,
          element: highlightSpan,
          noteIconElement: noteIcon
        };

        setHighlights(prev => [...prev, newHighlight]);
        
        // If user wants to add note immediately, open note popup
        if (withNote) {
          setTimeout(() => {
            const rect = highlightSpan.getBoundingClientRect();
            setNotePopup({
              highlightId: highlightId,
              x: rect.left + window.pageXOffset,
              y: rect.bottom + window.pageYOffset + 5,
              currentNote: ''
            });
          }, 100);
        }
        
      } catch (err) {
        console.error('Error applying highlight:', err);
      }

      setContextMenu(null);
      setSelectedRange(null);

    } catch (error) {
      console.error('Error in applyHighlight:', error);
    }
  }, [selectedRange, handleNoteIconClick]);

  // Add note only (without highlighting)
  const addNoteOnly = useCallback(() => {
    if (!selectedRange) return;

    try {
      const { range, text } = selectedRange;
      
      // Create unique ID for this note
      const highlightId = `note-${Date.now()}-${highlightIdCounter.current++}`;

      // Create span element for note (no yellow background)
      const noteSpan = document.createElement('span');
      noteSpan.className = 'highlighted-text note-only';
      noteSpan.style.backgroundColor = 'transparent';
      noteSpan.style.cursor = 'pointer';
      noteSpan.style.position = 'relative';
      noteSpan.style.display = 'inline';
      noteSpan.setAttribute('data-highlight-id', highlightId);

      try {
        // Extract the contents of the range
        const contents = range.extractContents();
        
        // Append the contents to our note span
        noteSpan.appendChild(contents);
        
        // Insert the note span at the range position
        range.insertNode(noteSpan);
        
        // Create note icon element
        const noteIcon = document.createElement('span');
        noteIcon.className = 'note-icon';
        noteIcon.style.cssText = 'cursor: pointer; font-size: 14px; margin-left: 2px; vertical-align: super;';
        noteIcon.textContent = '📝';
        noteIcon.title = 'Click to edit note';
        noteIcon.onclick = (e) => handleNoteIconClick(e, highlightId);
        
        // Insert note icon after span
        noteSpan.parentNode.insertBefore(noteIcon, noteSpan.nextSibling);
        
        // Clear the selection
        window.getSelection().removeAllRanges();

        // Store note data
        const newHighlight = {
          id: highlightId,
          text: text,
          note: null,
          element: noteSpan,
          noteIconElement: noteIcon,
          isNoteOnly: true
        };

        setHighlights(prev => [...prev, newHighlight]);
        
        // Open note popup immediately
        setTimeout(() => {
          const rect = noteSpan.getBoundingClientRect();
          setNotePopup({
            highlightId: highlightId,
            x: rect.left + window.pageXOffset,
            y: rect.bottom + window.pageYOffset + 5,
            currentNote: ''
          });
        }, 100);
        
      } catch (err) {
        console.error('Error adding note:', err);
      }

      setContextMenu(null);
      setSelectedRange(null);

    } catch (error) {
      console.error('Error in addNoteOnly:', error);
    }
  }, [selectedRange, handleNoteIconClick]);

  // Save note
  const saveNote = useCallback((highlightId, noteText) => {
    const trimmedNote = noteText.trim();

    setHighlights(prev => {
      const updated = prev.map(h => {
        if (h.id === highlightId) {
          const hasNote = trimmedNote !== '';
          
          // Show/hide note icon based on whether note exists
          if (h.noteIconElement) {
            h.noteIconElement.style.display = hasNote ? 'inline' : 'none';
          }
          
          return { ...h, note: trimmedNote || null };
        }
        return h;
      });
      return updated;
    });
    
    setNotePopup(null);
  }, []);

  // Clear specific highlight
  const clearHighlight = useCallback((highlightId) => {
    const highlight = highlightsRef.current.find(h => h.id === highlightId);
    if (!highlight) {
      return;
    }

    try {
      // Remove note icon first
      if (highlight.noteIconElement && highlight.noteIconElement.parentNode) {
        highlight.noteIconElement.parentNode.removeChild(highlight.noteIconElement);
      }
      
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
  }, []);

  // Clear all highlights
  const clearAllHighlights = useCallback(() => {
    highlights.forEach(highlight => {
      try {
        // Remove note icon
        if (highlight.noteIconElement && highlight.noteIconElement.parentNode) {
          highlight.noteIconElement.parentNode.removeChild(highlight.noteIconElement);
        }
        
        // Remove highlight
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
          onHighlight={() => applyHighlight(false)}
          onHighlightAndNote={() => applyHighlight(true)}
          onNoteOnly={addNoteOnly}
          onAddNote={() => {
            const highlight = highlightsRef.current.find(h => h.id === contextMenu.highlightId);
            if (highlight) {
              const rect = highlight.element.getBoundingClientRect();
              setNotePopup({
                highlightId: contextMenu.highlightId,
                x: rect.left + window.pageXOffset,
                y: rect.bottom + window.pageYOffset + 5,
                currentNote: highlight.note || ''
              });
              setContextMenu(null);
            }
          }}
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