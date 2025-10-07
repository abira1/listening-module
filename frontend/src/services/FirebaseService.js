import { database } from '../config/firebase';
import { ref, set, get, update, remove, push, query, orderByChild, equalTo } from 'firebase/database';

// Helper to generate IDs
const generateId = () => push(ref(database)).key;

export const FirebaseService = {
  // Exam operations
  createExam: async (examData) => {
    const examId = generateId();
    const now = new Date().toISOString();
    const newExam = {
      id: examId,
      title: examData.title || 'Untitled Exam',
      description: examData.description || '',
      audio_url: examData.audio_url,
      audio_source_method: examData.audio_source_method,
      loop_audio: examData.loop_audio || false,
      duration_seconds: examData.duration_seconds || 1800,
      published: examData.published || false,
      created_at: now,
      updated_at: now,
      is_demo: examData.is_demo || false,
      question_count: 0,
      submission_count: 0,
    };

    await set(ref(database, `exams/${examId}`), newExam);
    
    // Create 4 sections for the exam
    for (let i = 1; i <= 4; i++) {
      const sectionId = generateId();
      await set(ref(database, `sections/${sectionId}`), {
        id: sectionId,
        exam_id: examId,
        index: i,
        title: `Section ${i}`,
      });
    }
    
    return newExam;
  },

  getExam: async (examId) => {
    const snapshot = await get(ref(database, `exams/${examId}`));
    return snapshot.exists() ? snapshot.val() : null;
  },

  getAllExams: async () => {
    const snapshot = await get(ref(database, 'exams'));
    if (!snapshot.exists()) return [];
    const exams = [];
    snapshot.forEach((child) => {
      exams.push(child.val());
    });
    return exams;
  },

  getPublishedExams: async () => {
    const allExams = await FirebaseService.getAllExams();
    return allExams.filter(exam => exam.published);
  },

  updateExam: async (examId, examData) => {
    const updates = {
      ...examData,
      updated_at: new Date().toISOString(),
    };
    await update(ref(database, `exams/${examId}`), updates);
    return await FirebaseService.getExam(examId);
  },

  deleteExam: async (examId) => {
    // Don't allow deleting demo exams
    const exam = await FirebaseService.getExam(examId);
    if (exam?.is_demo) {
      throw new Error('Demo exams cannot be deleted');
    }

    // Delete exam
    await remove(ref(database, `exams/${examId}`));
    
    // Delete related sections
    const sections = await FirebaseService.getSectionsByExam(examId);
    for (const section of sections) {
      await remove(ref(database, `sections/${section.id}`));
      
      // Delete questions in this section
      const questions = await FirebaseService.getQuestionsBySection(section.id);
      for (const question of questions) {
        await remove(ref(database, `questions/${question.id}`));
      }
    }
    
    return true;
  },

  publishExam: async (examId) => {
    return await FirebaseService.updateExam(examId, { published: true });
  },

  // Section operations
  getSectionsByExam: async (examId) => {
    const snapshot = await get(ref(database, 'sections'));
    if (!snapshot.exists()) return [];
    const sections = [];
    snapshot.forEach((child) => {
      const section = child.val();
      if (section.exam_id === examId) {
        sections.push(section);
      }
    });
    return sections.sort((a, b) => a.index - b.index);
  },

  getSection: async (sectionId) => {
    const snapshot = await get(ref(database, `sections/${sectionId}`));
    return snapshot.exists() ? snapshot.val() : null;
  },

  updateSection: async (sectionId, sectionData) => {
    await update(ref(database, `sections/${sectionId}`), sectionData);
    return await FirebaseService.getSection(sectionId);
  },

  // Question operations
  createQuestion: async (questionData) => {
    const section = await FirebaseService.getSection(questionData.section_id);
    if (!section) throw new Error('Section not found');

    // Check if section already has 10 questions
    const sectionQuestions = await FirebaseService.getQuestionsBySection(section.id);
    if (sectionQuestions.length >= 10) {
      throw new Error('Maximum of 10 questions per section');
    }

    const questionId = generateId();
    const newQuestion = {
      id: questionId,
      exam_id: questionData.exam_id,
      section_id: questionData.section_id,
      index: questionData.index || sectionQuestions.length + 1,
      type: questionData.type || 'single_answer',
      payload: questionData.payload || {},
      marks: questionData.marks || 1,
      created_by: questionData.created_by || 'admin',
      is_demo: questionData.is_demo || false,
    };

    await set(ref(database, `questions/${questionId}`), newQuestion);

    // Update question count on exam
    const exam = await FirebaseService.getExam(questionData.exam_id);
    if (exam) {
      await FirebaseService.updateExam(questionData.exam_id, {
        question_count: (exam.question_count || 0) + 1,
      });
    }

    return newQuestion;
  },

  getQuestion: async (questionId) => {
    const snapshot = await get(ref(database, `questions/${questionId}`));
    return snapshot.exists() ? snapshot.val() : null;
  },

  getQuestionsBySection: async (sectionId) => {
    const snapshot = await get(ref(database, 'questions'));
    if (!snapshot.exists()) return [];
    const questions = [];
    snapshot.forEach((child) => {
      const question = child.val();
      if (question.section_id === sectionId) {
        questions.push(question);
      }
    });
    return questions.sort((a, b) => a.index - b.index);
  },

  updateQuestion: async (questionId, questionData) => {
    const question = await FirebaseService.getQuestion(questionId);
    if (question?.is_demo) {
      throw new Error('Demo questions cannot be modified');
    }
    await update(ref(database, `questions/${questionId}`), questionData);
    return await FirebaseService.getQuestion(questionId);
  },

  deleteQuestion: async (questionId) => {
    const question = await FirebaseService.getQuestion(questionId);
    if (question?.is_demo) {
      throw new Error('Demo questions cannot be deleted');
    }

    await remove(ref(database, `questions/${questionId}`));

    // Update question count on exam
    if (question) {
      const exam = await FirebaseService.getExam(question.exam_id);
      if (exam && exam.question_count) {
        await FirebaseService.updateExam(question.exam_id, {
          question_count: exam.question_count - 1,
        });
      }
    }

    return true;
  },

  // Get exam with sections and questions
  getExamWithSectionsAndQuestions: async (examId) => {
    const exam = await FirebaseService.getExam(examId);
    if (!exam) return null;

    const sections = await FirebaseService.getSectionsByExam(examId);
    const sectionsWithQuestions = await Promise.all(
      sections.map(async (section) => {
        const questions = await FirebaseService.getQuestionsBySection(section.id);
        return {
          ...section,
          questions,
        };
      })
    );

    return {
      exam,
      sections: sectionsWithQuestions,
    };
  },

  // Audio management
  uploadAudio: async (examId, audioUrl, method) => {
    return await FirebaseService.updateExam(examId, {
      audio_url: audioUrl,
      audio_source_method: method,
    });
  },

  // Submission operations
  createSubmission: async (submissionData) => {
    const submissionId = generateId();
    const now = new Date().toISOString();
    const newSubmission = {
      id: submissionId,
      exam_id: submissionData.exam_id,
      user_id_or_session: submissionData.user_id_or_session || generateId(),
      started_at: now,
      answers: submissionData.answers || {},
      progress_percent: 0,
      last_playback_time: 0,
    };

    await set(ref(database, `submissions/${submissionId}`), newSubmission);

    // Update submission count on exam
    const exam = await FirebaseService.getExam(submissionData.exam_id);
    if (exam) {
      await FirebaseService.updateExam(submissionData.exam_id, {
        submission_count: (exam.submission_count || 0) + 1,
      });
    }

    return newSubmission;
  },

  updateSubmission: async (submissionId, submissionData) => {
    await update(ref(database, `submissions/${submissionId}`), submissionData);
    const snapshot = await get(ref(database, `submissions/${submissionId}`));
    return snapshot.exists() ? snapshot.val() : null;
  },

  getSubmission: async (submissionId) => {
    const snapshot = await get(ref(database, `submissions/${submissionId}`));
    return snapshot.exists() ? snapshot.val() : null;
  },
};