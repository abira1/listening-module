import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Award,
  Calendar,
  User,
  FileText,
  Edit,
  Send,
  Lock,
  Unlock
} from 'lucide-react';
import FirebaseAuthService from '../../services/FirebaseAuthService';
import { BackendService } from '../../services/BackendService';
import { FirebaseSubmissionReview } from './FirebaseSubmissionReview';

export function SubmissionManagement() {
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState({});
  const [exams, setExams] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [examFilter, setExamFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Load submissions
      const allSubmissions = await FirebaseAuthService.getAllSubmissions();
      setSubmissions(allSubmissions);

      // Load students
      const allStudents = await FirebaseAuthService.getAllStudents();
      const studentsMap = {};
      allStudents.forEach(student => {
        studentsMap[student.uid] = student;
      });
      setStudents(studentsMap);

      // Load exams
      const publishedExams = await BackendService.getPublishedExams();
      const examsMap = {};
      publishedExams.forEach(exam => {
        examsMap[exam.id] = exam;
      });
      setExams(examsMap);

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setShowReviewModal(true);
  };

  const handlePublishExamResults = async (examId) => {
    if (!window.confirm('Are you sure you want to publish all results for this exam? Students will be able to see their scores.')) {
      return;
    }

    try {
      const result = await BackendService.publishExamResults(examId);
      alert(`Successfully published ${result.published_count} result(s) for ${result.exam_title}`);
      // Reload data to reflect changes
      await loadAllData();
    } catch (error) {
      console.error('Error publishing exam results:', error);
      alert('Failed to publish exam results. Please try again.');
    }
  };

  const handlePublishSingleSubmission = async (submissionId) => {
    if (!window.confirm('Are you sure you want to publish this result? The student will be able to see their score.')) {
      return;
    }

    try {
      await BackendService.publishSingleSubmission(submissionId);
      alert('Result published successfully!');
      // Reload data to reflect changes
      await loadAllData();
    } catch (error) {
      console.error('Error publishing submission:', error);
      alert('Failed to publish result. Please try again.');
    }
  };

  const getFilteredAndSortedSubmissions = () => {
    let filtered = [...submissions];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sub => {
        const student = students[sub.studentUid];
        const exam = exams[sub.examId];
        return (
          student?.name?.toLowerCase().includes(query) ||
          student?.email?.toLowerCase().includes(query) ||
          exam?.title?.toLowerCase().includes(query) ||
          sub.id?.toLowerCase().includes(query)
        );
      });
    }

    // Apply exam filter
    if (examFilter !== 'all') {
      filtered = filtered.filter(sub => sub.examId === examFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'passed') {
        filtered = filtered.filter(sub => {
          const percentage = (sub.score / sub.totalQuestions) * 100;
          return percentage >= 60;
        });
      } else if (statusFilter === 'failed') {
        filtered = filtered.filter(sub => {
          const percentage = (sub.score / sub.totalQuestions) * 100;
          return percentage < 60;
        });
      } else if (statusFilter === 'manual') {
        filtered = filtered.filter(sub => sub.manuallyGraded === true);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'score':
          return b.score - a.score;
        case 'percentage':
          const percA = (a.score / a.totalQuestions) * 100;
          const percB = (b.score / b.totalQuestions) * 100;
          return percB - percA;
        case 'student':
          const studentA = students[a.studentUid]?.name || '';
          const studentB = students[b.studentUid]?.name || '';
          return studentA.localeCompare(studentB);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const exportToCSV = () => {
    const filtered = getFilteredAndSortedSubmissions();
    
    const headers = [
      'Submission ID',
      'Student Name',
      'Student Email',
      'Exam Title',
      'Score',
      'Total Questions',
      'Percentage',
      'Status',
      'Manually Graded',
      'Submitted At'
    ];

    const rows = filtered.map(sub => {
      const student = students[sub.studentUid] || {};
      const exam = exams[sub.examId] || {};
      const percentage = ((sub.score / sub.totalQuestions) * 100).toFixed(2);
      const status = percentage >= 60 ? 'Passed' : 'Failed';

      return [
        sub.id,
        student.name || 'Unknown',
        student.email || 'N/A',
        exam.title || 'Unknown Exam',
        sub.score,
        sub.totalQuestions,
        `${percentage}%`,
        status,
        sub.manuallyGraded ? 'Yes' : 'No',
        new Date(sub.createdAt).toLocaleString()
      ];
    });

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `submissions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatistics = () => {
    const total = submissions.length;
    const passed = submissions.filter(sub => {
      const percentage = (sub.score / sub.totalQuestions) * 100;
      return percentage >= 60;
    }).length;
    const failed = total - passed;
    const avgScore = submissions.length > 0
      ? submissions.reduce((sum, sub) => sum + (sub.score / sub.totalQuestions) * 100, 0) / submissions.length
      : 0;
    const manuallyGraded = submissions.filter(sub => sub.manuallyGraded).length;

    return { total, passed, failed, avgScore, manuallyGraded };
  };

  const stats = getStatistics();
  const filteredSubmissions = getFilteredAndSortedSubmissions();
  const uniqueExams = [...new Set(submissions.map(s => s.examId))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submission Management</h1>
          <p className="text-gray-600 mt-1">Review, grade, and manage all student test submissions</p>
        </div>
        <button
          onClick={loadAllData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Passed (≥60%)</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.passed}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-red-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed (&lt;60%)</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.failed}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-purple-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.avgScore.toFixed(1)}%</p>
            </div>
            <Award className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-orange-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Manually Graded</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.manuallyGraded}</p>
            </div>
            <Edit className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students, exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Exam Filter */}
          <div>
            <select
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Exams</option>
              {uniqueExams.map(examId => (
                <option key={examId} value={examId}>
                  {exams[examId]?.title || 'Unknown Exam'}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="passed">Passed (≥60%)</option>
              <option value="failed">Failed (&lt;60%)</option>
              <option value="manual">Manually Graded</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="score">Sort by Score</option>
              <option value="percentage">Sort by Percentage</option>
              <option value="student">Sort by Student</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export to CSV
          </button>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    {submissions.length === 0 ? 'No submissions yet' : 'No submissions match your filters'}
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((submission) => {
                  const student = students[submission.studentUid] || {};
                  const exam = exams[submission.examId] || {};
                  const percentage = ((submission.score / submission.totalQuestions) * 100).toFixed(1);
                  const isPassed = percentage >= 60;

                  return (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img
                            src={student.photoURL || 'https://via.placeholder.com/40'}
                            alt={student.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">{student.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{exam.title || 'Unknown Exam'}</div>
                        <div className="text-sm text-gray-500">
                          {exam.duration ? `${Math.floor(exam.duration / 60)} mins` : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {submission.score}/{submission.totalQuestions}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${
                                isPassed ? 'bg-green-600' : 'bg-red-600'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              isPassed
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {isPassed ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {isPassed ? 'Passed' : 'Failed'}
                          </span>
                          {submission.manuallyGraded && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <Edit className="w-3 h-3" />
                              Manual
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(submission.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewSubmission(submission)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Review Modal */}
      {showReviewModal && selectedSubmission && (
        <FirebaseSubmissionReview
          submissionId={selectedSubmission.id}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedSubmission(null);
            loadAllData(); // Refresh data after review
          }}
        />
      )}
    </div>
  );
}