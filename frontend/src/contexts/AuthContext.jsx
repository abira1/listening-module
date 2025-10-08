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
      if (firebaseUser) {
        try {
          // Check if user is admin - reject admin emails from student context
          const adminStatus = FirebaseAuthService.isAdminEmail(firebaseUser.email);
          
          if (adminStatus) {
            // Admin users should not be in student context
            // Check if there's a stored student session
            const storedStudent = sessionStorage.getItem('studentUser');
            if (!storedStudent) {
              setUser(null);
              setIsAuthenticated(false);
              setIsAdmin(false);
              setLoading(false);
              return;
            }
          }

          // Get student profile from Firebase
          let userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            isAdmin: false
          };

          // Get student profile
          const profile = await FirebaseAuthService.getStudentProfile(firebaseUser.uid);
          if (profile) {
            userData = { ...userData, ...profile };
          } else {
            // Create basic profile for new user
            userData.profileCompleted = false;
          }

          // Store student session separately from admin
          sessionStorage.setItem('studentUser', JSON.stringify(userData));
          setUser(userData);
          setIsAuthenticated(true);
          setIsAdmin(false);
        } catch (error) {
          console.error('Error loading student profile:', error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            isAdmin: false,
            profileCompleted: false
          });
          setIsAuthenticated(true);
          setIsAdmin(false);
        }
      } else {
        // Check if student session exists in sessionStorage
        const storedStudent = sessionStorage.getItem('studentUser');
        if (storedStudent) {
          try {
            const userData = JSON.parse(storedStudent);
            setUser(userData);
            setIsAuthenticated(true);
            setIsAdmin(false);
          } catch (error) {
            sessionStorage.removeItem('studentUser');
            setUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      }
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
      const userData = await FirebaseAuthService.signInWithGoogle();
      // Auth state change listener will handle the rest
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await FirebaseAuthService.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
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