import React, { createContext, useContext, useState, useEffect } from 'react';
import FirebaseAuthService from '../services/FirebaseAuthService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = FirebaseAuthService.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check if user is admin
          const adminStatus = FirebaseAuthService.isAdminEmail(firebaseUser.email);
          setIsAdmin(adminStatus);

          // Get student profile from Firebase if not admin
          let userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            isAdmin: adminStatus
          };

          if (!adminStatus) {
            // Get student profile
            const profile = await FirebaseAuthService.getStudentProfile(firebaseUser.uid);
            if (profile) {
              userData = { ...userData, ...profile };
            } else {
              // Create basic profile for new user
              userData.profileCompleted = false;
            }
          }

          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error loading user profile:', error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            isAdmin: FirebaseAuthService.isAdminEmail(firebaseUser.email),
            profileCompleted: false
          });
          setIsAuthenticated(true);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    loginWithGoogle,
    logout,
    updateUserProfile,
    completeProfile
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