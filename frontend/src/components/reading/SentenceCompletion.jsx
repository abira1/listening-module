import React from 'react';

export function SentenceCompletion({ question, answer, onChange }) {
  const { prompt, max_words, word_list } = question.payload;

  // Check word count
  const wordCount = answer ? answer.trim().split(/\s+/).filter(w => w).length : 0;
  const exceedsLimit = max_words && wordCount > max_words;

  // If word list exists, use dropdown; otherwise use text input
  if (word_list && word_list.length > 0) {
    return (
      <div>
        <p className="text-gray-700 mb-3">{prompt}</p>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-2">
          <p className="text-xs text-gray-600 mb-2 font-medium">Choose from the list below:</p>
          <select
            value={answer || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          >
            <option value="">-- Select your answer --</option>
            {word_list.map((word) => (
              <option key={word} value={word}>
                {word}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-gray-700 mb-3">{prompt}</p>
      <div className="flex flex-col">
        <input
          type="text"
          value={answer || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer here"
          className={`px-4 py-2 border-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            exceedsLimit ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
          }`}
        />
        {max_words && (
          <div className="flex justify-between items-center mt-1.5 text-xs">
            <span className={`${exceedsLimit ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
              {exceedsLimit ? '⚠️ Word limit exceeded!' : `Maximum ${max_words} word${max_words > 1 ? 's' : ''} from the passage`}
            </span>
            <span className={`font-medium ${exceedsLimit ? 'text-red-600' : 'text-gray-600'}`}>
              {wordCount}/{max_words}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
