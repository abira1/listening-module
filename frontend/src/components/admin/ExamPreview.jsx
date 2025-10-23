/**
 * Exam Preview Component
 * Displays exam details and preview
 * Part of Phase 4, Task 4.1
 */

import React, { useState } from 'react';
import { X, Clock, FileText, Award, Users, Calendar } from 'lucide-react';
import './ExamPreview.css';

const ExamPreview = ({ exam, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="exam-preview">
      <div className="exam-preview-header">
        <h2>{exam.title}</h2>
        <button className="btn-close" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      {/* Tabs */}
      <div className="exam-preview-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {/* Content */}
      <div className="exam-preview-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="exam-description">
              <h3>Description</h3>
              <p>{exam.description}</p>
            </div>

            <div className="exam-stats">
              <div className="stat-card">
                <Clock size={24} />
                <div>
                  <p className="stat-label">Duration</p>
                  <p className="stat-value">{exam.duration} minutes</p>
                </div>
              </div>

              <div className="stat-card">
                <Award size={24} />
                <div>
                  <p className="stat-label">Total Score</p>
                  <p className="stat-value">{exam.totalScore} points</p>
                </div>
              </div>

              <div className="stat-card">
                <FileText size={24} />
                <div>
                  <p className="stat-label">Questions</p>
                  <p className="stat-value">{exam.questionCount || 0}</p>
                </div>
              </div>

              <div className="stat-card">
                <Award size={24} />
                <div>
                  <p className="stat-label">Passing Score</p>
                  <p className="stat-value">{exam.passingScore} points</p>
                </div>
              </div>
            </div>

            {exam.instructions && (
              <div className="exam-instructions">
                <h3>Instructions</h3>
                <p>{exam.instructions}</p>
              </div>
            )}

            {exam.tags && exam.tags.length > 0 && (
              <div className="exam-tags">
                <h3>Tags</h3>
                <div className="tags-list">
                  {exam.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="details-tab">
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className={`status-badge status-${exam.status}`}>
                {exam.status}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Category:</span>
              <span>{exam.category || 'Not specified'}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Difficulty:</span>
              <span className={`difficulty-badge difficulty-${exam.difficulty}`}>
                {exam.difficulty}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Created:</span>
              <span>{formatDate(exam.createdAt)}</span>
            </div>

            {exam.updatedAt && (
              <div className="detail-row">
                <span className="detail-label">Last Updated:</span>
                <span>{formatDate(exam.updatedAt)}</span>
              </div>
            )}

            <div className="detail-row">
              <span className="detail-label">Passing Score:</span>
              <span>{exam.passingScore} / {exam.totalScore}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Pass Percentage:</span>
              <span>{Math.round((exam.passingScore / exam.totalScore) * 100)}%</span>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-tab">
            <div className="settings-group">
              <h3>Display Options</h3>
              <div className="setting-item">
                <span>Show Answers:</span>
                <span className={exam.showAnswers ? 'enabled' : 'disabled'}>
                  {exam.showAnswers ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="setting-item">
                <span>Randomize Questions:</span>
                <span className={exam.randomizeQuestions ? 'enabled' : 'disabled'}>
                  {exam.randomizeQuestions ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="setting-item">
                <span>Randomize Options:</span>
                <span className={exam.randomizeOptions ? 'enabled' : 'disabled'}>
                  {exam.randomizeOptions ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="setting-item">
                <span>Allow Review:</span>
                <span className={exam.allowReview ? 'enabled' : 'disabled'}>
                  {exam.allowReview ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="setting-item">
                <span>Allow Navigation:</span>
                <span className={exam.allowNavigation ? 'enabled' : 'disabled'}>
                  {exam.allowNavigation ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="setting-item">
                <span>Show Timer:</span>
                <span className={exam.showTimer ? 'enabled' : 'disabled'}>
                  {exam.showTimer ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="setting-item">
                <span>Show Progress:</span>
                <span className={exam.showProgress ? 'enabled' : 'disabled'}>
                  {exam.showProgress ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="exam-preview-footer">
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ExamPreview;

