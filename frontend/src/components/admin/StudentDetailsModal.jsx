import React, { useState } from 'react';
import { X } from 'lucide-react';
import './StudentDetailsModal.css';

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

export function StudentDetailsModal({ student, onClose }) {
  const [photoError, setPhotoError] = useState(false);
  const photoUrl = getPhotoUrl(student.photo_path);

  return (
    <div className="modal-overlay">
      <div className="modal-content student-details-modal">
        <div className="modal-header">
          <h3>Student Details</h3>
          <button className="btn-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="details-content">
          {photoUrl && !photoError ? (
            <div className="photo-section">
              <img
                src={photoUrl}
                alt={student.name}
                className="student-photo"
                crossOrigin="anonymous"
                onError={() => setPhotoError(true)}
              />
            </div>
          ) : (
            <div className="photo-section">
              <div className="student-avatar-large">
                <span>{getUserInitials(student.name)}</span>
              </div>
            </div>
          )}

          <div className="details-grid">
            <div className="detail-item">
              <label>User ID</label>
              <div className="value">{student.user_id}</div>
            </div>

            <div className="detail-item">
              <label>Registration Number</label>
              <div className="value">{student.registration_number}</div>
            </div>

            <div className="detail-item">
              <label>Full Name</label>
              <div className="value">{student.name}</div>
            </div>

            <div className="detail-item">
              <label>Email</label>
              <div className="value">{student.email || 'N/A'}</div>
            </div>

            <div className="detail-item">
              <label>Mobile Number</label>
              <div className="value">{student.mobile_number || 'N/A'}</div>
            </div>

            <div className="detail-item">
              <label>Institute</label>
              <div className="value">{student.institute}</div>
            </div>

            <div className="detail-item">
              <label>Department</label>
              <div className="value">{student.department || 'N/A'}</div>
            </div>

            <div className="detail-item">
              <label>Roll Number</label>
              <div className="value">{student.roll_number || 'N/A'}</div>
            </div>

            <div className="detail-item">
              <label>Status</label>
              <div className={`value status-badge ${student.status}`}>
                {student.status}
              </div>
            </div>

            <div className="detail-item">
              <label>Created At</label>
              <div className="value">
                {new Date(student.created_at).toLocaleString()}
              </div>
            </div>

            <div className="detail-item">
              <label>Last Login</label>
              <div className="value">
                {student.last_login 
                  ? new Date(student.last_login).toLocaleString()
                  : 'Never'}
              </div>
            </div>

            <div className="detail-item">
              <label>Created By</label>
              <div className="value">{student.created_by || 'System'}</div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDetailsModal;

