import React, { useState } from 'react';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import './TeacherProfile.css';

export const TeacherProfile = () => {
  const { teacher, changePassword } = useTeacherAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (!currentPassword) {
        throw new Error('Please enter your current password');
      }
      if (!newPassword) {
        throw new Error('Please enter a new password');
      }
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      await changePassword(currentPassword, newPassword);
      setMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!teacher) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="teacher-profile">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your account and settings</p>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Information
        </button>
        <button
          className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Change Password
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="profile-info">
              {teacher.photo_path && (
                <div className="profile-photo">
                  <img
                    src={`http://localhost:8000${teacher.photo_path}`}
                    alt={teacher.full_name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/128?text=Teacher';
                    }}
                  />
                </div>
              )}

              <div className="info-grid">
                <div className="info-item">
                  <label>Teacher ID</label>
                  <p className="read-only">{teacher.teacher_id}</p>
                </div>

                <div className="info-item">
                  <label>Full Name</label>
                  <p>{teacher.full_name}</p>
                </div>

                <div className="info-item">
                  <label>Email</label>
                  <p>{teacher.email}</p>
                </div>

                <div className="info-item">
                  <label>Phone Number</label>
                  <p>{teacher.phone_number || 'Not provided'}</p>
                </div>

                <div className="info-item">
                  <label>Subject/Department</label>
                  <p>{teacher.subject || 'Not specified'}</p>
                </div>

                <div className="info-item">
                  <label>Status</label>
                  <p className={`status ${teacher.status}`}>
                    {teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)}
                  </p>
                </div>

                <div className="info-item">
                  <label>Account Created</label>
                  <p>{new Date(teacher.created_at).toLocaleDateString()}</p>
                </div>

                {teacher.last_login && (
                  <div className="info-item">
                    <label>Last Login</label>
                    <p>{new Date(teacher.last_login).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {teacher.bio && (
                <div className="bio-section">
                  <label>Bio</label>
                  <p>{teacher.bio}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="password-section">
            <h3>Change Your Password</h3>
            <p className="section-description">
              Enter your current password and choose a new one
            </p>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleChangePassword} className="password-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={loading}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

