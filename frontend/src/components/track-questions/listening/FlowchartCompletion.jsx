/**
 * Flowchart Completion Component
 * Complete flowchart boxes with information
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';

export function FlowchartCompletion({ question, onAnswer, onReview }) {
  const [answers, setAnswers] = useState({});
  const [isReview, setIsReview] = useState(false);

  const boxes = question.boxes || [];
  const connections = question.connections || [];

  const handleBoxChange = (boxId, value) => {
    setAnswers(prev => ({
      ...prev,
      [boxId]: value
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

  // Find box position for layout
  const getBoxPosition = (idx) => {
    return {
      top: `${idx * 120}px`,
      left: '50%',
      transform: 'translateX(-50%)'
    };
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

      {/* Flowchart */}
      <div className="relative bg-gray-50 p-8 rounded-lg min-h-96">
        {boxes.map((box, idx) => {
          const isEditable = box.answer !== undefined && box.answer === null;
          const isStatic = !isEditable;

          return (
            <div
              key={box.id || idx}
              className="absolute"
              style={getBoxPosition(idx)}
            >
              {/* Box */}
              <div
                className={`
                  w-48 p-4 rounded-lg border-2 text-center
                  ${isStatic ? 'bg-white border-gray-400' : 'bg-blue-50 border-blue-400'}
                `}
              >
                {isStatic ? (
                  <p className="text-gray-700 font-medium">{box.text}</p>
                ) : (
                  <Input
                    type="text"
                    value={answers[box.id] || ''}
                    onChange={(e) => handleBoxChange(box.id, e.target.value)}
                    placeholder="Enter text"
                    disabled={isReview}
                    className="w-full text-center"
                  />
                )}
              </div>

              {/* Arrow to next box */}
              {idx < boxes.length - 1 && (
                <div className="flex justify-center mt-2">
                  <ChevronDown className="text-gray-400" size={24} />
                </div>
              )}
            </div>
          );
        })}
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

export default FlowchartCompletion;

