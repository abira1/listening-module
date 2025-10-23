import React from 'react';

const MatchingEditor = ({ question, onChange }) => {
  const items = question.items || [];
  const options = question.options || [];
  const matches = question.matches || {};

  const handleAddItem = () => {
    const newItems = [...items, { id: `item_${items.length + 1}`, text: '' }];
    onChange({ ...question, items: newItems });
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    const newMatches = { ...matches };
    delete newMatches[newItems[index]?.id];
    onChange({ ...question, items: newItems, matches: newMatches });
  };

  const handleItemChange = (index, text) => {
    const newItems = [...items];
    newItems[index].text = text;
    onChange({ ...question, items: newItems });
  };

  const handleAddOption = () => {
    const newOptions = [...options, { id: `opt_${options.length + 1}`, text: '' }];
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

  const handleMatchChange = (itemId, optionId) => {
    const newMatches = { ...matches };
    if (newMatches[itemId] === optionId) {
      delete newMatches[itemId];
    } else {
      newMatches[itemId] = optionId;
    }
    onChange({ ...question, matches: newMatches });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Matching Questions</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Items (Left Side) */}
        <div>
          <h4 className="font-medium mb-3">Items to Match</h4>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => handleItemChange(index, e.target.value)}
                  placeholder={`Item ${index + 1}`}
                  className="flex-1 p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                  disabled={items.length <= 1}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleAddItem}
            className="mt-2 w-full p-2 border-2 border-dashed border-blue-300 rounded text-blue-600 hover:bg-blue-50 text-sm"
          >
            + Add Item
          </button>
        </div>

        {/* Options (Right Side) */}
        <div>
          <h4 className="font-medium mb-3">Options to Choose From</h4>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleRemoveOption(index)}
                  className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                  disabled={options.length <= 1}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleAddOption}
            className="mt-2 w-full p-2 border-2 border-dashed border-blue-300 rounded text-blue-600 hover:bg-blue-50 text-sm"
          >
            + Add Option
          </button>
        </div>
      </div>

      {/* Matching Pairs */}
      <div>
        <h4 className="font-medium mb-3">Define Correct Matches</h4>
        <div className="space-y-2 p-3 bg-white rounded border">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-2">
              <span className="text-sm font-medium flex-1">{item.text || 'Item'}</span>
              <span className="text-gray-400">→</span>
              <select
                value={matches[item.id] || ''}
                onChange={(e) => handleMatchChange(item.id, e.target.value)}
                className="flex-1 p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select --</option>
                {options.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.text || 'Option'}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="p-3 bg-gray-50 rounded text-sm">
        <p><strong>Items:</strong> {items.length}</p>
        <p><strong>Options:</strong> {options.length}</p>
        <p><strong>Matches Defined:</strong> {Object.keys(matches).length}</p>
      </div>
    </div>
  );
};

export default MatchingEditor;

