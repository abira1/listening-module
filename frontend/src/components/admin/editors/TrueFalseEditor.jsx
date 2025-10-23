import React from 'react';

const TrueFalseEditor = ({ question, onChange }) => {
  const correctAnswer = question.correctAnswer || '';

  const options = [
    { value: 'True', label: 'True', color: 'green' },
    { value: 'False', label: 'False', color: 'red' },
    { value: 'Not Given', label: 'Not Given', color: 'blue' }
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">True/False/Not Given</h3>

      {/* Question Statement */}
      <div>
        <label className="block text-sm font-medium mb-2">Statement</label>
        <textarea
          value={question.statement || ''}
          onChange={(e) => onChange({ ...question, statement: e.target.value })}
          placeholder="Enter the statement to evaluate..."
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
        />
      </div>

      {/* Correct Answer Selection */}
      <div>
        <label className="block text-sm font-medium mb-3">Correct Answer *</label>
        <div className="grid grid-cols-3 gap-3">
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => onChange({ ...question, correctAnswer: option.value })}
              className={`p-4 rounded border-2 font-semibold transition-all ${
                correctAnswer === option.value
                  ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div>
        <label className="block text-sm font-medium mb-2">Explanation (Optional)</label>
        <textarea
          value={question.explanation || ''}
          onChange={(e) => onChange({ ...question, explanation: e.target.value })}
          placeholder="Explain why this answer is correct..."
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
        />
      </div>

      {/* Summary */}
      <div className="p-3 bg-gray-50 rounded text-sm">
        <p><strong>Question Type:</strong> True/False/Not Given</p>
        <p><strong>Correct Answer:</strong> {correctAnswer || 'Not selected'}</p>
      </div>
    </div>
  );
};

export default TrueFalseEditor;

