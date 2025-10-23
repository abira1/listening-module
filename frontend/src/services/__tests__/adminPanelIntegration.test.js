/**
 * Frontend Integration Tests for Admin Panel
 * Part of Phase 2, Task 1.6.2
 */

import { detectQuestionType, validateQuestion, detectAndValidateQuestion } from '../validationService';

describe('Admin Panel Frontend Integration Tests', () => {
  const mockQuestionData = {
    prompt: 'Which is correct?',
    options: [
      { text: 'A', value: 'A' },
      { text: 'B', value: 'B' }
    ],
    answer_key: 'A'
  };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Question Type Detection', () => {
    test('detects question type successfully', async () => {
      const mockResponse = {
        question_id: 'Q001',
        detected_type: 'reading_multiple_choice_single',
        confidence: 0.85,
        confidence_level: 'HIGH'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await detectQuestionType(mockQuestionData, 'Q001');

      expect(result.detected_type).toBe('reading_multiple_choice_single');
      expect(result.confidence_level).toBe('HIGH');
    });

    test('handles detection error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Detection failed' })
      });

      const result = await detectQuestionType(mockQuestionData, 'Q001');

      expect(result.error).toBeDefined();
    });

    test('handles network error during detection', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await detectQuestionType(mockQuestionData, 'Q001');

      expect(result.error).toBeDefined();
    });
  });

  describe('Question Validation', () => {
    test('validates question successfully', async () => {
      const mockResponse = {
        question_id: 'Q001',
        is_valid: true,
        deployment_ready: true,
        errors: [],
        warnings: [],
        summary: {
          critical_count: 0,
          high_count: 0,
          medium_count: 0,
          low_count: 0,
          total_errors: 0,
          total_warnings: 0
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await validateQuestion(mockQuestionData, null, 'Q001');

      expect(result.is_valid).toBe(true);
      expect(result.deployment_ready).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('validates question with errors', async () => {
      const mockResponse = {
        question_id: 'Q001',
        is_valid: false,
        deployment_ready: false,
        errors: [
          {
            field: 'prompt',
            message: 'Prompt is missing',
            severity: 'CRITICAL'
          }
        ],
        warnings: [],
        summary: {
          critical_count: 1,
          high_count: 0,
          medium_count: 0,
          low_count: 0,
          total_errors: 1,
          total_warnings: 0
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await validateQuestion(mockQuestionData, null, 'Q001');

      expect(result.is_valid).toBe(false);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].severity).toBe('CRITICAL');
    });

    test('validates question with warnings', async () => {
      const mockResponse = {
        question_id: 'Q001',
        is_valid: true,
        deployment_ready: true,
        errors: [],
        warnings: [
          {
            field: 'options',
            message: 'Options could be improved',
            severity: 'MEDIUM'
          }
        ],
        summary: {
          critical_count: 0,
          high_count: 0,
          medium_count: 1,
          low_count: 0,
          total_errors: 0,
          total_warnings: 1
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await validateQuestion(mockQuestionData, null, 'Q001');

      expect(result.is_valid).toBe(true);
      expect(result.warnings.length).toBe(1);
      expect(result.warnings[0].severity).toBe('MEDIUM');
    });

    test('handles validation error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Validation failed' })
      });

      const result = await validateQuestion(mockQuestionData, null, 'Q001');

      expect(result.error).toBeDefined();
    });
  });

  describe('Combined Detect and Validate', () => {
    test('detects and validates question successfully', async () => {
      const detectResponse = {
        question_id: 'Q001',
        detected_type: 'reading_multiple_choice_single',
        confidence: 0.85
      };

      const validateResponse = {
        question_id: 'Q001',
        is_valid: true,
        deployment_ready: true,
        detected_type: 'reading_multiple_choice_single',
        errors: [],
        warnings: []
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => detectResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => validateResponse
        });

      const result = await detectAndValidateQuestion(mockQuestionData, 'Q001');

      expect(result.success).toBe(true);
      expect(result.detection.detected_type).toBe('reading_multiple_choice_single');
      expect(result.validation.is_valid).toBe(true);
    });

    test('handles detection failure in combined operation', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Detection failed' })
      });

      const result = await detectAndValidateQuestion(mockQuestionData, 'Q001');

      expect(result.success).toBe(false);
      expect(result.detection.error).toBeDefined();
    });

    test('handles validation failure in combined operation', async () => {
      const detectResponse = {
        question_id: 'Q001',
        detected_type: 'reading_multiple_choice_single'
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => detectResponse
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Validation failed' })
        });

      const result = await detectAndValidateQuestion(mockQuestionData, 'Q001');

      expect(result.success).toBe(false);
      expect(result.validation.error).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('handles missing question data', async () => {
      const result = await validateQuestion(null, null, 'Q001');

      expect(result.error).toBeDefined();
    });

    test('handles invalid question data structure', async () => {
      const invalidData = { invalid: 'data' };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid data' })
      });

      const result = await validateQuestion(invalidData, null, 'Q001');

      expect(result.error).toBeDefined();
    });

    test('handles timeout', async () => {
      global.fetch.mockImplementationOnce(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      const result = await detectQuestionType(mockQuestionData, 'Q001');

      expect(result.error).toBeDefined();
    });
  });

  describe('Response Validation', () => {
    test('validates response structure for detection', async () => {
      const mockResponse = {
        question_id: 'Q001',
        detected_type: 'reading_multiple_choice_single',
        confidence: 0.85,
        confidence_level: 'HIGH',
        all_methods: {}
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await detectQuestionType(mockQuestionData, 'Q001');

      expect(result).toHaveProperty('question_id');
      expect(result).toHaveProperty('detected_type');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('confidence_level');
    });

    test('validates response structure for validation', async () => {
      const mockResponse = {
        question_id: 'Q001',
        is_valid: true,
        detected_type: 'reading_multiple_choice_single',
        errors: [],
        warnings: [],
        summary: {},
        deployment_ready: true,
        timestamp: '2025-10-23T10:00:00'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await validateQuestion(mockQuestionData, null, 'Q001');

      expect(result).toHaveProperty('question_id');
      expect(result).toHaveProperty('is_valid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('deployment_ready');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('Batch Operations', () => {
    test('validates multiple questions', async () => {
      const questions = [
        { data: mockQuestionData, id: 'Q001' },
        { data: mockQuestionData, id: 'Q002' }
      ];

      const mockResponse = {
        question_id: 'Q001',
        is_valid: true,
        deployment_ready: true,
        errors: [],
        warnings: []
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const results = await Promise.all(
        questions.map(q => validateQuestion(q.data, null, q.id))
      );

      expect(results.length).toBe(2);
      expect(results[0].question_id).toBe('Q001');
      expect(results[1].question_id).toBe('Q001');
    });
  });
});

