import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function AIPrompts() {
  const [selectedType, setSelectedType] = useState('listening');
  const [copied, setCopied] = useState(false);

  const prompts = {
    listening: `You are an IELTS test parser. Extract questions from this IELTS Listening test and format as JSON.

Test Type: IELTS Listening
Sections: 4 sections, 40 questions total

IMPORTANT: Identify the correct question type from this list:

1. "short_answer" - Fill in the blank questions (Write NO MORE THAN TWO WORDS)
2. "multiple_choice" - Choose from A, B, C, D options
3. "map_labeling" - Label locations on a map (A-I options)
4. "diagram_labeling" - Fill in parts of a diagram
5. "matching_draggable" - Match items by dragging options (e.g., "Choose SIX answers from the box")
   Format: {
     "questions": [{"label": "Question text", "answer_key": "A"}],
     "options": [{"key": "A", "text": "Option text"}]
   }
6. "table_completion" - Complete a table with words
7. "note_completion" - Complete notes with words
8. "sentence_completion" - Complete sentences
9. "flow_chart_completion" - Complete flow chart steps

For each question, extract:
- Question number (1-40)
- Section (1-4)
- Question type (from list above)
- Prompt/question text (keep exactly as is, including blanks __________)
- Options (if applicable)
- Answer key (correct answer)
- Max words (if applicable, e.g., "TWO WORDS" = 2)
- Image URL (if map/diagram, otherwise null)

Return ONLY valid JSON in this EXACT format (no additional text before or after):

{
  "test_type": "listening",
  "title": "IELTS Listening Practice Test X",
  "description": "Complete IELTS Listening test with 4 sections and 40 questions",
  "duration_seconds": 2004,
  "audio_url": "PASTE_YOUR_AUDIO_URL_HERE",
  "sections": [
    {
      "index": 1,
      "title": "Section 1",
      "instructions": "Complete the notes below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
      "questions": [
        {
          "index": 1,
          "type": "short_answer",
          "prompt": "Job enquiry at: __________ shop",
          "answer_key": "part-time",
          "max_words": 2,
          "options": null,
          "image_url": null
        },
        {
          "index": 4,
          "type": "multiple_choice",
          "prompt": "What is the hourly rate?",
          "answer_key": "C",
          "max_words": null,
          "options": ["A. £7.50", "B. £8.00", "C. £8.50"],
          "image_url": null
        },
        {
          "index": 11,
          "type": "map_labeling",
          "prompt": "Ferry Terminal",
          "answer_key": "A",
          "max_words": null,
          "options": ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
          "image_url": "https://example.com/map.jpg"
        },
        {
          "index": 14,
          "type": "matching_draggable",
          "prompt": "Match each statement to the correct person.",
          "answer_key": null,
          "payload": {
            "instructions": "Choose SIX answers from the box and write the correct letter, A-G, next to the questions.",
            "questions": [
              {"label": "First person's achievement", "answer_key": "A"},
              {"label": "Second person's achievement", "answer_key": "C"}
            ],
            "options": [
              {"key": "A", "text": "Invented the telephone"},
              {"key": "B", "text": "Discovered electricity"},
              {"key": "C", "text": "Created the internet"}
            ]
          }
        }
      ]
    }
  ]
}

IMPORTANT RULES:
- Extract ALL 40 questions across ALL 4 sections
- Keep question text EXACTLY as written in PDF
- For short_answer questions, include the blank (__________)
- Answer keys must be exact (case-insensitive for text, exact letter for multiple choice)
- Audio URL is REQUIRED - Use format: "PASTE_YOUR_AUDIO_URL_HERE" as placeholder
- For matching_draggable questions, use the nested format shown above with "questions" and "options" arrays
- Identify question types carefully - look for keywords like "Choose from the box", "Match", "Complete the table"

AUDIO URL INSTRUCTIONS:
The audio_url field is CRITICAL for listening tests. You should:
1. Use a reliable audio hosting service (JukeHost, Cloudinary, Google Drive with direct link)
2. Make sure it's a DIRECT link ending in .mp3, .wav, or .m4a
3. If not available, use: "PASTE_YOUR_AUDIO_URL_HERE" as placeholder

Now extract from this test:
[PASTE YOUR PDF TEXT HERE]`,

    reading: `You are an IELTS test parser. Extract questions from this IELTS Reading test and format as JSON.

Test Type: IELTS Academic Reading
Sections: 3 passages, 40 questions total

For each passage, extract:
- Passage number and title
- FULL passage text (all paragraphs, labeled A, B, C, etc. if applicable)
- Instructions
- All questions with correct types

IDENTIFY THE CORRECT QUESTION TYPE:

1. "true_false_not_given" - TRUE/FALSE/NOT GIVEN questions
2. "yes_no_not_given" - YES/NO/NOT GIVEN questions
3. "matching_paragraphs" - Which paragraph contains information (answer with paragraph letter A, B, C)
4. "matching_headings" - Match headings to paragraphs (Roman numerals i, ii, iii)
5. "matching_information" - Which paragraph contains specific information
6. "matching_features" - Match features to categories (e.g., match scientists to discoveries)
7. "matching_sentence_endings" - Match sentence beginnings to endings
8. "matching_draggable" - Drag and drop matching (e.g., "Choose SIX answers from the box A-G")
   Format: {
     "questions": [{"label": "Statement/question", "answer_key": "A"}],
     "options": [{"key": "A", "text": "Full option text"}]
   }
9. "sentence_completion" - Complete sentences with words from passage
10. "sentence_completion_wordlist" - Complete sentences from a given word list
11. "short_answer_reading" - Short answer questions (Write NO MORE THAN...)
12. "table_completion" - Complete a table
13. "flow_chart_completion" - Complete a flow chart
14. "diagram_completion" - Label a diagram
15. "note_completion" - Complete notes
16. "summary_completion" - Complete a summary

Return ONLY valid JSON in this EXACT format:

{
  "test_type": "reading",
  "title": "IELTS Reading Practice Test X",
  "description": "Complete IELTS Academic Reading test with 3 passages and 40 questions",
  "duration_seconds": 3600,
  "audio_url": null,
  "sections": [
    {
      "index": 1,
      "title": "Passage 1: The History of Chocolate",
      "passage_text": "A. The cocoa tree was first cultivated by the Maya, Toltec, and Aztec peoples...\\n\\nB. When the Spanish conquistadors arrived...\\n\\n[FULL PASSAGE TEXT HERE - 800-1000 words]",
      "instructions": "Questions 1-13",
      "questions": [
        {
          "index": 1,
          "type": "matching_paragraphs",
          "prompt": "Which paragraph contains the following information? The early history of chocolate cultivation.",
          "answer_key": "A",
          "options": null,
          "wordlist": null
        },
        {
          "index": 6,
          "type": "sentence_completion",
          "prompt": "The cocoa tree was first cultivated in __________.",
          "answer_key": "Central America",
          "options": null,
          "wordlist": null
        },
        {
          "index": 9,
          "type": "true_false_not_given",
          "prompt": "Chocolate was initially consumed as a beverage.",
          "answer_key": "TRUE",
          "options": ["TRUE", "FALSE", "NOT GIVEN"],
          "wordlist": null
        },
        {
          "index": 12,
          "type": "matching_draggable",
          "prompt": "Match each discovery to the correct scientist.",
          "answer_key": null,
          "payload": {
            "instructions": "Choose SIX answers from the box and write the correct letter, A-G, next to the questions.",
            "questions": [
              {"label": "14. Theory of Relativity", "answer_key": "A"},
              {"label": "15. Laws of Motion", "answer_key": "C"},
              {"label": "16. Vaccination", "answer_key": "B"}
            ],
            "options": [
              {"key": "A", "text": "Albert Einstein"},
              {"key": "B", "text": "Louis Pasteur"},
              {"key": "C", "text": "Isaac Newton"},
              {"key": "D", "text": "Marie Curie"}
            ]
          }
        }
      ]
    }
  ]
}

IMPORTANT RULES:
- Extract ALL 40 questions across ALL 3 passages
- Include COMPLETE passage text (800-1000 words each)
- Keep paragraph labels (A, B, C, etc.) if present
- Answer keys must be EXACT as shown in answer key section
- For matching_draggable questions, create the nested structure with "questions" and "options" arrays
- Look for keywords: "Choose from the box", "Match the following", "Write the correct letter"
- Common IELTS formats:
  * Questions 1-5: matching_paragraphs (Which paragraph contains...)
  * Questions 6-10: sentence_completion or true_false_not_given
  * Questions 11-13: matching_draggable or matching_features
- Audio URL should be null for reading tests

Now extract from this test:
[PASTE YOUR PDF TEXT HERE]`,

    writing: `You are an IELTS test parser. Extract tasks from this IELTS Writing test and format as JSON.

Test Type: IELTS Academic Writing
Tasks: 2 tasks (Task 1: 150 words minimum, Task 2: 250 words minimum)

Return ONLY valid JSON in this EXACT format:

{
  "test_type": "writing",
  "title": "IELTS Writing Practice Test X",
  "description": "Complete IELTS Academic Writing test with 2 tasks",
  "duration_seconds": 3600,
  "audio_url": null,
  "sections": [
    {
      "index": 1,
      "title": "Writing Task 1",
      "instructions": "You should spend about 20 minutes on this task.",
      "questions": [
        {
          "index": 1,
          "type": "writing_task",
          "prompt": "The chart below shows the export of milk from Italy, Russia, and Poland between 2008 and 2012. Summarize the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
          "answer_key": null,
          "min_words": 150,
          "task_number": 1,
          "chart_image": "https://example.com/chart.jpg",
          "instructions": "You should spend about 20 minutes on this task."
        }
      ]
    },
    {
      "index": 2,
      "title": "Writing Task 2",
      "instructions": "You should spend about 40 minutes on this task.",
      "questions": [
        {
          "index": 2,
          "type": "writing_task",
          "prompt": "The international media often shows negative news about a country or region. To what extent do you agree or disagree with this statement? Write at least 250 words.",
          "answer_key": null,
          "min_words": 250,
          "task_number": 2,
          "chart_image": null,
          "instructions": "You should spend about 40 minutes on this task."
        }
      ]
    }
  ]
}

IMPORTANT:
- Extract BOTH tasks (Task 1 and Task 2)
- Include min_words requirements
- Include chart_image URL for Task 1 if applicable
- answer_key should always be null for writing tasks

Now extract from this test:
[PASTE YOUR PDF TEXT HERE]`
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-white border-2 border-blue-300 rounded-lg p-6 shadow-md">
      <h3 className="text-xl font-bold mb-4 text-blue-900">📝 AI Extraction Prompts</h3>
      
      {/* Test Type Selector */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setSelectedType('listening')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedType === 'listening'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🎧 Listening
        </button>
        <button
          onClick={() => setSelectedType('reading')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedType === 'reading'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📖 Reading
        </button>
        <button
          onClick={() => setSelectedType('writing')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedType === 'writing'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ✍️ Writing
        </button>
      </div>

      {/* Prompt Display */}
      <div className="relative">
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={() => handleCopy(prompts[selectedType])}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-md"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Prompt
              </>
            )}
          </button>
        </div>
        
        <pre className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
          {prompts[selectedType]}
        </pre>
      </div>

      {/* Usage Instructions */}
      <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
        <p className="text-sm text-yellow-800">
          <strong>💡 How to Use:</strong>
        </p>
        <ol className="text-sm text-yellow-800 mt-2 ml-4 list-decimal space-y-1">
          <li>Copy this prompt using the button above</li>
          <li>Open ChatGPT, Claude, or Gemini</li>
          <li>Paste the prompt and add your PDF text at the end</li>
          <li>Copy the JSON output (only the JSON, no other text)</li>
          <li>Paste it in the textarea below and validate</li>
        </ol>
      </div>
    </div>
  );
}