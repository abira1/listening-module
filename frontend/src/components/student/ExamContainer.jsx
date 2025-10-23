/**
 * Exam Container Component
 * Main exam taking interface with navigation and timer
 * Part of Phase 3, Task 3.2
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Flag, AlertCircle } from 'lucide-react';
import './ExamContainer.css';

const ExamContainer = ({ exam, onExit, onSubmit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(exam.duration * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Mock questions data
  const questions = Array.from({ length: exam.questionsCount }, (_, i) => ({
    id: `Q${i + 1}`,
    type: 'multiple_choice',
    prompt: `Question ${i + 1}: What is the answer?`,
    options: [
      { value: 'A', text: 'Option A' },
      { value: 'B', text: 'Option B' },
      { value: 'C', text: 'Option C' },
      { value: 'D', text: 'Option D' }
    ]
  }));

  // Timer effect
  useEffect(() => {
    if (isPaused || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, timeRemaining]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = answers[currentQuestion.id] !== undefined;
  const isFlagged = flaggedQuestions.has(currentQuestion.id);
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  const handleAnswerChange = (value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleFlagQuestion = () => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(currentQuestion.id)) {
      newFlagged.delete(currentQuestion.id);
    } else {
      newFlagged.add(currentQuestion.id);
    }
    setFlaggedQuestions(newFlagged);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      examId: exam.id,
      answers,
      timeSpent: exam.duration * 60 - timeRemaining,
      flaggedQuestions: Array.from(flaggedQuestions)
    });
  };

  const getTimeWarningClass = () => {
    if (timeRemaining <= 300) return 'time-critical';
    if (timeRemaining <= 900) return 'time-warning';
    return '';
  };

  return (
    <div className="exam-container">
      {/* Header */}
      <div className="exam-header">
        <div className="exam-info">
          <h2>{exam.title}</h2>
          <span className="question-counter">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
        <div className={`timer ${getTimeWarningClass()}`}>
          <span className="time-display">{formatTime(timeRemaining)}</span>
          <button
            className="btn-pause"
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="exam-content">
        {/* Sidebar */}
        <div className="exam-sidebar">
          <div className="progress-section">
            <h3>Progress</h3>
            <div className="progress-stats">
              <div className="stat">
                <span className="stat-label">Answered</span>
                <span className="stat-value answered">{answeredCount}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Unanswered</span>
                <span className="stat-value unanswered">{unansweredCount}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Flagged</span>
                <span className="stat-value flagged">{flaggedQuestions.size}</span>
              </div>
            </div>
          </div>

          <div className="questions-grid">
            <h3>Questions</h3>
            <div className="grid">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  className={`question-btn ${idx === currentQuestionIndex ? 'active' : ''} ${
                    answers[q.id] ? 'answered' : ''
                  } ${flaggedQuestions.has(q.id) ? 'flagged' : ''}`}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  title={`Question ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="legend">
            <div className="legend-item">
              <div className="legend-box answered"></div>
              <span>Answered</span>
            </div>
            <div className="legend-item">
              <div className="legend-box flagged"></div>
              <span>Flagged</span>
            </div>
            <div className="legend-item">
              <div className="legend-box"></div>
              <span>Unanswered</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="exam-main">
          {/* Question */}
          <div className="question-section">
            <div className="question-header">
              <h3>{currentQuestion.prompt}</h3>
              <button
                className={`btn-flag ${isFlagged ? 'flagged' : ''}`}
                onClick={handleFlagQuestion}
                title={isFlagged ? 'Unflag question' : 'Flag question'}
              >
                <Flag className="w-5 h-5" />
              </button>
            </div>

            {/* Answer Options */}
            <div className="answer-options">
              {currentQuestion.options.map(option => (
                <label key={option.value} className="option">
                  <input
                    type="radio"
                    name="answer"
                    value={option.value}
                    checked={answers[currentQuestion.id] === option.value}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                  />
                  <span className="option-text">{option.text}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="question-navigation">
            <button
              className="btn btn-secondary"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              className="btn btn-secondary"
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="btn btn-secondary"
              onClick={() => setShowConfirmExit(true)}
            >
              Exit Exam
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowSubmitConfirm(true)}
            >
              Submit Exam
            </button>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showConfirmExit && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Exit Exam?</h3>
            <p>Your progress will be saved. You can continue later.</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmExit(false)}
              >
                Continue Exam
              </button>
              <button
                className="btn btn-danger"
                onClick={() => onExit()}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Submit Exam?</h3>
            <div className="submit-info">
              <p>Answered: <strong>{answeredCount}/{questions.length}</strong></p>
              <p>Unanswered: <strong>{unansweredCount}</strong></p>
              {unansweredCount > 0 && (
                <div className="warning">
                  <AlertCircle className="w-4 h-4" />
                  <span>You have unanswered questions</span>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowSubmitConfirm(false)}
              >
                Continue Exam
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamContainer;

