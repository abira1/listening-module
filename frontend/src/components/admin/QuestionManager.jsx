import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Plus, Edit, Trash2, CheckCircle, Loader, AlertCircle, Music } from 'lucide-react';
import { BackendService } from '../../services/BackendService';
import { useToast } from '../common/Toast';

export function QuestionManager() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const [exam, setExam] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (examId) {
      setLoading(true);
      setError(null);
      setExam(null);
      setSections([]);
      setActiveSection(null);
    }
  }, [examId]);

  useEffect(() => {
    const loadExamData = async () => {
      if (!examId) return;
      setLoading(true);
      try {
        const examData = await BackendService.getExamWithSectionsAndQuestions(examId);
        if (examData) {
          setExam(examData.exam);
          setSections(examData.sections);
          if (examData.sections.length > 0 && !activeSection) {
            setActiveSection(examData.sections[0].id);
          }
          setError(null);
        } else {
          setError('Test not found');
          showToast('Test not found', 'error');
        }
      } catch (err) {
        console.error('Error loading test data:', err);
        setError('Failed to load test data');
        showToast('Failed to load test data', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      loadExamData();
    }
  }, [examId, refreshKey, showToast]);

  const handleBack = () => {
    navigate('/admin/tests');
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleUploadAudio = () => {
    if (examId) {
      navigate(`/admin/tests/${examId}/audio`);
    }
  };

  const handleCreateQuestion = (sectionId) => {
    showToast('Question editor coming soon! Use the simple form below.', 'info');
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await BackendService.deleteQuestion(questionId);
      showToast('Question deleted successfully', 'success');
      handleRefresh();
    } catch (err) {
      console.error('Error deleting question:', err);
      showToast('Failed to delete question', 'error');
    }
  };

  const handlePublishExam = async () => {
    if (!examId) return;
    try {
      const updatedExam = await FirebaseService.publishExam(examId);
      if (updatedExam) {
        setExam(updatedExam);
        showToast('Test published successfully', 'success');
      }
    } catch (err) {
      console.error('Error publishing test:', err);
      showToast('Failed to publish test', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
            <div className="mt-2">
              <button onClick={handleBack} className="text-sm text-red-800 underline">
                Return to Test Management
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <div>
          <button onClick={handleBack} className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Tests
          </button>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">{exam?.title}</h2>
          <p className="text-gray-600">{exam?.description}</p>
        </div>
        <div className="flex space-x-3">
          {!exam?.published && (
            <button
              onClick={handlePublishExam}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center"
              disabled={!exam?.audio_url}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Publish Test
            </button>
          )}
          <button onClick={handleRefresh} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex justify-between items-center">
        <div className="flex items-center">
          {exam?.audio_url ? (
            <div className="flex items-center text-green-600">
              <Music className="w-5 h-5 mr-2" />
              <span className="font-medium">Audio uploaded</span>
              <span className="ml-2 text-gray-500 text-sm">
                {exam.audio_source_method === 'local' ? 'Local file' : 'External URL'}
              </span>
            </div>
          ) : (
            <div className="flex items-center text-yellow-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">No audio uploaded</span>
              <span className="ml-2 text-gray-500 text-sm">Audio is required for publishing</span>
            </div>
          )}
        </div>
        <button
          onClick={handleUploadAudio}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm flex items-center"
        >
          <Upload className="w-4 h-4 mr-1" />
          {exam?.audio_url ? 'Change Audio' : 'Upload Audio'}
        </button>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div
              className={`px-4 py-3 border-b border-gray-200 flex justify-between items-center ${activeSection === section.id ? 'bg-blue-50' : ''}`}
            >
              <h3 className="font-medium text-gray-800">
                Section {section.index}: {section.title}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleCreateQuestion(section.id)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm flex items-center"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Question
                </button>
                <button
                  onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  {activeSection === section.id ? 'Hide' : 'View'} Questions
                </button>
              </div>
            </div>

            {activeSection === section.id && (
              <div className="p-4">
                {section.questions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No questions added to this section yet.</p>
                    <button
                      onClick={() => handleCreateQuestion(section.id)}
                      className="mt-2 text-blue-600 hover:text-blue-800 flex items-center justify-center mx-auto"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Create First Question
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {section.questions.map((question, index) => (
                          <tr key={question.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 capitalize">
                              {question.type.replace('_', ' ')}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-500 max-w-md truncate">
                              {getQuestionPreview(question)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{question.marks}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-900">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(question.id)}
                                  className="text-red-600 hover:text-red-900"
                                  disabled={question.is_demo}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getQuestionPreview(question) {
  try {
    switch (question.type) {
      case 'single_answer':
        return question.payload.prompt || 'Single answer question';
      case 'multiple_answer':
        return question.payload.prompt || 'Multiple answer question';
      case 'matching':
        return `Matching question (${question.payload.left?.length || 0} items)`;
      case 'map_labelling':
        return `Map labelling (${question.payload.markers?.length || 0} markers)`;
      case 'note_completion':
        return 'Note completion question';
      case 'short_answer':
        return question.payload.prompt || 'Short answer question';
      case 'form_completion':
        return `Form completion (${question.payload.fields?.length || 0} fields)`;
      case 'sentence_completion':
        return `Sentence completion (${question.payload.sentences?.length || 0} sentences)`;
      case 'table_completion':
        return 'Table completion question';
      case 'flowchart_completion':
        return 'Flowchart completion question';
      default:
        return 'Question';
    }
  } catch (error) {
    return 'Question preview unavailable';
  }
}