/**
 * Exam Form Component
 * Form for creating and editing exams
 * Part of Phase 4, Task 4.1
 */

import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import * as examService from '../../services/examManagementService';
import './ExamForm.css';

const ExamForm = ({ exam, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 180,
    totalScore: 100,
    passingScore: 60,
    instructions: '',
    category: '',
    difficulty: 'medium',
    tags: [],
    showAnswers: false,
    randomizeQuestions: false,
    randomizeOptions: false,
    allowReview: true,
    allowNavigation: true,
    showTimer: true,
    showProgress: true
  });

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (exam) {
      setFormData(exam);
    }
  }, [exam]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    // Validate form data
    const validation = examService.validateExamData(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      setLoading(false);
      return;
    }

    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <div className="exam-form">
      <div className="exam-form-header">
        <h2>{exam ? 'Edit Exam' : 'Create New Exam'}</h2>
        <button className="btn-close" onClick={onCancel}>
          <X size={24} />
        </button>
      </div>

      {errors.length > 0 && (
        <div className="form-errors">
          {errors.map((error, idx) => (
            <div key={idx} className="error-item">
              <AlertCircle size={18} />
              {error}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="exam-form-content">
        {/* Basic Information */}
        <fieldset>
          <legend>Basic Information</legend>

          <div className="form-group">
            <label htmlFor="title">Exam Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter exam title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter exam description"
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="e.g., IELTS, TOEFL"
              />
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <div className="tag-input">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add tags and press Enter"
              />
              <button type="button" onClick={handleAddTag}>Add</button>
            </div>
            <div className="tags-list">
              {formData.tags.map(tag => (
                <span key={tag} className="tag">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </fieldset>

        {/* Exam Settings */}
        <fieldset>
          <legend>Exam Settings</legend>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Duration (minutes) *</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="totalScore">Total Score *</label>
              <input
                type="number"
                id="totalScore"
                name="totalScore"
                value={formData.totalScore}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="passingScore">Passing Score *</label>
              <input
                type="number"
                id="passingScore"
                name="passingScore"
                value={formData.passingScore}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="instructions">Instructions</label>
            <textarea
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleInputChange}
              placeholder="Enter exam instructions"
              rows="4"
            />
          </div>
        </fieldset>

        {/* Display Options */}
        <fieldset>
          <legend>Display Options</legend>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="showAnswers"
                checked={formData.showAnswers}
                onChange={handleInputChange}
              />
              Show Answers After Submission
            </label>

            <label>
              <input
                type="checkbox"
                name="randomizeQuestions"
                checked={formData.randomizeQuestions}
                onChange={handleInputChange}
              />
              Randomize Questions
            </label>

            <label>
              <input
                type="checkbox"
                name="randomizeOptions"
                checked={formData.randomizeOptions}
                onChange={handleInputChange}
              />
              Randomize Options
            </label>

            <label>
              <input
                type="checkbox"
                name="allowReview"
                checked={formData.allowReview}
                onChange={handleInputChange}
              />
              Allow Review
            </label>

            <label>
              <input
                type="checkbox"
                name="allowNavigation"
                checked={formData.allowNavigation}
                onChange={handleInputChange}
              />
              Allow Navigation
            </label>

            <label>
              <input
                type="checkbox"
                name="showTimer"
                checked={formData.showTimer}
                onChange={handleInputChange}
              />
              Show Timer
            </label>

            <label>
              <input
                type="checkbox"
                name="showProgress"
                checked={formData.showProgress}
                onChange={handleInputChange}
              />
              Show Progress
            </label>
          </div>
        </fieldset>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : exam ? 'Update Exam' : 'Create Exam'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExamForm;

