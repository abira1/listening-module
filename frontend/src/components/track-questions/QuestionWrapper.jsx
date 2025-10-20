import React from 'react';

// Import all question type components - Listening
import { ShortAnswerListening } from './listening/ShortAnswerListening';
import { MultipleChoiceSingle } from './listening/MultipleChoiceSingle';
import { MultipleChoiceMultiple } from './listening/MultipleChoiceMultiple';
import { MatchingDraggable } from './listening/MatchingDraggable';
import { DiagramLabeling } from './listening/DiagramLabeling';
import { SentenceCompletion as ListeningSentenceCompletion } from './listening/SentenceCompletion';
import { FormCompletion } from './listening/FormCompletion';
import { TableCompletion } from './listening/TableCompletion';
import { FlowchartCompletion } from './listening/FlowchartCompletion';
import { MapLabelling } from './listening/MapLabelling';

// Import all question type components - Reading
import { TrueFalseNotGiven } from './reading/TrueFalseNotGiven';
import { SentenceCompletion as ReadingSentenceCompletion } from './reading/SentenceCompletion';
import { MatchingParagraphs } from './reading/MatchingParagraphs';
import { MatchingHeadings } from './reading/MatchingHeadings';
import { MatchingFeatures } from './reading/MatchingFeatures';
import { MatchingEndings } from './reading/MatchingEndings';
import { NoteCompletion } from './reading/NoteCompletion';
import { SummaryCompletion } from './reading/SummaryCompletion';

// Import all question type components - Writing
import { WritingTask } from './writing/WritingTask';
import { WritingTask1 } from './writing/WritingTask1';
import { WritingTask2 } from './writing/WritingTask2';

/**
 * QuestionWrapper - Universal component that renders the appropriate question type
 * 
 * This is the adapter layer that maps question types to their UI components
 */
export function QuestionWrapper({ question, answer, onChange, questionNumber, readOnly = false }) {
  const { type, payload, image } = question;

  // Component mapping - All 18 IELTS question types
  const componentMap = {
    // Listening types (10)
    'mcq_single': MultipleChoiceSingle,
    'mcq_multiple': MultipleChoiceMultiple,
    'sentence_completion': ListeningSentenceCompletion,
    'form_completion': FormCompletion,
    'table_completion': TableCompletion,
    'flowchart_completion': FlowchartCompletion,
    'fill_gaps': ShortAnswerListening,
    'fill_gaps_short': ShortAnswerListening,
    'matching': MatchingDraggable,
    'map_labelling': MapLabelling,

    // Reading types (6)
    'true_false_ng': TrueFalseNotGiven,
    'matching_headings': MatchingHeadings,
    'matching_features': MatchingFeatures,
    'matching_endings': MatchingEndings,
    'note_completion': NoteCompletion,
    'summary_completion': SummaryCompletion,

    // Writing types (2)
    'writing_task1': WritingTask1,
    'writing_task2': WritingTask2,

    // Legacy type mappings for backward compatibility
    'short_answer_listening': ShortAnswerListening,
    'multiple_choice_single': MultipleChoiceSingle,
    'multiple_choice_multiple': MultipleChoiceMultiple,
    'diagram_labeling': DiagramLabeling,
    'true_false_not_given': TrueFalseNotGiven,
    'sentence_completion_reading': ReadingSentenceCompletion,
    'matching_paragraphs': MatchingParagraphs,
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
    // Listening types
    'mcq_single': 'Multiple Choice (Single)',
    'mcq_multiple': 'Multiple Choice (Multiple)',
    'sentence_completion': 'Sentence Completion',
    'form_completion': 'Form Completion',
    'table_completion': 'Table Completion',
    'flowchart_completion': 'Flowchart Completion',
    'fill_gaps': 'Fill in the Gaps',
    'fill_gaps_short': 'Fill in the Gaps (Short)',
    'matching': 'Matching',
    'map_labelling': 'Map Labelling',

    // Reading types
    'true_false_ng': 'True/False/Not Given',
    'matching_headings': 'Matching Headings',
    'matching_features': 'Matching Features',
    'matching_endings': 'Matching Endings',
    'note_completion': 'Note Completion',
    'summary_completion': 'Summary Completion',

    // Writing types
    'writing_task1': 'Writing Task 1',
    'writing_task2': 'Writing Task 2',

    // Legacy mappings
    'short_answer_listening': 'Short Answer',
    'multiple_choice_single': 'Multiple Choice (Single)',
    'multiple_choice_multiple': 'Multiple Choice (Multiple)',
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
    // Listening types with images
    'map_labelling',
    'diagram_labeling',

    // Writing types with images
    'writing_task1', // Task 1 with charts/diagrams
    'writing_task2',
    'writing_task',

    // Legacy mappings
    'map_labeling',
  ];

  return imageSupported.includes(type);
}
