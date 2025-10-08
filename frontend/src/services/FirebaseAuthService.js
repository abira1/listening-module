import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  ref, 
  set, 
  get, 
  update,
  child 
} from 'firebase/database';
import { auth, database, googleProvider } from '../config/firebase';

// Admin email whitelist
const ADMIN_EMAILS = [
  'aminulislam004474@gmail.com',
  'shahsultanweb@gmail.com'
];

class FirebaseAuthService {
  /**
   * Sign in with Google
   */
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isAdmin: ADMIN_EMAILS.includes(user.email)
      };
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  }

  /**
   * Check if email is admin
   */
  isAdminEmail(email) {
    return ADMIN_EMAILS.includes(email);
  }

  /**
   * Sign out
   */
  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return auth.currentUser;
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Get student profile from Firebase Realtime Database
   */
  async getStudentProfile(uid) {
    try {
      const studentRef = ref(database, `students/${uid}`);
      const snapshot = await get(studentRef);
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error('Error getting student profile:', error);
      throw error;
    }
  }

  /**
   * Create or update student profile in Firebase Realtime Database
   */
  async saveStudentProfile(uid, profileData) {
    try {
      const studentRef = ref(database, `students/${uid}`);
      const timestamp = new Date().toISOString();
      
      const studentData = {
        uid,
        email: profileData.email,
        name: profileData.name,
        photoURL: profileData.photoURL || '',
        phoneNumber: profileData.phoneNumber || '',
        institution: profileData.institution || '',
        department: profileData.department || '',
        rollNumber: profileData.rollNumber || '',
        profileCompleted: profileData.profileCompleted || false,
        status: profileData.status || 'pending', // pending, approved, rejected
        createdAt: profileData.createdAt || timestamp,
        updatedAt: timestamp
      };

      await set(studentRef, studentData);
      return studentData;
    } catch (error) {
      console.error('Error saving student profile:', error);
      throw error;
    }
  }

  /**
   * Update student profile
   */
  async updateStudentProfile(uid, updates) {
    try {
      const studentRef = ref(database, `students/${uid}`);
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await update(studentRef, updateData);
      return updateData;
    } catch (error) {
      console.error('Error updating student profile:', error);
      throw error;
    }
  }

  /**
   * Approve student account (admin only)
   */
  async approveStudent(uid) {
    try {
      return await this.updateStudentProfile(uid, { status: 'approved' });
    } catch (error) {
      console.error('Error approving student:', error);
      throw error;
    }
  }

  /**
   * Reject student account (admin only)
   */
  async rejectStudent(uid) {
    try {
      return await this.updateStudentProfile(uid, { status: 'rejected' });
    } catch (error) {
      console.error('Error rejecting student:', error);
      throw error;
    }
  }

  /**
   * Toggle student active status (admin only)
   */
  async toggleStudentStatus(uid, isActive) {
    try {
      return await this.updateStudentProfile(uid, { 
        status: isActive ? 'approved' : 'inactive'
      });
    } catch (error) {
      console.error('Error toggling student status:', error);
      throw error;
    }
  }

  /**
   * Get all students (admin only)
   */
  async getAllStudents() {
    try {
      const studentsRef = ref(database, 'students');
      const snapshot = await get(studentsRef);
      
      if (snapshot.exists()) {
        const studentsObj = snapshot.val();
        // Convert to array
        return Object.keys(studentsObj).map(key => ({
          id: key,
          ...studentsObj[key]
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting all students:', error);
      throw error;
    }
  }

  /**
   * Delete student (admin only)
   */
  async deleteStudent(uid) {
    try {
      const studentRef = ref(database, `students/${uid}`);
      await set(studentRef, null);
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }

  /**
   * Save submission to Firebase
   */
  async saveSubmission(submissionData) {
    try {
      const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const submissionRef = ref(database, `submissions/${submissionId}`);
      
      const data = {
        ...submissionData,
        id: submissionId,
        createdAt: new Date().toISOString()
      };
      
      await set(submissionRef, data);
      return data;
    } catch (error) {
      console.error('Error saving submission:', error);
      throw error;
    }
  }

  /**
   * Get submissions for a student
   */
  async getStudentSubmissions(uid) {
    try {
      const submissionsRef = ref(database, 'submissions');
      const snapshot = await get(submissionsRef);
      
      if (snapshot.exists()) {
        const submissionsObj = snapshot.val();
        // Filter submissions by student uid
        return Object.keys(submissionsObj)
          .map(key => ({
            id: key,
            ...submissionsObj[key]
          }))
          .filter(sub => sub.studentUid === uid)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      return [];
    } catch (error) {
      console.error('Error getting student submissions:', error);
      throw error;
    }
  }

  /**
   * Get all submissions (admin only)
   */
  async getAllSubmissions() {
    try {
      const submissionsRef = ref(database, 'submissions');
      const snapshot = await get(submissionsRef);
      
      if (snapshot.exists()) {
        const submissionsObj = snapshot.val();
        return Object.keys(submissionsObj)
          .map(key => ({
            id: key,
            ...submissionsObj[key]
          }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      return [];
    } catch (error) {
      console.error('Error getting all submissions:', error);
      throw error;
    }
  }

  /**
   * Update submission score (admin only)
   */
  async updateSubmissionScore(submissionId, newScore) {
    try {
      const submissionRef = ref(database, `submissions/${submissionId}`);
      const updateData = {
        score: newScore,
        manuallyGraded: true,
        updatedAt: new Date().toISOString()
      };
      
      await update(submissionRef, updateData);
      return updateData;
    } catch (error) {
      console.error('Error updating submission score:', error);
      throw error;
    }
  }

  /**
   * Get single submission by ID
   */
  async getSubmission(submissionId) {
    try {
      const submissionRef = ref(database, `submissions/${submissionId}`);
      const snapshot = await get(submissionRef);
      
      if (snapshot.exists()) {
        return {
          id: submissionId,
          ...snapshot.val()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting submission:', error);
      throw error;
    }
  }
}

export default new FirebaseAuthService();