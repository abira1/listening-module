/**
 * Map Labelling Component
 * Label locations on a map image
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function MapLabelling({ question, onAnswer, onReview }) {
  const [answers, setAnswers] = useState({});
  const [isReview, setIsReview] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(null);

  const image = question.image || '';
  const labels = question.labels || [];

  const handleLabelChange = (labelId, value) => {
    setAnswers(prev => ({
      ...prev,
      [labelId]: value
    }));
  };

  const handleSubmit = () => {
    onAnswer(answers);
  };

  const handleReview = () => {
    setIsReview(true);
    if (onReview) {
      onReview();
    }
  };

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

      {/* Map Container */}
      <div className="space-y-4">
        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
          {/* Map Image */}
          {image && (
            <img
              src={image}
              alt="Map"
              className="w-full h-auto"
            />
          )}

          {/* Label Points */}
          {labels.map((label, idx) => (
            <div
              key={label.id || idx}
              className="absolute"
              style={{
                left: `${label.x}px`,
                top: `${label.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <button
                onClick={() => setSelectedLabel(label.id)}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold
                  ${selectedLabel === label.id ? 'bg-red-600' : 'bg-blue-600'}
                  hover:bg-blue-700 transition-colors
                `}
              >
                {idx + 1}
              </button>
            </div>
          ))}
        </div>

        {/* Label Input Fields */}
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-semibold text-gray-700">Label Locations:</p>
          {labels.map((label, idx) => (
            <div
              key={label.id || idx}
              className={`
                p-3 rounded border-2 transition-colors
                ${selectedLabel === label.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
              `}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </div>
                <Input
                  type="text"
                  value={answers[label.id] || ''}
                  onChange={(e) => handleLabelChange(label.id, e.target.value)}
                  placeholder={`Label for location ${idx + 1}`}
                  disabled={isReview}
                  className="flex-1"
                />
              </div>
              {isReview && (
                <div className="text-sm text-green-700 font-medium mt-2">
                  Correct: {label.answer}
                </div>
              )}
            </div>
          ))}
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
          disabled={isReview}
        >
          Submit Answer
        </Button>
      </div>
    </div>
  );
}

export default MapLabelling;

