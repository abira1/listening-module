/**
 * Admin Validation Panel Component
 * Integrated panel for validation, error display, and deployment readiness
 * Part of Phase 2, Task 1.5.4
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, Download } from 'lucide-react';
import ValidationErrorPanel from './ValidationErrorPanel';
import ErrorDetailView from './ErrorDetailView';
import DeploymentReadinessCheck from './DeploymentReadinessCheck';
import './AdminValidationPanel.css';

const AdminValidationPanel = ({ validationResult, questionId, onRefresh, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedError, setSelectedError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    errors: true,
    warnings: true,
    readiness: true
  });

  if (!validationResult) {
    return null;
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const downloadReport = () => {
    const report = {
      questionId,
      timestamp: new Date().toISOString(),
      validationResult,
      exportedAt: new Date().toLocaleString()
    };

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2))
    );
    element.setAttribute('download', `validation-report-${questionId}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="admin-validation-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="header-title">
          <h2>Validation Report</h2>
          <span className="question-id">Question: {questionId}</span>
        </div>
        <div className="header-actions">
          <button
            className="btn-icon"
            onClick={onRefresh}
            title="Refresh validation"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            className="btn-icon"
            onClick={downloadReport}
            title="Download report"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            className="btn-icon btn-close"
            onClick={onClose}
            title="Close panel"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="panel-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'errors' ? 'active' : ''}`}
          onClick={() => setActiveTab('errors')}
        >
          Errors ({validationResult.errors?.length || 0})
        </button>
        <button
          className={`tab ${activeTab === 'warnings' ? 'active' : ''}`}
          onClick={() => setActiveTab('warnings')}
        >
          Warnings ({validationResult.warnings?.length || 0})
        </button>
        <button
          className={`tab ${activeTab === 'readiness' ? 'active' : ''}`}
          onClick={() => setActiveTab('readiness')}
        >
          Readiness
        </button>
      </div>

      {/* Content */}
      <div className="panel-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            <ValidationErrorPanel
              validationResult={validationResult}
              questionId={questionId}
              onClose={onClose}
            />
          </div>
        )}

        {/* Errors Tab */}
        {activeTab === 'errors' && (
          <div className="tab-content">
            {selectedError ? (
              <ErrorDetailView
                error={selectedError}
                onBack={() => setSelectedError(null)}
                questionId={questionId}
              />
            ) : (
              <div className="errors-list">
                <h3>Errors ({validationResult.errors?.length || 0})</h3>
                {validationResult.errors && validationResult.errors.length > 0 ? (
                  <div className="error-items">
                    {validationResult.errors.map((error, idx) => (
                      <div
                        key={idx}
                        className={`error-item severity-${error.severity.toLowerCase()}`}
                        onClick={() => setSelectedError(error)}
                      >
                        <div className="error-item-header">
                          <span className="error-field">{error.field}</span>
                          <span className="error-severity">{error.severity}</span>
                        </div>
                        <p className="error-message">{error.message}</p>
                        <span className="view-details">View Details →</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-items">No errors found</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Warnings Tab */}
        {activeTab === 'warnings' && (
          <div className="tab-content">
            {selectedError ? (
              <ErrorDetailView
                warning={selectedError}
                onBack={() => setSelectedError(null)}
                questionId={questionId}
              />
            ) : (
              <div className="warnings-list">
                <h3>Warnings ({validationResult.warnings?.length || 0})</h3>
                {validationResult.warnings && validationResult.warnings.length > 0 ? (
                  <div className="warning-items">
                    {validationResult.warnings.map((warning, idx) => (
                      <div
                        key={idx}
                        className={`warning-item severity-${warning.severity.toLowerCase()}`}
                        onClick={() => setSelectedError(warning)}
                      >
                        <div className="warning-item-header">
                          <span className="warning-field">{warning.field}</span>
                          <span className="warning-severity">{warning.severity}</span>
                        </div>
                        <p className="warning-message">{warning.message}</p>
                        <span className="view-details">View Details →</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-items">No warnings found</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Readiness Tab */}
        {activeTab === 'readiness' && (
          <div className="tab-content">
            <DeploymentReadinessCheck
              validationResult={validationResult}
              questionId={questionId}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="panel-footer">
        <div className="footer-info">
          <span className={`status-badge ${validationResult.is_valid ? 'valid' : 'invalid'}`}>
            {validationResult.is_valid ? '✓ Valid' : '✗ Invalid'}
          </span>
          <span className={`deployment-badge ${validationResult.deployment_ready ? 'ready' : 'not-ready'}`}>
            {validationResult.deployment_ready ? '✓ Ready to Deploy' : '✗ Not Ready'}
          </span>
        </div>
        <button className="btn btn-primary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default AdminValidationPanel;

