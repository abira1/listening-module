import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import FirebaseAuthService from '../../services/FirebaseAuthService';
import { BackendService } from '../../services/BackendService';
import { LogOut, User, BookOpen, CheckCircle, Clock, FileText, Award, HeadphonesIcon, BookIcon, PenToolIcon, TrophyIcon, BarChart3 } from 'lucide-react';
import { ProgressChart } from './ProgressChart';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../../config/firebase';

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
      const publishedExams = await BackendService.getPublishedExams();
      setExams(publishedExams);

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

      if (user?.uid) {
        const studentSubmissions = await FirebaseAuthService.getStudentSubmissions(user.uid);
        setSubmissions(studentSubmissions);
        const attemptedIds = new Set(studentSubmissions.map(sub => sub.examId));
        setAttemptedExams(attemptedIds);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.uid) return;
    const submissionsRef = ref(database, 'submissions');
    const unsubscribe = onValue(submissionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const submissionsObj = snapshot.val();
        const studentSubmissions = Object.keys(submissionsObj)
          .filter(key => submissionsObj[key].studentUid === user.uid)
          .map(key => ({ id: key, ...submissionsObj[key] }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setSubmissions(studentSubmissions);
        const attemptedIds = new Set(studentSubmissions.map(sub => sub.examId));
        setAttemptedExams(attemptedIds);
      }
    });
    return () => {
      off(submissionsRef);
      unsubscribe();
    };
  }, [user?.uid]);

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
      return { status: 'Completed', color: 'bg-green-50 text-green-700 border border-green-200' };
    }
    return { status: 'Not Started', color: 'bg-blue-50 text-blue-700 border border-blue-200' };
  };

  const listeningExams = exams.filter(exam => exam.exam_type === 'listening');
  const readingExams = exams.filter(exam => exam.exam_type === 'reading');
  const writingExams = exams.filter(exam => exam.exam_type === 'writing');

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt="Profile" className="w-12 h-12 rounded-full border-2 border-blue-200" />
              ) : (
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Welcome, {user?.full_name}!</h1>
                <p className="text-sm text-gray-500">{user?.institution || 'IELTS Student'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Tests</p>
                <p className="text-2xl font-semibold text-gray-900">{exams.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{submissions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {(() => {
                    const publishedSubs = submissions.filter(sub => sub.isPublished === true);
                    if (publishedSubs.length > 0) {
                      const avgScore = Math.round(
                        publishedSubs.reduce((acc, sub) => acc + (sub.score || 0), 0) / publishedSubs.length
                      );
                      const totalQuestions = publishedSubs[0]?.totalQuestions || publishedSubs[0]?.total_questions || 40;
                      return `${avgScore}/${totalQuestions}`;
                    }
                    return 'N/A';
                  })()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mock Tests Section */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="px-6 py-5 border-b bg-blue-50">
            <div className="flex items-center gap-3">
              <TrophyIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">IELTS Mock Tests</h2>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Listening Tests */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <HeadphonesIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Listening Tests</h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-sm font-medium">{listeningExams.length}</span>
              </div>
              {listeningExams.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center border border-dashed">
                  <HeadphonesIcon className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">No listening tests available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listeningExams.map((exam) => {
                    const examStatus = getExamStatus(exam.id);
                    const isCompleted = attemptedExams.has(exam.id);
                    const status = examStatuses[exam.id];
                    const isActive = status?.is_active || false;
                    const canStart = isActive && !isCompleted;

                    return (
                      <div key={exam.id} className="bg-white border rounded-lg p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-base font-semibold text-gray-900">{exam.title}</h4>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${examStatus.color}`}>
                              {examStatus.status}
                            </span>
                            {isActive && !isCompleted && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                ● Active
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{exam.description}</p>
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
                            Waiting for test to begin
                          </div>
                        )}
                        <button
                          onClick={() => handleStartExam(exam.id)}
                          disabled={!canStart}
                          className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                            !canStart
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {isCompleted ? 'Completed' : canStart ? 'Start Test' : 'Not Active'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reading Tests */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <BookIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Reading Tests</h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-sm font-medium">{readingExams.length}</span>
              </div>
              {readingExams.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center border border-dashed">
                  <BookIcon className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">No reading tests available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {readingExams.map((exam) => {
                    const examStatus = getExamStatus(exam.id);
                    const isCompleted = attemptedExams.has(exam.id);
                    const status = examStatuses[exam.id];
                    const isActive = status?.is_active || false;
                    const canStart = isActive && !isCompleted;

                    return (
                      <div key={exam.id} className="bg-white border rounded-lg p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-base font-semibold text-gray-900">{exam.title}</h4>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${examStatus.color}`}>
                              {examStatus.status}
                            </span>
                            {isActive && !isCompleted && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                ● Active
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{exam.description}</p>
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
                            Waiting for test to begin
                          </div>
                        )}
                        <button
                          onClick={() => handleStartExam(exam.id)}
                          disabled={!canStart}
                          className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                            !canStart
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {isCompleted ? 'Completed' : canStart ? 'Start Test' : 'Not Active'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Writing Tests */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <PenToolIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Writing Tests</h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-sm font-medium">{writingExams.length}</span>
              </div>
              {writingExams.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center border border-dashed">
                  <PenToolIcon className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">No writing tests available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {writingExams.map((exam) => {
                    const examStatus = getExamStatus(exam.id);
                    const isCompleted = attemptedExams.has(exam.id);
                    const status = examStatuses[exam.id];
                    const isActive = status?.is_active || false;
                    const canStart = isActive && !isCompleted;

                    return (
                      <div key={exam.id} className="bg-white border rounded-lg p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-base font-semibold text-gray-900">{exam.title}</h4>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${examStatus.color}`}>
                              {examStatus.status}
                            </span>
                            {isActive && !isCompleted && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                ● Active
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{exam.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {Math.floor(exam.duration_seconds / 60)} min
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {exam.question_count || 2} tasks
                          </span>
                        </div>
                        {!isActive && !isCompleted && (
                          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700 text-center">
                            Waiting for test to begin
                          </div>
                        )}
                        <button
                          onClick={() => handleStartExam(exam.id)}
                          disabled={!canStart}
                          className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                            !canStart
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {isCompleted ? 'Completed' : canStart ? 'Start Test' : 'Not Active'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results History */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="px-6 py-5 border-b">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Your Test Results
            </h2>
          </div>
          <div className="p-6">
            {submissions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-600">No submissions yet</p>
                <p className="text-sm text-gray-500 mt-1">Start a test to see your results</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Exam</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Score</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission) => {
                      const percentage = submission.total_questions && submission.score !== null
                        ? Math.round((submission.score / submission.total_questions) * 100)
                        : 0;
                      const isPublished = submission.isPublished === true;

                      return (
                        <tr key={submission.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900">{submission.examTitle || submission.exam_title}</p>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {new Date(submission.finishedAt || submission.finished_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {isPublished ? (
                              <span className="font-semibold text-gray-900">
                                {submission.score}/{submission.totalQuestions || submission.total_questions}
                              </span>
                            ) : (
                              <span className="text-gray-500 text-sm">Pending</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {isPublished ? (
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                  <div
                                    className={`h-2 rounded-full ${
                                      percentage >= 80 ? 'bg-green-500' :
                                      percentage >= 60 ? 'bg-blue-500' :
                                      percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700">{percentage}%</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Awaiting</span>
                            )}
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

        {/* Progress Chart */}
        {submissions.length > 0 && (
          <div className="mt-8">
            <ProgressChart submissions={submissions} />
          </div>
        )}
      </main>
    </div>
  );
}
