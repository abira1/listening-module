import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { ClockIcon, BookOpenIcon, TrophyIcon, BarChartIcon, HeadphonesIcon, CheckCircleIcon, PenToolIcon, BookIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Homepage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Redirect authenticated users to their dashboard
    if (isAuthenticated && !loading) {
      navigate('/student/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Shah Sultan's IELTS Academy
            </h1>
            <p className="text-2xl text-blue-700 font-medium mb-6">
              Complete IELTS Preparation
            </p>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
              Master Listening, Reading, and Writing with authentic mock tests and expert guidance
            </p>
          </div>
          
          <button
            onClick={() => navigate('/student')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg px-10 py-4 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <BookOpenIcon className="w-6 h-6" />
            Get Started
          </button>
          
          <p className="mt-6 text-sm text-gray-500">
            Sign in with Google to access mock tests
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Us?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BookOpenIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Authentic Tests
              </h3>
              <p className="text-gray-600 text-sm">
                Practice with real IELTS format tests
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Timed Practice
              </h3>
              <p className="text-gray-600 text-sm">
                Experience real exam conditions
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Instant Results
              </h3>
              <p className="text-gray-600 text-sm">
                Get immediate feedback
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChartIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Track Progress
              </h3>
              <p className="text-gray-600 text-sm">
                Monitor your improvement
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 text-sm">
            © 2024 Shah Sultan's IELTS Academy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
