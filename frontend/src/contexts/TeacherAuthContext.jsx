import React, { createContext, useContext, useState, useEffect } from 'react';

const TeacherAuthContext = createContext(null);

export const TeacherAuthProvider = ({ children }) => {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Check if teacher is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('teacher_token');
        if (token) {
          // Verify token is still valid
          const response = await fetch('http://localhost:8000/api/auth/teacher/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setTeacher(userData.teacher);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('teacher_token');
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loginWithCredentials = async (teacherId, password) => {
    try {
      setError(null);
      const formData = new FormData();
      formData.append('teacher_id', teacherId);
      formData.append('password', password);

      const backendUrl = 'http://localhost:8000/api/auth/teacher-login';

      console.log('[TeacherAuthContext] Attempting login to:', backendUrl);
      console.log('[TeacherAuthContext] Teacher ID:', teacherId);

      const response = await fetch(backendUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();

      if (!data.token) {
        throw new Error('No token received from server');
      }

      localStorage.setItem('teacher_token', data.token);
      setTeacher(data.teacher);
      setIsAuthenticated(true);

      return data;
    } catch (error) {
      console.error('Teacher login error:', error);
      setError(error.message);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('teacher_token');
      if (token) {
        await fetch('http://localhost:8000/api/auth/teacher/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('teacher_token');
      setTeacher(null);
      setIsAuthenticated(false);
      setError(null);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      const token = localStorage.getItem('teacher_token');
      
      if (!token) {
        throw new Error('No session token found');
      }

      const formData = new FormData();
      formData.append('current_password', currentPassword);
      formData.append('new_password', newPassword);

      const response = await fetch('http://localhost:8000/api/auth/teacher/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to change password');
      }

      return await response.json();
    } catch (error) {
      console.error('Change password error:', error);
      setError(error.message);
      throw error;
    }
  };

  const value = {
    teacher,
    loading,
    isAuthenticated,
    error,
    loginWithCredentials,
    logout,
    changePassword,
  };

  return (
    <TeacherAuthContext.Provider value={value}>
      {children}
    </TeacherAuthContext.Provider>
  );
};

export const useTeacherAuth = () => {
  const context = useContext(TeacherAuthContext);
  if (!context) {
    throw new Error('useTeacherAuth must be used within TeacherAuthProvider');
  }
  return context;
};

