import axios from 'axios';

// Get backend URL from environment variable
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to generate IDs (for frontend use)
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const BackendService = {
  // ==================== LOCAL AUTHENTICATION ====================

  // Student Login
  studentLogin: async (userId, registrationNumber) => {
    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('registration_number', registrationNumber);

      const response = await api.post('/auth/student-login', formData);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  },

  // Student Logout
  studentLogout: async (sessionToken) => {
    try {
      const response = await api.post('/auth/student/logout', { session_token: sessionToken });
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Logout failed');
    }
  },

  // Get Student Profile
  getStudentProfile: async (sessionToken) => {
    try {
      const response = await api.get('/auth/student/profile', {
        params: { session_token: sessionToken }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw new Error('Failed to get profile');
    }
  },

  // ==================== ADMIN STUDENT MANAGEMENT ====================

  // Add Student
  addStudent: async (formData) => {
    try {
      const response = await api.post('/auth/admin/students/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding student:', error);
      throw new Error(error.response?.data?.detail || 'Failed to add student');
    }
  },

  // Get All Students
  getAdminStudents: async (status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await api.get('/auth/admin/students', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting students:', error);
      throw new Error('Failed to get students');
    }
  },

  // Get Student Details
  getStudentDetails: async (userId) => {
    try {
      const response = await api.get(`/auth/admin/students/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting student details:', error);
      throw new Error('Failed to get student details');
    }
  },

  // Update Student Status
  updateStudentStatus: async (userId, status) => {
    try {
      const formData = new FormData();
      formData.append('status', status);

      const response = await api.put(`/auth/admin/students/${userId}/status`, formData);
      return response.data;
    } catch (error) {
      console.error('Error updating status:', error);
      throw new Error('Failed to update status');
    }
  },

  // Regenerate Student Credentials
  regenerateStudentCredentials: async (userId, reason = '') => {
    try {
      const formData = new FormData();
      formData.append('reason', reason);

      const response = await api.post(`/auth/admin/students/${userId}/regenerate-credentials`, formData);
      return response.data;
    } catch (error) {
      console.error('Error regenerating credentials:', error);
      throw new Error('Failed to regenerate credentials');
    }
  },

  // Delete Student
  deleteStudent: async (userId) => {
    try {
      const response = await api.delete(`/auth/admin/students/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw new Error('Failed to delete student');
    }
  },

  // ==================== EXAM OPERATIONS ====================

  // Exam operations
  createExam: async (examData) => {
    try {
      const response = await api.post('/exams', {
        title: examData.title || 'Untitled Exam',
        description: examData.description || '',
        duration_seconds: examData.duration_seconds || 1800,
        is_demo: examData.is_demo || false,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating exam:', error);
      throw new Error('Failed to create exam');
    }
  },

  getExam: async (examId) => {
    try {
      const response = await api.get(`/exams/${examId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching exam:', error);
      throw new Error('Failed to fetch exam');
    }
  },

  getAllExams: async () => {
    try {
      const response = await api.get('/exams');
      return response.data;
    } catch (error) {
      console.error('Error fetching exams:', error);
      throw new Error('Failed to fetch exams');
    }
  },

  getPublishedExams: async () => {
    try {
      const response = await api.get('/exams/published');
      return response.data;
    } catch (error) {
      console.error('Error fetching published exams:', error);
      throw new Error('Failed to fetch published exams');
    }
  },

  updateExam: async (examId, examData) => {
    try {
      const response = await api.put(`/exams/${examId}`, examData);
      return response.data;
    } catch (error) {
      console.error('Error updating exam:', error);
      throw new Error('Failed to update exam');
    }
  },

  deleteExam: async (examId) => {
    try {
      await api.delete(`/exams/${examId}`);
      return true;
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('Demo exams')) {
        throw new Error('Demo exams cannot be deleted');
      }
      console.error('Error deleting exam:', error);
      throw new Error('Failed to delete exam');
    }
  },

  publishExam: async (examId) => {
    try {
      const response = await api.put(`/exams/${examId}`, { published: true });
      return response.data;
    } catch (error) {
      console.error('Error publishing exam:', error);
      throw new Error('Failed to publish exam');
    }
  },

  startExam: async (examId, adminEmail) => {
    try {
      const response = await api.put(`/admin/exams/${examId}/start`, {}, {
        headers: {
          'X-Admin-Email': adminEmail
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error starting exam:', error);
      throw new Error('Failed to start exam');
    }
  },

  stopExam: async (examId, adminEmail) => {
    try {
      const response = await api.put(`/admin/exams/${examId}/stop`, {}, {
        headers: {
          'X-Admin-Email': adminEmail
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error stopping exam:', error);
      throw new Error('Failed to stop exam');
    }
  },

  getExamStatus: async (examId) => {
    try {
      const response = await api.get(`/exams/${examId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam status:', error);
      throw new Error('Failed to fetch exam status');
    }
  },

  toggleExamVisibility: async (examId, isVisible, adminEmail) => {
    try {
      const response = await api.put(`/admin/exams/${examId}/visibility?is_visible=${isVisible}`, {}, {
        headers: {
          'X-Admin-Email': adminEmail
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling exam visibility:', error);
      throw new Error('Failed to toggle exam visibility');
    }
  },

  // Section operations
  getSectionsByExam: async (examId) => {
    try {
      const response = await api.get(`/exams/${examId}/sections`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sections:', error);
      throw new Error('Failed to fetch sections');
    }
  },

  getSection: async (sectionId) => {
    try {
      // Note: We need to implement this endpoint in the backend if needed
      // For now, we'll get it through exam sections
      throw new Error('Section lookup by ID not implemented');
    } catch (error) {
      console.error('Error fetching section:', error);
      throw new Error('Failed to fetch section');
    }
  },

  updateSection: async (sectionId, sectionData) => {
    try {
      // Note: We need to implement this endpoint in the backend if needed
      throw new Error('Section update not implemented');
    } catch (error) {
      console.error('Error updating section:', error);
      throw new Error('Failed to update section');
    }
  },

  // Question operations
  createQuestion: async (questionData) => {
    try {
      const response = await api.post('/questions', {
        exam_id: questionData.exam_id,
        section_id: questionData.section_id,
        type: questionData.type || 'single_answer',
        payload: questionData.payload || {},
        marks: questionData.marks || 1,
        created_by: questionData.created_by || 'admin',
        is_demo: questionData.is_demo || false,
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('Maximum')) {
        throw new Error('Maximum of 10 questions per section');
      }
      console.error('Error creating question:', error);
      throw new Error('Failed to create question');
    }
  },

  getQuestion: async (questionId) => {
    try {
      const response = await api.get(`/questions/${questionId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching question:', error);
      throw new Error('Failed to fetch question');
    }
  },

  getQuestionsBySection: async (sectionId) => {
    try {
      const response = await api.get(`/sections/${sectionId}/questions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw new Error('Failed to fetch questions');
    }
  },

  updateQuestion: async (questionId, questionData) => {
    try {
      const response = await api.put(`/questions/${questionId}`, questionData);
      return response.data;
    } catch (error) {
      console.error('Error updating question:', error);
      throw new Error('Failed to update question');
    }
  },

  deleteQuestion: async (questionId) => {
    try {
      await api.delete(`/questions/${questionId}`);
      return true;
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('Demo questions')) {
        throw new Error('Demo questions cannot be deleted');
      }
      console.error('Error deleting question:', error);
      throw new Error('Failed to delete question');
    }
  },

  // Get exam with sections and questions
  getExamWithSectionsAndQuestions: async (examId) => {
    try {
      const response = await api.get(`/exams/${examId}/full`);
      return response.data;
    } catch (error) {
      console.error('Error fetching full exam data:', error);
      throw new Error('Failed to fetch exam data');
    }
  },

  // Audio management
  uploadAudio: async (examId, audioUrl, method) => {
    try {
      const response = await api.put(`/exams/${examId}`, {
        audio_url: audioUrl,
        audio_source_method: method,
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading audio:', error);
      throw new Error('Failed to upload audio');
    }
  },

  // Submission operations
  createSubmission: async (submissionData) => {
    try {
      // Use longer timeout for submissions (30 seconds)
      const response = await api.post('/submissions', submissionData, {
        timeout: 30000 // 30 seconds
      });
      return response.data;
    } catch (error) {
      console.error('Error creating submission:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Preserve the error message from backend
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      } else if (error.message) {
        throw new Error(error.message);
      }
      throw new Error('Failed to create submission');
    }
  },

  getSubmission: async (submissionId) => {
    try {
      const response = await api.get(`/submissions/${submissionId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching submission:', error);
      throw new Error('Failed to fetch submission');
    }
  },

  getExamSubmissions: async (examId) => {
    try {
      const response = await api.get(`/exams/${examId}/submissions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam submissions:', error);
      throw new Error('Failed to fetch exam submissions');
    }
  },

  getSubmissionDetailed: async (submissionId) => {
    try {
      const response = await api.get(`/submissions/${submissionId}/detailed`);
      return response.data;
    } catch (error) {
      console.error('Error fetching detailed submission:', error);
      throw new Error('Failed to fetch detailed submission');
    }
  },

  updateSubmissionScore: async (submissionId, scoreData) => {
    try {
      const response = await api.put(`/submissions/${submissionId}/score`, scoreData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating submission score:', error);
      throw new Error('Failed to update submission score');
    }
  },

  // Result publishing operations (Admin only)
  publishExamResults: async (examId, adminEmail) => {
    try {
      const response = await api.put(`/admin/exams/${examId}/publish-results`, {}, {
        headers: {
          'X-Admin-Email': adminEmail
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error publishing exam results:', error);
      throw new Error('Failed to publish exam results');
    }
  },

  publishSingleSubmission: async (submissionId, adminEmail) => {
    try {
      const response = await api.put(`/admin/submissions/${submissionId}/publish`, {}, {
        headers: {
          'X-Admin-Email': adminEmail
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error publishing submission:', error);
      throw new Error('Failed to publish submission');
    }
  },

  // ============================================================================
  // AI IMPORT & TRACK MANAGEMENT
  // ============================================================================

  // AI Import operations
  validateAIImport: async (jsonData) => {
    try {
      const response = await api.post('/tracks/validate-import', jsonData);
      return response.data;
    } catch (error) {
      console.error('Error validating AI import:', error);
      // Re-throw error with response data intact for better error handling in component
      throw error;
    }
  },

  createTrackFromAI: async (jsonData) => {
    try {
      const response = await api.post('/tracks/import-from-ai', jsonData);
      return response.data;
    } catch (error) {
      console.error('Error creating track from AI:', error);
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to create track');
    }
  },

  convertExamToTrack: async (examId) => {
    try {
      const response = await api.post(`/tracks/from-exam/${examId}`);
      return response.data;
    } catch (error) {
      console.error('Error converting exam to track:', error);
      throw new Error('Failed to convert exam to track');
    }
  },

  // Track operations
  getAllTracks: async (trackType = null, status = null) => {
    try {
      const params = {};
      if (trackType) params.track_type = trackType;
      if (status) params.status = status;
      
      const response = await api.get('/tracks', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching tracks:', error);
      throw new Error('Failed to fetch tracks');
    }
  },

  getTrack: async (trackId) => {
    try {
      const response = await api.get(`/tracks/${trackId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching track:', error);
      throw new Error('Failed to fetch track');
    }
  },

  updateTrack: async (trackId, trackData) => {
    try {
      const response = await api.put(`/tracks/${trackId}`, trackData);
      return response.data;
    } catch (error) {
      console.error('Error updating track:', error);
      throw new Error('Failed to update track');
    }
  },

  deleteTrack: async (trackId) => {
    try {
      const response = await api.delete(`/tracks/${trackId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('mock test')) {
        throw new Error(error.response.data.detail);
      }
      console.error('Error deleting track:', error);
      throw new Error('Failed to delete track');
    }
  },

  // JSON Upload operations
  uploadJSONFile: async (file, onProgress) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${BACKEND_URL}/api/tracks/import-from-json`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading JSON file:', error);
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'object' && detail.errors) {
          throw new Error(detail.errors.join(', '));
        }
        throw new Error(detail);
      }
      throw new Error('Failed to upload JSON file');
    }
  },

  validateJSONFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${BACKEND_URL}/api/tracks/validate-json`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error validating JSON file:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Failed to validate JSON file');
    }
  },

  // ============================================================================
  // PHASE 3: EXAM SUBMISSION & GRADING
  // ============================================================================

  // Start a new exam submission
  startSubmission: async (trackId, studentId) => {
    try {
      const response = await api.post('/submissions/start', {
        track_id: trackId,
        student_id: studentId
      });
      return response.data;
    } catch (error) {
      console.error('Error starting submission:', error);
      throw new Error(error.response?.data?.detail || 'Failed to start exam');
    }
  },

  // Save an answer (auto-save)
  saveAnswer: async (submissionId, questionId, studentAnswer) => {
    try {
      const response = await api.post(`/submissions/${submissionId}/autosave`, {
        question_id: questionId,
        student_answer: studentAnswer
      });
      return response.data;
    } catch (error) {
      console.error('Error saving answer:', error);
      throw new Error(error.response?.data?.detail || 'Failed to save answer');
    }
  },

  // Submit exam and get grading results
  submitExam: async (submissionId) => {
    try {
      const response = await api.post(`/submissions/${submissionId}/submit`);
      return response.data;
    } catch (error) {
      console.error('Error submitting exam:', error);
      throw new Error(error.response?.data?.detail || 'Failed to submit exam');
    }
  },

  // Get submission results
  getResults: async (submissionId) => {
    try {
      const response = await api.get(`/submissions/${submissionId}/results`);
      return response.data;
    } catch (error) {
      console.error('Error fetching results:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch results');
    }
  },

  // Get submission details
  getSubmissionDetails: async (submissionId) => {
    try {
      const response = await api.get(`/submissions/${submissionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching submission details:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch submission');
    }
  },

  // Get student's submission history
  getStudentSubmissions: async (studentId) => {
    try {
      const response = await api.get(`/submissions/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student submissions:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch submissions');
    }
  },
};