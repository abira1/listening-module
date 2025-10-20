import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Copy, Upload, MoreHorizontal, Volume2, PlayIcon, PauseIcon, Loader, AlertCircle, CheckCircle, Eye, EyeOff, BookOpen } from 'lucide-react';
import { BackendService } from '../../services/BackendService';
import { useToast } from '../common/Toast';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

export function TestManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newlyCreatedExamId, setNewlyCreatedExamId] = useState(null);
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const { user } = useAdminAuth();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const examsData = await BackendService.getAllExams();
      setExams(examsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching exams:', error);
      setLoading(false);
      showToast('Failed to load tests', 'error');
    }
  };

  useEffect(() => {
    if (newlyCreatedExamId) {
      const timer = setTimeout(() => {
        setNewlyCreatedExamId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [newlyCreatedExamId]);

  const filteredExams = exams.filter((exam) => {
    if (filterType !== 'all' && !exam.title.toLowerCase().includes(filterType.toLowerCase())) return false;
    if (searchTerm) {
      return exam.title.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const handleEditTest = (testId) => {
    navigate(`/admin/tests/${testId}/questions`);
  };

  const handleCreateTest = () => {
    setShowCreateModal(true);
  };

  const handleDeleteTest = async (testId) => {
    const exam = exams.find((e) => e.id === testId);
    if (exam?.is_demo) {
      showToast('Demo tests cannot be deleted', 'error');
      return;
    }

    if (window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      try {
        await BackendService.deleteExam(testId);
        setExams(exams.filter((exam) => exam.id !== testId));
        showToast('Test deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting test:', error);
        showToast(error.message || 'Failed to delete test', 'error');
      }
    }
  };

  const handleDuplicateTest = async (testId) => {
    try {
      const examToDuplicate = exams.find((exam) => exam.id === testId);
      if (examToDuplicate) {
        const newExam = await BackendService.createExam({
          title: `Copy of ${examToDuplicate.title}`,
          description: examToDuplicate.description,
          duration_seconds: examToDuplicate.duration_seconds,
          is_demo: false,
        });
        setExams([...exams, newExam]);
        setNewlyCreatedExamId(newExam.id);
        showToast('Test duplicated successfully', 'success');
      }
    } catch (error) {
      console.error('Error duplicating test:', error);
      showToast(error.message || 'Failed to duplicate test', 'error');
    }
  };

  const handleUploadAudio = (testId) => {
    navigate(`/admin/tests/${testId}/audio`);
  };

  const handleManageQuestions = (testId) => {
    navigate(`/admin/tests/${testId}/questions`);
  };

  const handlePublishTest = async (testId) => {
    try {
      const updatedExam = await BackendService.publishExam(testId);
      if (updatedExam) {
        setExams(exams.map((exam) => exam.id === testId ? { ...exam, published: true } : exam));
        showToast('Test published successfully', 'success');
      }
    } catch (error) {
      console.error('Error publishing test:', error);
      showToast(error.message || 'Failed to publish test', 'error');
    }
  };

  const handleStartTest = async (testId) => {
    try {
      if (!user?.email) {
        showToast('Admin email not found. Please login again.', 'error');
        return;
      }
      const updatedExam = await BackendService.startExam(testId, user.email);
      if (updatedExam) {
        setExams(exams.map((exam) => exam.id === testId ? { ...exam, is_active: true, started_at: updatedExam.started_at } : exam));
        showToast('Test started successfully! Students can now take the test.', 'success');
      }
    } catch (error) {
      console.error('Error starting test:', error);
      showToast(error.message || 'Failed to start test', 'error');
    }
  };

  const handleStopTest = async (testId) => {
    if (window.confirm('Are you sure you want to stop this test? Students will no longer be able to take it.')) {
      try {
        if (!user?.email) {
          showToast('Admin email not found. Please login again.', 'error');
          return;
        }
        const updatedExam = await BackendService.stopExam(testId, user.email);
        if (updatedExam) {
          setExams(exams.map((exam) => exam.id === testId ? { ...exam, is_active: false, stopped_at: updatedExam.stopped_at } : exam));
          showToast('Test stopped successfully!', 'success');
        }
      } catch (error) {
        console.error('Error stopping test:', error);
        showToast(error.message || 'Failed to stop test', 'error');
      }
    }
  };

  const handleToggleVisibility = async (testId, currentVisibility) => {
    const newVisibility = !currentVisibility;
    const action = newVisibility ? 'show' : 'hide';
    
    if (window.confirm(`Are you sure you want to ${action} this test from students?`)) {
      try {
        const updatedExam = await BackendService.toggleExamVisibility(testId, newVisibility, user?.email);
        if (updatedExam) {
          setExams(exams.map((exam) => exam.id === testId ? { ...exam, is_visible: newVisibility } : exam));
          showToast(`Test ${newVisibility ? 'shown' : 'hidden'} successfully!`, 'success');
        }
      } catch (error) {
        console.error('Error toggling test visibility:', error);
        showToast(error.message || 'Failed to toggle test visibility', 'error');
      }
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Test Management</h2>
          <p className="text-gray-600">Create and manage IELTS Listening tests</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/exam/question-type-preview-test"
            target="_blank"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-md flex items-center shadow-md transition-all"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Question Type Preview
          </Link>
          <button onClick={handleCreateTest} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
            <Plus className="w-4 h-4 mr-1" />
            Create Test
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex space-x-3">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border border-gray-300 rounded-md px-4 py-2">
            <option value="all">All Types</option>
            <option value="academic">Academic</option>
            <option value="general">General Training</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Test Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Audio</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Questions</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Visibility</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Control</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className={`hover:bg-gray-50 ${newlyCreatedExamId === exam.id ? 'bg-blue-50 transition-colors duration-500' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="font-medium text-blue-600 hover:underline cursor-pointer truncate" onClick={() => handleEditTest(exam.id)} title={exam.title}>
                          {exam.title}
                          {exam.is_demo && <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">Demo</span>}
                        </div>
                        <div className="text-sm text-gray-500 truncate" title={exam.description}>{exam.description}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {exam.audio_url ? (
                        <span className="text-green-600 text-xs flex items-center justify-center">
                          <Volume2 className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs flex items-center justify-center">
                          <Volume2 className="w-4 h-4" />
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-700 font-medium">{exam.question_count || 0}/40</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs rounded-full inline-block ${exam.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {exam.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      {exam.published ? (
                        <button 
                          onClick={() => handleToggleVisibility(exam.id, exam.is_visible !== false)} 
                          className={`flex items-center justify-center px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            exam.is_visible !== false 
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          title={exam.is_visible !== false ? 'Hide from students' : 'Show to students'}
                        >
                          {exam.is_visible !== false ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      {exam.published && (
                        exam.is_active ? (
                          <button 
                            onClick={() => handleStopTest(exam.id)} 
                            className="flex items-center justify-center px-2 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-xs font-medium transition-colors mx-auto"
                            title="Stop test"
                          >
                            <PauseIcon className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleStartTest(exam.id)} 
                            className="flex items-center justify-center px-2 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-md text-xs font-medium transition-colors mx-auto"
                            title="Start test"
                          >
                            <PlayIcon className="w-4 h-4" />
                          </button>
                        )
                      )}
                      {!exam.published && (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        <button onClick={() => handleEditTest(exam.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit test">
                          <Edit className="w-4 h-4" />
                        </button>
                        {!exam.is_demo && (
                          <button onClick={() => handleDeleteTest(exam.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete test">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filteredExams.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500">No tests found matching your search criteria.</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateExamModal
          onClose={() => setShowCreateModal(false)}
          onExamCreated={(newExam) => {
            setExams([...exams, newExam]);
            setShowCreateModal(false);
            setNewlyCreatedExamId(newExam.id);
            showToast('Test created successfully! Click "Manage Questions" to add questions.', 'success');
            // Don't automatically navigate - let user choose next action
          }}
        />
      )}
    </div>
  );
}

function CreateExamModal({ onClose, onExamCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_seconds: 1800,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.duration_seconds < 600) newErrors.duration_seconds = 'Duration must be at least 10 minutes';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const newExam = await BackendService.createExam({ ...formData, is_demo: false });
      setIsSuccess(true);
      setTimeout(() => {
        onExamCreated(newExam);
      }, 1000);
    } catch (error) {
      console.error('Error creating exam:', error);
      setErrors({ submit: error.message || 'Failed to create exam. Please try again.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Create New Test</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" disabled={isSubmitting}>&times;</button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Test created successfully!</h3>
            <p className="text-gray-600 mt-1">Redirecting to test management...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Title*</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                  placeholder="e.g., Academic Listening Test 1"
                  disabled={isSubmitting}
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                  placeholder="Describe the test content and purpose"
                  disabled={isSubmitting}
                ></textarea>
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Duration (minutes)</label>
                <input
                  type="number"
                  name="duration_seconds"
                  value={formData.duration_seconds / 60}
                  onChange={(e) => handleChange({ target: { name: 'duration_seconds', value: parseInt(e.target.value) * 60 } })}
                  min="10"
                  max="120"
                  className={`w-full border ${errors.duration_seconds ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                  disabled={isSubmitting}
                />
                {errors.duration_seconds && <p className="mt-1 text-sm text-red-600">{errors.duration_seconds}</p>}
              </div>

              {errors.submit && (
                <div className="p-2 bg-red-50 text-red-600 rounded-md text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.submit}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Test'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}