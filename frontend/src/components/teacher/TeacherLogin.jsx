import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import './TeacherLogin.css';

export const TeacherLogin = () => {
  const navigate = useNavigate();
  const { loginWithCredentials, error: authError } = useTeacherAuth();
  
  const [teacherId, setTeacherId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!teacherId.trim()) {
        throw new Error('Please enter your Teacher ID');
      }
      if (!password.trim()) {
        throw new Error('Please enter your password');
      }

      await loginWithCredentials(teacherId, password);

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('teacher_remember_me', 'true');
        localStorage.setItem('teacher_id_saved', teacherId);
      } else {
        localStorage.removeItem('teacher_remember_me');
        localStorage.removeItem('teacher_id_saved');
      }

      navigate('/teacher/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load saved teacher ID if remember me was checked
  React.useEffect(() => {
    const rememberMe = localStorage.getItem('teacher_remember_me') === 'true';
    const savedTeacherId = localStorage.getItem('teacher_id_saved');
    
    if (rememberMe && savedTeacherId) {
      setTeacherId(savedTeacherId);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Teacher Login</h1>
          <p>Access your teacher dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          {authError && <div className="error-message">{authError}</div>}

          <div className="form-group">
            <label htmlFor="teacherId">Teacher ID</label>
            <input
              id="teacherId"
              type="text"
              placeholder="Enter your Teacher ID (e.g., TCH-ABC123)"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              disabled={loading}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="form-input"
            />
          </div>

          <div className="form-group checkbox">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
            />
            <label htmlFor="rememberMe">Remember me</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have a teacher account?{' '}
            <a href="/">Contact your administrator</a>
          </p>
          <p className="forgot-password">
            <a href="/">Forgot your password?</a>
          </p>
        </div>
      </div>

      <div className="login-info">
        <h2>Teacher Portal</h2>
        <ul>
          <li>Grade student submissions</li>
          <li>Provide feedback</li>
          <li>View analytics</li>
          <li>Manage your profile</li>
        </ul>
      </div>
    </div>
  );
};

