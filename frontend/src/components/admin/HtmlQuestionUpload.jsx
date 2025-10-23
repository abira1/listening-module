/**
 * HTML Question Upload Component
 * Admin interface for uploading HTML-based questions
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import BackendService from '@/services/BackendService';

export function HtmlQuestionUpload() {
  const [trackId, setTrackId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [jsonContent, setJsonContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [uploadResults, setUploadResults] = useState(null);

  const handleValidate = async () => {
    try {
      setValidationErrors([]);
      
      if (!jsonContent.trim()) {
        setValidationErrors(['JSON content is empty']);
        return;
      }

      let questions;
      try {
        questions = JSON.parse(jsonContent);
      } catch (e) {
        setValidationErrors([`Invalid JSON: ${e.message}`]);
        return;
      }

      if (!Array.isArray(questions)) {
        setValidationErrors(['JSON must be an array of questions']);
        return;
      }

      // Validate each question
      const errors = [];
      questions.forEach((q, idx) => {
        if (!q.html_content) {
          errors.push(`Question ${idx + 1}: Missing html_content`);
        }
        if (!q.answer_extraction) {
          errors.push(`Question ${idx + 1}: Missing answer_extraction`);
        }
        if (!q.grading_rules) {
          errors.push(`Question ${idx + 1}: Missing grading_rules`);
        }
      });

      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      toast.success(`✅ Validation passed for ${questions.length} questions`);
    } catch (error) {
      setValidationErrors([error.message]);
    }
  };

  const handleUpload = async () => {
    try {
      if (!trackId.trim()) {
        toast.error('Please enter Track ID');
        return;
      }

      if (!sectionId.trim()) {
        toast.error('Please enter Section ID');
        return;
      }

      if (!jsonContent.trim()) {
        toast.error('Please enter JSON content');
        return;
      }

      setLoading(true);
      setValidationErrors([]);

      let questions;
      try {
        questions = JSON.parse(jsonContent);
      } catch (e) {
        toast.error(`Invalid JSON: ${e.message}`);
        return;
      }

      if (!Array.isArray(questions)) {
        toast.error('JSON must be an array of questions');
        return;
      }

      // Upload questions
      const response = await fetch('/api/html-questions/upload-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          track_id: trackId,
          section_id: sectionId,
          questions: questions
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Upload failed');
      }

      setUploadResults(result);

      if (result.success) {
        toast.success(`✅ Successfully uploaded ${result.succeeded} questions`);
        setJsonContent('');
      } else {
        toast.error(`⚠️ ${result.failed} questions failed to upload`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload HTML Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Track and Section IDs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Track ID</label>
              <input
                type="text"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder="e.g., track-123"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Section ID</label>
              <input
                type="text"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                placeholder="e.g., section-456"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* JSON Input */}
          <div>
            <label className="block text-sm font-medium mb-2">JSON Questions</label>
            <textarea
              value={jsonContent}
              onChange={(e) => setJsonContent(e.target.value)}
              placeholder="Paste JSON array of questions here..."
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
            />
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4">
              <p className="text-red-700 font-medium mb-2">Validation Errors:</p>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, idx) => (
                  <li key={idx} className="text-red-600 text-sm">{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Upload Results */}
          {uploadResults && (
            <div className={`border rounded-lg p-4 ${
              uploadResults.success ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'
            }`}>
              <p className={`font-medium mb-2 ${
                uploadResults.success ? 'text-green-700' : 'text-yellow-700'
              }`}>
                Upload Results
              </p>
              <div className="text-sm space-y-1">
                <p>Total: {uploadResults.total}</p>
                <p className="text-green-600">Succeeded: {uploadResults.succeeded}</p>
                {uploadResults.failed > 0 && (
                  <p className="text-red-600">Failed: {uploadResults.failed}</p>
                )}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleValidate}
              variant="outline"
              disabled={loading}
            >
              Validate JSON
            </Button>
            <Button
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload Questions'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Example */}
      <Card>
        <CardHeader>
          <CardTitle>Example JSON Format</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs">
{`[
  {
    "html_content": "<div class='question'>...</div>",
    "answer_extraction": {
      "method": "radio_button",
      "selector": "input[name='answer']:checked",
      "value_extractor": "value"
    },
    "grading_rules": {
      "method": "exact_match",
      "correct_answers": ["A"],
      "points": 1
    },
    "marks": 1,
    "difficulty": "medium"
  }
]`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

export default HtmlQuestionUpload;

