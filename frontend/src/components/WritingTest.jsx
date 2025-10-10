import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackendService } from '../services/BackendService';
import FirebaseAuthService from '../services/FirebaseAuthService';
import { useAuth } from '../contexts/AuthContext';
import { Clock, User, HelpCircle, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';

export function WritingTest({ examId }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0); // 0 for Task 1, 1 for Task 2
  const [answers, setAnswers] = useState({ 1: '', 2: '' }); // Store answers for both tasks
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examFinished, setExamFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const timerRef = useRef(null);

  // Get all questions (both tasks)
  const allQuestions = examData?.sections?.flatMap(section => section.questions) || [];
  const currentQuestion = allQuestions[currentTaskIndex];

  useEffect(() => {
    const loadExamData = async () => {
      try {
        const data = await BackendService.getExamWithSectionsAndQuestions(examId);
        setExamData(data);
        setTimeRemaining(data.exam.duration_seconds); // 60 minutes
        setLoading(false);
      } catch (error) {
        console.error('Error loading exam data:', error);
        setLoading(false);
      }
    };

    loadExamData();
  }, [examId]);

  // Timer countdown
  useEffect(() => {
    if (examData && !examFinished && !submissionComplete) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [examData, examFinished, submissionComplete]);

  const handleAnswerChange = (taskIndex, value) => {
    setAnswers((prev) => ({
      ...prev,
      [taskIndex]: value,
    }));
  };

  const getWordCount = (text) => {
    if (!text || text.trim() === '') return 0;
    return text.trim().split(/\s+/).length;
  };

  const handleSubmitExam = async () => {
    if (isSubmitting || submissionComplete) return;
    
    setIsSubmitting(true);
    setExamFinished(true);

    try {
      // Prepare submission data
      const submissionData = {
        exam_id: examId,
        student_id: user?.uid || 'anonymous',
        student_email: user?.email || 'anonymous@example.com',
        student_name: user?.displayName || user?.name || 'Anonymous Student',
        answers: answers,
        submitted_at: new Date().toISOString(),
        time_taken: examData.exam.duration_seconds - timeRemaining,
      };

      // Save to Firebase for real-time updates
      if (isAuthenticated && user) {
        await FirebaseAuthService.createSubmission(examId, user.uid, submissionData);
      }

      // Also save to backend
      await BackendService.createSubmission(submissionData);

      setSubmissionComplete(true);
      
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('There was an error submitting your test. Please try again.');
      setIsSubmitting(false);
      setExamFinished(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePreviousTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextTask = () => {
    if (currentTaskIndex < allQuestions.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleHeaderVisibility = () => {
    setIsHeaderHidden(!isHeaderHidden);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-blue-50 to-blue-100 justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading test...</p>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-blue-50 to-blue-100 justify-center items-center">
        <p className="text-gray-600">Test not found</p>
      </div>
    );
  }

  // Completion screen
  if (submissionComplete) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-blue-50 to-blue-100 justify-center items-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your writing test has been submitted. Your instructor will review and grade your responses.
          </p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isFinalTwoMinutes = timeRemaining <= 120 && timeRemaining > 0;
  const currentWordCount = getWordCount(answers[currentQuestion?.index]);
  const minWords = currentQuestion?.payload?.min_words || 150;
  const isWordCountSufficient = currentWordCount >= minWords;

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50">
      {/* Fixed Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-md transition-all duration-300 ${isHeaderHidden ? 'h-20' : 'h-36'}`}>
        {/* Top Logo Section */}
        {!isHeaderHidden && (
          <div className="bg-white border-b border-gray-200 py-3 px-6">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-4">
                <img 
                  src="https://www.ielts.org/-/media/images/ielts-logo-2018.ashx" 
                  alt="IELTS" 
                  className="h-12"
                />
                <img 
                  src="https://i.postimg.cc/k5dQjHG1/images-removebg-preview.png" 
                  alt="Shah Sultan's IELTS Academy" 
                  className="h-12"
                />
              </div>
              <div className="flex items-center gap-4">
                <img 
                  src="https://www.britishcouncil.org/sites/default/files/british-council-logo.png" 
                  alt="British Council" 
                  className="h-10"
                />
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/IDP_Education_logo.svg/2560px-IDP_Education_logo.svg.png" 
                  alt="IDP" 
                  className="h-8"
                />
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/University_of_Cambridge_logo.svg/2560px-University_of_Cambridge_logo.svg.png" 
                  alt="Cambridge" 
                  className="h-10"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Info Bar */}
        <div className="bg-gray-700 text-white py-4 px-6">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <User size={18} />
              <span className="text-sm">ID: STU-{user?.uid?.substring(0, 8) || 'XXXXXX'}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span 
                className={`text-lg font-bold ${isFinalTwoMinutes ? 'text-red-400 animate-pulse' : ''}`}
              >
                {formatTime(timeRemaining)}
              </span>
              <span className="text-sm ml-2">
                minutes left | Task {currentTaskIndex + 1}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <HelpCircle size={16} />
                Help
              </button>
              <button 
                onClick={toggleHeaderVisibility}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <EyeOff size={16} />
                {isHeaderHidden ? 'Show' : 'Hide'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 ${isHeaderHidden ? 'pt-20' : 'pt-36'} pb-8`}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Task Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">
                Writing Task {currentQuestion?.payload?.task_number}
              </h1>
              <div className="text-sm text-gray-600">
                {currentQuestion?.payload?.instructions}
              </div>
            </div>
            
            {/* Task Prompt */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="whitespace-pre-wrap text-gray-800">
                {currentQuestion?.payload?.prompt}
              </div>
            </div>

            {/* Chart Image (only for Task 1) */}
            {currentQuestion?.payload?.chart_image && (
              <div className="mb-6 flex justify-center">
                <img 
                  src={currentQuestion.payload.chart_image} 
                  alt="Chart for Writing Task 1" 
                  className="max-w-full h-auto rounded-lg shadow-md border border-gray-200"
                  style={{ maxHeight: '500px' }}
                />
              </div>
            )}

            {/* Minimum Word Count Notice */}
            <div className="mb-4 text-sm text-gray-600">
              Write at least <strong>{minWords} words</strong>.
            </div>

            {/* Writing Area */}
            <div className="mb-4">
              <textarea
                value={answers[currentQuestion?.index] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion?.index, e.target.value)}
                className="w-full h-96 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-sans text-base leading-relaxed resize-none"
                placeholder="Write your answer here..."
                disabled={examFinished}
              />
            </div>

            {/* Word Counter */}
            <div className={`text-sm font-semibold ${isWordCountSufficient ? 'text-green-600' : 'text-orange-600'}`}>
              Word count: {currentWordCount} / {minWords}
              {!isWordCountSufficient && (
                <span className="ml-2 text-xs">({minWords - currentWordCount} more words needed)</span>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-6">
            <button
              onClick={handlePreviousTask}
              disabled={currentTaskIndex === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                currentTaskIndex === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <ChevronLeft size={20} />
              Previous Task
            </button>

            {currentTaskIndex === allQuestions.length - 1 ? (
              <button
                onClick={handleSubmitExam}
                disabled={isSubmitting}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Test'}
              </button>
            ) : (
              <button
                onClick={handleNextTask}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Next Task
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
