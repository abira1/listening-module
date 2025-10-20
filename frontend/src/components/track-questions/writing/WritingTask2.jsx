/**
 * Writing Task 2 Component
 * Academic writing task - essay writing
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function WritingTask2({ question, onAnswer, onReview }) {
  const [answer, setAnswer] = useState('');
  const [isReview, setIsReview] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const minWords = question.minWords || 250;
  const maxWords = question.maxWords || 400;

  // Calculate word count
  const calculateWordCount = (text) => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    setAnswer(text);
    setWordCount(calculateWordCount(text));
  };

  const handleSubmit = () => {
    if (wordCount >= minWords) {
      onAnswer(answer);
    }
  };

  const handleReview = () => {
    setIsReview(true);
    if (onReview) {
      onReview();
    }
  };

  const isValidLength = wordCount >= minWords;
  const isWarningLength = wordCount < minWords;

  return (
    <div className="space-y-6">
      {/* Task Title */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Writing Task 2</h3>
        <p className="text-gray-700 text-sm">
          Academic writing task - Essay writing
        </p>
      </div>

      {/* Task Prompt */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
        <p className="text-sm font-semibold text-gray-700 mb-2">Essay Question:</p>
        <p className="text-gray-700 text-sm leading-relaxed">
          {question.prompt}
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <p className="text-sm font-semibold text-yellow-800 mb-2">Instructions:</p>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Write at least {minWords} words</li>
          <li>• Write in formal academic style</li>
          <li>• Present a clear thesis statement</li>
          <li>• Support your arguments with examples</li>
          <li>• Write a conclusion</li>
          <li>• Check grammar and spelling</li>
        </ul>
      </div>

      {/* Text Area */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Your Essay:
        </label>
        <Textarea
          value={answer}
          onChange={handleTextChange}
          placeholder="Write your essay here..."
          disabled={isReview}
          className="w-full min-h-80"
        />
      </div>

      {/* Word Count */}
      <div className={`p-4 rounded-lg ${isWarningLength ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
        <div className="flex justify-between items-center">
          <p className={`text-sm font-medium ${isWarningLength ? 'text-red-800' : 'text-green-800'}`}>
            Word Count: {wordCount}
          </p>
          <p className={`text-sm ${isWarningLength ? 'text-red-700' : 'text-green-700'}`}>
            {isWarningLength ? `Need ${minWords - wordCount} more words` : 'Meets minimum requirement'}
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className={`h-2 rounded-full transition-all ${isWarningLength ? 'bg-red-500' : 'bg-green-500'}`}
            style={{
              width: `${Math.min((wordCount / minWords) * 100, 100)}%`
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
          disabled={!isValidLength || isReview}
        >
          Submit Answer
        </Button>
      </div>
    </div>
  );
}

export default WritingTask2;

