/**
 * Answer Submission Service
 * Handles answer collection, auto-save, and submission
 * Part of Phase 3, Task 3.4
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Validates answer format based on question type
 */
export const validateAnswer = (answer, questionType) => {
  if (!answer) {
    return { valid: false, error: 'Answer is required' };
  }

  switch (questionType) {
    case 'multiple_choice':
      if (!answer.selected) {
        return { valid: false, error: 'Please select an option' };
      }
      return { valid: true };

    case 'multiple_select':
      if (!answer.selected || answer.selected.length === 0) {
        return { valid: false, error: 'Please select at least one option' };
      }
      return { valid: true };

    case 'short_answer':
    case 'essay':
      if (!answer.text || answer.text.trim().length === 0) {
        return { valid: false, error: 'Please enter an answer' };
      }
      return { valid: true };

    case 'matching':
      if (!answer.matching || Object.keys(answer.matching).length === 0) {
        return { valid: false, error: 'Please complete all matches' };
      }
      return { valid: true };

    case 'fill_blanks':
      if (!answer.blanks || answer.blanks.some(b => !b || b.trim().length === 0)) {
        return { valid: false, error: 'Please fill all blanks' };
      }
      return { valid: true };

    case 'ranking':
      if (!answer.ranking || Object.keys(answer.ranking).length === 0) {
        return { valid: false, error: 'Please rank all items' };
      }
      return { valid: true };

    case 'ordering':
      if (!answer.ordering || Object.keys(answer.ordering).length === 0) {
        return { valid: false, error: 'Please order all items' };
      }
      return { valid: true };

    default:
      return { valid: true };
  }
};

/**
 * Validates all answers in an exam
 */
export const validateAllAnswers = (answers, questions) => {
  const errors = [];
  const warnings = [];

  questions.forEach((question, index) => {
    const answer = answers[question.id];
    const validation = validateAnswer(answer, question.type);

    if (!validation.valid) {
      errors.push({
        questionId: question.id,
        questionNumber: index + 1,
        error: validation.error
      });
    }

    if (!answer) {
      warnings.push({
        questionId: question.id,
        questionNumber: index + 1,
        warning: 'Question not answered'
      });
    }
  });

  return { errors, warnings, isValid: errors.length === 0 };
};

/**
 * Auto-saves answers to local storage
 */
