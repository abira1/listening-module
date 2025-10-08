import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import FirebaseAuthService from '../../services/FirebaseAuthService';
import { BackendService } from '../../services/BackendService';
import { LogOut, User, BookOpen, CheckCircle, Clock, FileText, Award } from 'lucide-react';
import { ProgressChart } from './ProgressChart';

export function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attemptedExams, setAttemptedExams] = useState(new Set());
  const [examStatuses, setExamStatuses] = useState({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/student');
      return;
    }

    if (user) {
      // Check if user is approved
      if (user.status !== 'approved') {
        navigate('/waiting-approval');
        return;
      }
      loadDashboardData();
    }
  }, [user, authLoading, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load published exams
      const publishedExams = await BackendService.getPublishedExams();
      setExams(publishedExams);

      // Load initial exam statuses
      const statuses = {};
      for (const exam of publishedExams) {
        try {
          const status = await BackendService.getExamStatus(exam.id);
          statuses[exam.id] = status;
        } catch (error) {
          console.error(`Error loading status for exam ${exam.id}:`, error);
        }
      }
      setExamStatuses(statuses);

      // Load student's submissions from Firebase
      if (user?.uid) {
        const studentSubmissions = await FirebaseAuthService.getStudentSubmissions(user.uid);
        setSubmissions(studentSubmissions);

        // Create set of attempted exam IDs
        const attemptedIds = new Set(studentSubmissions.map(sub => sub.examId));
        setAttemptedExams(attemptedIds);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  // Poll exam statuses every 3 seconds
  useEffect(() => {
    if (exams.length === 0) return;

    const pollStatuses = async () => {
      const statuses = {};
      for (const exam of exams) {
        try {
          const status = await BackendService.getExamStatus(exam.id);
          statuses[exam.id] = status;
        } catch (error) {
          console.error(`Error polling status for exam ${exam.id}:`, error);
        }
      }
      setExamStatuses(statuses);
    };

    const interval = setInterval(pollStatuses, 3000);
    return () => clearInterval(interval);
  }, [exams]);

  const handleLogout = async () => {
    await logout();
    navigate('/student');
  };

  const handleStartExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  const getExamStatus = (examId) => {
    if (attemptedExams.has(examId)) {
      return { status: 'Completed', color: 'bg-green-100 text-green-700' };
    }
    return { status: 'Not Started', color: 'bg-blue-100 text-blue-700' };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt="Profile" className="w-12 h-12 rounded-full" />
              ) : (
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">Welcome, {user?.full_name}!</h1>
                <p className="text-sm text-gray-600">{user?.institution}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Exams</p>
                <p className="text-2xl font-bold text-gray-900">{exams.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {submissions.length > 0
                    ? Math.round(
                        submissions.reduce((acc, sub) => acc + (sub.score || 0), 0) / submissions.length
                      )
                    : 0}
                  /{submissions.length > 0 ? submissions[0]?.total_questions || 40 : 40}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Exams */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              Available Exams
            </h2>
          </div>
          <div className="p-6">
            {exams.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No exams available at the moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exams.map((exam) => {
                  const examStatus = getExamStatus(exam.id);
                  const isCompleted = attemptedExams.has(exam.id);
                  const status = examStatuses[exam.id];
                  const isActive = status?.is_active || false;
                  const canStart = isActive && !isCompleted;

                  return (
                    <div key={exam.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${examStatus.color}`}>
                            {examStatus.status}
                          </span>
                          {isActive && !isCompleted && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium animate-pulse">
                              ● Active
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{exam.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {Math.floor(exam.duration_seconds / 60)} min
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {exam.question_count || 40} questions
                        </span>
                      </div>
                      {!isActive && !isCompleted && (
                        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700 text-center">
                          Waiting for admin to start this test...
                        </div>
                      )}
                      <button
                        onClick={() => handleStartExam(exam.id)}
                        disabled={!canStart}
                        className={`w-full py-2 rounded-lg font-medium transition-colors ${
                          !canStart
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isCompleted ? 'Already Completed' : canStart ? 'Start Exam' : 'Test Not Active'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Results History */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-600" />
              Your Results
            </h2>
          </div>
          <div className="p-6">
            {submissions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No exam submissions yet</p>
                <p className="text-sm mt-2">Start an exam to see your results here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Exam</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Score</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission) => {
                      const percentage = submission.total_questions
                        ? Math.round((submission.score / submission.total_questions) * 100)
                        : 0;

                      return (
                        <tr key={submission.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900">{submission.exam_title}</p>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(submission.finished_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-gray-900">
                              {submission.score}/{submission.total_questions}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-700">{percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
