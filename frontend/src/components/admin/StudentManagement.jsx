import React, { useState, useEffect } from 'react';
import { AuthService } from '../../services/AuthService';
import { Users, Search, Trash2, Download, Mail, Phone, Building, BookOpen, Eye } from 'lucide-react';
import { SubmissionReview } from './SubmissionReview';

export function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'submissions'
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [reviewingSubmission, setReviewingSubmission] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, submissionsData] = await Promise.all([
        AuthService.getAllStudents(),
        AuthService.getAllSubmissions()
      ]);
      setStudents(studentsData);
      setSubmissions(submissionsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      await AuthService.deleteStudent(studentId);
      setStudents(students.filter(s => s.id !== studentId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student');
    }
  };

  const exportToCSV = (data, filename) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(val => 
        typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
      ).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const handleExportStudents = () => {
    const exportData = students.map(s => ({
      Name: s.full_name,
      Email: s.email,
      Phone: s.phone_number || 'N/A',
      Institution: s.institution || 'N/A',
      Department: s.department || 'N/A',
      Roll: s.roll_number || 'N/A',
      Submissions: s.submission_count || 0,
      JoinedDate: new Date(s.created_at).toLocaleDateString()
    }));
    exportToCSV(exportData, 'students.csv');
  };

  const handleExportSubmissions = () => {
    const exportData = submissions.map(s => ({
      Student: s.student_name,
      Email: s.student_email,
      Institution: s.student_institution || 'N/A',
      Exam: s.exam_title,
      Score: s.score || 0,
      Total: s.total_questions || 0,
      Percentage: s.total_questions ? Math.round((s.score / s.total_questions) * 100) : 0,
      Date: new Date(s.finished_at).toLocaleDateString()
    }));
    exportToCSV(exportData, 'submissions.csv');
  };

  const filteredStudents = students.filter(student =>
    student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.institution?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubmissions = submissions.filter(sub =>
    sub.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.student_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.exam_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Management</h1>
        <p className="text-gray-600">Manage students and monitor their exam submissions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'students'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-5 h-5 inline mr-2" />
          Students ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'submissions'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BookOpen className="w-5 h-5 inline mr-2" />
          Submissions ({submissions.length})
        </button>
      </div>

      {/* Search and Export */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={activeTab === 'students' ? handleExportStudents : handleExportSubmissions}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Institution</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Submissions</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      No students found
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {student.profile_picture ? (
                            <img
                              src={student.profile_picture}
                              alt={student.full_name}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {student.full_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{student.full_name}</p>
                            {student.roll_number && (
                              <p className="text-sm text-gray-500">Roll: {student.roll_number}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-gray-700 mb-1">
                            <Mail className="w-4 h-4" />
                            {student.email}
                          </div>
                          {student.phone_number && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Phone className="w-4 h-4" />
                              {student.phone_number}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{student.institution || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-700">{student.department || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {student.submission_count || 0} submissions
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {new Date(student.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {deleteConfirm === student.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(student.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete student"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submissions Tab */}
      {activeTab === 'submissions' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Exam</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Result</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      No submissions found
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((submission) => {
                    const percentage = submission.total_questions
                      ? Math.round((submission.score / submission.total_questions) * 100)
                      : 0;

                    return (
                      <tr key={submission.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{submission.student_name}</p>
                            <p className="text-sm text-gray-500">{submission.student_email}</p>
                            {submission.student_institution && (
                              <p className="text-xs text-gray-400">{submission.student_institution}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{submission.exam_title}</td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-gray-900">
                            {submission.score}/{submission.total_questions}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[120px]">
                              <div
                                className={`h-2 rounded-full ${
                                  percentage >= 70 ? 'bg-green-600' : percentage >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700 min-w-[45px]">
                              {percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {new Date(submission.finished_at).toLocaleDateString()} at{' '}
                          {new Date(submission.finished_at).toLocaleTimeString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
