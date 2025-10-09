import React from 'react';

export function MatchingParagraphs({ question, answer, onChange }) {
  const { prompt, options } = question.payload;

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <p className="text-gray-700 mb-3 font-medium">{prompt}</p>
      <select
        value={answer || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">-- Select paragraph --</option>
        {options.map((option) => (
          <option key={option} value={option}>
            Paragraph {option}
          </option>
        ))}
      </select>
    </div>
  );
}
