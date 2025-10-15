import React, { useState, useEffect } from 'react';

/**
 * Writing Task Component
 * Large textarea with word count
 */
export function WritingTask({ question, answer, onChange, questionNumber, readOnly }) {
  const { instructions, prompt, min_words = 150, task_number } = question.payload;
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const count = answer ? answer.trim().split(/\s+/).filter(w => w).length : 0;
    setWordCount(count);
  }, [answer]);

  const meetsRequirement = wordCount >= min_words;

  return (
    <div className="mb-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-lg p-6 mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Task {task_number}</h3>
        
        {instructions && (
          <p className="text-sm text-gray-700 mb-3 italic">{instructions}</p>
        )}
        
        <p className="text-gray-800 whitespace-pre-wrap">{prompt}</p>
        
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-sm text-gray-700 font-medium">
            Write at least {min_words} words.
          </p>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={answer || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Start writing your answer here..."
          disabled={readOnly}
          rows={20}
          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y ${
            readOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          } border-gray-300`}
        />
        
        <div className={`absolute bottom-4 right-4 px-4 py-2 rounded-lg font-bold shadow-lg ${
          meetsRequirement 
            ? 'bg-green-100 text-green-700 border-2 border-green-500' 
            : 'bg-orange-100 text-orange-700 border-2 border-orange-500'
        }`}>
          {wordCount} / {min_words} words
          {meetsRequirement && ' ✓'}
        </div>
      </div>
    </div>
  );
}