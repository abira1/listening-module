import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { JSONFileUpload } from '../JSONFileUpload';
import * as BackendService from '../../../services/BackendService';

// Mock the BackendService
jest.mock('../../../services/BackendService');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('JSONFileUpload Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <JSONFileUpload />
      </BrowserRouter>
    );
  };

  // Test 1: Component renders
  test('renders file upload component', () => {
    renderComponent();
    expect(screen.getByText(/Upload JSON File/i)).toBeInTheDocument();
  });

  // Test 2: File input exists
  test('has file input element', () => {
    renderComponent();
    const fileInput = screen.getByRole('button', { name: /select file/i });
    expect(fileInput).toBeInTheDocument();
  });

  // Test 3: Drag and drop area exists
  test('has drag and drop area', () => {
    renderComponent();
    const dropArea = screen.getByText(/drag and drop/i);
    expect(dropArea).toBeInTheDocument();
  });

  // Test 4: File selection
  test('handles file selection', async () => {
    renderComponent();
    const fileInput = screen.getByRole('button', { name: /select file/i });
    
    const file = new File(['{}'], 'test.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText(/test.json/i)).toBeInTheDocument();
    });
  });

  // Test 5: Reject non-JSON files
  test('rejects non-JSON files', async () => {
    renderComponent();
    const fileInput = screen.getByRole('button', { name: /select file/i });
    
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText(/Please select a JSON file/i)).toBeInTheDocument();
    });
  });

  // Test 6: Validate button exists
  test('has validate button', () => {
    renderComponent();
    const validateButton = screen.getByRole('button', { name: /validate/i });
    expect(validateButton).toBeInTheDocument();
  });

  // Test 7: Validate button disabled when no file
  test('validate button is disabled when no file selected', () => {
    renderComponent();
    const validateButton = screen.getByRole('button', { name: /validate/i });
    expect(validateButton).toBeDisabled();
  });

  // Test 8: Validate button enabled when file selected
  test('validate button is enabled when file selected', async () => {
    renderComponent();
    const fileInput = screen.getByRole('button', { name: /select file/i });
    
    const file = new File(['{}'], 'test.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      const validateButton = screen.getByRole('button', { name: /validate/i });
      expect(validateButton).not.toBeDisabled();
    });
  });

  // Test 9: Validation call
  test('calls validation endpoint when validate button clicked', async () => {
    BackendService.validateJSONFile.mockResolvedValue({
      is_valid: true,
      total_questions: 10,
      questions_by_type: { mcq_single: 5, true_false_ng: 5 }
    });

    renderComponent();
    const fileInput = screen.getByRole('button', { name: /select file/i });
    
    const file = new File(['{}'], 'test.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      const validateButton = screen.getByRole('button', { name: /validate/i });
      fireEvent.click(validateButton);
    });

    await waitFor(() => {
      expect(BackendService.validateJSONFile).toHaveBeenCalledWith(file);
    });
  });

  // Test 10: Display validation results
  test('displays validation results', async () => {
    BackendService.validateJSONFile.mockResolvedValue({
      is_valid: true,
      total_questions: 10,
      questions_by_type: { mcq_single: 5, true_false_ng: 5 }
    });

    renderComponent();
    const fileInput = screen.getByRole('button', { name: /select file/i });
    
    const file = new File(['{}'], 'test.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      const validateButton = screen.getByRole('button', { name: /validate/i });
      fireEvent.click(validateButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/10 questions/i)).toBeInTheDocument();
    });
  });

  // Test 11: Upload button exists
  test('has upload button', async () => {
    BackendService.validateJSONFile.mockResolvedValue({
      is_valid: true,
      total_questions: 10,
      questions_by_type: { mcq_single: 5 }
    });

    renderComponent();
    const fileInput = screen.getByRole('button', { name: /select file/i });
    
    const file = new File(['{}'], 'test.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      const validateButton = screen.getByRole('button', { name: /validate/i });
      fireEvent.click(validateButton);
    });

    await waitFor(() => {
      const uploadButton = screen.getByRole('button', { name: /upload/i });
      expect(uploadButton).toBeInTheDocument();
    });
  });

  // Test 12: Upload functionality
  test('calls upload endpoint when upload button clicked', async () => {
    BackendService.validateJSONFile.mockResolvedValue({
      is_valid: true,
      total_questions: 10,
      questions_by_type: { mcq_single: 5 }
    });

    BackendService.uploadJSONFile.mockResolvedValue({
      success: true,
      track_id: 'track123',
      questions_created: 10
    });

    renderComponent();
    const fileInput = screen.getByRole('button', { name: /select file/i });
    
    const file = new File(['{}'], 'test.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      const validateButton = screen.getByRole('button', { name: /validate/i });
      fireEvent.click(validateButton);
    });

    await waitFor(() => {
      const uploadButton = screen.getByRole('button', { name: /upload/i });
      fireEvent.click(uploadButton);
    });

    await waitFor(() => {
      expect(BackendService.uploadJSONFile).toHaveBeenCalledWith(file, expect.any(Function));
    });
  });

  // Test 13: Progress indicator
  test('shows progress indicator during upload', async () => {
    BackendService.validateJSONFile.mockResolvedValue({
      is_valid: true,
      total_questions: 10,
      questions_by_type: { mcq_single: 5 }
    });

    BackendService.uploadJSONFile.mockImplementation((file, onProgress) => {
      onProgress(50);
      return Promise.resolve({
        success: true,
        track_id: 'track123',
        questions_created: 10
      });
    });

    renderComponent();
    const fileInput = screen.getByRole('button', { name: /select file/i });
    
    const file = new File(['{}'], 'test.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      const validateButton = screen.getByRole('button', { name: /validate/i });
      fireEvent.click(validateButton);
    });

    await waitFor(() => {
      const uploadButton = screen.getByRole('button', { name: /upload/i });
      fireEvent.click(uploadButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/50%/i)).toBeInTheDocument();
    });
  });

  // Test 14: Error handling
  test('displays error message on validation failure', async () => {
    BackendService.validateJSONFile.mockRejectedValue(
      new Error('Invalid JSON format')
    );

    renderComponent();
    const fileInput = screen.getByRole('button', { name: /select file/i });
    
    const file = new File(['invalid'], 'test.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      const validateButton = screen.getByRole('button', { name: /validate/i });
      fireEvent.click(validateButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON format/i)).toBeInTheDocument();
    });
  });

  // Test 15: Redirect on success
  test('redirects to track library on successful upload', async () => {
    BackendService.validateJSONFile.mockResolvedValue({
      is_valid: true,
      total_questions: 10,
      questions_by_type: { mcq_single: 5 }
    });

    BackendService.uploadJSONFile.mockResolvedValue({
      success: true,
      track_id: 'track123',
      questions_created: 10
    });

    renderComponent();
    const fileInput = screen.getByRole('button', { name: /select file/i });
    
    const file = new File(['{}'], 'test.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      const validateButton = screen.getByRole('button', { name: /validate/i });
      fireEvent.click(validateButton);
    });

    await waitFor(() => {
      const uploadButton = screen.getByRole('button', { name: /upload/i });
      fireEvent.click(uploadButton);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/tracks');
    }, { timeout: 3000 });
  });
});

