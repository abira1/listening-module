/**
 * Question Types Constants
 * Defines all 18 IELTS question types with metadata and component mappings
 */

// All 18 question types with metadata
export const QUESTION_TYPES = {
  // Listening (10)
  'mcq_single': { 
    name: 'Multiple Choice (Single)', 
    section: 'Listening',
    description: 'Choose one correct answer from 3-4 options'
  },
  'mcq_multiple': { 
    name: 'Multiple Choice (Multiple)', 
    section: 'Listening',
    description: 'Choose 2+ correct answers from 5-7 options'
  },
  'sentence_completion': { 
    name: 'Sentence Completion', 
    section: 'Listening',
    description: 'Complete sentences with words from a list'
  },
  'form_completion': { 
    name: 'Form Completion', 
    section: 'Listening',
    description: 'Fill in form fields with information'
  },
  'table_completion': { 
    name: 'Table Completion', 
    section: 'Listening',
    description: 'Fill in table cells with information'
  },
  'flowchart_completion': { 
    name: 'Flowchart Completion', 
    section: 'Listening',
    description: 'Complete flowchart boxes with information'
  },
  'fill_gaps': { 
    name: 'Fill in the Gaps', 
    section: 'Listening',
    description: 'Fill in blanks in text (longer answers)'
  },
  'fill_gaps_short': { 
    name: 'Fill in the Gaps (Short)', 
    section: 'Listening',
    description: 'Fill in blanks with short answers'
  },
  'matching': { 
    name: 'Matching', 
    section: 'Listening',
    description: 'Match items from two lists'
  },
  'map_labelling': { 
    name: 'Map Labelling', 
    section: 'Listening',
    description: 'Label locations on a map'
  },
  
  // Reading (6)
  'true_false_ng': {
    name: 'True/False/Not Given',
    section: 'Reading',
    description: 'Determine if statements are True, False, or Not Given'
  },
  'true_false_not_given': {
    name: 'True/False/Not Given',
    section: 'Reading',
    description: 'Determine if statements are True, False, or Not Given'
  },
  'short_answer_reading': {
    name: 'Short Answer (Reading)',
    section: 'Reading',
    description: 'Write short answers (1-3 words) to reading questions'
  },
  'matching_headings': { 
    name: 'Matching Headings', 
    section: 'Reading',
    description: 'Match paragraph headings to paragraphs'
  },
  'matching_features': { 
    name: 'Matching Features', 
    section: 'Reading',
    description: 'Match features/characteristics to items'
  },
  'matching_endings': { 
    name: 'Matching Sentence Endings', 
    section: 'Reading',
    description: 'Match sentence beginnings to endings'
  },
  'note_completion': { 
    name: 'Note Completion', 
    section: 'Reading',
    description: 'Complete notes with information from text'
  },
  'summary_completion': { 
    name: 'Summary Completion', 
    section: 'Reading',
    description: 'Complete summary with words from text'
  },
  
  // Writing (2)
  'writing_task1': { 
    name: 'Writing Task 1', 
    section: 'Writing',
    description: 'Descriptive writing (letter, report, etc.)'
  },
  'writing_task2': { 
    name: 'Writing Task 2', 
    section: 'Writing',
    description: 'Essay writing'
  }
};

// Path to type mapping (for AI-generated questions)
export const PATH_TO_TYPE_MAP = {
  'Fill in the gaps short': 'fill_gaps_short',
  'Fill in the gaps': 'fill_gaps',
  'Multiple Choice (one answer)': 'mcq_single',
  'Multiple Choice (more than one)': 'mcq_multiple',
  'True/False/Not Given': 'true_false_ng',
  'Identifying Information': 'true_false_ng',
  'Short Answer': 'short_answer_reading',
  'Matching': 'matching',
  'Sentence Completion': 'sentence_completion',
  'Table Completion': 'table_completion',
  'Flow-chart Completion': 'flowchart_completion',
  'Form Completion': 'form_completion',
  'Note Completion': 'note_completion',
  'Summary Completion': 'summary_completion',
  'Matching Headings': 'matching_headings',
  'Matching Features': 'matching_features',
  'Matching Sentence Endings': 'matching_endings',
  'Labelling on a map': 'map_labelling',
  'writing-part-1': 'writing_task1',
  'writing-part-2': 'writing_task2'
};

// Component imports (lazy loaded)
export const QUESTION_COMPONENTS = {
  // Listening
  'mcq_single': () => import('@/components/track-questions/listening/MultipleChoiceSingle'),
  'mcq_multiple': () => import('@/components/track-questions/listening/MultipleChoiceMultiple'),
  'sentence_completion': () => import('@/components/track-questions/listening/SentenceCompletion'),
  'form_completion': () => import('@/components/track-questions/listening/FormCompletion'),
  'table_completion': () => import('@/components/track-questions/listening/TableCompletion'),
  'flowchart_completion': () => import('@/components/track-questions/listening/FlowchartCompletion'),
  'fill_gaps': () => import('@/components/track-questions/listening/ShortAnswerListening'),
  'fill_gaps_short': () => import('@/components/track-questions/listening/ShortAnswerListening'),
  'matching': () => import('@/components/track-questions/listening/MatchingDraggable'),
  'map_labelling': () => import('@/components/track-questions/listening/DiagramLabeling'),
  
  // Reading
  'true_false_ng': () => import('@/components/track-questions/reading/TrueFalseNotGiven'),
  'true_false_not_given': () => import('@/components/track-questions/reading/TrueFalseNotGiven'),
  'matching_headings': () => import('@/components/track-questions/reading/MatchingHeadings'),
  'matching_features': () => import('@/components/track-questions/reading/MatchingFeatures'),
  'matching_endings': () => import('@/components/track-questions/reading/MatchingEndings'),
  'note_completion': () => import('@/components/track-questions/reading/NoteCompletion'),
  'summary_completion': () => import('@/components/track-questions/reading/SummaryCompletion'),
  
  // Writing
  'writing_task1': () => import('@/components/track-questions/writing/WritingTask1'),
  'writing_task2': () => import('@/components/track-questions/writing/WritingTask2')
};

// Export all valid type codes
export const VALID_TYPES = Object.keys(QUESTION_TYPES);

// Export sections
export const SECTIONS = ['Listening', 'Reading', 'Writing'];

