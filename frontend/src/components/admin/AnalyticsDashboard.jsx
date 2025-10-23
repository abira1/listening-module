/**
 * Analytics Dashboard Component
 * Displays analytics and performance metrics
 * Part of Phase 4, Task 4.2
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Download,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';
import * as reportingService from '../../services/reportingService';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('month');
  const [selectedExam, setSelectedExam] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboard();
  }, [dateRange, selectedExam]);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);

    const filters = {
      dateRange,
      examId: selectedExam !== 'all' ? selectedExam : undefined
    };

    const result = await reportingService.generateAnalyticsDashboard(filters);

    if (result.success) {
      setDashboardData(result.data);
    } else {
      setError(result.error || 'Failed to load dashboard');
    }
    setLoading(false);
  };

  const handleExportPDF = async () => {
    if (!dashboardData) return;
    const result = await reportingService.exportReportToPDF('dashboard');
    if (!result.success) {
      setError(result.error);
    }
  };

  const handleExportCSV = async () => {
    if (!dashboardData) return;
    const result = await reportingService.exportReportToCSV('dashboard');
    if (!result.success) {
      setError(result.error);
    }
  };

  if (loading) {
    return <div className="analytics-dashboard loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Analytics Dashboard</h1>
        <div className="header-actions">
          <button className="btn btn-icon" onClick={loadDashboard} title="Refresh">
            <RefreshCw size={20} />
          </button>
          <button className="btn btn-icon" onClick={handleExportPDF} title="Export PDF">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="dashboard-filters">
        <div className="filter-group">
          <label>Date Range:</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Exam:</label>
          <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
            <option value="all">All Exams</option>
            {dashboardData?.exams?.map(exam => (
              <option key={exam.id} value={exam.id}>{exam.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <FileText size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Total Exams</p>
            <p className="metric-value">{dashboardData?.totalExams || 0}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Users size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Total Students</p>
            <p className="metric-value">{dashboardData?.totalStudents || 0}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <BarChart3 size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Average Score</p>
            <p className="metric-value">{dashboardData?.averageScore?.toFixed(1) || 0}%</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <TrendingUp size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Pass Rate</p>
            <p className="metric-value">{dashboardData?.passRate?.toFixed(1) || 0}%</p>
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
          className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          Performance
        </button>
        <button
          className={`tab ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          Trends
        </button>
      </div>

      {/* Tab Content */}
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="section-card">
              <h3>Exam Statistics</h3>
              <div className="stats-list">
                <div className="stat-row">
                  <span>Total Attempts:</span>
                  <span className="stat-value">{dashboardData?.totalAttempts || 0}</span>
                </div>
                <div className="stat-row">
                  <span>Completed:</span>
                  <span className="stat-value">{dashboardData?.completedAttempts || 0}</span>
                </div>
                <div className="stat-row">
                  <span>In Progress:</span>
                  <span className="stat-value">{dashboardData?.inProgressAttempts || 0}</span>
                </div>
                <div className="stat-row">
                  <span>Average Time:</span>
                  <span className="stat-value">{dashboardData?.averageTime || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="section-card">
              <h3>Score Distribution</h3>
              <div className="distribution-chart">
                {dashboardData?.scoreDistribution?.map((item, idx) => (
                  <div key={idx} className="distribution-bar">
                    <div className="bar-label">{item.range}</div>
                    <div className="bar-container">
                      <div
                        className="bar-fill"
                        style={{ width: `${(item.count / dashboardData.totalAttempts) * 100}%` }}
                      />
                    </div>
                    <div className="bar-count">{item.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="performance-section">
            <div className="section-card">
              <h3>Top Performing Exams</h3>
              <div className="exam-list">
                {dashboardData?.topExams?.map((exam, idx) => (
                  <div key={idx} className="exam-item">
                    <span className="exam-rank">#{idx + 1}</span>
                    <span className="exam-name">{exam.title}</span>
                    <span className="exam-score">{exam.averageScore.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-card">
              <h3>Student Performance</h3>
              <div className="student-list">
                {dashboardData?.topStudents?.map((student, idx) => (
                  <div key={idx} className="student-item">
                    <span className="student-rank">#{idx + 1}</span>
                    <span className="student-name">{student.name}</span>
                    <span className="student-score">{student.averageScore.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="trends-section">
            <div className="section-card">
              <h3>Performance Trend</h3>
              <div className="trend-chart">
                {dashboardData?.performanceTrend?.map((point, idx) => (
                  <div key={idx} className="trend-point">
                    <div className="point-date">{point.date}</div>
                    <div className="point-value">{point.score.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-card">
              <h3>Insights</h3>
              <div className="insights-list">
                {dashboardData?.insights?.map((insight, idx) => (
                  <div key={idx} className="insight-item">
                    <span className="insight-icon">💡</span>
                    <span className="insight-text">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

