import React, { createContext, useContext, useState, useEffect } from 'react';
import FirebaseAuthService from '../services/FirebaseAuthService';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Subscribe to Firebase auth state changes - STUDENT ONLY
    const unsubscribe = FirebaseAuthService.onAuthStateChange(async (firebaseUser) => {
      console.log('[AuthContext] Auth state changed:', firebaseUser?.email);

      if (firebaseUser) {
        try {
          // Check if user is admin - reject admin emails from student context
          const adminStatus = FirebaseAuthService.isAdminEmail(firebaseUser.email);
          console.log('[AuthContext] Admin status:', adminStatus);

          if (adminStatus) {
            // Admin users should not be in student context
            console.log('[AuthContext] Admin user detected, rejecting from student context');
            setUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
            setLoading(false);
            return;
          }

          // Get student profile from Firebase
          let userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            isAdmin: false
          };

          console.log('[AuthContext] Fetching student profile...');
          // Get student profile
          const profile = await FirebaseAuthService.getStudentProfile(firebaseUser.uid);
          if (profile) {
            console.log('[AuthContext] Student profile found:', profile);
            userData = { ...userData, ...profile };
          } else {
            // Create basic profile for new user
            console.log('[AuthContext] No profile found, creating new one');
            userData.profileCompleted = false;
          }

          // Store student session separately from admin
          sessionStorage.setItem('studentUser', JSON.stringify(userData));
          console.log('[AuthContext] Setting user state:', userData);
          setUser(userData);
          setIsAuthenticated(true);
          setIsAdmin(false);
        } catch (error) {
          console.error('[AuthContext] Error loading student profile:', error);
          const fallbackUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            isAdmin: false,
            profileCompleted: false
          };
          console.log('[AuthContext] Using fallback user:', fallbackUser);
          setUser(fallbackUser);
          setIsAuthenticated(true);
          setIsAdmin(false);
        }
      } else {
        // Check if student session exists in sessionStorage
        console.log('[AuthContext] No Firebase user, checking sessionStorage');
        const storedStudent = sessionStorage.getItem('studentUser');
        if (storedStudent) {
          try {
            const userData = JSON.parse(storedStudent);
            console.log('[AuthContext] Restoring stored student:', userData);
            setUser(userData);
            setIsAuthenticated(true);
            setIsAdmin(false);
          } catch (error) {
            console.error('[AuthContext] Error parsing stored student:', error);
            sessionStorage.removeItem('studentUser');
            setUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
          }
        } else {
          console.log('[AuthContext] No stored student, clearing auth');
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      }
      console.log('[AuthContext] Setting loading to false');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time sync for student profile updates
  useEffect(() => {
    if (!user?.uid || isAdmin) return;

    const studentRef = ref(database, `students/${user.uid}`);
    const unsubscribe = onValue(studentRef, (snapshot) => {
      if (snapshot.exists()) {
        const updatedProfile = snapshot.val();
        console.log('Profile updated in AuthContext:', updatedProfile);
        setUser(prev => ({ ...prev, ...updatedProfile }));
      }
    });

    return () => unsubscribe();
  }, [user?.uid, isAdmin]);

  const loginWithGoogle = async () => {
    try {
      console.log('[AuthContext] Starting Google sign-in...');
      const userData = await FirebaseAuthService.signInWithGoogle();
      console.log('[AuthContext] Google sign-in successful:', userData);

      // Check if user is admin - they should use admin login instead
      const isAdmin = FirebaseAuthService.isAdminEmail(userData.email);
      if (isAdmin) {
        console.warn('[AuthContext] Admin user attempted student login');
        // Sign out the admin user
        await FirebaseAuthService.logout();
        throw new Error('Admin users must log in through the Admin Panel. Please visit /admin/login');
      }

      // Auth state change listener will handle the rest
      return userData;
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      console.error('[AuthContext] Error code:', error.code);
      console.error('[AuthContext] Error message:', error.message);

      // Handle specific Firebase auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was closed. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Sign-in popup was blocked. Please allow popups and try again.');
      } else if (error.code === 'auth/operation-not-supported-in-this-environment') {
        throw new Error('Sign-in is not supported in this environment.');
      }

      throw error;
    }
  };

  const logout = async () => {
    try {
      // Only clear student session, don't sign out from Firebase completely
      // This allows admin session to remain active
      sessionStorage.removeItem('studentUser');
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      
      // Sign out from Firebase
      await FirebaseAuthService.signOut();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      sessionStorage.removeItem('studentUser');
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      if (!user?.uid) throw new Error('No user logged in');
      
      const updatedProfile = await FirebaseAuthService.updateStudentProfile(
        user.uid,
        profileData
      );
      
      setUser(prev => ({ ...prev, ...updatedProfile }));
      return updatedProfile;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const completeProfile = async (profileData) => {
    try {
      if (!user?.uid) throw new Error('No user logged in');
      
      const completeData = {
        ...profileData,
        profileCompleted: true
      };
      
      const savedProfile = await FirebaseAuthService.saveStudentProfile(
        user.uid,
        completeData
      );
      
      setUser(prev => ({ ...prev, ...savedProfile }));
      return savedProfile;
    } catch (error) {
      console.error('Complete profile error:', error);
      throw error;
    }
  };

  const refreshUserProfile = async () => {
    try {
      if (!user?.uid) throw new Error('No user logged in');
      
      const profile = await FirebaseAuthService.getStudentProfile(user.uid);
      if (profile) {
        setUser(prev => ({ ...prev, ...profile }));
        return profile;
      }
      return user;
    } catch (error) {
      console.error('Refresh profile error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    loginWithGoogle,
    logout,
    updateUserProfile,
    completeProfile,
    refreshUserProfile
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