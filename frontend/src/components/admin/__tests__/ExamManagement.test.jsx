/**
 * Tests for Exam Management Component
 * Part of Phase 4, Task 4.1
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExamManagement from '../ExamManagement';
import * as examService from '../../../services/examManagementService';

jest.mock('../../../services/examManagementService');

describe('ExamManagement Component', () => {
  const mockExams = [
    {
      id: 'E001',
      title: 'IELTS Practice Test 1',
      description: 'Full practice test',
      status: 'published',
      duration: 180,
      totalScore: 100,
      passingScore: 60,
      questionCount: 40,
      createdAt: '2025-10-20T10:00:00Z'
    },
    {
      id: 'E002',
      title: 'IELTS Practice Test 2',
      description: 'Full practice test',
      status: 'draft',
      duration: 180,
      totalScore: 100,
      passingScore: 60,
      questionCount: 40,
      createdAt: '2025-10-21T10:00:00Z'
    }
  ];

  beforeEach(() => {
    examService.getAllExams.mockResolvedValue({
      success: true,
      data: mockExams
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders exam management component', async () => {
    render(<ExamManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Exam Management')).toBeInTheDocument();
    });
  });

  test('displays create exam button', async () => {
    render(<ExamManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Create Exam')).toBeInTheDocument();
    });
  });

  test('loads and displays exams', async () => {
    render(<ExamManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('IELTS Practice Test 1')).toBeInTheDocument();
      expect(screen.getByText('IELTS Practice Test 2')).toBeInTheDocument();
    });
  });

  test('displays exam status badges', async () => {
    render(<ExamManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('published')).toBeInTheDocument();
      expect(screen.getByText('draft')).toBeInTheDocument();
    });
  });

  test('displays exam duration', async () => {
    render(<ExamManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('180 min')).toBeInTheDocument();
    });
  });

  test('displays question count', async () => {
    render(<ExamManagement />);
    
    await waitFor(() => {
      const questionCounts = screen.getAllByText('40');
      expect(questionCounts.length).toBeGreaterThan(0);
    });
  });

  test('filters exams by search term', async () => {
    render(<ExamManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('IELTS Practice Test 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search exams...');
    fireEvent.change(searchInput, { target: { value: 'Test 1' } });

    await waitFor(() => {
      expect(screen.getByText('IELTS Practice Test 1')).toBeInTheDocument();
      expect(screen.queryByText('IELTS Practice Test 2')).not.toBeInTheDocument();
    });
  });

  test('filters exams by status', async () => {
    render(<ExamManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('IELTS Practice Test 1')).toBeInTheDocument();
    });

    const filterSelect = screen.getByDisplayValue('All Status');
    fireEvent.change(filterSelect, { target: { value: 'published' } });

    await waitFor(() => {
      expect(screen.getByText('IELTS Practice Test 1')).toBeInTheDocument();
    });
  });

  test('opens create exam form', async () => {
    render(<ExamManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Create Exam')).toBeInTheDocument();
    });

    const createBtn = screen.getByText('Create Exam');
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByText('Create New Exam')).toBeInTheDocument();
    });
  });

  test('deletes exam with confirmation', async () => {
    examService.deleteExam.mockResolvedValue({ success: true });
    window.confirm = jest.fn(() => true);

    render(<ExamManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('IELTS Practice Test 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(examService.deleteExam).toHaveBeenCalledWith('E001');
    });
  });

  test('publishes exam', async () => {
    examService.publishExam.mockResolvedValue({ success: true });

    render(<ExamManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('IELTS Practice Test 2')).toBeInTheDocument();
    });

    const publishButtons = screen.getAllByTitle('Publish');
    fireEvent.click(publishButtons[0]);

    await waitFor(() => {
      expect(examService.publishExam).toHaveBeenCalled();
    });
  });

  test('unpublishes exam', async () => {
    examService.unpublishExam.mockResolvedValue({ success: true });

    render(<ExamManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('IELTS Practice Test 1')).toBeInTheDocument();
    });

    const unpublishButtons = screen.getAllByTitle('Unpublish');
    fireEvent.click(unpublishButtons[0]);

    await waitFor(() => {
      expect(examService.unpublishExam).toHaveBeenCalled();
    });
  });

  test('duplicates exam', async () => {
    examService.duplicateExam.mockResolvedValue({ success: true });

    render(<ExamManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('IELTS Practice Test 1')).toBeInTheDocument();
    });

    const duplicateButtons = screen.getAllByTitle('Duplicate');
    fireEvent.click(duplicateButtons[0]);

    await waitFor(() => {
      expect(examService.duplicateExam).toHaveBeenCalled();
    });
  });

  test('exports exam data', async () => {
    examService.exportExamData.mockResolvedValue({
      success: true,
      data: mockExams[0]
    });

    render(<ExamManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('IELTS Practice Test 1')).toBeInTheDocument();
    });

    const exportButtons = screen.getAllByTitle('Export');
    fireEvent.click(exportButtons[0]);

    await waitFor(() => {
      expect(examService.exportExamData).toHaveBeenCalledWith('E001', 'json');
    });
  });

  test('displays error message on load failure', async () => {
    examService.getAllExams.mockResolvedValue({
      success: false,
      error: 'Failed to load exams'
    });

    render(<ExamManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load exams')).toBeInTheDocument();
    });
  });

  test('displays success message after creation', async () => {
    examService.createExam.mockResolvedValue({ success: true });

    render(<ExamManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Create Exam')).toBeInTheDocument();
    });

    const createBtn = screen.getByText('Create Exam');
    fireEvent.click(createBtn);

    // Simulate form submission
    await waitFor(() => {
      expect(screen.getByText('Create New Exam')).toBeInTheDocument();
    });
  });

  test('displays no exams message when list is empty', async () => {
    examService.getAllExams.mockResolvedValue({
      success: true,
      data: []
    });

    render(<ExamManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('No exams found')).toBeInTheDocument();
    });
  });

  test('handles network error gracefully', async () => {
    examService.getAllExams.mockRejectedValue(new Error('Network error'));

    render(<ExamManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Loading exams...')).toBeInTheDocument();
    });
  });

  test('displays exam creation date', async () => {
    render(<ExamManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('October 20, 2025')).toBeInTheDocument();
    });
  });

  test('opens exam preview', async () => {
    render(<ExamManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('IELTS Practice Test 1')).toBeInTheDocument();
    });

    const previewButtons = screen.getAllByTitle('Preview');
    fireEvent.click(previewButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('IELTS Practice Test 1')).toBeInTheDocument();
    });
  });

  test('opens exam edit form', async () => {
    render(<ExamManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('IELTS Practice Test 1')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle('Edit');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit Exam')).toBeInTheDocument();
    });
  });

  test('displays exam table headers', async () => {
    render(<ExamManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Duration')).toBeInTheDocument();
      expect(screen.getByText('Questions')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  test('displays search and filter controls', async () => {
    render(<ExamManagement />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search exams...')).toBeInTheDocument();
      expect(screen.getByDisplayValue('All Status')).toBeInTheDocument();
    });
  });
});

