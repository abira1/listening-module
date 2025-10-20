import React from 'react';

/**
 * Matching Sentence Endings component
 * Match sentence beginnings with endings
 */
export function MatchingSentenceEndings({ question, answer, onChange, questionNum }) {
  return (
    <div className="mb-4">
      <div className="flex items-start gap-2">
        <span className="font-semibold min-w-[3rem]">{questionNum}.</span>
        <div className="flex-1">
          <p className="text-gray-700 mb-2 font-medium">{question.payload.prompt}</p>
          <select
            value={answer || ''}
            onChange={(e) => onChange(questionNum, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Complete the sentence...</option>
            {question.payload.options.map((option, idx) => {
              const optionLabel = String.fromCharCode(65 + idx);
              return (
                <option key={idx} value={optionLabel}>
                  {optionLabel}. {option}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </div>
  );
}
