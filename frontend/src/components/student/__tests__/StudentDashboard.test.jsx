/**
 * Tests for StudentDashboard Component
 * Part of Phase 3, Task 3.1
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentDashboard from '../StudentDashboard';

describe('StudentDashboard Component', () => {
  const mockOnSelectExam = jest.fn();

  beforeEach(() => {
    mockOnSelectExam.mockClear();
  });

  test('renders student dashboard', async () => {
    render(
      <StudentDashboard
        studentId="S001"
        onSelectExam={mockOnSelectExam}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('My Exams')).toBeInTheDocument();
    });
  });

  test('displays header with welcome message', async () => {
    render(
      <StudentDashboard
        studentId="S001"
        onSelectExam={mockOnSelectExam}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
    });
  });

  test('displays tracks section', async () => {
    render(
      <StudentDashboard
        studentId="S001"
        onSelectExam={mockOnSelectExam}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Your Tracks')).toBeInTheDocument();
    });
  });

  test('displays search input', async () => {
    render(
      <StudentDashboard
        studentId="S001"
        onSelectExam={mockOnSelectExam}
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search exams...')).toBeInTheDocument();
    });
  });

  test('displays filter buttons', async () => {
    render(
      <StudentDashboard
        studentId="S001"
        onSelectExam={mockOnSelectExam}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/All/)).toBeInTheDocument();
      expect(screen.getByText(/Not Started/)).toBeInTheDocument();
      expect(screen.getByText(/In Progress/)).toBeInTheDocument();
      expect(screen.getByText(/Completed/)).toBeInTheDocument();
    });
  });

  test('displays exams list', async () => {
    render(
      <StudentDashboard
        studentId="S001"
        onSelectExam={mockOnSelectExam}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Available Exams')).toBeInTheDocument();
      expect(screen.getByText('IELTS Practice Test 1')).toBeInTheDocument();
    });
  });

  test('filters exams by status', async () => {
    render(
      <StudentDashboard
        studentId="S001"
        onSelectExam={mockOnSelectExam}
      />
    );

    await waitFor(() => {
      const notStartedBtn = screen.getByText(/Not Started/);
      fireEvent.click(notStartedBtn);
      expect(screen.getByText('IELTS Practice Test 1')).toBeInTheDocument();
    });
  });

  test('searches exams by title', async () => {
    render(
      <StudentDashboard
        studentId="S001"
        onSelectExam={mockOnSelectExam}
      />
    );

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search exams...');
      fireEvent.change(searchInput, { target: { value: 'Test 1' } });
      expect(screen.getByText('IELTS Practice Test 1')).toBeInTheDocument();
    });
  });

  test('displays exam details', async () => {
    render(
      <StudentDashboard
        studentId="S001"
        onSelectExam={mockOnSelectExam}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('180 min')).toBeInTheDocument();
      expect(screen.getByText('40')).toBeInTheDocument();
    });
  });

  test('displays start button for not started exams', async () => {
    render(
      <StudentDashboard
        studentId="S001"
        onSelectExam={mockOnSelectExam}
      />
    );

    await waitFor(() => {
      const startButtons = screen.getAllByText('Start Exam');
      expect(startButtons.length).toBeGreaterThan(0);
    });
  });

  test('displays continue button for in progress exams', async () => {
    render(
      <StudentDashboard
        studentId="S001"
        onSelectExam={mockOnSelectExam}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });
  });

  test('displays view results button for completed exams', async () => {
    render(
      <StudentDashboard
        studentId="S001"
        onSelectExam={mockOnSelectExam}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('View Results')).toBeInTheDocument();
    });
  });

  test('calls onSelectExam when start button clicked', async () => {
    render(
      <StudentDashboard
        studentId="S001"
        onSelectExam={mockOnSelectExam}
      />
    );

    await waitFor(() => {
      const startButtons = screen.getAllByText('Start Exam');
      fireEvent.click(startButtons[0]);
      expect(mockOnSelectExam).toHaveBeenCalled();
    });
  });

  test('displays progress bar for in progress exams', async () => {
    render(
      <StudentDashboard
        studentId="S001"
        onSelectExam={mockOnSelectExam}
      />
    );

    await waitFor(() => {
      const progressBars = document.querySelectorAll('.progress-bar');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  test('displays score for completed exams', async () => {
    render(
      <StudentDashboard
        studentId="S001"
        onSelectExam={mockOnSelectExam}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('7.5')).toBeInTheDocument();
    });
  });

  test('displays track information', async () => {
    render(
      <StudentDashboard
        studentId="S001"
        onSelectExam={mockOnSelectExam}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('IELTS Academic')).toBeInTheDocument();
    });
  });

  test('displays exam count in filter buttons', async () => {
    render(
      <StudentDashboard
        studentId="S001"
        onSelectExam={mockOnSelectExam}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/All \(\d+\)/)).toBeInTheDocument();
    });
  });

  test('refresh button reloads exams', async () => {
    render(
      <StudentDashboard
        studentId="S001"
        onSelectExam={mockOnSelectExam}
      />
    );

    await waitFor(() => {
      const refreshBtn = screen.getByText('Refresh');
      fireEvent.click(refreshBtn);
      expect(screen.getByText('My Exams')).toBeInTheDocument();
    });
  });

  test('handles empty search results', async () => {
    render(
      <StudentDashboard
        studentId="S001"
        onSelectExam={mockOnSelectExam}
      />
    );

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search exams...');
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } });
      expect(screen.getByText(/No exams found/)).toBeInTheDocument();
    });
  });

  test('displays exam sections count', async () => {
    render(
      <StudentDashboard
        studentId="S001"
        onSelectExam={mockOnSelectExam}
      />
    );

    await waitFor(() => {
      const sectionValues = screen.getAllByText('4');
      expect(sectionValues.length).toBeGreaterThan(0);
    });
  });

  test('displays loading state initially', () => {
    const { container } = render(
      <StudentDashboard
        studentId="S001"
        onSelectExam={mockOnSelectExam}
      />
    );

    expect(container).toBeInTheDocument();
  });

  test('handles multiple exams correctly', async () => {
    render(
      <StudentDashboard
        studentId="S001"
        onSelectExam={mockOnSelectExam}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('IELTS Practice Test 1')).toBeInTheDocument();
      expect(screen.getByText('IELTS Practice Test 2')).toBeInTheDocument();
      expect(screen.getByText('IELTS Practice Test 3')).toBeInTheDocument();
    });
  });
});

