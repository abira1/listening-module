/**
 * Grading Interface Component
 * Interface for grading student submissions
 * Part of Phase 4, Task 4.3
 */

import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import * as teacherService from '../../services/teacherService';
import './GradingInterface.css';

const GradingInterface = ({ submission, onComplete, onCancel }) => {
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submissionDetails, setSubmissionDetails] = useState(null);

  useEffect(() => {
    loadSubmissionDetails();
  }, [submission.id]);

  const loadSubmissionDetails = async () => {
    const result = await teacherService.getSubmissionDetails(submission.id);
    if (result.success) {
      setSubmissionDetails(result.data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    // Validate
    const validation = teacherService.validateGradeData({
      score: parseFloat(score),
      feedback
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      setLoading(false);
      return;
    }

    // Submit grade
    const result = await teacherService.gradeSubmission(submission.id, {
      score: parseFloat(score),
      feedback
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 1500);
    } else {
      setErrors([result.error]);
    }

    setLoading(false);
  };

  return (
    <div className="grading-interface">
      <div className="grading-header">
        <h2>Grade Submission</h2>
        <button className="btn-close" onClick={onCancel}>
          <X size={24} />
        </button>
      </div>

      {/* Submission Info */}
      <div className="submission-info-section">
        <div className="info-row">
          <span className="label">Student:</span>
          <span className="value">{submission.studentName}</span>
        </div>
        <div className="info-row">
          <span className="label">Exam:</span>
          <span className="value">{submission.examTitle}</span>
        </div>
        <div className="info-row">
          <span className="label">Submitted:</span>
          <span className="value">{submission.submittedAt}</span>
        </div>
      </div>

      {/* Submission Details */}
      {submissionDetails && (
        <div className="submission-details-section">
          <h3>Submission Details</h3>
          <div className="details-content">
            {submissionDetails.answers?.map((answer, idx) => (
              <div key={idx} className="answer-item">
                <div className="question-text">
                  <strong>Q{idx + 1}:</strong> {answer.questionText}
                </div>
                <div className="student-answer">
                  <p className="answer-label">Student's Answer:</p>
                  <p className="answer-text">{answer.studentAnswer}</p>
                </div>
                {answer.correctAnswer && (
                  <div className="correct-answer">
                    <p className="answer-label">Correct Answer:</p>
                    <p className="answer-text">{answer.correctAnswer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="form-errors">
          {errors.map((error, idx) => (
            <div key={idx} className="error-item">
              <AlertCircle size={18} />
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="success-message">
          <CheckCircle size={24} />
          <p>Grade submitted successfully!</p>
        </div>
      )}

      {/* Grading Form */}
      {!success && (
        <form onSubmit={handleSubmit} className="grading-form">
          <div className="form-group">
            <label htmlFor="score">Score (0-100) *</label>
            <input
              type="number"
              id="score"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              min="0"
              max="100"
              placeholder="Enter score"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="feedback">Feedback *</label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter feedback for the student"
              rows="6"
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Grade'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default GradingInterface;

