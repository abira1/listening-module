/**
 * Tests for ValidationErrorPanel Component
 * Part of Phase 1, Task 1.5
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ValidationErrorPanel from '../ValidationErrorPanel';

describe('ValidationErrorPanel Component', () => {
  const mockValidationResult = {
    is_valid: false,
    deployment_ready: false,
    errors: [
      {
        field: 'prompt',
        message: 'Prompt is missing',
        severity: 'CRITICAL',
        fix: 'Add the prompt field',
        example: 'Example: "Which is correct?"'
      },
      {
        field: 'options',
        message: 'Options array is empty',
        severity: 'HIGH',
        fix: 'Add at least 2 options',
        example: 'Example: [{"text": "A", "value": "A"}]'
      }
    ],
    warnings: [
      {
        field: 'answer_key',
        message: 'Answer key format could be improved',
        severity: 'MEDIUM',
        fix: 'Use consistent format',
        example: 'Example: "A" or ["A", "B"]'
      }
    ],
    summary: {
      critical_count: 1,
      high_count: 1,
      medium_count: 1,
      low_count: 0,
      total_errors: 2,
      total_warnings: 1
    }
  };

  const mockValidResult = {
    is_valid: true,
    deployment_ready: true,
    errors: [],
    warnings: [],
    summary: {
      critical_count: 0,
      high_count: 0,
      medium_count: 0,
      low_count: 0,
      total_errors: 0,
      total_warnings: 0
    }
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  test('renders validation error panel with title', () => {
    render(
      <ValidationErrorPanel
        validationResult={mockValidationResult}
        questionId="Q001"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Validation Report')).toBeInTheDocument();
    expect(screen.getByText('Question: Q001')).toBeInTheDocument();
  });

  test('displays invalid status when validation fails', () => {
    render(
      <ValidationErrorPanel
        validationResult={mockValidationResult}
        questionId="Q001"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('❌ INVALID')).toBeInTheDocument();
    expect(screen.getByText('Deployment Ready: ❌ No')).toBeInTheDocument();
  });

  test('displays valid status when validation passes', () => {
    render(
      <ValidationErrorPanel
        validationResult={mockValidResult}
        questionId="Q001"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('✅ VALID')).toBeInTheDocument();
    expect(screen.getByText('Deployment Ready: ✅ Yes')).toBeInTheDocument();
  });

  test('displays error summary statistics', () => {
    render(
      <ValidationErrorPanel
        validationResult={mockValidationResult}
        questionId="Q001"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument(); // Critical count
    expect(screen.getByText('1')).toBeInTheDocument(); // High count
  });

  test('displays errors section with error count', () => {
    render(
      <ValidationErrorPanel
        validationResult={mockValidationResult}
        questionId="Q001"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Errors \(2\)/)).toBeInTheDocument();
    expect(screen.getByText('Prompt is missing')).toBeInTheDocument();
    expect(screen.getByText('Options array is empty')).toBeInTheDocument();
  });

  test('displays warnings section with warning count', () => {
    render(
      <ValidationErrorPanel
        validationResult={mockValidationResult}
        questionId="Q001"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Warnings \(1\)/)).toBeInTheDocument();
    expect(screen.getByText('Answer key format could be improved')).toBeInTheDocument();
  });

  test('expands error details when clicked', () => {
    render(
      <ValidationErrorPanel
        validationResult={mockValidationResult}
        questionId="Q001"
        onClose={mockOnClose}
      />
    );

    const errorHeader = screen.getByText('Prompt is missing').closest('.error-header');
    fireEvent.click(errorHeader);

    expect(screen.getByText('Add the prompt field')).toBeInTheDocument();
    expect(screen.getByText(/Example: "Which is correct\?"/)).toBeInTheDocument();
  });

  test('expands warning details when clicked', () => {
    render(
      <ValidationErrorPanel
        validationResult={mockValidationResult}
        questionId="Q001"
        onClose={mockOnClose}
      />
    );

    const warningHeader = screen.getByText('Answer key format could be improved').closest('.warning-header');
    fireEvent.click(warningHeader);

    expect(screen.getByText('Use consistent format')).toBeInTheDocument();
  });

  test('displays success message when validation passes', () => {
    render(
      <ValidationErrorPanel
        validationResult={mockValidResult}
        questionId="Q001"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Question is valid and ready for deployment/)).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    render(
      <ValidationErrorPanel
        validationResult={mockValidationResult}
        questionId="Q001"
        onClose={mockOnClose}
      />
    );

    const closeButtons = screen.getAllByText('Close');
    fireEvent.click(closeButtons[0]);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('downloads report when download button is clicked', () => {
    const createElementSpy = jest.spyOn(document, 'createElement');
    const appendChildSpy = jest.spyOn(document.body, 'appendChild');
    const removeChildSpy = jest.spyOn(document.body, 'removeChild');

    render(
      <ValidationErrorPanel
        validationResult={mockValidationResult}
        questionId="Q001"
        onClose={mockOnClose}
      />
    );

    const downloadButtons = screen.getAllByText(/Download Report/);
    fireEvent.click(downloadButtons[0]);

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  test('returns null when validationResult is null', () => {
    const { container } = render(
      <ValidationErrorPanel
        validationResult={null}
        questionId="Q001"
        onClose={mockOnClose}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('displays severity icons correctly', () => {
    render(
      <ValidationErrorPanel
        validationResult={mockValidationResult}
        questionId="Q001"
        onClose={mockOnClose}
      />
    );

    // Check that severity indicators are present
    const errorItems = screen.getAllByText(/CRITICAL|HIGH|MEDIUM/);
    expect(errorItems.length).toBeGreaterThan(0);
  });

  test('handles multiple errors and warnings', () => {
    const complexResult = {
      ...mockValidationResult,
      errors: [
        ...mockValidationResult.errors,
        {
          field: 'audio_url',
          message: 'Audio file not found',
          severity: 'HIGH',
          fix: 'Upload audio file',
          example: 'Example: "audio/test.ogg"'
        }
      ]
    };

    render(
      <ValidationErrorPanel
        validationResult={complexResult}
        questionId="Q001"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Errors \(3\)/)).toBeInTheDocument();
    expect(screen.getByText('Audio file not found')).toBeInTheDocument();
  });

  test('displays question ID when provided', () => {
    render(
      <ValidationErrorPanel
        validationResult={mockValidationResult}
        questionId="LISTENING_001"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Question: LISTENING_001')).toBeInTheDocument();
  });

  test('handles missing optional fields gracefully', () => {
    const minimalResult = {
      is_valid: true,
      deployment_ready: true,
      errors: [],
      warnings: [],
      summary: {}
    };

    render(
      <ValidationErrorPanel
        validationResult={minimalResult}
        questionId="Q001"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('✅ VALID')).toBeInTheDocument();
  });
});

