/**
 * Deployment Readiness Check Component
 * Displays deployment readiness status and requirements
 * Part of Phase 2, Task 1.5.3
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Loader } from 'lucide-react';
import './DeploymentReadinessCheck.css';

const DeploymentReadinessCheck = ({ validationResult, questionId }) => {
  const [readinessChecks, setReadinessChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overallStatus, setOverallStatus] = useState('pending');

  useEffect(() => {
    if (validationResult) {
      performReadinessChecks();
    }
  }, [validationResult]);

  const performReadinessChecks = () => {
    setLoading(true);
    const checks = [];

    // Check 1: No Critical Errors
    const hasCriticalErrors = validationResult.errors?.some(e => e.severity === 'CRITICAL') || false;
    checks.push({
      id: 'critical_errors',
      name: 'No Critical Errors',
      description: 'Question must not have any critical errors',
      status: !hasCriticalErrors ? 'pass' : 'fail',
      details: hasCriticalErrors ? `Found ${validationResult.errors.filter(e => e.severity === 'CRITICAL').length} critical error(s)` : 'No critical errors found'
    });

    // Check 2: Valid Question Type
    const hasValidType = !!validationResult.detected_type;
    checks.push({
      id: 'valid_type',
      name: 'Valid Question Type',
      description: 'Question type must be detected',
      status: hasValidType ? 'pass' : 'fail',
      details: hasValidType ? `Type: ${validationResult.detected_type}` : 'Question type not detected'
    });

    // Check 3: Required Fields
    const requiredFields = ['prompt', 'options', 'answer_key'];
    const hasRequiredFields = requiredFields.every(field => {
      const hasError = validationResult.errors?.some(e => e.field === field && e.severity === 'CRITICAL');
      return !hasError;
    });
    checks.push({
      id: 'required_fields',
      name: 'Required Fields Present',
      description: 'All required fields must be present',
      status: hasRequiredFields ? 'pass' : 'fail',
      details: hasRequiredFields ? 'All required fields present' : 'Some required fields are missing'
    });

    // Check 4: Valid Answer Key
    const answerKeyError = validationResult.errors?.find(e => e.field === 'answer_key');
    const hasValidAnswerKey = !answerKeyError;
    checks.push({
      id: 'valid_answer_key',
      name: 'Valid Answer Key',
      description: 'Answer key must be valid and match options',
      status: hasValidAnswerKey ? 'pass' : 'fail',
      details: hasValidAnswerKey ? 'Answer key is valid' : answerKeyError?.message || 'Invalid answer key'
    });

    // Check 5: Options Validation
    const optionsError = validationResult.errors?.find(e => e.field === 'options');
    const hasValidOptions = !optionsError;
    checks.push({
      id: 'valid_options',
      name: 'Valid Options',
      description: 'Options must be properly formatted',
      status: hasValidOptions ? 'pass' : 'fail',
      details: hasValidOptions ? 'Options are valid' : optionsError?.message || 'Invalid options'
    });

    // Check 6: No High Severity Errors (Warning)
    const hasHighErrors = validationResult.errors?.some(e => e.severity === 'HIGH') || false;
    checks.push({
      id: 'high_errors',
      name: 'No High Severity Errors',
      description: 'Recommended: No high severity errors',
      status: !hasHighErrors ? 'pass' : 'warning',
      details: !hasHighErrors ? 'No high severity errors' : `Found ${validationResult.errors.filter(e => e.severity === 'HIGH').length} high error(s)`
    });

    // Check 7: Warnings Review
    const hasWarnings = (validationResult.warnings?.length || 0) > 0;
    checks.push({
      id: 'warnings',
      name: 'Warnings Reviewed',
      description: 'Review and address any warnings',
      status: !hasWarnings ? 'pass' : 'warning',
      details: !hasWarnings ? 'No warnings' : `${validationResult.warnings.length} warning(s) to review`
    });

    // Check 8: Deployment Ready Flag
    const deploymentReady = validationResult.deployment_ready === true;
    checks.push({
      id: 'deployment_ready',
      name: 'Deployment Ready',
      description: 'System confirms question is ready for deployment',
      status: deploymentReady ? 'pass' : 'fail',
      details: deploymentReady ? 'Question is ready for deployment' : 'Question is not ready for deployment'
    });

    setReadinessChecks(checks);

    // Calculate overall status
    const failCount = checks.filter(c => c.status === 'fail').length;
    const warningCount = checks.filter(c => c.status === 'warning').length;

    if (failCount > 0) {
      setOverallStatus('fail');
    } else if (warningCount > 0) {
      setOverallStatus('warning');
    } else {
      setOverallStatus('pass');
    }

    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'fail':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass':
        return 'status-pass';
      case 'fail':
        return 'status-fail';
      case 'warning':
        return 'status-warning';
      default:
        return '';
    }
  };

  const getOverallMessage = () => {
    switch (overallStatus) {
      case 'pass':
        return '✅ Question is ready for deployment!';
      case 'fail':
        return '❌ Question cannot be deployed. Fix critical issues first.';
      case 'warning':
        return '⚠️ Question can be deployed but has warnings to review.';
      default:
        return 'Checking readiness...';
    }
  };

  if (loading) {
    return (
      <div className="deployment-readiness-check">
        <div className="loading-state">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <p>Checking deployment readiness...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="deployment-readiness-check">
      {/* Overall Status */}
      <div className={`overall-status ${getStatusColor(overallStatus)}`}>
        <div className="status-icon">
          {overallStatus === 'pass' && <CheckCircle className="w-8 h-8" />}
          {overallStatus === 'fail' && <AlertCircle className="w-8 h-8" />}
          {overallStatus === 'warning' && <AlertTriangle className="w-8 h-8" />}
        </div>
        <div className="status-content">
          <h3>Deployment Readiness</h3>
          <p>{getOverallMessage()}</p>
        </div>
      </div>

      {/* Readiness Checks */}
      <div className="readiness-checks">
        <h4>Readiness Checks</h4>
        <div className="checks-list">
          {readinessChecks.map((check) => (
            <div key={check.id} className={`check-item ${getStatusColor(check.status)}`}>
              <div className="check-header">
                <div className="check-icon">
                  {getStatusIcon(check.status)}
                </div>
                <div className="check-info">
                  <h5>{check.name}</h5>
                  <p className="check-description">{check.description}</p>
                </div>
              </div>
              <div className="check-details">
                {check.details}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="readiness-summary">
        <div className="summary-stat">
          <span className="stat-label">Passed</span>
          <span className="stat-value passed">
            {readinessChecks.filter(c => c.status === 'pass').length}
          </span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Warnings</span>
          <span className="stat-value warning">
            {readinessChecks.filter(c => c.status === 'warning').length}
          </span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Failed</span>
          <span className="stat-value failed">
            {readinessChecks.filter(c => c.status === 'fail').length}
          </span>
        </div>
      </div>

      {/* Recommendations */}
      <div className="recommendations">
        <h4>Recommendations</h4>
        <ul className="recommendations-list">
          {overallStatus === 'fail' && (
            <li>🔴 Fix all critical errors before deployment</li>
          )}
          {overallStatus === 'warning' && (
            <li>🟡 Review and address warnings for better quality</li>
          )}
          {overallStatus === 'pass' && (
            <li>✅ Question is ready for deployment</li>
          )}
          <li>📋 Review all validation errors and warnings</li>
          <li>🔍 Test the question with sample data</li>
          <li>💾 Save your changes before deployment</li>
        </ul>
      </div>

      {/* Question Info */}
      <div className="question-info">
        <div className="info-item">
          <span className="info-label">Question ID:</span>
          <span className="info-value">{questionId || 'N/A'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Validation Status:</span>
          <span className={`info-value ${validationResult.is_valid ? 'valid' : 'invalid'}`}>
            {validationResult.is_valid ? 'Valid' : 'Invalid'}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Deployment Ready:</span>
          <span className={`info-value ${validationResult.deployment_ready ? 'ready' : 'not-ready'}`}>
            {validationResult.deployment_ready ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DeploymentReadinessCheck;

