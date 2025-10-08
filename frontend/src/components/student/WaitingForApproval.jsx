import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, CheckCircle, XCircle, RefreshCw, LogOut } from 'lucide-react';
import FirebaseAuthService from '../../services/FirebaseAuthService';
import { ref, onValue } from 'firebase/database';
import { database } from '../../config/firebase';

export function WaitingForApproval() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading, refreshUserProfile } = useAuth();
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState('pending');
  const isRedirecting = useRef(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/student');
      return;
    }

    if (user && !isRedirecting.current) {
      setStatus(user.status || 'pending');
      
      // If approved, redirect to dashboard
      if (user.status === 'approved') {
        isRedirecting.current = true;
        navigate('/student/dashboard', { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  // Real-time status monitoring
  useEffect(() => {
    if (!user?.uid || isRedirecting.current) return;

    // Set up real-time listener for student status
    const studentRef = ref(database, `students/${user.uid}/status`);
    
    const unsubscribe = onValue(studentRef, async (snapshot) => {
      if (snapshot.exists() && !isRedirecting.current) {
        const newStatus = snapshot.val();
        console.log('Status updated in real-time:', newStatus);
        setStatus(newStatus);
        
        // Automatically redirect to dashboard when approved
        if (newStatus === 'approved') {
          isRedirecting.current = true;
          
          try {
            // Update the user profile in AuthContext first
            await refreshUserProfile();
            
            // Show success message briefly
            setTimeout(() => {
              navigate('/student/dashboard', { replace: true });
            }, 1500);
          } catch (error) {
            console.error('Error refreshing profile:', error);
            // Fallback: redirect anyway
            setTimeout(() => {
              navigate('/student/dashboard', { replace: true });
            }, 1500);
          }
        }
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [user?.uid, refreshUserProfile, navigate]);

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      // Refresh user profile from Firebase
      const profile = await FirebaseAuthService.getStudentProfile(user.uid);
      
      if (profile && profile.status === 'approved') {
        setStatus('approved');
        // Refresh auth context
        window.location.href = '/student/dashboard';
      } else if (profile && profile.status === 'rejected') {
        setStatus('rejected');
      } else {
        setStatus('pending');
      }
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {status === 'pending' && (
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-12 h-12 text-yellow-600" />
              </div>
            )}
            {status === 'approved' && (
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            )}
            {status === 'rejected' && (
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
            )}
          </div>

          {/* Status Message */}
          <div className="text-center mb-8">
            {status === 'pending' && (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  Waiting for Approval
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  Your account is currently under review by our administrators.
                </p>
                <p className="text-gray-500">
                  You will receive access to the dashboard and exams once your account is approved.
                  This usually takes 24-48 hours.
                </p>
              </>
            )}
            {status === 'approved' && (
              <>
                <h1 className="text-3xl font-bold text-green-700 mb-3">
                  Account Approved!
                </h1>
                <p className="text-lg text-gray-600">
                  Your account has been approved. Redirecting to dashboard...
                </p>
              </>
            )}
            {status === 'rejected' && (
              <>
                <h1 className="text-3xl font-bold text-red-700 mb-3">
                  Account Not Approved
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  Unfortunately, your account registration was not approved.
                </p>
                <p className="text-gray-500">
                  Please contact the administrator for more information.
                </p>
              </>
            )}
          </div>

          {/* Student Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
              Your Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="text-sm font-medium text-gray-700 w-32">Name:</span>
                <span className="text-sm text-gray-900">{user?.name}</span>
              </div>
              <div className="flex items-start">
                <span className="text-sm font-medium text-gray-700 w-32">Email:</span>
                <span className="text-sm text-gray-900">{user?.email}</span>
              </div>
              <div className="flex items-start">
                <span className="text-sm font-medium text-gray-700 w-32">Phone:</span>
                <span className="text-sm text-gray-900">{user?.phoneNumber}</span>
              </div>
              <div className="flex items-start">
                <span className="text-sm font-medium text-gray-700 w-32">Institution:</span>
                <span className="text-sm text-gray-900">{user?.institution}</span>
              </div>
              {user?.department && (
                <div className="flex items-start">
                  <span className="text-sm font-medium text-gray-700 w-32">Department:</span>
                  <span className="text-sm text-gray-900">{user?.department}</span>
                </div>
              )}
              {user?.rollNumber && (
                <div className="flex items-start">
                  <span className="text-sm font-medium text-gray-700 w-32">Roll Number:</span>
                  <span className="text-sm text-gray-900">{user?.rollNumber}</span>
                </div>
              )}
              <div className="flex items-start pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700 w-32">Status:</span>
                <span className={`text-sm font-semibold ${
                  status === 'pending' ? 'text-yellow-600' :
                  status === 'approved' ? 'text-green-600' :
                  'text-red-600'
                }`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {status === 'pending' && (
              <button
                onClick={handleCheckStatus}
                disabled={checking}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-5 h-5 ${checking ? 'animate-spin' : ''}`} />
                {checking ? 'Checking...' : 'Check Approval Status'}
              </button>
            )}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

          {/* Help Text */}
          {status === 'pending' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Need help? Contact support at{' '}
                <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
                  support@example.com
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}