import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import BackendService from '../../services/BackendService';
import './ResultsDisplay.css';

/**
 * ResultsDisplay Component
 * Shows exam results with score breakdown and question analysis
 */
const ResultsDisplay = ({ submissionId, onRetake }) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const result = await BackendService.getResults(submissionId);
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to load results');
        }

        setResults(result);
        toast.success('Results loaded successfully');
      } catch (error) {
        console.error('Error fetching results:', error);
        toast.error(error.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [submissionId]);

  const toggleQuestionExpand = (questionNumber) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionNumber]: !prev[questionNumber]
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#22c55e'; // Green
    if (percentage >= 60) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const getScoreBadge = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="results-loading">
        <Card>
          <CardContent className="pt-6">
            <p>Loading results...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="results-error">
        <Card>
          <CardContent className="pt-6">
            <p>Failed to load results. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { submission, results: questionResults } = results;
  const correctCount = questionResults.filter(r => r.is_correct).length;
  const totalQuestions = questionResults.length;

  return (
    <div className="results-display">
      {/* Score Card */}
      <Card className="score-card">
        <CardHeader>
          <CardTitle>Exam Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="score-container">
            <div className="score-circle">
              <div className="score-percentage" style={{ color: getScoreColor(submission.percentage) }}>
                {submission.percentage.toFixed(1)}%
              </div>
              <div className="score-label">Score</div>
            </div>

            <div className="score-details">
              <div className="detail-row">
                <span className="detail-label">Marks Obtained:</span>
                <span className="detail-value">{submission.obtained_marks} / {submission.total_marks}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Questions Correct:</span>
                <span className="detail-value">{correctCount} / {totalQuestions}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <Badge variant={getScoreBadge(submission.percentage)}>
                  {submission.status.toUpperCase()}
                </Badge>
              </div>
              <div className="detail-row">
                <span className="detail-label">Submitted:</span>
                <span className="detail-value">{formatDate(submission.completed_at)}</span>
              </div>
            </div>
          </div>

          <div className="score-progress">
            <div className="progress-label">
              <span>Performance</span>
              <span>{submission.percentage.toFixed(1)}%</span>
            </div>
            <Progress value={submission.percentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Question Analysis */}
      <Card className="analysis-card">
        <CardHeader>
          <CardTitle>Question Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="questions-list">
            {questionResults.map((result, index) => (
              <div key={index} className="question-result">
                <div
                  className="question-header"
                  onClick={() => toggleQuestionExpand(result.question_number)}
                >
                  <div className="question-info">
                    <span className="question-number">Q{result.question_number}</span>
                    <span className="question-type">{result.question_type}</span>
                    <Badge variant={result.is_correct ? 'default' : 'destructive'}>
                      {result.is_correct ? '✓ Correct' : '✗ Incorrect'}
                    </Badge>
                  </div>
                  <div className="question-marks">
                    <span className="marks-value">
                      {result.marks_obtained} / {result.marks_total}
                    </span>
                    <span className="expand-icon">
                      {expandedQuestions[result.question_number] ? '▼' : '▶'}
                    </span>
                  </div>
                </div>

                {expandedQuestions[result.question_number] && (
                  <div className="question-details">
                    {result.feedback && (
                      <div className="feedback">
                        <span className="feedback-label">Feedback:</span>
                        <p>{result.feedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="summary-card">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="summary-grid">
            <div className="summary-item">
              <div className="summary-value">{correctCount}</div>
              <div className="summary-label">Correct Answers</div>
            </div>
            <div className="summary-item">
              <div className="summary-value">{totalQuestions - correctCount}</div>
              <div className="summary-label">Incorrect Answers</div>
            </div>
            <div className="summary-item">
              <div className="summary-value">{((correctCount / totalQuestions) * 100).toFixed(1)}%</div>
              <div className="summary-label">Accuracy</div>
            </div>
            <div className="summary-item">
              <div className="summary-value">{submission.obtained_marks}</div>
              <div className="summary-label">Total Marks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="results-actions">
        <Button
          onClick={onRetake}
          className="retake-button"
        >
          Retake Exam
        </Button>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default ResultsDisplay;

