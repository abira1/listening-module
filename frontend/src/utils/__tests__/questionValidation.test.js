/**
 * Question Validation Framework Tests
 */

import {
  validateQuestion,
  validateAnswer,
  calculateScore,
  calculateTotalScore,
  getAnswerFormat
} from '../questionValidation';

describe('Question Validation Framework', () => {
  describe('validateQuestion', () => {
    test('should validate a valid MCQ single question', () => {
      const question = {
        id: 'q1',
        type: 'mcq_single',
        text: 'What is the answer?',
        options: [
          { id: 'a', text: 'Option A' },
          { id: 'b', text: 'Option B' }
        ],
        correctAnswer: 'a'
      };

      const result = validateQuestion(question);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('should reject question without id', () => {
      const question = {
        type: 'mcq_single',
        text: 'What is the answer?'
      };

      const result = validateQuestion(question);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing question id');
    });

    test('should reject question without type', () => {
      const question = {
        id: 'q1',
        text: 'What is the answer?'
      };

      const result = validateQuestion(question);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing question type');
    });

    test('should reject question with invalid type', () => {
      const question = {
        id: 'q1',
        type: 'invalid_type',
        text: 'What is the answer?'
      };

      const result = validateQuestion(question);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid type'))).toBe(true);
    });

    test('should reject MCQ without options', () => {
      const question = {
        id: 'q1',
        type: 'mcq_single',
        text: 'What is the answer?'
      };

      const result = validateQuestion(question);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('options'))).toBe(true);
    });

    test('should validate sentence completion question', () => {
      const question = {
        id: 'q1',
        type: 'sentence_completion',
        text: 'The meeting is on _______',
        wordList: ['Monday', 'Tuesday'],
        correctAnswer: 'Monday'
      };

      const result = validateQuestion(question);
      expect(result.valid).toBe(true);
    });

    test('should validate writing task question', () => {
      const question = {
        id: 'q1',
        type: 'writing_task1',
        prompt: 'Write a letter...',
        minWords: 150
      };

      const result = validateQuestion(question);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateAnswer', () => {
    test('should validate correct MCQ single answer', () => {
      const question = {
        type: 'mcq_single',
        correctAnswer: 'a'
      };

      expect(validateAnswer(question, 'a')).toBe(true);
      expect(validateAnswer(question, 'b')).toBe(false);
    });

    test('should validate correct MCQ multiple answer', () => {
      const question = {
        type: 'mcq_multiple',
        correctAnswers: ['a', 'c']
      };

      expect(validateAnswer(question, ['a', 'c'])).toBe(true);
      expect(validateAnswer(question, ['c', 'a'])).toBe(true); // Order doesn't matter
      expect(validateAnswer(question, ['a', 'b'])).toBe(false);
    });

    test('should validate true/false/not given answer', () => {
      const question = {
        type: 'true_false_ng',
        correctAnswer: 'True'
      };

      expect(validateAnswer(question, 'True')).toBe(true);
      expect(validateAnswer(question, 'False')).toBe(false);
    });

    test('should validate sentence completion answer (case insensitive)', () => {
      const question = {
        type: 'sentence_completion',
        correctAnswer: 'Monday'
      };

      expect(validateAnswer(question, 'Monday')).toBe(true);
      expect(validateAnswer(question, 'monday')).toBe(true);
      expect(validateAnswer(question, 'MONDAY')).toBe(true);
      expect(validateAnswer(question, 'Tuesday')).toBe(false);
    });

    test('should validate fill gaps answer', () => {
      const question = {
        type: 'fill_gaps',
        correctAnswer: ['education', 'success']
      };

      expect(validateAnswer(question, ['education', 'success'])).toBe(true);
      expect(validateAnswer(question, ['education', 'failure'])).toBe(false);
    });

    test('should return true for manual grading types', () => {
      const question = {
        type: 'writing_task1'
      };

      expect(validateAnswer(question, 'any answer')).toBe(true);
    });

    test('should return false for null/undefined answer', () => {
      const question = {
        type: 'mcq_single',
        correctAnswer: 'a'
      };

      expect(validateAnswer(question, null)).toBe(false);
      expect(validateAnswer(question, undefined)).toBe(false);
    });
  });

  describe('calculateScore', () => {
    test('should return points for correct answer', () => {
      const question = {
        type: 'mcq_single',
        correctAnswer: 'a',
        points: 1
      };

      expect(calculateScore(question, 'a')).toBe(1);
    });

    test('should return 0 for incorrect answer', () => {
      const question = {
        type: 'mcq_single',
        correctAnswer: 'a',
        points: 1
      };

      expect(calculateScore(question, 'b')).toBe(0);
    });

    test('should use default points of 1', () => {
      const question = {
        type: 'mcq_single',
        correctAnswer: 'a'
      };

      expect(calculateScore(question, 'a')).toBe(1);
    });

    test('should use custom points value', () => {
      const question = {
        type: 'mcq_single',
        correctAnswer: 'a',
        points: 5
      };

      expect(calculateScore(question, 'a')).toBe(5);
    });
  });

  describe('calculateTotalScore', () => {
    test('should calculate total score correctly', () => {
      const questions = [
        { id: 'q1', type: 'mcq_single', correctAnswer: 'a', points: 1 },
        { id: 'q2', type: 'mcq_single', correctAnswer: 'b', points: 1 },
        { id: 'q3', type: 'mcq_single', correctAnswer: 'c', points: 1 }
      ];

      const answers = {
        q1: 'a', // correct
        q2: 'x', // incorrect
        q3: 'c'  // correct
      };

      const result = calculateTotalScore(questions, answers);
      expect(result.totalScore).toBe(2);
      expect(result.maxScore).toBe(3);
      expect(result.percentage).toBe(66.66666666666666);
    });

    test('should handle missing answers', () => {
      const questions = [
        { id: 'q1', type: 'mcq_single', correctAnswer: 'a', points: 1 },
        { id: 'q2', type: 'mcq_single', correctAnswer: 'b', points: 1 }
      ];

      const answers = {
        q1: 'a' // only one answer
      };

      const result = calculateTotalScore(questions, answers);
      expect(result.totalScore).toBe(1);
      expect(result.maxScore).toBe(2);
    });

    test('should handle custom points', () => {
      const questions = [
        { id: 'q1', type: 'mcq_single', correctAnswer: 'a', points: 2 },
        { id: 'q2', type: 'mcq_single', correctAnswer: 'b', points: 3 }
      ];

      const answers = {
        q1: 'a',
        q2: 'b'
      };

      const result = calculateTotalScore(questions, answers);
      expect(result.totalScore).toBe(5);
      expect(result.maxScore).toBe(5);
      expect(result.percentage).toBe(100);
    });
  });

  describe('getAnswerFormat', () => {
    test('should return format for MCQ single', () => {
      const format = getAnswerFormat('mcq_single');
      expect(format).toContain('Single option ID');
    });

    test('should return format for MCQ multiple', () => {
      const format = getAnswerFormat('mcq_multiple');
      expect(format).toContain('Array');
    });

    test('should return format for writing task', () => {
      const format = getAnswerFormat('writing_task1');
      expect(format).toContain('Text');
    });

    test('should return unknown format for invalid type', () => {
      const format = getAnswerFormat('invalid_type');
      expect(format).toBe('Unknown format');
    });
  });
});

