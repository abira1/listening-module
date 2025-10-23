import React from 'react';

const WritingTaskEditor = ({ question, taskNumber, onChange }) => {
  const minWords = question.minWords || (taskNumber === 1 ? 150 : 250);
  const maxWords = question.maxWords || (taskNumber === 1 ? 200 : 400);
  const instructions = question.instructions || '';
  const description = question.description || '';

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Writing Task {taskNumber}</h3>

      {/* Task Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Task Description *</label>
        <textarea
          value={description}
          onChange={(e) => onChange({ ...question, description: e.target.value })}
          placeholder={taskNumber === 1 
            ? "Describe a graph, chart, or diagram..."
            : "Write an essay on the given topic..."
          }
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
        />
      </div>

      {/* Instructions */}
      <div>
        <label className="block text-sm font-medium mb-2">Instructions *</label>
        <textarea
          value={instructions}
          onChange={(e) => onChange({ ...question, instructions: e.target.value })}
          placeholder="Provide clear instructions for the task..."
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
        />
      </div>

      {/* Word Count Requirements */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Minimum Words *</label>
          <input
            type="number"
            value={minWords}
            onChange={(e) => onChange({ ...question, minWords: parseInt(e.target.value) })}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="50"
            max="500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {taskNumber === 1 ? 'Typically 150 words' : 'Typically 250 words'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Maximum Words</label>
          <input
            type="number"
            value={maxWords}
            onChange={(e) => onChange({ ...question, maxWords: parseInt(e.target.value) })}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="100"
            max="1000"
          />
          <p className="text-xs text-gray-500 mt-1">
            {taskNumber === 1 ? 'Typically 200 words' : 'Typically 400 words'}
          </p>
        </div>
      </div>

      {/* Grading Criteria */}
      <div>
        <label className="block text-sm font-medium mb-2">Grading Criteria (Optional)</label>
        <div className="space-y-2 p-3 bg-white rounded border">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="task_achievement" defaultChecked className="w-4 h-4" />
            <label htmlFor="task_achievement" className="text-sm">Task Achievement / Response</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="coherence" defaultChecked className="w-4 h-4" />
            <label htmlFor="coherence" className="text-sm">Coherence & Cohesion</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="lexical" defaultChecked className="w-4 h-4" />
            <label htmlFor="lexical" className="text-sm">Lexical Resource</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="grammar" defaultChecked className="w-4 h-4" />
            <label htmlFor="grammar" className="text-sm">Grammatical Accuracy</label>
          </div>
        </div>
      </div>

      {/* Sample Answer (Optional) */}
      <div>
        <label className="block text-sm font-medium mb-2">Sample Answer (Optional)</label>
        <textarea
          value={question.sampleAnswer || ''}
          onChange={(e) => onChange({ ...question, sampleAnswer: e.target.value })}
          placeholder="Provide a sample answer for reference..."
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
        />
      </div>

      {/* Summary */}
      <div className="p-3 bg-gray-50 rounded text-sm">
        <p><strong>Task Type:</strong> Writing Task {taskNumber}</p>
        <p><strong>Word Count:</strong> {minWords} - {maxWords} words</p>
        <p><strong>Grading:</strong> Manual (Teacher Review)</p>
      </div>
    </div>
  );
};

export default WritingTaskEditor;

