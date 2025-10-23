import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const ResultExporter = ({ examId }) => {
  const { user: adminUser } = useAdminAuth();
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(examId || '');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [exportOptions, setExportOptions] = useState({
    includeStudentDetails: true,
    includeSectionBreakdown: true,
    includeFeedback: false,
    dateRange: 'all'
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/exams', {
        headers: {
          'X-Admin-Email': adminUser?.email,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExams(data);
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError('Failed to fetch exams');
    }
  };

  const handleExport = async () => {
    if (!selectedExam) {
      setError('Please select an exam');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const response = await fetch(
        `/api/exams/${selectedExam}/export?format=${exportFormat}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Email': adminUser?.email,
          },
          body: JSON.stringify(exportOptions)
        }
      );

      if (response.ok) {
        // Get filename from response headers
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `results_${new Date().getTime()}.${exportFormat}`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        // Download file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setMessage(`Results exported successfully as ${filename}`);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to export results');
      }
    } catch (err) {
      console.error('Error exporting results:', err);
      setError('Failed to export results');
    } finally {
      setLoading(false);
    }
  };

  const handleExportSummary = async () => {
    if (!selectedExam) {
      setError('Please select an exam');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const response = await fetch(
        `/api/exams/${selectedExam}/export-summary?format=${exportFormat}`,
        {
          headers: {
            'X-Admin-Email': adminUser?.email,
          }
        }
      );

      if (response.ok) {
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `summary_${new Date().getTime()}.${exportFormat}`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setMessage(`Summary exported successfully as ${filename}`);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to export summary');
      }
    } catch (err) {
      console.error('Error exporting summary:', err);
      setError('Failed to export summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Export Results</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* Exam Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Exam</label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Choose an exam --</option>
            {exams.map(exam => (
              <option key={exam.id} value={exam.id}>
                {exam.title} ({exam.submission_count || 0} submissions)
              </option>
            ))}
          </select>
        </div>

        {/* Export Format */}
        <div>
          <label className="block text-sm font-medium mb-2">Export Format</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['pdf', 'excel', 'csv', 'json'].map(format => (
              <button
                key={format}
                onClick={() => setExportFormat(format)}
                className={`p-3 rounded border-2 transition-all ${
                  exportFormat === format
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-sm">{format.toUpperCase()}</p>
                <p className="text-xs text-gray-600">
                  {format === 'pdf' && 'Professional Report'}
                  {format === 'excel' && 'Spreadsheet'}
                  {format === 'csv' && 'Text Format'}
                  {format === 'json' && 'Data Format'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="p-4 bg-gray-50 rounded border">
          <h3 className="font-semibold mb-4">Export Options</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={exportOptions.includeStudentDetails}
                onChange={(e) => setExportOptions({
                  ...exportOptions,
                  includeStudentDetails: e.target.checked
                })}
                className="w-4 h-4"
              />
              <span className="text-sm">Include Student Details</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={exportOptions.includeSectionBreakdown}
                onChange={(e) => setExportOptions({
                  ...exportOptions,
                  includeSectionBreakdown: e.target.checked
                })}
                className="w-4 h-4"
              />
              <span className="text-sm">Include Section Breakdown</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={exportOptions.includeFeedback}
                onChange={(e) => setExportOptions({
                  ...exportOptions,
                  includeFeedback: e.target.checked
                })}
                className="w-4 h-4"
              />
              <span className="text-sm">Include Feedback</span>
            </label>

            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <select
                value={exportOptions.dateRange}
                onChange={(e) => setExportOptions({
                  ...exportOptions,
                  dateRange: e.target.value
                })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleExport}
            disabled={loading || !selectedExam}
            className="bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
          >
            {loading ? 'Exporting...' : 'Export Full Results'}
          </button>

          <button
            onClick={handleExportSummary}
            disabled={loading || !selectedExam}
            className="bg-green-600 text-white py-3 rounded hover:bg-green-700 disabled:bg-gray-400 font-semibold"
          >
            {loading ? 'Exporting...' : 'Export Summary'}
          </button>
        </div>

        {/* Format Information */}
        <div className="p-4 bg-blue-50 rounded border border-blue-200">
          <h4 className="font-semibold mb-2">Format Information</h4>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>• <strong>PDF:</strong> Professional formatted report with charts</li>
            <li>• <strong>Excel:</strong> Spreadsheet with formatting and formulas</li>
            <li>• <strong>CSV:</strong> Plain text format for data analysis</li>
            <li>• <strong>JSON:</strong> Structured data format for integration</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResultExporter;

