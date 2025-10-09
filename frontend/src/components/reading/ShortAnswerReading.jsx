import React from 'react';

export function ShortAnswerReading({ question, answer, onChange }) {
  const { prompt, max_words } = question.payload;

  // Check word count
  const wordCount = answer ? answer.trim().split(/\s+/).filter(w => w).length : 0;
  const exceedsLimit = wordCount > max_words;

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <p className="text-gray-700 mb-3 font-medium">{prompt}</p>
      <input
        type="text"
        value={answer || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter your answer (max ${max_words} word${max_words > 1 ? 's' : ''})`}
        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          exceedsLimit ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}
      />
      <div className="flex justify-between items-center mt-2 text-sm">
        <span className="text-gray-500">
          Max {max_words} word{max_words > 1 ? 's' : ''}
        </span>
        <span className={`font-medium ${exceedsLimit ? 'text-red-600' : 'text-gray-600'}`}>
          {wordCount} / {max_words}
        </span>
      </div>
      {exceedsLimit && (
        <p className="text-red-600 text-sm mt-1">
          ⚠️ Answer exceeds word limit
        </p>
      )}
    </div>
  );
}
