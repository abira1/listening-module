/**
 * Tests for ErrorDetailView Component
 * Part of Phase 2, Task 1.5.2
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorDetailView from '../ErrorDetailView';

describe('ErrorDetailView Component', () => {
  const mockError = {
    field: 'prompt',
    message: 'Prompt is missing',
    severity: 'CRITICAL',
    fix: 'Add the prompt field to the question',
    example: 'Example: "Which of the following is correct?"'
  };

  const mockWarning = {
    field: 'answer_key',
    message: 'Answer key format could be improved',
    severity: 'MEDIUM',
    fix: 'Use consistent format',
    example: 'Example: "A" or ["A", "B"]'
  };

  const mockOnBack = jest.fn();

  beforeEach(() => {
    mockOnBack.mockClear();
  });

  test('renders error detail view with error', () => {
    render(
      <ErrorDetailView
        error={mockError}
        onBack={mockOnBack}
        questionId="Q001"
      />
    );

    expect(screen.getByText('Error Details')).toBeInTheDocument();
    expect(screen.getByText('prompt')).toBeInTheDocument();
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });

  test('renders error detail view with warning', () => {
    render(
      <ErrorDetailView
        warning={mockWarning}
        onBack={mockOnBack}
        questionId="Q001"
      />
    );

    expect(screen.getByText('Error Details')).toBeInTheDocument();
    expect(screen.getByText('answer_key')).toBeInTheDocument();
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
  });

  test('displays error message', () => {
    render(
      <ErrorDetailView
        error={mockError}
        onBack={mockOnBack}
        questionId="Q001"
      />
    );

    expect(screen.getByText('Prompt is missing')).toBeInTheDocument();
  });

  test('displays fix suggestion', () => {
    render(
      <ErrorDetailView
        error={mockError}
        onBack={mockOnBack}
        questionId="Q001"
      />
    );

    expect(screen.getByText('Add the prompt field to the question')).toBeInTheDocument();
  });

  test('displays example when shown', () => {
    render(
      <ErrorDetailView
        error={mockError}
        onBack={mockOnBack}
        questionId="Q001"
      />
    );

    const showButton = screen.getByText('Show');
    fireEvent.click(showButton);

    expect(screen.getByText(/Which of the following is correct/)).toBeInTheDocument();
  });

  test('toggles example visibility', () => {
    render(
      <ErrorDetailView
        error={mockError}
        onBack={mockOnBack}
        questionId="Q001"
      />
    );

    let showButton = screen.getByText('Show');
    fireEvent.click(showButton);
    expect(screen.getByText('Hide')).toBeInTheDocument();

    const hideButton = screen.getByText('Hide');
    fireEvent.click(hideButton);
    expect(screen.getByText('Show')).toBeInTheDocument();
  });

  test('displays question ID', () => {
    render(
      <ErrorDetailView
        error={mockError}
        onBack={mockOnBack}
        questionId="Q001"
      />
    );

    expect(screen.getByText('Q001')).toBeInTheDocument();
  });

  test('displays severity information', () => {
    render(
      <ErrorDetailView
        error={mockError}
        onBack={mockOnBack}
        questionId="Q001"
      />
    );

    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });

  test('displays deployment impact for critical error', () => {
    render(
      <ErrorDetailView
        error={mockError}
        onBack={mockOnBack}
        questionId="Q001"
      />
    );

    expect(screen.getByText(/blocks deployment/)).toBeInTheDocument();
  });

  test('displays deployment impact for high error', () => {
    const highError = { ...mockError, severity: 'HIGH' };
    render(
      <ErrorDetailView
        error={highError}
        onBack={mockOnBack}
        questionId="Q001"
      />
    );

    expect(screen.getByText(/should be fixed/)).toBeInTheDocument();
  });

  test('displays deployment impact for medium warning', () => {
    render(
      <ErrorDetailView
        warning={mockWarning}
        onBack={mockOnBack}
        questionId="Q001"
      />
    );

    expect(screen.getByText(/should be reviewed/)).toBeInTheDocument();
  });

  test('displays action items', () => {
    render(
      <ErrorDetailView
        error={mockError}
        onBack={mockOnBack}
        questionId="Q001"
      />
    );

    expect(screen.getByText(/Review the issue description/)).toBeInTheDocument();
    expect(screen.getByText(/Apply the suggested fix/)).toBeInTheDocument();
  });

  test('calls onBack when back button is clicked', () => {
    render(
      <ErrorDetailView
        error={mockError}
        onBack={mockOnBack}
        questionId="Q001"
      />
    );

    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  test('calls onBack when back to report button is clicked', () => {
    render(
      <ErrorDetailView
        error={mockError}
        onBack={mockOnBack}
        questionId="Q001"
      />
    );

    const backButtons = screen.getAllByText('Back to Report');
    fireEvent.click(backButtons[0]);

    expect(mockOnBack).toHaveBeenCalled();
  });

  test('copies fix suggestion to clipboard', () => {
    const clipboardSpy = jest.spyOn(navigator.clipboard, 'writeText');

    render(
      <ErrorDetailView
        error={mockError}
        onBack={mockOnBack}
        questionId="Q001"
      />
    );

    const copyButtons = screen.getAllByText('Copy');
    fireEvent.click(copyButtons[0]);

    expect(clipboardSpy).toHaveBeenCalledWith(mockError.fix);
    clipboardSpy.mockRestore();
  });

  test('copies example to clipboard', () => {
    const clipboardSpy = jest.spyOn(navigator.clipboard, 'writeText');

    render(
      <ErrorDetailView
        error={mockError}
        onBack={mockOnBack}
        questionId="Q001"
      />
    );

    const showButton = screen.getByText('Show');
    fireEvent.click(showButton);

    const copyButtons = screen.getAllByText('Copy');
    fireEvent.click(copyButtons[1]);

    expect(clipboardSpy).toHaveBeenCalledWith(mockError.example);
    clipboardSpy.mockRestore();
  });

  test('returns null when no error or warning provided', () => {
    const { container } = render(
      <ErrorDetailView
        error={null}
        warning={null}
        onBack={mockOnBack}
        questionId="Q001"
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('displays error type in info grid', () => {
    render(
      <ErrorDetailView
        error={mockError}
        onBack={mockOnBack}
        questionId="Q001"
      />
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  test('displays warning type in info grid', () => {
    render(
      <ErrorDetailView
        warning={mockWarning}
        onBack={mockOnBack}
        questionId="Q001"
      />
    );

    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  test('handles missing example gracefully', () => {
    const errorNoExample = { ...mockError, example: null };
    render(
      <ErrorDetailView
        error={errorNoExample}
        onBack={mockOnBack}
        questionId="Q001"
      />
    );

    expect(screen.queryByText('Example')).not.toBeInTheDocument();
  });

  test('displays all severity levels correctly', () => {
    const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

    severities.forEach(severity => {
      const { unmount } = render(
        <ErrorDetailView
          error={{ ...mockError, severity }}
          onBack={mockOnBack}
          questionId="Q001"
        />
      );

      expect(screen.getByText(severity)).toBeInTheDocument();
      unmount();
    });
  });
});

