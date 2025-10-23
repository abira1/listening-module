import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const TeacherDashboard = () => {
  const { user: adminUser } = useAdminAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teacher/dashboard', {
        headers: {
          'X-Admin-Email': adminUser?.email,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
        setSubmissions(data.pending_submissions || []);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (submissionId, score, feedback) => {
    try {
      const response = await fetch(`/api/submissions/${submissionId}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': adminUser?.email,
        },
        body: JSON.stringify({
          score,
          feedback,
          graded_by: adminUser?.email
        })
      });

      if (response.ok) {
        setSelectedSubmission(null);
        fetchDashboardData();
      } else {
        setError('Failed to grade submission');
      }
    } catch (err) {
      console.error('Error grading submission:', err);
      setError('Failed to grade submission');
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading dashboard...</div>;
  }

  if (!dashboardData) {
    return <div className="p-6 text-center text-gray-500">No data available</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm text-gray-600">Pending Submissions</p>
          <p className="text-2xl font-bold text-blue-600">{dashboardData.pending_count || 0}</p>
        </div>

        <div className="p-4 bg-green-50 rounded border border-green-200">
          <p className="text-sm text-gray-600">Graded</p>
          <p className="text-2xl font-bold text-green-600">{dashboardData.graded_count || 0}</p>
        </div>

        <div className="p-4 bg-purple-50 rounded border border-purple-200">
          <p className="text-sm text-gray-600">Students</p>
          <p className="text-2xl font-bold text-purple-600">{dashboardData.total_students || 0}</p>
        </div>

        <div className="p-4 bg-orange-50 rounded border border-orange-200">
          <p className="text-sm text-gray-600">Avg Score</p>
          <p className="text-2xl font-bold text-orange-600">{(dashboardData.average_score || 0).toFixed(1)}%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {['overview', 'pending', 'graded', 'students'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-all ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="p-4 bg-gray-50 rounded border">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-2">
              {(dashboardData.recent_activity || []).map((activity, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 border-b last:border-b-0">
                  <span className="text-sm">{activity.description}</span>
                  <span className="text-xs text-gray-500">{activity.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="p-4 bg-gray-50 rounded border">
            <h3 className="font-semibold mb-4">Performance Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Highest Score</p>
                <p className="text-xl font-bold">{dashboardData.highest_score || 0}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lowest Score</p>
                <p className="text-xl font-bold">{dashboardData.lowest_score || 0}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Submissions Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {submissions.filter(s => s.status === 'pending').length === 0 ? (
            <p className="text-gray-500">No pending submissions</p>
          ) : (
            submissions
              .filter(s => s.status === 'pending')
              .map(submission => (
                <div key={submission.id} className="p-4 border rounded hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{submission.student_name}</p>
                      <p className="text-sm text-gray-600">{submission.exam_title}</p>
                    </div>
                    <button
                      onClick={() => setSelectedSubmission(submission)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Grade
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Submitted: {new Date(submission.submitted_at).toLocaleString()}
                  </p>
                </div>
              ))
          )}
        </div>
      )}

      {/* Graded Submissions Tab */}
      {activeTab === 'graded' && (
        <div className="space-y-4">
          {submissions.filter(s => s.status === 'graded').length === 0 ? (
            <p className="text-gray-500">No graded submissions</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Student</th>
                    <th className="p-2 text-left">Exam</th>
                    <th className="p-2 text-center">Score</th>
                    <th className="p-2 text-left">Graded</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions
                    .filter(s => s.status === 'graded')
                    .map(submission => (
                      <tr key={submission.id} className="border-t">
                        <td className="p-2">{submission.student_name}</td>
                        <td className="p-2">{submission.exam_title}</td>
                        <td className="p-2 text-center font-semibold">{submission.score}%</td>
                        <td className="p-2 text-xs text-gray-600">
                          {new Date(submission.graded_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {(dashboardData.students || []).map(student => (
            <div key={student.id} className="p-4 border rounded">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Submissions</p>
                  <p className="text-lg font-bold">{student.submission_count}</p>
                </div>
              </div>
              <div className="mt-2 flex gap-4 text-sm">
                <span className="text-gray-600">Avg Score: <strong>{(student.average_score || 0).toFixed(1)}%</strong></span>
                <span className="text-gray-600">Pass Rate: <strong>{(student.pass_rate || 0).toFixed(1)}%</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grading Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Grade Submission</h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Student: {selectedSubmission.student_name}</p>
                <p className="text-sm text-gray-600">Exam: {selectedSubmission.exam_title}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  defaultValue="0"
                  id="score-input"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Feedback</label>
                <textarea
                  id="feedback-input"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Provide feedback for the student..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const score = document.getElementById('score-input').value;
                    const feedback = document.getElementById('feedback-input').value;
                    handleGradeSubmission(selectedSubmission.id, score, feedback);
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Submit Grade
                </button>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;

