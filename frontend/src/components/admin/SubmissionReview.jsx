import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Edit2, Save, AlertCircle } from 'lucide-react';
import { BackendService } from '../../services/BackendService';

export function SubmissionReview({ submissionId, onClose, onScoreUpdated }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedScore, setEditedScore] = useState(0);
  const [editedCorrectAnswers, setEditedCorrectAnswers] = useState(0);

  useEffect(() => {
    loadSubmissionDetails();
  }, [submissionId]);

  const loadSubmissionDetails = async () => {
    try {
      setLoading(true);
      const response = await BackendService.getSubmissionDetailed(submissionId);
      setData(response);
      setEditedScore(response.submission.score || 0);
      setEditedCorrectAnswers(response.submission.correct_answers || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error loading submission details:', error);
      setLoading(false);
    }
  };

  const handleSaveScore = async () => {
    try {
      setSaving(true);
      await BackendService.updateSubmissionScore(submissionId, {
        score: editedScore,
        correct_answers: editedCorrectAnswers,
      });
      
      // Reload data to reflect changes
      await loadSubmissionDetails();
      setEditMode(false);
      setSaving(false);
      
      if (onScoreUpdated) {
        onScoreUpdated();
      }
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

  if (!data) {
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

  const { submission, exam, sections } = data;
  const percentage = submission.total_questions
    ? Math.round((submission.score / submission.total_questions) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-6xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10 rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Submission Review</h2>
            <p className="text-sm text-gray-600 mt-1">
              {submission.student_name} - {exam.title}
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
              <p className="text-sm text-gray-600 mb-1">Student</p>
              <p className="font-semibold text-gray-900">{submission.student_name}</p>
              <p className="text-xs text-gray-500">{submission.student_email}</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Submitted</p>
              <p className="font-semibold text-gray-900">
                {new Date(submission.finished_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(submission.finished_at).toLocaleTimeString()}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-600">Score</p>
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
                <input
                  type="number"
                  value={editedScore}
                  onChange={(e) => setEditedScore(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max={submission.total_questions}
                />
              ) : (
                <p className="font-semibold text-gray-900 text-xl">
                  {submission.score}/{submission.total_questions}
                </p>
              )}
              {submission.manually_graded && (
                <p className="text-xs text-purple-600 mt-1">Manually graded</p>
              )}
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-2">Percentage</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      percentage >= 70
                        ? 'bg-green-600'
                        : percentage >= 50
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="font-semibold text-gray-900">{percentage}%</span>
              </div>
            </div>
          </div>

          {editMode && (
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={handleSaveScore}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setEditedScore(submission.score || 0);
                  setEditedCorrectAnswers(submission.correct_answers || 0);
                }}
                disabled={saving}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <p className="text-sm text-gray-600">
                Edit the score above and click Save Changes
              </p>
            </div>
          )}
        </div>

        {/* Questions and Answers */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {sections.map((section, sectionIndex) => (
            <div key={section.id} className="mb-8">
              <div className="bg-blue-50 px-4 py-3 rounded-lg mb-4">
                <h3 className="font-bold text-lg text-gray-900">
                  Section {section.index}: {section.title}
                </h3>
                {section.instructions && (
                  <p className="text-sm text-gray-600 mt-1">{section.instructions}</p>
                )}
              </div>

              <div className="space-y-4">
                {section.questions.map((question, questionIndex) => {
                  const isCorrect = question.is_correct;
                  const hasAnswer = question.student_answer !== '';

                  return (
                    <div
                      key={question.id}
                      className={`border rounded-lg p-4 ${
                        isCorrect === true
                          ? 'border-green-200 bg-green-50'
                          : isCorrect === false
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {isCorrect === true ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : isCorrect === false ? (
                            <XCircle className="w-6 h-6 text-red-600" />
                          ) : (
                            <AlertCircle className="w-6 h-6 text-gray-400" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-semibold text-gray-900">
                              Question {question.index}
                            </p>
                            <span className="text-sm text-gray-600">
                              {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                            </span>
                          </div>

                          {/* Question Prompt */}
                          <div className="mb-3">
                            {question.payload.prompt && (
                              <p className="text-gray-700">{question.payload.prompt}</p>
                            )}
                            {question.payload.image_url && (
                              <img
                                src={question.payload.image_url}
                                alt="Question"
                                className="mt-2 max-w-md rounded-lg border"
                              />
                            )}
                          </div>

                          {/* Question Type and Options */}
                          <div className="mb-3">
                            <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                              {question.type.replace('_', ' ')}
                            </span>
                            {question.type === 'multiple_choice' &&
                              question.payload.options && (
                                <div className="mt-2 space-y-1">
                                  {question.payload.options.map((option, idx) => (
                                    <div key={idx} className="text-sm text-gray-600">
                                      {String.fromCharCode(65 + idx)}. {option}
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>

                          {/* Student Answer vs Correct Answer */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t">
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-1">
                                Student Answer:
                              </p>
                              <p
                                className={`font-medium ${
                                  hasAnswer ? 'text-gray-900' : 'text-gray-400 italic'
                                }`}
                              >
                                {hasAnswer ? question.student_answer : 'No answer'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-1">
                                Correct Answer:
                              </p>
                              <p className="font-medium text-green-700">
                                {question.correct_answer || 'Not specified'}
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

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-lg">
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
