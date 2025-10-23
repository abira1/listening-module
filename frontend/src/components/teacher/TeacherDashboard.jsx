/**
 * Teacher Dashboard Component
 * Main dashboard for teachers
 * Part of Phase 4, Task 4.3
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import * as teacherService from '../../services/teacherService';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import GradingInterface from './GradingInterface';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { teacher, isAuthenticated, loading: authLoading } = useTeacherAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showGradingInterface, setShowGradingInterface] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/teacher/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (teacher && teacher.teacher_id) {
      loadDashboard();
    }
  }, [teacher]);

  const loadDashboard = async () => {
    if (!teacher || !teacher.teacher_id) {
      setError('Teacher information not available');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dashboardResult = await teacherService.getTeacherDashboard(teacher.teacher_id);
      const pendingResult = await teacherService.getPendingSubmissions(teacher.teacher_id);

      if (dashboardResult.success && dashboardResult.data) {
        setDashboardData(dashboardResult.data);
      } else {
        setError(dashboardResult.error || 'Failed to load dashboard');
        setDashboardData(null);
      }

      if (pendingResult.success) {
        // Ensure pendingSubmissions is always an array
        const submissions = Array.isArray(pendingResult.data) ? pendingResult.data : [];
        setPendingSubmissions(submissions);
      } else {
        // On error, set to empty array to prevent .map() errors
        setPendingSubmissions([]);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('An unexpected error occurred while loading the dashboard');
      setPendingSubmissions([]);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = (submission) => {
    setSelectedSubmission(submission);
    setShowGradingInterface(true);
  };

  const handleGradingComplete = async () => {
    setShowGradingInterface(false);
    setSelectedSubmission(null);
    await loadDashboard();
  };

  const handleExportGrades = async (classId, examId) => {
    const result = await teacherService.exportGradesToCSV(classId, examId);
    if (!result.success) {
      setError(result.error);
    }
  };

  if (authLoading || loading) {
    return <div className="teacher-dashboard loading">Loading dashboard...</div>;
  }

  if (!isAuthenticated || !teacher) {
    return <div className="teacher-dashboard error">Please log in to access the dashboard</div>;
  }

  return (
    <div className="teacher-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Teacher Dashboard - {teacher.full_name}</h1>
        <button className="btn btn-icon" onClick={loadDashboard} title="Refresh">
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <Users size={24} />
          <div>
            <p className="metric-label">Total Students</p>
            <p className="metric-value">{dashboardData?.totalStudents || 0}</p>
          </div>
        </div>

        <div className="metric-card">
          <FileText size={24} />
          <div>
            <p className="metric-label">Total Exams</p>
            <p className="metric-value">{dashboardData?.totalExams || 0}</p>
          </div>
        </div>

        <div className="metric-card">
          <Clock size={24} />
          <div>
            <p className="metric-label">Pending Grading</p>
            <p className="metric-value">{pendingSubmissions.length}</p>
          </div>
        </div>

        <div className="metric-card">
          <CheckCircle size={24} />
          <div>
            <p className="metric-label">Graded</p>
            <p className="metric-value">{dashboardData?.gradedCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Grading ({pendingSubmissions.length})
        </button>
        <button
          className={`tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Students
        </button>
      </div>

      {/* Tab Content */}
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="section-card">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {Array.isArray(dashboardData?.recentActivity) && dashboardData.recentActivity.length > 0 ? (
                  dashboardData.recentActivity.map((activity, idx) => (
                    <div key={idx} className="activity-item">
                      <span className="activity-icon">📝</span>
                      <div className="activity-details">
                        <p className="activity-text">{activity.text || 'Activity'}</p>
                        <p className="activity-time">{activity.time || 'Recently'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-activity">No recent activity</p>
                )}
              </div>
            </div>

            <div className="section-card">
              <h3>Grading Statistics</h3>
              <div className="stats-list">
                <div className="stat-row">
                  <span>Total Submissions:</span>
                  <span className="stat-value">{dashboardData?.totalSubmissions || 0}</span>
                </div>
                <div className="stat-row">
                  <span>Graded:</span>
                  <span className="stat-value">{dashboardData?.gradedCount || 0}</span>
                </div>
                <div className="stat-row">
                  <span>Pending:</span>
                  <span className="stat-value">{pendingSubmissions.length}</span>
                </div>
                <div className="stat-row">
                  <span>Average Score:</span>
                  <span className="stat-value">{dashboardData?.averageScore?.toFixed(1) || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="pending-section">
            {!Array.isArray(pendingSubmissions) || pendingSubmissions.length === 0 ? (
              <div className="no-submissions">
                <CheckCircle size={48} />
                <p>No pending submissions</p>
              </div>
            ) : (
              <div className="submissions-list">
                {pendingSubmissions.map((submission) => (
                  <div key={submission.submission_id || submission.id} className="submission-card">
                    <div className="submission-info">
                      <h4>{submission.student_name || submission.studentName || 'Unknown Student'}</h4>
                      <p className="submission-exam">{submission.exam_title || submission.examTitle || 'Unknown Exam'}</p>
                      <p className="submission-time">Submitted: {submission.submitted_at || submission.submittedAt || 'Unknown'}</p>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleGradeSubmission(submission)}
                    >
                      Grade
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="students-section">
            <div className="section-card">
              <h3>My Students</h3>
              <div className="students-list">
                {Array.isArray(dashboardData?.students) && dashboardData.students.length > 0 ? (
                  dashboardData.students.map((student) => (
                    <div key={student.student_id || student.id} className="student-card">
                      <div className="student-info">
                        <h4>{student.full_name || student.name || 'Unknown Student'}</h4>
                        <p className="student-email">{student.email || 'No email'}</p>
                      </div>
                      <div className="student-stats">
                        <span className="stat">{student.submissionCount || 0} submissions</span>
                        <span className="stat">{student.averageScore?.toFixed(1) || 0}% avg</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-students">No students assigned</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grading Interface Modal */}
      {showGradingInterface && selectedSubmission && (
        <div className="modal-overlay">
          <div className="modal-content">
            <GradingInterface
              submission={selectedSubmission}
              onComplete={handleGradingComplete}
              onCancel={() => setShowGradingInterface(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;

