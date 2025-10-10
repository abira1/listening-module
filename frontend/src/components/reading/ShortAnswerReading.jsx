import React from 'react';

export function ShortAnswerReading({ question, answer, onChange }) {
  const { prompt, max_words } = question.payload;

  // Check word count
  const wordCount = answer ? answer.trim().split(/\s+/).filter(w => w).length : 0;
  const exceedsLimit = max_words && wordCount > max_words;

  return (
    <div>
      <p className="text-gray-700 mb-3">{prompt}</p>
      <div className="flex flex-col">
        <input
          type="text"
          value={answer || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer here"
          className={`px-4 py-2 border-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            exceedsLimit ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
          }`}
        />
        {max_words && (
          <div className="flex justify-between items-center mt-1.5 text-xs">
            <span className={`${exceedsLimit ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
              {exceedsLimit ? '⚠️ Word limit exceeded!' : `Write NO MORE THAN ${max_words.toString().toUpperCase()} WORD${max_words > 1 ? 'S' : ''}`}
            </span>
            <span className={`font-medium ${exceedsLimit ? 'text-red-600' : 'text-gray-600'}`}>
              {wordCount}/{max_words}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
