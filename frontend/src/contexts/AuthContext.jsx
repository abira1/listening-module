import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('student_token');
        if (token) {
          // Verify token is still valid
          const response = await fetch('http://localhost:8000/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('student_token');
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

  const loginWithCredentials = async (userId, registrationNumber) => {
    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('registration_number', registrationNumber);

      // Use direct backend URL (more reliable than proxy)
      const backendUrl = 'http://localhost:8000/api/auth/student-login';

      console.log('[AuthContext] Attempting login to:', backendUrl);
      console.log('[AuthContext] User ID:', userId);
      console.log('[AuthContext] Registration Number:', registrationNumber);

      const response = await fetch(backendUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('[AuthContext] Response status:', response.status);
      console.log('[AuthContext] Response headers:', {
        contentType: response.headers.get('content-type'),
        status: response.status,
        statusText: response.statusText,
      });

      let data;

      if (!response.ok) {
        try {
          const error = await response.json();
          throw new Error(error.detail || `Login failed: ${response.status}`);
        } catch (parseError) {
          // If response is not JSON, just use status code
          console.error('Error response status:', response.status);
          throw new Error(`Login failed: ${response.status}`);
        }
      }

      // Parse successful response
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse login response:', parseError);
        throw new Error('Invalid response from server. Please try again.');
      }

      // Validate response structure
      if (!data.token || !data.user) {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response structure from server');
      }

      localStorage.setItem('student_token', data.token);

      // Fetch user role and permissions
      try {
        const roleUrl = `http://localhost:8000/api/rbac/users/${data.user.user_id}/role`;
        const roleResponse = await fetch(roleUrl, {
          headers: {
            'Authorization': `Bearer ${data.token}`,
          },
        });

        if (roleResponse.ok) {
          const roleData = await roleResponse.json();
          data.user.role = roleData.role;
          data.user.permissions = roleData.permissions;
        } else {
          // Default to student role if fetch fails
          data.user.role = 'student';
          data.user.permissions = ['take_exams', 'view_results', 'view_submissions'];
        }
      } catch (error) {
        console.warn('Could not fetch user role:', error);
        data.user.role = 'student';
        data.user.permissions = ['take_exams', 'view_results', 'view_submissions'];
      }

      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('student_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    loginWithCredentials,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};