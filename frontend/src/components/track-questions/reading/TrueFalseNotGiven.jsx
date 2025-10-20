import React from 'react';

/**
 * True/False/Not Given Question
 * Three-button choice
 */
export function TrueFalseNotGiven({ question, answer, onChange, questionNumber, readOnly }) {
  const { prompt } = question.payload;
  const options = ['TRUE', 'FALSE', 'NOT GIVEN'];

  return (
    <div className="mb-6">
      <div className="flex items-start gap-2">
        <span className="font-semibold min-w-[3rem] text-gray-700">{questionNumber}.</span>
        <div className="flex-1">
          <p className="text-gray-800 mb-3">{prompt}</p>
          
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <label
                key={option}
                className={`flex items-center px-4 py-2 border-2 rounded-md transition-all ${
                  answer === option
                    ? 'bg-blue-500 border-blue-600 text-white font-medium shadow-md'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                } ${readOnly ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
              >
                <input
                  type="radio"
                  name={`question-${questionNumber}`}
                  value={option}
                  checked={answer === option}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={readOnly}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}