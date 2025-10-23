import React, { useState } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const CustomReportBuilder = () => {
  const { user: adminUser } = useAdminAuth();
  const [reportConfig, setReportConfig] = useState({
    name: '',
    description: '',
    type: 'summary',
    dataSource: 'submissions',
    metrics: [],
    filters: {},
    groupBy: 'none',
    sortBy: 'date',
    format: 'pdf'
  });

  const [savedReports, setSavedReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const availableMetrics = {
    submissions: [
      'total_submissions',
      'average_score',
      'pass_rate',
      'completion_rate',
      'average_time'
    ],
    students: [
      'total_students',
      'active_students',
      'average_performance',
      'engagement_rate'
    ],
    questions: [
      'total_questions',
      'average_difficulty',
      'success_rate',
      'time_per_question'
    ]
  };

  const handleMetricToggle = (metric) => {
    setReportConfig(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metric)
        ? prev.metrics.filter(m => m !== metric)
        : [...prev.metrics, metric]
    }));
  };

  const handleGenerateReport = async () => {
    if (!reportConfig.name.trim()) {
      setError('Report name is required');
      return;
    }

    if (reportConfig.metrics.length === 0) {
      setError('Select at least one metric');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': adminUser?.email,
        },
        body: JSON.stringify(reportConfig)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportConfig.name}.${reportConfig.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setMessage('Report generated successfully');
      } else {
        setError('Failed to generate report');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async () => {
    if (!reportConfig.name.trim()) {
      setError('Report name is required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/reports/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': adminUser?.email,
        },
        body: JSON.stringify(reportConfig)
      });

      if (response.ok) {
        const savedReport = await response.json();
        setSavedReports([...savedReports, savedReport]);
        setMessage('Report template saved successfully');
      } else {
        setError('Failed to save report');
      }
    } catch (err) {
      console.error('Error saving report:', err);
      setError('Failed to save report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Custom Report Builder</h2>

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

      <div className="grid grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="p-4 bg-gray-50 rounded border">
            <h3 className="font-semibold mb-4">Report Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Report Name *</label>
                <input
                  type="text"
                  value={reportConfig.name}
                  onChange={(e) => setReportConfig({ ...reportConfig, name: e.target.value })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Monthly Performance Report"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={reportConfig.description}
                  onChange={(e) => setReportConfig({ ...reportConfig, description: e.target.value })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Describe this report..."
                />
              </div>
            </div>
          </div>

          {/* Data Source & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded border">
              <h3 className="font-semibold mb-3">Data Source</h3>
              <select
                value={reportConfig.dataSource}
                onChange={(e) => setReportConfig({ ...reportConfig, dataSource: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="submissions">Submissions</option>
                <option value="students">Students</option>
                <option value="questions">Questions</option>
                <option value="exams">Exams</option>
              </select>
            </div>

            <div className="p-4 bg-gray-50 rounded border">
              <h3 className="font-semibold mb-3">Report Type</h3>
              <select
                value={reportConfig.type}
                onChange={(e) => setReportConfig({ ...reportConfig, type: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="summary">Summary</option>
                <option value="detailed">Detailed</option>
                <option value="comparative">Comparative</option>
                <option value="trend">Trend Analysis</option>
              </select>
            </div>
          </div>

          {/* Metrics Selection */}
          <div className="p-4 bg-gray-50 rounded border">
            <h3 className="font-semibold mb-4">Select Metrics *</h3>
            <div className="grid grid-cols-2 gap-3">
              {(availableMetrics[reportConfig.dataSource] || []).map(metric => (
                <label key={metric} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={reportConfig.metrics.includes(metric)}
                    onChange={() => handleMetricToggle(metric)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{metric.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Grouping & Sorting */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded border">
              <h3 className="font-semibold mb-3">Group By</h3>
              <select
                value={reportConfig.groupBy}
                onChange={(e) => setReportConfig({ ...reportConfig, groupBy: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">None</option>
                <option value="date">Date</option>
                <option value="section">Section</option>
                <option value="difficulty">Difficulty</option>
                <option value="student">Student</option>
              </select>
            </div>

            <div className="p-4 bg-gray-50 rounded border">
              <h3 className="font-semibold mb-3">Sort By</h3>
              <select
                value={reportConfig.sortBy}
                onChange={(e) => setReportConfig({ ...reportConfig, sortBy: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Date</option>
                <option value="score">Score</option>
                <option value="name">Name</option>
                <option value="count">Count</option>
              </select>
            </div>
          </div>

          {/* Format Selection */}
          <div className="p-4 bg-gray-50 rounded border">
            <h3 className="font-semibold mb-3">Export Format</h3>
            <div className="grid grid-cols-4 gap-2">
              {['pdf', 'excel', 'csv', 'json'].map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setReportConfig({ ...reportConfig, format: fmt })}
                  className={`p-2 rounded text-sm font-semibold transition-all ${
                    reportConfig.format === fmt
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview & Actions */}
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded border border-blue-200">
            <h3 className="font-semibold mb-3">Preview</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {reportConfig.name || 'Unnamed'}</p>
              <p><strong>Type:</strong> {reportConfig.type}</p>
              <p><strong>Source:</strong> {reportConfig.dataSource}</p>
              <p><strong>Metrics:</strong> {reportConfig.metrics.length}</p>
              <p><strong>Format:</strong> {reportConfig.format.toUpperCase()}</p>
            </div>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>

          <button
            onClick={handleSaveReport}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 disabled:bg-gray-400 font-semibold"
          >
            Save Template
          </button>

          {/* Saved Reports */}
          {savedReports.length > 0 && (
            <div className="p-4 bg-gray-50 rounded border">
              <h3 className="font-semibold mb-3">Saved Templates</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {savedReports.map((report, idx) => (
                  <button
                    key={idx}
                    onClick={() => setReportConfig(report)}
                    className="w-full text-left p-2 border rounded hover:bg-white transition-all"
                  >
                    <p className="font-medium text-sm">{report.name}</p>
                    <p className="text-xs text-gray-600">{report.metrics.length} metrics</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomReportBuilder;

