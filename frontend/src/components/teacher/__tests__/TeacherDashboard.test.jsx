/**
 * Tests for Teacher Dashboard Component
 * Part of Phase 4, Task 4.3
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TeacherDashboard from '../TeacherDashboard';
import * as teacherService from '../../../services/teacherService';

jest.mock('../../../services/teacherService');

describe('TeacherDashboard Component', () => {
  const mockDashboardData = {
    totalStudents: 30,
    totalExams: 5,
    totalSubmissions: 150,
    gradedCount: 120,
    averageScore: 75.5,
    recentActivity: [
      { text: 'John submitted exam', time: '2 hours ago' },
      { text: 'Jane submitted exam', time: '3 hours ago' }
    ],
    students: [
      { id: 'S001', name: 'John Doe', email: 'john@example.com', submissionCount: 5, averageScore: 80 },
      { id: 'S002', name: 'Jane Smith', email: 'jane@example.com', submissionCount: 4, averageScore: 85 }
    ]
  };

  const mockPendingSubmissions = [
    {
      id: 'SUB001',
      studentName: 'John Doe',
      examTitle: 'IELTS Test 1',
      submittedAt: '2025-10-23 10:00'
    },
    {
      id: 'SUB002',
      studentName: 'Jane Smith',
      examTitle: 'IELTS Test 2',
      submittedAt: '2025-10-23 11:00'
    }
  ];

  beforeEach(() => {
    teacherService.getTeacherDashboard.mockResolvedValue({
      success: true,
      data: mockDashboardData
    });
    teacherService.getPendingSubmissions.mockResolvedValue({
      success: true,
      data: mockPendingSubmissions
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders teacher dashboard', async () => {
    render(<TeacherDashboard teacherId="T001" />);

    await waitFor(() => {
      expect(screen.getByText('Teacher Dashboard')).toBeInTheDocument();
    });
  });

  test('displays key metrics', async () => {
    render(<TeacherDashboard teacherId="T001" />);

    await waitFor(() => {
      expect(screen.getByText('Total Students')).toBeInTheDocument();
      expect(screen.getByText('Total Exams')).toBeInTheDocument();
      expect(screen.getByText('Pending Grading')).toBeInTheDocument();
      expect(screen.getByText('Graded')).toBeInTheDocument();
    });
  });

  test('displays metric values', async () => {
    render(<TeacherDashboard teacherId="T001" />);

    await waitFor(() => {
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument();
    });
  });

  test('displays tabs', async () => {
    render(<TeacherDashboard teacherId="T001" />);

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText(/Pending Grading/)).toBeInTheDocument();
      expect(screen.getByText('Students')).toBeInTheDocument();
    });
  });

  test('switches to pending tab', async () => {
    render(<TeacherDashboard teacherId="T001" />);

    await waitFor(() => {
      expect(screen.getByText(/Pending Grading/)).toBeInTheDocument();
    });

    const pendingTab = screen.getByText(/Pending Grading/);
    fireEvent.click(pendingTab);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  test('switches to students tab', async () => {
    render(<TeacherDashboard teacherId="T001" />);

    await waitFor(() => {
      expect(screen.getByText('Students')).toBeInTheDocument();
    });

    const studentsTab = screen.getByText('Students');
    fireEvent.click(studentsTab);

    await waitFor(() => {
      expect(screen.getByText('My Students')).toBeInTheDocument();
    });
  });

  test('displays overview section', async () => {
    render(<TeacherDashboard teacherId="T001" />);

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText('Grading Statistics')).toBeInTheDocument();
    });
  });

  test('displays recent activity', async () => {
    render(<TeacherDashboard teacherId="T001" />);

    await waitFor(() => {
      expect(screen.getByText('John submitted exam')).toBeInTheDocument();
      expect(screen.getByText('Jane submitted exam')).toBeInTheDocument();
    });
  });

  test('displays grading statistics', async () => {
    render(<TeacherDashboard teacherId="T001" />);

    await waitFor(() => {
      expect(screen.getByText('Total Submissions:')).toBeInTheDocument();
      expect(screen.getByText('Graded:')).toBeInTheDocument();
      expect(screen.getByText('Pending:')).toBeInTheDocument();
      expect(screen.getByText('Average Score:')).toBeInTheDocument();
    });
  });

  test('displays pending submissions', async () => {
    render(<TeacherDashboard teacherId="T001" />);

    await waitFor(() => {
      expect(screen.getByText(/Pending Grading/)).toBeInTheDocument();
    });

    const pendingTab = screen.getByText(/Pending Grading/);
    fireEvent.click(pendingTab);

    await waitFor(() => {
      expect(screen.getByText('IELTS Test 1')).toBeInTheDocument();
      expect(screen.getByText('IELTS Test 2')).toBeInTheDocument();
    });
  });

  test('displays grade buttons for pending submissions', async () => {
    render(<TeacherDashboard teacherId="T001" />);

    await waitFor(() => {
      expect(screen.getByText(/Pending Grading/)).toBeInTheDocument();
    });

    const pendingTab = screen.getByText(/Pending Grading/);
    fireEvent.click(pendingTab);

    await waitFor(() => {
      const gradeButtons = screen.getAllByText('Grade');
      expect(gradeButtons.length).toBeGreaterThan(0);
    });
  });

  test('displays students list', async () => {
    render(<TeacherDashboard teacherId="T001" />);

    await waitFor(() => {
      expect(screen.getByText('Students')).toBeInTheDocument();
    });

    const studentsTab = screen.getByText('Students');
    fireEvent.click(studentsTab);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
  });

  test('displays student statistics', async () => {
    render(<TeacherDashboard teacherId="T001" />);

    await waitFor(() => {
      expect(screen.getByText('Students')).toBeInTheDocument();
    });

    const studentsTab = screen.getByText('Students');
    fireEvent.click(studentsTab);

    await waitFor(() => {
      expect(screen.getByText(/5 submissions/)).toBeInTheDocument();
      expect(screen.getByText(/80% avg/)).toBeInTheDocument();
    });
  });

  test('handles loading state', () => {
    teacherService.getTeacherDashboard.mockImplementation(
      () => new Promise(() => {})
    );

    render(<TeacherDashboard teacherId="T001" />);

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  test('handles error state', async () => {
    teacherService.getTeacherDashboard.mockResolvedValue({
      success: false,
      error: 'Failed to load dashboard'
    });

    render(<TeacherDashboard teacherId="T001" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard')).toBeInTheDocument();
    });
  });

  test('refreshes dashboard', async () => {
    render(<TeacherDashboard teacherId="T001" />);

    await waitFor(() => {
      expect(screen.getByTitle('Refresh')).toBeInTheDocument();
    });

    const refreshBtn = screen.getByTitle('Refresh');
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(teacherService.getTeacherDashboard).toHaveBeenCalledTimes(2);
    });
  });

  test('loads dashboard on mount', async () => {
    render(<TeacherDashboard teacherId="T001" />);

    await waitFor(() => {
      expect(teacherService.getTeacherDashboard).toHaveBeenCalledWith('T001');
    });
  });

  test('displays no pending submissions message', async () => {
    teacherService.getPendingSubmissions.mockResolvedValue({
      success: true,
      data: []
    });

    render(<TeacherDashboard teacherId="T001" />);

    await waitFor(() => {
      expect(screen.getByText(/Pending Grading/)).toBeInTheDocument();
    });

    const pendingTab = screen.getByText(/Pending Grading/);
    fireEvent.click(pendingTab);

    await waitFor(() => {
      expect(screen.getByText('No pending submissions')).toBeInTheDocument();
    });
  });

  test('pending count updates in tab', async () => {
    render(<TeacherDashboard teacherId="T001" />);

    await waitFor(() => {
      expect(screen.getByText(/Pending Grading \(2\)/)).toBeInTheDocument();
    });
  });
});

