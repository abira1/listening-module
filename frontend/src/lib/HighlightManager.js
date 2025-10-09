/**
 * HighlightManager - Complete QTI-based text highlighting and notes system
 * Based on QTI platform specification with Rangy library
 */

class HighlightManager {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = null;
    this.cssApplier = null;
    this.ranges = {};
    this.rangesOrder = [];
    this.savedRanges = {};
    this.savedNotes = {};
    this.notes = {};
    this.screenId = null;
    this.currentSelection = null;
    this.currentTarget = null;
    this.highestId = 0;
    this.highestZ = 1000;
    this.options = {
      noteHighlightText: options.noteHtext !== false,
      ...options
    };
    
    this.init();
  }

  init() {
    // Wait for container to be available
    const checkContainer = setInterval(() => {
      this.container = document.getElementById(this.containerId);
      if (this.container) {
        clearInterval(checkContainer);
        this.setup();
      }
    }, 100);
  }

  setup() {
    // Initialize Rangy
    if (window.rangy && !this.cssApplier) {
      window.rangy.init();
      this.cssApplier = window.rangy.createClassApplier('ylw-hglted', {
        ignoreWhiteSpace: true,
        tagNames: ['span']
      });
    }

    // Set up event listeners
    this.container.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.container.addEventListener('contextmenu', this.handleContextMenu.bind(this));
    this.container.addEventListener('mouseover', this.handleMouseOver.bind(this));
    this.container.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
  }

  handleMouseUp(e) {
    if (e.button === 0) { // Left click only
      // Check if clicking on highlighted text
      const highlightedElement = e.target.closest('.ylw-hglted');
      if (highlightedElement) {
        const rangeKey = this.getContextualRange(e.target);
        if (rangeKey && this.notes[rangeKey]) {
          this.notes[rangeKey].show();
        }
      }
    }
  }

  handleContextMenu(e) {
    e.preventDefault();
    this.currentTarget = e.target;
    
    if (!window.rangy) return;
    
    this.currentSelection = window.rangy.getSelection();
    this.showContextMenu(e.clientX, e.clientY);
  }

  handleMouseOver(e) {
    const highlightedElement = e.target.closest('.ylw-hglted');
    if (highlightedElement) {
      const rangeKey = this.getContextualRange(e.target);
      if (rangeKey && this.notes[rangeKey]) {
        // Show orange note icon
        let icon = highlightedElement.querySelector('.notesIcon');
        if (!icon) {
          icon = document.createElement('span');
          icon.className = 'notesIcon';
          highlightedElement.insertBefore(icon, highlightedElement.firstChild);
        }
        icon.style.display = 'block';
      }
    }
  }

  handleMouseLeave(e) {
    const highlightedElement = e.target.closest('.ylw-hglted');
    if (highlightedElement) {
      const icon = highlightedElement.querySelector('.notesIcon');
      if (icon) {
        icon.style.display = 'none';
      }
    }
  }

  showContextMenu(x, y) {
    // Remove existing menu
    const existingMenu = document.querySelector('.highlight-context-menu');
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement('div');
    menu.className = 'highlight-context-menu';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    const hasSelection = this.currentSelection && 
                        !this.currentSelection.isCollapsed && 
                        this.isValidSelection(this.currentSelection);
    const onHighlight = this.currentTarget && 
                       this.currentTarget.closest('.ylw-hglted');

    // Build menu items
    const items = [];

    if (hasSelection) {
      items.push({
        label: 'Highlight',
        icon: '🖍️',
        action: () => this.highlightSelection('highlight')
      });
      items.push({
        label: 'Notes',
        icon: '📝',
        action: () => this.highlightSelection('note')
      });
    }

    if (onHighlight) {
      if (hasSelection) {
        items.push({ separator: true });
      }
      items.push({
        label: 'Add/Edit Note',
        icon: '✏️',
        action: () => this.highlightSelection('note')
      });
      items.push({
        label: 'Clear',
        icon: '❌',
        action: () => this.clearHighlight()
      });
      items.push({ separator: true });
      items.push({
        label: 'Clear All',
        icon: '🗑️',
        action: () => this.clearAllHighlight()
      });
    }

    if (items.length === 0) return;

    // Render menu
    items.forEach(item => {
      if (item.separator) {
        const sep = document.createElement('div');
        sep.className = 'menu-separator';
        menu.appendChild(sep);
      } else {
        const btn = document.createElement('button');
        btn.className = 'menu-item';
        btn.innerHTML = `<span class="menu-icon">${item.icon}</span> ${item.label}`;
        btn.onclick = () => {
          item.action();
          menu.remove();
        };
        menu.appendChild(btn);
      }
    });

    document.body.appendChild(menu);

    // Close menu on outside click
    setTimeout(() => {
      document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target)) {
          menu.remove();
          document.removeEventListener('click', closeMenu);
        }
      });
    }, 0);
  }

  isValidSelection(selection) {
    const html = selection.toHtml();
    // Check if selection contains interactive elements
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const hasInteractive = tempDiv.querySelector('input, select, textarea, button');
    return !hasInteractive;
  }

  highlightSelection(action) {
    if (!this.cssApplier || !window.rangy) return;

    let range, rangeKey;
    const key = this.makeid();

    // Get range
    if (this.currentSelection.rangeCount === 0 || this.currentSelection.isCollapsed) {
      // Clicking on existing highlight
      rangeKey = this.getContextualRange(this.currentTarget);
      range = this.ranges[rangeKey];
    } else {
      // New selection
      range = this.currentSelection.getRangeAt(0);
    }

    if (!range) return;

    // Check for overlaps
    const rangeCheck = this.checkHighlightedRanges(range);

    if (rangeCheck) {
      // Update existing highlight
      if (rangeCheck.update) {
        this.cssApplier.applyToRange(range);
        this.ranges[rangeCheck.overlap] = range;
        this.checkRangesOrdering(rangeCheck.overlap);
      }

      // Handle note
      if (action === 'note') {
        const text = range.toString();
        if (this.notes[rangeCheck.overlap]) {
          this.notes[rangeCheck.overlap].show();
          if (rangeCheck.update) {
            this.notes[rangeCheck.overlap].updateHighlightText(text);
          }
        } else {
          this.notes[rangeCheck.overlap] = this.createNote(
            text,
            rangeCheck.overlap,
            { x: window.pageXOffset + 100, y: window.pageYOffset + 100 }
          );
        }
      }
    } else {
      // New highlight
      this.cssApplier.applyToRange(range);
      this.ranges[key] = range;
      this.rangesOrder.push(key);

      if (action === 'note') {
        const text = range.toString();
        this.notes[key] = this.createNote(
          text,
          key,
          { x: window.pageXOffset + 100, y: window.pageYOffset + 100 }
        );
      }
    }

    // Clear selection
    this.currentSelection.removeAllRanges();
  }

  checkHighlightedRanges(selRange) {
    for (let key in this.ranges) {
      if (this.ranges.hasOwnProperty(key)) {
        const crntRange = this.ranges[key];
        
        if (this.checkRangeOverlap(selRange, crntRange)) {
          const check = { overlap: key };
          
          const startInRange = crntRange.containsNodeContents(selRange.startContainer);
          const endInRange = crntRange.containsNodeContents(selRange.endContainer);
          
          if (!startInRange || !endInRange) {
            // Extend range
            if (startInRange) {
              selRange.setStart(crntRange.startContainer, crntRange.startOffset);
            }
            if (endInRange) {
              selRange.setEnd(crntRange.endContainer, crntRange.endOffset);
            }
            
            delete this.ranges[key];
            if (this.notes[key]) {
              this.notes[key].destroy();
              delete this.notes[key];
            }
            check.update = true;
          } else {
            check.update = false;
          }
          
          return check;
        }
      }
    }
    return false;
  }

  checkRangeOverlap(focalRange, testRange) {
    try {
      const extremetiesOK = focalRange.compareBoundaryPoints(Range.END_TO_START, testRange) === -1;
      const overlapAreaOK = focalRange.compareBoundaryPoints(Range.START_TO_END, testRange) === 1;
      return extremetiesOK && overlapAreaOK;
    } catch (e) {
      return false;
    }
  }

  checkRangesOrdering(key) {
    if (!this.rangesOrder.includes(key)) {
      this.rangesOrder.push(key);
    }
  }

  createNote(text, rangeKey, position) {
    const note = new NoteWidget({
      highlightText: this.options.noteHighlightText ? text : null,
      position: position,
      onClose: () => {
        note.hide();
      },
      onDestroy: () => {
        delete this.notes[rangeKey];
      }
    });
    note.id = ++this.highestId;
    note.zIndex = ++this.highestZ;
    return note;
  }

  getContextualRange(target) {
    const highlightedElement = target.closest('.ylw-hglted');
    if (!highlightedElement) return null;

    for (let key in this.ranges) {
      if (this.ranges.hasOwnProperty(key)) {
        const range = this.ranges[key];
        if (this.rangeIntersectsNode(range, highlightedElement)) {
          return key;
        }
      }
    }
    return null;
  }

  rangeIntersectsNode(range, node) {
    try {
      const nodeRange = window.rangy.createRange();
      nodeRange.selectNode(node);
      return range.intersectsRange(nodeRange);
    } catch (e) {
      return false;
    }
  }

  clearHighlight() {
    const rangeKey = this.getContextualRange(this.currentTarget);
    if (!rangeKey) return;

    const range = this.ranges[rangeKey];
    if (range) {
      this.cssApplier.undoToRange(range);
      
      if (this.notes[rangeKey]) {
        this.notes[rangeKey].destroy();
        delete this.notes[rangeKey];
      }
      
      delete this.ranges[rangeKey];
      const pos = this.rangesOrder.indexOf(rangeKey);
      if (pos > -1) {
        this.rangesOrder.splice(pos, 1);
      }
    }
  }

  clearAllHighlight() {
    for (let key in this.ranges) {
      if (this.ranges.hasOwnProperty(key)) {
        const range = this.ranges[key];
        this.cssApplier.undoToRange(range);
        
        if (this.notes[key]) {
          this.notes[key].destroy();
          delete this.notes[key];
        }
        
        delete this.ranges[key];
      }
    }
    this.rangesOrder = [];
  }

  // Save/restore for navigation
  saveRanges(screenId) {
    if (!screenId || !window.rangy) return;
    
    this.screenId = screenId;
    
    if (Object.keys(this.ranges).length > 0) {
      this.savedRanges[screenId] = {};
      
      // Serialize ranges
      for (let key in this.ranges) {
        if (this.ranges.hasOwnProperty(key)) {
          try {
            const serialized = window.rangy.serializeRange(
              this.ranges[key],
              false,
              this.container
            );
            this.savedRanges[screenId][key] = serialized;
          } catch (e) {
            console.error('Error serializing range:', e);
          }
        }
      }
      
      // Save note text
      for (let key in this.notes) {
        if (this.notes.hasOwnProperty(key)) {
          if (!this.savedNotes[screenId]) {
            this.savedNotes[screenId] = {};
          }
          this.savedNotes[screenId][key] = this.notes[key].getText();
        }
      }
    }
  }

  restoreRanges(screenId) {
    if (!screenId || !window.rangy) return;
    
    this.screenId = screenId;
    
    // Clear current
    this.ranges = {};
    this.rangesOrder = [];
    for (let key in this.notes) {
      this.notes[key].destroy();
    }
    this.notes = {};
    
    // Restore
    if (this.savedRanges[screenId]) {
      for (let key in this.savedRanges[screenId]) {
        if (this.savedRanges[screenId].hasOwnProperty(key)) {
          try {
            const range = window.rangy.deserializeRange(
              this.savedRanges[screenId][key],
              this.container
            );
            this.ranges[key] = range;
            this.rangesOrder.push(key);
            this.cssApplier.applyToRange(range);
            
            // Restore note if exists
            if (this.savedNotes[screenId] && this.savedNotes[screenId][key]) {
              const text = range.toString();
              const note = this.createNote(text, key, { x: 100, y: 100 });
              note.setText(this.savedNotes[screenId][key]);
              note.hide(); // Hidden by default
              this.notes[key] = note;
            }
          } catch (e) {
            console.error('Error deserializing range:', e);
          }
        }
      }
    }
  }

  makeid() {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  destroy() {
    this.clearAllHighlight();
    if (this.container) {
      this.container.removeEventListener('mouseup', this.handleMouseUp);
      this.container.removeEventListener('contextmenu', this.handleContextMenu);
      this.container.removeEventListener('mouseover', this.handleMouseOver);
      this.container.removeEventListener('mouseleave', this.handleMouseLeave);
    }
  }
}

