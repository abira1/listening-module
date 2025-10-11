import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import FirebaseAuthService from '../../services/FirebaseAuthService';
import { BackendService } from '../../services/BackendService';
import { LogOut, User, BookOpen, CheckCircle, Clock, FileText, Award, HeadphonesIcon, BookIcon, PenToolIcon, TrophyIcon, BarChart3, ArrowRight, Star, Home, Settings, Bell, HelpCircle, Calendar } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);

  // Helper function to get user initials
  const getUserInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const publishedSubs = submissions.filter(sub => sub.isPublished === true);
  const avgScore = publishedSubs.length > 0 
    ? Math.round(publishedSubs.reduce((acc, sub) => acc + (sub.score || 0), 0) / publishedSubs.length)
    : 0;
  const totalQuestions = publishedSubs[0]?.totalQuestions || publishedSubs[0]?.total_questions || 40;
  const avgPercentage = totalQuestions > 0 ? Math.round((avgScore / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b">
          <img
            src="https://customer-assets.emergentagent.com/job_ce28ff48-be0c-4e05-8c09-33992c069cda/artifacts/xkwz06jy_Shah-Sultan-Logo-2.png"
            alt="Shah Sultan's IELTS Academy"
            className="h-12 mx-auto"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <button
              onClick={() => { setActiveTab('dashboard'); setShowProfile(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'dashboard' && !showProfile
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </button>

            <button
              onClick={() => { setActiveTab('tests'); setShowProfile(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'tests' && !showProfile
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Mock Tests</span>
            </button>

            <button
              onClick={() => { setActiveTab('results'); setShowProfile(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'results' && !showProfile
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Results</span>
            </button>

            <button
              onClick={() => setShowProfile(true)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                showProfile
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </button>
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            {user?.profile_picture ? (
              <img 
                src={user.profile_picture} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover" 
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center border-2 border-blue-500 shadow-sm">
                <span className="text-white font-bold text-sm">{getUserInitials(user?.full_name)}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Section */}
          {showProfile || activeTab === 'profile' ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                
                <div className="flex items-start gap-8 mb-8">
                  {/* Profile Picture */}
                  <div className="text-center">
                    {user?.profile_picture ? (
                      <img 
                        src={user.profile_picture} 
                        alt="Profile" 
                        className="w-32 h-32 rounded-full border-4 border-blue-500 mb-3 object-cover shadow-lg" 
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-3 border-4 border-blue-500 shadow-lg">
                        <span className="text-white font-bold text-5xl">{getUserInitials(user?.full_name)}</span>
                      </div>
                    )}
                    <p className="text-sm text-gray-500">Profile Picture</p>
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                        <p className="text-gray-900">{user?.full_name || 'N/A'}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                        <p className="text-gray-900">{user?.email || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                          <p className="text-gray-900">{user?.phone || 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                        <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                          <p className="text-gray-900">{user?.roll_number || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                        <p className="text-gray-900">{user?.institution || 'N/A'}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                        <p className="text-gray-900">{user?.department || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Section in Profile */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-3xl font-bold text-blue-600">{exams.length}</p>
                      <p className="text-sm text-gray-600 mt-1">Available Tests</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-3xl font-bold text-green-600">{submissions.length}</p>
                      <p className="text-sm text-gray-600 mt-1">Completed</p>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                      <p className="text-3xl font-bold text-amber-600">{avgPercentage}%</p>
                      <p className="text-sm text-gray-600 mt-1">Average Score</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'dashboard' ? (
            <>
              {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -ml-20 -mb-20"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                  <span className="text-sm font-medium text-yellow-300">Welcome Back!</span>
                </div>
                <h1 className="text-3xl font-bold mb-2">Hello, {user?.full_name?.split(' ')[0]}!</h1>
                <p className="text-blue-100 mb-6">
                  {submissions.length > 0 
                    ? `You've completed ${submissions.length} test${submissions.length > 1 ? 's' : ''}. Keep up the great work!`
                    : 'Ready to start your IELTS preparation journey?'}
                </p>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <p className="text-xs text-blue-100">Available Tests</p>
                    <p className="text-2xl font-bold">{exams.length}</p>
                  </div>
                  {publishedSubs.length > 0 && (
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <p className="text-xs text-blue-100">Avg Score</p>
                      <p className="text-2xl font-bold">{avgPercentage}%</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mock Tests Section on Dashboard */}
            <div className="bg-white rounded-2xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrophyIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">IELTS Mock Tests</h2>
                      <p className="text-sm text-gray-500">Choose a test to begin practice</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Listening Tests */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <HeadphonesIcon className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Listening</h3>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">{listeningExams.length}</span>
                  </div>
                  {listeningExams.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-6 text-center border-2 border-dashed border-gray-200">
                      <HeadphonesIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">No tests available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {listeningExams.map((exam) => {
                        const examStatus = getExamStatus(exam.id);
                        const isCompleted = attemptedExams.has(exam.id);
                        const status = examStatuses[exam.id];
                        const isActive = status?.is_active || false;
                        const canStart = isActive && !isCompleted;

                        return (
                          <div key={exam.id} className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-4 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900">{exam.title}</h4>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${examStatus.color}`}>
                                    {examStatus.status}
                                  </span>
                                  {isActive && !isCompleted && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium animate-pulse">
                                      • Live
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {Math.floor(exam.duration_seconds / 60)} min
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {exam.question_count || 40} questions
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleStartExam(exam.id)}
                                disabled={!canStart}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                  !canStart
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                                }`}
                              >
                                {isCompleted ? 'Done' : canStart ? (
                                  <>
                                    Start
                                    <ArrowRight className="w-4 h-4" />
                                  </>
                                ) : 'Locked'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Reading Tests */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Reading</h3>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">{readingExams.length}</span>
                  </div>
                  {readingExams.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-6 text-center border-2 border-dashed border-gray-200">
                      <BookIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">No tests available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {readingExams.map((exam) => {
                        const examStatus = getExamStatus(exam.id);
                        const isCompleted = attemptedExams.has(exam.id);
                        const status = examStatuses[exam.id];
                        const isActive = status?.is_active || false;
                        const canStart = isActive && !isCompleted;

                        return (
                          <div key={exam.id} className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-4 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900">{exam.title}</h4>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${examStatus.color}`}>
                                    {examStatus.status}
                                  </span>
                                  {isActive && !isCompleted && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium animate-pulse">
                                      • Live
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {Math.floor(exam.duration_seconds / 60)} min
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {exam.question_count || 40} questions
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleStartExam(exam.id)}
                                disabled={!canStart}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                  !canStart
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                }`}
                              >
                                {isCompleted ? 'Done' : canStart ? (
                                  <>
                                    Start
                                    <ArrowRight className="w-4 h-4" />
                                  </>
                                ) : 'Locked'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Writing Tests */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <PenToolIcon className="w-4 h-4 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Writing</h3>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">{writingExams.length}</span>
                  </div>
                  {writingExams.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-6 text-center border-2 border-dashed border-gray-200">
                      <PenToolIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">No tests available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {writingExams.map((exam) => {
                        const examStatus = getExamStatus(exam.id);
                        const isCompleted = attemptedExams.has(exam.id);
                        const status = examStatuses[exam.id];
                        const isActive = status?.is_active || false;
                        const canStart = isActive && !isCompleted;

                        return (
                          <div key={exam.id} className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100 rounded-xl p-4 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900">{exam.title}</h4>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${examStatus.color}`}>
                                    {examStatus.status}
                                  </span>
                                  {isActive && !isCompleted && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium animate-pulse">
                                      • Live
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {Math.floor(exam.duration_seconds / 60)} min
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {exam.question_count || 2} tasks
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleStartExam(exam.id)}
                                disabled={!canStart}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                  !canStart
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-orange-600 text-white hover:bg-orange-700 shadow-sm'
                                }`}
                              >
                                {isCompleted ? 'Done' : canStart ? (
                                  <>
                                    Start
                                    <ArrowRight className="w-4 h-4" />
                                  </>
                                ) : 'Locked'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Recent Activity */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Your Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Tests</p>
                      <p className="text-lg font-bold text-gray-900">{exams.length}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Completed</p>
                      <p className="text-lg font-bold text-gray-900">{submissions.length}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Average Score</p>
                      <p className="text-lg font-bold text-gray-900">
                        {publishedSubs.length > 0 ? `${avgScore}/${totalQuestions}` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Results */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Results</h3>
              {submissions.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-500">No results yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.slice(0, 5).map((submission) => {
                    const percentage = submission.total_questions && submission.score !== null
                      ? Math.round((submission.score / submission.total_questions) * 100)
                      : 0;
                    const isPublished = submission.isPublished === true;

                    return (
                      <div key={submission.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-900 truncate flex-1">
                            {(submission.examTitle || submission.exam_title)?.substring(0, 30)}
                          </p>
                          {isPublished && (
                            <span className="text-sm font-bold text-gray-900">{percentage}%</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{new Date(submission.finishedAt || submission.finished_at).toLocaleDateString()}</span>
                          {!isPublished && <span className="text-amber-600">Pending</span>}
                        </div>
                        {isPublished && (
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                percentage >= 80 ? 'bg-green-500' :
                                percentage >= 60 ? 'bg-blue-500' :
                                percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Chart - Full Width on Dashboard */}
        {submissions.length > 0 && (
          <div className="mt-6">
            <ProgressChart submissions={submissions} />
          </div>
        )}
        </>
          ) : activeTab === 'tests' ? (
            <>
              {/* Mock Tests Tab - Show All Published Tests */}
              <div className="max-w-6xl">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900">IELTS Mock Tests</h1>
                  <p className="text-gray-600 mt-2">All available practice tests for your preparation</p>
                </div>

                <div className="space-y-6">
                  {/* Listening Tests */}
                  {listeningExams.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <HeadphonesIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">Listening Tests</h2>
                          <p className="text-sm text-gray-500">{listeningExams.length} test{listeningExams.length !== 1 ? 's' : ''} available</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {listeningExams.map((exam) => {
                          const examStatus = getExamStatus(exam.id);
                          const isCompleted = attemptedExams.has(exam.id);
                          const status = examStatuses[exam.id];
                          const isActive = status?.is_active || false;
                          const canStart = isActive && !isCompleted;

                          return (
                            <div key={exam.id} className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-4 hover:shadow-md transition-all">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-900">{exam.title}</h4>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${examStatus.color}`}>
                                      {examStatus.status}
                                    </span>
                                    {isActive && !isCompleted && (
                                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium animate-pulse">
                                        • Live
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {Math.floor(exam.duration_seconds / 60)} min
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <FileText className="w-3 h-3" />
                                      {exam.question_count || 40} questions
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleStartExam(exam.id)}
                                  disabled={!canStart}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                    !canStart
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      : 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                                  }`}
                                >
                                  {isCompleted ? 'Done' : canStart ? (
                                    <>
                                      Start
                                      <ArrowRight className="w-4 h-4" />
                                    </>
                                  ) : 'Locked'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Reading Tests */}
                  {readingExams.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">Reading Tests</h2>
                          <p className="text-sm text-gray-500">{readingExams.length} test{readingExams.length !== 1 ? 's' : ''} available</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {readingExams.map((exam) => {
                          const examStatus = getExamStatus(exam.id);
                          const isCompleted = attemptedExams.has(exam.id);
                          const status = examStatuses[exam.id];
                          const isActive = status?.is_active || false;
                          const canStart = isActive && !isCompleted;

                          return (
                            <div key={exam.id} className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-4 hover:shadow-md transition-all">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-900">{exam.title}</h4>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${examStatus.color}`}>
                                      {examStatus.status}
                                    </span>
                                    {isActive && !isCompleted && (
                                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium animate-pulse">
                                        • Live
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {Math.floor(exam.duration_seconds / 60)} min
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <FileText className="w-3 h-3" />
                                      {exam.question_count || 40} questions
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleStartExam(exam.id)}
                                  disabled={!canStart}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                    !canStart
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                  }`}
                                >
                                  {isCompleted ? 'Done' : canStart ? (
                                    <>
                                      Start
                                      <ArrowRight className="w-4 h-4" />
                                    </>
                                  ) : 'Locked'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Writing Tests */}
                  {writingExams.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <PenToolIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">Writing Tests</h2>
                          <p className="text-sm text-gray-500">{writingExams.length} test{writingExams.length !== 1 ? 's' : ''} available</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {writingExams.map((exam) => {
                          const examStatus = getExamStatus(exam.id);
                          const isCompleted = attemptedExams.has(exam.id);
                          const status = examStatuses[exam.id];
                          const isActive = status?.is_active || false;
                          const canStart = isActive && !isCompleted;

                          return (
                            <div key={exam.id} className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100 rounded-xl p-4 hover:shadow-md transition-all">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-900">{exam.title}</h4>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${examStatus.color}`}>
                                      {examStatus.status}
                                    </span>
                                    {isActive && !isCompleted && (
                                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium animate-pulse">
                                        • Live
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {Math.floor(exam.duration_seconds / 60)} min
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <FileText className="w-3 h-3" />
                                      {exam.question_count || 2} tasks
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleStartExam(exam.id)}
                                  disabled={!canStart}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                    !canStart
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      : 'bg-orange-600 text-white hover:bg-orange-700 shadow-sm'
                                  }`}
                                >
                                  {isCompleted ? 'Done' : canStart ? (
                                    <>
                                      Start
                                      <ArrowRight className="w-4 h-4" />
                                    </>
                                  ) : 'Locked'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {exams.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
                      <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tests Available</h3>
                      <p className="text-gray-500">Check back later for new practice tests</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : activeTab === 'results' ? (
            <>
              {/* Results Tab - Detailed Results with Chart */}
              <div className="max-w-6xl">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900">Your Results</h1>
                  <p className="text-gray-600 mt-2">View your performance and track your progress</p>
                </div>

                {submissions.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Yet</h3>
                    <p className="text-gray-500 mb-6">Complete your first test to see results here</p>
                    <button
                      onClick={() => setActiveTab('tests')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                    >
                      <BookOpen className="w-5 h-5" />
                      Browse Tests
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Results Table */}
                    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                      <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                        <h2 className="text-xl font-bold text-gray-900">Test Submissions</h2>
                        <p className="text-sm text-gray-600 mt-1">All your completed tests and scores</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {submissions.map((submission) => {
                              const percentage = submission.total_questions && submission.score !== null
                                ? Math.round((submission.score / submission.total_questions) * 100)
                                : 0;
                              const isPublished = submission.isPublished === true;

                              return (
                                <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center">
                                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">
                                          {(submission.examTitle || submission.exam_title)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {submission.total_questions || submission.totalQuestions || 40} questions
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-900">
                                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                      {new Date(submission.finishedAt || submission.finished_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(submission.finishedAt || submission.finished_at).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {isPublished ? (
                                      <div className="text-sm">
                                        <span className="font-bold text-gray-900">{submission.score}</span>
                                        <span className="text-gray-500">/{submission.total_questions || submission.totalQuestions || 40}</span>
                                        <div className="text-xs text-gray-500 mt-1">{percentage}%</div>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-400">-</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {isPublished ? (
                                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Published
                                      </span>
                                    ) : (
                                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                                        Pending Review
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    {isPublished ? (
                                      <div className="w-full">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className={`text-xs font-medium ${
                                            percentage >= 80 ? 'text-green-600' :
                                            percentage >= 60 ? 'text-blue-600' :
                                            percentage >= 40 ? 'text-amber-600' : 'text-red-600'
                                          }`}>
                                            {percentage >= 80 ? 'Excellent' :
                                             percentage >= 60 ? 'Good' :
                                             percentage >= 40 ? 'Fair' : 'Needs Work'}
                                          </span>
                                        </div>
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                          <div
                                            className={`h-2 rounded-full transition-all ${
                                              percentage >= 80 ? 'bg-green-500' :
                                              percentage >= 60 ? 'bg-blue-500' :
                                              percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${percentage}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-400">Awaiting results</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Progress Chart */}
                    <ProgressChart submissions={submissions} />
                  </div>
                )}
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
