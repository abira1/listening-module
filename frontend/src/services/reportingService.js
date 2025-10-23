/**
 * Reporting & Analytics Service
 * Handles report generation and analytics data
 * Part of Phase 4, Task 4.2
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Generates exam performance report
 */
export const generateExamReport = async (examId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/reports/exams/${examId}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to generate report' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Generate exam report error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generates student performance report
 */
export const generateStudentReport = async (studentId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/reports/students/${studentId}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to generate report' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Generate student report error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generates class performance report
 */
export const generateClassReport = async (classId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/reports/classes/${classId}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to generate report' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Generate class report error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generates analytics dashboard data
 */
export const generateAnalyticsDashboard = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/analytics/dashboard?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to generate dashboard' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Generate analytics dashboard error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Exports report to PDF
 */
export const exportReportToPDF = async (reportId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}/export/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to export report' };
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-${reportId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);

    return { success: true, message: 'Report exported successfully' };
  } catch (error) {
    console.error('Export report error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Exports report to CSV
 */
export const exportReportToCSV = async (reportId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}/export/csv`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to export report' };
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-${reportId}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    return { success: true, message: 'Report exported successfully' };
  } catch (error) {
    console.error('Export report error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets performance trends
 */
export const getPerformanceTrends = async (studentId, examId = null) => {
  try {
    let url = `${API_BASE_URL}/analytics/trends/${studentId}`;
    if (examId) {
      url += `?examId=${examId}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to get trends' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Get trends error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets question analytics
 */
export const getQuestionAnalytics = async (examId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/questions/${examId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to get analytics' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Get question analytics error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets section analytics
 */
export const getSectionAnalytics = async (examId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/sections/${examId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to get analytics' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Get section analytics error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Calculates performance statistics
 */
export const calculateStatistics = (scores) => {
  if (!scores || scores.length === 0) {
    return {
      mean: 0,
      median: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      q1: 0,
      q3: 0
    };
  }

  const sorted = [...scores].sort((a, b) => a - b);
  const n = sorted.length;

  // Mean
  const mean = sorted.reduce((a, b) => a + b, 0) / n;

  // Median
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];

  // Standard Deviation
  const variance = sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  // Min/Max
  const min = sorted[0];
  const max = sorted[n - 1];

  // Quartiles
  const q1Index = Math.floor(n / 4);
  const q3Index = Math.floor((3 * n) / 4);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];

  return {
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    min,
    max,
    q1,
    q3
  };
};

/**
 * Generates performance insights
 */
export const generateInsights = (reportData) => {
  const insights = [];

  if (!reportData) {
    return insights;
  }

  // Average score insight
  if (reportData.averageScore) {
    if (reportData.averageScore >= 80) {
      insights.push('Excellent overall performance');
    } else if (reportData.averageScore >= 60) {
      insights.push('Good overall performance');
    } else if (reportData.averageScore >= 40) {
      insights.push('Average performance - room for improvement');
    } else {
      insights.push('Below average performance - needs improvement');
    }
  }

  // Improvement trend
  if (reportData.previousScores && reportData.previousScores.length > 0) {
    const lastScore = reportData.previousScores[reportData.previousScores.length - 1];
    const currentScore = reportData.currentScore || reportData.averageScore;
    const improvement = currentScore - lastScore;

    if (improvement > 5) {
      insights.push(`Strong improvement of ${improvement.toFixed(1)} points`);
    } else if (improvement > 0) {
      insights.push(`Slight improvement of ${improvement.toFixed(1)} points`);
    } else if (improvement < -5) {
      insights.push(`Performance declined by ${Math.abs(improvement).toFixed(1)} points`);
    }
  }

  // Consistency insight
  if (reportData.statistics && reportData.statistics.stdDev) {
    if (reportData.statistics.stdDev < 5) {
      insights.push('Very consistent performance');
    } else if (reportData.statistics.stdDev < 10) {
      insights.push('Fairly consistent performance');
    } else {
      insights.push('Performance varies significantly');
    }
  }

  return insights;
};

export default {
  generateExamReport,
  generateStudentReport,
  generateClassReport,
  generateAnalyticsDashboard,
  exportReportToPDF,
  exportReportToCSV,
  getPerformanceTrends,
  getQuestionAnalytics,
  getSectionAnalytics,
  calculateStatistics,
  generateInsights
};

