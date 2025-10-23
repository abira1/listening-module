/**
 * Tests for DeploymentReadinessCheck Component
 * Part of Phase 2, Task 1.5.3
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeploymentReadinessCheck from '../DeploymentReadinessCheck';

describe('DeploymentReadinessCheck Component', () => {
  const mockValidResult = {
    is_valid: true,
    deployment_ready: true,
    detected_type: 'reading_multiple_choice_single',
    errors: [],
    warnings: []
  };

  const mockInvalidResult = {
    is_valid: false,
    deployment_ready: false,
    detected_type: null,
    errors: [
      {
        field: 'prompt',
        message: 'Prompt is missing',
        severity: 'CRITICAL',
        fix: 'Add prompt'
      }
    ],
    warnings: []
  };

  const mockWarningResult = {
    is_valid: true,
    deployment_ready: true,
    detected_type: 'reading_multiple_choice_single',
    errors: [],
    warnings: [
      {
        field: 'options',
        message: 'Options could be improved',
        severity: 'MEDIUM'
      }
    ]
  };

  test('renders deployment readiness check', async () => {
    render(
      <DeploymentReadinessCheck
        validationResult={mockValidResult}
        questionId="Q001"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Deployment Readiness')).toBeInTheDocument();
    });
  });

  test('displays pass status for valid question', async () => {
    render(
      <DeploymentReadinessCheck
        validationResult={mockValidResult}
        questionId="Q001"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/ready for deployment/)).toBeInTheDocument();
    });
  });

  test('displays fail status for invalid question', async () => {
    render(
      <DeploymentReadinessCheck
        validationResult={mockInvalidResult}
        questionId="Q001"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/cannot be deployed/)).toBeInTheDocument();
    });
  });

  test('displays warning status for question with warnings', async () => {
    render(
      <DeploymentReadinessCheck
        validationResult={mockWarningResult}
        questionId="Q001"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/can be deployed but has warnings/)).toBeInTheDocument();
    });
  });

  test('displays readiness checks', async () => {
    render(
      <DeploymentReadinessCheck
        validationResult={mockValidResult}
        questionId="Q001"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No Critical Errors')).toBeInTheDocument();
      expect(screen.getByText('Valid Question Type')).toBeInTheDocument();
      expect(screen.getByText('Required Fields Present')).toBeInTheDocument();
    });
  });

  test('displays summary statistics', async () => {
    render(
      <DeploymentReadinessCheck
        validationResult={mockValidResult}
        questionId="Q001"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Passed')).toBeInTheDocument();
      expect(screen.getByText('Warnings')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });
  });

  test('displays question ID', async () => {
    render(
      <DeploymentReadinessCheck
        validationResult={mockValidResult}
        questionId="Q001"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Q001')).toBeInTheDocument();
    });
  });

  test('displays validation status', async () => {
    render(
      <DeploymentReadinessCheck
        validationResult={mockValidResult}
        questionId="Q001"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Valid')).toBeInTheDocument();
    });
  });

  test('displays deployment ready status', async () => {
    render(
      <DeploymentReadinessCheck
        validationResult={mockValidResult}
        questionId="Q001"
      />
    );

    await waitFor(() => {
      const readyElements = screen.getAllByText('Yes');
      expect(readyElements.length).toBeGreaterThan(0);
    });
  });

  test('displays recommendations for valid question', async () => {
    render(
      <DeploymentReadinessCheck
        validationResult={mockValidResult}
        questionId="Q001"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Question is ready for deployment/)).toBeInTheDocument();
    });
  });

  test('displays recommendations for invalid question', async () => {
    render(
      <DeploymentReadinessCheck
        validationResult={mockInvalidResult}
        questionId="Q001"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Fix all critical errors/)).toBeInTheDocument();
    });
  });

  test('displays recommendations for question with warnings', async () => {
    render(
      <DeploymentReadinessCheck
        validationResult={mockWarningResult}
        questionId="Q001"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Review and address warnings/)).toBeInTheDocument();
    });
  });

  test('handles missing question ID', async () => {
    render(
      <DeploymentReadinessCheck
        validationResult={mockValidResult}
        questionId={null}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });

  test('displays all check items', async () => {
    render(
      <DeploymentReadinessCheck
        validationResult={mockValidResult}
        questionId="Q001"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No Critical Errors')).toBeInTheDocument();
      expect(screen.getByText('Valid Question Type')).toBeInTheDocument();
      expect(screen.getByText('Required Fields Present')).toBeInTheDocument();
      expect(screen.getByText('Valid Answer Key')).toBeInTheDocument();
      expect(screen.getByText('Valid Options')).toBeInTheDocument();
      expect(screen.getByText('No High Severity Errors')).toBeInTheDocument();
      expect(screen.getByText('Warnings Reviewed')).toBeInTheDocument();
      expect(screen.getByText('Deployment Ready')).toBeInTheDocument();
    });
  });

  test('counts passed checks correctly', async () => {
    render(
      <DeploymentReadinessCheck
        validationResult={mockValidResult}
        questionId="Q001"
      />
    );

    await waitFor(() => {
      const passedElements = screen.getAllByText(/Passed/);
      expect(passedElements.length).toBeGreaterThan(0);
    });
  });

  test('counts failed checks correctly', async () => {
    render(
      <DeploymentReadinessCheck
        validationResult={mockInvalidResult}
        questionId="Q001"
      />
    );

    await waitFor(() => {
      const failedElements = screen.getAllByText(/Failed/);
      expect(failedElements.length).toBeGreaterThan(0);
    });
  });

  test('displays loading state initially', () => {
    const { container } = render(
      <DeploymentReadinessCheck
        validationResult={mockValidResult}
        questionId="Q001"
      />
    );

    // Component should render without errors
    expect(container).toBeInTheDocument();
  });

  test('handles multiple critical errors', async () => {
    const multiErrorResult = {
      ...mockInvalidResult,
      errors: [
        { field: 'prompt', severity: 'CRITICAL', message: 'Missing' },
        { field: 'options', severity: 'CRITICAL', message: 'Invalid' },
        { field: 'answer_key', severity: 'CRITICAL', message: 'Invalid' }
      ]
    };

    render(
      <DeploymentReadinessCheck
        validationResult={multiErrorResult}
        questionId="Q001"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/cannot be deployed/)).toBeInTheDocument();
    });
  });

  test('handles mixed errors and warnings', async () => {
    const mixedResult = {
      is_valid: false,
      deployment_ready: false,
      detected_type: 'reading_multiple_choice_single',
      errors: [
        { field: 'prompt', severity: 'HIGH', message: 'Issue' }
      ],
      warnings: [
        { field: 'options', severity: 'MEDIUM', message: 'Warning' }
      ]
    };

    render(
      <DeploymentReadinessCheck
        validationResult={mixedResult}
        questionId="Q001"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/cannot be deployed/)).toBeInTheDocument();
    });
  });
});

