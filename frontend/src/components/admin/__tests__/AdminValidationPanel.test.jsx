/**
 * Tests for AdminValidationPanel Component
 * Part of Phase 2, Task 1.5.4
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminValidationPanel from '../AdminValidationPanel';

describe('AdminValidationPanel Component', () => {
  const mockValidationResult = {
    is_valid: true,
    deployment_ready: true,
    detected_type: 'reading_multiple_choice_single',
    errors: [
      {
        field: 'prompt',
        message: 'Prompt is missing',
        severity: 'CRITICAL',
        fix: 'Add prompt'
      }
    ],
    warnings: [
      {
        field: 'options',
        message: 'Options could be improved',
        severity: 'MEDIUM'
      }
    ]
  };

  const mockOnRefresh = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnRefresh.mockClear();
    mockOnClose.mockClear();
  });

  test('renders admin validation panel', () => {
    render(
      <AdminValidationPanel
        validationResult={mockValidationResult}
        questionId="Q001"
        onRefresh={mockOnRefresh}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Validation Report')).toBeInTheDocument();
    expect(screen.getByText('Question: Q001')).toBeInTheDocument();
  });

  test('displays tabs', () => {
    render(
      <AdminValidationPanel
        validationResult={mockValidationResult}
        questionId="Q001"
        onRefresh={mockOnRefresh}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText(/Errors/)).toBeInTheDocument();
    expect(screen.getByText(/Warnings/)).toBeInTheDocument();
    expect(screen.getByText('Readiness')).toBeInTheDocument();
  });

  test('displays error count in tab', () => {
    render(
      <AdminValidationPanel
        validationResult={mockValidationResult}
        questionId="Q001"
        onRefresh={mockOnRefresh}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Errors \(1\)/)).toBeInTheDocument();
  });

  test('displays warning count in tab', () => {
    render(
      <AdminValidationPanel
        validationResult={mockValidationResult}
        questionId="Q001"
        onRefresh={mockOnRefresh}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Warnings \(1\)/)).toBeInTheDocument();
  });

  test('switches to errors tab', () => {
    render(
      <AdminValidationPanel
        validationResult={mockValidationResult}
        questionId="Q001"
        onRefresh={mockOnRefresh}
        onClose={mockOnClose}
      />
    );

    const errorsTab = screen.getByText(/Errors/);
    fireEvent.click(errorsTab);

    expect(screen.getByText('Errors (1)')).toBeInTheDocument();
  });

  test('switches to warnings tab', () => {
    render(
      <AdminValidationPanel
        validationResult={mockValidationResult}
        questionId="Q001"
        onRefresh={mockOnRefresh}
        onClose={mockOnClose}
      />
    );

    const warningsTab = screen.getByText(/Warnings/);
    fireEvent.click(warningsTab);

    expect(screen.getByText('Warnings (1)')).toBeInTheDocument();
  });

  test('switches to readiness tab', () => {
    render(
      <AdminValidationPanel
        validationResult={mockValidationResult}
        questionId="Q001"
        onRefresh={mockOnRefresh}
        onClose={mockOnClose}
      />
    );

    const readinessTab = screen.getByText('Readiness');
    fireEvent.click(readinessTab);

    expect(screen.getByText('Deployment Readiness')).toBeInTheDocument();
  });

  test('displays status badges', () => {
    render(
      <AdminValidationPanel
        validationResult={mockValidationResult}
        questionId="Q001"
        onRefresh={mockOnRefresh}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Valid/)).toBeInTheDocument();
    expect(screen.getByText(/Ready to Deploy/)).toBeInTheDocument();
  });

  test('calls onRefresh when refresh button clicked', () => {
    render(
      <AdminValidationPanel
        validationResult={mockValidationResult}
        questionId="Q001"
        onRefresh={mockOnRefresh}
        onClose={mockOnClose}
      />
    );

    const refreshButtons = screen.getAllByRole('button');
    const refreshButton = refreshButtons.find(btn => btn.title === 'Refresh validation');
    fireEvent.click(refreshButton);

    expect(mockOnRefresh).toHaveBeenCalled();
  });

  test('calls onClose when close button clicked', () => {
    render(
      <AdminValidationPanel
        validationResult={mockValidationResult}
        questionId="Q001"
        onRefresh={mockOnRefresh}
        onClose={mockOnClose}
      />
    );

    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find(btn => btn.title === 'Close panel');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('calls onClose when close button in footer clicked', () => {
    render(
      <AdminValidationPanel
        validationResult={mockValidationResult}
        questionId="Q001"
        onRefresh={mockOnRefresh}
        onClose={mockOnClose}
      />
    );

    const closeButtons = screen.getAllByText('Close');
    fireEvent.click(closeButtons[0]);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('downloads report when download button clicked', () => {
    const createElementSpy = jest.spyOn(document, 'createElement');
    const appendChildSpy = jest.spyOn(document.body, 'appendChild');
    const removeChildSpy = jest.spyOn(document.body, 'removeChild');

    render(
      <AdminValidationPanel
        validationResult={mockValidationResult}
        questionId="Q001"
        onRefresh={mockOnRefresh}
        onClose={mockOnClose}
      />
    );

    const downloadButtons = screen.getAllByRole('button');
    const downloadButton = downloadButtons.find(btn => btn.title === 'Download report');
    fireEvent.click(downloadButton);

    expect(createElementSpy).toHaveBeenCalledWith('a');
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  test('returns null when validationResult is null', () => {
    const { container } = render(
      <AdminValidationPanel
        validationResult={null}
        questionId="Q001"
        onRefresh={mockOnRefresh}
        onClose={mockOnClose}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('displays errors in errors tab', () => {
    render(
      <AdminValidationPanel
        validationResult={mockValidationResult}
        questionId="Q001"
        onRefresh={mockOnRefresh}
        onClose={mockOnClose}
      />
    );

    const errorsTab = screen.getByText(/Errors/);
    fireEvent.click(errorsTab);

    expect(screen.getByText('Prompt is missing')).toBeInTheDocument();
  });

  test('displays warnings in warnings tab', () => {
    render(
      <AdminValidationPanel
        validationResult={mockValidationResult}
        questionId="Q001"
        onRefresh={mockOnRefresh}
        onClose={mockOnClose}
      />
    );

    const warningsTab = screen.getByText(/Warnings/);
    fireEvent.click(warningsTab);

    expect(screen.getByText('Options could be improved')).toBeInTheDocument();
  });

  test('handles empty errors list', () => {
    const resultNoErrors = {
      ...mockValidationResult,
      errors: []
    };

    render(
      <AdminValidationPanel
        validationResult={resultNoErrors}
        questionId="Q001"
        onRefresh={mockOnRefresh}
        onClose={mockOnClose}
      />
    );

    const errorsTab = screen.getByText(/Errors/);
    fireEvent.click(errorsTab);

    expect(screen.getByText('No errors found')).toBeInTheDocument();
  });

  test('handles empty warnings list', () => {
    const resultNoWarnings = {
      ...mockValidationResult,
      warnings: []
    };

    render(
      <AdminValidationPanel
        validationResult={resultNoWarnings}
        questionId="Q001"
        onRefresh={mockOnRefresh}
        onClose={mockOnClose}
      />
    );

    const warningsTab = screen.getByText(/Warnings/);
    fireEvent.click(warningsTab);

    expect(screen.getByText('No warnings found')).toBeInTheDocument();
  });

  test('displays invalid status badge', () => {
    const invalidResult = {
      ...mockValidationResult,
      is_valid: false
    };

    render(
      <AdminValidationPanel
        validationResult={invalidResult}
        questionId="Q001"
        onRefresh={mockOnRefresh}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Invalid/)).toBeInTheDocument();
  });

  test('displays not ready deployment badge', () => {
    const notReadyResult = {
      ...mockValidationResult,
      deployment_ready: false
    };

    render(
      <AdminValidationPanel
        validationResult={notReadyResult}
        questionId="Q001"
        onRefresh={mockOnRefresh}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Not Ready/)).toBeInTheDocument();
  });
});

