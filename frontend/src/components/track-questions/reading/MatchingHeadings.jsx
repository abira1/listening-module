/**
 * Matching Headings Component
 * Match paragraph headings to paragraphs
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

export function MatchingHeadings({ question, onAnswer, onReview }) {
  const [answers, setAnswers] = useState({});
  const [isReview, setIsReview] = useState(false);

  const headings = question.headings || [];
  const paragraphs = question.paragraphs || [];

  const handleHeadingSelect = (paragraphId, heading) => {
    setAnswers(prev => ({
      ...prev,
      [paragraphId]: heading
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

  const allMatched = paragraphs.every(p => answers[p.id]);

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

      {/* Headings Reference */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm font-semibold text-gray-700 mb-3">Available Headings:</p>
        <div className="space-y-2">
          {headings.map((heading, idx) => (
            <div key={idx} className="text-sm text-gray-700">
              <span className="font-medium">{idx + 1}.</span> {heading}
            </div>
          ))}
        </div>
      </div>

      {/* Paragraphs with Matching */}
      <div className="space-y-4">
        {paragraphs.map((paragraph, idx) => (
          <div key={paragraph.id || idx} className="border border-gray-300 rounded-lg p-4">
            {/* Paragraph Text */}
            <div className="mb-4 text-gray-700 text-sm leading-relaxed">
              {paragraph.text}
            </div>

            {/* Heading Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Heading:
              </label>
              <Select
                value={answers[paragraph.id] || ''}
                onValueChange={(value) => handleHeadingSelect(paragraph.id, value)}
                disabled={isReview}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a heading..." />
                </SelectTrigger>
                <SelectContent>
                  {headings.map((heading, hIdx) => (
                    <SelectItem key={hIdx} value={heading}>
                      {hIdx + 1}. {heading}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Review Mode */}
              {isReview && (
                <div className="text-sm text-green-700 font-medium">
                  Correct: {question.matches?.[paragraph.id]}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600">
          Matched: {Object.keys(answers).length} / {paragraphs.length}
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

export default MatchingHeadings;

