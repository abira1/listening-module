import React from 'react';

/**
 * Multiple Choice with Multiple Answers component
 * Allows selecting multiple correct answers (checkboxes)
 */
export function MultipleChoiceMultiple({ question, answer, onChange, questionNum }) {
  const maxSelections = question.payload.max_selections || 2;
  const currentAnswers = answer ? (Array.isArray(answer) ? answer : [answer]) : [];

  const handleCheckboxChange = (optionLabel) => {
    let newAnswers = [...currentAnswers];
    
    if (newAnswers.includes(optionLabel)) {
      // Remove if already selected
      newAnswers = newAnswers.filter(a => a !== optionLabel);
    } else {
      // Add if not at max selections
      if (newAnswers.length < maxSelections) {
        newAnswers.push(optionLabel);
      } else {
        // Replace last one if at max
        newAnswers[newAnswers.length - 1] = optionLabel;
      }
    }
    
    onChange(questionNum, newAnswers);
  };

  return (
    <div className="mb-6">
      <div className="flex items-start gap-2">
        <span className="font-semibold min-w-[3rem]">{questionNum}.</span>
        <div className="flex-1">
          <p className="text-gray-700 mb-2">{question.payload.prompt}</p>
          <p className="text-sm text-blue-600 mb-3 font-medium">
            Select {maxSelections === 2 ? 'TWO' : maxSelections === 3 ? 'THREE' : maxSelections} answer{maxSelections > 1 ? 's' : ''}
          </p>
          <div className="space-y-2">
            {question.payload.options.map((option, idx) => {
              const optionLabel = String.fromCharCode(65 + idx); // A, B, C, D, E...
              const isSelected = currentAnswers.includes(optionLabel);
              
              return (
                <label 
                  key={idx} 
                  className={`flex items-start gap-2 cursor-pointer p-2 rounded ${
                    isSelected ? 'bg-blue-50 border border-blue-300' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCheckboxChange(optionLabel)}
                    disabled={!isSelected && currentAnswers.length >= maxSelections}
                    className="mt-1"
                  />
                  <span className="text-gray-700">
                    <span className="font-medium">{optionLabel}.</span> {option}
                  </span>
                </label>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {currentAnswers.length} / {maxSelections} selected
          </p>
        </div>
      </div>
    </div>
  );
}
