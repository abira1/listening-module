import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackendService } from '../services/BackendService';
import FirebaseAuthService from '../services/FirebaseAuthService';
import { useAuth } from '../contexts/AuthContext';
import { Clock, User, HelpCircle, EyeOff } from 'lucide-react';
import HighlightManager from '../lib/HighlightManager';
import '../styles/navigation.css';

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
  const [reviewMarked, setReviewMarked] = useState(new Set());
  const [isNavMaximised, setIsNavMaximised] = useState(true); // Navigation view state
  const timerRef = useRef(null);
  const highlightManagerRef = useRef(null);

  // Get all questions (both tasks)
  const allQuestions = examData?.sections?.flatMap(section => section.questions) || [];
  const currentQuestion = allQuestions[currentTaskIndex];

  // Initialize HighlightManager for task prompt highlighting
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

  const toggleReviewMark = (taskIndex) => {
    setReviewMarked((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskIndex)) {
        newSet.delete(taskIndex);
      } else {
        newSet.add(taskIndex);
      }
      return newSet;
    });
  };

  const navigateToTask = (taskIndex) => {
    setCurrentTaskIndex(taskIndex);
  };

  const handlePreviousTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1);
    }
  };

  const handleNextTask = () => {
    if (currentTaskIndex < allQuestions.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    }
  };

  const toggleHeaderVisibility = () => {
    setIsHeaderHidden(!isHeaderHidden);
  };

  // Toggle navigation view
  const toggleNavView = () => {
    setIsNavMaximised(!isNavMaximised);
  };

  const showTooltip = (event, taskNumber) => {
    // Remove any existing tooltip
    hideTooltip();
    
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.id = 'pageIdentifier';
    tooltip.style.display = 'block';
    
    // Determine status
    const isAnswered = answers[taskNumber] !== undefined && answers[taskNumber] !== '';
    const isCurrent = currentTaskIndex === (taskNumber - 1);
    const isMarkedForReview = reviewMarked.has(taskNumber);
    
    let status = 'Not Started';
    let statusClass = 'status-unanswered';
    
    if (isCurrent) {
      status = 'Current Task';
      statusClass = 'status-current';
    } else if (isMarkedForReview) {
      status = 'Marked for Review';
      statusClass = 'status-review';
    } else if (isAnswered) {
      status = 'Completed';
      statusClass = 'status-completed';
    }
    
    // Create content
    const taskP = document.createElement('p');
    taskP.textContent = `Task ${taskNumber}`;
    tooltip.appendChild(taskP);
    
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
      {/* Fixed Header - Two-section design */}
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
              ID: STU-{user?.uid?.substring(0, 8) || 'XXXXXX'}
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
                {formatTime(timeRemaining)} left | Task {currentTaskIndex + 1}
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

      {/* Main Content - Horizontal Split Layout */}
      <main className="flex-1 flex pb-32" style={{ paddingTop: isHeaderHidden ? '80px' : '136px' }} id="highlightable-content">
        {/* Left Side: Task Prompt - 40% width */}
        <div className="w-[40%] bg-white border-r-2 border-gray-300 overflow-y-auto">
          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Writing Task {currentQuestion?.payload?.task_number}
              </h1>
              <div className="text-sm text-gray-600 italic">
                {currentQuestion?.payload?.instructions}
              </div>
            </div>

            {/* Task Prompt */}
            <div className="mb-6 p-5 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {currentQuestion?.payload?.prompt}
              </div>
            </div>

            {/* Chart Image (only for Task 1) */}
            {currentQuestion?.payload?.chart_image && (
              <div className="mb-6 flex justify-center">
                <img 
                  src={currentQuestion.payload.chart_image} 
                  alt="Chart for Writing Task" 
                  className="max-w-full h-auto rounded-lg shadow-lg border border-gray-200"
                  style={{ maxHeight: '600px' }}
                />
              </div>
            )}

            {/* Minimum Word Count Notice */}
            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> Write at least <strong className="text-yellow-700">{minWords} words</strong> for this task.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Writing Area - 50% width */}
        <div className="w-[50%] bg-gray-50 overflow-y-auto">
          <div className="p-8">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Your Response</h2>
            </div>

            {/* Writing Area */}
            <textarea
              value={answers[currentQuestion?.index] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion?.index, e.target.value)}
              className="w-full h-[calc(100vh-350px)] p-6 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-sans text-base leading-relaxed resize-none bg-white shadow-inner"
              placeholder="Start writing your answer here..."
              disabled={examFinished}
              style={{ minHeight: '500px' }}
            />

            {/* Word Counter - Below Textarea */}
            <div className={`mt-3 text-base font-semibold ${isWordCountSufficient ? 'text-green-600' : 'text-orange-600'}`}>
              Word count: {currentWordCount} / {minWords}
            </div>

            {/* Submit Button for Task 2 */}
            {currentTaskIndex === allQuestions.length - 1 && (
              <div className="mt-6">
                <button
                  onClick={handleSubmitExam}
                  disabled={isSubmitting}
                  className="w-full px-8 py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 shadow-lg"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Test'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* QTI-Style Footer Navigation with 2 Task Buttons */}
      <footer 
        role="navigation" 
        className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 shadow-lg"
        style={{ height: '100px' }}
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
                checked={reviewMarked.has(currentQuestion?.index)}
                onChange={() => toggleReviewMark(currentQuestion?.index)}
                aria-label="Mark current task for review"
              />
              Review
            </label>
          </div>

          {/* Task Navigation Buttons - QTI Style with View Toggle */}
          <div id="navigation-bar" className={isNavMaximised ? 'maximised' : 'minimised'}>
            <div connect-class="testPart" connect-identifier="IELTS_WRITING_TEST">
              <ul>
                {allQuestions.map((question, idx) => {
                  const taskNumber = question.payload?.task_number;
                  const isAnswered = answers[question.index] !== undefined && answers[question.index] !== '';
                  const isCurrent = currentTaskIndex === idx;
                  const isMarkedForReview = reviewMarked.has(question.index);
                  
                  let connectState = '';
                  if (isCurrent) connectState += 'current ';
                  if (isAnswered) connectState += 'completed ';
                  if (isMarkedForReview) connectState += 'marked-for-review';

                  return (
                    <li 
                      key={question.id}
                      connect-class="assessmentItemRef" 
                      connect-identifier={`IELTS-TASK${taskNumber}`}
                    >
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToTask(idx);
                        }}
                        onMouseEnter={(e) => showTooltip(e, taskNumber)}
                        onMouseLeave={hideTooltip}
                        onFocus={(e) => showTooltip(e, taskNumber)}
                        onBlur={hideTooltip}
                        connect-state={connectState.trim()}
                        title={`Task ${taskNumber}`}
                      >
                        <span className="question-label">Task </span>
                        <span className="question-number">{taskNumber}</span>
                      </a>
                    </li>
                  );
                })}
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

          {/* Previous/Next Navigation Buttons */}
          <button
            data-function="previous"
            onClick={handlePreviousTask}
            disabled={currentTaskIndex === 0}
            aria-label="Previous Task"
            title="Previous Task"
          />
          
          <button
            data-function="next"
            onClick={handleNextTask}
            disabled={currentTaskIndex === allQuestions.length - 1}
            aria-label="Next Task"
            title="Next Task"
          />
        </div>
      </footer>
    </div>
  );
}
