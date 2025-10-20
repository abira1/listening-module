/**
 * Matching Features Component
 * Match features/characteristics to items
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function MatchingFeatures({ question, onAnswer, onReview }) {
  const [answers, setAnswers] = useState({});
  const [isReview, setIsReview] = useState(false);

  const features = question.features || [];
  const items = question.items || [];

  const handleFeatureSelect = (itemId, feature) => {
    setAnswers(prev => ({
      ...prev,
      [itemId]: feature
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

  const allMatched = items.every(item => answers[item.id || item]);

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

      {/* Features Reference */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm font-semibold text-gray-700 mb-3">Available Features:</p>
        <div className="space-y-2">
          {features.map((feature, idx) => (
            <div key={idx} className="text-sm text-gray-700">
              <span className="font-medium">{String.fromCharCode(65 + idx)}.</span> {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Items with Feature Matching */}
      <div className="space-y-4">
        {items.map((item, idx) => {
          const itemId = item.id || item;
          return (
            <div key={itemId} className="border border-gray-300 rounded-lg p-4">
              {/* Item Name */}
              <div className="mb-4">
                <p className="text-gray-700 font-medium">{item.name || item}</p>
              </div>

              {/* Feature Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Feature:
                </label>
                <Select
                  value={answers[itemId] || ''}
                  onValueChange={(value) => handleFeatureSelect(itemId, value)}
                  disabled={isReview}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a feature..." />
                  </SelectTrigger>
                  <SelectContent>
                    {features.map((feature, fIdx) => (
                      <SelectItem key={fIdx} value={feature}>
                        {String.fromCharCode(65 + fIdx)}. {feature}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Review Mode */}
                {isReview && (
                  <div className="text-sm text-green-700 font-medium">
                    Correct: {question.matches?.[itemId]}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600">
          Matched: {Object.keys(answers).length} / {items.length}
        </p>
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
          disabled={!allMatched || isReview}
        >
          Submit Answer
        </Button>
      </div>
    </div>
  );
}

export default MatchingFeatures;

