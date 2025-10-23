import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Loader2, ShieldAlert, Lock, User } from 'lucide-react';

export function AdminLogin() {
  const navigate = useNavigate();
  const { loginWithCredentials, isAuthenticated, user, loading: authLoading } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If authenticated as admin, redirect to admin dashboard
    if (isAuthenticated && !authLoading) {
      navigate('/admin');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      if (!username.trim() || !password.trim()) {
        throw new Error('Please enter both username and password');
      }

      await loginWithCredentials(username, password);
      // useEffect will handle navigation if successful
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
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Local Authentication - 100% Offline
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={processing}
                  className="appearance-none rounded-t-md relative w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:bg-gray-100"
                  placeholder="Username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={processing}
                  className="appearance-none rounded-b-md relative w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:bg-gray-100"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="text-center mt-6 text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
            <p className="font-semibold text-gray-900">Demo Credentials:</p>
            <p className="mt-1 font-mono text-xs">Username: <span className="text-blue-600">admin</span></p>
            <p className="font-mono text-xs">Password: <span className="text-blue-600">admin123</span></p>
          </div>
        </form>

        <div className="text-center mt-4">
          <a href="/" className="text-blue-600 hover:underline text-sm">
            Return to main site
          </a>
        </div>
      </div>
    </div>
  );
}