// Note Widget Class
class NoteWidget {
  constructor(options = {}) {
    this.options = options;
    this.element = null;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.id = 0;
    this._zIndex = 1000;
    
    this.create();
  }

  create() {
    const note = document.createElement('div');
    note.className = 'note-widget';
    note.setAttribute('role', 'dialog');
    note.setAttribute('aria-label', 'Note');
    
    // Close button
    const closeBtn = document.createElement('div');
    closeBtn.className = 'note-close';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => this.hide();
    note.appendChild(closeBtn);
    
    // Drag handle
    const handle = document.createElement('div');
    handle.className = 'note-draghandle';
    handle.onmousedown = this.onMouseDown.bind(this);
    note.appendChild(handle);
    
    // Content area
    const content = document.createElement('div');
    content.className = 'note-content';
    
    // Highlighted text (optional)
    if (this.options.highlightText) {
      const highlightDiv = document.createElement('div');
      highlightDiv.className = 'note-highlight-text';
      highlightDiv.textContent = this.options.highlightText;
      content.appendChild(highlightDiv);
    }
    
    // Main text area
    const textarea = document.createElement('textarea');
    textarea.className = 'note-textarea';
    textarea.placeholder = 'Type your notes here...';
    textarea.setAttribute('aria-label', 'Note text');
    content.appendChild(textarea);
    
    note.appendChild(content);
    this.element = note;
    this.textarea = textarea;
    this.highlightTextElement = content.querySelector('.note-highlight-text');
    
    // Set position
    if (this.options.position) {
      note.style.left = this.options.position.x + 'px';
      note.style.top = this.options.position.y + 'px';
    }
    
    document.body.appendChild(note);
  }

