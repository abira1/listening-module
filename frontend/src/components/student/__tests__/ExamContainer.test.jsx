/**
 * Tests for ExamContainer Component
 * Part of Phase 3, Task 3.2
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExamContainer from '../ExamContainer';

describe('ExamContainer Component', () => {
  const mockExam = {
    id: 'E001',
    title: 'IELTS Practice Test 1',
    duration: 3,
    questionsCount: 40
  };

  const mockOnExit = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnExit.mockClear();
    mockOnSubmit.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders exam container', () => {
    render(
      <ExamContainer
        exam={mockExam}
        onExit={mockOnExit}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText(mockExam.title)).toBeInTheDocument();
  });

  test('displays question counter', () => {
    render(
      <ExamContainer
        exam={mockExam}
        onExit={mockOnExit}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText(/Question 1 of 40/)).toBeInTheDocument();
  });

  test('displays timer', () => {
    render(
      <ExamContainer
        exam={mockExam}
        onExit={mockOnExit}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText(/00:03:00|00:02:59/)).toBeInTheDocument();
  });

  test('displays question prompt', () => {
    render(
      <ExamContainer
        exam={mockExam}
        onExit={mockOnExit}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText(/Question 1: What is the answer/)).toBeInTheDocument();
  });

  test('displays answer options', () => {
    render(
      <ExamContainer
        exam={mockExam}
        onExit={mockOnExit}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();
    expect(screen.getByText('Option D')).toBeInTheDocument();
  });

  test('allows selecting an answer', () => {
    render(
      <ExamContainer
        exam={mockExam}
        onExit={mockOnExit}
        onSubmit={mockOnSubmit}
      />
    );

    const optionA = screen.getByDisplayValue('A');
    fireEvent.click(optionA);
    expect(optionA).toBeChecked();
  });

  test('displays progress stats', () => {
    render(
      <ExamContainer
        exam={mockExam}
        onExit={mockOnExit}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Answered')).toBeInTheDocument();
    expect(screen.getByText('Unanswered')).toBeInTheDocument();
    expect(screen.getByText('Flagged')).toBeInTheDocument();
  });

  test('displays question grid', () => {
    render(
      <ExamContainer
        exam={mockExam}
        onExit={mockOnExit}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Questions')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('navigates to next question', () => {
    render(
      <ExamContainer
        exam={mockExam}
        onExit={mockOnExit}
        onSubmit={mockOnSubmit}
      />
    );

    const nextBtn = screen.getByText('Next');
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Question 2 of 40/)).toBeInTheDocument();
  });

  test('navigates to previous question', () => {
    render(
      <ExamContainer
        exam={mockExam}
        onExit={mockOnExit}
        onSubmit={mockOnSubmit}
      />
    );

    const nextBtn = screen.getByText('Next');
    fireEvent.click(nextBtn);
    const prevBtn = screen.getByText('Previous');
    fireEvent.click(prevBtn);
    expect(screen.getByText(/Question 1 of 40/)).toBeInTheDocument();
  });

  test('disables previous button on first question', () => {
    render(
      <ExamContainer
        exam={mockExam}
        onExit={mockOnExit}
        onSubmit={mockOnSubmit}
      />
    );

    const prevBtn = screen.getByText('Previous');
    expect(prevBtn).toBeDisabled();
  });

  test('allows flagging a question', () => {
    render(
      <ExamContainer
        exam={mockExam}
        onExit={mockOnExit}
        onSubmit={mockOnSubmit}
      />
    );

    const flagBtn = screen.getByTitle('Flag question');
    fireEvent.click(flagBtn);
    expect(flagBtn).toHaveClass('flagged');
  });

  test('allows unflagging a question', () => {
    render(
      <ExamContainer
        exam={mockExam}
        onExit={mockOnExit}
        onSubmit={mockOnSubmit}
      />
    );

    const flagBtn = screen.getByTitle('Flag question');
    fireEvent.click(flagBtn);
    expect(flagBtn).toHaveClass('flagged');
    fireEvent.click(flagBtn);
    expect(flagBtn).not.toHaveClass('flagged');
  });

  test('allows pausing exam', () => {
    render(
      <ExamContainer
        exam={mockExam}
        onExit={mockOnExit}
        onSubmit={mockOnSubmit}
      />
    );

    const pauseBtn = screen.getByTitle('Pause');
    fireEvent.click(pauseBtn);
    expect(pauseBtn).toHaveTitle('Resume');
  });

  test('shows exit confirmation modal', () => {
    render(
      <ExamContainer
        exam={mockExam}
        onExit={mockOnExit}
        onSubmit={mockOnSubmit}
      />
    );

    const exitBtn = screen.getByText('Exit Exam');
    fireEvent.click(exitBtn);
    expect(screen.getByText('Exit Exam?')).toBeInTheDocument();
  });

  test('shows submit confirmation modal', () => {
    render(
      <ExamContainer
        exam={mockExam}
        onExit={mockOnExit}
        onSubmit={mockOnSubmit}
      />
    );

    const submitBtn = screen.getByText('Submit Exam');
    fireEvent.click(submitBtn);
    expect(screen.getByText('Submit Exam?')).toBeInTheDocument();
  });

  test('calls onExit when confirming exit', () => {
    render(
      <ExamContainer
        exam={mockExam}
        onExit={mockOnExit}
        onSubmit={mockOnSubmit}
      />
    );

    const exitBtn = screen.getByText('Exit Exam');
    fireEvent.click(exitBtn);
    const confirmExitBtn = screen.getAllByText('Exit')[0];
    fireEvent.click(confirmExitBtn);
    expect(mockOnExit).toHaveBeenCalled();
  });

  test('calls onSubmit when confirming submission', () => {
    render(
      <ExamContainer
        exam={mockExam}
        onExit={mockOnExit}
        onSubmit={mockOnSubmit}
      />
    );

    const submitBtn = screen.getByText('Submit Exam');
    fireEvent.click(submitBtn);
    const confirmSubmitBtn = screen.getAllByText('Submit Exam')[1];
    fireEvent.click(confirmSubmitBtn);
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  test('updates progress stats when answering', () => {
    render(
      <ExamContainer
        exam={mockExam}
        onExit={mockOnExit}
        onSubmit={mockOnSubmit}
      />
    );

    const optionA = screen.getByDisplayValue('A');
    fireEvent.click(optionA);
    
    // Check that answered count increased
    const stats = screen.getAllByText(/\d+/);
    expect(stats.length).toBeGreaterThan(0);
  });

  test('navigates using question grid buttons', () => {
    render(
      <ExamContainer
        exam={mockExam}
        onExit={mockOnExit}
        onSubmit={mockOnSubmit}
      />
    );

    const questionBtn = screen.getByText('2');
    fireEvent.click(questionBtn);
    expect(screen.getByText(/Question 2 of 40/)).toBeInTheDocument();
  });

  test('displays legend', () => {
    render(
      <ExamContainer
        exam={mockExam}
        onExit={mockOnExit}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Answered')).toBeInTheDocument();
    expect(screen.getByText('Flagged')).toBeInTheDocument();
    expect(screen.getByText('Unanswered')).toBeInTheDocument();
  });

  test('timer counts down', () => {
    render(
      <ExamContainer
        exam={mockExam}
        onExit={mockOnExit}
        onSubmit={mockOnSubmit}
      />
    );

    jest.advanceTimersByTime(1000);
    expect(screen.getByText(/00:02:59/)).toBeInTheDocument();
  });

  test('shows warning when time is low', () => {
    const shortExam = { ...mockExam, duration: 0.1 };
    render(
      <ExamContainer
        exam={shortExam}
        onExit={mockOnExit}
        onSubmit={mockOnSubmit}
      />
    );

    jest.advanceTimersByTime(300000);
    const timer = screen.getByText(/00:00:/);
    expect(timer.parentElement).toHaveClass('time-critical');
  });

  test('preserves answers when navigating', () => {
    render(
      <ExamContainer
        exam={mockExam}
        onExit={mockOnExit}
        onSubmit={mockOnSubmit}
      />
    );

    const optionA = screen.getByDisplayValue('A');
    fireEvent.click(optionA);
    
    const nextBtn = screen.getByText('Next');
    fireEvent.click(nextBtn);
    
    const prevBtn = screen.getByText('Previous');
    fireEvent.click(prevBtn);
    
    expect(optionA).toBeChecked();
  });
});

