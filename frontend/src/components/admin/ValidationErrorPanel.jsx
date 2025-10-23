/**
 * Validation Error Panel Component
 * Displays question validation errors and warnings with actionable fixes
 * Part of Phase 1, Task 1.5
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, ChevronDown, ChevronUp, Copy, Download } from 'lucide-react';
import './ValidationErrorPanel.css';

const ValidationErrorPanel = ({ validationResult, questionId, onClose }) => {
  const [expandedErrors, setExpandedErrors] = useState({});
  const [expandedWarnings, setExpandedWarnings] = useState({});
  const [copied, setCopied] = useState(false);

  if (!validationResult) {
    return null;
  }

  const { is_valid, errors, warnings, summary, deployment_ready } = validationResult;

  const toggleError = (index) => {
    setExpandedErrors(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleWarning = (index) => {
    setExpandedWarnings(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReport = () => {
    const report = JSON.stringify(validationResult, null, 2);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report));
    element.setAttribute('download', `validation-report-${questionId}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'HIGH':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'MEDIUM':
        return <Info className="w-5 h-5 text-blue-600" />;
      case 'LOW':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="validation-error-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="header-title">
          {is_valid ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-600" />
          )}
          <h2>Validation Report</h2>
          {questionId && <span className="question-id">Question: {questionId}</span>}
        </div>
        <div className="header-actions">
          <button
            className="btn-icon"
            onClick={downloadReport}
            title="Download report"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            className="btn-icon"
            onClick={onClose}
            title="Close panel"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className={`status-summary ${is_valid ? 'valid' : 'invalid'}`}>
        <div className="status-badge">
          {is_valid ? '✅ VALID' : '❌ INVALID'}
        </div>
        <div className="deployment-status">
          Deployment Ready: {deployment_ready ? '✅ Yes' : '❌ No'}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="summary-stats">
        <div className="stat-item critical">
          <span className="stat-label">Critical</span>
          <span className="stat-value">{summary?.critical_count || 0}</span>
        </div>
        <div className="stat-item high">
          <span className="stat-label">High</span>
          <span className="stat-value">{summary?.high_count || 0}</span>
        </div>
        <div className="stat-item medium">
          <span className="stat-label">Medium</span>
          <span className="stat-value">{summary?.medium_count || 0}</span>
        </div>
        <div className="stat-item low">
          <span className="stat-label">Low</span>
          <span className="stat-value">{summary?.low_count || 0}</span>
        </div>
      </div>

      {/* Errors Section */}
      {errors && errors.length > 0 && (
        <div className="errors-section">
          <h3 className="section-title">
            <AlertCircle className="w-5 h-5" />
            Errors ({errors.length})
          </h3>
          <div className="errors-list">
            {errors.map((error, index) => (
              <div key={index} className={`error-item severity-${error.severity.toLowerCase()}`}>
                <div
                  className="error-header"
                  onClick={() => toggleError(index)}
                >
                  <div className="error-header-left">
                    {getSeverityIcon(error.severity)}
                    <div className="error-info">
                      <span className="error-field">{error.field}</span>
                      <span className="error-severity">{error.severity}</span>
                    </div>
                  </div>
                  {expandedErrors[index] ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
                {expandedErrors[index] && (
                  <div className="error-details">
                    <p className="error-message">{error.message}</p>
                    <div className="error-fix">
                      <strong>Fix:</strong> {error.fix}
                    </div>
                    {error.example && (
                      <div className="error-example">
                        <strong>Example:</strong> {error.example}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings Section */}
      {warnings && warnings.length > 0 && (
        <div className="warnings-section">
          <h3 className="section-title">
            <AlertTriangle className="w-5 h-5" />
            Warnings ({warnings.length})
          </h3>
          <div className="warnings-list">
            {warnings.map((warning, index) => (
              <div key={index} className={`warning-item severity-${warning.severity.toLowerCase()}`}>
                <div
                  className="warning-header"
                  onClick={() => toggleWarning(index)}
                >
                  <div className="warning-header-left">
                    {getSeverityIcon(warning.severity)}
                    <div className="warning-info">
                      <span className="warning-field">{warning.field}</span>
                      <span className="warning-severity">{warning.severity}</span>
                    </div>
                  </div>
                  {expandedWarnings[index] ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
                {expandedWarnings[index] && (
                  <div className="warning-details">
                    <p className="warning-message">{warning.message}</p>
                    <div className="warning-fix">
                      <strong>Fix:</strong> {warning.fix}
                    </div>
                    {warning.example && (
                      <div className="warning-example">
                        <strong>Example:</strong> {warning.example}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Message */}
      {is_valid && errors.length === 0 && (
        <div className="success-message">
          <CheckCircle className="w-6 h-6" />
          <p>✅ Question is valid and ready for deployment!</p>
        </div>
      )}

      {/* Footer Actions */}
      <div className="panel-footer">
        <button
          className="btn btn-secondary"
          onClick={onClose}
        >
          Close
        </button>
        <button
          className="btn btn-primary"
          onClick={downloadReport}
        >
          <Download className="w-4 h-4" />
          Download Report
        </button>
      </div>
    </div>
  );
};

export default ValidationErrorPanel;

