import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, RotateCcw, Eye, Download, Mail } from 'lucide-react';
import { BackendService } from '../../services/BackendService';
import AddStudentModal from './AddStudentModal';
import StudentDetailsModal from './StudentDetailsModal';
import CredentialsModal from './CredentialsModal';
import './LocalStudentManagement.css';

// Helper function to get full photo URL
const getPhotoUrl = (photoPath) => {
  if (!photoPath) return null;
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }
  if (photoPath.startsWith('/')) {
    return `http://localhost:8000${photoPath}`;
  }
  return `http://localhost:8000/uploads/student_photos/${photoPath}`;
};

// Helper function to get user initials
const getUserInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Component for student photo thumbnail in table
function StudentPhotoThumbnail({ photoPath, name }) {
  const [photoError, setPhotoError] = useState(false);
  const photoUrl = getPhotoUrl(photoPath);

  if (photoUrl && !photoError) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="student-thumbnail"
        crossOrigin="anonymous"
        onError={() => setPhotoError(true)}
      />
    );
  }

  return (
    <div className="student-avatar-small">
      <span>{getUserInitials(name)}</span>
    </div>
  );
}

export function LocalStudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newCredentials, setNewCredentials] = useState(null);

  useEffect(() => {
    loadStudents();
  }, [statusFilter]);

  const loadStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await BackendService.getAdminStudents(statusFilter === 'all' ? null : statusFilter);
      setStudents(response.students || []);
    } catch (err) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (formData) => {
    try {
      const response = await BackendService.addStudent(formData);
      setNewCredentials(response);
      setShowAddModal(false);
      setShowCredentialsModal(true);
      await loadStudents();
    } catch (err) {
      alert('Error adding student: ' + err.message);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    if (!window.confirm(`Change status to ${newStatus}?`)) return;
    
    try {
      await BackendService.updateStudentStatus(userId, newStatus);
      await loadStudents();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleRegenerateCredentials = async (userId) => {
    if (!window.confirm('Regenerate credentials? Student will need new credentials to login.')) return;
    
    try {
      const response = await BackendService.regenerateStudentCredentials(userId);
      setNewCredentials(response);
      setShowCredentialsModal(true);
    } catch (err) {
      alert('Error regenerating credentials: ' + err.message);
    }
  };

  const handleDeleteStudent = async (userId, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    
    try {
      await BackendService.deleteStudent(userId);
      await loadStudents();
    } catch (err) {
      alert('Error deleting student: ' + err.message);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    inactive: students.filter(s => s.status === 'inactive').length,
    suspended: students.filter(s => s.status === 'suspended').length
  };

  return (
    <div className="local-student-management">
      <div className="header">
        <h2>Student Management</h2>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" /> Add New Student
        </button>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card active">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card inactive">
          <div className="stat-value">{stats.inactive}</div>
          <div className="stat-label">Inactive</div>
        </div>
        <div className="stat-card suspended">
          <div className="stat-value">{stats.suspended}</div>
          <div className="stat-label">Suspended</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Name, email, or User ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="loading">Loading students...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : filteredStudents.length === 0 ? (
        <div className="empty">No students found</div>
      ) : (
        <div className="table-container">
          <table className="students-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Institute</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.user_id}>
                  <td className="photo-cell">
                    <StudentPhotoThumbnail
                      photoPath={student.photo_path}
                      name={student.name}
                    />
                  </td>
                  <td className="user-id">{student.user_id}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.institute}</td>
                  <td>
                    <span className={`status-badge ${student.status}`}>
                      {student.status}
                    </span>
                  </td>
                  <td>{new Date(student.created_at).toLocaleDateString()}</td>
                  <td className="actions">
                    <button
                      className="btn-icon"
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowDetailsModal(true);
                      }}
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleRegenerateCredentials(student.user_id)}
                      title="Regenerate Credentials"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleStatusChange(student.user_id, 
                        student.status === 'active' ? 'inactive' : 'active')}
                      title="Toggle Status"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDeleteStudent(student.user_id, student.name)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddStudent}
        />
      )}

      {showDetailsModal && selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {showCredentialsModal && newCredentials && (
        <CredentialsModal
          credentials={newCredentials}
          onClose={() => {
            setShowCredentialsModal(false);
            setNewCredentials(null);
          }}
        />
      )}
    </div>
  );
}

export default LocalStudentManagement;

