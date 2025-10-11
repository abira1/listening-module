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

  // Real-time listener for submissions updates
  useEffect(() => {
    if (!user?.uid) return;

    // Set up Firebase real-time listener for student's submissions
    const submissionsRef = ref(database, 'submissions');
    
    const unsubscribe = onValue(submissionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const submissionsObj = snapshot.val();
        // Filter submissions for this student
        const studentSubmissions = Object.keys(submissionsObj)
          .filter(key => submissionsObj[key].studentUid === user.uid)
          .map(key => ({
            id: key,
            ...submissionsObj[key]
          }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setSubmissions(studentSubmissions);

        // Update attempted exams set
        const attemptedIds = new Set(studentSubmissions.map(sub => sub.examId));
        setAttemptedExams(attemptedIds);
      }
    });

    // Cleanup listener on unmount
    return () => {
      off(submissionsRef);
      unsubscribe();
    };
  }, [user?.uid]);

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

  // Group exams by type
  const listeningExams = exams.filter(exam => exam.exam_type === 'listening');
  const readingExams = exams.filter(exam => exam.exam_type === 'reading');
  const writingExams = exams.filter(exam => exam.exam_type === 'writing');

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt="Profile" className="w-14 h-14 rounded-full border-4 border-amber-400 shadow-lg" />
              ) : (
                <div className="w-14 h-14 bg-amber-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <User className="w-7 h-7 text-blue-900" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">Welcome back, {user?.full_name}!</h1>
                <p className="text-sm text-amber-400">{user?.institution || 'IELTS Student'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-900 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Available Tests</p>
                <p className="text-3xl font-bold text-blue-900">{exams.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-green-600 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-600">{submissions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-amber-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <Award className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Average Score</p>
                <p className="text-3xl font-bold text-amber-600">
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

        {/* MOCK TESTS SECTION - Main Highlight */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-3xl shadow-2xl mb-10 overflow-hidden border-4 border-amber-400">
          <div className="px-8 py-6 bg-gradient-to-r from-amber-400 to-amber-500">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center shadow-xl">
                <TrophyIcon className="w-9 h-9 text-amber-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-blue-900">IELTS Mock Tests</h2>
                <p className="text-blue-800 font-medium">Choose your test category and start practicing</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Listening Tests */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <HeadphonesIcon className="w-7 h-7 text-amber-400" />
                <h3 className="text-2xl font-bold text-white">Listening Tests</h3>
                <span className="px-3 py-1 bg-amber-400 text-blue-900 rounded-full text-sm font-bold">{listeningExams.length}</span>
              </div>
              {listeningExams.length === 0 ? (
                <div className="bg-blue-800/50 backdrop-blur-sm rounded-xl p-8 text-center border border-blue-700">
                  <HeadphonesIcon className="w-12 h-12 mx-auto mb-3 text-blue-400 opacity-50" />
                  <p className="text-blue-200">No listening tests available at the moment</p>
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
                      <div key={exam.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 hover:bg-white/20 transition-all hover:scale-105">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-lg font-bold text-white">{exam.title}</h4>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${examStatus.color}`}>
                              {examStatus.status}
                            </span>
                            {isActive && !isCompleted && (
                              <span className="px-2 py-0.5 bg-green-400 text-green-900 rounded-full text-xs font-bold animate-pulse">
                                ● Active
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-blue-200 text-sm mb-3">{exam.description}</p>
                        <div className="flex items-center gap-4 text-sm text-blue-300 mb-3">
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
                          <div className="mb-3 p-2 bg-yellow-500/20 border border-yellow-400/50 rounded text-xs text-yellow-300 text-center font-medium">
                            Please wait for the test to begin.
                          </div>
                        )}
                        <button
                          onClick={() => handleStartExam(exam.id)}
                          disabled={!canStart}
                          className={`w-full py-3 rounded-lg font-bold transition-all ${
                            !canStart
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-900 shadow-lg hover:shadow-amber-400/50'
                          }`}
                        >
                          {isCompleted ? 'Already Completed' : canStart ? 'Start Test' : 'Test Not Active'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reading Tests */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <BookIcon className="w-7 h-7 text-amber-400" />
                <h3 className="text-2xl font-bold text-white">Reading Tests</h3>
                <span className="px-3 py-1 bg-amber-400 text-blue-900 rounded-full text-sm font-bold">{readingExams.length}</span>
              </div>
              {readingExams.length === 0 ? (
                <div className="bg-blue-800/50 backdrop-blur-sm rounded-xl p-8 text-center border border-blue-700">
                  <BookIcon className="w-12 h-12 mx-auto mb-3 text-blue-400 opacity-50" />
                  <p className="text-blue-200">No reading tests available at the moment</p>
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
                      <div key={exam.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 hover:bg-white/20 transition-all hover:scale-105">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-lg font-bold text-white">{exam.title}</h4>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${examStatus.color}`}>
                              {examStatus.status}
                            </span>
                            {isActive && !isCompleted && (
                              <span className="px-2 py-0.5 bg-green-400 text-green-900 rounded-full text-xs font-bold animate-pulse">
                                ● Active
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-blue-200 text-sm mb-3">{exam.description}</p>
                        <div className="flex items-center gap-4 text-sm text-blue-300 mb-3">
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
                          <div className="mb-3 p-2 bg-yellow-500/20 border border-yellow-400/50 rounded text-xs text-yellow-300 text-center font-medium">
                            Please wait for the test to begin.
                          </div>
                        )}
                        <button
                          onClick={() => handleStartExam(exam.id)}
                          disabled={!canStart}
                          className={`w-full py-3 rounded-lg font-bold transition-all ${
                            !canStart
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-900 shadow-lg hover:shadow-amber-400/50'
                          }`}
                        >
                          {isCompleted ? 'Already Completed' : canStart ? 'Start Test' : 'Test Not Active'}
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
                <PenToolIcon className="w-7 h-7 text-amber-400" />
                <h3 className="text-2xl font-bold text-white">Writing Tests</h3>
                <span className="px-3 py-1 bg-amber-400 text-blue-900 rounded-full text-sm font-bold">{writingExams.length}</span>
              </div>
              {writingExams.length === 0 ? (
                <div className="bg-blue-800/50 backdrop-blur-sm rounded-xl p-8 text-center border border-blue-700">
                  <PenToolIcon className="w-12 h-12 mx-auto mb-3 text-blue-400 opacity-50" />
                  <p className="text-blue-200">No writing tests available at the moment</p>
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
                      <div key={exam.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 hover:bg-white/20 transition-all hover:scale-105">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-lg font-bold text-white">{exam.title}</h4>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${examStatus.color}`}>
                              {examStatus.status}
                            </span>
                            {isActive && !isCompleted && (
                              <span className="px-2 py-0.5 bg-green-400 text-green-900 rounded-full text-xs font-bold animate-pulse">
                                ● Active
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-blue-200 text-sm mb-3">{exam.description}</p>
                        <div className="flex items-center gap-4 text-sm text-blue-300 mb-3">
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
                          <div className="mb-3 p-2 bg-yellow-500/20 border border-yellow-400/50 rounded text-xs text-yellow-300 text-center font-medium">
                            Please wait for the test to begin.
                          </div>
                        )}
                        <button
                          onClick={() => handleStartExam(exam.id)}
                          disabled={!canStart}
                          className={`w-full py-3 rounded-lg font-bold transition-all ${
                            !canStart
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-900 shadow-lg hover:shadow-amber-400/50'
                          }`}
                        >
                          {isCompleted ? 'Already Completed' : canStart ? 'Start Test' : 'Test Not Active'}
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
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-900 to-blue-700 rounded-t-2xl">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-amber-400" />
              Your Test Results
            </h2>
          </div>
          <div className="p-6">
            {submissions.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-semibold text-gray-700">No exam submissions yet</p>
                <p className="text-sm mt-2">Start a mock test to see your results here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-4 px-4 font-bold text-blue-900">Exam</th>
                      <th className="text-left py-4 px-4 font-bold text-blue-900">Date</th>
                      <th className="text-left py-4 px-4 font-bold text-blue-900">Score</th>
                      <th className="text-left py-4 px-4 font-bold text-blue-900">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission) => {
                      const percentage = submission.total_questions && submission.score !== null
                        ? Math.round((submission.score / submission.total_questions) * 100)
                        : 0;
                      const isPublished = submission.isPublished === true;

                      return (
                        <tr key={submission.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                          <td className="py-4 px-4">
                            <p className="font-semibold text-gray-900">{submission.examTitle || submission.exam_title}</p>
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {new Date(submission.finishedAt || submission.finished_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            {isPublished ? (
                              <span className="font-bold text-blue-900 text-lg">
                                {submission.score}/{submission.totalQuestions || submission.total_questions}
                              </span>
                            ) : (
                              <span className="text-amber-600 italic font-medium">Results Pending</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {isPublished ? (
                              <div className="flex items-center gap-3">
                                <div className="flex-1 bg-gray-200 rounded-full h-3 max-w-[120px]">
                                  <div
                                    className={`h-3 rounded-full ${
                                      percentage >= 80 ? 'bg-green-500' :
                                      percentage >= 60 ? 'bg-blue-500' :
                                      percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-bold text-gray-700">{percentage}%</span>
                              </div>
                            ) : (
                              <span className="text-sm text-amber-600 italic font-medium">Awaiting Publication</span>
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

        {/* Performance Progress Chart */}
        {submissions.length > 0 && (
          <div className="mt-8">
            <ProgressChart submissions={submissions} />
          </div>
        )}
      </main>
    </div>
  );
}
