import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const DifficultyCalibration = ({ trackId }) => {
  const { user: adminUser } = useAdminAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [calibrationData, setCalibrationData] = useState(null);
  const [sortBy, setSortBy] = useState('difficulty');

  useEffect(() => {
    if (trackId) {
      fetchQuestions();
    }
  }, [trackId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tracks/${trackId}/questions`, {
        headers: {
          'X-Admin-Email': adminUser?.email,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCalibration = async (question) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/questions/${question.id}/calibration`,
        {
          headers: {
            'X-Admin-Email': adminUser?.email,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedQuestion(question);
        setCalibrationData(data);
      }
    } catch (err) {
      console.error('Error fetching calibration:', err);
      setError('Failed to fetch calibration data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDifficulty = async (questionId, newDifficulty) => {
    try {
      const response = await fetch(
        `/api/questions/${questionId}/difficulty`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Email': adminUser?.email,
          },
          body: JSON.stringify({ difficulty: newDifficulty })
        }
      );

      if (response.ok) {
        setMessage('Difficulty updated successfully');
        fetchQuestions();
        if (selectedQuestion?.id === questionId) {
          handleViewCalibration({ ...selectedQuestion, difficulty: newDifficulty });
        }
      } else {
        setError('Failed to update difficulty');
      }
    } catch (err) {
      console.error('Error updating difficulty:', err);
      setError('Failed to update difficulty');
    }
  };

  const handleAutoCalibrate = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/tracks/${trackId}/auto-calibrate`,
        {
          method: 'POST',
          headers: {
            'X-Admin-Email': adminUser?.email,
          },
        }
      );

      if (response.ok) {
        setMessage('Auto-calibration completed');
        fetchQuestions();
      } else {
        setError('Failed to auto-calibrate');
      }
    } catch (err) {
      console.error('Error auto-calibrating:', err);
      setError('Failed to auto-calibrate');
    } finally {
      setLoading(false);
    }
  };

  const sortedQuestions = [...questions].sort((a, b) => {
    if (sortBy === 'difficulty') {
      const diffOrder = { easy: 1, medium: 2, hard: 3 };
      return (diffOrder[a.difficulty] || 0) - (diffOrder[b.difficulty] || 0);
    } else if (sortBy === 'success_rate') {
      return (b.success_rate || 0) - (a.success_rate || 0);
    }
    return 0;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getSuccessRateColor = (rate) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Difficulty Calibration</h2>
        <button
          onClick={handleAutoCalibrate}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400"
        >
          {loading ? 'Calibrating...' : 'Auto-Calibrate'}
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

      {/* Sort Options */}
      <div className="mb-6 flex gap-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="difficulty">Sort by Difficulty</option>
          <option value="success_rate">Sort by Success Rate</option>
        </select>
      </div>

      {/* Questions Grid */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : sortedQuestions.length === 0 ? (
          <p className="text-gray-500">No questions available</p>
        ) : (
          sortedQuestions.map(question => (
            <div
              key={question.id}
              className="p-4 border rounded hover:shadow-lg transition-all cursor-pointer"
              onClick={() => handleViewCalibration(question)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="font-semibold">Q{question.number}: {question.type}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{question.text}</p>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-semibold ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Attempts</p>
                  <p className="font-bold">{question.attempts || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Correct</p>
                  <p className="font-bold">{question.correct_count || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Success Rate</p>
                  <p className={`font-bold ${getSuccessRateColor(question.success_rate || 0)}`}>
                    {(question.success_rate || 0).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Avg Time</p>
                  <p className="font-bold">{question.avg_time_seconds || 0}s</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Calibration Detail Modal */}
      {selectedQuestion && calibrationData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Q{selectedQuestion.number} - Calibration Analysis
              </h3>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Current Metrics */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="p-3 bg-blue-50 rounded">
                <p className="text-xs text-gray-600">Total Attempts</p>
                <p className="text-2xl font-bold text-blue-600">{calibrationData.total_attempts}</p>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <p className="text-xs text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{calibrationData.success_rate.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-purple-50 rounded">
                <p className="text-xs text-gray-600">Avg Time (s)</p>
                <p className="text-2xl font-bold text-purple-600">{calibrationData.avg_time_seconds.toFixed(0)}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded">
                <p className="text-xs text-gray-600">Current Level</p>
                <p className="text-2xl font-bold text-orange-600 capitalize">{selectedQuestion.difficulty}</p>
              </div>
            </div>

            {/* Recommendation */}
            <div className="p-4 bg-gray-50 rounded border mb-6">
              <h4 className="font-semibold mb-2">Difficulty Recommendation</h4>
              <p className="text-sm text-gray-700 mb-4">
                {calibrationData.recommendation}
              </p>

              {calibrationData.suggested_difficulty && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleUpdateDifficulty(selectedQuestion.id, calibrationData.suggested_difficulty);
                      setSelectedQuestion(null);
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm"
                  >
                    Apply Suggestion ({calibrationData.suggested_difficulty})
                  </button>
                </div>
              )}
            </div>

            {/* Manual Adjustment */}
            <div className="p-4 bg-gray-50 rounded border">
              <h4 className="font-semibold mb-3">Manual Adjustment</h4>
              <div className="flex gap-2">
                {['easy', 'medium', 'hard'].map(level => (
                  <button
                    key={level}
                    onClick={() => {
                      handleUpdateDifficulty(selectedQuestion.id, level);
                      setSelectedQuestion(null);
                    }}
                    className={`flex-1 py-2 rounded text-sm font-semibold transition-all ${
                      selectedQuestion.difficulty === level
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Performance Trend */}
            <div className="mt-6 p-4 bg-gray-50 rounded border">
              <h4 className="font-semibold mb-3">Performance Trend</h4>
              <div className="space-y-2">
                {(calibrationData.trend || []).map((point, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs w-20">{point.label}</span>
                    <div className="flex-1 bg-gray-200 rounded h-4 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full"
                        style={{ width: `${point.value}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-10 text-right">{point.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DifficultyCalibration;

