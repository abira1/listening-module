import axios from 'axios';

// Get backend URL from environment variable
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

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
      const response = await api.post('/submissions', submissionData);
      return response.data;
    } catch (error) {
      console.error('Error creating submission:', error);
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
  publishExamResults: async (examId) => {
    try {
      const response = await api.put(`/admin/exams/${examId}/publish-results`, {}, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error publishing exam results:', error);
      throw new Error('Failed to publish exam results');
    }
  },

  publishSingleSubmission: async (submissionId) => {
    try {
      const response = await api.put(`/admin/submissions/${submissionId}/publish`, {}, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error publishing submission:', error);
      throw new Error('Failed to publish submission');
    }
  },
};