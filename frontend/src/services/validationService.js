/**
 * Validation Service
 * Handles communication with backend validation API
 * Part of Phase 1, Task 1.5
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Detect question type using AI-powered detection
 * @param {Object} questionData - Question data to analyze
 * @param {string} questionId - Optional question ID for tracking
 * @returns {Promise<Object>} Detection result with type and confidence
 */
export const detectQuestionType = async (questionData, questionId = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/questions/detect-type`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question_data: questionData,
        question_id: questionId
      })
    });

    if (!response.ok) {
      throw new Error(`Detection failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error detecting question type:', error);
    throw error;
  }
};

/**
 * Validate question using 4-layer validation system
 * @param {Object} questionData - Question data to validate
 * @param {string} questionType - Question type (auto-detected if not provided)
 * @param {string} questionId - Optional question ID for tracking
 * @param {string} assetPath - Optional path to assets directory
 * @returns {Promise<Object>} Validation result with errors and warnings
 */
export const validateQuestion = async (
  questionData,
  questionType = null,
  questionId = null,
  assetPath = null
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/questions/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question_data: questionData,
        question_type: questionType,
        question_id: questionId,
        asset_path: assetPath
      })
    });

    if (!response.ok) {
      throw new Error(`Validation failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error validating question:', error);
    throw error;
  }
};

/**
 * Get validation report for questions
 * @param {string} questionId - Optional question ID to filter by
 * @returns {Promise<Object>} Validation report with summary and details
 */
export const getValidationReport = async (questionId = null) => {
  try {
    let url = `${API_BASE_URL}/questions/validation-report`;
    if (questionId) {
      url += `?question_id=${encodeURIComponent(questionId)}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get report: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting validation report:', error);
    throw error;
  }
};

/**
 * Export validation report in specified format
 * @param {string} questionId - Question ID to export
 * @param {string} format - Export format: 'json' or 'text'
 * @returns {Promise<Object>} Exported report
 */
export const exportValidationReport = async (questionId, format = 'json') => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/questions/export-report?question_id=${encodeURIComponent(questionId)}&format=${format}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to export report: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error exporting validation report:', error);
    throw error;
  }
};

/**
 * Detect and validate question in one call
 * @param {Object} questionData - Question data to analyze
 * @param {string} questionId - Optional question ID for tracking
 * @param {string} assetPath - Optional path to assets directory
 * @returns {Promise<Object>} Combined detection and validation result
 */
export const detectAndValidateQuestion = async (
  questionData,
  questionId = null,
  assetPath = null
) => {
  try {
    // First detect the type
    const detectionResult = await detectQuestionType(questionData, questionId);

    // Then validate with detected type
    const validationResult = await validateQuestion(
      questionData,
      detectionResult.detected_type,
      questionId,
      assetPath
    );

    return {
      detection: detectionResult,
      validation: validationResult,
      success: true
    };
  } catch (error) {
    console.error('Error in detect and validate:', error);
    return {
      detection: null,
      validation: null,
      success: false,
      error: error.message
    };
  }
};

/**
 * Batch validate multiple questions
 * @param {Array<Object>} questions - Array of question objects with data and optional type
 * @returns {Promise<Array<Object>>} Array of validation results
 */
export const batchValidateQuestions = async (questions) => {
  try {
    const results = await Promise.all(
      questions.map(q =>
        validateQuestion(
          q.data,
          q.type || null,
          q.id || null,
          q.assetPath || null
        ).catch(error => ({
          error: error.message,
          question_id: q.id
        }))
      )
    );

    return results;
  } catch (error) {
    console.error('Error in batch validation:', error);
    throw error;
  }
};

/**
 * Get validation statistics
 * @returns {Promise<Object>} Statistics about all validations
 */
export const getValidationStats = async () => {
  try {
    const report = await getValidationReport();
    return {
      total_questions: report.total_questions || 0,
      valid_count: report.valid_count || 0,
      invalid_count: report.invalid_count || 0,
      deployment_ready_count: report.deployment_ready_count || 0,
      critical_errors: report.critical_errors || 0,
      high_errors: report.high_errors || 0,
      medium_warnings: report.medium_warnings || 0,
      low_warnings: report.low_warnings || 0
    };
  } catch (error) {
    console.error('Error getting validation stats:', error);
    throw error;
  }
};

/**
 * Check if API is available
 * @returns {Promise<boolean>} True if API is available
 */
export const checkAPIAvailability = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/questions/validation-report`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.ok;
  } catch (error) {
    console.error('API not available:', error);
    return false;
  }
};

export default {
  detectQuestionType,
  validateQuestion,
  getValidationReport,
  exportValidationReport,
  detectAndValidateQuestion,
  batchValidateQuestions,
  getValidationStats,
  checkAPIAvailability
};

