import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle, Loader } from 'lucide-react';
import { BackendService } from '../../services/BackendService';
import './LocalStudentLogin.css';

export function LocalStudentLogin() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const sessionToken = sessionStorage.getItem('studentSessionToken');
    if (sessionToken) {
      navigate('/student/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!userId.trim()) {
      setError('Please enter your User ID');
      return;
    }
    if (!registrationNumber.trim()) {
      setError('Please enter your Registration Number');
      return;
    }

    setLoading(true);
    try {
      const response = await BackendService.studentLogin(userId, registrationNumber);
      
      if (response.success) {
        // Store session token
        sessionStorage.setItem('studentSessionToken', response.session_token);
        sessionStorage.setItem('studentData', JSON.stringify(response.student));
        
        // Redirect to dashboard
        navigate('/student/dashboard');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUserId('');
    setRegistrationNumber('');
    setError('');
  };

  return (
    <div className="local-student-login">
      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="logo">
              <div className="logo-icon">📚</div>
            </div>
            <h1>IELTS Exam Platform</h1>
            <p>Student Login</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="login-form">
            {error && (
              <div className="error-alert">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {/* User ID Field */}
            <div className="form-group">
              <label htmlFor="userId">User ID</label>
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value.toUpperCase())}
                placeholder="e.g., STU-2025-001"
                disabled={loading}
                autoComplete="off"
              />
              <small>Format: STU-YYYY-###</small>
            </div>

            {/* Registration Number Field */}
            <div className="form-group">
              <label htmlFor="registrationNumber">Registration Number</label>
              <div className="password-input">
                <input
                  id="registrationNumber"
                  type={showPassword ? 'text' : 'password'}
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                  placeholder="e.g., REG-2025-001"
                  disabled={loading}
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <small>Format: REG-YYYY-###</small>
            </div>

            {/* Buttons */}
            <div className="form-actions">
              <button
                type="submit"
                className="btn-login"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Login
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn-clear"
                onClick={handleClear}
                disabled={loading}
              >
                Clear
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <p>Don't have credentials?</p>
            <p className="footer-text">
              Contact your institute administrator to get your User ID and Registration Number.
            </p>
          </div>
        </div>

        {/* Info Panel */}
        <div className="info-panel">
          <h3>ℹ️ How to Login</h3>
          <ol>
            <li>Enter your <strong>User ID</strong> (provided by admin)</li>
            <li>Enter your <strong>Registration Number</strong> (provided by admin)</li>
            <li>Click <strong>Login</strong> to access your dashboard</li>
          </ol>
          
          <div className="info-box">
            <h4>💡 Tips</h4>
            <ul>
              <li>Both fields are case-insensitive</li>
              <li>Keep your credentials safe</li>
              <li>Contact admin if you forget your credentials</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocalStudentLogin;

