import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import './AddStudentModal.css';

export function AddStudentModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile_number: '',
    institute: '',
    department: '',
    roll_number: '',
    photo: null
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        photo: file
      }));
      
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Student name is required');
      return;
    }
    if (!formData.mobile_number.trim()) {
      setError('Mobile number is required');
      return;
    }
    if (!formData.institute.trim()) {
      setError('Institute is required');
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('mobile_number', formData.mobile_number);
      submitData.append('institute', formData.institute);
      submitData.append('department', formData.department);
      submitData.append('roll_number', formData.roll_number);
      if (formData.photo) {
        submitData.append('photo', formData.photo);
      }

      await onSubmit(submitData);
    } catch (err) {
      setError(err.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content add-student-modal">
        <div className="modal-header">
          <h3>Add New Student</h3>
          <button className="btn-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-student-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>Student Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="student@example.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Mobile Number *</label>
              <input
                type="tel"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleInputChange}
                placeholder="+92-300-1234567"
                required
              />
            </div>
            <div className="form-group">
              <label>Institute *</label>
              <input
                type="text"
                name="institute"
                value={formData.institute}
                onChange={handleInputChange}
                placeholder="University/School name"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="e.g., Computer Science"
              />
            </div>
            <div className="form-group">
              <label>Roll Number</label>
              <input
                type="text"
                name="roll_number"
                value={formData.roll_number}
                onChange={handleInputChange}
                placeholder="e.g., CS2024001"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Student Photo (Optional)</label>
            <div className="photo-upload">
              {photoPreview ? (
                <div className="photo-preview">
                  <img src={photoPreview} alt="Preview" />
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => {
                      setPhotoPreview(null);
                      setFormData(prev => ({ ...prev, photo: null }));
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="upload-label">
                  <Upload className="w-6 h-6" />
                  <span>Click to upload photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Generate Credentials'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStudentModal;

