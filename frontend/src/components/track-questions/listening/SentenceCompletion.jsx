/**
 * Sentence Completion Component
 * Complete sentences with words from a provided list
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SentenceCompletion({ question, onAnswer, onReview }) {
  const [answer, setAnswer] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredWords, setFilteredWords] = useState([]);
  const [isReview, setIsReview] = useState(false);

  const wordList = question.wordList || [];

  // Filter words based on input
  useEffect(() => {
    if (answer.trim()) {
      const filtered = wordList.filter(word =>
        word.toLowerCase().startsWith(answer.toLowerCase())
      );
      setFilteredWords(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredWords([]);
    }
  }, [answer, wordList]);

  const handleSelectWord = (word) => {
    setAnswer(word);
    setShowSuggestions(false);
  };

  const handleSubmit = () => {
    if (answer.trim()) {
      onAnswer(answer);
    }
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
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-gray-800 text-lg">
          {question.text}
        </p>
      </div>

      {/* Word List */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm font-semibold text-gray-700 mb-2">Available Words:</p>
        <div className="flex flex-wrap gap-2">
          {wordList.map((word, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700"
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Your Answer:
        </label>
        <div className="relative">
          <Input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type or select from suggestions..."
            className="w-full"
            disabled={isReview}
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && !isReview && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10">
              {filteredWords.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectWord(word)}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 text-sm"
                >
                  {word}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Mode */}
      {isReview && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm font-semibold text-green-800 mb-2">Correct Answer:</p>
          <p className="text-green-700">{question.correctAnswer}</p>
        </div>
      )}

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
          disabled={!answer.trim() || isReview}
        >
          Submit Answer
        </Button>
      </div>
    </div>
  );
}

export default SentenceCompletion;

