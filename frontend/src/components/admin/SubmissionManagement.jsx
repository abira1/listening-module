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

  // Score editing state
  const [editingScore, setEditingScore] = useState(false);
  const [newScore, setNewScore] = useState(0);

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
      
      // Get exam details from backend to build question structure
      const exam = await BackendService.getExamById(firebaseSubmission.examId);
      
      if (!exam) {
        alert('Exam not found');
        setLoading(false);
        return;
      }
      
      // Get all sections and questions for this exam
      const sections = await BackendService.getExamSections(firebaseSubmission.examId);
      
      // Build detailed structure with student answers
      const detailedSections = [];
      for (const section of sections) {
        const questions = await BackendService.getSectionQuestions(section.id);
        
        // Add student answers to each question
        const questionsWithAnswers = questions.map(question => ({
          ...question,
          student_answer: firebaseSubmission.answers?.[question.index] || '',
          correct_answer: question.payload?.answer_key || ''
        }));
        
        detailedSections.push({
          ...section,
          questions: questionsWithAnswers
        });
      }
      
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
          id: exam.id,
          title: exam.title,
          duration: exam.duration_seconds
        },
        sections: detailedSections,
        firebaseData: firebaseSubmission
      });
      
      setNewScore(firebaseSubmission.score || 0);
      setView('review');
      setLoading(false);
    } catch (error) {
      console.error('Error loading submission details:', error);
      alert('Failed to load submission details. Please try again.');
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
    setEditingScore(false);
  };

  const handleScoreUpdate = async (scoreToUpdate) => {
    try {
      await FirebaseAuthService.updateSubmissionScore(selectedStudent.submissionId, scoreToUpdate);
      alert('Score updated successfully!');
      
      // Refresh submission details
      const detailed = await BackendService.getSubmissionDetailed(selectedStudent.submissionId);
      const firebaseSubmission = await FirebaseAuthService.getSubmission(selectedStudent.submissionId);
      setSubmissionDetails({
        ...detailed,
        firebaseData: firebaseSubmission
      });
      setNewScore(scoreToUpdate);
    } catch (error) {
      console.error('Error updating score:', error);
      alert('Failed to update score. Please try again.');
    }
  };

  const handlePublishResult = async () => {
    if (!window.confirm('Publish this result? The student will be able to see their score.')) {
      return;
    }

    try {
      await FirebaseAuthService.publishSubmission(selectedStudent.submissionId);
      await BackendService.publishSingleSubmission(selectedStudent.submissionId);
      alert('Result published successfully! Student can now view their score.');
      
      // Refresh data
      const firebaseSubmission = await FirebaseAuthService.getSubmission(selectedStudent.submissionId);
      setSubmissionDetails({
        ...submissionDetails,
        firebaseData: firebaseSubmission
      });
    } catch (error) {
      console.error('Error publishing result:', error);
      alert('Failed to publish result. Please try again.');
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
                {/* Score Display/Edit */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Score</p>
                  {editingScore ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={submissionDetails.submission.total_questions}
                        value={newScore}
                        onChange={(e) => setNewScore(parseInt(e.target.value) || 0)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                      />
                      <button
                        onClick={() => {
                          handleScoreUpdate(newScore);
                          setEditingScore(false);
                        }}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingScore(false);
                          setNewScore(submissionDetails.firebaseData?.score || submissionDetails.submission.score);
                        }}
                        className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold text-blue-600">
                        {submissionDetails.firebaseData?.score || submissionDetails.submission.score}/{submissionDetails.submission.total_questions}
                      </p>
                      <button
                        onClick={() => setEditingScore(true)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* Publish Button */}
                {!submissionDetails.firebaseData?.isPublished && (
                  <button
                    onClick={handlePublishResult}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Publish Result
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

        {/* Answers List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Student Answers</h3>
            <p className="text-sm text-gray-600 mt-1">Review all answers submitted by the student</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {submissionDetails.sections.map((section) => (
              <div key={section.id} className="p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  {section.title}
                </h4>
                <div className="space-y-4">
                  {section.questions.map((question) => (
                    <div key={question.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                          {question.index}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Student's Answer:
                        </p>
                        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                          <p className="text-gray-900">
                            {question.student_answer || <span className="text-gray-400 italic">No answer provided</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}