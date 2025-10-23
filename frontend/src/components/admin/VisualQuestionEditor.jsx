import React, { useState, useEffect } from 'react';
import QuestionTypeSelector from './QuestionTypeSelector';
import MCQEditor from './editors/MCQEditor';
import TrueFalseEditor from './editors/TrueFalseEditor';
import CompletionEditor from './editors/CompletionEditor';
import MatchingEditor from './editors/MatchingEditor';
import WritingTaskEditor from './editors/WritingTaskEditor';
import QuestionPreview from './QuestionPreview';

const QUESTION_TYPES = {
  // Listening
  mcq_single: 'Multiple Choice (Single)',
  mcq_multiple: 'Multiple Choice (Multiple)',
  sentence_completion: 'Sentence Completion',
  form_completion: 'Form Completion',
  table_completion: 'Table Completion',
  flowchart_completion: 'Flowchart Completion',
  fill_gaps: 'Fill Gaps',
  fill_gaps_short: 'Fill Gaps (Short)',
  matching: 'Matching',
  map_labelling: 'Map Labelling',
  
  // Reading
  true_false_ng: 'True/False/Not Given',
  matching_headings: 'Matching Headings',
  matching_features: 'Matching Features',
  matching_endings: 'Matching Endings',
  note_completion: 'Note Completion',
  summary_completion: 'Summary Completion',
  
  // Writing
  writing_task1: 'Writing Task 1',
  writing_task2: 'Writing Task 2'
};

const VisualQuestionEditor = ({ onSave, initialQuestion = null, onCancel }) => {
  const [questionType, setQuestionType] = useState(initialQuestion?.type || 'mcq_single');
  const [questionData, setQuestionData] = useState(initialQuestion || {
    id: `q_${Date.now()}`,
    type: 'mcq_single',
    text: '',
    marks: 1,
    difficulty: 'medium'
  });
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    setQuestionData(prev => ({
      ...prev,
      type: questionType
    }));
  }, [questionType]);

  const handleTypeChange = (newType) => {
    setQuestionType(newType);
    setErrors([]);
  };

  const handleDataChange = (newData) => {
    setQuestionData(newData);
    setErrors([]);
  };

  const validateQuestion = () => {
    const newErrors = [];

    // Common validations
    if (!questionData.text || questionData.text.trim() === '') {
      newErrors.push('Question text is required');
    }

    if (!questionData.marks || questionData.marks < 1) {
      newErrors.push('Marks must be at least 1');
    }

    // Type-specific validations
    switch (questionType) {
      case 'mcq_single':
      case 'mcq_multiple':
        if (!questionData.options || questionData.options.length < 2) {
          newErrors.push('At least 2 options are required');
        }
        if (questionType === 'mcq_single' && !questionData.correctAnswer) {
          newErrors.push('Correct answer is required');
        }
        if (questionType === 'mcq_multiple' && (!questionData.correctAnswers || questionData.correctAnswers.length < 2)) {
          newErrors.push('At least 2 correct answers are required');
        }
        break;

      case 'true_false_ng':
        if (!questionData.correctAnswer) {
          newErrors.push('Correct answer is required');
        }
        if (!['True', 'False', 'Not Given'].includes(questionData.correctAnswer)) {
          newErrors.push('Correct answer must be True, False, or Not Given');
        }
        break;

      case 'sentence_completion':
      case 'fill_gaps':
      case 'fill_gaps_short':
        if (!questionData.correctAnswer) {
          newErrors.push('Correct answer is required');
        }
        break;

      case 'matching':
        if (!questionData.items || questionData.items.length === 0) {
          newErrors.push('At least one item is required');
        }
        if (!questionData.options || questionData.options.length === 0) {
          newErrors.push('At least one option is required');
        }
        break;

      case 'writing_task1':
      case 'writing_task2':
        if (!questionData.instructions || questionData.instructions.trim() === '') {
          newErrors.push('Instructions are required');
        }
        if (!questionData.minWords || questionData.minWords < 1) {
          newErrors.push('Minimum words must be at least 1');
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = () => {
    if (validateQuestion()) {
      onSave(questionData);
    }
  };

  const renderEditor = () => {
    switch (questionType) {
      case 'mcq_single':
      case 'mcq_multiple':
        return (
          <MCQEditor
            question={questionData}
            isMultiple={questionType === 'mcq_multiple'}
            onChange={handleDataChange}
          />
        );

      case 'true_false_ng':
        return (
          <TrueFalseEditor
            question={questionData}
            onChange={handleDataChange}
          />
        );

      case 'sentence_completion':
      case 'fill_gaps':
      case 'fill_gaps_short':
        return (
          <CompletionEditor
            question={questionData}
            type={questionType}
            onChange={handleDataChange}
          />
        );

      case 'matching':
        return (
          <MatchingEditor
            question={questionData}
            onChange={handleDataChange}
          />
        );

      case 'writing_task1':
      case 'writing_task2':
        return (
          <WritingTaskEditor
            question={questionData}
            taskNumber={questionType === 'writing_task1' ? 1 : 2}
            onChange={handleDataChange}
          />
        );

      default:
        return <div className="p-4 text-gray-500">Editor for {questionType} not yet implemented</div>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Visual Question Editor</h2>

      {errors.length > 0 && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded">
          <h3 className="font-semibold text-red-700 mb-2">Validation Errors:</h3>
          <ul className="list-disc list-inside text-red-600">
            {errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Panel */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Question Type</label>
            <QuestionTypeSelector
              selectedType={questionType}
              onTypeChange={handleTypeChange}
              types={QUESTION_TYPES}
            />
          </div>

          {/* Common Fields */}
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-4">Question Details</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Question Text *</label>
              <textarea
                value={questionData.text || ''}
                onChange={(e) => handleDataChange({ ...questionData, text: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Enter the question text..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Marks</label>
                <input
                  type="number"
                  value={questionData.marks || 1}
                  onChange={(e) => handleDataChange({ ...questionData, marks: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  value={questionData.difficulty || 'medium'}
                  onChange={(e) => handleDataChange({ ...questionData, difficulty: e.target.value })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Type-Specific Editor */}
          <div className="p-4 bg-blue-50 rounded">
            {renderEditor()}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="mb-4">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mb-2"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>

            {showPreview && (
              <div className="p-4 bg-gray-50 rounded border">
                <h3 className="font-semibold mb-4">Preview</h3>
                <QuestionPreview question={questionData} />
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 mt-6">
              <button
                onClick={handleSave}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Save Question
              </button>
              <button
                onClick={onCancel}
                className="w-full bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualQuestionEditor;

