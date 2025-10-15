import React from 'react';

/**
 * Sentence Completion
 * Text input or word list dropdown
 */
export function SentenceCompletion({ question, answer, onChange, questionNumber, readOnly }) {
  const { prompt, max_words, word_list } = question.payload;

  const wordCount = answer ? answer.trim().split(/\s+/).filter(w => w).length : 0;
  const exceedsLimit = max_words && wordCount > max_words;

  // If word list exists, use dropdown
  if (word_list && word_list.length > 0) {
    return (
      <div className="mb-6">
        <div className="flex items-start gap-2">
          <span className="font-semibold min-w-[3rem] text-gray-700">{questionNumber}.</span>
          <div className="flex-1">
            <p className="text-gray-800 mb-3">{prompt}</p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-xs text-gray-600 mb-2 font-medium">Choose from the list:</p>
              <select
                value={answer || ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={readOnly}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- Select --</option>
                {word_list.map((word) => (
                  <option key={word} value={word}>{word}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, use text input
  return (
    <div className="mb-6">
      <div className="flex items-start gap-2">
        <span className="font-semibold min-w-[3rem] text-gray-700">{questionNumber}.</span>
        <div className="flex-1">
          <p className="text-gray-800 mb-3">{prompt}</p>
          
          <input
            type="text"
            value={answer || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer"
            disabled={readOnly}
            className={`w-full px-4 py-2 border-2 rounded-md focus:ring-2 focus:ring-blue-500 ${
              exceedsLimit ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
            } ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          
          {max_words && (
            <div className="flex justify-between items-center mt-2 text-xs">
              <span className={exceedsLimit ? 'text-red-600 font-medium' : 'text-gray-600'}>
                {exceedsLimit ? '⚠️ Word limit exceeded!' : `Maximum ${max_words} word${max_words > 1 ? 's' : ''}`}
              </span>
              <span className={`font-medium ${exceedsLimit ? 'text-red-600' : 'text-gray-700'}`}>
                {wordCount}/{max_words}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}