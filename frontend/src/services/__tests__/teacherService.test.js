/**
 * Tests for Teacher Service
 * Part of Phase 4, Task 4.3
 */

import * as teacherService from '../teacherService';

describe('Teacher Service', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    global.fetch.mockRestore();
    localStorage.clear();
  });

  describe('getTeacherDashboard', () => {
    test('gets teacher dashboard successfully with new API format', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          statistics: {
            total_students: 30,
            total_exams: 5,
            graded_submissions: 10,
            pending_submissions: 3,
            average_score: 75.5
          },
          recent_activity: [
            { text: 'Graded exam', time: '2 hours ago' }
          ],
          students: [
            { student_id: 'STU-001', full_name: 'Alice', email: 'alice@test.com' }
          ]
        })
      });

      const result = await teacherService.getTeacherDashboard('T001');
      expect(result.success).toBe(true);
      expect(result.data.totalStudents).toBe(30);
      expect(result.data.totalExams).toBe(5);
      expect(result.data.gradedCount).toBe(10);
      expect(Array.isArray(result.data.recentActivity)).toBe(true);
      expect(Array.isArray(result.data.students)).toBe(true);
    });

    test('handles dashboard error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Failed' })
      });

      const result = await teacherService.getTeacherDashboard('T001');
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
    });

    test('handles missing statistics gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          statistics: {}
        })
      });

      const result = await teacherService.getTeacherDashboard('T001');
      expect(result.success).toBe(true);
      expect(result.data.totalStudents).toBe(0);
      expect(result.data.totalExams).toBe(0);
      expect(result.data.gradedCount).toBe(0);
    });
  });

  describe('getTeacherStudents', () => {
    test('gets teacher students successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { id: 'S001', name: 'John Doe' },
          { id: 'S002', name: 'Jane Smith' }
        ])
      });

      const result = await teacherService.getTeacherStudents('T001');
      expect(result.success).toBe(true);
      expect(result.data.length).toBe(2);
    });

    test('gets students with filters', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([])
      });

      const result = await teacherService.getTeacherStudents('T001', { classId: 'C001' });
      expect(result.success).toBe(true);
    });
  });

  describe('getStudentSubmissions', () => {
    test('gets student submissions successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { id: 'SUB001', examId: 'E001', score: 75 },
          { id: 'SUB002', examId: 'E002', score: 80 }
        ])
      });

      const result = await teacherService.getStudentSubmissions('T001', 'S001');
      expect(result.success).toBe(true);
      expect(result.data.length).toBe(2);
    });
  });

  describe('getSubmissionDetails', () => {
    test('gets submission details successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'SUB001',
          studentId: 'S001',
          examId: 'E001',
          answers: []
        })
      });

      const result = await teacherService.getSubmissionDetails('SUB001');
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('SUB001');
    });
  });

  describe('gradeSubmission', () => {
    test('grades submission successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'SUB001', score: 85 })
      });

      const gradeData = { score: 85, feedback: 'Good work' };
      const result = await teacherService.gradeSubmission('SUB001', gradeData);
      expect(result.success).toBe(true);
    });

    test('handles grading error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Grading failed' })
      });

      const result = await teacherService.gradeSubmission('SUB001', {});
      expect(result.success).toBe(false);
    });
  });

  describe('addFeedback', () => {
    test('adds feedback successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'FB001', text: 'Great effort' })
      });

      const feedbackData = { text: 'Great effort', type: 'general' };
      const result = await teacherService.addFeedback('SUB001', feedbackData);
      expect(result.success).toBe(true);
    });
  });

  describe('getSubmissionFeedback', () => {
    test('gets submission feedback successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { id: 'FB001', text: 'Good work' },
          { id: 'FB002', text: 'Needs improvement' }
        ])
      });

      const result = await teacherService.getSubmissionFeedback('SUB001');
      expect(result.success).toBe(true);
      expect(result.data.length).toBe(2);
    });
  });

  describe('publishGrades', () => {
    test('publishes grades successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ published: true })
      });

      const result = await teacherService.publishGrades('C001', 'E001');
      expect(result.success).toBe(true);
    });

    test('handles publish error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Publish failed' })
      });

      const result = await teacherService.publishGrades('C001', 'E001');
      expect(result.success).toBe(false);
    });
  });

  describe('getGradingStatistics', () => {
    test('gets grading statistics successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalSubmissions: 30,
          gradedSubmissions: 25,
          averageScore: 75
        })
      });

      const result = await teacherService.getGradingStatistics('T001');
      expect(result.success).toBe(true);
      expect(result.data.totalSubmissions).toBe(30);
    });

    test('gets statistics with exam filter', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      const result = await teacherService.getGradingStatistics('T001', 'E001');
      expect(result.success).toBe(true);
    });
  });

  describe('getPendingSubmissions', () => {
    test('gets pending submissions successfully with new API format', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          submissions: [
            { submission_id: 'SUB001', student_name: 'John', exam_title: 'IELTS' },
            { submission_id: 'SUB002', student_name: 'Jane', exam_title: 'TOEFL' }
          ]
        })
      });

      const result = await teacherService.getPendingSubmissions('T001');
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBe(2);
      expect(result.data[0].submission_id).toBe('SUB001');
    });

    test('returns empty array when no submissions', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          submissions: []
        })
      });

      const result = await teacherService.getPendingSubmissions('T001');
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBe(0);
    });

    test('returns empty array on error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Error' })
      });

      const result = await teacherService.getPendingSubmissions('T001');
      expect(result.success).toBe(false);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBe(0);
    });
  });

  describe('exportGradesToCSV', () => {
    test('exports grades to CSV successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(['CSV content'])
      });

      const result = await teacherService.exportGradesToCSV('C001', 'E001');
      expect(result.success).toBe(true);
    });

    test('handles export error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Export failed' })
      });

      const result = await teacherService.exportGradesToCSV('C001', 'E001');
      expect(result.success).toBe(false);
    });
  });

  describe('validateGradeData', () => {
    test('validates correct grade data', () => {
      const gradeData = {
        score: 85,
        feedback: 'Excellent work'
      };

      const result = teacherService.validateGradeData(gradeData);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('detects missing score', () => {
      const gradeData = {
        feedback: 'Good work'
      };

      const result = teacherService.validateGradeData(gradeData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Score is required');
    });

    test('detects invalid score range', () => {
      const gradeData = {
        score: 150,
        feedback: 'Good work'
      };

      const result = teacherService.validateGradeData(gradeData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Score must be between 0 and 100');
    });

    test('detects missing feedback', () => {
      const gradeData = {
        score: 85
      };

      const result = teacherService.validateGradeData(gradeData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Feedback is required');
    });

    test('detects negative score', () => {
      const gradeData = {
        score: -10,
        feedback: 'Good work'
      };

      const result = teacherService.validateGradeData(gradeData);
      expect(result.valid).toBe(false);
    });
  });

  describe('error handling', () => {
    test('handles network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await teacherService.getTeacherDashboard('T001');
      expect(result.success).toBe(false);
    });
  });
});

