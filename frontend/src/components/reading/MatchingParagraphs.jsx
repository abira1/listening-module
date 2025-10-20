import React from 'react';

export function MatchingParagraphs({ question, answer, onChange }) {
  const { prompt } = question.payload;

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
      <p className="text-gray-700 text-sm">{prompt}</p>
      <div className="mt-2 text-xs text-gray-600 italic">
        💡 Click the paragraph box in the passage on the left to assign this question number
      </div>
      {answer && (
        <div className="mt-2 text-sm font-medium text-green-700">
          ✓ Assigned to Paragraph {answer}
        </div>
      )}
    </div>
  );
}