  onMouseDown(e) {
    this.isDragging = true;
    this.startX = e.clientX - this.element.offsetLeft;
    this.startY = e.clientY - this.element.offsetTop;
    this.zIndex = Date.now(); // Bring to front
    
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    e.preventDefault();
  }

  onMouseMove = (e) => {
    if (!this.isDragging) return;
    this.element.style.left = (e.clientX - this.startX) + 'px';
    this.element.style.top = (e.clientY - this.startY) + 'px';
  }

  onMouseUp = () => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  show() {
    if (this.element) {
      this.element.style.display = 'block';
      this.textarea.focus();
    }
  }

  hide() {
    if (this.element) {
      this.element.style.display = 'none';
    }
    if (this.options.onClose) {
      this.options.onClose();
    }
  }

  getText() {
    return this.textarea ? this.textarea.value : '';
  }

  setText(text) {
    if (this.textarea) {
      this.textarea.value = text;
    }
  }

  updateHighlightText(text) {
    if (this.highlightTextElement) {
      this.highlightTextElement.textContent = text;
    }
  }

  set zIndex(z) {
    this._zIndex = z;
    if (this.element) {
      this.element.style.zIndex = z;
    }
  }

  get zIndex() {
    return this._zIndex;
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    if (this.options.onDestroy) {
      this.options.onDestroy();
    }
  }
}

export default HighlightManager;