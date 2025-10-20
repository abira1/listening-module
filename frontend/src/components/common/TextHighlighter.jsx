import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * TextHighlighter Component - Simplified Version
 * 
 * Provides simple text highlighting functionality for IELTS exam modules.
 * - Drag to highlight text in yellow
 * - Click highlighted text to remove it
 * - No menus or popups
 * - Multiple highlights supported
 */

const TextHighlighter = ({ children, enabled = true }) => {
  const [highlights, setHighlights] = useState([]);
  const containerRef = useRef(null);
  const highlightIdCounter = useRef(0);

  // Handle text selection
  const handleMouseUp = useCallback((e) => {
    if (!enabled) return;

    // Ignore if clicking on existing highlights
    if (e.target.closest('.highlighted-text')) {
      return;
    }

    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText.length > 0) {
      const range = selection.getRangeAt(0);
      
      // Check if selection is within our container
      if (!containerRef.current.contains(range.commonAncestorContainer)) {
        return;
      }

      applyHighlight(range, selectedText);
    }
  }, [enabled]);

  // Handle click on highlighted text to remove it
  const handleClick = useCallback((e) => {
    if (!enabled) return;

    const highlightedElement = e.target.closest('.highlighted-text');
    if (highlightedElement) {
      e.preventDefault();
      e.stopPropagation();
      
      const highlightId = highlightedElement.dataset.highlightId;
      clearHighlight(highlightId);
    }
  }, [enabled]);

  // Apply highlight using Range API
  const applyHighlight = useCallback((range, text) => {
    try {
      // Create unique ID for this highlight
      const highlightId = `highlight-${Date.now()}-${highlightIdCounter.current++}`;

      // Create span element for highlight
      const highlightSpan = document.createElement('span');
      highlightSpan.className = 'highlighted-text';
      highlightSpan.style.backgroundColor = '#fef08a'; // Yellow
      highlightSpan.style.cursor = 'pointer';
      highlightSpan.style.padding = '2px 0';
      highlightSpan.style.borderRadius = '2px';
      highlightSpan.style.transition = 'background-color 0.2s ease';
      highlightSpan.setAttribute('data-highlight-id', highlightId);
      highlightSpan.title = 'Click to remove highlight';

      // Extract the contents of the range
      const contents = range.extractContents();
      
      // Append the contents to our highlight span
      highlightSpan.appendChild(contents);
      
      // Insert the highlight span at the range position
      range.insertNode(highlightSpan);
      
      // Clear the selection
      window.getSelection().removeAllRanges();

      // Store highlight data
      setHighlights(prev => [...prev, {
        id: highlightId,
        text: text,
        element: highlightSpan
      }]);

    } catch (error) {
      console.error('Error applying highlight:', error);
    }
  }, []);

  // Clear specific highlight
  const clearHighlight = useCallback((highlightId) => {
    setHighlights(prev => {
      const highlight = prev.find(h => h.id === highlightId);
      
      if (highlight && highlight.element && highlight.element.parentNode) {
        try {
          const parent = highlight.element.parentNode;
          const textNode = document.createTextNode(highlight.element.textContent);
          parent.replaceChild(textNode, highlight.element);
          parent.normalize();
        } catch (error) {
          console.error('Error clearing highlight:', error);
        }
      }
      
      return prev.filter(h => h.id !== highlightId);
    });
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      className="text-highlighter-container"
      style={{ userSelect: 'text' }}
    >
      {children}
    </div>
  );
};

export default TextHighlighter;