/**
 * Tests for Grading Interface Component
 * Part of Phase 4, Task 4.3
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GradingInterface from '../GradingInterface';
import * as teacherService from '../../../services/teacherService';

jest.mock('../../../services/teacherService');

describe('GradingInterface Component', () => {
  const mockSubmission = {
    id: 'SUB001',
    studentName: 'John Doe',
    examTitle: 'IELTS Test 1',
    submittedAt: '2025-10-23 10:00'
  };

  const mockSubmissionDetails = {
    id: 'SUB001',
    answers: [
      {
        questionText: 'What is the capital of France?',
        studentAnswer: 'Paris',
        correctAnswer: 'Paris'
      },
      {
        questionText: 'What is 2+2?',
        studentAnswer: '5',
        correctAnswer: '4'
      }
    ]
  };

  const mockOnComplete = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    teacherService.getSubmissionDetails.mockResolvedValue({
      success: true,
      data: mockSubmissionDetails
    });
    teacherService.gradeSubmission.mockResolvedValue({
      success: true,
      data: { id: 'SUB001', score: 85 }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders grading interface', async () => {
    render(
      <GradingInterface
        submission={mockSubmission}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Grade Submission')).toBeInTheDocument();
  });

  test('displays submission information', async () => {
    render(
      <GradingInterface
        submission={mockSubmission}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('IELTS Test 1')).toBeInTheDocument();
  });

  test('displays submission details', async () => {
    render(
      <GradingInterface
        submission={mockSubmission}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });
  });

  test('displays grading form', async () => {
    render(
      <GradingInterface
        submission={mockSubmission}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText('Score (0-100) *')).toBeInTheDocument();
    expect(screen.getByLabelText('Feedback *')).toBeInTheDocument();
  });

  test('submits grade successfully', async () => {
    render(
      <GradingInterface
        submission={mockSubmission}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    const scoreInput = screen.getByLabelText('Score (0-100) *');
    const feedbackInput = screen.getByLabelText('Feedback *');
    const submitBtn = screen.getByText('Submit Grade');

    fireEvent.change(scoreInput, { target: { value: '85' } });
    fireEvent.change(feedbackInput, { target: { value: 'Good work' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(teacherService.gradeSubmission).toHaveBeenCalledWith(
        'SUB001',
        expect.objectContaining({
          score: 85,
          feedback: 'Good work'
        })
      );
    });
  });

  test('validates score is required', async () => {
    render(
      <GradingInterface
        submission={mockSubmission}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    const feedbackInput = screen.getByLabelText('Feedback *');
    const submitBtn = screen.getByText('Submit Grade');

    fireEvent.change(feedbackInput, { target: { value: 'Good work' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Score is required')).toBeInTheDocument();
    });
  });

  test('validates feedback is required', async () => {
    render(
      <GradingInterface
        submission={mockSubmission}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    const scoreInput = screen.getByLabelText('Score (0-100) *');
    const submitBtn = screen.getByText('Submit Grade');

    fireEvent.change(scoreInput, { target: { value: '85' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Feedback is required')).toBeInTheDocument();
    });
  });

  test('validates score range', async () => {
    render(
      <GradingInterface
        submission={mockSubmission}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    const scoreInput = screen.getByLabelText('Score (0-100) *');
    const feedbackInput = screen.getByLabelText('Feedback *');
    const submitBtn = screen.getByText('Submit Grade');

    fireEvent.change(scoreInput, { target: { value: '150' } });
    fireEvent.change(feedbackInput, { target: { value: 'Good work' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Score must be between 0 and 100')).toBeInTheDocument();
    });
  });

  test('displays success message after submission', async () => {
    render(
      <GradingInterface
        submission={mockSubmission}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    const scoreInput = screen.getByLabelText('Score (0-100) *');
    const feedbackInput = screen.getByLabelText('Feedback *');
    const submitBtn = screen.getByText('Submit Grade');

    fireEvent.change(scoreInput, { target: { value: '85' } });
    fireEvent.change(feedbackInput, { target: { value: 'Good work' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Grade submitted successfully!')).toBeInTheDocument();
    });
  });

  test('calls onComplete after successful submission', async () => {
    jest.useFakeTimers();

    render(
      <GradingInterface
        submission={mockSubmission}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    const scoreInput = screen.getByLabelText('Score (0-100) *');
    const feedbackInput = screen.getByLabelText('Feedback *');
    const submitBtn = screen.getByText('Submit Grade');

    fireEvent.change(scoreInput, { target: { value: '85' } });
    fireEvent.change(feedbackInput, { target: { value: 'Good work' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Grade submitted successfully!')).toBeInTheDocument();
    });

    jest.advanceTimersByTime(1500);

    expect(mockOnComplete).toHaveBeenCalled();

    jest.useRealTimers();
  });

  test('calls onCancel when cancel button clicked', async () => {
    render(
      <GradingInterface
        submission={mockSubmission}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('calls onCancel when close button clicked', async () => {
    render(
      <GradingInterface
        submission={mockSubmission}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    const closeBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(closeBtn);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('handles submission error', async () => {
    teacherService.gradeSubmission.mockResolvedValue({
      success: false,
      error: 'Failed to grade submission'
    });

    render(
      <GradingInterface
        submission={mockSubmission}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    const scoreInput = screen.getByLabelText('Score (0-100) *');
    const feedbackInput = screen.getByLabelText('Feedback *');
    const submitBtn = screen.getByText('Submit Grade');

    fireEvent.change(scoreInput, { target: { value: '85' } });
    fireEvent.change(feedbackInput, { target: { value: 'Good work' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Failed to grade submission')).toBeInTheDocument();
    });
  });

  test('loads submission details on mount', async () => {
    render(
      <GradingInterface
        submission={mockSubmission}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(teacherService.getSubmissionDetails).toHaveBeenCalledWith('SUB001');
    });
  });

  test('displays all student answers', async () => {
    render(
      <GradingInterface
        submission={mockSubmission}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
      expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
    });
  });

  test('disables submit button while loading', async () => {
    teacherService.gradeSubmission.mockImplementation(
      () => new Promise(() => {})
    );

    render(
      <GradingInterface
        submission={mockSubmission}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    const scoreInput = screen.getByLabelText('Score (0-100) *');
    const feedbackInput = screen.getByLabelText('Feedback *');
    const submitBtn = screen.getByText('Submit Grade');

    fireEvent.change(scoreInput, { target: { value: '85' } });
    fireEvent.change(feedbackInput, { target: { value: 'Good work' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitBtn).toBeDisabled();
    });
  });
});

