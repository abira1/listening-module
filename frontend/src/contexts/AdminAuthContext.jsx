import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext(null);

// Admin credentials (local authentication)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if admin session exists in sessionStorage on mount
    const storedAdmin = sessionStorage.getItem('adminUser');
    if (storedAdmin) {
      try {
        const userData = JSON.parse(storedAdmin);
        setAdminUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        sessionStorage.removeItem('adminUser');
        setAdminUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setAdminUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  const loginWithCredentials = async (username, password) => {
    try {
      // Validate credentials locally
      if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
        throw new Error('Invalid username or password');
      }

      const userData = {
        username: username,
        isAdmin: true,
        role: 'admin',
        permissions: ['create_questions','edit_questions','delete_questions','create_exams','edit_exams','delete_exams','grade_submissions','publish_results','manage_users','view_analytics'],
        loginTime: new Date().toISOString()
      };

      sessionStorage.setItem('adminUser', JSON.stringify(userData));
      setAdminUser(userData);
      setIsAuthenticated(true);

      return userData;
    } catch (error) {
      console.error('Admin login error:', error);
      sessionStorage.removeItem('adminUser');
      throw error;
    }
  };

  const logout = () => {
    try {
      sessionStorage.removeItem('adminUser');
      setAdminUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Admin logout error:', error);
      // Even if error occurs, clear local state
      sessionStorage.removeItem('adminUser');
      setAdminUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user: adminUser,
    loading,
    isAuthenticated,
    isAdmin: isAuthenticated,
    loginWithCredentials,
    logout
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
