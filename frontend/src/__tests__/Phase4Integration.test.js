/**
 * Phase 4 Integration Tests
 * Tests for exam management, reporting, and teacher interface
 * Part of Phase 4, Task 4.4
 */

import * as examService from '../services/examManagementService';
import * as reportingService from '../services/reportingService';
import * as teacherService from '../services/teacherService';

describe('Phase 4 Integration Tests', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    global.fetch.mockRestore();
    localStorage.clear();
  });

  describe('Exam Management Workflow', () => {
    test('complete exam creation workflow', async () => {
      // Create exam
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'E001', title: 'Test Exam', status: 'draft' })
      });

      const createResult = await examService.createExam({
        title: 'Test Exam',
        description: 'Test',
        duration: 180,
        totalScore: 100,
        passingScore: 60,
        questions: [{ id: 'Q1' }]
      });

      expect(createResult.success).toBe(true);
      expect(createResult.data.status).toBe('draft');

      // Add questions
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ questionsAdded: 5 })
      });

      const addResult = await examService.addQuestionsToExam('E001', ['Q1', 'Q2', 'Q3', 'Q4', 'Q5']);
      expect(addResult.success).toBe(true);

      // Publish exam
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'E001', status: 'published' })
      });

      const publishResult = await examService.publishExam('E001');
      expect(publishResult.success).toBe(true);
    });

    test('exam duplication workflow', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'E002', title: 'Test Exam (Copy)' })
      });

      const result = await examService.duplicateExam('E001', 'Test Exam (Copy)');
      expect(result.success).toBe(true);
      expect(result.data.title).toContain('Copy');
    });

    test('exam export and import workflow', async () => {
      // Export
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'E001', title: 'Test Exam' })
      });

      const exportResult = await examService.exportExamData('E001', 'json');
      expect(exportResult.success).toBe(true);

      // Import
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'E003', title: 'Imported Exam' })
      });

      const importResult = await examService.importExamData({ title: 'Imported Exam' });
      expect(importResult.success).toBe(true);
    });
  });

  describe('Reporting & Analytics Workflow', () => {
    test('complete reporting workflow', async () => {
      // Generate exam report
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          examId: 'E001',
          averageScore: 75,
          totalAttempts: 100
        })
      });

      const reportResult = await reportingService.generateExamReport('E001');
      expect(reportResult.success).toBe(true);

      // Generate analytics dashboard
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalExams: 10,
          totalStudents: 100,
          averageScore: 72
        })
      });

      const dashboardResult = await reportingService.generateAnalyticsDashboard();
      expect(dashboardResult.success).toBe(true);

      // Export report
      global.fetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(['PDF content'])
      });

      const exportResult = await reportingService.exportReportToPDF('R001');
      expect(exportResult.success).toBe(true);
    });

    test('performance trends analysis', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          trends: [70, 72, 75, 78, 80]
        })
      });

      const result = await reportingService.getPerformanceTrends('S001');
      expect(result.success).toBe(true);
      expect(result.data.trends.length).toBe(5);
    });

    test('statistics calculation', () => {
      const scores = [60, 70, 75, 80, 90];
      const stats = reportingService.calculateStatistics(scores);

      expect(stats.mean).toBe(75);
      expect(stats.median).toBe(75);
      expect(stats.min).toBe(60);
      expect(stats.max).toBe(90);
    });

    test('insights generation', () => {
      const reportData = {
        averageScore: 85,
        currentScore: 85,
        previousScores: [70, 75, 80],
        statistics: { stdDev: 3 }
      };

      const insights = reportingService.generateInsights(reportData);
      expect(insights.length).toBeGreaterThan(0);
      expect(insights.some(i => i.includes('Excellent'))).toBe(true);
    });
  });

  describe('Teacher Grading Workflow', () => {
    test('complete grading workflow', async () => {
      // Get pending submissions
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { id: 'SUB001', studentId: 'S001' }
        ])
      });

      const pendingResult = await teacherService.getPendingSubmissions('T001');
      expect(pendingResult.success).toBe(true);

      // Get submission details
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'SUB001',
          answers: []
        })
      });

      const detailsResult = await teacherService.getSubmissionDetails('SUB001');
      expect(detailsResult.success).toBe(true);

      // Grade submission
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'SUB001', score: 85 })
      });

      const gradeResult = await teacherService.gradeSubmission('SUB001', {
        score: 85,
        feedback: 'Good work'
      });
      expect(gradeResult.success).toBe(true);

      // Add feedback
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'FB001' })
      });

      const feedbackResult = await teacherService.addFeedback('SUB001', {
        text: 'Excellent effort'
      });
      expect(feedbackResult.success).toBe(true);
    });

    test('grade validation', () => {
      const validGrade = {
        score: 85,
        feedback: 'Good work'
      };

      const result = teacherService.validateGradeData(validGrade);
      expect(result.valid).toBe(true);
    });

    test('grade publication workflow', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ published: true })
      });

      const result = await teacherService.publishGrades('C001', 'E001');
      expect(result.success).toBe(true);
    });
  });

  describe('Cross-Module Integration', () => {
    test('exam to reporting integration', async () => {
      // Create exam
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'E001' })
      });

      const examResult = await examService.createExam({
        title: 'Test',
        description: 'Test',
        duration: 180,
        totalScore: 100,
        passingScore: 60,
        questions: [{ id: 'Q1' }]
      });

      // Generate report for exam
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ examId: 'E001', averageScore: 75 })
      });

      const reportResult = await reportingService.generateExamReport(examResult.data.id);
      expect(reportResult.success).toBe(true);
    });

    test('teacher to reporting integration', async () => {
      // Get teacher dashboard
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalStudents: 30,
          totalExams: 5
        })
      });

      const dashboardResult = await teacherService.getTeacherDashboard('T001');
      expect(dashboardResult.success).toBe(true);

      // Get grading statistics
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalSubmissions: 150,
          averageScore: 75
        })
      });

      const statsResult = await teacherService.getGradingStatistics('T001');
      expect(statsResult.success).toBe(true);
    });
  });

  describe('Error Handling & Recovery', () => {
    test('handles network errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await examService.createExam({});
      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    test('handles API errors gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Unauthorized' })
      });

      const result = await examService.getAllExams();
      expect(result.success).toBe(false);
    });

    test('validates data before submission', () => {
      const invalidExam = {
        title: '',
        description: '',
        duration: 0,
        totalScore: 0,
        passingScore: 0,
        questions: []
      };

      const result = examService.validateExamData(invalidExam);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Metrics', () => {
    test('tracks API response times', async () => {
      const startTime = Date.now();

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'E001' })
      });

      await examService.getExam('E001');

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(1000); // Should be fast
    });

    test('handles concurrent requests', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'E001' })
      });

      const promises = [
        examService.getExam('E001'),
        examService.getExam('E002'),
        examService.getExam('E003')
      ];

      const results = await Promise.all(promises);
      expect(results.every(r => r.success)).toBe(true);
    });
  });

  describe('Data Consistency', () => {
    test('maintains data consistency across operations', async () => {
      // Create exam
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'E001', title: 'Test' })
      });

      const createResult = await examService.createExam({
        title: 'Test',
        description: 'Test',
        duration: 180,
        totalScore: 100,
        passingScore: 60,
        questions: [{ id: 'Q1' }]
      });

      // Retrieve exam
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'E001', title: 'Test' })
      });

      const getResult = await examService.getExam('E001');

      expect(createResult.data.id).toBe(getResult.data.id);
      expect(createResult.data.title).toBe(getResult.data.title);
    });
  });
});

