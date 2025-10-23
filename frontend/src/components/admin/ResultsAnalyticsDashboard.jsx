import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const ResultsAnalyticsDashboard = ({ examId }) => {
  const { user: adminUser } = useAdminAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  useEffect(() => {
    if (examId) {
      fetchAnalytics();
    }
  }, [examId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/submissions/analytics/${examId}?timeRange=${timeRange}`,
        {
          headers: {
            'X-Admin-Email': adminUser?.email,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        setError('Failed to fetch analytics');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="p-6 text-center text-gray-500">No data available</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Results Analytics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Time</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="today">Today</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm text-gray-600">Total Submissions</p>
          <p className="text-2xl font-bold text-blue-600">{analytics.total_submissions || 0}</p>
        </div>

        <div className="p-4 bg-green-50 rounded border border-green-200">
          <p className="text-sm text-gray-600">Average Score</p>
          <p className="text-2xl font-bold text-green-600">{(analytics.average_score || 0).toFixed(1)}%</p>
        </div>

        <div className="p-4 bg-purple-50 rounded border border-purple-200">
          <p className="text-sm text-gray-600">Pass Rate</p>
          <p className="text-2xl font-bold text-purple-600">{(analytics.pass_rate || 0).toFixed(1)}%</p>
        </div>

        <div className="p-4 bg-orange-50 rounded border border-orange-200">
          <p className="text-sm text-gray-600">Avg Time (min)</p>
          <p className="text-2xl font-bold text-orange-600">{(analytics.average_time_minutes || 0).toFixed(0)}</p>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['overview', 'distribution', 'difficulty', 'questions'].map(metric => (
          <button
            key={metric}
            onClick={() => setSelectedMetric(metric)}
            className={`px-4 py-2 rounded transition-all ${
              selectedMetric === metric
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {metric.charAt(0).toUpperCase() + metric.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview */}
      {selectedMetric === 'overview' && (
        <div className="space-y-6">
          {/* Score Distribution */}
          <div className="p-4 bg-gray-50 rounded border">
            <h3 className="font-semibold mb-4">Score Distribution</h3>
            <div className="space-y-2">
              {[
                { range: '90-100%', count: analytics.score_distribution?.['90-100'] || 0, color: 'green' },
                { range: '80-89%', count: analytics.score_distribution?.['80-89'] || 0, color: 'blue' },
                { range: '70-79%', count: analytics.score_distribution?.['70-79'] || 0, color: 'yellow' },
                { range: '60-69%', count: analytics.score_distribution?.['60-69'] || 0, color: 'orange' },
                { range: '0-59%', count: analytics.score_distribution?.['0-59'] || 0, color: 'red' }
              ].map(item => (
                <div key={item.range} className="flex items-center gap-3">
                  <span className="w-20 text-sm font-medium">{item.range}</span>
                  <div className="flex-1 bg-gray-200 rounded h-6 overflow-hidden">
                    <div
                      className={`bg-${item.color}-500 h-full flex items-center justify-end pr-2 text-white text-xs font-semibold`}
                      style={{
                        width: `${(item.count / (analytics.total_submissions || 1)) * 100}%`
                      }}
                    >
                      {item.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submission Status */}
          <div className="p-4 bg-gray-50 rounded border">
            <h3 className="font-semibold mb-4">Submission Status</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{analytics.completed_submissions || 0}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{analytics.in_progress_submissions || 0}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{analytics.failed_submissions || 0}</p>
                <p className="text-sm text-gray-600">Failed</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Difficulty Analysis */}
      {selectedMetric === 'difficulty' && (
        <div className="p-4 bg-gray-50 rounded border">
          <h3 className="font-semibold mb-4">Performance by Difficulty</h3>
          <div className="space-y-4">
            {['easy', 'medium', 'hard'].map(difficulty => {
              const stats = analytics.difficulty_stats?.[difficulty] || {};
              return (
                <div key={difficulty} className="p-3 border rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium capitalize">{difficulty}</span>
                    <span className="text-sm text-gray-600">
                      {stats.correct || 0}/{stats.total || 0} correct
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded h-4 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full"
                      style={{
                        width: `${stats.total ? (stats.correct / stats.total) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {stats.total ? ((stats.correct / stats.total) * 100).toFixed(1) : 0}% correct
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Question Performance */}
      {selectedMetric === 'questions' && (
        <div className="p-4 bg-gray-50 rounded border">
          <h3 className="font-semibold mb-4">Question Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 text-left">Question</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-center">Correct</th>
                  <th className="p-2 text-center">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {(analytics.question_stats || []).map((q, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2">Q{q.number}</td>
                    <td className="p-2 text-xs">{q.type}</td>
                    <td className="p-2 text-center">{q.correct}/{q.total}</td>
                    <td className="p-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        q.success_rate >= 80 ? 'bg-green-100 text-green-700' :
                        q.success_rate >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {q.success_rate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Distribution Chart */}
      {selectedMetric === 'distribution' && (
        <div className="p-4 bg-gray-50 rounded border">
          <h3 className="font-semibold mb-4">Score Distribution Chart</h3>
          <div className="text-center text-gray-500">
            <p>Chart visualization would be displayed here</p>
            <p className="text-sm mt-2">Consider integrating Chart.js or Recharts for visual charts</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsAnalyticsDashboard;

