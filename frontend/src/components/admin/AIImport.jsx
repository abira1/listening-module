import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, Eye, AlertCircle, Download, Loader, Tabs } from 'lucide-react';
import { BackendService } from '../../services/BackendService';
import { useNavigate } from 'react-router-dom';
import { AIPrompts } from './AIPrompts';
import { JSONFileUpload } from './JSONFileUpload';

export function AIImport() {
  const [activeTab, setActiveTab] = useState('paste'); // 'paste' or 'upload'
  const [jsonInput, setJsonInput] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [showToastMsg, setShowToastMsg] = useState(null);
  const navigate = useNavigate();

  const showToast = (message, type = 'info') => {
    setShowToastMsg({ message, type });
    setTimeout(() => setShowToastMsg(null), 3000);
  };

  // Handle JSON validation
  const handleValidate = async () => {
    if (!jsonInput.trim()) {
      showToast('Please paste JSON data', 'error');
      return;
    }

    setIsValidating(true);
    setValidationResult(null);
    setPreviewData(null);

    try {
      // Parse JSON first
      const jsonData = JSON.parse(jsonInput);
      
      // Call backend validation endpoint
      const result = await BackendService.validateAIImport(jsonData);
      
      setValidationResult(result);
      
      if (result.valid) {
        setPreviewData(jsonData);
        showToast('✅ JSON validated successfully!', 'success');
      } else {
        showToast('❌ Validation errors found', 'error');
      }
    } catch (error) {
      console.error('Validation error:', error);
      
      // Handle JSON syntax errors
      if (error.message.includes('JSON') || error.message.includes('Unexpected')) {
        setValidationResult({
          valid: false,
          errors: ['Invalid JSON format. Please check your syntax. Use jsonlint.com to validate.']
        });
      } 
      // Handle backend validation errors
      else if (error.response?.data) {
        const errorData = error.response.data;
        let errors = [];
        
        // Handle Pydantic validation errors
        if (errorData.detail && Array.isArray(errorData.detail)) {
          errors = errorData.detail.map(err => {
            const field = err.loc ? err.loc.join(' → ') : 'Unknown field';
            const message = err.msg || 'Validation error';
            return `${field}: ${message}`;
          });
        } 
        // Handle string error detail
        else if (typeof errorData.detail === 'string') {
          errors = [errorData.detail];
        }
        // Handle error object
        else if (errorData.errors) {
          errors = errorData.errors;
        }
        // Fallback
        else {
          errors = ['Validation failed. Please check your JSON structure.'];
        }
        
        setValidationResult({
          valid: false,
          errors: errors
        });
      }
      // Handle other errors
      else {
        setValidationResult({
          valid: false,
          errors: [error.message || 'Validation failed. Please check your JSON.']
        });
      }
      showToast('Validation failed', 'error');
    } finally {
      setIsValidating(false);
    }
  };

  // Handle track creation
  const handleCreateTrack = async () => {
    if (!validationResult?.valid) {
      showToast('Please validate JSON first', 'error');
      return;
    }

    setIsCreating(true);
    try {
      const jsonData = JSON.parse(jsonInput);
      const result = await BackendService.createTrackFromAI(jsonData);
      
      showToast(
        `🎉 Track created successfully! ${result.questions_created} questions added.`,
        'success'
      );
      
      // Reset form
      setJsonInput('');
      setValidationResult(null);
      setPreviewData(null);
      
      // Navigate to track library after 2 seconds
      setTimeout(() => {
        navigate('/admin/tracks');
      }, 2000);
      
    } catch (error) {
      showToast(error.message || 'Failed to create track', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Toast Notification */}
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
            <Upload className="w-8 h-8 text-blue-600" />
            Import Questions from AI
          </h2>
          <p className="text-gray-600">
            Extract questions from PDF using AI tools, then upload or paste the JSON to create a track.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'paste'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📝 Paste JSON
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'upload'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📁 Upload File
          </button>
        </div>

        {/* Paste Tab Content */}
        {activeTab === 'paste' && (
          <>
            {/* Instructions */}
            <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-lg">
              <h3 className="font-semibold mb-3 text-lg text-blue-900">📋 How to Use:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-2">
                <li className="pl-2">Copy your PDF text content</li>
                <li className="pl-2">Use <strong>ChatGPT</strong>, <strong>Claude</strong>, or <strong>Gemini</strong> with our extraction prompt below</li>
                <li className="pl-2">Copy the <strong>JSON output</strong> from AI (only the JSON, no other text)</li>
                <li className="pl-2">Paste it in the textarea below and click <strong>Validate JSON</strong></li>
                <li className="pl-2">Review the preview and click <strong>Create Track</strong></li>
              </ol>

              <button
                onClick={() => setShowPrompts(!showPrompts)}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {showPrompts ? 'Hide' : 'View'} AI Prompts for Each Test Type
              </button>
            </div>

            {/* Prompts Section */}
            {showPrompts && (
              <div className="mb-6">
                <AIPrompts />
              </div>
            )}

            {/* JSON Input */}
            <div className="mb-6">
              <label className="block font-semibold mb-2 text-lg">
                Paste AI-Generated JSON:
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full h-96 p-4 border-2 border-gray-300 rounded-lg font-mono text-sm focus:border-blue-500 focus:outline-none"
                placeholder={`{\n  "test_type": "listening",\n  "title": "IELTS Listening Test 2",\n  "description": "Complete test with 40 questions",\n  "duration_seconds": 2004,\n  "audio_url": "https://...",\n  "sections": [\n    ...\n  ]\n}`}
              />
              <p className="mt-2 text-sm text-gray-500">
                💡 <strong>Tip:</strong> Make sure to paste ONLY the JSON object (starting with <code>{'{'}</code> and ending with <code>{'}'}</code>)
              </p>
            </div>
          </>
        )}

        {/* Upload Tab Content */}
        {activeTab === 'upload' && (
          <JSONFileUpload />
        )}

        {/* Action Buttons - Only for Paste Tab */}
        {activeTab === 'paste' && (
          <>
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleValidate}
                disabled={isValidating || !jsonInput.trim()}
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
                    Validate JSON
                  </>
                )}
              </button>

              {validationResult?.valid && (
                <button
                  onClick={() => setPreviewData(previewData ? null : JSON.parse(jsonInput))}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 font-medium transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  {previewData ? 'Hide Preview' : 'Preview Questions'}
                </button>
              )}

              {jsonInput.trim() && (
                <button
                  onClick={() => {
                    setJsonInput('');
                    setValidationResult(null);
                    setPreviewData(null);
                  }}
                  className="px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Validation Result */}
            {validationResult && (
              <ValidationDisplay result={validationResult} />
            )}

            {/* Preview */}
            {previewData && validationResult?.valid && (
              <PreviewDisplay data={previewData} />
            )}

            {/* Create Button */}
            {validationResult?.valid && (
              <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-r-lg">
                <p className="mb-4 text-sm text-green-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <strong>JSON validated successfully. Ready to create track!</strong>
                </p>

                {previewData.test_type === 'listening' && !previewData.audio_url && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 inline mr-2 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      <strong>Warning:</strong> Listening test requires an audio URL. Please add it to your JSON.
                    </span>
                  </div>
                )}

                <button
                  onClick={handleCreateTrack}
                  disabled={isCreating}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-lg transition-colors flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Creating Track...
                    </>
                  ) : (
                    <>
                      🚀 Create Track from JSON
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function ValidationDisplay({ result }) {
  if (result.valid) {
    return (
      <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg mb-6">
        <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2 text-lg">
          <CheckCircle className="w-6 h-6 text-green-600" />
          ✅ Validation Successful
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white p-3 rounded-lg border border-green-200">
            <p className="text-xs text-gray-600 mb-1">Test Type</p>
            <p className="font-bold text-gray-900">{result.test_type.toUpperCase()}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-green-200">
            <p className="text-xs text-gray-600 mb-1">Total Questions</p>
            <p className="font-bold text-gray-900">{result.total_questions}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-green-200">
            <p className="text-xs text-gray-600 mb-1">Sections</p>
            <p className="font-bold text-gray-900">{result.total_sections}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-green-200">
            <p className="text-xs text-gray-600 mb-1">Duration</p>
            <p className="font-bold text-gray-900">{result.duration_minutes} min</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-green-200">
            <p className="text-xs text-gray-600 mb-1">Audio</p>
            <p className="font-bold text-gray-900">{result.has_audio ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>
        
        <div className="mt-4 bg-white p-4 rounded-lg border border-green-200">
          <strong className="block mb-3 text-gray-900">Section Breakdown:</strong>
          <div className="space-y-2">
            {result.section_breakdown.map(section => (
              <div key={section.section_number} className="flex items-start gap-2 text-sm">
                <span className="font-semibold text-blue-600">Section {section.section_number}:</span>
                <div>
                  <p className="text-gray-800">{section.question_count} questions</p>
                  <p className="text-gray-600 text-xs">
                    {Object.entries(section.question_types).map(([type, count]) => 
                      `${count} ${type.replace(/_/g, ' ')}`
                    ).join(', ')}
                  </p>
                  {section.has_passage && (
                    <p className="text-green-600 text-xs">✓ Has passage text</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg mb-6">
        <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2 text-lg">
          <XCircle className="w-6 h-6 text-red-600" />
          ❌ Validation Errors
        </h3>
        <div className="bg-white p-4 rounded-lg border border-red-200">
          <p className="text-sm text-red-800 mb-3">Please fix the following issues:</p>
          <ul className="list-disc list-inside space-y-2 text-sm text-red-700">
            {result.errors.map((error, idx) => (
              <li key={idx} className="pl-2">{error}</li>
            ))}
          </ul>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          💡 <strong>Tip:</strong> Check your JSON format and ensure all required fields are present with correct values.
        </p>
      </div>
    );
  }
}

function PreviewDisplay({ data }) {
  return (
    <div className="p-6 bg-gray-50 border-2 border-gray-300 rounded-lg mb-6">
      <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
        <Eye className="w-6 h-6 text-blue-600" />
        👁️ Preview: {data.title}
      </h3>
      
      <div className="space-y-6">
        {data.sections.map(section => (
          <div key={section.index} className="bg-white p-4 rounded-lg border border-gray-300">
            <h4 className="font-bold text-lg mb-2 text-blue-900">
              📋 {section.title}
            </h4>
            <p className="text-sm text-gray-600 mb-3 italic">{section.instructions}</p>
            
            {section.passage_text && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                <strong className="block mb-1 text-blue-900">Passage Preview:</strong>
                <p className="text-gray-700">{section.passage_text.substring(0, 300)}...</p>
              </div>
            )}
            
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">
                Questions ({section.questions.length} total):
              </p>
              {section.questions.slice(0, 3).map(q => (
                <div key={q.index} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                  <p className="mb-1">
                    <strong>Q{q.index}.</strong> [{q.type.replace(/_/g, ' ')}]
                  </p>
                  <p className="text-gray-700 mb-2">{q.prompt}</p>
                  {q.options && (
                    <p className="text-xs text-gray-600 ml-4">
                      <strong>Options:</strong> {q.options.join(' | ')}
                    </p>
                  )}
                  {q.answer_key && (
                    <p className="text-xs text-green-700 ml-4 font-medium">
                      ✅ Answer: {q.answer_key}
                    </p>
                  )}
                </div>
              ))}
              {section.questions.length > 3 && (
                <p className="text-sm text-gray-500 ml-2 italic">
                  ... and {section.questions.length - 3} more questions
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
