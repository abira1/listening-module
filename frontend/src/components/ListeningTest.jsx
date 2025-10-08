import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackendService } from '../services/BackendService';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Volume2, ChevronLeft, ChevronRight, HelpCircle, EyeOff, User } from 'lucide-react';

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
  const timerRef = useRef(null);
  const audioEndTimeRef = useRef(null);

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
      // Create submission in database
      const submissionData = {
        exam_id: examId,
        user_id_or_session: isAuthenticated && user ? user.id : `anonymous_${Date.now()}`,
        answers: answers,
        started_at: new Date().toISOString(),
        finished_at: new Date().toISOString(),
        progress_percent: 100,
      };

      const submission = await BackendService.createSubmission(submissionData);
      
      // Show completion message with score
      if (submission && submission.score !== undefined) {
        alert(`Test submitted successfully!\n\nYour Score: ${submission.score}/${submission.total_questions}\nPercentage: ${Math.round((submission.score/submission.total_questions)*100)}%`);
      } else {
        alert('Test submitted successfully! Your answers have been saved.');
      }
      
      // Redirect based on authentication
      if (isAuthenticated && user) {
        navigate('/student/dashboard');
      } else {
        navigate('/');
      }
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

  return (
    <div className="flex flex-col min-h-screen w-full bg-blue-50">
      {/* Header - Two-section design */}
      <header className="bg-white w-full shadow-sm">
        {/* Top Section - Logos */}
        <div className="w-full p-4 flex justify-between items-center">
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
        
        {/* Bottom Section - Info Bar */}
        <div className="w-full bg-gray-700 px-6 py-3 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <span className="text-sm font-medium">
              {user?.id ? `STU-${user.id.slice(0, 5).toUpperCase()}` : 'STUDENT'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5" />
            <span className={`text-base font-semibold ${timeRemaining < 120 ? 'text-red-400' : ''}`}>
              {formatTime(timeRemaining)} left | Part {currentSectionIndex}
            </span>
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
              title="Hide timer"
              onClick={() => {/* Timer hide functionality can be added */}}
            >
              <EyeOff className="w-4 h-4" />
              Hide
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 pb-32">
        <div className="max-w-5xl mx-auto">
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
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 shadow-lg">
        {/* Question Number Navigation */}
        <div className="border-b border-gray-200 py-3 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Questions {startQuestionIndex}-{endQuestionIndex}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newGroup = Math.max(0, currentQuestionGroup - 1);
                    setCurrentQuestionGroup(newGroup);
                    navigateToQuestion(newGroup * 10 + 1);
                  }}
                  disabled={currentQuestionGroup === 0}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Previous section"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const newGroup = Math.min(totalGroups - 1, currentQuestionGroup + 1);
                    setCurrentQuestionGroup(newGroup);
                    navigateToQuestion(newGroup * 10 + 1);
                  }}
                  disabled={currentQuestionGroup === totalGroups - 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Next section"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Question Number Buttons */}
            <div className="flex flex-wrap gap-2">
              {allQuestions
                .filter((q) => q.index >= startQuestionIndex && q.index <= endQuestionIndex)
                .map((question) => (
                  <button
                    key={question.id}
                    onClick={() => navigateToQuestion(question.index)}
                    className={`w-10 h-10 rounded font-medium text-sm transition-colors ${getQuestionButtonColor(question.index)} ${
                      reviewMarked.has(question.index) ? 'ring-2 ring-yellow-400' : ''
                    }`}
                    title={
                      reviewMarked.has(question.index)
                        ? `Question ${question.index} - Marked for review`
                        : `Question ${question.index}`
                    }
                  >
                    {question.index}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="py-3 px-6">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{answeredCount}</span> of {totalQuestions} answered
              {reviewMarked.size > 0 && (
                <span className="ml-3 text-yellow-600">
                  • {reviewMarked.size} marked for review
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const prevSection = Math.max(0, currentQuestionGroup - 1);
                  setCurrentQuestionGroup(prevSection);
                  navigateToQuestion(prevSection * 10 + 1);
                }}
                disabled={currentQuestionGroup === 0}
                className="bg-gray-200 border border-gray-400 rounded px-6 py-2 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Previous
              </button>
              {currentQuestionGroup < totalGroups - 1 ? (
                <button
                  onClick={() => {
                    const nextSection = Math.min(totalGroups - 1, currentQuestionGroup + 1);
                    setCurrentQuestionGroup(nextSection);
                    navigateToQuestion(nextSection * 10 + 1);
                  }}
                  className="bg-blue-600 text-white rounded px-6 py-2 hover:bg-blue-700 font-medium"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmitExam}
                  disabled={isSubmitting}
                  className="bg-green-600 text-white rounded px-6 py-2 hover:bg-green-700 font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Test'}
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}