/**
 * Tests for Exam Management Service
 * Part of Phase 4, Task 4.1
 */

import * as examService from '../examManagementService';

describe('Exam Management Service', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    global.fetch.mockRestore();
    localStorage.clear();
  });

  describe('createExam', () => {
    test('creates exam successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'E001', title: 'Test Exam' })
      });

      const examData = { title: 'Test Exam', duration: 180 };
      const result = await examService.createExam(examData);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('E001');
    });

    test('handles creation error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Creation failed' })
      });

      const result = await examService.createExam({});
      expect(result.success).toBe(false);
    });

    test('handles network error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await examService.createExam({});
      expect(result.success).toBe(false);
    });
  });

  describe('updateExam', () => {
    test('updates exam successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'E001', title: 'Updated Exam' })
      });

      const result = await examService.updateExam('E001', { title: 'Updated Exam' });
      expect(result.success).toBe(true);
    });

    test('handles update error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Update failed' })
      });

      const result = await examService.updateExam('E001', {});
      expect(result.success).toBe(false);
    });
  });

  describe('deleteExam', () => {
    test('deletes exam successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      const result = await examService.deleteExam('E001');
      expect(result.success).toBe(true);
    });

    test('handles delete error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Delete failed' })
      });

      const result = await examService.deleteExam('E001');
      expect(result.success).toBe(false);
    });
  });

  describe('getAllExams', () => {
    test('retrieves all exams', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([{ id: 'E001' }, { id: 'E002' }])
      });

      const result = await examService.getAllExams();
      expect(result.success).toBe(true);
      expect(result.data.length).toBe(2);
    });

    test('retrieves exams with filters', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([{ id: 'E001' }])
      });

      const result = await examService.getAllExams({ status: 'published' });
      expect(result.success).toBe(true);
    });
  });

  describe('getExam', () => {
    test('retrieves single exam', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'E001', title: 'Test Exam' })
      });

      const result = await examService.getExam('E001');
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('E001');
    });

    test('handles retrieval error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Not found' })
      });

      const result = await examService.getExam('E999');
      expect(result.success).toBe(false);
    });
  });

  describe('publishExam', () => {
    test('publishes exam successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'E001', status: 'published' })
      });

      const result = await examService.publishExam('E001');
      expect(result.success).toBe(true);
    });

    test('handles publish error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Publish failed' })
      });

      const result = await examService.publishExam('E001');
      expect(result.success).toBe(false);
    });
  });

  describe('unpublishExam', () => {
    test('unpublishes exam successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'E001', status: 'draft' })
      });

      const result = await examService.unpublishExam('E001');
      expect(result.success).toBe(true);
    });
  });

  describe('duplicateExam', () => {
    test('duplicates exam successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'E002', title: 'Test Exam (Copy)' })
      });

      const result = await examService.duplicateExam('E001', 'Test Exam (Copy)');
      expect(result.success).toBe(true);
    });
  });

  describe('addQuestionsToExam', () => {
    test('adds questions successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ questionsAdded: 3 })
      });

      const result = await examService.addQuestionsToExam('E001', ['Q1', 'Q2', 'Q3']);
      expect(result.success).toBe(true);
    });

    test('handles add error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Add failed' })
      });

      const result = await examService.addQuestionsToExam('E001', []);
      expect(result.success).toBe(false);
    });
  });

  describe('removeQuestionsFromExam', () => {
    test('removes questions successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      const result = await examService.removeQuestionsFromExam('E001', ['Q1']);
      expect(result.success).toBe(true);
    });
  });

  describe('reorderQuestions', () => {
    test('reorders questions successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ reordered: true })
      });

      const result = await examService.reorderQuestions('E001', ['Q2', 'Q1', 'Q3']);
      expect(result.success).toBe(true);
    });
  });

  describe('scheduleExam', () => {
    test('schedules exam successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ scheduled: true })
      });

      const scheduleData = {
        startDate: '2025-10-25',
        endDate: '2025-10-26'
      };

      const result = await examService.scheduleExam('E001', scheduleData);
      expect(result.success).toBe(true);
    });
  });

  describe('validateExamData', () => {
    test('validates correct exam data', () => {
      const examData = {
        title: 'Test Exam',
        description: 'Test Description',
        duration: 180,
        totalScore: 100,
        passingScore: 60,
        questions: [{ id: 'Q1' }]
      };

      const result = examService.validateExamData(examData);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('detects missing title', () => {
      const examData = {
        description: 'Test',
        duration: 180,
        totalScore: 100,
        passingScore: 60,
        questions: [{ id: 'Q1' }]
      };

      const result = examService.validateExamData(examData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Exam title is required');
    });

    test('detects invalid duration', () => {
      const examData = {
        title: 'Test',
        description: 'Test',
        duration: 0,
        totalScore: 100,
        passingScore: 60,
        questions: [{ id: 'Q1' }]
      };

      const result = examService.validateExamData(examData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Exam duration must be greater than 0');
    });

    test('detects passing score exceeding total score', () => {
      const examData = {
        title: 'Test',
        description: 'Test',
        duration: 180,
        totalScore: 100,
        passingScore: 150,
        questions: [{ id: 'Q1' }]
      };

      const result = examService.validateExamData(examData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Passing score cannot exceed total score');
    });

    test('detects missing questions', () => {
      const examData = {
        title: 'Test',
        description: 'Test',
        duration: 180,
        totalScore: 100,
        passingScore: 60,
        questions: []
      };

      const result = examService.validateExamData(examData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Exam must have at least one question');
    });
  });

  describe('generateExamStatistics', () => {
    test('generates statistics successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ averageScore: 75, totalAttempts: 10 })
      });

      const result = await examService.generateExamStatistics('E001');
      expect(result.success).toBe(true);
    });
  });

  describe('exportExamData', () => {
    test('exports exam data successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'E001', title: 'Test' })
      });

      const result = await examService.exportExamData('E001', 'json');
      expect(result.success).toBe(true);
    });

    test('exports with different formats', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      const result = await examService.exportExamData('E001', 'csv');
      expect(result.success).toBe(true);
    });
  });

  describe('importExamData', () => {
    test('imports exam data successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'E001' })
      });

      const importData = { title: 'Imported Exam' };
      const result = await examService.importExamData(importData);
      expect(result.success).toBe(true);
    });

    test('handles import error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Import failed' })
      });

      const result = await examService.importExamData({});
      expect(result.success).toBe(false);
    });
  });
});

