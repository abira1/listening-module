import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Send,
  Lock,
  Unlock,
  Calendar,
  Users,
  FileText,
  Clock,
  User,
  CheckCircle,
  XCircle
} from 'lucide-react';
import FirebaseAuthService from '../../services/FirebaseAuthService';
import { BackendService } from '../../services/BackendService';

export function SubmissionManagement() {
  // Navigation state
  const [view, setView] = useState('tests'); // 'tests', 'students', 'review'
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Data state
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive scoring state
  const [questionMarks, setQuestionMarks] = useState({}); // { questionIndex: 'correct' | 'incorrect' }
  const [calculatedScore, setCalculatedScore] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      
      // Get all submissions
      const allSubmissions = await FirebaseAuthService.getAllSubmissions();
      
      // Get all exams
      const allExams = await BackendService.getPublishedExams();
      const examsMap = {};
      allExams.forEach(exam => {
        examsMap[exam.id] = exam;
      });

      // Group submissions by exam
      const testsMap = {};
      allSubmissions.forEach(submission => {
        if (!testsMap[submission.examId]) {
          testsMap[submission.examId] = {
            examId: submission.examId,
            examTitle: examsMap[submission.examId]?.title || 'Unknown Exam',
            examDuration: examsMap[submission.examId]?.duration || 0,
            participants: [],
            submissionCount: 0,
            latestSubmission: submission.createdAt
          };
        }
        testsMap[submission.examId].participants.push(submission);
        testsMap[submission.examId].submissionCount++;
        
        // Track latest submission
        if (new Date(submission.createdAt) > new Date(testsMap[submission.examId].latestSubmission)) {
          testsMap[submission.examId].latestSubmission = submission.createdAt;
        }
      });

      const testsArray = Object.values(testsMap).sort((a, b) => 
        new Date(b.latestSubmission) - new Date(a.latestSubmission)
      );

      setTests(testsArray);
      setLoading(false);
    } catch (error) {
      console.error('Error loading tests:', error);
      setLoading(false);
    }
  };

  const handleTestClick = async (test) => {
    try {
      setLoading(true);
      setSelectedTest(test);
      
      // Get all students
      const allStudents = await FirebaseAuthService.getAllStudents();
      const studentsMap = {};
      allStudents.forEach(student => {
        studentsMap[student.uid] = student;
      });

      // Prepare student list with submission data
      const studentList = test.participants.map(submission => ({
        uid: submission.studentUid,
        name: studentsMap[submission.studentUid]?.name || 'Unknown',
        email: studentsMap[submission.studentUid]?.email || 'N/A',
        photoURL: studentsMap[submission.studentUid]?.photoURL || 'https://via.placeholder.com/40',
        submissionId: submission.id,
        submittedAt: submission.createdAt,
        score: submission.score,
        totalQuestions: submission.totalQuestions,
        isPublished: submission.isPublished || false,
        manuallyGraded: submission.manuallyGraded || false
      }));

      setStudents(studentList);
      setView('students');
      setLoading(false);
    } catch (error) {
      console.error('Error loading students:', error);
      setLoading(false);
    }
  };

  const handleStudentClick = async (student) => {
    try {
      setLoading(true);
      setSelectedStudent(student);
      
      // Get Firebase submission
      const firebaseSubmission = await FirebaseAuthService.getSubmission(student.submissionId);
      
      if (!firebaseSubmission) {
        alert('Submission not found');
        setLoading(false);
        return;
      }
      
      // Get full exam data with sections and questions from backend
      const fullExamData = await BackendService.getExamWithSectionsAndQuestions(firebaseSubmission.examId);
      
      if (!fullExamData || !fullExamData.exam) {
        alert('Exam data not found');
        setLoading(false);
        return;
      }
      
      // Build detailed structure with student answers
      const detailedSections = fullExamData.sections.map(section => ({
        ...section,
        questions: section.questions.map(question => ({
          ...question,
          student_answer: firebaseSubmission.answers?.[question.index] || '',
          correct_answer: question.payload?.answer_key || ''
        }))
      }));
      
      setSubmissionDetails({
        submission: {
          id: firebaseSubmission.id,
          exam_id: firebaseSubmission.examId,
          student_uid: firebaseSubmission.studentUid,
          score: firebaseSubmission.score,
          total_questions: firebaseSubmission.totalQuestions,
          created_at: firebaseSubmission.createdAt
        },
        exam: {
          id: fullExamData.exam.id,
          title: fullExamData.exam.title,
          duration: fullExamData.exam.duration_seconds
        },
        sections: detailedSections,
        firebaseData: firebaseSubmission
      });
      
      // Load existing marks if result was already published
      const existingMarks = firebaseSubmission.questionMarks || {};
      setQuestionMarks(existingMarks);
      
      // Calculate score from existing marks
      const correctCount = Object.values(existingMarks).filter(mark => mark === 'correct').length;
      setCalculatedScore(correctCount);
      
      setView('review');
      setLoading(false);
    } catch (error) {
      console.error('Error loading submission details:', error);
      alert('Failed to load submission details: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const handleBackToTests = () => {
    setView('tests');
    setSelectedTest(null);
    setStudents([]);
    setSearchQuery('');
  };

  const handleBackToStudents = () => {
    setView('students');
    setSelectedStudent(null);
    setSubmissionDetails(null);
    setQuestionMarks({});
    setCalculatedScore(0);
  };

  const handleMarkQuestion = (questionIndex, mark) => {
    setQuestionMarks(prev => {
      const newMarks = { ...prev };
      
      // Toggle: if clicking the same mark, unmark it
      if (newMarks[questionIndex] === mark) {
        delete newMarks[questionIndex];
      } else {
        newMarks[questionIndex] = mark;
      }
      
      // Recalculate score
      const correctCount = Object.values(newMarks).filter(m => m === 'correct').length;
      setCalculatedScore(correctCount);
      
      return newMarks;
    });
  };

  const handlePublishResult = async () => {
    if (!window.confirm(`Publish this result with score ${calculatedScore}/${submissionDetails.submission.total_questions}? The student will be able to see their score.`)) {
      return;
    }

    try {
      setIsPublishing(true);
      
      console.log('Publishing result for submission:', selectedStudent.submissionId);
      console.log('Calculated score:', calculatedScore);
      console.log('Question marks:', questionMarks);
      
      // Step 1: Save marks and calculated score to Firebase
      console.log('Step 1: Updating submission with marks...');
      await FirebaseAuthService.updateSubmissionWithMarks(
        selectedStudent.submissionId,
        calculatedScore,
        questionMarks
      );
      console.log('Step 1: Success - Marks saved to Firebase');
      
      // Step 2: Publish to Firebase
      console.log('Step 2: Publishing to Firebase...');
      await FirebaseAuthService.publishSubmission(selectedStudent.submissionId);
      console.log('Step 2: Success - Published to Firebase');
      
      // Step 3: Publish to backend (if it fails, continue anyway)
      try {
        console.log('Step 3: Publishing to backend...');
        await BackendService.publishSingleSubmission(selectedStudent.submissionId);
        console.log('Step 3: Success - Published to backend');
      } catch (backendError) {
        console.warn('Backend publish failed (non-critical):', backendError);
        // Continue anyway as Firebase is the primary database
      }
      
      // Show success message
      alert('✅ Result published successfully! The student can now view their score.');
      
      // Wait 2 seconds then redirect to student list
      setTimeout(() => {
        handleBackToStudents();
        setIsPublishing(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error publishing result:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      alert(`Failed to publish result: ${error.message || 'Unknown error'}. Please check console for details.`);
      setIsPublishing(false);
    }
  };

  const getFilteredTests = () => {
    if (!searchQuery) return tests;
    
    const query = searchQuery.toLowerCase();
    return tests.filter(test => 
      test.examTitle.toLowerCase().includes(query)
    );
  };

  const getFilteredStudents = () => {
    if (!searchQuery) return students;
    
    const query = searchQuery.toLowerCase();
    return students.filter(student => 
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // LEVEL 1: Tests List View
  if (view === 'tests') {
    const filteredTests = getFilteredTests();

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Test Submissions</h1>
            <p className="text-gray-600 mt-1">Review and manage completed tests</p>
          </div>
          <button
            onClick={loadTests}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTests.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              {tests.length === 0 ? 'No test submissions yet' : 'No tests match your search'}
            </div>
          ) : (
            filteredTests.map((test) => (
              <div
                key={test.examId}
                onClick={() => handleTestClick(test)}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {test.examTitle}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Clock className="w-4 h-4 mr-2" />
                      {Math.floor(test.examDuration / 60)} minutes
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(test.latestSubmission).toLocaleDateString()}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-blue-600">
                      <Users className="w-5 h-5 mr-2" />
                      <span className="font-semibold text-lg">{test.submissionCount}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {test.submissionCount === 1 ? 'participant' : 'participants'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // LEVEL 2: Students List View
  if (view === 'students') {
    const filteredStudents = getFilteredStudents();

    return (
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToTests}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Tests
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{selectedTest?.examTitle}</h1>
            <p className="text-gray-600 mt-1">{students.length} student{students.length !== 1 ? 's' : ''} completed this test</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Result Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    {students.length === 0 ? 'No students yet' : 'No students match your search'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr 
                    key={student.submissionId} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleStudentClick(student)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={student.photoURL}
                          alt={student.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{student.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(student.submittedAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(student.submittedAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {student.isPublished ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Unlock className="w-3 h-3" />
                          Result Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Lock className="w-3 h-3" />
                          Pending Review
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="w-5 h-5 text-gray-400 inline-block" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // LEVEL 3: Detailed Answer Review
  if (view === 'review' && submissionDetails) {
    return (
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToStudents}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Students
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Answer Review</h1>
            <p className="text-gray-600 mt-1">{selectedStudent?.name} - {selectedTest?.examTitle}</p>
          </div>
        </div>

        {/* Student Info Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={selectedStudent?.photoURL}
                alt={selectedStudent?.name}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedStudent?.name}</h2>
                <p className="text-gray-600">{selectedStudent?.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Submitted on {new Date(selectedStudent?.submittedAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-4">
                {/* Score Display - Auto-calculated */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Current Score</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-blue-600">
                      {calculatedScore}/{submissionDetails.submission.total_questions}
                    </p>
                    <div className="text-xs text-gray-500">
                      ({Math.round((calculatedScore / submissionDetails.submission.total_questions) * 100)}%)
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Auto-calculated from marks</p>
                </div>

                {/* Publish Button */}
                {!submissionDetails.firebaseData?.isPublished && (
                  <button
                    onClick={handlePublishResult}
                    disabled={isPublishing}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                    {isPublishing ? 'Publishing...' : 'Publish Result'}
                  </button>
                )}
                
                {submissionDetails.firebaseData?.isPublished && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                    Published
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Answer Review */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <h3 className="text-lg font-semibold text-gray-900">Interactive Answer Review</h3>
            <p className="text-sm text-gray-600 mt-1">Mark each answer as correct (✔) or incorrect (✖). Score updates automatically.</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {submissionDetails.sections.map((section) => (
              <div key={section.id} className="p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  {section.title}
                </h4>
                <div className="space-y-3">
                  {section.questions.map((question) => {
                    const mark = questionMarks[question.index];
                    const isCorrect = mark === 'correct';
                    const isIncorrect = mark === 'incorrect';
                    const isUnmarked = !mark;
                    
                    return (
                      <div 
                        key={question.id} 
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                          isCorrect ? 'bg-green-50 border-green-300' : 
                          isIncorrect ? 'bg-red-50 border-red-300' : 
                          'bg-gray-50 border-gray-200'
                        }`}
                      >
                        {/* Question Number */}
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                            isCorrect ? 'bg-green-600 text-white' :
                            isIncorrect ? 'bg-red-600 text-white' :
                            'bg-gray-400 text-white'
                          }`}>
                            {question.index}
                          </div>
                        </div>
                        
                        {/* Student Answer */}
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-600 mb-1">Student's Answer:</p>
                          <div className="bg-white border border-gray-300 rounded-lg px-4 py-2">
                            <p className={`font-medium ${
                              isCorrect ? 'text-green-900' :
                              isIncorrect ? 'text-red-900' :
                              'text-gray-900'
                            }`}>
                              {question.student_answer || <span className="text-gray-400 italic">No answer provided</span>}
                            </p>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleMarkQuestion(question.index, 'correct')}
                            disabled={submissionDetails.firebaseData?.isPublished}
                            className={`p-3 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                              isCorrect 
                                ? 'bg-green-600 border-green-600 text-white scale-110 shadow-lg' 
                                : 'bg-white border-green-300 text-green-600 hover:bg-green-50 hover:scale-105'
                            }`}
                            title="Mark as correct (+1 point)"
                          >
                            <CheckCircle className="w-6 h-6" />
                          </button>
                          <button
                            onClick={() => handleMarkQuestion(question.index, 'incorrect')}
                            disabled={submissionDetails.firebaseData?.isPublished}
                            className={`p-3 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                              isIncorrect 
                                ? 'bg-red-600 border-red-600 text-white scale-110 shadow-lg' 
                                : 'bg-white border-red-300 text-red-600 hover:bg-red-50 hover:scale-105'
                            }`}
                            title="Mark as incorrect (0 points)"
                          >
                            <XCircle className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Marking Instructions */}
        {!submissionDetails.firebaseData?.isPublished && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  <span className="text-lg">ℹ️</span>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">How to use:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Click the <CheckCircle className="w-4 h-4 inline text-green-600" /> button to mark an answer as correct (+1 point)</li>
                  <li>• Click the <XCircle className="w-4 h-4 inline text-red-600" /> button to mark an answer as incorrect (0 points)</li>
                  <li>• The score updates automatically as you mark each answer</li>
                  <li>• Click "Publish Result" when you're done to make the score visible to the student</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}