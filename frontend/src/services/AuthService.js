const API_URL = process.env.REACT_APP_BACKEND_URL;

export class AuthService {
  /**
   * Exchange session_id from URL fragment for session_token
   */
  static async exchangeSession(sessionId) {
    const response = await fetch(`${API_URL}/api/auth/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ session_id: sessionId }),
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate');
    }

    return response.json();
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser() {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Not authenticated');
    }

    return response.json();
  }

  /**
   * Logout current user
   */
  static async logout() {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    return response.json();
  }

  /**
   * Complete student profile
   */
  static async completeProfile(profileData) {
    const response = await fetch(`${API_URL}/api/students/complete-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return response.json();
  }

  /**
   * Get student's submissions
   */
  static async getMySubmissions() {
    const response = await fetch(`${API_URL}/api/students/me/submissions`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch submissions');
    }

    return response.json();
  }

  /**
   * Check if student has attempted an exam
   */
  static async getExamAttemptStatus(examId) {
    const response = await fetch(`${API_URL}/api/students/me/exam-status/${examId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to check exam status');
    }

    return response.json();
  }

  /**
   * Get all students (admin only)
   */
  static async getAllStudents() {
    const response = await fetch(`${API_URL}/api/admin/students`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch students');
    }

    return response.json();
  }

  /**
   * Get all submissions (admin only)
   */
  static async getAllSubmissions() {
    const response = await fetch(`${API_URL}/api/admin/submissions`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch submissions');
    }

    return response.json();
  }

  /**
   * Delete a student (admin only)
   */
  static async deleteStudent(studentId) {
    const response = await fetch(`${API_URL}/api/admin/students/${studentId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete student');
    }

    return response.json();
  }

  /**
   * Generate Emergent Auth login URL
   */
  static getLoginUrl(redirectUrl) {
    return `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  }
}
