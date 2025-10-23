import React, { useState } from 'react';

const QuestionTypeSelector = ({ selectedType, onTypeChange, types }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const categories = {
    'Listening': [
      'mcq_single',
      'mcq_multiple',
      'sentence_completion',
      'form_completion',
      'table_completion',
      'flowchart_completion',
      'fill_gaps',
      'fill_gaps_short',
      'matching',
      'map_labelling'
    ],
    'Reading': [
      'true_false_ng',
      'matching_headings',
      'matching_features',
      'matching_endings',
      'note_completion',
      'summary_completion'
    ],
    'Writing': [
      'writing_task1',
      'writing_task2'
    ]
  };

  const filteredTypes = Object.entries(categories).reduce((acc, [category, typeList]) => {
    const filtered = typeList.filter(type =>
      types[type].toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        type="text"
        placeholder="Search question types..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Type Grid */}
      <div className="space-y-4">
        {Object.entries(filteredTypes).map(([category, typeList]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">{category}</h3>
            <div className="grid grid-cols-1 gap-2">
              {typeList.map(type => (
                <button
                  key={type}
                  onClick={() => onTypeChange(type)}
                  className={`p-3 text-left rounded border-2 transition-all ${
                    selectedType === type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="font-medium text-sm">{types[type]}</div>
                  <div className="text-xs text-gray-500 mt-1">{type}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Current Selection */}
      <div className="p-3 bg-blue-100 rounded">
        <p className="text-sm">
          <strong>Selected:</strong> {types[selectedType]}
        </p>
      </div>
    </div>
  );
};

export default QuestionTypeSelector;

