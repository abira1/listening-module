/**
 * Exam Management Component
 * Handles exam creation, editing, and management
 * Part of Phase 4, Task 4.1
 */

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  FileText,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import * as examService from '../../services/examManagementService';
import ExamForm from './ExamForm';
import ExamPreview from './ExamPreview';
import './ExamManagement.css';

const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [editingExam, setEditingExam] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Load exams on mount
  useEffect(() => {
    loadExams();
  }, []);

  // Filter exams when search or filter changes
  useEffect(() => {
    filterExams();
  }, [exams, searchTerm, filterStatus]);

  const loadExams = async () => {
    setLoading(true);
    setError(null);
    const result = await examService.getAllExams();

    if (result.success) {
      setExams(result.data || []);
    } else {
      setError(result.error || 'Failed to load exams');
    }
    setLoading(false);
  };

  const filterExams = () => {
    let filtered = exams;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(exam => exam.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredExams(filtered);
  };

  const handleCreateExam = async (examData) => {
    const result = await examService.createExam(examData);

    if (result.success) {
      setSuccessMessage('Exam created successfully');
      setShowForm(false);
      loadExams();
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setError(result.error);
    }
  };

  const handleUpdateExam = async (examData) => {
    const result = await examService.updateExam(editingExam.id, examData);

    if (result.success) {
      setSuccessMessage('Exam updated successfully');
      setShowForm(false);
      setEditingExam(null);
      loadExams();
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setError(result.error);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) {
      return;
    }

    const result = await examService.deleteExam(examId);

    if (result.success) {
      setSuccessMessage('Exam deleted successfully');
      loadExams();
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setError(result.error);
    }
  };

  const handlePublishExam = async (examId) => {
    const result = await examService.publishExam(examId);

    if (result.success) {
      setSuccessMessage('Exam published successfully');
      loadExams();
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setError(result.error);
    }
  };

  const handleUnpublishExam = async (examId) => {
    const result = await examService.unpublishExam(examId);

    if (result.success) {
      setSuccessMessage('Exam unpublished successfully');
      loadExams();
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setError(result.error);
    }
  };

  const handleDuplicateExam = async (exam) => {
    const newTitle = `${exam.title} (Copy)`;
    const result = await examService.duplicateExam(exam.id, newTitle);

    if (result.success) {
      setSuccessMessage('Exam duplicated successfully');
      loadExams();
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setError(result.error);
    }
  };

  const handleExportExam = async (examId) => {
    const result = await examService.exportExamData(examId, 'json');

    if (result.success) {
      const dataStr = JSON.stringify(result.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `exam-${examId}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      setError(result.error);
    }
  };

  const handleEditExam = (exam) => {
    setEditingExam(exam);
    setShowForm(true);
  };

  const handlePreviewExam = (exam) => {
    setSelectedExam(exam);
    setShowPreview(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingExam(null);
  };

  if (loading) {
    return <div className="exam-management loading">Loading exams...</div>;
  }

  return (
    <div className="exam-management">
      {/* Header */}
      <div className="exam-management-header">
        <h1>Exam Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <Plus size={20} />
          Create Exam
        </button>
      </div>

      {/* Messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {/* Search and Filter */}
      <div className="exam-management-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <Filter size={20} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Exams Table */}
      <div className="exams-table-container">
        {filteredExams.length === 0 ? (
          <div className="no-exams">
            <FileText size={48} />
            <p>No exams found</p>
          </div>
        ) : (
          <table className="exams-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Questions</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExams.map((exam) => (
                <tr key={exam.id}>
                  <td className="exam-title">{exam.title}</td>
                  <td>
                    <span className={`status-badge status-${exam.status}`}>
                      {exam.status}
                    </span>
                  </td>
                  <td>
                    <Clock size={16} />
                    {exam.duration} min
                  </td>
                  <td>{exam.questionCount || 0}</td>
                  <td>{new Date(exam.createdAt).toLocaleDateString()}</td>
                  <td className="exam-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handlePreviewExam(exam)}
                      title="Preview"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleEditExam(exam)}
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleDuplicateExam(exam)}
                      title="Duplicate"
                    >
                      <Copy size={18} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleExportExam(exam.id)}
                      title="Export"
                    >
                      <Download size={18} />
                    </button>
                    {exam.status === 'draft' ? (
                      <button
                        className="btn-icon"
                        onClick={() => handlePublishExam(exam.id)}
                        title="Publish"
                      >
                        <Eye size={18} />
                      </button>
                    ) : (
                      <button
                        className="btn-icon"
                        onClick={() => handleUnpublishExam(exam.id)}
                        title="Unpublish"
                      >
                        <EyeOff size={18} />
                      </button>
                    )}
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => handleDeleteExam(exam.id)}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Exam Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ExamForm
              exam={editingExam}
              onSubmit={editingExam ? handleUpdateExam : handleCreateExam}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      {/* Exam Preview Modal */}
      {showPreview && selectedExam && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ExamPreview
              exam={selectedExam}
              onClose={() => setShowPreview(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamManagement;

