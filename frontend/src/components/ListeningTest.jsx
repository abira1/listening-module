import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackendService } from '../services/BackendService';
import FirebaseAuthService from '../services/FirebaseAuthService';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Volume2, ChevronLeft, ChevronRight, HelpCircle, EyeOff, User } from 'lucide-react';
import HighlightManager from '../lib/HighlightManager';
import '../styles/navigation.css';

export function ListeningTest({ examId, audioRef }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1); // Changed from currentSection
  const [answers, setAnswers] = useState({});
  const [reviewMarked, setReviewMarked] = useState(new Set()); // Track questions marked for review
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([1])); // Track which questions have been viewed
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [audioEnded, setAudioEnded] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQuestionGroup, setCurrentQuestionGroup] = useState(0); // 0 = questions 1-10, 1 = 11-20, etc.
  const [isHeaderHidden, setIsHeaderHidden] = useState(false); // Track header visibility
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [isNavMaximised, setIsNavMaximised] = useState(true); // Navigation view state
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipData, setTooltipData] = useState({ section: '', question: '', x: 0, y: 0 });
  const timerRef = useRef(null);
  const audioEndTimeRef = useRef(null);
  const highlightManagerRef = useRef(null);
  const tooltipRef = useRef(null);

  // Initialize HighlightManager
  useEffect(() => {
    if (!examFinished && !isSubmitting) {
      highlightManagerRef.current = new HighlightManager('highlightable-content', {
        noteHtext: false
      });
      
      return () => {
        if (highlightManagerRef.current) {
          highlightManagerRef.current.destroy();
        }
      };
    }
  }, [examFinished, isSubmitting]);

  // Save/restore highlights on section change
  useEffect(() => {
    if (highlightManagerRef.current && examData) {
      const sectionId = `section-${currentQuestionIndex}`;
      highlightManagerRef.current.restoreRanges(sectionId);
      
      return () => {
        if (highlightManagerRef.current) {
          highlightManagerRef.current.saveRanges(sectionId);
        }
      };
    }
  }, [currentQuestionIndex, examData]);

  useEffect(() => {
    const loadExamData = async () => {
      try {
        const data = await BackendService.getExamWithSectionsAndQuestions(examId);
        setExamData(data);
        setTimeRemaining(data.exam.duration_seconds);
        setLoading(false);
      } catch (error) {
        console.error('Error loading exam data:', error);
        setLoading(false);
      }
    };

    loadExamData();
  }, [examId]);

  useEffect(() => {
    if (audioRef?.current && examData) {
      const handleAudioEnded = () => {
        console.log('Audio playback ended');
        setAudioEnded(true);
        // Set timer for additional 2 minutes (120 seconds)
        audioEndTimeRef.current = Date.now();
      };

      audioRef.current.addEventListener('ended', handleAudioEnded);

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('ended', handleAudioEnded);
        }
      };
    }
  }, [audioRef, examData]);

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
    // Update question group based on question index
    const group = Math.floor((questionIndex - 1) / 10);
    setCurrentQuestionGroup(group);
  };

  const getQuestionButtonColor = (questionIndex) => {
    // Check if this is the currently selected question
    if (currentQuestionIndex === questionIndex) {
      return 'bg-blue-600 text-white'; // Blue - currently selected/being answered
    }
    
    // Check if answered
    if (answers[questionIndex] !== undefined && answers[questionIndex] !== '') {
      return 'bg-white text-gray-700 border border-gray-300'; // White - answered
    }
    
    // Default: unanswered/empty
    return 'bg-gray-800 text-white'; // Black - empty/unanswered
  };

  // Tooltip functionality
  const showTooltip = (event, question) => {
    // Remove any existing tooltip
    hideTooltip();
    
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.id = 'pageIdentifier';
    
    // Get section for this question
    let sectionName = 'Section 1';
    if (examData) {
      for (const section of examData.sections) {
        if (section.questions.some(q => q.index === question.index)) {
          sectionName = `Section ${section.index}`;
          break;
        }
      }
    }
    
    // Create tooltip content
    const partP = document.createElement('p');
    partP.textContent = sectionName;
    partP.style.fontWeight = 'bold';
    partP.style.marginBottom = '4px';
    
    const pageP = document.createElement('p');
    pageP.textContent = `Question ${question.index}`;
    
    tooltip.appendChild(partP);
    tooltip.appendChild(pageP);
    
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
      tooltip.remove();
    }
  };

  const getAllQuestions = () => {
    if (!examData) return [];
    // Flatten all questions from all sections into a single array
    const allQuestions = [];
    examData.sections.forEach((section) => {
      section.questions.forEach((question) => {
        allQuestions.push(question);
      });
    });
    return allQuestions.sort((a, b) => a.index - b.index);
  };

  const getCurrentQuestion = () => {
    const allQuestions = getAllQuestions();
    return allQuestions.find((q) => q.index === currentQuestionIndex);
  };

  const handleSubmitExam = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setExamFinished(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    try {
      // Get auto-grading from backend
      const backendSubmissionData = {
        exam_id: examId,
        user_id_or_session: isAuthenticated && user ? user.uid : `anonymous_${Date.now()}`,
        answers: answers,
        started_at: new Date().toISOString(),
        finished_at: new Date().toISOString(),
        progress_percent: 100,
      };

      const gradedSubmission = await BackendService.createSubmission(backendSubmissionData);
      
      // Save to Firebase if user is authenticated
      // Note: Backend auto-grades but doesn't return score until admin publishes
      if (isAuthenticated && user?.uid) {
        const firebaseSubmissionData = {
          examId: examId,
          examTitle: examData?.exam?.title || 'IELTS Listening Test',
          studentUid: user.uid,
          studentName: user.name || user.displayName,
          studentEmail: user.email,
          answers: answers,
          score: null, // Score hidden until published by admin
          totalQuestions: gradedSubmission.total_questions,
          percentage: null, // Percentage hidden until published
          startedAt: backendSubmissionData.started_at,
          finishedAt: backendSubmissionData.finished_at,
          isPublished: false
        };
        
        await FirebaseAuthService.saveSubmission(firebaseSubmissionData);
      }
      
      // Show completion message WITHOUT score (score hidden until admin publishes)
      alert('Test submitted successfully! Your answers have been saved.\n\nResults will be available once your instructor publishes them.');
      
      // Show completion screen instead of auto-redirect
      setSubmissionComplete(true);
    } catch (error) {
      console.error('Error submitting exam:', error);
      
      // Check if it's a duplicate submission error
      if (error.message && error.message.includes('already submitted')) {
        alert('You have already submitted this exam. Each student can attempt an exam only once.');
        navigate(isAuthenticated ? '/student/dashboard' : '/');
      } else {
        alert('Failed to submit test. Please try again.');
        setIsSubmitting(false);
        setExamFinished(false);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentSectionData = () => {
    if (!examData) return null;
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return null;
    // Find which section this question belongs to
    for (const section of examData.sections) {
      if (section.questions.some((q) => q.index === currentQuestionIndex)) {
        return section;
      }
    }
    return null;
  };

  // Helper function to render prompt with inline input for blanks
  const renderPromptWithInlineInput = (prompt, questionNum) => {
    // Check if prompt contains blank markers (_____)
    const blankPattern = /_{3,}/g;
    const parts = prompt.split(blankPattern);
    
    if (parts.length === 1) {
      // No blanks found, return plain text with input below
      return (
        <>
          <p className="text-gray-700 mb-2">{prompt}</p>
          <input
            type="text"
            value={answers[questionNum] || ''}
            onChange={(e) => handleAnswerChange(questionNum, e.target.value)}
            onFocus={() => setCurrentQuestionIndex(questionNum)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your answer"
          />
        </>
      );
    }
    
    // Blanks found, render inline
    return (
      <div className="text-gray-700 flex flex-wrap items-center gap-1">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <span>{part}</span>
            {index < parts.length - 1 && (
              <input
                type="text"
                value={answers[questionNum] || ''}
                onChange={(e) => handleAnswerChange(questionNum, e.target.value)}
                onFocus={() => setCurrentQuestionIndex(questionNum)}
                className="inline-block min-w-[120px] max-w-[200px] px-2 py-1 border-b-2 border-gray-400 focus:outline-none focus:border-blue-500 bg-transparent"
                placeholder=""
                style={{ width: `${Math.max(120, (answers[questionNum]?.length || 0) * 10 + 40)}px` }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderQuestion = (question) => {
    const questionNum = question.index;

    switch (question.type) {
      case 'short_answer':
        return (
          <div key={question.id} className="mb-4" onClick={() => setCurrentQuestionIndex(questionNum)}>
            <div className="flex items-start gap-2">
              <span className="font-semibold min-w-[3rem]">{questionNum}.</span>
              <div className="flex-1">
                {renderPromptWithInlineInput(question.payload.prompt, questionNum)}
                {question.payload.max_words && (
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum {question.payload.max_words} word(s)
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 'multiple_choice':
        return (
          <div key={question.id} className="mb-6" onClick={() => setCurrentQuestionIndex(questionNum)}>
            <div className="flex items-start gap-2">
              <span className="font-semibold min-w-[3rem]">{questionNum}.</span>
              <div className="flex-1">
                <p className="text-gray-700 mb-3">{question.payload.prompt}</p>
                <div className="space-y-2">
                  {question.payload.options.map((option, idx) => {
                    const optionLabel = String.fromCharCode(65 + idx); // A, B, C, D
                    return (
                      <label key={idx} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="radio"
                          name={`question_${questionNum}`}
                          value={optionLabel}
                          checked={answers[questionNum] === optionLabel}
                          onChange={(e) => handleAnswerChange(questionNum, e.target.value)}
                          onFocus={() => setCurrentQuestionIndex(questionNum)}
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
        );

      case 'map_labeling':
        return (
          <div key={question.id} className="mb-4" onClick={() => setCurrentQuestionIndex(questionNum)}>
            <div className="flex items-start gap-2">
              <span className="font-semibold min-w-[3rem]">{questionNum}.</span>
              <div className="flex-1">
                <p className="text-gray-700 mb-2">{question.payload.prompt}</p>
                <select
                  value={answers[questionNum] || ''}
                  onChange={(e) => handleAnswerChange(questionNum, e.target.value)}
                  onFocus={() => setCurrentQuestionIndex(questionNum)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">---</option>
                  {question.payload.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 'diagram_labeling':
        return (
          <div key={question.id} className="mb-4" onClick={() => setCurrentQuestionIndex(questionNum)}>
            <div className="flex items-start gap-2">
              <span className="font-semibold min-w-[3rem]">{questionNum}.</span>
              <div className="flex-1">
                {renderPromptWithInlineInput(question.payload.prompt, questionNum)}
                {question.payload.max_words && (
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum {question.payload.max_words} word(s)
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div key={question.id} className="mb-4">
            <p className="text-gray-500">Question type not supported: {question.type}</p>
          </div>
        );
    }
  };

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

  if (!examData) {
    return (
      <div className="flex justify-center items-center h-screen bg-blue-50">
        <p className="text-gray-600">Unable to load test data</p>
      </div>
    );
  }

  const sectionData = getCurrentSectionData();
  const allQuestions = getAllQuestions();
  const totalQuestions = allQuestions.length;
  const answeredCount = Object.keys(answers).filter(key => answers[key] !== undefined && answers[key] !== '').length;

  // Get current section based on currentQuestionIndex
  const currentSectionIndex = sectionData ? sectionData.index : 1;
  
  // Calculate which questions to show in current group for navigation bar (10 questions per group)
  const startQuestionIndex = currentQuestionGroup * 10 + 1;
  const endQuestionIndex = Math.min((currentQuestionGroup + 1) * 10, totalQuestions);
  const totalGroups = Math.ceil(totalQuestions / 10);

  // Show completion screen if submission is complete
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
              Your test has been submitted successfully. Thank you for taking the IELTS Listening Test.
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
                {formatTime(timeRemaining)} left | Part {currentSectionIndex}
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

      {/* Main Content - Add padding-top to account for fixed header */}
      <main className={`flex-1 p-6 pb-44 ${isHeaderHidden ? 'pt-20' : 'pt-36'}`}>
        <div className="max-w-5xl mx-auto">
          <div id="highlightable-content">
            <div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  SECTION {currentSectionIndex} — Questions {sectionData.questions[0]?.index}-{sectionData.questions[sectionData.questions.length - 1]?.index}
                </h2>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{answeredCount} / {totalQuestions}</span> answered
                </div>
              </div>

              {/* Show image for map labeling section */}
              {currentSectionIndex === 2 && sectionData.questions[0]?.payload?.image_url && (
                <div className="mb-6 bg-gray-50 p-4 rounded border border-gray-300">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Label the map below. Choose the correct letter, A–I:
                  </p>
                  <img
                    src={sectionData.questions[0].payload.image_url}
                    alt="Ferry Map"
                    className="max-w-full h-auto mx-auto border-2 border-gray-300 rounded"
                  />
                </div>
              )}

              {/* Show image for diagram labeling section */}
              {currentSectionIndex === 4 && sectionData.questions[0]?.payload?.image_url && (
                <div className="mb-6 bg-gray-50 p-4 rounded border border-gray-300">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Complete the notes on the diagram below. Write ONE WORD ONLY for each answer:
                  </p>
                  <img
                    src={sectionData.questions[0].payload.image_url}
                    alt="Fission Reactor Diagram"
                    className="max-w-full h-auto mx-auto border-2 border-gray-300 rounded"
                  />
                </div>
              )}

              {/* Section Instructions */}
              {currentSectionIndex === 1 && (
                <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-gray-700">
                    <strong>Complete the notes below.</strong><br />
                    Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.
                  </p>
                </div>
              )}

              {currentSectionIndex === 3 && (
                <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-gray-700">
                    Questions 21-25: <strong>Choose the correct answer.</strong><br />
                    Questions 26-28: Write <strong>ONE WORD ONLY</strong> for each answer.<br />
                    Questions 29-30: <strong>Choose the correct answer.</strong>
                  </p>
                </div>
              )}

              {/* All Questions in Current Section */}
              <div className="space-y-2">
                {sectionData.questions.map((question) => renderQuestion(question))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* QTI-Style Footer Navigation */}
      <footer 
        role="navigation" 
        className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 shadow-lg"
        style={{ height: '140px' }}
      >
        <h1 className="reader-only">Navigation</h1>
        
        {/* Navigation Bar Container */}
        <div className="relative h-full">
          {/* Review Checkbox */}
          <div id="review-checkbox">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reviewMarked.has(currentQuestionIndex)}
                onChange={() => toggleReviewMark(currentQuestionIndex)}
                className="cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700">Review</span>
            </label>
          </div>

          {/* Main Navigation Bar - Organized by Sections */}
          <div id="navigation-bar">
            {/* Section Navigation Controls */}
            <div className="section-navigation">
              <button
                data-function="previous-section"
                disabled={currentSectionIndex <= 1}
                onClick={() => {
                  const targetSection = Math.max(1, currentSectionIndex - 1);
                  // Find first question in target section
                  const targetQuestion = allQuestions.find(q => {
                    const qSection = examData.sections.find(s => s.questions.some(sq => sq.index === q.index));
                    return qSection?.index === targetSection;
                  });
                  if (targetQuestion) navigateToQuestion(targetQuestion.index);
                }}
                title="Previous Section"
                aria-label="Previous Section"
              >
                <span className="reader-only">Previous Section</span>
              </button>
              
              <span className="current-section">
                Section {currentSectionIndex} of {examData?.sections.length || 4}
              </span>
              
              <button
                data-function="next-section"
                disabled={currentSectionIndex >= (examData?.sections.length || 4)}
                onClick={() => {
                  const targetSection = Math.min(examData?.sections.length || 4, currentSectionIndex + 1);
                  // Find first question in target section
                  const targetQuestion = allQuestions.find(q => {
                    const qSection = examData.sections.find(s => s.questions.some(sq => sq.index === q.index));
                    return qSection?.index === targetSection;
                  });
                  if (targetQuestion) navigateToQuestion(targetQuestion.index);
                }}
                title="Next Section"
                aria-label="Next Section"
              >
                <span className="reader-only">Next Section</span>
              </button>
            </div>

            <div data-class="testPart" data-identifier="IELTS_LISTENING_TEST">
              <ul>
                {examData?.sections.map((section) => (
                  <li 
                    key={section.id}
                    data-class="assessmentSection" 
                    data-identifier={`Section${section.index}`}
                  >
                    <span className="section-label">Section {section.index}</span>
                    <ul>
                      {section.questions.map((question) => {
                        const isAnswered = answers[question.index] !== undefined && answers[question.index] !== '';
                        const isCurrent = currentQuestionIndex === question.index;
                        const isMarkedForReview = reviewMarked.has(question.index);
                        
                        let dataState = '';
                        if (isCurrent) dataState += 'current ';
                        if (isAnswered) dataState += 'completed ';
                        if (isMarkedForReview) dataState += 'marked-for-review';
                        
                        return (
                          <li 
                            key={question.id}
                            data-class="assessmentItemRef" 
                            data-identifier={`question-${question.index}`}
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
                              data-state={dataState.trim()}
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
          </div>

          {/* Previous Button */}
          <button
            data-function="previous"
            disabled={currentQuestionIndex <= 1}
            onClick={() => navigateToQuestion(Math.max(1, currentQuestionIndex - 1))}
            title="Previous Question"
            aria-label="Previous Question"
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
            aria-label={currentQuestionIndex >= totalQuestions ? "Submit Test" : "Next Question"}
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