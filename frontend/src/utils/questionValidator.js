/**
 * Question Validation Utilities
 * Validates question structure and payload before rendering
 */

/**
 * Validate question structure
 * @param {Object} question - Question object to validate
 * @returns {Object} { isValid: boolean, errors: string[], warnings: string[] }
 */
export const validateQuestion = (question) => {
  const errors = [];
  const warnings = [];

  // Check basic structure
  if (!question) {
    errors.push('Question object is null or undefined');
    return { isValid: false, errors, warnings };
  }

  if (!question.id) {
    errors.push('Question missing required field: id');
  }

  if (!question.type) {
    errors.push('Question missing required field: type');
  }

  if (!question.payload) {
    errors.push('Question missing required field: payload');
    return { isValid: errors.length === 0, errors, warnings };
  }

  // Validate payload structure based on type
  const payloadErrors = validatePayload(question.type, question.payload);
  errors.push(...payloadErrors.errors);
  warnings.push(...payloadErrors.warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate payload structure based on question type
 * @param {string} type - Question type
 * @param {Object} payload - Payload object
 * @returns {Object} { errors: string[], warnings: string[] }
 */
export const validatePayload = (type, payload) => {
  const errors = [];
  const warnings = [];

  if (!payload) {
    errors.push('Payload is null or undefined');
    return { errors, warnings };
  }

  // Check for prompt (required for most types)
  if (!payload.prompt && type !== 'writing_task') {
    warnings.push('Payload missing field: prompt');
  }

  // Type-specific validation
  switch (type) {
    case 'short_answer':
    case 'diagram_labeling':
      if (!payload.answer_key) {
        warnings.push('Payload missing field: answer_key');
      }
      if (payload.max_words && typeof payload.max_words !== 'number') {
        warnings.push('Payload field max_words is not a number');
      }
      break;

    case 'multiple_choice':
    case 'map_labeling':
      if (!payload.answer_key) {
        warnings.push('Payload missing field: answer_key');
      }
      if (!Array.isArray(payload.options)) {
        errors.push('Payload field options is not an array');
      } else if (payload.options.length === 0) {
        errors.push('Payload field options is empty');
      }
      break;

    case 'flow_chart_completion':
      if (!payload.answer_key) {
        warnings.push('Payload missing field: answer_key');
      }
      if (payload.max_words && typeof payload.max_words !== 'number') {
        warnings.push('Payload field max_words is not a number');
      }
      break;

    case 'matching_draggable':
      if (!Array.isArray(payload.questions)) {
        errors.push('Payload field questions is not an array');
      } else if (payload.questions.length === 0) {
        errors.push('Payload field questions is empty');
      }
      if (!Array.isArray(payload.options)) {
        errors.push('Payload field options is not an array');
      } else if (payload.options.length === 0) {
        errors.push('Payload field options is empty');
      }
      break;

    case 'matching':
      if (!Array.isArray(payload.options)) {
        errors.push('Payload field options is not an array');
      } else if (payload.options.length === 0) {
        errors.push('Payload field options is empty');
      }
      break;

    case 'form_completion':
    case 'table_completion':
    case 'note_completion':
    case 'summary_completion':
      // These types have complex structures, just check for basic fields
      if (!payload.answer_key) {
        warnings.push('Payload missing field: answer_key');
      }
      break;

    case 'writing_task':
      if (payload.max_words && typeof payload.max_words !== 'number') {
        warnings.push('Payload field max_words is not a number');
      }
      break;

    default:
      warnings.push(`Unknown question type: ${type}`);
  }

  return { errors, warnings };
};

/**
 * Get safe payload value with fallback
 * @param {Object} payload - Payload object
 * @param {string} field - Field name
 * @param {*} defaultValue - Default value if field is missing
 * @returns {*} Field value or default
 */
export const getSafePayloadValue = (payload, field, defaultValue = '') => {
  if (!payload || typeof payload !== 'object') {
    return defaultValue;
  }
  return payload[field] !== undefined ? payload[field] : defaultValue;
};

/**
 * Get safe array from payload
 * @param {Object} payload - Payload object
 * @param {string} field - Field name
 * @returns {Array} Array or empty array
 */
export const getSafeArray = (payload, field) => {
  if (!payload || typeof payload !== 'object') {
    return [];
  }
  const value = payload[field];
  return Array.isArray(value) ? value : [];
};

/**
 * Log question rendering info
 * @param {Object} question - Question object
 * @param {string} action - Action being performed
 */
export const logQuestionRender = (question, action = 'render') => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Question ${action}]`, {
      id: question?.id,
      type: question?.type,
      index: question?.index,
      payloadKeys: question?.payload ? Object.keys(question.payload) : [],
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Log question error
 * @param {Object} question - Question object
 * @param {Error} error - Error object
 * @param {string} context - Context of error
 */
export const logQuestionError = (question, error, context = 'unknown') => {
  console.error(`[Question Error - ${context}]`, {
    id: question?.id,
    type: question?.type,
    error: error?.message || error?.toString(),
    stack: error?.stack,
    payload: question?.payload,
    timestamp: new Date().toISOString()
  });
};

/**
 * Create fallback question renderer
 * @param {Object} question - Question object
 * @param {string} errorMessage - Error message
 * @returns {JSX.Element} Fallback UI
 */
export const createFallbackRenderer = (question, errorMessage) => {
  return (
    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-800 mb-1">
            Question Not Fully Supported
          </h3>
          <p className="text-sm text-yellow-700 mb-2">
            {errorMessage}
          </p>
          <div className="text-xs text-yellow-600 bg-yellow-100 p-2 rounded mt-2">
            <p><strong>Question ID:</strong> {question?.id}</p>
            <p><strong>Type:</strong> {question?.type}</p>
            <p><strong>Prompt:</strong> {question?.payload?.prompt || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default {
  validateQuestion,
  validatePayload,
  getSafePayloadValue,
  getSafeArray,
  logQuestionRender,
  logQuestionError,
  createFallbackRenderer
};

