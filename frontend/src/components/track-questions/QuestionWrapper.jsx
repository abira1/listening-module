import React from 'react';

// Import all question type components
import { ShortAnswerListening } from './listening/ShortAnswerListening';
import { MultipleChoiceSingle } from './listening/MultipleChoiceSingle';
import { MultipleChoiceMultiple } from './listening/MultipleChoiceMultiple';
import { MatchingDraggable } from './listening/MatchingDraggable';
import { DiagramLabeling } from './listening/DiagramLabeling';

import { TrueFalseNotGiven } from './reading/TrueFalseNotGiven';
import { SentenceCompletion } from './reading/SentenceCompletion';
import { MatchingParagraphs } from './reading/MatchingParagraphs';

import { WritingTask } from './writing/WritingTask';

/**
 * QuestionWrapper - Universal component that renders the appropriate question type
 * 
 * This is the adapter layer that maps question types to their UI components
 */
export function QuestionWrapper({ question, answer, onChange, questionNumber, readOnly = false }) {
  const { type, payload, image } = question;

  // Component mapping
  const componentMap = {
    // Listening types
    'short_answer_listening': ShortAnswerListening,
    'multiple_choice_single': MultipleChoiceSingle,
    'multiple_choice_multiple': MultipleChoiceMultiple,
    'matching': MatchingDraggable,
    'diagram_labeling': DiagramLabeling,
    
    // Reading types
    'true_false_not_given': TrueFalseNotGiven,
    'sentence_completion_reading': SentenceCompletion,
    'matching_paragraphs': MatchingParagraphs,
    
    // Writing type
    'writing_task': WritingTask,
  };

  const QuestionComponent = componentMap[type];

  if (!QuestionComponent) {
    return (
      <div className="bg-red-50 border border-red-300 rounded-lg p-4">
        <p className="text-red-700 font-medium">
          ⚠️ Unknown question type: <code className="bg-red-100 px-2 py-1 rounded">{type}</code>
        </p>
        <p className="text-sm text-red-600 mt-2">
          This question type is not yet implemented. Please contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="question-wrapper">
      {/* Optional image display for question types that support it */}
      {image && image.url && (
        <div className="mb-4">
          <img 
            src={image.url} 
            alt={image.alt || "Question image"} 
            className="max-w-full h-auto rounded-lg shadow-md"
          />
        </div>
      )}

      {/* Render the specific question type component */}
      <QuestionComponent
        question={question}
        answer={answer}
        onChange={(newAnswer) => onChange(newAnswer)}
        questionNumber={questionNumber}
        readOnly={readOnly}
      />
    </div>
  );
}

/**
 * Helper function to get question type display name
 */
export function getQuestionTypeDisplayName(type) {
  const names = {
    'short_answer_listening': 'Short Answer',
    'multiple_choice_single': 'Multiple Choice (Single)',
    'multiple_choice_multiple': 'Multiple Choice (Multiple)',
    'matching': 'Matching',
    'diagram_labeling': 'Diagram Labeling',
    'true_false_not_given': 'True/False/Not Given',
    'sentence_completion_reading': 'Sentence Completion',
    'matching_paragraphs': 'Matching Paragraphs',
    'writing_task': 'Writing Task',
  };
  
  return names[type] || type;
}

/**
 * Helper function to check if question type supports images
 */
export function questionSupportsImage(type) {
  const imageSupported = [
    'diagram_labeling',
    'map_labeling',
    'writing_task', // Task 1 with charts
  ];
  
  return imageSupported.includes(type);
}
