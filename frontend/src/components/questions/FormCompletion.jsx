import React from 'react';

/**
 * Form Completion component
 * Fill in blanks in a form
 */
export function FormCompletion({ question, answer, onChange, questionNum }) {
  const maxWords = question.payload.max_words || 3;

  return (
    <div className="mb-4">
      <div className="flex items-start gap-2">
        <span className="font-semibold min-w-[3rem]">{questionNum}.</span>
        <div className="flex-1">
          <p className="text-gray-700 mb-2">{question.payload.prompt}</p>
          <input
            type="text"
            value={answer || ''}
            onChange={(e) => onChange(questionNum, e.target.value)}
            placeholder="Enter your answer"
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
