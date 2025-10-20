import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, XCircle, AlertCircle, Loader, FileJson } from 'lucide-react';
import { BackendService } from '../../services/BackendService';
import { useNavigate } from 'react-router-dom';

export function JSONFileUpload() {
  const [file, setFile] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showToastMsg, setShowToastMsg] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const showToast = (message, type = 'info') => {
    setShowToastMsg({ message, type });
    setTimeout(() => setShowToastMsg(null), 3000);
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.json')) {
        showToast('Please select a JSON file', 'error');
        return;
      }
      setFile(selectedFile);
      setValidationResult(null);
      setUploadProgress(0);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (!droppedFile.name.endsWith('.json')) {
        showToast('Please drop a JSON file', 'error');
        return;
      }
      setFile(droppedFile);
      setValidationResult(null);
      setUploadProgress(0);
    }
  };

  // Validate file
  const handleValidate = async () => {
    if (!file) {
      showToast('Please select a file', 'error');
      return;
    }

    setIsValidating(true);
    try {
      const result = await BackendService.validateJSONFile(file);
      setValidationResult(result);

      if (result.is_valid) {
        showToast('✅ JSON file validated successfully!', 'success');
      } else {
        showToast('❌ Validation errors found', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Validation failed', 'error');
      setValidationResult({
        is_valid: false,
        errors: [error.message || 'Validation failed'],
        warnings: []
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Upload file
  const handleUpload = async () => {
    if (!file) {
      showToast('Please select a file', 'error');
      return;
    }

    if (!validationResult?.is_valid) {
      showToast('Please validate file first', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await BackendService.uploadJSONFile(file, (progress) => {
        setUploadProgress(progress);
      });

      showToast(
        `🎉 Track created! ${result.questions_created} questions added.`,
        'success'
      );

      // Reset form
      setFile(null);
      setValidationResult(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Navigate to track library
      setTimeout(() => {
        navigate('/admin/tracks');
      }, 2000);
    } catch (error) {
      showToast(error.message || 'Upload failed', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Toast */}
      {showToastMsg && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          showToastMsg.type === 'success' ? 'bg-green-500' :
          showToastMsg.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } text-white font-medium`}>
          {showToastMsg.message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <FileJson className="w-8 h-8 text-blue-600" />
            Upload JSON File
          </h2>
          <p className="text-gray-600">
            Upload a JSON file to create a track with automatic type detection
          </p>
        </div>

        {/* File Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="mb-6 p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-lg font-semibold text-gray-700 mb-1">
              {file ? file.name : 'Click to select or drag & drop'}
            </p>
            <p className="text-sm text-gray-500">
              JSON files only (.json)
            </p>
          </div>
        </div>

        {/* File Info */}
        {file && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Selected:</strong> {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleValidate}
            disabled={!file || isValidating || isUploading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
          >
            {isValidating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Validate
              </>
            )}
          </button>

          {file && (
            <button
              onClick={() => {
                setFile(null);
                setValidationResult(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Validation Result */}
        {validationResult && (
          <ValidationResult result={validationResult} />
        )}

        {/* Upload Button */}
        {validationResult?.is_valid && (
          <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-r-lg">
            <p className="mb-4 text-sm text-green-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <strong>Ready to upload!</strong>
            </p>

            {isUploading && (
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Uploading...
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-lg transition-colors flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  🚀 Upload & Create Track
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Validation Result Component
function ValidationResult({ result }) {
  if (result.is_valid) {
    return (
      <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg mb-6">
        <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2 text-lg">
          <CheckCircle className="w-6 h-6 text-green-600" />
          ✅ Validation Successful
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded-lg border border-green-200">
            <p className="text-xs text-gray-600 mb-1">Questions</p>
            <p className="font-bold text-gray-900">{result.total_questions}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-green-200">
            <p className="text-xs text-gray-600 mb-1">Sections</p>
            <p className="font-bold text-gray-900">{result.total_sections}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-green-200">
            <p className="text-xs text-gray-600 mb-1">Question Types</p>
            <p className="font-bold text-gray-900">
              {Object.keys(result.questions_by_type).length}
            </p>
          </div>
        </div>

        {result.warnings && result.warnings.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Warnings:</strong>
            </p>
            <ul className="list-disc list-inside text-sm text-yellow-700 mt-2">
              {result.warnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg mb-6">
      <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2 text-lg">
        <XCircle className="w-6 h-6 text-red-600" />
        ❌ Validation Errors
      </h3>
      <div className="bg-white p-4 rounded-lg border border-red-200">
        <ul className="list-disc list-inside space-y-2 text-sm text-red-700">
          {result.errors?.map((error, idx) => (
            <li key={idx} className="pl-2">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

