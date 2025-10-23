/**
 * Integration Tests for Admin Panel Components
 * Part of Phase 2, Task 1.5.5
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminValidationPanel from '../AdminValidationPanel';
import ValidationErrorPanel from '../ValidationErrorPanel';
import ErrorDetailView from '../ErrorDetailView';
import DeploymentReadinessCheck from '../DeploymentReadinessCheck';

describe('Admin Panel Integration Tests', () => {
  const mockCompleteValidationResult = {
    is_valid: true,
    deployment_ready: true,
    detected_type: 'reading_multiple_choice_single',
    errors: [
      {
        field: 'prompt',
        message: 'Prompt is too short',
        severity: 'HIGH',
        fix: 'Expand the prompt to at least 50 characters',
        example: 'Example: "Which of the following best describes..."'
      },
      {
        field: 'options',
        message: 'Options are not balanced',
        severity: 'MEDIUM',
        fix: 'Ensure all options have similar length',
        example: 'Example: ["Option A", "Option B", "Option C"]'
      }
    ],
    warnings: [
      {
        field: 'answer_key',
        message: 'Answer key could be more specific',
        severity: 'LOW',
        fix: 'Consider using array format for multiple answers',
        example: 'Example: ["A", "B"]'
      }
    ],
    summary: {
      critical_count: 0,
      high_count: 1,
      medium_count: 1,
      low_count: 1,
      total_errors: 2,
      total_warnings: 1,
      can_deploy: true
    }
  };

  const mockOnRefresh = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnRefresh.mockClear();
    mockOnClose.mockClear();
  });

  describe('Admin Validation Panel Integration', () => {
    test('renders all components together', () => {
      render(
        <AdminValidationPanel
          validationResult={mockCompleteValidationResult}
          questionId="Q001"
          onRefresh={mockOnRefresh}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Validation Report')).toBeInTheDocument();
      expect(screen.getByText('Question: Q001')).toBeInTheDocument();
    });

    test('displays overview tab with validation error panel', () => {
      render(
        <AdminValidationPanel
          validationResult={mockCompleteValidationResult}
          questionId="Q001"
          onRefresh={mockOnRefresh}
          onClose={mockOnClose}
        />
      );

      const overviewTab = screen.getByText('Overview');
      fireEvent.click(overviewTab);

      expect(screen.getByText(/Validation Report/)).toBeInTheDocument();
    });

    test('navigates between all tabs', () => {
      render(
        <AdminValidationPanel
          validationResult={mockCompleteValidationResult}
          questionId="Q001"
          onRefresh={mockOnRefresh}
          onClose={mockOnClose}
        />
      );

      // Click errors tab
      fireEvent.click(screen.getByText(/Errors/));
      expect(screen.getByText('Errors (2)')).toBeInTheDocument();

      // Click warnings tab
      fireEvent.click(screen.getByText(/Warnings/));
      expect(screen.getByText('Warnings (1)')).toBeInTheDocument();

      // Click readiness tab
      fireEvent.click(screen.getByText('Readiness'));
      expect(screen.getByText('Deployment Readiness')).toBeInTheDocument();

      // Click overview tab
      fireEvent.click(screen.getByText('Overview'));
      expect(screen.getByText('Validation Report')).toBeInTheDocument();
    });

    test('displays error details when error clicked', () => {
      render(
        <AdminValidationPanel
          validationResult={mockCompleteValidationResult}
          questionId="Q001"
          onRefresh={mockOnRefresh}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByText(/Errors/));
      const errorItem = screen.getByText('Prompt is too short');
      fireEvent.click(errorItem);

      expect(screen.getByText('Error Details')).toBeInTheDocument();
    });

    test('displays warning details when warning clicked', () => {
      render(
        <AdminValidationPanel
          validationResult={mockCompleteValidationResult}
          questionId="Q001"
          onRefresh={mockOnRefresh}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByText(/Warnings/));
      const warningItem = screen.getByText('Answer key could be more specific');
      fireEvent.click(warningItem);

      expect(screen.getByText('Error Details')).toBeInTheDocument();
    });

    test('returns from error detail view', () => {
      render(
        <AdminValidationPanel
          validationResult={mockCompleteValidationResult}
          questionId="Q001"
          onRefresh={mockOnRefresh}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByText(/Errors/));
      fireEvent.click(screen.getByText('Prompt is too short'));

      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);

      expect(screen.getByText('Errors (2)')).toBeInTheDocument();
    });
  });

  describe('Error Detail View Integration', () => {
    test('displays error with all details', () => {
      const error = mockCompleteValidationResult.errors[0];
      render(
        <ErrorDetailView
          error={error}
          onBack={jest.fn()}
          questionId="Q001"
        />
      );

      expect(screen.getByText('prompt')).toBeInTheDocument();
      expect(screen.getByText('Prompt is too short')).toBeInTheDocument();
      expect(screen.getByText('Expand the prompt to at least 50 characters')).toBeInTheDocument();
    });

    test('shows example when toggled', () => {
      const error = mockCompleteValidationResult.errors[0];
      render(
        <ErrorDetailView
          error={error}
          onBack={jest.fn()}
          questionId="Q001"
        />
      );

      const showButton = screen.getByText('Show');
      fireEvent.click(showButton);

      expect(screen.getByText(/Which of the following best describes/)).toBeInTheDocument();
    });

    test('copies fix suggestion to clipboard', () => {
      const clipboardSpy = jest.spyOn(navigator.clipboard, 'writeText');
      const error = mockCompleteValidationResult.errors[0];

      render(
        <ErrorDetailView
          error={error}
          onBack={jest.fn()}
          questionId="Q001"
        />
      );

      const copyButtons = screen.getAllByText('Copy');
      fireEvent.click(copyButtons[0]);

      expect(clipboardSpy).toHaveBeenCalledWith(error.fix);
      clipboardSpy.mockRestore();
    });
  });

  describe('Deployment Readiness Check Integration', () => {
    test('displays readiness checks', async () => {
      render(
        <DeploymentReadinessCheck
          validationResult={mockCompleteValidationResult}
          questionId="Q001"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Deployment Readiness')).toBeInTheDocument();
      });
    });

    test('shows pass status for valid question', async () => {
      render(
        <DeploymentReadinessCheck
          validationResult={mockCompleteValidationResult}
          questionId="Q001"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/ready for deployment/)).toBeInTheDocument();
      });
    });

    test('displays all readiness checks', async () => {
      render(
        <DeploymentReadinessCheck
          validationResult={mockCompleteValidationResult}
          questionId="Q001"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No Critical Errors')).toBeInTheDocument();
        expect(screen.getByText('Valid Question Type')).toBeInTheDocument();
        expect(screen.getByText('Required Fields Present')).toBeInTheDocument();
      });
    });
  });

  describe('Full Workflow Integration', () => {
    test('complete workflow: view errors, check details, review readiness', () => {
      render(
        <AdminValidationPanel
          validationResult={mockCompleteValidationResult}
          questionId="Q001"
          onRefresh={mockOnRefresh}
          onClose={mockOnClose}
        />
      );

      // Step 1: View errors
      fireEvent.click(screen.getByText(/Errors/));
      expect(screen.getByText('Errors (2)')).toBeInTheDocument();

      // Step 2: Click on first error
      fireEvent.click(screen.getByText('Prompt is too short'));
      expect(screen.getByText('Error Details')).toBeInTheDocument();

      // Step 3: Go back to errors list
      fireEvent.click(screen.getByText('Back'));
      expect(screen.getByText('Errors (2)')).toBeInTheDocument();

      // Step 4: View warnings
      fireEvent.click(screen.getByText(/Warnings/));
      expect(screen.getByText('Warnings (1)')).toBeInTheDocument();

      // Step 5: Check readiness
      fireEvent.click(screen.getByText('Readiness'));
      expect(screen.getByText('Deployment Readiness')).toBeInTheDocument();
    });

    test('handles multiple errors and warnings', () => {
      render(
        <AdminValidationPanel
          validationResult={mockCompleteValidationResult}
          questionId="Q001"
          onRefresh={mockOnRefresh}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByText(/Errors/));
      expect(screen.getByText('Errors (2)')).toBeInTheDocument();

      fireEvent.click(screen.getByText(/Warnings/));
      expect(screen.getByText('Warnings (1)')).toBeInTheDocument();
    });

    test('displays correct status badges', () => {
      render(
        <AdminValidationPanel
          validationResult={mockCompleteValidationResult}
          questionId="Q001"
          onRefresh={mockOnRefresh}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/Valid/)).toBeInTheDocument();
      expect(screen.getByText(/Ready to Deploy/)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles null validation result', () => {
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

    test('handles empty errors and warnings', () => {
      const emptyResult = {
        ...mockCompleteValidationResult,
        errors: [],
        warnings: []
      };

      render(
        <AdminValidationPanel
          validationResult={emptyResult}
          questionId="Q001"
          onRefresh={mockOnRefresh}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByText(/Errors/));
      expect(screen.getByText('No errors found')).toBeInTheDocument();

      fireEvent.click(screen.getByText(/Warnings/));
      expect(screen.getByText('No warnings found')).toBeInTheDocument();
    });

    test('handles missing question ID', () => {
      render(
        <AdminValidationPanel
          validationResult={mockCompleteValidationResult}
          questionId={null}
          onRefresh={mockOnRefresh}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Question: null')).toBeInTheDocument();
    });
  });
});

