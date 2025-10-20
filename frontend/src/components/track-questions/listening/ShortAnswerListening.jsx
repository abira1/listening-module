import React from 'react';

/**
 * Short Answer Question - Listening
 * Text input with word limit
 */
export function ShortAnswerListening({ question, answer, onChange, questionNumber, readOnly }) {
  const { prompt, max_words = 3 } = question.payload;
  
  // Count words
  const wordCount = answer ? answer.trim().split(/\s+/).filter(w => w).length : 0;
  const exceedsLimit = max_words && wordCount > max_words;

  return (
    <div className="mb-6">
      <div className="flex items-start gap-2">
        <span className="font-semibold min-w-[3rem] text-gray-700">{questionNumber}.</span>
        <div className="flex-1">
          <p className="text-gray-800 mb-3">{prompt}</p>
          
          <input
            type="text"
            value={answer || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer here"
            disabled={readOnly}
            className={`w-full px-4 py-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              exceedsLimit 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 bg-white'
            } ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          
          {max_words && (
            <div className="flex justify-between items-center mt-2 text-xs">
              <span className={exceedsLimit ? 'text-red-600 font-medium' : 'text-gray-600'}>
                {exceedsLimit ? '⚠️ Word limit exceeded!' : `Maximum ${max_words} word${max_words > 1 ? 's' : ''}`}
              </span>
              <span className={`font-medium ${exceedsLimit ? 'text-red-600' : 'text-gray-700'}`}>
                {wordCount}/{max_words}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}