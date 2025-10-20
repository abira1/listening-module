/**
 * Question Validation Framework
 * Provides validation for questions, answers, and scoring
 */

import { isValidType, getTypeMetadata } from './typeDetection';

/**
 * Validate a question object
 * @param {Object} question - The question to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateQuestion(question) {
  const errors = [];

  // Check required fields
  if (!question) {
    errors.push('Question object is required');
    return { valid: false, errors };
  }

  if (!question.id) {
    errors.push('Missing question id');
  }

  if (!question.type) {
    errors.push('Missing question type');
  } else if (!isValidType(question.type)) {
    errors.push(`Invalid type: ${question.type}`);
  }

  if (!question.text && !question.prompt) {
    errors.push('Missing question text or prompt');
  }

  // Type-specific validation
  if (question.type) {
    const typeErrors = validateQuestionByType(question);
    errors.push(...typeErrors);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate question based on its type
 * @param {Object} question - The question to validate
 * @returns {string[]} - Array of error messages
 */
function validateQuestionByType(question) {
  const errors = [];
  const { type } = question;

  switch (type) {
    case 'mcq_single':
    case 'mcq_multiple':
      if (!question.options || !Array.isArray(question.options)) {
        errors.push(`${type}: options array is required`);
      } else if (question.options.length < 2) {
        errors.push(`${type}: requires at least 2 options`);
      }
      if (type === 'mcq_single' && !question.correctAnswer) {
        errors.push(`${type}: correctAnswer is required`);
      }
      if (type === 'mcq_multiple' && !question.correctAnswers) {
        errors.push(`${type}: correctAnswers array is required`);
      }
      break;

    case 'true_false_ng':
      if (!question.correctAnswer) {
        errors.push(`${type}: correctAnswer is required`);
      }
      break;

    case 'sentence_completion':
      if (!question.wordList || !Array.isArray(question.wordList)) {
        errors.push(`${type}: wordList array is required`);
      }
      if (!question.correctAnswer) {
        errors.push(`${type}: correctAnswer is required`);
      }
      break;

    case 'form_completion':
      if (!question.fields || !Array.isArray(question.fields)) {
        errors.push(`${type}: fields array is required`);
      }
      break;

    case 'table_completion':
      if (!question.table) {
        errors.push(`${type}: table object is required`);
      }
      break;

    case 'flowchart_completion':
      if (!question.boxes || !Array.isArray(question.boxes)) {
        errors.push(`${type}: boxes array is required`);
      }
      break;

    case 'fill_gaps':
    case 'fill_gaps_short':
      if (!question.gaps && !question.correctAnswer) {
        errors.push(`${type}: gaps array or correctAnswer is required`);
      }
      break;

    case 'matching':
      if (!question.leftItems || !Array.isArray(question.leftItems)) {
        errors.push(`${type}: leftItems array is required`);
      }
      if (!question.rightItems || !Array.isArray(question.rightItems)) {
        errors.push(`${type}: rightItems array is required`);
      }
      break;

    case 'map_labelling':
      if (!question.image) {
        errors.push(`${type}: image URL is required`);
      }
      if (!question.labels || !Array.isArray(question.labels)) {
        errors.push(`${type}: labels array is required`);
      }
      break;

    case 'matching_headings':
    case 'matching_features':
    case 'matching_endings':
      if (!question.items || !Array.isArray(question.items)) {
        errors.push(`${type}: items array is required`);
      }
      break;

    case 'note_completion':
      if (!question.notes || !Array.isArray(question.notes)) {
        errors.push(`${type}: notes array is required`);
      }
      break;

    case 'summary_completion':
      if (!question.summary) {
        errors.push(`${type}: summary text is required`);
      }
      if (!question.wordList || !Array.isArray(question.wordList)) {
        errors.push(`${type}: wordList array is required`);
      }
      break;

    case 'writing_task1':
    case 'writing_task2':
      if (!question.prompt) {
        errors.push(`${type}: prompt is required`);
      }
      if (!question.minWords) {
        errors.push(`${type}: minWords is required`);
      }
      break;

    default:
      break;
  }

  return errors;
}

/**
 * Validate an answer for a question
 * @param {Object} question - The question object
 * @param {*} answer - The user's answer
 * @returns {boolean} - True if answer is correct
 */
export function validateAnswer(question, answer) {
  if (!question || !answer) {
    return false;
  }

  const { type, correctAnswer, correctAnswers } = question;

  switch (type) {
    case 'mcq_single':
    case 'true_false_ng':
      return answer === correctAnswer;

    case 'mcq_multiple':
      if (!Array.isArray(answer) || !Array.isArray(correctAnswers)) {
        return false;
      }
      const sortedAnswer = [...answer].sort();
      const sortedCorrect = [...correctAnswers].sort();
      return JSON.stringify(sortedAnswer) === JSON.stringify(sortedCorrect);

    case 'sentence_completion':
    case 'fill_gaps_short':
      return answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();

    case 'fill_gaps':
      if (!Array.isArray(answer) || !Array.isArray(correctAnswer)) {
        return false;
      }
      return answer.every((a, i) => 
        a.toLowerCase().trim() === correctAnswer[i].toLowerCase().trim()
      );

    // For other types, return true (manual grading)
    default:
      return true;
  }
}

/**
 * Calculate score for a question
 * @param {Object} question - The question object
 * @param {*} answer - The user's answer
 * @returns {number} - The score (0 or points value)
 */
export function calculateScore(question, answer) {
  if (!question) {
    return 0;
  }

  const points = question.points || 1;

  if (validateAnswer(question, answer)) {
    return points;
  }

  return 0;
}

/**
 * Calculate total score for multiple questions
 * @param {Object[]} questions - Array of question objects
 * @param {Object} answers - Object mapping question IDs to answers
 * @returns {Object} - { totalScore: number, maxScore: number, percentage: number }
 */
export function calculateTotalScore(questions, answers) {
  let totalScore = 0;
  let maxScore = 0;

  questions.forEach(question => {
    const points = question.points || 1;
    maxScore += points;

    const answer = answers[question.id];
    if (answer !== undefined) {
      totalScore += calculateScore(question, answer);
    }
  });

  return {
    totalScore,
    maxScore,
    percentage: maxScore > 0 ? (totalScore / maxScore) * 100 : 0
  };
}

/**
 * Get answer format for a question type
 * @param {string} type - The question type
 * @returns {string} - Description of expected answer format
 */
export function getAnswerFormat(type) {
  const formats = {
    'mcq_single': 'Single option ID (string)',
    'mcq_multiple': 'Array of option IDs (string[])',
    'sentence_completion': 'Single word or phrase (string)',
    'form_completion': 'Object with field IDs as keys',
    'table_completion': 'Object with cell IDs as keys',
    'flowchart_completion': 'Object with box IDs as keys',
    'fill_gaps': 'Array of words/phrases (string[])',
    'fill_gaps_short': 'Single word or phrase (string)',
    'matching': 'Object mapping left items to right items',
    'map_labelling': 'Object mapping label IDs to text',
    'true_false_ng': 'One of: "True", "False", "Not Given"',
    'matching_headings': 'Object mapping paragraphs to headings',
    'matching_features': 'Object mapping items to features',
    'matching_endings': 'Object mapping beginnings to endings',
    'note_completion': 'Object with note IDs as keys',
    'summary_completion': 'Array of words (string[])',
    'writing_task1': 'Text content (string)',
    'writing_task2': 'Text content (string)'
  };

  return formats[type] || 'Unknown format';
}

