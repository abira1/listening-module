import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackendService } from '../services/BackendService';
import { Clock, Volume2, ChevronLeft, ChevronRight } from 'lucide-react';

export function ListeningTest({ examId, audioRef }) {
  const navigate = useNavigate();
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
    if (currentQuestionIndex === questionIndex) {
      return 'bg-blue-600 text-white'; // Blue - current question
    } else if (answers[questionIndex] !== undefined && answers[questionIndex] !== '') {
      return 'bg-gray-800 text-white'; // Black - answered
    } else {
      return 'bg-white text-gray-700 border border-gray-300'; // White - unanswered
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
      // Create submission in database
      const submissionData = {
        exam_id: examId,
        user_id_or_session: `user_${Date.now()}`,
        answers: answers,
        started_at: new Date().toISOString(),
        finished_at: new Date().toISOString(),
        progress_percent: 100,
      };

      await BackendService.createSubmission(submissionData);
      
      // Show completion message
      alert('Test submitted successfully! Your answers have been saved.');
      navigate('/');
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Test completed! (Submission feature will be implemented soon)');
      navigate('/');
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

  const renderQuestion = (question) => {
    const questionNum = question.index;

    switch (question.type) {
      case 'short_answer':
        return (
          <div key={question.id} className="mb-4">
            <div className="flex items-start gap-2">
              <span className="font-semibold min-w-[3rem]">{questionNum}.</span>
              <div className="flex-1">
                <p className="text-gray-700 mb-2">{question.payload.prompt}</p>
                <input
                  type="text"
                  value={answers[questionNum] || ''}
                  onChange={(e) => handleAnswerChange(questionNum, e.target.value)}
                  className="w-full max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your answer"
                />
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
          <div key={question.id} className="mb-6">
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
          <div key={question.id} className="mb-4">
            <div className="flex items-start gap-2">
              <span className="font-semibold min-w-[3rem]">{questionNum}.</span>
              <div className="flex-1">
                <p className="text-gray-700 mb-2">{question.payload.prompt}</p>
                <select
                  value={answers[questionNum] || ''}
                  onChange={(e) => handleAnswerChange(questionNum, e.target.value)}
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
          <div key={question.id} className="mb-4">
            <div className="flex items-start gap-2">
              <span className="font-semibold min-w-[3rem]">{questionNum}.</span>
              <div className="flex-1">
                <p className="text-gray-700 mb-2">{question.payload.prompt}</p>
                <input
                  type="text"
                  value={answers[questionNum] || ''}
                  onChange={(e) => handleAnswerChange(questionNum, e.target.value)}
                  className="w-full max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your answer"
                />
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
  const currentQuestion = getCurrentQuestion();
  const allQuestions = getAllQuestions();
  const totalQuestions = allQuestions.length;
  const answeredCount = Object.keys(answers).filter(key => answers[key] !== undefined && answers[key] !== '').length;

  // Calculate which questions to show in current group (10 questions per group)
  const startQuestionIndex = currentQuestionGroup * 10 + 1;
  const endQuestionIndex = Math.min((currentQuestionGroup + 1) * 10, totalQuestions);
  const totalGroups = Math.ceil(totalQuestions / 10);

  return (
    <div className="flex flex-col min-h-screen w-full bg-blue-50">
      {/* Header */}
      <div className="bg-white w-full p-3 flex justify-between items-center border-b-2 border-gray-300 shadow-sm">
        <div className="flex items-center gap-4">
          <img src="https://i.postimg.cc/FKx07M5m/ILTES.png" alt="IELTS Logo" className="h-8" />
          <div className="text-sm text-gray-600">
            <span className="font-semibold">{examData.exam.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-gray-700">
            <Volume2 className={`w-5 h-5 ${audioEnded ? 'text-gray-400' : 'text-green-600'}`} />
            <span className="text-sm">
              {audioEnded ? 'Audio ended - Review time' : 'Audio playing'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-5 h-5" />
            <span className={`text-lg font-bold ${timeRemaining < 120 ? 'text-red-600' : ''}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <img src="https://i.postimg.cc/0Q2DmVPS/Biritsh-Council.png" alt="British Council" className="h-6" />
            <img src="https://i.postimg.cc/9f2GXWkJ/IDB.png" alt="IDP" className="h-6" />
            <img src="https://i.postimg.cc/TYZVSjJ8/Cambridge-University.png" alt="Cambridge" className="h-6" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 pb-32">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Question {currentQuestionIndex} of {totalQuestions}
              </h2>
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{answeredCount} / {totalQuestions}</span> answered
              </div>
            </div>

            {/* Show image for map labeling questions */}
            {currentQuestion?.type === 'map_labeling' && currentQuestion?.payload?.image_url && (
              <div className="mb-6 bg-gray-50 p-4 rounded border border-gray-300">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Label the map below. Choose the correct letter, A–I:
                </p>
                <img
                  src={currentQuestion.payload.image_url}
                  alt="Ferry Map"
                  className="max-w-full h-auto mx-auto border-2 border-gray-300 rounded"
                />
              </div>
            )}

            {/* Show image for diagram labeling questions */}
            {currentQuestion?.type === 'diagram_labeling' && currentQuestion?.payload?.image_url && (
              <div className="mb-6 bg-gray-50 p-4 rounded border border-gray-300">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Complete the notes on the diagram below. Write ONE WORD ONLY for each answer:
                </p>
                <img
                  src={currentQuestion.payload.image_url}
                  alt="Fission Reactor Diagram"
                  className="max-w-full h-auto mx-auto border-2 border-gray-300 rounded"
                />
              </div>
            )}

            {/* Section Instructions based on question type */}
            {currentQuestion?.type === 'short_answer' && currentQuestionIndex <= 10 && (
              <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-gray-700">
                  <strong>Complete the notes below.</strong><br />
                  Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.
                </p>
              </div>
            )}

            {currentQuestionIndex >= 21 && currentQuestionIndex <= 30 && (
              <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-gray-700">
                  Questions 21-25: <strong>Choose the correct answer.</strong><br />
                  Questions 26-28: Write <strong>ONE WORD ONLY</strong> for each answer.<br />
                  Questions 29-30: <strong>Choose the correct answer.</strong>
                </p>
              </div>
            )}

            {/* Current Question */}
            <div className="space-y-2">
              {currentQuestion && renderQuestion(currentQuestion)}
            </div>

            {/* Review Checkbox */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reviewMarked.has(currentQuestionIndex)}
                  onChange={() => toggleReviewMark(currentQuestionIndex)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 font-medium">
                  Mark for review
                </span>
              </label>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 py-3 px-6 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              Section {currentSection} of {totalSections}
            </span>
            <div className="flex gap-2">
              {examData.sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section.index)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    currentSection === section.index
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {section.index}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentSection(Math.max(1, currentSection - 1))}
              disabled={currentSection === 1}
              className="bg-gray-200 border border-gray-400 rounded px-6 py-2 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Previous
            </button>
            {currentSection < totalSections ? (
              <button
                onClick={() => setCurrentSection(Math.min(totalSections, currentSection + 1))}
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
      </footer>
    </div>
  );
}