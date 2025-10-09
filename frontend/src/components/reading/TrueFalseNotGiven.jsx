import React from 'react';

export function TrueFalseNotGiven({ question, answer, onChange }) {
  const { prompt, options } = question.payload;

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <p className="text-gray-700 mb-3 font-medium">{prompt}</p>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option}
            className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
              answer === option
                ? 'bg-blue-50 border-blue-500'
                : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
            }`}
          >
            <input
              type="radio"
              name={`question-${question.index}`}
              value={option}
              checked={answer === option}
              onChange={(e) => onChange(e.target.value)}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-800">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
