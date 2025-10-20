/**
 * Matching Endings Component
 * Match sentence beginnings to endings
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

export function MatchingEndings({ question, onAnswer, onReview }) {
  const [answers, setAnswers] = useState({});
  const [isReview, setIsReview] = useState(false);

  const beginnings = question.beginnings || [];
  const endings = question.endings || [];

  const handleEndingSelect = (beginningId, ending) => {
    setAnswers(prev => ({
      ...prev,
      [beginningId]: ending
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

  const allMatched = beginnings.every(b => answers[b.id || b]);

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

      {/* Endings Reference */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm font-semibold text-gray-700 mb-3">Available Endings:</p>
        <div className="space-y-2">
          {endings.map((ending, idx) => (
            <div key={idx} className="text-sm text-gray-700">
              <span className="font-medium">{idx + 1}.</span> {ending}
            </div>
          ))}
        </div>
      </div>

      {/* Beginnings with Ending Matching */}
      <div className="space-y-4">
        {beginnings.map((beginning, idx) => {
          const beginningId = beginning.id || beginning;
          return (
            <div key={beginningId} className="border border-gray-300 rounded-lg p-4">
              {/* Beginning Text */}
              <div className="mb-4">
                <p className="text-gray-700">
                  <span className="font-medium">{idx + 1}.</span> {beginning.text || beginning}
                </p>
              </div>

              {/* Ending Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Ending:
                </label>
                <Select
                  value={answers[beginningId] || ''}
                  onValueChange={(value) => handleEndingSelect(beginningId, value)}
                  disabled={isReview}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose an ending..." />
                  </SelectTrigger>
                  <SelectContent>
                    {endings.map((ending, eIdx) => (
                      <SelectItem key={eIdx} value={ending}>
                        {eIdx + 1}. {ending}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Review Mode */}
                {isReview && (
                  <div className="text-sm text-green-700 font-medium">
                    Correct: {question.matches?.[beginningId]}
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
          Matched: {Object.keys(answers).length} / {beginnings.length}
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

export default MatchingEndings;

