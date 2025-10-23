import React from 'react';

const QuestionPreview = ({ question }) => {
  const renderPreview = () => {
    const { type, text, options, correctAnswer, correctAnswers, marks, difficulty } = question;

    return (
      <div className="space-y-3">
        {/* Header */}
        <div className="pb-3 border-b">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-gray-600 uppercase">{type}</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{marks} mark{marks !== 1 ? 's' : ''}</span>
          </div>
          <span className="text-xs text-gray-500">Difficulty: {difficulty}</span>
        </div>

        {/* Question Text */}
        <div>
          <p className="text-sm font-medium text-gray-800">{text || '(No question text)'}</p>
        </div>

        {/* Type-Specific Preview */}
        {type === 'mcq_single' || type === 'mcq_multiple' ? (
          <div className="space-y-2">
            {options && options.map((option, idx) => (
              <div
                key={idx}
                className={`p-2 rounded border text-sm ${
                  type === 'mcq_single' && correctAnswer === option.id
                    ? 'bg-green-50 border-green-300'
                    : type === 'mcq_multiple' && correctAnswers?.includes(option.id)
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-600">{option.id.toUpperCase()}.</span>
                  <span>{option.text || '(Empty option)'}</span>
                  {(type === 'mcq_single' && correctAnswer === option.id) ||
                  (type === 'mcq_multiple' && correctAnswers?.includes(option.id)) ? (
                    <span className="ml-auto text-green-600 font-semibold">✓</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : type === 'true_false_ng' ? (
          <div className="space-y-2">
            {['True', 'False', 'Not Given'].map(option => (
              <div
                key={option}
                className={`p-2 rounded border text-sm ${
                  correctAnswer === option
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{option}</span>
                  {correctAnswer === option && (
                    <span className="ml-auto text-green-600 font-semibold">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : type === 'sentence_completion' || type === 'fill_gaps' || type === 'fill_gaps_short' ? (
          <div className="space-y-2">
            <div className="p-2 bg-gray-50 rounded border text-sm">
              <p className="text-gray-700">{text?.replace('_____', '___________')}</p>
            </div>
            <div className="p-2 bg-green-50 rounded border text-sm">
              <p><strong>Answer:</strong> {question.correctAnswer || '(Not set)'}</p>
            </div>
            {question.acceptableAnswers && question.acceptableAnswers.length > 0 && (
              <div className="p-2 bg-blue-50 rounded border text-sm">
                <p><strong>Alternatives:</strong> {question.acceptableAnswers.join(', ')}</p>
              </div>
            )}
          </div>
        ) : type === 'matching' ? (
          <div className="space-y-2">
            <div className="text-sm">
              <p className="font-semibold mb-2">Items:</p>
              {question.items?.map((item, idx) => (
                <div key={idx} className="text-xs text-gray-700 mb-1">
                  {idx + 1}. {item.text}
                </div>
              ))}
            </div>
            <div className="text-sm">
              <p className="font-semibold mb-2">Options:</p>
              {question.options?.map((option, idx) => (
                <div key={idx} className="text-xs text-gray-700 mb-1">
                  {String.fromCharCode(65 + idx)}. {option.text}
                </div>
              ))}
            </div>
          </div>
        ) : type === 'writing_task1' || type === 'writing_task2' ? (
          <div className="space-y-2">
            <div className="p-2 bg-gray-50 rounded border text-sm">
              <p className="font-semibold mb-1">Description:</p>
              <p className="text-gray-700">{question.description || '(Not set)'}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded border text-sm">
              <p className="font-semibold mb-1">Word Count:</p>
              <p className="text-gray-700">{question.minWords || 150} - {question.maxWords || 250} words</p>
            </div>
          </div>
        ) : (
          <div className="p-2 bg-yellow-50 rounded border text-sm text-gray-600">
            Preview not available for this question type
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t text-xs text-gray-500">
          <p>ID: {question.id}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded border">
      {renderPreview()}
    </div>
  );
};

export default QuestionPreview;

