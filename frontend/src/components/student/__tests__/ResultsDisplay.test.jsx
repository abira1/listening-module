/**
 * Tests for ResultsDisplay Component
 * Part of Phase 3, Task 3.6
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResultsDisplay from '../ResultsDisplay';

describe('ResultsDisplay Component', () => {
  const mockResults = {
    score: 75,
    totalScore: 100,
    percentage: 75,
    correctAnswers: 30,
    incorrectAnswers: 10,
    unansweredQuestions: 0,
    totalQuestions: 40,
    accuracy: 75,
    timeSpent: '2:15:30',
    rank: 5,
    totalAttempts: 10,
    sections: [
      {
        name: 'Reading',
        score: 20,
        totalScore: 25,
        percentage: 80,
        questionsCount: 10,
        correctAnswers: 8,
        incorrectAnswers: 2,
        timeSpent: '30:00'
      }
    ],
    questions: [
      {
        id: 'Q1',
        prompt: 'What is the answer?',
        correct: true,
        userAnswer: 'A',
        correctAnswer: 'A',
        explanation: 'This is correct because...'
      }
    ],
    previousAttempts: [
      { percentage: 60 },
      { percentage: 70 },
      { percentage: 75 }
    ],
    strengths: ['Reading comprehension', 'Vocabulary'],
    weaknesses: ['Grammar', 'Listening'],
    recommendations: ['Practice more listening exercises', 'Review grammar rules']
  };

  const mockExam = {
    id: 'E001',
    title: 'IELTS Practice Test 1'
  };

  const mockOnClose = jest.fn();
  const mockOnRetake = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnRetake.mockClear();
  });

  test('renders results display', () => {
    render(
      <ResultsDisplay
        results={mockResults}
        exam={mockExam}
        onClose={mockOnClose}
        onRetake={mockOnRetake}
      />
    );

    expect(screen.getByText('Exam Results')).toBeInTheDocument();
  });

  test('displays exam title', () => {
    render(
      <ResultsDisplay
        results={mockResults}
        exam={mockExam}
        onClose={mockOnClose}
        onRetake={mockOnRetake}
      />
    );

    expect(screen.getByText(mockExam.title)).toBeInTheDocument();
  });

  test('displays score percentage', () => {
    render(
      <ResultsDisplay
        results={mockResults}
        exam={mockExam}
        onClose={mockOnClose}
        onRetake={mockOnRetake}
      />
    );

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  test('displays score label', () => {
    render(
      <ResultsDisplay
        results={mockResults}
        exam={mockExam}
        onClose={mockOnClose}
        onRetake={mockOnRetake}
      />
    );

    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  test('displays score details', () => {
    render(
      <ResultsDisplay
        results={mockResults}
        exam={mockExam}
        onClose={mockOnClose}
        onRetake={mockOnRetake}
      />
    );

    expect(screen.getByText('75/100')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  test('displays action buttons', () => {
    render(
      <ResultsDisplay
        results={mockResults}
        exam={mockExam}
        onClose={mockOnClose}
        onRetake={mockOnRetake}
      />
    );

    expect(screen.getByText('Download')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
    expect(screen.getByText('Retake Exam')).toBeInTheDocument();
  });

  test('calls onRetake when retake button clicked', () => {
    render(
      <ResultsDisplay
        results={mockResults}
        exam={mockExam}
        onClose={mockOnClose}
        onRetake={mockOnRetake}
      />
    );

    const retakeBtn = screen.getByText('Retake Exam');
    fireEvent.click(retakeBtn);
    expect(mockOnRetake).toHaveBeenCalled();
  });

  test('displays tabs', () => {
    render(
      <ResultsDisplay
        results={mockResults}
        exam={mockExam}
        onClose={mockOnClose}
        onRetake={mockOnRetake}
      />
    );

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('By Section')).toBeInTheDocument();
    expect(screen.getByText('Questions')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  test('switches to sections tab', () => {
    render(
      <ResultsDisplay
        results={mockResults}
        exam={mockExam}
        onClose={mockOnClose}
        onRetake={mockOnRetake}
      />
    );

    const sectionsTab = screen.getByText('By Section');
    fireEvent.click(sectionsTab);
    expect(screen.getByText('Reading')).toBeInTheDocument();
  });

  test('switches to questions tab', () => {
    render(
      <ResultsDisplay
        results={mockResults}
        exam={mockExam}
        onClose={mockOnClose}
        onRetake={mockOnRetake}
      />
    );

    const questionsTab = screen.getByText('Questions');
    fireEvent.click(questionsTab);
    expect(screen.getByText('What is the answer?')).toBeInTheDocument();
  });

  test('switches to analytics tab', () => {
    render(
      <ResultsDisplay
        results={mockResults}
        exam={mockExam}
        onClose={mockOnClose}
        onRetake={mockOnRetake}
      />
    );

    const analyticsTab = screen.getByText('Analytics');
    fireEvent.click(analyticsTab);
    expect(screen.getByText('Performance Trend')).toBeInTheDocument();
  });

  test('displays overview stats', () => {
    render(
      <ResultsDisplay
        results={mockResults}
        exam={mockExam}
        onClose={mockOnClose}
        onRetake={mockOnRetake}
      />
    );

    expect(screen.getByText('Performance')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Rank')).toBeInTheDocument();
  });

  test('displays question breakdown', () => {
    render(
      <ResultsDisplay
        results={mockResults}
        exam={mockExam}
        onClose={mockOnClose}
        onRetake={mockOnRetake}
      />
    );

    expect(screen.getByText('Question Breakdown')).toBeInTheDocument();
  });

  test('displays section details when expanded', () => {
    render(
      <ResultsDisplay
        results={mockResults}
        exam={mockExam}
        onClose={mockOnClose}
        onRetake={mockOnRetake}
      />
    );

    const sectionsTab = screen.getByText('By Section');
    fireEvent.click(sectionsTab);

    const sectionHeader = screen.getByText('Reading');
    fireEvent.click(sectionHeader);

    expect(screen.getByText('Questions')).toBeInTheDocument();
  });

  test('displays question results', () => {
    render(
      <ResultsDisplay
        results={mockResults}
        exam={mockExam}
        onClose={mockOnClose}
        onRetake={mockOnRetake}
      />
    );

    const questionsTab = screen.getByText('Questions');
    fireEvent.click(questionsTab);

    expect(screen.getByText(/Q1/)).toBeInTheDocument();
    expect(screen.getByText(/Correct/)).toBeInTheDocument();
  });

  test('displays strengths and weaknesses', () => {
    render(
      <ResultsDisplay
        results={mockResults}
        exam={mockExam}
        onClose={mockOnClose}
        onRetake={mockOnRetake}
      />
    );

    const analyticsTab = screen.getByText('Analytics');
    fireEvent.click(analyticsTab);

    expect(screen.getByText('Strengths & Weaknesses')).toBeInTheDocument();
  });

  test('displays recommendations', () => {
    render(
      <ResultsDisplay
        results={mockResults}
        exam={mockExam}
        onClose={mockOnClose}
        onRetake={mockOnRetake}
      />
    );

    const analyticsTab = screen.getByText('Analytics');
    fireEvent.click(analyticsTab);

    expect(screen.getByText('Recommendations')).toBeInTheDocument();
  });

  test('calls onClose when close button clicked', () => {
    render(
      <ResultsDisplay
        results={mockResults}
        exam={mockExam}
        onClose={mockOnClose}
        onRetake={mockOnRetake}
      />
    );

    const closeBtn = screen.getByText('Close');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('displays correct score color for excellent', () => {
    const excellentResults = { ...mockResults, percentage: 90 };
    const { container } = render(
      <ResultsDisplay
        results={excellentResults}
        exam={mockExam}
        onClose={mockOnClose}
        onRetake={mockOnRetake}
      />
    );

    const scoreSummary = container.querySelector('.score-summary');
    expect(scoreSummary).toHaveClass('score-excellent');
  });

  test('displays correct score color for poor', () => {
    const poorResults = { ...mockResults, percentage: 40 };
    const { container } = render(
      <ResultsDisplay
        results={poorResults}
        exam={mockExam}
        onClose={mockOnClose}
        onRetake={mockOnRetake}
      />
    );

    const scoreSummary = container.querySelector('.score-summary');
    expect(scoreSummary).toHaveClass('score-poor');
  });

  test('displays download button', () => {
    render(
      <ResultsDisplay
        results={mockResults}
        exam={mockExam}
        onClose={mockOnClose}
        onRetake={mockOnRetake}
      />
    );

    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  test('displays share button', () => {
    render(
      <ResultsDisplay
        results={mockResults}
        exam={mockExam}
        onClose={mockOnClose}
        onRetake={mockOnRetake}
      />
    );

    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  test('handles empty sections gracefully', () => {
    const noSectionsResults = { ...mockResults, sections: [] };
    render(
      <ResultsDisplay
        results={noSectionsResults}
        exam={mockExam}
        onClose={mockOnClose}
        onRetake={mockOnRetake}
      />
    );

    expect(screen.getByText('Exam Results')).toBeInTheDocument();
  });

  test('handles empty questions gracefully', () => {
    const noQuestionsResults = { ...mockResults, questions: [] };
    render(
      <ResultsDisplay
        results={noQuestionsResults}
        exam={mockExam}
        onClose={mockOnClose}
        onRetake={mockOnRetake}
      />
    );

    expect(screen.getByText('Exam Results')).toBeInTheDocument();
  });
});

