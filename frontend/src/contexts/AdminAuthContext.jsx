import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';

const AdminAuthContext = createContext(null);

// Admin email whitelist
const ADMIN_EMAILS = [
  'aminulislam004474@gmail.com',
  'shahsultanweb@gmail.com'
];

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Use a separate persistence key for admin to avoid conflicts
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Check if email is in admin whitelist
        if (ADMIN_EMAILS.includes(firebaseUser.email)) {
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            isAdmin: true
          };
          
          // Store admin session separately
          sessionStorage.setItem('adminUser', JSON.stringify(userData));
          setAdminUser(userData);
          setIsAuthenticated(true);
        } else {
          // Not an admin, clear admin session
          sessionStorage.removeItem('adminUser');
          setAdminUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // Check if admin session exists in sessionStorage
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
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Verify email is in admin whitelist
      if (!ADMIN_EMAILS.includes(user.email)) {
        await signOut(auth);
        sessionStorage.removeItem('adminUser');
        throw new Error('Access Denied: Your email is not authorized for admin access.');
      }

      const userData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
        isAdmin: true
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

  const logout = async () => {
    try {
      // Only clear admin session, don't sign out from Firebase completely
      // This allows student session to remain active
      sessionStorage.removeItem('adminUser');
      setAdminUser(null);
      setIsAuthenticated(false);
      
      // Sign out from Firebase
      await signOut(auth);
    } catch (error) {
      console.error('Admin logout error:', error);
      // Even if signOut fails, clear local state
      sessionStorage.removeItem('adminUser');
      setAdminUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshAdminProfile = () => {
    if (auth.currentUser && ADMIN_EMAILS.includes(auth.currentUser.email)) {
      const userData = {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        name: auth.currentUser.displayName,
        photoURL: auth.currentUser.photoURL,
        isAdmin: true
      };
      sessionStorage.setItem('adminUser', JSON.stringify(userData));
      setAdminUser(userData);
      setIsAuthenticated(true);
    }
  };

  const value = {
    user: adminUser,
    loading,
    isAuthenticated,
    isAdmin: isAuthenticated, // If authenticated in admin context, they are admin
    loginWithGoogle,
    logout,
    refreshAdminProfile
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
