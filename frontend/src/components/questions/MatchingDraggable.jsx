import React, { useState, useEffect } from 'react';
import { GripVertical, RotateCcw, CheckCircle2 } from 'lucide-react';

/**
 * MatchingDraggable Component
 * 
 * Interactive drag-and-drop matching question type for IELTS tests
 * Example: "Choose SIX answers from the box and write the correct letter, A-G, next to the questions"
 * 
 * Props:
 * - question: Question object with questions array and options array
 * - answers: Object with current answers {questionIndex: optionKey}
 * - onAnswerChange: Function to update answers
 * - questionStartIndex: Starting index for numbering
 */
export function MatchingDraggable({ question, answers, onAnswerChange, questionStartIndex }) {
  const [draggedOption, setDraggedOption] = useState(null);
  const [hoveredQuestion, setHoveredQuestion] = useState(null);

  // Parse question data
  const questions = question.payload?.questions || [];
  const options = question.payload?.options || [];
  
  // Track which options have been used
  const usedOptions = new Set(Object.values(answers || {}).filter(Boolean));

  const handleDragStart = (e, optionKey) => {
    setDraggedOption(optionKey);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', optionKey);
  };

  const handleDragEnd = () => {
    setDraggedOption(null);
    setHoveredQuestion(null);
  };

  const handleDragOver = (e, questionIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setHoveredQuestion(questionIndex);
  };

  const handleDragLeave = () => {
    setHoveredQuestion(null);
  };

  const handleDrop = (e, questionIndex) => {
    e.preventDefault();
    const optionKey = e.dataTransfer.getData('text/plain');
    
    if (optionKey) {
      // Check if this option is already used elsewhere
      const currentAnswers = { ...answers };
      
      // Remove this option from any other question
      Object.keys(currentAnswers).forEach(key => {
        if (currentAnswers[key] === optionKey && parseInt(key) !== questionIndex) {
          delete currentAnswers[key];
          onAnswerChange(parseInt(key), '');
        }
      });
      
      // Set the answer for this question
      onAnswerChange(questionIndex, optionKey);
    }
    
    setHoveredQuestion(null);
    setDraggedOption(null);
  };

  const handleOptionClick = (optionKey) => {
    // Mobile/touch support - click to select, then click question to place
    if (draggedOption === optionKey) {
      setDraggedOption(null);
    } else {
      setDraggedOption(optionKey);
    }
  };

  const handleQuestionClick = (questionIndex) => {
    // If an option is selected (mobile mode), place it
    if (draggedOption) {
      const currentAnswers = { ...answers };
      
      // Remove this option from any other question
      Object.keys(currentAnswers).forEach(key => {
        if (currentAnswers[key] === draggedOption && parseInt(key) !== questionIndex) {
          delete currentAnswers[key];
          onAnswerChange(parseInt(key), '');
        }
      });
      
      onAnswerChange(questionIndex, draggedOption);
      setDraggedOption(null);
    }
  };

  const handleRemoveAnswer = (questionIndex) => {
    onAnswerChange(questionIndex, '');
  };

  const getOptionText = (optionKey) => {
    const option = options.find(opt => opt.key === optionKey);
    return option ? option.text : optionKey;
  };

  return (
    <div className="bg-white rounded-lg p-6">
      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r">
        <p className="text-sm text-gray-700 font-medium">
          {question.payload?.instructions || 
           `Drag and drop the correct letter (${options[0]?.key}-${options[options.length-1]?.key}) next to each question.`}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          💡 Tip: Drag options from the box on the right to the questions on the left, or click to select and place.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT SIDE: Questions with drop zones */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Questions</h3>
          
          {questions.map((q, idx) => {
            const qIndex = questionStartIndex + idx;
            const currentAnswer = answers?.[qIndex];
            const isHovered = hoveredQuestion === qIndex;
            
            return (
              <div
                key={qIndex}
                className={`border-2 rounded-lg p-3 transition-all duration-200 ${
                  isHovered 
                    ? 'border-blue-500 bg-blue-50 shadow-md scale-102' 
                    : currentAnswer 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
                onDragOver={(e) => handleDragOver(e, qIndex)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, qIndex)}
                onClick={() => handleQuestionClick(qIndex)}
              >
                <div className="flex items-start gap-3">
                  <span className="font-bold text-gray-700 min-w-[2rem]">{qIndex}.</span>
                  
                  <div className="flex-1">
                    <p className="text-gray-800 text-sm mb-2">{q.label || q.prompt}</p>
                    
                    {/* Answer Display Area */}
                    <div className="flex items-center gap-2">
                      {currentAnswer ? (
                        <div className="flex items-center gap-2 bg-white border-2 border-green-500 rounded-lg px-3 py-2 shadow-sm">
                          <span className="font-bold text-green-700 text-lg">{currentAnswer}</span>
                          <span className="text-gray-600 text-sm truncate max-w-[200px]">
                            {getOptionText(currentAnswer)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveAnswer(qIndex);
                            }}
                            className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                            title="Remove answer"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg px-4 py-2 text-gray-400 text-sm">
                          {draggedOption ? 'Click here to place' : 'Drop answer here'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT SIDE: Options box */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg p-4 shadow-lg">
            <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
              <GripVertical className="w-4 h-4" />
              Available Options
            </h3>
            
            <div className="space-y-2">
              {options.map((option) => {
                const isUsed = usedOptions.has(option.key);
                const isDragging = draggedOption === option.key;
                const isSelected = draggedOption === option.key;
                
                return (
                  <div
                    key={option.key}
                    draggable={!isUsed}
                    onDragStart={(e) => !isUsed && handleDragStart(e, option.key)}
                    onDragEnd={handleDragEnd}
                    onClick={() => !isUsed && handleOptionClick(option.key)}
                    className={`
                      flex items-start gap-3 p-3 rounded-lg border-2 transition-all duration-200 cursor-move
                      ${isDragging ? 'opacity-50 scale-95' : ''}
                      ${isSelected && !isDragging ? 'border-blue-500 bg-blue-50 shadow-md' : ''}
                      ${isUsed 
                        ? 'bg-gray-200 border-gray-300 cursor-not-allowed opacity-60' 
                        : 'bg-white border-gray-300 hover:border-blue-400 hover:shadow-md hover:scale-102'
                      }
                    `}
                    style={{ cursor: isUsed ? 'not-allowed' : 'grab' }}
                  >
                    <div className="flex-shrink-0">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                        ${isUsed 
                          ? 'bg-gray-300 text-gray-500' 
                          : 'bg-blue-600 text-white'
                        }
                      `}>
                        {option.key}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${isUsed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                        {option.text}
                      </p>
                    </div>
                    
                    {isUsed && (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Usage Counter */}
            <div className="mt-4 pt-3 border-t border-gray-300">
              <p className="text-xs text-gray-600 text-center">
                <span className="font-semibold">{usedOptions.size}</span> of{' '}
                <span className="font-semibold">{options.length}</span> options used
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
