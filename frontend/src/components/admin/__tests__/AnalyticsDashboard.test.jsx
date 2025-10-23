/**
 * Tests for Analytics Dashboard Component
 * Part of Phase 4, Task 4.2
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalyticsDashboard from '../AnalyticsDashboard';
import * as reportingService from '../../../services/reportingService';

jest.mock('../../../services/reportingService');

describe('AnalyticsDashboard Component', () => {
  const mockDashboardData = {
    totalExams: 10,
    totalStudents: 100,
    averageScore: 75.5,
    passRate: 85.2,
    totalAttempts: 500,
    completedAttempts: 450,
    inProgressAttempts: 50,
    averageTime: '2h 15m',
    scoreDistribution: [
      { range: '0-20', count: 10 },
      { range: '20-40', count: 30 },
      { range: '40-60', count: 80 },
      { range: '60-80', count: 200 },
      { range: '80-100', count: 180 }
    ],
    topExams: [
      { id: 'E001', title: 'IELTS Test 1', averageScore: 78 },
      { id: 'E002', title: 'IELTS Test 2', averageScore: 75 }
    ],
    topStudents: [
      { id: 'S001', name: 'John Doe', averageScore: 92 },
      { id: 'S002', name: 'Jane Smith', averageScore: 88 }
    ],
    performanceTrend: [
      { date: '2025-10-20', score: 70 },
      { date: '2025-10-21', score: 72 },
      { date: '2025-10-22', score: 75 }
    ],
    insights: [
      'Excellent overall performance',
      'Strong improvement trend',
      'Consistent student engagement'
    ],
    exams: [
      { id: 'E001', title: 'IELTS Test 1' },
      { id: 'E002', title: 'IELTS Test 2' }
    ]
  };

  beforeEach(() => {
    reportingService.generateAnalyticsDashboard.mockResolvedValue({
      success: true,
      data: mockDashboardData
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders analytics dashboard', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });
  });

  test('displays key metrics', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Total Exams')).toBeInTheDocument();
      expect(screen.getByText('Total Students')).toBeInTheDocument();
      expect(screen.getByText('Average Score')).toBeInTheDocument();
      expect(screen.getByText('Pass Rate')).toBeInTheDocument();
    });
  });

  test('displays metric values', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  test('displays filter controls', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('This Month')).toBeInTheDocument();
      expect(screen.getByDisplayValue('All Exams')).toBeInTheDocument();
    });
  });

  test('changes date range filter', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('This Month')).toBeInTheDocument();
    });

    const dateSelect = screen.getByDisplayValue('This Month');
    fireEvent.change(dateSelect, { target: { value: 'year' } });

    await waitFor(() => {
      expect(reportingService.generateAnalyticsDashboard).toHaveBeenCalledWith(
        expect.objectContaining({ dateRange: 'year' })
      );
    });
  });

  test('changes exam filter', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('All Exams')).toBeInTheDocument();
    });

    const examSelect = screen.getByDisplayValue('All Exams');
    fireEvent.change(examSelect, { target: { value: 'E001' } });

    await waitFor(() => {
      expect(reportingService.generateAnalyticsDashboard).toHaveBeenCalledWith(
        expect.objectContaining({ examId: 'E001' })
      );
    });
  });

  test('displays tabs', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Performance')).toBeInTheDocument();
      expect(screen.getByText('Trends')).toBeInTheDocument();
    });
  });

  test('switches to performance tab', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Performance')).toBeInTheDocument();
    });

    const performanceTab = screen.getByText('Performance');
    fireEvent.click(performanceTab);

    await waitFor(() => {
      expect(screen.getByText('Top Performing Exams')).toBeInTheDocument();
    });
  });

  test('switches to trends tab', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Trends')).toBeInTheDocument();
    });

    const trendsTab = screen.getByText('Trends');
    fireEvent.click(trendsTab);

    await waitFor(() => {
      expect(screen.getByText('Performance Trend')).toBeInTheDocument();
    });
  });

  test('displays overview section content', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Exam Statistics')).toBeInTheDocument();
      expect(screen.getByText('Score Distribution')).toBeInTheDocument();
    });
  });

  test('displays exam statistics', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Total Attempts:')).toBeInTheDocument();
      expect(screen.getByText('Completed:')).toBeInTheDocument();
      expect(screen.getByText('In Progress:')).toBeInTheDocument();
      expect(screen.getByText('Average Time:')).toBeInTheDocument();
    });
  });

  test('displays top performing exams', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Performance')).toBeInTheDocument();
    });

    const performanceTab = screen.getByText('Performance');
    fireEvent.click(performanceTab);

    await waitFor(() => {
      expect(screen.getByText('IELTS Test 1')).toBeInTheDocument();
      expect(screen.getByText('IELTS Test 2')).toBeInTheDocument();
    });
  });

  test('displays top students', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Performance')).toBeInTheDocument();
    });

    const performanceTab = screen.getByText('Performance');
    fireEvent.click(performanceTab);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  test('displays performance trends', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Trends')).toBeInTheDocument();
    });

    const trendsTab = screen.getByText('Trends');
    fireEvent.click(trendsTab);

    await waitFor(() => {
      expect(screen.getByText('Performance Trend')).toBeInTheDocument();
    });
  });

  test('displays insights', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Trends')).toBeInTheDocument();
    });

    const trendsTab = screen.getByText('Trends');
    fireEvent.click(trendsTab);

    await waitFor(() => {
      expect(screen.getByText('Insights')).toBeInTheDocument();
      expect(screen.getByText('Excellent overall performance')).toBeInTheDocument();
    });
  });

  test('handles loading state', () => {
    reportingService.generateAnalyticsDashboard.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<AnalyticsDashboard />);

    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  test('handles error state', async () => {
    reportingService.generateAnalyticsDashboard.mockResolvedValue({
      success: false,
      error: 'Failed to load dashboard'
    });

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard')).toBeInTheDocument();
    });
  });

  test('refreshes dashboard', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByTitle('Refresh')).toBeInTheDocument();
    });

    const refreshBtn = screen.getByTitle('Refresh');
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(reportingService.generateAnalyticsDashboard).toHaveBeenCalledTimes(2);
    });
  });

  test('exports to PDF', async () => {
    reportingService.exportReportToPDF.mockResolvedValue({ success: true });

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByTitle('Export PDF')).toBeInTheDocument();
    });

    const exportBtn = screen.getByTitle('Export PDF');
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(reportingService.exportReportToPDF).toHaveBeenCalled();
    });
  });

  test('displays score distribution', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Score Distribution')).toBeInTheDocument();
    });
  });

  test('displays metric cards with icons', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      const metricCards = screen.getAllByText(/Total|Average|Pass/);
      expect(metricCards.length).toBeGreaterThan(0);
    });
  });

  test('loads dashboard on mount', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(reportingService.generateAnalyticsDashboard).toHaveBeenCalled();
    });
  });

  test('reloads dashboard when filters change', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(reportingService.generateAnalyticsDashboard).toHaveBeenCalledTimes(1);
    });

    const dateSelect = screen.getByDisplayValue('This Month');
    fireEvent.change(dateSelect, { target: { value: 'week' } });

    await waitFor(() => {
      expect(reportingService.generateAnalyticsDashboard).toHaveBeenCalledTimes(2);
    });
  });
});

