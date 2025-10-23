import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const StudentProgressTracker = () => {
  const { user: adminUser } = useAdminAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentProgress, setStudentProgress] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [filterStatus]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/students?status=${filterStatus}`, {
        headers: {
          'X-Admin-Email': adminUser?.email,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProgress = async (student) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/students/${student.user_id}/progress`, {
        headers: {
          'X-Admin-Email': adminUser?.email,
        },
      });

      if (response.ok) {
        const progress = await response.json();
        setSelectedStudent(student);
        setStudentProgress(progress);
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError('Failed to fetch progress');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Student Progress Tracker</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Students</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : filteredStudents.length === 0 ? (
          <p className="text-gray-500">No students found</p>
        ) : (
          filteredStudents.map(student => (
            <div
              key={student.user_id}
              className="p-4 border rounded hover:bg-gray-50 cursor-pointer transition-all"
              onClick={() => handleViewProgress(student)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{student.name}</h3>
                  <p className="text-sm text-gray-600">{student.email}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  student.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {student.status}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Exams Taken</p>
                  <p className="font-bold">{student.exams_taken || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Avg Score</p>
                  <p className="font-bold">{(student.average_score || 0).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Pass Rate</p>
                  <p className="font-bold">{(student.pass_rate || 0).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Last Active</p>
                  <p className="font-bold text-xs">
                    {student.last_active ? new Date(student.last_active).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Progress Detail Modal */}
      {selectedStudent && studentProgress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedStudent.name} - Progress Details</h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="p-3 bg-blue-50 rounded">
                <p className="text-xs text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold text-blue-600">{studentProgress.total_exams}</p>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <p className="text-xs text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-green-600">{studentProgress.average_score.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-purple-50 rounded">
                <p className="text-xs text-gray-600">Best Score</p>
                <p className="text-2xl font-bold text-purple-600">{studentProgress.best_score}%</p>
              </div>
              <div className="p-3 bg-orange-50 rounded">
                <p className="text-xs text-gray-600">Pass Rate</p>
                <p className="text-2xl font-bold text-orange-600">{studentProgress.pass_rate.toFixed(1)}%</p>
              </div>
            </div>

            {/* Exam History */}
            <h4 className="font-semibold mb-3">Exam History</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {(studentProgress.exams || []).map((exam, idx) => (
                <div key={idx} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{exam.title}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(exam.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      exam.score >= 70 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {exam.score}%
                    </p>
                    <p className="text-xs text-gray-600">{exam.time_spent} min</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Trend */}
            <div className="mt-6 p-3 bg-gray-50 rounded">
              <h4 className="font-semibold mb-3">Progress Trend</h4>
              <div className="space-y-2">
                {studentProgress.trend && studentProgress.trend.length > 0 ? (
                  studentProgress.trend.map((point, idx) => (
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
                  ))
                ) : (
                  <p className="text-sm text-gray-600">No trend data available</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedStudent(null)}
              className="mt-4 w-full bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProgressTracker;

