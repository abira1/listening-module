import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import './TeacherManagement.css';

export const TeacherManagement = () => {
  const { user: adminUser } = useAdminAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showPasswordReset, setShowPasswordReset] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Form state for adding/editing
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    subject: '',
    bio: '',
    photo: null,
  });

  // Fetch teachers
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/api/admin/teachers', {
        headers: {
          'X-Admin-Email': adminUser?.username || 'admin',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch teachers');
      }

      const data = await response.json();
      setTeachers(data.teachers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('full_name', formData.full_name);
      formDataObj.append('email', formData.email);
      formDataObj.append('phone_number', formData.phone_number);
      formDataObj.append('subject', formData.subject);
      formDataObj.append('bio', formData.bio);
      if (formData.photo) {
        formDataObj.append('photo', formData.photo);
      }

      const response = await fetch('http://localhost:8000/api/admin/teachers', {
        method: 'POST',
        headers: {
          'X-Admin-Email': adminUser?.username || 'admin',
        },
        body: formDataObj,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create teacher');
      }

      const data = await response.json();
      setMessage(`Teacher created successfully!\n\nTeacher ID: ${data.credentials.teacher_id}\nInitial Password: ${data.credentials.initial_password}\n\nPlease share these credentials with the teacher.`);
      
      // Reset form
      setFormData({
        full_name: '',
        email: '',
        phone_number: '',
        subject: '',
        bio: '',
        photo: null,
      });

      // Refresh teacher list
      await fetchTeachers();
      setActiveTab('list');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:8000/api/admin/teachers/${teacherId}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Email': adminUser?.username || 'admin',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete teacher');
      }

      setMessage('Teacher deleted successfully');
      setShowDeleteConfirm(null);
      await fetchTeachers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (teacherId) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:8000/api/admin/teachers/${teacherId}/reset-password`, {
        method: 'POST',
        headers: {
          'X-Admin-Email': adminUser?.username || 'admin',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      const data = await response.json();
      setNewPassword(data.new_password);
      setMessage(`Password reset successfully!\n\nNew Password: ${data.new_password}\n\nPlease share this with the teacher.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-management">
      <div className="management-header">
        <h1>Teacher Management</h1>
        <p>Manage teacher accounts and credentials</p>
      </div>

      <div className="management-tabs">
        <button
          className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          Teachers List
        </button>
        <button
          className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          Add New Teacher
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {message && (
        <div className="success-message">
          {message.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      <div className="management-content">
        {activeTab === 'list' && (
          <div className="teachers-list">
            {loading ? (
              <div className="loading">Loading teachers...</div>
            ) : teachers.length === 0 ? (
              <div className="empty-state">
                <p>No teachers found</p>
                <button onClick={() => setActiveTab('add')} className="add-button">
                  Add First Teacher
                </button>
              </div>
            ) : (
              <div className="teachers-table">
                <table>
                  <thead>
                    <tr>
                      <th>Teacher ID</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((teacher) => (
                      <tr key={teacher.teacher_id}>
                        <td className="teacher-id">{teacher.teacher_id}</td>
                        <td>{teacher.full_name}</td>
                        <td>{teacher.email}</td>
                        <td>{teacher.subject || '-'}</td>
                        <td>
                          <span className={`status-badge ${teacher.status}`}>
                            {teacher.status}
                          </span>
                        </td>
                        <td className="actions">
                          <button
                            className="action-button reset"
                            onClick={() => setShowPasswordReset(teacher.teacher_id)}
                            title="Reset Password"
                          >
                            🔑
                          </button>
                          <button
                            className="action-button delete"
                            onClick={() => setShowDeleteConfirm(teacher.teacher_id)}
                            title="Delete Teacher"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <div className="add-teacher-form">
            <h2>Add New Teacher</h2>
            <form onSubmit={handleAddTeacher}>
              <div className="form-group">
                <label htmlFor="full_name">Full Name *</label>
                <input
                  id="full_name"
                  type="text"
                  placeholder="Enter teacher's full name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter teacher's email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone_number">Phone Number</label>
                <input
                  id="phone_number"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject/Department</label>
                <input
                  id="subject"
                  type="text"
                  placeholder="Enter subject or department"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  placeholder="Enter teacher's bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={loading}
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="photo">Profile Photo</label>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, photo: e.target.files[0] })}
                  disabled={loading}
                />
              </div>

              <button type="submit" disabled={loading} className="submit-button">
                {loading ? 'Creating...' : 'Create Teacher'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Teacher?</h3>
            <p>Are you sure you want to delete this teacher? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowDeleteConfirm(null)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="delete-button"
                onClick={() => handleDeleteTeacher(showDeleteConfirm)}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordReset && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Reset Password?</h3>
            <p>Generate a new password for this teacher?</p>
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => {
                  setShowPasswordReset(null);
                  setNewPassword('');
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="reset-button"
                onClick={() => handleResetPassword(showPasswordReset)}
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

