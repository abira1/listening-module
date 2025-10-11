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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <Header />
      
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-16 md:py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-amber-400 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="mb-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-400 text-blue-900 px-6 py-2 rounded-full font-semibold mb-6 shadow-lg">
              <span className="w-2 h-2 bg-blue-900 rounded-full animate-pulse"></span>
              Premium IELTS Preparation Platform
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Shah Sultan's IELTS Academy
            </h1>
            <p className="text-2xl md:text-3xl text-amber-400 font-semibold mb-4">
              Complete IELTS Preparation
            </p>
            <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Master all four IELTS skills with authentic test materials, expert guidance, and comprehensive mock tests
            </p>
          </div>
          
          <button
            onClick={() => navigate('/student')}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-900 font-bold text-lg px-10 py-5 rounded-xl shadow-2xl hover:shadow-amber-400/50 transition-all duration-300 transform hover:scale-105"
          >
            <BookOpenIcon className="w-6 h-6" />
            Start Your Journey
          </button>
          
          <p className="mt-6 text-sm text-blue-200">
            Sign in with Google to access premium IELTS mock tests
          </p>

          {/* Test Type Badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-12">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-lg flex items-center gap-2">
              <HeadphonesIcon className="w-5 h-5 text-amber-400" />
              <span className="font-semibold">Listening</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-lg flex items-center gap-2">
              <BookIcon className="w-5 h-5 text-amber-400" />
              <span className="font-semibold">Reading</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-lg flex items-center gap-2">
              <PenToolIcon className="w-5 h-5 text-amber-400" />
              <span className="font-semibold">Writing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              Why Choose Shah Sultan's IELTS Academy?
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive preparation with proven results
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-2xl transition-shadow">
                <BookOpenIcon className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">
                Authentic Mock Tests
              </h3>
              <p className="text-gray-600">
                Practice with real IELTS format tests covering all question types
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-2xl transition-shadow">
                <ClockIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">
                Timed Practice
              </h3>
              <p className="text-gray-600">
                Experience real exam conditions with accurate timing and pacing
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-2xl transition-shadow">
                <CheckCircleIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">
                Instant Results
              </h3>
              <p className="text-gray-600">
                Get immediate feedback with automated scoring and detailed reports
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-2xl transition-shadow">
                <BarChartIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">
                Progress Tracking
              </h3>
              <p className="text-gray-600">
                Monitor your improvement with detailed performance analytics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              Your Path to IELTS Success
            </h2>
            <p className="text-xl text-gray-600">
              Four simple steps to master IELTS
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-start gap-6 bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-900 to-blue-700 text-amber-400 rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold text-blue-900 mb-2">Sign In with Google</h3>
                <p className="text-gray-600 text-lg">Quick and secure authentication - no password needed</p>
              </div>
            </div>

            <div className="flex items-start gap-6 bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold text-blue-900 mb-2">Choose Your Mock Test</h3>
                <p className="text-gray-600 text-lg">Select from Listening, Reading, or Writing practice tests</p>
              </div>
            </div>

            <div className="flex items-start gap-6 bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold text-blue-900 mb-2">Take the Test</h3>
                <p className="text-gray-600 text-lg">Experience real exam conditions with timed practice</p>
              </div>
            </div>

            <div className="flex items-start gap-6 bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg">
                4
              </div>
              <div>
                <h3 className="text-2xl font-bold text-blue-900 mb-2">Track Your Progress</h3>
                <p className="text-gray-600 text-lg">Review your results and monitor your improvement over time</p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <button
              onClick={() => navigate('/student')}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white font-bold text-lg px-10 py-5 rounded-xl shadow-2xl hover:shadow-blue-900/50 transition-all duration-300 transform hover:scale-105"
            >
              <TrophyIcon className="w-6 h-6" />
              Begin Your Preparation
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <img
              src="https://customer-assets.emergentagent.com/job_ce28ff48-be0c-4e05-8c09-33992c069cda/artifacts/xkwz06jy_Shah-Sultan-Logo-2.png"
              alt="Shah Sultan's IELTS Academy"
              className="h-16 mx-auto mb-4 filter brightness-0 invert"
            />
            <h3 className="text-2xl font-bold text-amber-400 mb-2">Shah Sultan's IELTS Academy</h3>
            <p className="text-blue-200">Your trusted partner for IELTS success</p>
          </div>
          
          <div className="border-t border-blue-700 pt-8 text-center">
            <p className="text-blue-300 text-sm">
              © 2024 Shah Sultan's IELTS Academy. All rights reserved. | Empowering students to achieve their dreams.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
