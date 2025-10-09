import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackendService } from '../services/BackendService';
import FirebaseAuthService from '../services/FirebaseAuthService';
import { useAuth } from '../contexts/AuthContext';
import { Clock, User, HelpCircle, EyeOff } from 'lucide-react';
import { MatchingParagraphs } from './reading/MatchingParagraphs';
import { SentenceCompletion } from './reading/SentenceCompletion';
import { TrueFalseNotGiven } from './reading/TrueFalseNotGiven';
import { ShortAnswerReading } from './reading/ShortAnswerReading';
import HighlightManager from '../lib/HighlightManager';
import '../styles/navigation.css';

export function ReadingTest({ examId }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
  const [answers, setAnswers] = useState({});
  const [reviewMarked, setReviewMarked] = useState(new Set());
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([1]));
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examFinished, setExamFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [isNavMaximised, setIsNavMaximised] = useState(true);
  const timerRef = useRef(null);
  const highlightManagerRef = useRef(null);

  // Initialize HighlightManager for passage highlighting
  useEffect(() => {
    if (!examFinished && !isSubmitting) {
      highlightManagerRef.current = new HighlightManager('highlightable-content', {
        noteHtext: true
      });
      
      const examSessionId = `exam-${examId}`;
      if (highlightManagerRef.current) {
        highlightManagerRef.current.restoreRanges(examSessionId);
      }
      
      return () => {
        if (highlightManagerRef.current) {
          highlightManagerRef.current.saveRanges(examSessionId);
          highlightManagerRef.current.destroy();
        }
      };
    }
  }, [examFinished, isSubmitting, examId]);

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
    if (examData && !examFinished) {
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
  }, [examData, examFinished]);

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  const toggleReviewMark = (questionIndex) => {
    setReviewMarked((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex);
      } else {
        newSet.add(questionIndex);
      }
      return newSet;
    });
  };

  const navigateToQuestion = (questionIndex) => {
    setCurrentQuestionIndex(questionIndex);
    setVisitedQuestions((prev) => new Set([...prev, questionIndex]));
    
    setTimeout(() => {
      const questionElement = document.querySelector(`[data-question-index="${questionIndex}"]`);
      if (questionElement) {
        questionElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  };

  const toggleNavView = () => {
    setIsNavMaximised(!isNavMaximised);
  };

  const showTooltip = (event, question) => {
    // Tooltips are handled by CSS in navigation.css
  };

  const hideTooltip = () => {
    // Tooltips are handled by CSS in navigation.css
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current section based on current question
  const getCurrentSection = () => {
    if (!examData) return null;
    for (const section of examData.sections) {
      if (section.questions.some(q => q.index === currentQuestionIndex)) {
        return section;
      }
    }
    return examData.sections[0];
  };

  const handleSubmitExam = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);

    try {
      // Save to Firebase first
      const submissionId = await FirebaseAuthService.saveSubmission(
        user?.uid || 'anonymous',
        examId,
        answers,
        new Date()
      );

      // Also submit to backend for grading
      await BackendService.createSubmission({
        id: submissionId,
        exam_id: examId,
        student_id: user?.uid || 'anonymous',
        student_name: user?.name || 'Anonymous',
        student_email: user?.email || null,
        answers: answers,
        submitted_at: new Date().toISOString(),
        is_published: false,
      });

      setSubmissionComplete(true);
      setExamFinished(true);
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Failed to submit exam. Please try again.');
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionButtonColor = (questionIndex) => {
    if (currentQuestionIndex === questionIndex) {
      return 'bg-blue-600 text-white';
    }
    if (answers[questionIndex] !== undefined && answers[questionIndex] !== '') {
      return 'bg-white text-gray-700 border border-gray-300';
    }
    return 'bg-gray-800 text-white';
  };

  const renderQuestionComponent = (question) => {
    const answer = answers[question.index] || '';
    const onChange = (value) => handleAnswerChange(question.index, value);

    switch (question.type) {
      case 'matching_paragraphs':
        return <MatchingParagraphs question={question} answer={answer} onChange={onChange} />;
      case 'sentence_completion':
        return <SentenceCompletion question={question} answer={answer} onChange={onChange} />;
      case 'sentence_completion_wordlist':
        return <SentenceCompletion question={question} answer={answer} onChange={onChange} />;
      case 'true_false_not_given':
        return <TrueFalseNotGiven question={question} answer={answer} onChange={onChange} />;
      case 'short_answer_reading':
        return <ShortAnswerReading question={question} answer={answer} onChange={onChange} />;
      default:
        return (
          <div className="mb-4 p-4 bg-gray-100 rounded">
            <p className="text-gray-600">Unsupported question type: {question.type}</p>
          </div>
        );
    }
  };

  const currentSection = getCurrentSection();
  const allQuestions = examData?.sections.flatMap(s => s.questions) || [];
  const totalQuestions = allQuestions.length;
  const answeredCount = Object.keys(answers).filter(key => answers[key] !== undefined && answers[key] !== '').length;
  const currentSectionIndex = currentSection?.index || 1;

  // Check if timer is in last 2 minutes for blinking effect
  const isLastTwoMinutes = timeRemaining <= 120;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  if (submissionComplete) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-blue-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Test Completed!</h2>
            <p className="text-gray-600 mb-6">
              Your test has been submitted successfully. Thank you for taking the IELTS Reading Test.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => navigate(isAuthenticated ? '/student/dashboard' : '/')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Return to Home'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="flex justify-center items-center h-screen bg-blue-50">
        <p className="text-gray-600">Unable to load test data</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-blue-50">
      {/* Header - Two-section design - FIXED TO TOP */}
      <header className="fixed top-0 left-0 right-0 bg-white w-full shadow-md z-50">
        {/* Top Section - Logos (can be hidden) */}
        {!isHeaderHidden && (
          <div className="w-full p-4 flex justify-between items-center border-b border-gray-200">
            <div className="flex items-center gap-6">
              <img src="https://i.postimg.cc/FKx07M5m/ILTES.png" alt="IELTS Logo" className="h-10" />
              <img 
                src="https://customer-assets.emergentagent.com/job_login-gateway-23/artifacts/lb58nl9d_Shah-Sultan-Logo-2.png" 
                alt="Shah Sultan's IELTS Academy" 
                className="h-12"
              />
            </div>
            <div className="flex items-center gap-6">
              <img src="https://i.postimg.cc/0Q2DmVPS/Biritsh-Council.png" alt="British Council" className="h-8" />
              <img src="https://i.postimg.cc/9f2GXWkJ/IDB.png" alt="IDP" className="h-8" />
              <img src="https://i.postimg.cc/TYZVSjJ8/Cambridge-University.png" alt="Cambridge Assessment English" className="h-8" />
            </div>
          </div>
        )}
        
        {/* Bottom Section - Info Bar (always visible) */}
        <div className="w-full bg-gray-700 px-6 py-3 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <span className="text-sm font-medium">
              {user?.id ? `STU-${user.id.slice(0, 5).toUpperCase()}` : 'STUDENT'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5" />
            <div 
              className={`px-4 py-2 rounded-lg font-bold text-lg transition-all duration-500 ${
                timeRemaining < 120 
                  ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/50 animate-pulse-slow' 
                  : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50'
              }`}
              style={{
                transform: timeRemaining < 120 ? 'scale(1.05)' : 'scale(1)',
                boxShadow: timeRemaining < 120 
                  ? '0 0 20px rgba(239, 68, 68, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)' 
                  : '0 0 10px rgba(59, 130, 246, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
              }}
            >
              <span className="drop-shadow-lg">
                {formatTime(timeRemaining)} left | Passage {currentSectionIndex}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-500 hover:bg-blue-600 rounded text-sm font-medium transition-colors"
              title="Get help"
            >
              <HelpCircle className="w-4 h-4" />
              Help
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-500 hover:bg-blue-600 rounded text-sm font-medium transition-colors"
              title={isHeaderHidden ? "Show header" : "Hide header"}
              onClick={() => setIsHeaderHidden(!isHeaderHidden)}
            >
              <EyeOff className="w-4 h-4" />
              {isHeaderHidden ? 'Show' : 'Hide'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area - Split Screen */}
      <div className={`flex-1 flex ${isHeaderHidden ? 'pt-16' : 'pt-32'} pb-28`}>
        {/* Left Side: Reading Passage */}
        <div className="w-1/2 bg-white border-r border-gray-300 overflow-y-auto">
          <div className="p-8" id="highlightable-content">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {currentSection?.title}
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {currentSection?.passage_text}
            </div>
          </div>
        </div>

        {/* Right Side: Questions */}
        <div className="w-1/2 bg-gray-50 overflow-y-auto">
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Questions {currentSection?.questions[0]?.index} - {currentSection?.questions[currentSection?.questions.length - 1]?.index}
            </h2>
            {currentSection?.questions.map((question) => (
              <div 
                key={question.index} 
                data-question-index={question.index}
                className={`mb-6 ${currentQuestionIndex === question.index ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
              >
                <div className="flex items-start mb-2">
                  <span className="font-bold text-gray-900 mr-2">{question.index}.</span>
                  <div className="flex-1">
                    {renderQuestionComponent(question)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-lg" style={{ height: '110px' }}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={reviewMarked.has(currentQuestionIndex)}
                onChange={() => toggleReviewMark(currentQuestionIndex)}
                className="h-4 w-4"
              />
              <label className="text-sm text-gray-700">Review</label>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateToQuestion(Math.max(1, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 1}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded transition-colors text-sm"
              >
                <ChevronLeft className="h-4 w-4 inline" /> Previous
              </button>
              <button
                onClick={() => navigateToQuestion(Math.min(40, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === 40}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded transition-colors text-sm"
              >
                Next <ChevronRight className="h-4 w-4 inline" />
              </button>
              <button
                onClick={handleSubmitExam}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded font-semibold transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Test'}
              </button>
            </div>
          </div>
          
          {/* Question navigation buttons */}
          <div className="flex flex-wrap gap-1">
            {allQuestions.map((question) => {
              const section = examData.sections.find(s => s.questions.some(q => q.index === question.index));
              const isAnswered = answers[question.index] !== undefined && answers[question.index] !== '';
              const isMarked = reviewMarked.has(question.index);
              
              return (
                <button
                  key={question.index}
                  onClick={() => navigateToQuestion(question.index)}
                  className={`w-10 h-10 text-sm font-medium rounded transition-all ${getQuestionButtonColor(question.index)} ${
                    isMarked ? 'ring-2 ring-yellow-400' : ''
                  }`}
                  title={`Q${question.index} - Section ${section?.index || ''}`}
                >
                  {question.index}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
