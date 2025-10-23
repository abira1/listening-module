import React from 'react';

const CompletionEditor = ({ question, type, onChange }) => {
  const correctAnswer = question.correctAnswer || '';
  const acceptableAnswers = question.acceptableAnswers || [];
  const maxWords = question.maxWords || 3;

  const typeLabels = {
    sentence_completion: 'Sentence Completion',
    fill_gaps: 'Fill Gaps',
    fill_gaps_short: 'Fill Gaps (Short Answer)'
  };

  const handleAddAcceptableAnswer = () => {
    onChange({
      ...question,
      acceptableAnswers: [...acceptableAnswers, '']
    });
  };

  const handleRemoveAcceptableAnswer = (index) => {
    const newAnswers = acceptableAnswers.filter((_, i) => i !== index);
    onChange({
      ...question,
      acceptableAnswers: newAnswers
    });
  };

  const handleAcceptableAnswerChange = (index, value) => {
    const newAnswers = [...acceptableAnswers];
    newAnswers[index] = value;
    onChange({
      ...question,
      acceptableAnswers: newAnswers
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">{typeLabels[type]}</h3>

      {/* Question with Blank */}
      <div>
        <label className="block text-sm font-medium mb-2">Question Text with Blank</label>
        <div className="p-3 bg-white border rounded">
          <p className="text-sm text-gray-600 mb-2">Use _____ to indicate the blank:</p>
          <textarea
            value={question.text || ''}
            onChange={(e) => onChange({ ...question, text: e.target.value })}
            placeholder="The capital of France is _____."
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
        </div>
      </div>

      {/* Correct Answer */}
      <div>
        <label className="block text-sm font-medium mb-2">Correct Answer *</label>
        <input
          type="text"
          value={correctAnswer}
          onChange={(e) => onChange({ ...question, correctAnswer: e.target.value })}
          placeholder="Enter the correct answer..."
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Acceptable Answers */}
      <div>
        <label className="block text-sm font-medium mb-2">Acceptable Alternatives (Optional)</label>
        <div className="space-y-2">
          {acceptableAnswers.map((answer, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={answer}
                onChange={(e) => handleAcceptableAnswerChange(index, e.target.value)}
                placeholder={`Alternative answer ${index + 1}`}
                className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleRemoveAcceptableAnswer(index)}
                className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={handleAddAcceptableAnswer}
          className="mt-2 w-full p-2 border-2 border-dashed border-blue-300 rounded text-blue-600 hover:bg-blue-50"
        >
          + Add Alternative Answer
        </button>
      </div>

      {/* Max Words (for fill_gaps_short) */}
      {type === 'fill_gaps_short' && (
        <div>
          <label className="block text-sm font-medium mb-2">Maximum Words</label>
          <input
            type="number"
            value={maxWords}
            onChange={(e) => onChange({ ...question, maxWords: parseInt(e.target.value) })}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            max="5"
          />
          <p className="text-xs text-gray-500 mt-1">Answer must not exceed {maxWords} word(s)</p>
        </div>
      )}

      {/* Summary */}
      <div className="p-3 bg-gray-50 rounded text-sm">
        <p><strong>Type:</strong> {typeLabels[type]}</p>
        <p><strong>Correct Answer:</strong> {correctAnswer || 'Not set'}</p>
        <p><strong>Alternatives:</strong> {acceptableAnswers.length}</p>
      </div>
    </div>
  );
};

export default CompletionEditor;

