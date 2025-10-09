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

  const currentSection = examData?.sections[currentSectionIndex];
  const allQuestions = examData?.sections.flatMap(s => s.questions) || [];

  // Check if timer is in last 2 minutes for blinking effect
  const isLastTwoMinutes = timeRemaining <= 120;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (submissionComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Test Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your reading test has been submitted. Results will be available once your instructor publishes them.
          </p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Test not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        {!isHeaderHidden && (
          <div className="border-b border-gray-200 px-6 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <img src="/ielts-logo.png" alt="IELTS" className="h-10" onError={(e) => e.target.style.display = 'none'} />
                <span className="text-lg font-semibold text-gray-700">Shah Sultan's IELTS Academy</span>
              </div>
              <div className="flex items-center space-x-6">
                <img src="/british-council-logo.png" alt="British Council" className="h-8" onError={(e) => e.target.style.display = 'none'} />
                <img src="/idp-logo.png" alt="IDP" className="h-8" onError={(e) => e.target.style.display = 'none'} />
                <img src="/cambridge-logo.png" alt="Cambridge" className="h-8" onError={(e) => e.target.style.display = 'none'} />
              </div>
            </div>
          </div>
        )}
        <div className="bg-gray-700 text-white px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span className="text-sm">STU-{user?.uid?.slice(0, 5) || '00000'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className={`h-5 w-5 ${isLastTwoMinutes ? 'animate-pulse' : ''}`} />
              <span className={`text-lg font-semibold ${isLastTwoMinutes ? 'text-red-300 animate-pulse' : ''}`}>
                {formatTime(timeRemaining)} minutes left | Passage {currentSectionIndex + 1}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsHeaderHidden(!isHeaderHidden)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
              >
                <EyeOff className="h-4 w-4 inline mr-1" />
                {isHeaderHidden ? 'Show' : 'Hide'}
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors">
                <HelpCircle className="h-4 w-4 inline mr-1" />
                Help
              </button>
            </div>
          </div>
        </div>
      </div>

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
