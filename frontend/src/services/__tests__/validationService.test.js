/**
 * Tests for Validation Service
 * Part of Phase 1, Task 1.5
 */

import * as validationService from '../validationService';

// Mock fetch
global.fetch = jest.fn();

describe('Validation Service', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  const mockQuestionData = {
    prompt: 'Which is correct?',
    options: [
      { text: 'A', value: 'A' },
      { text: 'B', value: 'B' }
    ],
    answer_key: 'A'
  };

  const mockDetectionResult = {
    question_id: 'Q001',
    detected_type: 'reading_multiple_choice_single',
    confidence: 0.92,
    confidence_level: 'HIGH'
  };

  const mockValidationResult = {
    question_id: 'Q001',
    is_valid: true,
    detected_type: 'reading_multiple_choice_single',
    errors: [],
    warnings: [],
    summary: {
      critical_count: 0,
      high_count: 0,
      medium_count: 0,
      low_count: 0,
      total_errors: 0,
      total_warnings: 0
    },
    deployment_ready: true
  };

  describe('detectQuestionType', () => {
    test('successfully detects question type', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDetectionResult
      });

      const result = await validationService.detectQuestionType(mockQuestionData, 'Q001');

      expect(result).toEqual(mockDetectionResult);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/questions/detect-type'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    test('handles detection error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request'
      });

      await expect(validationService.detectQuestionType(mockQuestionData)).rejects.toThrow();
    });

    test('handles network error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(validationService.detectQuestionType(mockQuestionData)).rejects.toThrow();
    });
  });

  describe('validateQuestion', () => {
    test('successfully validates question', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidationResult
      });

      const result = await validationService.validateQuestion(
        mockQuestionData,
        'reading_multiple_choice_single',
        'Q001'
      );

      expect(result).toEqual(mockValidationResult);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/questions/validate'),
        expect.objectContaining({
          method: 'POST'
        })
      );
    });

    test('validates without question type (auto-detect)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidationResult
      });

      const result = await validationService.validateQuestion(mockQuestionData);

      expect(result).toEqual(mockValidationResult);
    });

    test('handles validation error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error'
      });

      await expect(validationService.validateQuestion(mockQuestionData)).rejects.toThrow();
    });
  });

  describe('getValidationReport', () => {
    test('gets validation report for all questions', async () => {
      const mockReport = {
        total_questions: 5,
        valid_count: 4,
        invalid_count: 1,
        deployment_ready_count: 4
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReport
      });

      const result = await validationService.getValidationReport();

      expect(result).toEqual(mockReport);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/questions/validation-report'),
        expect.any(Object)
      );
    });

    test('gets validation report for specific question', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidationResult
      });

      const result = await validationService.getValidationReport('Q001');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('question_id=Q001'),
        expect.any(Object)
      );
    });

    test('handles report retrieval error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      });

      await expect(validationService.getValidationReport()).rejects.toThrow();
    });
  });

  describe('exportValidationReport', () => {
    test('exports report as JSON', async () => {
      const mockExport = {
        report: JSON.stringify(mockValidationResult)
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockExport
      });

      const result = await validationService.exportValidationReport('Q001', 'json');

      expect(result).toEqual(mockExport);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('format=json'),
        expect.any(Object)
      );
    });

    test('exports report as text', async () => {
      const mockExport = {
        report: 'Validation Report...'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockExport
      });

      const result = await validationService.exportValidationReport('Q001', 'text');

      expect(result).toEqual(mockExport);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('format=text'),
        expect.any(Object)
      );
    });

    test('handles export error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Server Error'
      });

      await expect(validationService.exportValidationReport('Q001')).rejects.toThrow();
    });
  });

  describe('detectAndValidateQuestion', () => {
    test('detects and validates question successfully', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockDetectionResult
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockValidationResult
        });

      const result = await validationService.detectAndValidateQuestion(mockQuestionData, 'Q001');

      expect(result.success).toBe(true);
      expect(result.detection).toEqual(mockDetectionResult);
      expect(result.validation).toEqual(mockValidationResult);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    test('handles error in detect and validate', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await validationService.detectAndValidateQuestion(mockQuestionData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('batchValidateQuestions', () => {
    test('validates multiple questions', async () => {
      const questions = [
        { data: mockQuestionData, id: 'Q001' },
        { data: mockQuestionData, id: 'Q002' }
      ];

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockValidationResult
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockValidationResult
        });

      const results = await validationService.batchValidateQuestions(questions);

      expect(results).toHaveLength(2);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    test('handles partial failures in batch validation', async () => {
      const questions = [
        { data: mockQuestionData, id: 'Q001' },
        { data: mockQuestionData, id: 'Q002' }
      ];

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockValidationResult
        })
        .mockRejectedValueOnce(new Error('Validation error'));

      const results = await validationService.batchValidateQuestions(questions);

      expect(results).toHaveLength(2);
      expect(results[1].error).toBeDefined();
    });
  });

  describe('getValidationStats', () => {
    test('gets validation statistics', async () => {
      const mockStats = {
        total_questions: 10,
        valid_count: 8,
        invalid_count: 2,
        deployment_ready_count: 8,
        critical_errors: 1,
        high_errors: 2,
        medium_warnings: 3,
        low_warnings: 0
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      });

      const result = await validationService.getValidationStats();

      expect(result).toEqual(mockStats);
    });

    test('handles stats retrieval error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(validationService.getValidationStats()).rejects.toThrow();
    });
  });

  describe('checkAPIAvailability', () => {
    test('returns true when API is available', async () => {
      fetch.mockResolvedValueOnce({
        ok: true
      });

      const result = await validationService.checkAPIAvailability();

      expect(result).toBe(true);
    });

    test('returns false when API is unavailable', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await validationService.checkAPIAvailability();

      expect(result).toBe(false);
    });

    test('returns false on API error response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false
      });

      const result = await validationService.checkAPIAvailability();

      expect(result).toBe(false);
    });
  });
});

