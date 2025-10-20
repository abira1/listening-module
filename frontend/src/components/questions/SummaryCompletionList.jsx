import React from 'react';

/**
 * Summary Completion from List component
 * Select words from provided list to complete summary
 */
export function SummaryCompletionList({ question, answer, onChange, questionNum }) {
  return (
    <div className="mb-4">
      <div className="flex items-start gap-2">
        <span className="font-semibold min-w-[3rem]">{questionNum}.</span>
        <div className="flex-1">
          <div className="bg-purple-50 border-l-4 border-purple-400 p-3 mb-2">
            <p className="text-sm font-medium text-purple-800">📄 Summary (from list)</p>
          </div>
          <p className="text-gray-700 mb-2">{question.payload.prompt}</p>
          <select
            value={answer || ''}
            onChange={(e) => onChange(questionNum, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select from list...</option>
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
