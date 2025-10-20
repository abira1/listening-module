/**
 * Summary Completion Component
 * Complete a summary with words from a list
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SummaryCompletion({ question, onAnswer, onReview }) {
  const [answer, setAnswer] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredWords, setFilteredWords] = useState([]);
  const [isReview, setIsReview] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);

  const wordList = question.wordList || [];
  const summary = question.summary || '';

  // Filter words based on input
  useEffect(() => {
    if (answer.trim()) {
      const filtered = wordList.filter(word =>
        word.toLowerCase().startsWith(answer.toLowerCase()) &&
        !selectedWords.includes(word)
      );
      setFilteredWords(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredWords([]);
    }
  }, [answer, wordList, selectedWords]);

  const handleSelectWord = (word) => {
    setSelectedWords(prev => [...prev, word]);
    setAnswer('');
    setShowSuggestions(false);
  };

  const handleRemoveWord = (word) => {
    setSelectedWords(prev => prev.filter(w => w !== word));
  };

  const handleSubmit = () => {
    if (selectedWords.length > 0) {
      onAnswer(selectedWords);
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
      {question.text && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-800 text-lg">
            {question.text}
          </p>
        </div>
      )}

      {/* Summary Text */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
        <p className="text-sm font-semibold text-gray-700 mb-2">Summary:</p>
        <p className="text-gray-700 text-sm leading-relaxed">
          {summary}
        </p>
      </div>

      {/* Word List */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm font-semibold text-gray-700 mb-2">Available Words:</p>
        <div className="flex flex-wrap gap-2">
          {wordList.map((word, idx) => {
            const isSelected = selectedWords.includes(word);
            return (
              <span
                key={idx}
                className={`
                  px-3 py-1 rounded text-sm
                  ${isSelected ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300 text-gray-700'}
                `}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>

      {/* Input Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Select Words:
        </label>
        <div className="relative">
          <Input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type to search words..."
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

      {/* Selected Words */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Selected Words:
        </label>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 min-h-12">
          {selectedWords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedWords.map((word, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded"
                >
                  <span>{word}</span>
                  {!isReview && (
                    <button
                      onClick={() => handleRemoveWord(word)}
                      className="text-white hover:text-blue-200"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No words selected yet</p>
          )}
        </div>
      </div>

      {/* Review Mode */}
      {isReview && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm font-semibold text-green-800 mb-2">Correct Answer:</p>
          <p className="text-green-700">{question.correctAnswer?.join(', ')}</p>
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
          disabled={selectedWords.length === 0 || isReview}
        >
          Submit Answer
        </Button>
      </div>
    </div>
  );
}

export default SummaryCompletion;

