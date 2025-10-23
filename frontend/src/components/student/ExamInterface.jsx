import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { toast } from 'sonner';
import BackendService from '../../services/BackendService';
import QuestionRenderer from '../QuestionRenderer';
import './ExamInterface.css';

/**
 * ExamInterface Component
 * Handles exam taking with auto-save, timer, and navigation
 */
const ExamInterface = ({ trackId, studentId, onSubmit, onError }) => {
  const [submission, setSubmission] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');

  // Initialize exam
  useEffect(() => {
    const initializeExam = async () => {
      try {
        setLoading(true);
        const result = await BackendService.startSubmission(trackId, studentId);
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to start exam');
        }

        setSubmission(result);
        setQuestions(result.questions || []);
        setAnswers({});
        toast.success('Exam started successfully');
      } catch (error) {
        console.error('Error initializing exam:', error);
        toast.error(error.message || 'Failed to start exam');
        onError?.(error);
      } finally {
        setLoading(false);
      }
    };

    initializeExam();
  }, [trackId, studentId, onError]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-save effect (debounced)
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (submission && Object.keys(answers).length > 0) {
        autoSaveAnswers();
      }
    }, 3000); // Auto-save every 3 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [answers]);

  const autoSaveAnswers = async () => {
    if (!submission) return;

    try {
      setAutoSaveStatus('saving');
      const currentQuestion = questions[currentQuestionIndex];
      const answer = answers[currentQuestion.id];

      if (answer !== undefined) {
        await BackendService.saveAnswer(
          submission.submission_id,
          currentQuestion.id,
          answer
        );
        setAutoSaveStatus('saved');
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus('saved'), 2000);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmitExam = async () => {
    try {
      setSubmitting(true);
      
      // Save current answer first
      const currentQuestion = questions[currentQuestionIndex];
      if (answers[currentQuestion.id] !== undefined) {
        await BackendService.saveAnswer(
          submission.submission_id,
          currentQuestion.id,
          answers[currentQuestion.id]
        );
      }

      // Submit exam
      const result = await BackendService.submitExam(submission.submission_id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit exam');
      }

      toast.success('Exam submitted successfully');
      onSubmit?.(result);
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast.error(error.message || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="exam-interface-loading">
        <Card>
          <CardContent className="pt-6">
            <p>Loading exam...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!submission || questions.length === 0) {
    return (
      <div className="exam-interface-error">
        <Card>
          <CardContent className="pt-6">
            <p>Failed to load exam. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="exam-interface">
      <div className="exam-header">
        <Card>
          <CardHeader>
            <div className="exam-header-content">
              <div>
                <CardTitle>{submission.track.title}</CardTitle>
                <p className="exam-subtitle">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
              <div className="exam-stats">
                <div className="stat">
                  <span className="stat-label">Time:</span>
                  <span className="stat-value">{formatTime(timeSpent)}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Answered:</span>
                  <span className="stat-value">{answeredCount}/{questions.length}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Auto-save:</span>
                  <span className={`stat-value ${autoSaveStatus}`}>{autoSaveStatus}</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="exam-progress">
        <Progress value={progress} className="h-2" />
      </div>

      <div className="exam-content">
        <Card>
          <CardContent className="pt-6">
            <div className="question-container">
              <QuestionRenderer
                question={currentQuestion}
                answer={answers[currentQuestion.id]}
                onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="exam-navigation">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          variant="outline"
        >
          ← Previous
        </Button>

        <div className="nav-center">
          <span className="question-counter">
            {currentQuestionIndex + 1} / {questions.length}
          </span>
        </div>

        {currentQuestionIndex === questions.length - 1 ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                onClick={() => {}}
                disabled={submitting}
                className="submit-button"
              >
                {submitting ? 'Submitting...' : 'Submit Exam'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
              <AlertDialogDescription>
                You have answered {answeredCount} out of {questions.length} questions.
                Are you sure you want to submit your exam?
              </AlertDialogDescription>
              <div className="flex gap-4">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmitExam}>
                  Submit
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button
            onClick={handleNext}
            disabled={currentQuestionIndex === questions.length - 1}
          >
            Next →
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExamInterface;

