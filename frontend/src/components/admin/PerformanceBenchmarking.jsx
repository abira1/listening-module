import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const PerformanceBenchmarking = () => {
  const { user: adminUser } = useAdminAuth();
  const [benchmarks, setBenchmarks] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [timeRange, setTimeRange] = useState('month');
  const [comparisons, setComparisons] = useState([]);

  useEffect(() => {
    fetchBenchmarks();
  }, [timeRange]);

  const fetchBenchmarks = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/benchmarks?timeRange=${timeRange}`,
        {
          headers: {
            'X-Admin-Email': adminUser?.email,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBenchmarks(data);
        setComparisons(data.comparisons || []);
      }
    } catch (err) {
      console.error('Error fetching benchmarks:', err);
      setError('Failed to fetch benchmarks');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading benchmarks...</div>;
  }

  if (!benchmarks) {
    return <div className="p-6 text-center text-gray-500">No benchmark data available</div>;
  }

  const getPerformanceColor = (value, threshold) => {
    if (value >= threshold) return 'text-green-600';
    if (value >= threshold * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Performance Benchmarking</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>

        <div className="flex gap-2">
          {['overall', 'section', 'difficulty', 'student'].map(metric => (
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
      </div>

      {/* Overall Benchmarks */}
      {selectedMetric === 'overall' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-gray-600">Avg Score</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(benchmarks.average_score, 70)}`}>
                {benchmarks.average_score.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600 mt-1">Target: 70%</p>
            </div>

            <div className="p-4 bg-green-50 rounded border border-green-200">
              <p className="text-sm text-gray-600">Pass Rate</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(benchmarks.pass_rate, 75)}`}>
                {benchmarks.pass_rate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600 mt-1">Target: 75%</p>
            </div>

            <div className="p-4 bg-purple-50 rounded border border-purple-200">
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(benchmarks.completion_rate, 80)}`}>
                {benchmarks.completion_rate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600 mt-1">Target: 80%</p>
            </div>

            <div className="p-4 bg-orange-50 rounded border border-orange-200">
              <p className="text-sm text-gray-600">Avg Time (min)</p>
              <p className="text-2xl font-bold text-orange-600">
                {benchmarks.average_time_minutes.toFixed(0)}
              </p>
              <p className="text-xs text-gray-600 mt-1">Typical: 60 min</p>
            </div>
          </div>

          {/* Trend */}
          <div className="p-4 bg-gray-50 rounded border">
            <h3 className="font-semibold mb-4">Performance Trend</h3>
            <div className="space-y-3">
              {(benchmarks.trend || []).map((point, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-20 text-sm font-medium">{point.label}</span>
                  <div className="flex-1 bg-gray-200 rounded h-6 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full flex items-center justify-end pr-2 text-white text-xs font-semibold"
                      style={{ width: `${point.value}%` }}
                    >
                      {point.value}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section Benchmarks */}
      {selectedMetric === 'section' && (
        <div className="space-y-4">
          <h3 className="font-semibold">Performance by Section</h3>
          {(benchmarks.section_benchmarks || []).map((section, idx) => (
            <div key={idx} className="p-4 border rounded">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium capitalize">{section.name}</h4>
                <span className={`text-lg font-bold ${getPerformanceColor(section.average_score, 70)}`}>
                  {section.average_score.toFixed(1)}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Attempts</p>
                  <p className="font-bold">{section.total_attempts}</p>
                </div>
                <div>
                  <p className="text-gray-600">Pass Rate</p>
                  <p className="font-bold">{section.pass_rate.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Avg Time</p>
                  <p className="font-bold">{section.average_time_seconds}s</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Difficulty Benchmarks */}
      {selectedMetric === 'difficulty' && (
        <div className="space-y-4">
          <h3 className="font-semibold">Performance by Difficulty</h3>
          {['easy', 'medium', 'hard'].map(difficulty => {
            const stats = benchmarks.difficulty_benchmarks?.[difficulty] || {};
            return (
              <div key={difficulty} className="p-4 border rounded">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium capitalize">{difficulty}</h4>
                  <span className={`text-lg font-bold ${getPerformanceColor(stats.average_score, 70)}`}>
                    {stats.average_score?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded h-4 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full"
                    style={{ width: `${stats.average_score || 0}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                  <div>
                    <p className="text-gray-600">Questions</p>
                    <p className="font-bold">{stats.total_questions || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Attempts</p>
                    <p className="font-bold">{stats.total_attempts || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Pass Rate</p>
                    <p className="font-bold">{stats.pass_rate?.toFixed(1) || 0}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Student Comparisons */}
      {selectedMetric === 'student' && (
        <div className="space-y-4">
          <h3 className="font-semibold">Top & Bottom Performers</h3>
          
          <div>
            <h4 className="font-medium text-green-600 mb-3">Top Performers</h4>
            <div className="space-y-2">
              {(comparisons.top_performers || []).map((student, idx) => (
                <div key={idx} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-xs text-gray-600">{student.exams_taken} exams</p>
                  </div>
                  <span className="text-lg font-bold text-green-600">{student.average_score.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-red-600 mb-3">Bottom Performers</h4>
            <div className="space-y-2">
              {(comparisons.bottom_performers || []).map((student, idx) => (
                <div key={idx} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-xs text-gray-600">{student.exams_taken} exams</p>
                  </div>
                  <span className="text-lg font-bold text-red-600">{student.average_score.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
        <h3 className="font-semibold mb-2">Recommendations</h3>
        <ul className="text-sm space-y-1 text-gray-700">
          {(benchmarks.recommendations || []).map((rec, idx) => (
            <li key={idx} className="flex gap-2">
              <span>•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PerformanceBenchmarking;

