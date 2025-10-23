import React from 'react';

const MCQEditor = ({ question, isMultiple, onChange }) => {
  const options = question.options || [];
  const correctAnswer = question.correctAnswer;
  const correctAnswers = question.correctAnswers || [];

  const handleAddOption = () => {
    const newOptions = [...options, { id: String.fromCharCode(97 + options.length), text: '' }];
    onChange({ ...question, options: newOptions });
  };

  const handleRemoveOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    onChange({ ...question, options: newOptions });
  };

  const handleOptionChange = (index, text) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    onChange({ ...question, options: newOptions });
  };

  const handleCorrectAnswerChange = (optionId) => {
    if (isMultiple) {
      const newAnswers = correctAnswers.includes(optionId)
        ? correctAnswers.filter(a => a !== optionId)
        : [...correctAnswers, optionId];
      onChange({ ...question, correctAnswers: newAnswers });
    } else {
      onChange({ ...question, correctAnswer: optionId });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">
        {isMultiple ? 'Multiple Correct Answers' : 'Single Correct Answer'}
      </h3>

      {/* Options List */}
      <div className="space-y-3">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-white rounded border">
            {/* Option ID */}
            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center font-semibold text-sm">
              {option.id}
            </div>

            {/* Option Text */}
            <input
              type="text"
              value={option.text}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${option.id.toUpperCase()}`}
              className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Correct Answer Checkbox/Radio */}
            <div className="flex items-center gap-2">
              {isMultiple ? (
                <input
                  type="checkbox"
                  checked={correctAnswers.includes(option.id)}
                  onChange={() => handleCorrectAnswerChange(option.id)}
                  className="w-5 h-5 cursor-pointer"
                  title="Mark as correct answer"
                />
              ) : (
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={correctAnswer === option.id}
                  onChange={() => handleCorrectAnswerChange(option.id)}
                  className="w-5 h-5 cursor-pointer"
                  title="Mark as correct answer"
                />
              )}
              <span className="text-xs text-gray-600">Correct</span>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => handleRemoveOption(index)}
              className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
              disabled={options.length <= 2}
              title="Remove option (minimum 2 required)"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Add Option Button */}
      <button
        onClick={handleAddOption}
        disabled={options.length >= 4}
        className="w-full p-2 border-2 border-dashed border-blue-300 rounded text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        + Add Option {options.length >= 4 && '(Max 4)'}
      </button>

      {/* Summary */}
      <div className="p-3 bg-gray-50 rounded text-sm">
        <p><strong>Total Options:</strong> {options.length}</p>
        {isMultiple ? (
          <p><strong>Correct Answers:</strong> {correctAnswers.length > 0 ? correctAnswers.join(', ').toUpperCase() : 'None selected'}</p>
        ) : (
          <p><strong>Correct Answer:</strong> {correctAnswer ? correctAnswer.toUpperCase() : 'Not selected'}</p>
        )}
      </div>
    </div>
  );
};

export default MCQEditor;

