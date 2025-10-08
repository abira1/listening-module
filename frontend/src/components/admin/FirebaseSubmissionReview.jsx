import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Edit2, Save, AlertCircle, Calendar, User, Award } from 'lucide-react';
import FirebaseAuthService from '../../services/FirebaseAuthService';
import { BackendService } from '../../services/BackendService';

export function FirebaseSubmissionReview({ submissionId, onClose }) {
  const [submission, setSubmission] = useState(null);
  const [exam, setExam] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedScore, setEditedScore] = useState(0);

  useEffect(() => {
    loadSubmissionDetails();
  }, [submissionId]);

  const loadSubmissionDetails = async () => {
    try {
      setLoading(true);
      
      // Load submission from Firebase
      const submissionData = await FirebaseAuthService.getSubmission(submissionId);
      setSubmission(submissionData);
      setEditedScore(submissionData.score || 0);

      // Load exam details with sections and questions
      if (submissionData.examId) {
        try {
          const examData = await BackendService.getExamWithSectionsAndQuestions(submissionData.examId);
          console.log('Loaded exam data:', examData); // Debug log
          setExam(examData);
        } catch (error) {
          console.error('Error loading exam:', error);
          // Set exam to null to show error message instead of infinite loading
          setExam(null);
        }
      }

      // Load student details
      if (submissionData.studentUid) {
        try {
          const studentData = await FirebaseAuthService.getStudentProfile(submissionData.studentUid);
          setStudent(studentData);
        } catch (error) {
          console.error('Error loading student:', error);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading submission details:', error);
      setLoading(false);
    }
  };

  const handleSaveScore = async () => {
    try {
      setSaving(true);
      await FirebaseAuthService.updateSubmissionScore(submissionId, editedScore);
      
      // Reload to reflect changes
      await loadSubmissionDetails();
      setEditMode(false);
      setSaving(false);
      
      alert('Score updated successfully!');
    } catch (error) {
      console.error('Error saving score:', error);
      alert('Failed to save score. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading submission details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4">
          <div className="text-center text-red-600">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p>Failed to load submission details</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const percentage = submission.totalQuestions
    ? Math.round((submission.score / submission.totalQuestions) * 100)
    : 0;
  const isPassed = percentage >= 60;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-5xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10 rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Submission Review</h2>
            <p className="text-sm text-gray-600 mt-1">
              {submission.studentName} - {submission.examTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Score Summary */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-600">Student</p>
              </div>
              <p className="font-semibold text-gray-900">{submission.studentName || 'Unknown'}</p>
              <p className="text-xs text-gray-500">{submission.studentEmail || 'N/A'}</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-600">Submitted</p>
              </div>
              <p className="font-semibold text-gray-900">
                {new Date(submission.createdAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(submission.createdAt).toLocaleTimeString()}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-600">Score</p>
                </div>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Edit score"
                  >
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </button>
                )}
              </div>
              {editMode ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editedScore}
                    onChange={(e) => setEditedScore(parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max={submission.totalQuestions}
                  />
                  <span className="text-sm text-gray-600">/ {submission.totalQuestions}</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {submission.score}/{submission.totalQuestions}
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-2">Percentage</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        isPassed ? 'bg-green-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-xl font-bold text-gray-900">{percentage}%</span>
              </div>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {isPassed ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      Passed
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3" />
                      Failed
                    </>
                  )}
                </span>
                {submission.manuallyGraded && (
                  <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <Edit2 className="w-3 h-3" />
                    Manual
                  </span>
                )}
              </div>
            </div>
          </div>

          {editMode && (
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditMode(false);
                  setEditedScore(submission.score || 0);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveScore}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Score'}
              </button>
            </div>
          )}
        </div>

        {/* Student Answers */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Answer Review</h3>
          
          {submission.answers && Object.keys(submission.answers).length > 0 && exam ? (
            <div className="space-y-4">
              {exam.sections?.map((section) => (
                <div key={section.id} className="mb-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-3 bg-gray-100 px-4 py-2 rounded">
                    {section.title}
                  </h4>
                  <div className="space-y-3">
                    {section.questions?.map((question) => {
                      const studentAnswer = submission.answers[question.index] || '';
                      const correctAnswer = question.payload?.answer_key || '';
                      const isCorrect = studentAnswer.toString().toLowerCase().trim() === 
                                       correctAnswer.toString().toLowerCase().trim();
                      
                      return (
                        <div
                          key={question.id}
                          className={`rounded-lg p-4 border-2 ${
                            isCorrect 
                              ? 'bg-green-50 border-green-200' 
                              : studentAnswer 
                                ? 'bg-red-50 border-red-200' 
                                : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {isCorrect ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : studentAnswer ? (
                                <XCircle className="w-5 h-5 text-red-600" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-gray-900">
                                  Question {question.index}
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-white rounded-full border border-gray-300">
                                  {question.type.replace('_', ' ')}
                                </span>
                              </div>
                              
                              {/* Question Prompt */}
                              <div className="mb-3">
                                <p className="text-sm font-medium text-gray-700 mb-1">Question:</p>
                                <p className="text-sm text-gray-900">
                                  {question.payload?.prompt || question.payload?.question || 'No question text'}
                                </p>
                              </div>

                              {/* Multiple Choice Options */}
                              {question.type === 'multiple_choice' && question.payload?.options && (
                                <div className="mb-3">
                                  <p className="text-sm font-medium text-gray-700 mb-1">Options:</p>
                                  <ul className="text-sm text-gray-700 list-disc list-inside">
                                    {question.payload.options.map((option, idx) => (
                                      <li key={idx}>{option}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Image if present */}
                              {question.payload?.image_url && (
                                <div className="mb-3">
                                  <img 
                                    src={question.payload.image_url} 
                                    alt={`Question ${question.index}`}
                                    className="max-w-md rounded border border-gray-300"
                                  />
                                </div>
                              )}
                              
                              {/* Student Answer */}
                              <div className="grid grid-cols-2 gap-3 mt-3">
                                <div>
                                  <p className="text-xs font-medium text-gray-600 mb-1">Student Answer:</p>
                                  <p className={`text-sm font-semibold ${
                                    studentAnswer 
                                      ? isCorrect ? 'text-green-700' : 'text-red-700'
                                      : 'text-gray-400 italic'
                                  }`}>
                                    {studentAnswer || 'Not answered'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-600 mb-1">Correct Answer:</p>
                                  <p className="text-sm font-semibold text-blue-700">
                                    {correctAnswer || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : !exam ? (
            <div className="text-center py-8 text-gray-500">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>Loading exam questions...</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No answer details available</p>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {(submission.startedAt || submission.finishedAt) && (
          <div className="p-6 bg-gray-50 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Timing Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {submission.startedAt && (
                <div>
                  <p className="text-gray-600">Started At:</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(submission.startedAt).toLocaleString()}
                  </p>
                </div>
              )}
              {submission.finishedAt && (
                <div>
                  <p className="text-gray-600">Finished At:</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(submission.finishedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
