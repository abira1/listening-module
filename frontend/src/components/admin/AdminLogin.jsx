import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';

export function AdminLogin() {
  const navigate = useNavigate();
  const { loginWithGoogle, isAuthenticated, user, loading: authLoading } = useAdminAuth();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If authenticated and admin, redirect to admin dashboard
    if (isAuthenticated && isAdmin && !authLoading) {
      navigate('/admin');
    }
    
    // If authenticated but not admin, show error and redirect
    if (isAuthenticated && !isAdmin && !authLoading) {
      setError('Access Denied: Your email is not authorized for admin access.');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  const handleGoogleLogin = async () => {
    setProcessing(true);
    setError('');

    try {
      const userData = await loginWithGoogle();
      
      // Check if user is admin
      if (!userData.isAdmin) {
        setError('Access Denied: Your email is not authorized for admin access.');
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
      // If admin, useEffect will handle navigation
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err.message || 'Failed to sign in. Please try again.');
      setProcessing(false);
    }
  };

  if (authLoading || (processing && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700 text-lg">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img
            src="https://i.postimg.cc/FKx07M5m/ILTES.png"
            alt="IELTS Logo"
            className="mx-auto h-12"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-6">
          <button
            onClick={handleGoogleLogin}
            disabled={processing}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg px-6 py-4 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-gray-700 font-semibold text-lg">
              {processing ? 'Signing in...' : 'Sign in with Google'}
            </span>
          </button>

          <div className="text-center mt-6 text-sm text-gray-500">
            <p>Authorized admin emails:</p>
            <p className="mt-1 font-mono text-xs">aminulislam004474@gmail.com</p>
            <p className="font-mono text-xs">shahsultanweb@gmail.com</p>
          </div>
        </div>

        <div className="text-center mt-4">
          <a href="/" className="text-blue-600 hover:underline text-sm">
            Return to main site
          </a>
        </div>
      </div>
    </div>
  );
}