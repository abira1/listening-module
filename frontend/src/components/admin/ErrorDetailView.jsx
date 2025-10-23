/**
 * Error Detail View Component
 * Displays detailed error information with fix suggestions and examples
 * Part of Phase 2, Task 1.5.2
 */

import React, { useState } from 'react';
import { ChevronLeft, Copy, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import './ErrorDetailView.css';

const ErrorDetailView = ({ error, warning, onBack, questionId }) => {
  const [copied, setCopied] = useState(false);
  const [showExample, setShowExample] = useState(false);

  if (!error && !warning) {
    return null;
  }

  const item = error || warning;
  const isError = !!error;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      case 'HIGH':
        return <AlertTriangle className="w-6 h-6 text-orange-600" />;
      case 'MEDIUM':
        return <Info className="w-6 h-6 text-blue-600" />;
      case 'LOW':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'severity-critical';
      case 'HIGH':
        return 'severity-high';
      case 'MEDIUM':
        return 'severity-medium';
      case 'LOW':
        return 'severity-low';
      default:
        return '';
    }
  };

  return (
    <div className="error-detail-view">
      {/* Header */}
      <div className="detail-header">
        <button className="btn-back" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <h2>Error Details</h2>
        <div className="header-spacer" />
      </div>

      {/* Error Card */}
      <div className={`error-card ${getSeverityColor(item.severity)}`}>
        <div className="error-card-header">
          <div className="error-card-icon">
            {getSeverityIcon(item.severity)}
          </div>
          <div className="error-card-info">
            <h3>{item.field}</h3>
            <span className="severity-badge">{item.severity}</span>
          </div>
        </div>

        {/* Message */}
        <div className="error-section">
          <h4>Issue</h4>
          <p className="error-message">{item.message}</p>
        </div>

        {/* Fix Suggestion */}
        <div className="error-section">
          <h4>How to Fix</h4>
          <div className="fix-box">
            <p>{item.fix}</p>
            <button
              className="btn-copy"
              onClick={() => copyToClipboard(item.fix)}
              title="Copy fix suggestion"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Example */}
        {item.example && (
          <div className="error-section">
            <div className="example-header">
              <h4>Example</h4>
              <button
                className="btn-toggle-example"
                onClick={() => setShowExample(!showExample)}
              >
                {showExample ? 'Hide' : 'Show'}
              </button>
            </div>
            {showExample && (
              <div className="example-box">
                <code>{item.example}</code>
                <button
                  className="btn-copy-example"
                  onClick={() => copyToClipboard(item.example)}
                  title="Copy example"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Additional Info */}
        <div className="error-section">
          <h4>Additional Information</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Question ID:</span>
              <span className="info-value">{questionId || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Field:</span>
              <span className="info-value">{item.field}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Type:</span>
              <span className="info-value">{isError ? 'Error' : 'Warning'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Severity:</span>
              <span className={`severity-label ${getSeverityColor(item.severity)}`}>
                {item.severity}
              </span>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="error-section">
          <h4>Action Items</h4>
          <ol className="action-list">
            <li>Review the issue description above</li>
            <li>Apply the suggested fix to your question data</li>
            <li>Verify the example format matches your data</li>
            <li>Re-validate the question to confirm the fix</li>
          </ol>
        </div>

        {/* Deployment Impact */}
        <div className={`deployment-impact ${getSeverityColor(item.severity)}`}>
          <h4>Deployment Impact</h4>
          {item.severity === 'CRITICAL' && (
            <p>🚫 This error <strong>blocks deployment</strong>. Must be fixed before publishing.</p>
          )}
          {item.severity === 'HIGH' && (
            <p>⚠️ This error <strong>should be fixed</strong> before deployment for best results.</p>
          )}
          {item.severity === 'MEDIUM' && (
            <p>ℹ️ This warning <strong>should be reviewed</strong> but won't block deployment.</p>
          )}
          {item.severity === 'LOW' && (
            <p>✓ This warning is <strong>informational only</strong> and won't affect deployment.</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="detail-footer">
        <button className="btn btn-secondary" onClick={onBack}>
          Back to Report
        </button>
        <button className="btn btn-primary" onClick={() => copyToClipboard(JSON.stringify(item, null, 2))}>
          <Copy className="w-4 h-4" />
          Copy Error Details
        </button>
      </div>
    </div>
  );
};

export default ErrorDetailView;

