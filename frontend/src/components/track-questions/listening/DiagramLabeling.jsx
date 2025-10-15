import React from 'react';

/**
 * Diagram Labeling
 * Fill in blanks on a diagram with text input
 */
export function DiagramLabeling({ question, answer, onChange, questionNumber, readOnly }) {
  const { prompt, max_words = 1 } = question.payload;
  const { image } = question;
  
  const wordCount = answer ? answer.trim().split(/\s+/).filter(w => w).length : 0;
  const exceedsLimit = max_words && wordCount > max_words;

  return (
    <div className="mb-6">
      <div className="flex items-start gap-2">
        <span className="font-semibold min-w-[3rem] text-gray-700">{questionNumber}.</span>
        <div className="flex-1">
          {/* Render prompt with inline blank */}
          <p className="text-gray-800 mb-3">
            {prompt.split('_____').map((part, idx, arr) => (
              <React.Fragment key={idx}>
                {part}
                {idx < arr.length - 1 && (
                  <input
                    type="text"
                    value={answer || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="___"
                    disabled={readOnly}
                    className={`inline-block w-32 px-2 py-1 mx-1 border-b-2 focus:outline-none focus:border-blue-500 text-center ${
                      exceedsLimit ? 'border-red-500 bg-red-50' : 'border-gray-400'
                    } ${readOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-transparent'}`}
                  />
                )}
              </React.Fragment>
            ))}
          </p>
          
          {max_words && (
            <p className={`text-xs mt-1 ${
              exceedsLimit ? 'text-red-600 font-medium' : 'text-gray-600'
            }`}>
              {exceedsLimit ? '⚠️ Word limit exceeded!' : `Maximum ${max_words} word${max_words > 1 ? 's' : ''}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}