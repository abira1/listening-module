import React from 'react';

/**
 * Multiple Choice Single Answer
 * Radio buttons for selecting one option
 */
export function MultipleChoiceSingle({ question, answer, onChange, questionNumber, readOnly }) {
  const { prompt, options = [] } = question.payload;

  return (
    <div className="mb-6">
      <div className="flex items-start gap-2">
        <span className="font-semibold min-w-[3rem] text-gray-700">{questionNumber}.</span>
        <div className="flex-1">
          <p className="text-gray-800 mb-3 font-medium">{prompt}</p>
          
          <div className="space-y-2">
            {options.map((option, idx) => {
              const optionLabel = String.fromCharCode(65 + idx); // A, B, C, D
              const isSelected = answer === optionLabel;
              
              return (
                <label
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 shadow-sm'
                      : 'bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  } ${readOnly ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                  <input
                    type="radio"
                    name={`question-${questionNumber}`}
                    value={optionLabel}
                    checked={isSelected}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={readOnly}
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-800 flex-1">
                    <span className="font-semibold text-gray-700">{optionLabel}.</span> {option}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}