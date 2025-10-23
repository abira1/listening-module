/**
 * HtmlQuestion Component
 * Renders pre-rendered HTML questions with answer extraction
 * 
 * Props:
 * - question: Object - Question data with html_content, answer_extraction, grading_rules
 * - answer: Any - Current answer value
 * - onChange: Function - Callback when answer changes
 * - questionNumber: Number - Question number for display
 * - readOnly: Boolean - Whether question is read-only
 */

import React, { useRef, useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

export function HtmlQuestion({ 
  question, 
  answer, 
  onChange, 
  questionNumber, 
  readOnly = false 
}) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current || !question.html_content) {
      return;
    }

    try {
      setError(null);

      // Sanitize HTML to prevent XSS
      const sanitized = DOMPurify.sanitize(question.html_content, {
        ALLOWED_TAGS: [
          'div', 'p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'input', 'label', 'textarea', 'select', 'option',
          'table', 'tr', 'td', 'th', 'tbody', 'thead',
          'ul', 'ol', 'li', 'br', 'strong', 'em', 'u', 'i', 'b',
          'style', 'img'
        ],
        ALLOWED_ATTR: [
          'class', 'id', 'name', 'type', 'value', 'placeholder',
          'disabled', 'checked', 'selected', 'rows', 'cols',
          'data-*', 'src', 'alt', 'width', 'height'
        ],
        ALLOW_DATA_ATTR: true
      });

      // Render HTML
      containerRef.current.innerHTML = sanitized;

      // Attach event listeners based on answer extraction rules
      if (question.answer_extraction && !readOnly) {
        attachEventListeners(containerRef.current, question.answer_extraction, onChange);
      }

      // Set current answer if exists
      if (answer !== undefined && answer !== null) {
        setAnswerInHtml(containerRef.current, question.answer_extraction, answer);
      }
    } catch (err) {
      console.error('Error rendering HTML question:', err);
      setError('Failed to render question');
    }
  }, [question, readOnly]);

  // Update answer when it changes externally
  useEffect(() => {
    if (answer !== undefined && answer !== null && containerRef.current) {
      setAnswerInHtml(containerRef.current, question.answer_extraction, answer);
    }
  }, [answer]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-300 rounded-lg p-4">
        <p className="text-red-700 font-medium">Error rendering question</p>
        <p className="text-sm text-red-600 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="html-question-container">
      <div 
        ref={containerRef}
        className="html-question-content"
        style={{
          opacity: readOnly ? 0.7 : 1,
          pointerEvents: readOnly ? 'none' : 'auto'
        }}
      />
    </div>
  );
}

/**
 * Attach event listeners to HTML elements for answer capture
 */
function attachEventListeners(container, extractionRules, onChange) {
  if (!extractionRules || !extractionRules.method) {
    return;
  }

  const { method, selector } = extractionRules;

  if (!selector) {
    console.warn('No selector provided for answer extraction');
    return;
  }

  try {
    const elements = container.querySelectorAll(selector);

    if (elements.length === 0) {
      console.warn(`No elements found with selector: ${selector}`);
      return;
    }

    elements.forEach(element => {
      // Attach change event for form elements
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
        element.addEventListener('change', () => {
          const value = extractAnswerValue(container, extractionRules);
          onChange(value);
        });

        // Also attach input event for real-time updates
        if (element.tagName === 'TEXTAREA' || element.type === 'text') {
          element.addEventListener('input', () => {
            const value = extractAnswerValue(container, extractionRules);
            onChange(value);
          });
        }
      }
    });
  } catch (err) {
    console.error('Error attaching event listeners:', err);
  }
}

/**
 * Extract answer value from HTML based on extraction rules
 */
function extractAnswerValue(container, extractionRules) {
  if (!extractionRules) {
    return null;
  }

  const { method, selector, value_extractor, multiple } = extractionRules;

  try {
    if (method === 'radio_button' || method === 'checkbox') {
      const elements = container.querySelectorAll(selector);
      
      if (multiple) {
        // Return array of values for checkboxes
        return Array.from(elements).map(el => extractValue(el, value_extractor));
      } else {
        // Return single value for radio buttons
        const element = container.querySelector(selector);
        return element ? extractValue(element, value_extractor) : null;
      }
    } else if (method === 'text_input' || method === 'textarea' || method === 'dropdown') {
      const element = container.querySelector(selector);
      return element ? extractValue(element, value_extractor) : null;
    } else if (method === 'custom_javascript') {
      // Execute custom extraction function
      // Note: This is a simplified version - in production, use a sandboxed environment
      console.warn('Custom JavaScript extraction not fully implemented');
      return null;
    }
  } catch (err) {
    console.error('Error extracting answer:', err);
    return null;
  }
}

/**
 * Extract value from a single element
 */
function extractValue(element, valueExtractor = 'value') {
  if (!element) return null;

  if (valueExtractor === 'value') {
    return element.value || element.textContent;
  } else if (valueExtractor === 'textContent') {
    return element.textContent;
  } else if (valueExtractor === 'checked') {
    return element.checked;
  } else if (valueExtractor.startsWith('data-')) {
    return element.getAttribute(valueExtractor);
  }

  return element.value || element.textContent;
}

/**
 * Set answer value in HTML elements
 */
function setAnswerInHtml(container, extractionRules, answer) {
  if (!extractionRules || !extractionRules.selector) {
    return;
  }

  const { selector, multiple } = extractionRules;

  try {
    if (multiple && Array.isArray(answer)) {
      // Set multiple values for checkboxes
      const elements = container.querySelectorAll(selector);
      elements.forEach(el => {
        el.checked = answer.includes(el.value);
      });
    } else {
      // Set single value
      const elements = container.querySelectorAll(selector);
      elements.forEach(el => {
        if (el.type === 'radio' || el.type === 'checkbox') {
          el.checked = el.value === answer;
        } else if (el.tagName === 'SELECT') {
          el.value = answer;
        } else if (el.tagName === 'TEXTAREA' || el.type === 'text') {
          el.value = answer;
        }
      });
    }
  } catch (err) {
    console.error('Error setting answer in HTML:', err);
  }
}

export default HtmlQuestion;

