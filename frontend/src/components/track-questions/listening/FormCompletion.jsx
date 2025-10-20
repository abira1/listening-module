/**
 * Form Completion Component
 * Fill in form fields with information
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function FormCompletion({ question, onAnswer, onReview }) {
  const [answers, setAnswers] = useState({});
  const [isReview, setIsReview] = useState(false);

  const fields = question.fields || [];

  const handleFieldChange = (fieldId, value) => {
    setAnswers(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = () => {
    const allFilled = fields.every(field => answers[field.id]?.trim());
    if (allFilled) {
      onAnswer(answers);
    }
  };

  const handleReview = () => {
    setIsReview(true);
    if (onReview) {
      onReview();
    }
  };

  const allFilled = fields.every(field => answers[field.id]?.trim());

  return (
    <div className="space-y-6">
      {/* Question Text */}
      {question.text && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-800 text-lg">
            {question.text}
          </p>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        {fields.map((field, idx) => (
          <div key={field.id || idx} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}:
            </label>
            <Input
              type="text"
              value={answers[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              maxLength={field.maxLength}
              disabled={isReview}
              className="w-full"
            />
            {isReview && (
              <div className="text-sm text-green-700 font-medium">
                Correct: {field.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600">
          Completed: {Object.keys(answers).filter(k => answers[k]?.trim()).length} / {fields.length}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{
              width: `${(Object.keys(answers).filter(k => answers[k]?.trim()).length / fields.length) * 100}%`
            }}
          ></div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={handleReview}
          disabled={isReview}
        >
          Review
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!allFilled || isReview}
        >
          Submit Answer
        </Button>
      </div>
    </div>
  );
}

export default FormCompletion;

