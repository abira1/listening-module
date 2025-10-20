import React from 'react';

export function TrueFalseNotGiven({ question, answer, onChange }) {
  const { prompt } = question.payload;
  const options = ['TRUE', 'FALSE', 'NOT GIVEN'];

  return (
    <div>
      <p className="text-gray-700 mb-3">{prompt}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option}
            className={`flex items-center px-4 py-2 border-2 rounded-md cursor-pointer transition-all ${
              answer === option
                ? 'bg-blue-500 border-blue-600 text-white font-medium'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            <input
              type="radio"
              name={`question-${question.index}`}
              value={option}
              checked={answer === option}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
