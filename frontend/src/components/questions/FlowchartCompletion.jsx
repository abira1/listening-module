import React from 'react';

/**
 * Flowchart Completion component
 * Fill in missing steps in a process/flowchart
 */
export function FlowchartCompletion({ question, answer, onChange, questionNum }) {
  const maxWords = question.payload.max_words || 3;

  return (
    <div className="mb-4">
      <div className="flex items-start gap-2">
        <span className="font-semibold min-w-[3rem]">{questionNum}.</span>
        <div className="flex-1">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-2">
            <p className="text-sm font-medium text-blue-800">🔄 Process Flow-chart</p>
          </div>
          <p className="text-gray-700 mb-2">{question.payload.prompt}</p>
          <input
            type="text"
            value={answer || ''}
            onChange={(e) => onChange(questionNum, e.target.value)}
            placeholder="Complete the flow-chart step"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {maxWords && (
            <p className="text-xs text-gray-500 mt-1">
              Maximum {maxWords} word(s)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
