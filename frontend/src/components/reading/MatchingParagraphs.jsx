import React from 'react';

export function MatchingParagraphs({ question, answer, onChange }) {
  const { prompt, options } = question.payload;

  return (
    <div>
      <p className="text-gray-700 mb-3">{prompt}</p>
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600 font-medium">Write the letter:</label>
        <select
          value={answer || ''}
          onChange={(e) => onChange(e.target.value)}
          className="px-3 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
          style={{ minWidth: '100px' }}
        >
          <option value="">---</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
