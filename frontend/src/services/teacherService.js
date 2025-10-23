/**
 * Teacher Service
 * Handles teacher dashboard and grading operations
 * Part of Phase 4, Task 4.3
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Gets teacher dashboard data
 */
export const getTeacherDashboard = async (teacherId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers/${teacherId}/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('teacher_token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to load dashboard', data: null };
    }

    const result = await response.json();
    // Extract statistics from response
    const dashboardData = {
      totalStudents: result.statistics?.total_students || 0,
      totalExams: result.statistics?.total_exams || 0,
      gradedCount: result.statistics?.graded_submissions || 0,
      totalSubmissions: result.statistics?.pending_submissions + result.statistics?.graded_submissions || 0,
      averageScore: result.statistics?.average_score || 0,
      recentActivity: result.recent_activity || [],
      students: result.students || []
    };
    return { success: true, data: dashboardData };
  } catch (error) {
    console.error('Get teacher dashboard error:', error);
    return { success: false, error: error.message, data: null };
  }
};

/**
 * Gets students assigned to teacher
 */
export const getTeacherStudents = async (teacherId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/teachers/${teacherId}/students?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('teacher_token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to load students' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Get teacher students error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets student submissions for grading
 */
export const getStudentSubmissions = async (teacherId, studentId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/teachers/${teacherId}/students/${studentId}/submissions`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('teacher_token')}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to load submissions' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Get submissions error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets submission details for grading
 */
export const getSubmissionDetails = async (submissionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('teacher_token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to load submission' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Get submission details error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Grades a submission
 */
export const gradeSubmission = async (submissionId, gradeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/grade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('teacher_token')}`
      },
      body: JSON.stringify({
        ...gradeData,
        gradedAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to grade submission' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Grade submission error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Adds feedback to a submission
 */
export const addFeedback = async (submissionId, feedbackData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('teacher_token')}`
      },
      body: JSON.stringify({
        ...feedbackData,
        createdAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to add feedback' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Add feedback error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets feedback for a submission
 */
export const getSubmissionFeedback = async (submissionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/feedback`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('teacher_token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to load feedback' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Get feedback error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Publishes grades for a class
 */
export const publishGrades = async (classId, examId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}/exams/${examId}/publish-grades`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('teacher_token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to publish grades' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Publish grades error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets grading statistics
 */
export const getGradingStatistics = async (teacherId, examId = null) => {
  try {
    let url = `${API_BASE_URL}/teachers/${teacherId}/grading-stats`;
    if (examId) {
      url += `?examId=${examId}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('teacher_token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to load statistics' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Get grading statistics error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets pending submissions for grading
 */
export const getPendingSubmissions = async (teacherId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers/${teacherId}/pending-submissions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('teacher_token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to load submissions', data: [] };
    }

    const result = await response.json();
    // Extract submissions array from response
    const submissions = result.submissions || [];
    return { success: true, data: submissions };
  } catch (error) {
    console.error('Get pending submissions error:', error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Exports grades to CSV
 */
export const exportGradesToCSV = async (classId, examId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/classes/${classId}/exams/${examId}/export-grades`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to export grades' };
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grades-${classId}-${examId}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    return { success: true, message: 'Grades exported successfully' };
  } catch (error) {
    console.error('Export grades error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Validates grade data
 */
export const validateGradeData = (gradeData) => {
  const errors = [];

  if (gradeData.score === undefined || gradeData.score === null) {
    errors.push('Score is required');
  }

  if (gradeData.score < 0 || gradeData.score > 100) {
    errors.push('Score must be between 0 and 100');
  }

  if (!gradeData.feedback || gradeData.feedback.trim().length === 0) {
    errors.push('Feedback is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export default {
  getTeacherDashboard,
  getTeacherStudents,
  getStudentSubmissions,
  getSubmissionDetails,
  gradeSubmission,
  addFeedback,
  getSubmissionFeedback,
  publishGrades,
  getGradingStatistics,
  getPendingSubmissions,
  exportGradesToCSV,
  validateGradeData
};

