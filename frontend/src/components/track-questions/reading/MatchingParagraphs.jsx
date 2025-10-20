import React from 'react';

/**
 * Matching Paragraphs
 * Dropdown to select paragraph letter
 */
export function MatchingParagraphs({ question, answer, onChange, questionNumber, readOnly }) {
  const { prompt, options = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] } = question.payload;

  return (
    <div className="mb-6">
      <div className="flex items-start gap-2">
        <span className="font-semibold min-w-[3rem] text-gray-700">{questionNumber}.</span>
        <div className="flex-1">
          <p className="text-gray-800 mb-3">{prompt}</p>
          
          <div className="flex items-center gap-3">
            <select
              value={answer || ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={readOnly}
              className="px-4 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white font-medium text-gray-900"
            >
              <option value="">-- Select paragraph --</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  Paragraph {option}
                </option>
              ))}
            </select>
            
            {answer && (
              <span className="text-sm text-green-700 font-medium">
                ✓ Assigned to Paragraph {answer}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}