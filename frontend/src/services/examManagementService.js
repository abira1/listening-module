/**
 * Exam Management Service
 * Handles exam creation, editing, scheduling, and management
 * Part of Phase 4, Task 4.1
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Creates a new exam
 */
export const createExam = async (examData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/exams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        ...examData,
        createdAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to create exam' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Create exam error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Updates an existing exam
 */
export const updateExam = async (examId, examData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        ...examData,
        updatedAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to update exam' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Update exam error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Deletes an exam
 */
export const deleteExam = async (examId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to delete exam' };
    }

    return { success: true, message: 'Exam deleted successfully' };
  } catch (error) {
    console.error('Delete exam error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Retrieves all exams
 */
export const getAllExams = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/exams?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to retrieve exams' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Get exams error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Retrieves a single exam
 */
export const getExam = async (examId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to retrieve exam' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Get exam error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Publishes an exam
 */
export const publishExam = async (examId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/exams/${examId}/publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to publish exam' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Publish exam error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Unpublishes an exam
 */
export const unpublishExam = async (examId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/exams/${examId}/unpublish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to unpublish exam' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Unpublish exam error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Duplicates an exam
 */
export const duplicateExam = async (examId, newTitle) => {
  try {
    const response = await fetch(`${API_BASE_URL}/exams/${examId}/duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ newTitle })
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to duplicate exam' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Duplicate exam error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Adds questions to an exam
 */
export const addQuestionsToExam = async (examId, questionIds) => {
  try {
    const response = await fetch(`${API_BASE_URL}/exams/${examId}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ questionIds })
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to add questions' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Add questions error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Removes questions from an exam
 */
export const removeQuestionsFromExam = async (examId, questionIds) => {
  try {
    const response = await fetch(`${API_BASE_URL}/exams/${examId}/questions`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ questionIds })
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to remove questions' };
    }

    return { success: true, message: 'Questions removed successfully' };
  } catch (error) {
    console.error('Remove questions error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Reorders questions in an exam
 */
export const reorderQuestions = async (examId, questionOrder) => {
  try {
    const response = await fetch(`${API_BASE_URL}/exams/${examId}/questions/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ questionOrder })
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to reorder questions' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Reorder questions error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Schedules an exam
 */
export const scheduleExam = async (examId, scheduleData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/exams/${examId}/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(scheduleData)
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to schedule exam' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Schedule exam error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Validates exam data
 */
export const validateExamData = (examData) => {
  const errors = [];

  if (!examData.title || examData.title.trim().length === 0) {
    errors.push('Exam title is required');
  }

  if (!examData.description || examData.description.trim().length === 0) {
    errors.push('Exam description is required');
  }

  if (!examData.duration || examData.duration <= 0) {
    errors.push('Exam duration must be greater than 0');
  }

  if (!examData.totalScore || examData.totalScore <= 0) {
    errors.push('Total score must be greater than 0');
  }

  if (!examData.passingScore || examData.passingScore < 0) {
    errors.push('Passing score must be 0 or greater');
  }

  if (examData.passingScore > examData.totalScore) {
    errors.push('Passing score cannot exceed total score');
  }

  if (!examData.questions || examData.questions.length === 0) {
    errors.push('Exam must have at least one question');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Generates exam statistics
 */
export const generateExamStatistics = async (examId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/exams/${examId}/statistics`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to generate statistics' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Generate statistics error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Exports exam data
 */
export const exportExamData = async (examId, format = 'json') => {
  try {
    const response = await fetch(`${API_BASE_URL}/exams/${examId}/export?format=${format}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to export exam' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Export exam error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Imports exam data
 */
export const importExamData = async (importData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/exams/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(importData)
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to import exam' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Import exam error:', error);
    return { success: false, error: error.message };
  }
};

export default {
  createExam,
  updateExam,
  deleteExam,
  getAllExams,
  getExam,
  publishExam,
  unpublishExam,
  duplicateExam,
  addQuestionsToExam,
  removeQuestionsFromExam,
  reorderQuestions,
  scheduleExam,
  validateExamData,
  generateExamStatistics,
  exportExamData,
  importExamData
};

