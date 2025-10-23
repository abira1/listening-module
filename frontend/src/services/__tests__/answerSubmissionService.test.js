/**
 * Tests for Answer Submission Service
 * Part of Phase 3, Task 3.4
 */

import * as answerService from '../answerSubmissionService';

describe('Answer Submission Service', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('validateAnswer', () => {
    test('validates multiple choice answer', () => {
      const answer = { selected: 'A' };
      const result = answerService.validateAnswer(answer, 'multiple_choice');
      expect(result.valid).toBe(true);
    });

    test('rejects empty multiple choice answer', () => {
      const answer = {};
      const result = answerService.validateAnswer(answer, 'multiple_choice');
      expect(result.valid).toBe(false);
    });

    test('validates multiple select answer', () => {
      const answer = { selected: ['A', 'B'] };
      const result = answerService.validateAnswer(answer, 'multiple_select');
      expect(result.valid).toBe(true);
    });

    test('rejects empty multiple select answer', () => {
      const answer = { selected: [] };
      const result = answerService.validateAnswer(answer, 'multiple_select');
      expect(result.valid).toBe(false);
    });

    test('validates short answer', () => {
      const answer = { text: 'My answer' };
      const result = answerService.validateAnswer(answer, 'short_answer');
      expect(result.valid).toBe(true);
    });

    test('rejects empty short answer', () => {
      const answer = { text: '' };
      const result = answerService.validateAnswer(answer, 'short_answer');
      expect(result.valid).toBe(false);
    });

    test('validates essay answer', () => {
      const answer = { text: 'Long essay text here' };
      const result = answerService.validateAnswer(answer, 'essay');
      expect(result.valid).toBe(true);
    });

    test('validates matching answer', () => {
      const answer = { matching: { L1: 'R1' } };
      const result = answerService.validateAnswer(answer, 'matching');
      expect(result.valid).toBe(true);
    });

    test('validates fill blanks answer', () => {
      const answer = { blanks: ['answer1', 'answer2'] };
      const result = answerService.validateAnswer(answer, 'fill_blanks');
      expect(result.valid).toBe(true);
    });

    test('validates ranking answer', () => {
      const answer = { ranking: { item1: 1, item2: 2 } };
      const result = answerService.validateAnswer(answer, 'ranking');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateAllAnswers', () => {
    test('validates all answers in exam', () => {
      const answers = {
        Q1: { selected: 'A' },
        Q2: { selected: 'B' }
      };
      const questions = [
        { id: 'Q1', type: 'multiple_choice' },
        { id: 'Q2', type: 'multiple_choice' }
      ];

      const result = answerService.validateAllAnswers(answers, questions);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('detects unanswered questions', () => {
      const answers = {
        Q1: { selected: 'A' }
      };
      const questions = [
        { id: 'Q1', type: 'multiple_choice' },
        { id: 'Q2', type: 'multiple_choice' }
      ];

      const result = answerService.validateAllAnswers(answers, questions);
      expect(result.warnings.length).toBe(1);
    });

    test('detects invalid answers', () => {
      const answers = {
        Q1: {}
      };
      const questions = [
        { id: 'Q1', type: 'multiple_choice' }
      ];

      const result = answerService.validateAllAnswers(answers, questions);
      expect(result.errors.length).toBe(1);
    });
  });

  describe('Auto-save functionality', () => {
    test('auto-saves answers to localStorage', () => {
      const examId = 'E001';
      const answers = { Q1: { selected: 'A' } };

      const result = answerService.autoSaveAnswers(examId, answers);
      expect(result.success).toBe(true);

      const saved = localStorage.getItem(`exam_${examId}_autosave`);
      expect(saved).toBeTruthy();
    });

    test('retrieves auto-saved answers', () => {
      const examId = 'E001';
      const answers = { Q1: { selected: 'A' } };

      answerService.autoSaveAnswers(examId, answers);
      const result = answerService.getAutoSavedAnswers(examId);

      expect(result.success).toBe(true);
      expect(result.data.answers).toEqual(answers);
    });

    test('returns error when no auto-saved data exists', () => {
      const result = answerService.getAutoSavedAnswers('E999');
      expect(result.success).toBe(false);
    });

    test('clears auto-saved answers', () => {
      const examId = 'E001';
      const answers = { Q1: { selected: 'A' } };

      answerService.autoSaveAnswers(examId, answers);
      answerService.clearAutoSavedAnswers(examId);

      const result = answerService.getAutoSavedAnswers(examId);
      expect(result.success).toBe(false);
    });
  });

  describe('collectAnswers', () => {
    test('collects all answers from exam state', () => {
      const examState = {
        Q1: { selected: 'A' },
        Q2: { selected: 'B' },
        Q3: {}
      };

      const result = answerService.collectAnswers(examState);
      expect(Object.keys(result).length).toBe(2);
      expect(result.Q1).toEqual({ selected: 'A' });
    });

    test('handles empty exam state', () => {
      const result = answerService.collectAnswers({});
      expect(Object.keys(result).length).toBe(0);
    });
  });

  describe('generateSubmissionSummary', () => {
    test('generates correct submission summary', () => {
      const answers = {
        Q1: { selected: 'A' },
        Q2: { selected: 'B' }
      };
      const questions = [
        { id: 'Q1', type: 'multiple_choice' },
        { id: 'Q2', type: 'multiple_choice' },
        { id: 'Q3', type: 'multiple_choice' }
      ];

      const result = answerService.generateSubmissionSummary(answers, questions);
      expect(result.totalQuestions).toBe(3);
      expect(result.answeredQuestions).toBe(2);
      expect(result.unansweredQuestions).toBe(1);
    });
  });

  describe('validateSubmission', () => {
    test('validates submission with warnings', () => {
      const answers = {
        Q1: { selected: 'A' }
      };
      const questions = [
        { id: 'Q1', type: 'multiple_choice' },
        { id: 'Q2', type: 'multiple_choice' }
      ];

      const result = answerService.validateSubmission(answers, questions);
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBe(1);
    });

    test('rejects submission when all answers required', () => {
      const answers = {
        Q1: { selected: 'A' }
      };
      const questions = [
        { id: 'Q1', type: 'multiple_choice' },
        { id: 'Q2', type: 'multiple_choice' }
      ];

      const result = answerService.validateSubmission(answers, questions, {
        requireAllAnswered: true
      });
      expect(result.valid).toBe(false);
    });
  });

  describe('formatAnswersForSubmission', () => {
    test('formats answers correctly for API', () => {
      const answers = {
        Q1: { selected: 'A' }
      };
      const questions = [
        { id: 'Q1', type: 'multiple_choice' }
      ];

      const result = answerService.formatAnswersForSubmission(answers, questions);
      expect(result.length).toBe(1);
      expect(result[0].questionId).toBe('Q1');
      expect(result[0].answered).toBe(true);
    });

    test('includes unanswered questions in formatted output', () => {
      const answers = {};
      const questions = [
        { id: 'Q1', type: 'multiple_choice' }
      ];

      const result = answerService.formatAnswersForSubmission(answers, questions);
      expect(result[0].answered).toBe(false);
      expect(result[0].answer).toBeNull();
    });
  });

  describe('Offline functionality', () => {
    test('saves submission for offline mode', () => {
      const examId = 'E001';
      const answers = { Q1: { selected: 'A' } };

      const result = answerService.handleOfflineSubmission(examId, answers);
      expect(result.success).toBe(true);

      const saved = localStorage.getItem(`exam_${examId}_offline_submission`);
      expect(saved).toBeTruthy();
    });

    test('marks offline submission correctly', () => {
      const examId = 'E001';
      const answers = { Q1: { selected: 'A' } };

      answerService.handleOfflineSubmission(examId, answers);
      const saved = JSON.parse(localStorage.getItem(`exam_${examId}_offline_submission`));

      expect(saved.offline).toBe(true);
    });
  });

  describe('API submission', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      global.fetch.mockRestore();
    });

    test('submits answers successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, submissionId: 'S001' })
      });

      const result = await answerService.submitAnswers('E001', { Q1: { selected: 'A' } });
      expect(result.success).toBe(true);
    });

    test('handles submission error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Submission failed' })
      });

      const result = await answerService.submitAnswers('E001', { Q1: { selected: 'A' } });
      expect(result.success).toBe(false);
    });

    test('handles network error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await answerService.submitAnswers('E001', { Q1: { selected: 'A' } });
      expect(result.success).toBe(false);
    });

    test('retries submission on failure', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: 'Error' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

      const result = await answerService.submitWithRetry('E001', { Q1: { selected: 'A' } }, {}, 2);
      expect(result.success).toBe(true);
    });
  });

  describe('Progress saving', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      global.fetch.mockRestore();
    });

    test('saves exam progress', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const result = await answerService.saveExamProgress('E001', { Q1: { selected: 'A' } });
      expect(result.success).toBe(true);
    });

    test('retrieves exam progress', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ answers: { Q1: { selected: 'A' } } })
      });

      const result = await answerService.getExamProgress('E001');
      expect(result.success).toBe(true);
    });
  });

  describe('API availability', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      global.fetch.mockRestore();
    });

    test('checks API availability', async () => {
      global.fetch.mockResolvedValueOnce({ ok: true });

      const result = await answerService.checkAPIAvailability();
      expect(result.available).toBe(true);
    });

    test('detects API unavailability', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await answerService.checkAPIAvailability();
      expect(result.available).toBe(false);
    });
  });
});

