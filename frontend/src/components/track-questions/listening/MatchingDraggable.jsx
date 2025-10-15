import React, { useState } from 'react';
import { GripVertical, RotateCcw, CheckCircle2 } from 'lucide-react';

/**
 * Matching Draggable Component
 * Interactive drag-and-drop matching from reference repo
 */
export function MatchingDraggable({ question, answer, onChange, questionNumber, readOnly }) {
  const [draggedOption, setDraggedOption] = useState(null);
  const [hoveredQuestion, setHoveredQuestion] = useState(null);

  const { instructions, left_items = [], right_items = [] } = question.payload;
  
  // Answer is an object mapping left item IDs to right item keys
  const answers = answer || {};
  const usedOptions = new Set(Object.values(answers).filter(Boolean));

  const handleDragStart = (e, optionKey) => {
    setDraggedOption(optionKey);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', optionKey);
  };

  const handleDrop = (e, itemId) => {
    e.preventDefault();
    const optionKey = e.dataTransfer.getData('text/plain');
    
    if (optionKey) {
      // Update answers
      const newAnswers = { ...answers };
      
      // Remove this option from any other item
      Object.keys(newAnswers).forEach(key => {
        if (newAnswers[key] === optionKey && key !== String(itemId)) {
          delete newAnswers[key];
        }
      });
      
      newAnswers[String(itemId)] = optionKey;
      onChange(newAnswers);
    }
    
    setHoveredQuestion(null);
    setDraggedOption(null);
  };

  const handleOptionClick = (optionKey) => {
    if (readOnly) return;
    setDraggedOption(draggedOption === optionKey ? null : optionKey);
  };

  const handleItemClick = (itemId) => {
    if (readOnly || !draggedOption) return;
    
    const newAnswers = { ...answers };
    Object.keys(newAnswers).forEach(key => {
      if (newAnswers[key] === draggedOption && key !== String(itemId)) {
        delete newAnswers[key];
      }
    });
    
    newAnswers[String(itemId)] = draggedOption;
    onChange(newAnswers);
    setDraggedOption(null);
  };

  const handleRemoveAnswer = (itemId) => {
    const newAnswers = { ...answers };
    delete newAnswers[String(itemId)];
    onChange(newAnswers);
  };

  const getOptionText = (optionKey) => {
    const option = right_items.find(opt => opt.key === optionKey);
    return option ? option.text : optionKey;
  };

  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      {/* Instructions */}
      <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r">
        <p className="text-sm text-gray-700 font-medium">
          {instructions || 'Drag and drop or click to match items'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Questions */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-700 mb-3">QUESTIONS</h3>
          
          {left_items.map((item) => {
            const currentAnswer = answers[String(item.id)];
            const isHovered = hoveredQuestion === item.id;
            
            return (
              <div
                key={item.id}
                className={`border-2 rounded-lg p-3 transition-all ${
                  isHovered 
                    ? 'border-blue-500 bg-blue-50' 
                    : currentAnswer 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'
                } ${readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                onDragOver={(e) => { e.preventDefault(); setHoveredQuestion(item.id); }}
                onDragLeave={() => setHoveredQuestion(null)}
                onDrop={(e) => handleDrop(e, item.id)}
                onClick={() => handleItemClick(item.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="font-bold text-gray-700 min-w-[2rem]">{item.id}.</span>
                  
                  <div className="flex-1">
                    <p className="text-gray-800 text-sm mb-2">{item.text}</p>
                    
                    {currentAnswer ? (
                      <div className="flex items-center gap-2 bg-white border-2 border-green-500 rounded-lg px-3 py-2">
                        <span className="font-bold text-green-700">{currentAnswer}</span>
                        <span className="text-gray-600 text-sm truncate">
                          {getOptionText(currentAnswer)}
                        </span>
                        {!readOnly && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemoveAnswer(item.id); }}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg px-4 py-2 text-gray-400 text-sm">
                        {draggedOption ? 'Click to place' : 'Drop here'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: Options */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <GripVertical className="w-4 h-4" />
              OPTIONS
            </h3>
            
            <div className="space-y-2">
              {right_items.map((option) => {
                const isUsed = usedOptions.has(option.key);
                const isSelected = draggedOption === option.key;
                
                return (
                  <div
                    key={option.key}
                    draggable={!isUsed && !readOnly}
                    onDragStart={(e) => !isUsed && !readOnly && handleDragStart(e, option.key)}
                    onDragEnd={() => { setDraggedOption(null); setHoveredQuestion(null); }}
                    onClick={() => handleOptionClick(option.key)}
                    className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                      isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : ''
                    } ${
                      isUsed 
                        ? 'bg-gray-200 border-gray-300 opacity-60' 
                        : 'bg-white border-gray-300 hover:border-blue-400 cursor-move'
                    } ${readOnly ? 'cursor-not-allowed' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      isUsed ? 'bg-gray-300 text-gray-500' : 'bg-blue-600 text-white'
                    }`}>
                      {option.key}
                    </div>
                    
                    <p className={`text-sm flex-1 ${
                      isUsed ? 'text-gray-500 line-through' : 'text-gray-800'
                    }`}>
                      {option.text}
                    </p>
                    
                    {isUsed && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}