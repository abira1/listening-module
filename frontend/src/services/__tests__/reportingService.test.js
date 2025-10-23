/**
 * Tests for Reporting & Analytics Service
 * Part of Phase 4, Task 4.2
 */

import * as reportingService from '../reportingService';

describe('Reporting & Analytics Service', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    global.fetch.mockRestore();
    localStorage.clear();
  });

  describe('generateExamReport', () => {
    test('generates exam report successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ examId: 'E001', averageScore: 75 })
      });

      const result = await reportingService.generateExamReport('E001');
      expect(result.success).toBe(true);
      expect(result.data.averageScore).toBe(75);
    });

    test('handles report generation error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Failed' })
      });

      const result = await reportingService.generateExamReport('E001');
      expect(result.success).toBe(false);
    });
  });

  describe('generateStudentReport', () => {
    test('generates student report successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ studentId: 'S001', totalAttempts: 5 })
      });

      const result = await reportingService.generateStudentReport('S001');
      expect(result.success).toBe(true);
      expect(result.data.totalAttempts).toBe(5);
    });
  });

  describe('generateClassReport', () => {
    test('generates class report successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ classId: 'C001', studentCount: 30 })
      });

      const result = await reportingService.generateClassReport('C001');
      expect(result.success).toBe(true);
      expect(result.data.studentCount).toBe(30);
    });
  });

  describe('generateAnalyticsDashboard', () => {
    test('generates analytics dashboard successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalExams: 10,
          totalStudents: 100,
          averageScore: 72
        })
      });

      const result = await reportingService.generateAnalyticsDashboard();
      expect(result.success).toBe(true);
      expect(result.data.totalExams).toBe(10);
    });
  });

  describe('exportReportToPDF', () => {
    test('exports report to PDF successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(['PDF content'])
      });

      const result = await reportingService.exportReportToPDF('R001');
      expect(result.success).toBe(true);
    });

    test('handles PDF export error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Export failed' })
      });

      const result = await reportingService.exportReportToPDF('R001');
      expect(result.success).toBe(false);
    });
  });

  describe('exportReportToCSV', () => {
    test('exports report to CSV successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(['CSV content'])
      });

      const result = await reportingService.exportReportToCSV('R001');
      expect(result.success).toBe(true);
    });
  });

  describe('getPerformanceTrends', () => {
    test('gets performance trends successfully', async () => {
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

    test('gets trends with exam filter', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ trends: [75, 78, 80] })
      });

      const result = await reportingService.getPerformanceTrends('S001', 'E001');
      expect(result.success).toBe(true);
    });
  });

  describe('getQuestionAnalytics', () => {
    test('gets question analytics successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          questions: [
            { id: 'Q1', correctRate: 85 },
            { id: 'Q2', correctRate: 60 }
          ]
        })
      });

      const result = await reportingService.getQuestionAnalytics('E001');
      expect(result.success).toBe(true);
      expect(result.data.questions.length).toBe(2);
    });
  });

  describe('getSectionAnalytics', () => {
    test('gets section analytics successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          sections: [
            { name: 'Reading', averageScore: 75 },
            { name: 'Writing', averageScore: 70 }
          ]
        })
      });

      const result = await reportingService.getSectionAnalytics('E001');
      expect(result.success).toBe(true);
      expect(result.data.sections.length).toBe(2);
    });
  });

  describe('calculateStatistics', () => {
    test('calculates statistics for scores', () => {
      const scores = [60, 70, 75, 80, 90];
      const stats = reportingService.calculateStatistics(scores);

      expect(stats.mean).toBe(75);
      expect(stats.median).toBe(75);
      expect(stats.min).toBe(60);
      expect(stats.max).toBe(90);
    });

    test('handles empty scores array', () => {
      const stats = reportingService.calculateStatistics([]);

      expect(stats.mean).toBe(0);
      expect(stats.median).toBe(0);
      expect(stats.min).toBe(0);
      expect(stats.max).toBe(0);
    });

    test('calculates quartiles correctly', () => {
      const scores = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      const stats = reportingService.calculateStatistics(scores);

      expect(stats.q1).toBeDefined();
      expect(stats.q3).toBeDefined();
      expect(stats.q1 < stats.q3).toBe(true);
    });

    test('calculates standard deviation', () => {
      const scores = [70, 70, 70, 70, 70];
      const stats = reportingService.calculateStatistics(scores);

      expect(stats.stdDev).toBe(0);
    });
  });

  describe('generateInsights', () => {
    test('generates excellent performance insight', () => {
      const reportData = { averageScore: 85 };
      const insights = reportingService.generateInsights(reportData);

      expect(insights).toContain('Excellent overall performance');
    });

    test('generates good performance insight', () => {
      const reportData = { averageScore: 70 };
      const insights = reportingService.generateInsights(reportData);

      expect(insights).toContain('Good overall performance');
    });

    test('generates improvement insight', () => {
      const reportData = {
        currentScore: 80,
        previousScores: [70, 72, 75]
      };
      const insights = reportingService.generateInsights(reportData);

      expect(insights.some(i => i.includes('improvement'))).toBe(true);
    });

    test('generates consistency insight', () => {
      const reportData = {
        averageScore: 75,
        statistics: { stdDev: 3 }
      };
      const insights = reportingService.generateInsights(reportData);

      expect(insights.some(i => i.includes('consistent'))).toBe(true);
    });

    test('handles null report data', () => {
      const insights = reportingService.generateInsights(null);
      expect(insights).toEqual([]);
    });
  });

  describe('error handling', () => {
    test('handles network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await reportingService.generateExamReport('E001');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    test('handles missing token', async () => {
      localStorage.clear();
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      const result = await reportingService.generateExamReport('E001');
      expect(result.success).toBe(true);
    });
  });

  describe('report filtering', () => {
    test('applies filters to exam report', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      const filters = { startDate: '2025-10-01', endDate: '2025-10-31' };
      await reportingService.generateExamReport('E001', filters);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('startDate=2025-10-01'),
        expect.any(Object)
      );
    });
  });
});