export const autoSaveAnswers = (examId, answers, metadata = {}) => {
  try {
    const saveData = {
      examId,
      answers,
      metadata,
      timestamp: new Date().toISOString(),
      version: 1
    };

    const key = `exam_${examId}_autosave`;
    localStorage.setItem(key, JSON.stringify(saveData));

    return { success: true, message: 'Answers auto-saved' };
  } catch (error) {
    console.error('Auto-save error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Retrieves auto-saved answers from local storage
 */
export const getAutoSavedAnswers = (examId) => {
  try {
    const key = `exam_${examId}_autosave`;
    const data = localStorage.getItem(key);

    if (!data) {
      return { success: false, error: 'No auto-saved data found' };
    }

    const saveData = JSON.parse(data);
    return { success: true, data: saveData };
  } catch (error) {
    console.error('Retrieve auto-save error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clears auto-saved answers
 */
export const clearAutoSavedAnswers = (examId) => {
  try {
    const key = `exam_${examId}_autosave`;
    localStorage.removeItem(key);
    return { success: true, message: 'Auto-saved data cleared' };
  } catch (error) {
    console.error('Clear auto-save error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Submits answers to the backend
 */
export const submitAnswers = async (examId, answers, metadata = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/exams/${examId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        examId,
        answers,
        metadata,
        submittedAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Submission failed' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Submission error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Saves exam progress without submitting
 */
export const saveExamProgress = async (examId, answers, progress = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/exams/${examId}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        examId,
        answers,
        progress,
        savedAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Save failed' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Save progress error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Retrieves exam progress
 */
export const getExamProgress = async (examId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/exams/${examId}/progress`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Retrieval failed' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Get progress error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Handles network errors and retries
 */
export const submitWithRetry = async (examId, answers, metadata = {}, maxRetries = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await submitAnswers(examId, answers, metadata);

      if (result.success) {
        return result;
      }

      lastError = result.error;

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    } catch (error) {
      lastError = error.message;
    }
  }

  return { success: false, error: `Submission failed after ${maxRetries} attempts: ${lastError}` };
};

/**
 * Collects all answers from exam state
 */
export const collectAnswers = (examState) => {
  const answers = {};

  Object.entries(examState).forEach(([questionId, answer]) => {
    if (answer && Object.keys(answer).length > 0) {
      answers[questionId] = answer;
    }
  });

  return answers;
};

/**
 * Generates submission summary
 */
export const generateSubmissionSummary = (answers, questions) => {
  const summary = {
    totalQuestions: questions.length,
    answeredQuestions: 0,
    unansweredQuestions: 0,
    answers: {}
  };

  questions.forEach(question => {
    if (answers[question.id]) {
      summary.answeredQuestions++;
      summary.answers[question.id] = answers[question.id];
    } else {
      summary.unansweredQuestions++;
    }
  });

  return summary;
};

/**
 * Validates submission before sending
 */
export const validateSubmission = (answers, questions, options = {}) => {
  const { requireAllAnswered = false } = options;

  const validation = validateAllAnswers(answers, questions);

  if (requireAllAnswered && validation.warnings.length > 0) {
    return {
      valid: false,
      error: 'All questions must be answered',
      warnings: validation.warnings
    };
  }

  return {
    valid: true,
    warnings: validation.warnings,
    errors: validation.errors
  };
};

/**
 * Formats answers for API submission
 */
export const formatAnswersForSubmission = (answers, questions) => {
  const formatted = [];

  questions.forEach(question => {
    const answer = answers[question.id];

    formatted.push({
      questionId: question.id,
      questionType: question.type,
      answer: answer || null,
      answered: !!answer,
      timestamp: new Date().toISOString()
    });
  });

  return formatted;
};

/**
 * Checks API availability
 */
export const checkAPIAvailability = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      timeout: 5000
    });

    return { available: response.ok };
  } catch (error) {
    return { available: false, error: error.message };
  }
};

/**
 * Handles offline submission
 */
export const handleOfflineSubmission = (examId, answers, metadata = {}) => {
  try {
    const offlineData = {
      examId,
      answers,
      metadata,
      submittedAt: new Date().toISOString(),
      offline: true
    };

    const key = `exam_${examId}_offline_submission`;
    localStorage.setItem(key, JSON.stringify(offlineData));

    return { success: true, message: 'Submission saved for later sync' };
  } catch (error) {
    console.error('Offline submission error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Syncs offline submissions when online
 */
export const syncOfflineSubmissions = async () => {
  try {
    const keys = Object.keys(localStorage).filter(k => k.includes('offline_submission'));
    const results = [];

    for (const key of keys) {
      const data = JSON.parse(localStorage.getItem(key));
      const result = await submitAnswers(data.examId, data.answers, data.metadata);

      if (result.success) {
        localStorage.removeItem(key);
        results.push({ examId: data.examId, success: true });
      } else {
        results.push({ examId: data.examId, success: false, error: result.error });
      }
    }

    return { success: true, results };
  } catch (error) {
    console.error('Sync error:', error);
    return { success: false, error: error.message };
  }
};

export default {
  validateAnswer,
  validateAllAnswers,
  autoSaveAnswers,
  getAutoSavedAnswers,
  clearAutoSavedAnswers,
  submitAnswers,
  saveExamProgress,
  getExamProgress,
  submitWithRetry,
  collectAnswers,
  generateSubmissionSummary,
  validateSubmission,
  formatAnswersForSubmission,
  checkAPIAvailability,
  handleOfflineSubmission,
  syncOfflineSubmissions
};

