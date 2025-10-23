import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackendService } from '../services/BackendService';
import FirebaseAuthService from '../services/FirebaseAuthService';
import { useAuth } from '../contexts/AuthContext';
import { Clock, User, HelpCircle, EyeOff, AlertCircle } from 'lucide-react';
import { MatchingParagraphs } from './reading/MatchingParagraphs';
import { SentenceCompletion } from './reading/SentenceCompletion';
import { TrueFalseNotGiven } from './reading/TrueFalseNotGiven';
import { ShortAnswerReading } from './reading/ShortAnswerReading';
import { MatchingDraggable } from './questions/MatchingDraggable';
import { MultipleChoiceMultiple } from './questions/MultipleChoiceMultiple';
import { NoteCompletion } from './questions/NoteCompletion';
import { MatchingHeadings } from './questions/MatchingHeadings';
import { SummaryCompletionList } from './questions/SummaryCompletionList';
import { FlowchartCompletion } from './questions/FlowchartCompletion';
import { MatchingSentenceEndings } from './questions/MatchingSentenceEndings';
import { TableCompletion } from './questions/TableCompletion';
import { MatchingFeatures } from './questions/MatchingFeatures';
import QuestionErrorBoundary from './QuestionErrorBoundary';
import { validateQuestion, logQuestionRender, logQuestionError, createFallbackRenderer, getSafePayloadValue, getSafeArray } from '../utils/questionValidator';
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
    // Remove any existing tooltip
    hideTooltip();
    
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.id = 'pageIdentifier';
    tooltip.style.display = 'block';
    
    // Find section for this question
    const section = examData?.sections.find(s => 
      s.questions.some(q => q.index === question.index)
    );
    const sectionName = section ? `Passage ${section.index}` : 'Passage';
    
    // Determine status
    const isAnswered = answers[question.index] !== undefined && answers[question.index] !== '';
    const isCurrent = currentQuestionIndex === question.index;
    const isMarkedForReview = reviewMarked.has(question.index);
    
    let status = 'Unanswered';
    let statusClass = 'status-unanswered';
    
    if (isCurrent) {
      status = 'Current';
      statusClass = 'status-current';
    } else if (isMarkedForReview) {
      status = 'Marked for Review';
      statusClass = 'status-review';
    } else if (isAnswered) {
      status = 'Completed';
      statusClass = 'status-completed';
    }
    
    // Create content
    const questionP = document.createElement('p');
    questionP.textContent = `Question ${question.index}`;
    tooltip.appendChild(questionP);
    
    const statusP = document.createElement('p');
    statusP.className = `tooltip-status ${statusClass}`;
    statusP.textContent = status;
    tooltip.appendChild(statusP);
    
    const arrow = document.createElement('span');
    arrow.className = 'tooltip-arrow';
    tooltip.appendChild(arrow);
    
    // Add to body
    document.body.appendChild(tooltip);
    
    // Position tooltip
    const tooltipRect = tooltip.getBoundingClientRect();
    const left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    tooltip.style.left = `${Math.max(10, left)}px`;
    tooltip.style.bottom = `${window.innerHeight - rect.top + 15}px`;
  };

  const hideTooltip = () => {
    const tooltip = document.getElementById('pageIdentifier');
    if (tooltip) {
      tooltip.style.display = 'none';
      tooltip.remove();
    }
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
      const backendSubmissionData = {
        exam_id: examId,
        user_id_or_session: user?.uid || `anonymous_${Date.now()}`,
        answers: answers,
        started_at: new Date().toISOString(),
        finished_at: new Date().toISOString(),
        progress_percent: 100,
      };
      
      await BackendService.createSubmission(backendSubmissionData);

      setSubmissionComplete(true);
      setExamFinished(true);
    } catch (error) {
      console.error('Error submitting exam:', error);
      console.error('Error details:', error.message, error.response);
      
      // Show detailed error message
      const errorMsg = error.message || 'Failed to submit exam. Please try again.';
      alert(`Error submitting exam: ${errorMsg}\n\nPlease contact your instructor if the problem persists.`);
      setIsSubmitting(false);
    }
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

  // Get all matching paragraphs questions for current section
  const getMatchingParagraphsQuestions = () => {
    if (!currentSection) return [];
    return currentSection.questions.filter(q => q.type === 'matching_paragraphs');
  };

  // Handle paragraph box click for matching questions
  const handleParagraphBoxClick = (paragraphLetter) => {
    if (currentQuestionIndex) {
      const currentQuestion = currentSection?.questions.find(q => q.index === currentQuestionIndex);
      if (currentQuestion && currentQuestion.type === 'matching_paragraphs') {
        handleAnswerChange(currentQuestionIndex, paragraphLetter);
      }
    }
  };

  // Parse passage to add paragraph boxes
  const renderPassageWithBoxes = (passageText) => {
    if (!passageText) return null;
    
    const matchingQuestions = getMatchingParagraphsQuestions();
    const hasMatchingQuestions = matchingQuestions.length > 0;
    
    if (!hasMatchingQuestions) {
      return <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">{passageText}</div>;
    }

    // Split by paragraph markers (assuming paragraphs are marked with letters A, B, C, etc.)
    const paragraphPattern = /^([A-Z])\s*$/gm;
    const parts = passageText.split(paragraphPattern);
    
    const elements = [];
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] && parts[i].match(/^[A-Z]$/)) {
        // This is a paragraph letter
        const paragraphLetter = parts[i];
        const paragraphText = parts[i + 1] || '';
        
        // Find which question(s) are assigned to this paragraph
        const assignedQuestions = matchingQuestions.filter(q => answers[q.index] === paragraphLetter);
        
        elements.push(
          <div key={`para-${paragraphLetter}`} className="mb-6">
            <div className="flex items-start gap-3 mb-2">
              <div className="font-bold text-lg text-gray-900 min-w-[2rem]">{paragraphLetter}</div>
              <div 
                onClick={() => handleParagraphBoxClick(paragraphLetter)}
                className={`flex items-center justify-center min-w-[60px] h-[40px] border-2 rounded cursor-pointer transition-all ${
                  assignedQuestions.length > 0
                    ? 'bg-blue-100 border-blue-500 hover:bg-blue-200'
                    : 'bg-white border-gray-400 border-dashed hover:border-blue-400 hover:bg-blue-50'
                }`}
                title={assignedQuestions.length > 0 ? `Question ${assignedQuestions.map(q => q.index).join(', ')}` : 'Click to assign current question'}
              >
                {assignedQuestions.length > 0 ? (
                  <span className="font-bold text-blue-700">
                    {assignedQuestions.map(q => q.index).join(', ')}
                  </span>
                ) : (
                  <span className="text-gray-400 text-xs">Box</span>
                )}
              </div>
            </div>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap ml-11">
              {paragraphText}
            </div>
          </div>
        );
        i++; // Skip the next part as we've already processed it
      } else if (parts[i] && !parts[i].match(/^[A-Z]$/)) {
        // Regular text before first paragraph
        elements.push(
          <div key={`text-${i}`} className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
            {parts[i]}
          </div>
        );
      }
    }
    
    return <div>{elements}</div>;
  };

  const renderQuestionComponent = (question) => {
    try {
      // Validate question structure
      const validation = validateQuestion(question);
      if (!validation.isValid) {
        logQuestionError(question, new Error(validation.errors.join('; ')), 'validation');
        return createFallbackRenderer(question, `Invalid question structure: ${validation.errors[0]}`);
      }

      const answer = answers[question.index] || '';
      const onChange = (value) => handleAnswerChange(question.index, value);
      const payload = question.payload || {};

      switch (question.type) {
      case 'matching_paragraphs':
        return <MatchingParagraphs question={question} answer={answer} onChange={onChange} />;
      case 'sentence_completion':
        return <SentenceCompletion question={question} answer={answer} onChange={onChange} />;
      case 'sentence_completion_wordlist':
        return <SentenceCompletion question={question} answer={answer} onChange={onChange} />;
      case 'true_false_not_given':
        return <TrueFalseNotGiven question={question} answer={answer} onChange={onChange} />;
      case 'yes_no_not_given':
        return <TrueFalseNotGiven question={question} answer={answer} onChange={onChange} />;
      case 'short_answer_reading':
        return <ShortAnswerReading question={question} answer={answer} onChange={onChange} />;
        case 'multiple_choice':
          // Single answer multiple choice
          const mcOptions = getSafeArray(payload, 'options');
          if (mcOptions.length === 0) {
            logQuestionError(question, new Error('No options available'), 'multiple_choice');
            return createFallbackRenderer(question, 'Multiple choice question has no options');
          }
          return (
            <QuestionErrorBoundary question={question} key={question.id}>
              <div className="mb-6">
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[3rem]">{question.index}.</span>
                  <div className="flex-1">
                    <p className="text-gray-700 mb-3">{getSafePayloadValue(payload, 'prompt', 'Question prompt not available')}</p>
                    <div className="space-y-2">
                      {mcOptions.map((option, idx) => {
                        const optionLabel = String.fromCharCode(65 + idx);
                        return (
                          <label key={idx} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="radio"
                              name={`question_${question.index}`}
                              value={optionLabel}
                              checked={answer === optionLabel}
                              onChange={(e) => onChange(e.target.value)}
                              className="mt-1"
                            />
                            <span className="text-gray-700">
                              <span className="font-medium">{optionLabel}.</span> {option}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </QuestionErrorBoundary>
          );
      case 'multiple_choice_multiple':
        return <MultipleChoiceMultiple question={question} answer={answer} onChange={(idx, val) => handleAnswerChange(idx, val)} questionNum={question.index} />;
      case 'note_completion':
        return <NoteCompletion question={question} answer={answer} onChange={(idx, val) => handleAnswerChange(idx, val)} questionNum={question.index} />;
      case 'matching_headings':
        return <MatchingHeadings question={question} answer={answer} onChange={(idx, val) => handleAnswerChange(idx, val)} questionNum={question.index} />;
      case 'summary_completion_text':
        // Summary completion using words from text
        return (
          <div className="mb-4">
            <div className="flex items-start gap-2">
              <span className="font-semibold min-w-[3rem]">{question.index}.</span>
              <div className="flex-1">
                <div className="bg-purple-50 border-l-4 border-purple-400 p-3 mb-2">
                  <p className="text-sm font-medium text-purple-800">📄 Summary (from text)</p>
                </div>
                <p className="text-gray-700 mb-2">{question.payload.prompt}</p>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Use words from the text"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {question.payload.max_words && (
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum {question.payload.max_words} word(s) from the text
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      case 'summary_completion_list':
        return <SummaryCompletionList question={question} answer={answer} onChange={(idx, val) => handleAnswerChange(idx, val)} questionNum={question.index} />;
      case 'flowchart_completion_reading':
        return <FlowchartCompletion question={question} answer={answer} onChange={(idx, val) => handleAnswerChange(idx, val)} questionNum={question.index} />;
      case 'matching_sentence_endings':
        return <MatchingSentenceEndings question={question} answer={answer} onChange={(idx, val) => handleAnswerChange(idx, val)} questionNum={question.index} />;
      case 'table_completion_reading':
        return <TableCompletion question={question} answer={answer} onChange={(idx, val) => handleAnswerChange(idx, val)} questionNum={question.index} />;
      case 'matching_features':
        return <MatchingFeatures question={question} answer={answer} onChange={(idx, val) => handleAnswerChange(idx, val)} questionNum={question.index} />;
      case 'matching_draggable':
        // Handle matching draggable questions with multiple sub-questions
        const questions = question.payload?.questions || [];
        const startIndex = question.index;
        
        // Create a sub-answers object for this matching group
        const matchingAnswers = {};
        questions.forEach((q, idx) => {
          const qIndex = startIndex + idx;
          if (answers[qIndex]) {
            matchingAnswers[qIndex] = answers[qIndex];
          }
        });
        
        return (
          <div className="mb-6">
            <MatchingDraggable
              question={question}
              answers={matchingAnswers}
              onAnswerChange={(qIndex, value) => handleAnswerChange(qIndex, value)}
              questionStartIndex={startIndex}
            />
          </div>
        );
        default:
          logQuestionError(question, new Error(`Unsupported question type: ${question.type}`), 'default');
          return createFallbackRenderer(question, `Question type "${question.type}" is not supported`);
      }
    } catch (error) {
      logQuestionError(question, error, 'renderQuestionComponent');
      return createFallbackRenderer(question, `Error rendering question: ${error.message}`);
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

      {/* Main Content - Split Screen with Passage on left, Questions on right */}
      <main className="flex-1 flex pb-20" style={{ paddingTop: isHeaderHidden ? '80px' : '136px' }} id="highlightable-content">
        {/* Left Side: Reading Passage - 60% width */}
        <div className="w-[60%] bg-white border-r-2 border-gray-300 overflow-y-auto">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {currentSection?.title}
            </h2>
            {renderPassageWithBoxes(currentSection?.passage_text)}
          </div>
        </div>

        {/* Right Side: Questions - 40% width */}
        <div className="w-[40%] bg-gray-50 overflow-y-auto">
          <div className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Questions {currentSection?.questions[0]?.index} - {currentSection?.questions[currentSection?.questions.length - 1]?.index}
              </h2>
              {getMatchingParagraphsQuestions().length > 0 ? (
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">Which paragraph contains the following information?</p>
                  <p className="text-xs">📌 Click a question below, then click the box next to the paragraph in the passage to assign it.</p>
                </div>
              ) : (
                <p className="text-sm text-gray-700">
                  Choose the correct answer for each question.
                </p>
              )}
            </div>
            {currentSection?.questions.map((question) => (
              <div 
                key={question.index} 
                data-question-index={question.index}
                className={`mb-6 p-4 bg-white rounded-lg border-2 transition-all ${
                  currentQuestionIndex === question.index 
                    ? 'border-blue-500 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setCurrentQuestionIndex(question.index)}
              >
                <div className="flex items-start">
                  <span className="font-bold text-gray-900 mr-3 text-lg">{question.index}.</span>
                  <div className="flex-1">
                    {renderQuestionComponent(question)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* QTI-Style Footer Navigation */}
      <footer 
        role="navigation" 
        className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 shadow-lg"
        style={{ height: '60px' }}
      >
        <h1 className="reader-only">Navigation</h1>
        
        {/* Navigation Bar Container */}
        <div className="relative h-full">
          {/* Review Checkbox */}
          <div id="review-checkbox">
            <label htmlFor="mark-for-review-input">
              <input
                id="mark-for-review-input"
                type="checkbox"
                connect-function="mark-for-review"
                checked={reviewMarked.has(currentQuestionIndex)}
                onChange={() => toggleReviewMark(currentQuestionIndex)}
                aria-label="Mark current question for review"
              />
              Review
            </label>
          </div>

          {/* Main Navigation Bar - QTI Style with View Toggle */}
          <div id="navigation-bar" className={isNavMaximised ? 'maximised' : 'minimised'}>
            <div connect-class="testPart" connect-identifier="IELTS_READING_TEST">
              <ul>
                {examData?.sections.map((section) => (
                  <li 
                    key={section.id}
                    connect-class="assessmentSection" 
                    connect-identifier={`Passage${section.index}`}
                  >
                    <span className="section-label">Passage {section.index}</span>
                    <ul>
                      {section.questions.map((question) => {
                        const isAnswered = answers[question.index] !== undefined && answers[question.index] !== '';
                        const isCurrent = currentQuestionIndex === question.index;
                        const isMarkedForReview = reviewMarked.has(question.index);
                        
                        let connectState = '';
                        if (isCurrent) connectState += 'current ';
                        if (isAnswered) connectState += 'completed ';
                        if (isMarkedForReview) connectState += 'marked-for-review';
                        
                        return (
                          <li 
                            key={question.id}
                            connect-class="assessmentItemRef" 
                            connect-identifier={`IELTS-Q${question.index}`}
                          >
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                navigateToQuestion(question.index);
                              }}
                              onMouseEnter={(e) => showTooltip(e, question)}
                              onMouseLeave={hideTooltip}
                              onFocus={(e) => showTooltip(e, question)}
                              onBlur={hideTooltip}
                              connect-state={connectState.trim()}
                              title={`Question ${question.index}`}
                            >
                              <span className="question-label">Question </span>
                              <span className="question-number">{question.index}</span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>

            {/* View Toggle Controls */}
            <div className="views">
              <a
                href="#"
                className="minimise"
                onClick={(e) => {
                  e.preventDefault();
                  toggleNavView();
                }}
                title="switch view to navigation summary"
                role="button"
                aria-label="Switch to compact navigation view"
              >
                <span>navigation summary</span>
              </a>
              
              <a
                href="#"
                className="maximise"
                onClick={(e) => {
                  e.preventDefault();
                  toggleNavView();
                }}
                title="switch view to navigation details"
                role="button"
                aria-label="Switch to detailed navigation view"
              >
                <span>navigation details</span>
              </a>
            </div>
          </div>

          {/* Previous Button */}
          <button
            data-function="previous"
            disabled={currentQuestionIndex <= 1}
            onClick={() => navigateToQuestion(Math.max(1, currentQuestionIndex - 1))}
            title="Previous Question"
            aria-label="Go to previous question"
          >
            <span className="reader-only">Previous Question</span>
          </button>

          {/* Next Button */}
          <button
            data-function="next"
            disabled={currentQuestionIndex >= totalQuestions}
            onClick={() => {
              if (currentQuestionIndex < totalQuestions) {
                navigateToQuestion(currentQuestionIndex + 1);
              } else {
                handleSubmitExam();
              }
            }}
            title={currentQuestionIndex >= totalQuestions ? "Submit Test" : "Next Question"}
            aria-label={currentQuestionIndex >= totalQuestions ? "Submit Test" : "Go to next question"}
          >
            <span className="reader-only">
              {currentQuestionIndex >= totalQuestions ? "Submit Test" : "Next Question"}
            </span>
          </button>
        </div>
      </footer>
    </div>
  );
}
