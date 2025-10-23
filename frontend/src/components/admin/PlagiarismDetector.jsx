import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const PlagiarismDetector = ({ examId }) => {
  const { user: adminUser } = useAdminAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [plagiarismResult, setPlagiarismResult] = useState(null);
  const [filterRisk, setFilterRisk] = useState('all');
  const [scanInProgress, setScanInProgress] = useState(false);

  useEffect(() => {
    if (examId) {
      fetchSubmissions();
    }
  }, [examId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/exams/${examId}/submissions`, {
        headers: {
          'X-Admin-Email': adminUser?.email,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckPlagiarism = async (submission) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/submissions/${submission.id}/plagiarism-check`,
        {
          method: 'POST',
          headers: {
            'X-Admin-Email': adminUser?.email,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSelectedSubmission(submission);
        setPlagiarismResult(result);
      } else {
        setError('Failed to check plagiarism');
      }
    } catch (err) {
      console.error('Error checking plagiarism:', err);
      setError('Failed to check plagiarism');
    } finally {
      setLoading(false);
    }
  };

  const handleScanAll = async () => {
    try {
      setScanInProgress(true);
      setError('');
      setMessage('');

      const response = await fetch(
        `/api/exams/${examId}/plagiarism-scan`,
        {
          method: 'POST',
          headers: {
            'X-Admin-Email': adminUser?.email,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setMessage(`Scan complete: ${result.flagged_count} submissions flagged`);
        fetchSubmissions();
      } else {
        setError('Failed to scan submissions');
      }
    } catch (err) {
      console.error('Error scanning:', err);
      setError('Failed to scan submissions');
    } finally {
      setScanInProgress(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  const filteredSubmissions = submissions.filter(s => {
    if (filterRisk === 'all') return true;
    return s.plagiarism_risk === filterRisk;
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Plagiarism Detection</h2>
        <button
          onClick={handleScanAll}
          disabled={scanInProgress || loading}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
        >
          {scanInProgress ? 'Scanning...' : 'Scan All'}
        </button>
      </div>

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

      {/* Filter */}
      <div className="mb-6">
        <select
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Submissions</option>
          <option value="critical">Critical Risk</option>
          <option value="high">High Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="low">Low Risk</option>
        </select>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : filteredSubmissions.length === 0 ? (
          <p className="text-gray-500">No submissions found</p>
        ) : (
          filteredSubmissions.map(submission => (
            <div
              key={submission.id}
              className={`p-4 border rounded hover:shadow-lg transition-all cursor-pointer ${getRiskColor(submission.plagiarism_risk || 'low')}`}
              onClick={() => handleCheckPlagiarism(submission)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{submission.student_name}</p>
                  <p className="text-sm opacity-75">{submission.exam_title}</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-white rounded">
                  {submission.plagiarism_similarity || 0}%
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span>Submitted: {new Date(submission.submitted_at).toLocaleDateString()}</span>
                <span className="font-semibold capitalize">
                  {submission.plagiarism_risk || 'not checked'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Plagiarism Detail Modal */}
      {selectedSubmission && plagiarismResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Plagiarism Report - {selectedSubmission.student_name}
              </h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Risk Summary */}
            <div className={`p-4 rounded border-2 mb-6 ${getRiskColor(plagiarismResult.risk_level)}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold capitalize">{plagiarismResult.risk_level} Risk</span>
                <span className="text-2xl font-bold">{plagiarismResult.overall_similarity}%</span>
              </div>
              <p className="text-sm">{plagiarismResult.recommendation}</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">Similarity</p>
                <p className="text-xl font-bold">{plagiarismResult.overall_similarity}%</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">Matches Found</p>
                <p className="text-xl font-bold">{plagiarismResult.matches.length}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">Status</p>
                <p className="text-xl font-bold">
                  {plagiarismResult.is_plagiarized ? 'Flagged' : 'Clear'}
                </p>
              </div>
            </div>

            {/* Matches */}
            {plagiarismResult.matches.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Detected Matches</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {plagiarismResult.matches.map((match, idx) => (
                    <div key={idx} className="p-3 border rounded bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-sm">{match.source}</p>
                          <p className="text-xs text-gray-600">
                            {match.match_count} phrases matched
                          </p>
                        </div>
                        <span className="font-bold text-lg">{match.similarity}%</span>
                      </div>
                      {match.matching_phrases.length > 0 && (
                        <div className="text-xs text-gray-600 mt-2">
                          <p className="font-medium mb-1">Sample phrases:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {match.matching_phrases.slice(0, 3).map((phrase, i) => (
                              <li key={i} className="truncate">{phrase}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
              >
                Close
              </button>
              {plagiarismResult.is_plagiarized && (
                <button
                  onClick={() => {
                    // Flag for review
                    setMessage('Submission flagged for review');
                    setSelectedSubmission(null);
                  }}
                  className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
                >
                  Flag for Review
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlagiarismDetector;

