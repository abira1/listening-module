import React from 'react';

/**
 * Multiple Choice Multiple Answers
 * Checkboxes for selecting multiple options
 */
export function MultipleChoiceMultiple({ question, answer, onChange, questionNumber, readOnly }) {
  const { prompt, options = [], select_count = 2 } = question.payload;
  const currentAnswers = answer ? (Array.isArray(answer) ? answer : [answer]) : [];

  const handleCheckboxChange = (optionLabel) => {
    let newAnswers = [...currentAnswers];
    
    if (newAnswers.includes(optionLabel)) {
      // Remove if already selected
      newAnswers = newAnswers.filter(a => a !== optionLabel);
    } else {
      // Add if not at max selections
      if (newAnswers.length < select_count) {
        newAnswers.push(optionLabel);
      }
    }
    
    onChange(newAnswers);
  };

  return (
    <div className="mb-6">
      <div className="flex items-start gap-2">
        <span className="font-semibold min-w-[3rem] text-gray-700">{questionNumber}.</span>
        <div className="flex-1">
          <p className="text-gray-800 mb-2 font-medium">{prompt}</p>
          <p className="text-sm text-blue-600 mb-3 font-medium">
            Select {select_count === 2 ? 'TWO' : select_count === 3 ? 'THREE' : select_count} answer{select_count > 1 ? 's' : ''}
          </p>
          
          <div className="space-y-2">
            {options.map((option, idx) => {
              const optionLabel = String.fromCharCode(65 + idx);
              const isSelected = currentAnswers.includes(optionLabel);
              const isDisabled = !isSelected && currentAnswers.length >= select_count;
              
              return (
                <label
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 shadow-sm cursor-pointer'
                      : isDisabled || readOnly
                      ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                      : 'bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCheckboxChange(optionLabel)}
                    disabled={isDisabled || readOnly}
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-800 flex-1">
                    <span className="font-semibold text-gray-700">{optionLabel}.</span> {option}
                  </span>
                </label>
              );
            })}
          </div>
          
          <p className="text-xs text-gray-600 mt-2 font-medium">
            {currentAnswers.length} / {select_count} selected
          </p>
        </div>
      </div>
    </div>
  );
}