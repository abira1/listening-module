import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StickyNote, X, Minus, ChevronRight, GripVertical } from 'lucide-react';

/**
 * NotesPanel Component
 * 
 * A draggable, resizable, collapsible notes panel for IELTS exams.
 * Features:
 * - Float on the side of the screen
 * - Draggable to any position
 * - Resizable with corner/edge handles
 * - Collapsible/expandable
 * - Auto-save to localStorage
 * - Persists across navigation
 * - Independent from highlights
 */

const NotesPanel = ({ examId, enabled = true }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notes, setNotes] = useState('');
  const [position, setPosition] = useState({ x: window.innerWidth - 370, y: 100 });
  const [size, setSize] = useState({ width: 350, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const panelRef = useRef(null);
  const textareaRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Load notes from localStorage on mount
  useEffect(() => {
    if (examId) {
      const savedNotes = localStorage.getItem(`exam-notes-${examId}`);
      const savedPosition = localStorage.getItem(`notes-panel-position`);
      const savedSize = localStorage.getItem(`notes-panel-size`);
      const savedCollapsed = localStorage.getItem(`notes-panel-collapsed`);
      
      if (savedNotes) {
        setNotes(savedNotes);
      }
      if (savedPosition) {
        try {
          setPosition(JSON.parse(savedPosition));
        } catch (e) {
          console.error('Error parsing saved position:', e);
        }
      }
      if (savedSize) {
        try {
          setSize(JSON.parse(savedSize));
        } catch (e) {
          console.error('Error parsing saved size:', e);
        }
      }
      if (savedCollapsed) {
        setIsCollapsed(savedCollapsed === 'true');
      }
    }
  }, [examId]);

  // Auto-save notes to localStorage
  const saveNotes = useCallback((text) => {
    if (examId) {
      localStorage.setItem(`exam-notes-${examId}`, text);
    }
  }, [examId]);

  // Handle notes change with debounced auto-save
  const handleNotesChange = (e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Save after 500ms of no typing
    saveTimeoutRef.current = setTimeout(() => {
      saveNotes(newNotes);
    }, 500);
  };

  // Clear all notes
  const handleClearNotes = () => {
    if (window.confirm('Are you sure you want to clear all notes?')) {
      setNotes('');
      if (examId) {
        localStorage.removeItem(`exam-notes-${examId}`);
      }
    }
  };

  // Toggle collapse
  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem(`notes-panel-collapsed`, String(newCollapsed));
  };

  // Dragging functionality
  const handleDragStart = (e) => {
    if (e.target.closest('.panel-header') && !e.target.closest('button')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleDragMove = useCallback((e) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(e.clientX - dragStart.x, window.innerWidth - 100));
      const newY = Math.max(0, Math.min(e.clientY - dragStart.y, window.innerHeight - 50));
      
      const newPosition = { x: newX, y: newY };
      setPosition(newPosition);
      localStorage.setItem(`notes-panel-position`, JSON.stringify(newPosition));
    }
  }, [isDragging, dragStart]);

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Resizing functionality
  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  const handleResizeMove = useCallback((e) => {
    if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(250, Math.min(resizeStart.width + deltaX, 600));
      const newHeight = Math.max(200, Math.min(resizeStart.height + deltaY, 800));
      
      const newSize = { width: newWidth, height: newHeight };
      setSize(newSize);
      localStorage.setItem(`notes-panel-size`, JSON.stringify(newSize));
    }
  }, [isResizing, resizeStart]);

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  // Mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove]);

  if (!enabled) return null;

  return (
    <div
      ref={panelRef}
      className="notes-panel fixed bg-white rounded-lg shadow-2xl border-2 border-blue-400 overflow-hidden z-[9999]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isCollapsed ? '48px' : `${size.width}px`,
        height: isCollapsed ? '48px' : `${size.height}px`,
        transition: isCollapsed ? 'width 0.3s ease, height 0.3s ease' : 'none',
        userSelect: isDragging ? 'none' : 'auto'
      }}
    >
      {/* Header */}
      <div
        className="panel-header bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 flex items-center justify-between cursor-move select-none"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4" />
          {!isCollapsed && <span className="text-sm font-semibold">Notes</span>}
        </div>
        <div className="flex items-center gap-1">
          {!isCollapsed && (
            <button
              onClick={handleClearNotes}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              title="Clear all notes"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={toggleCollapse}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
            title={isCollapsed ? "Expand notes" : "Collapse notes"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="notes-content h-full flex flex-col" style={{ height: `calc(100% - 40px)` }}>
          <div className="flex-1 p-3 overflow-hidden">
            <textarea
              ref={textareaRef}
              value={notes}
              onChange={handleNotesChange}
              placeholder="Type your notes here... (auto-saves)"
              className="w-full h-full resize-none border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              style={{ fontFamily: 'inherit' }}
            />
          </div>
          
          {/* Auto-save indicator */}
          <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
            <span>✓ Auto-saved</span>
            <span>{notes.length} characters</span>
          </div>
        </div>
      )}

      {/* Resize Handle */}
      {!isCollapsed && (
        <div
          className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeStart}
          style={{
            background: 'linear-gradient(135deg, transparent 50%, #3b82f6 50%)',
          }}
          title="Drag to resize"
        >
          <GripVertical className="w-3 h-3 text-blue-600 absolute bottom-0 right-0" />
        </div>
      )}
    </div>
  );
};

export default NotesPanel;