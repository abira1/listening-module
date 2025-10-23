/**
 * Tests for QuestionDisplay Component
 * Part of Phase 3, Task 3.3
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuestionDisplay from '../QuestionDisplay';

describe('QuestionDisplay Component', () => {
  const mockOnAnswerChange = jest.fn();

  beforeEach(() => {
    mockOnAnswerChange.mockClear();
  });

  test('renders multiple choice question', () => {
    const question = {
      type: 'multiple_choice',
      prompt: 'What is the answer?',
      options: [
        { value: 'A', text: 'Option A' },
        { value: 'B', text: 'Option B' }
      ]
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });

  test('handles multiple choice selection', () => {
    const question = {
      type: 'multiple_choice',
      options: [
        { value: 'A', text: 'Option A' },
        { value: 'B', text: 'Option B' }
      ]
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    const optionA = screen.getByDisplayValue('A');
    fireEvent.click(optionA);
    expect(mockOnAnswerChange).toHaveBeenCalled();
  });

  test('renders multiple select question', () => {
    const question = {
      type: 'multiple_select',
      options: [
        { value: 'A', text: 'Option A' },
        { value: 'B', text: 'Option B' }
      ]
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByText('Option A')).toBeInTheDocument();
  });

  test('renders short answer question', () => {
    const question = {
      type: 'short_answer'
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByPlaceholderText('Enter your answer...')).toBeInTheDocument();
  });

  test('handles short answer input', () => {
    const question = {
      type: 'short_answer'
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    const input = screen.getByPlaceholderText('Enter your answer...');
    fireEvent.change(input, { target: { value: 'My answer' } });
    expect(mockOnAnswerChange).toHaveBeenCalled();
  });

  test('renders essay question', () => {
    const question = {
      type: 'essay'
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByPlaceholderText('Write your essay here...')).toBeInTheDocument();
  });

  test('displays word count for essay', () => {
    const question = {
      type: 'essay'
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{ text: 'This is a test essay' }}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByText(/Words:/)).toBeInTheDocument();
  });

  test('renders matching question', () => {
    const question = {
      type: 'matching',
      leftItems: [{ id: 'L1', text: 'Left Item' }],
      rightItems: [{ id: 'R1', text: 'Right Item' }]
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByText('Left Items')).toBeInTheDocument();
    expect(screen.getByText('Right Items')).toBeInTheDocument();
  });

  test('renders image selection question', () => {
    const question = {
      type: 'image_selection',
      images: [
        { id: 'I1', url: 'image1.jpg', label: 'Image 1' }
      ]
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByText('Image 1')).toBeInTheDocument();
  });

  test('renders audio selection question', () => {
    const question = {
      type: 'audio_selection',
      audioOptions: [
        { id: 'A1', url: 'audio1.mp3', label: 'Audio 1' }
      ]
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByText('Audio 1')).toBeInTheDocument();
  });

  test('renders drag drop question', () => {
    const question = {
      type: 'drag_drop',
      sourceItems: [{ id: 'S1', text: 'Item 1' }],
      dropZones: [{ id: 'D1', text: 'Zone 1' }]
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  test('renders fill blanks question', () => {
    const question = {
      type: 'fill_blanks',
      parts: [
        { type: 'text', text: 'The answer is ' },
        { type: 'blank' }
      ]
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByText('The answer is')).toBeInTheDocument();
  });

  test('renders hotspot question', () => {
    const question = {
      type: 'hotspot',
      imageUrl: 'image.jpg',
      hotspots: [
        { id: 'H1', x: 50, y: 50, label: 'Hotspot 1' }
      ]
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByTitle('Hotspot 1')).toBeInTheDocument();
  });

  test('renders ordering question', () => {
    const question = {
      type: 'ordering',
      items: [
        { id: 'O1', text: 'First' },
        { id: 'O2', text: 'Second' }
      ]
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  test('renders ranking question', () => {
    const question = {
      type: 'ranking',
      items: [
        { id: 'R1', text: 'Item 1' }
      ]
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  test('renders table completion question', () => {
    const question = {
      type: 'table_completion',
      headers: ['Column 1', 'Column 2'],
      rows: [
        [{ text: 'Cell 1', editable: false }, { text: '', editable: true }]
      ]
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByText('Column 1')).toBeInTheDocument();
  });

  test('renders diagram labeling question', () => {
    const question = {
      type: 'diagram_labeling',
      diagramUrl: 'diagram.jpg',
      labels: [
        { id: 'L1', x: 50, y: 50 }
      ]
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByPlaceholderText('Label')).toBeInTheDocument();
  });

  test('renders summary completion question', () => {
    const question = {
      type: 'summary_completion',
      text: 'Summary text here',
      wordBank: ['word1', 'word2']
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByText('Summary text here')).toBeInTheDocument();
    expect(screen.getByText('word1')).toBeInTheDocument();
  });

  test('renders note completion question', () => {
    const question = {
      type: 'note_completion',
      sections: [
        {
          id: 'S1',
          title: 'Section 1',
          items: [{ label: 'Note 1' }]
        }
      ]
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByText('Section 1')).toBeInTheDocument();
  });

  test('renders flowchart question', () => {
    const question = {
      type: 'flowchart',
      nodes: [{ id: 'N1', x: 50, y: 50 }],
      connections: []
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
  });

  test('renders matrix question', () => {
    const question = {
      type: 'matrix',
      columns: ['Col1', 'Col2'],
      rows: ['Row1']
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByText('Col1')).toBeInTheDocument();
  });

  test('renders timeline ordering question', () => {
    const question = {
      type: 'timeline_ordering',
      events: [
        { id: 'E1', text: 'Event 1' }
      ]
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByText('Event 1')).toBeInTheDocument();
  });

  test('renders comparison matrix question', () => {
    const question = {
      type: 'comparison_matrix',
      items: ['Item1'],
      criteria: ['Criteria1']
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByText('Item1')).toBeInTheDocument();
  });

  test('renders cloze test question', () => {
    const question = {
      type: 'cloze_test',
      parts: [
        { type: 'text', text: 'The answer is ' },
        { type: 'blank', options: ['A', 'B'] }
      ]
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByText('The answer is')).toBeInTheDocument();
  });

  test('renders sequencing question', () => {
    const question = {
      type: 'sequencing',
      steps: [
        { id: 'S1', text: 'Step 1' }
      ]
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByText('Step 1')).toBeInTheDocument();
  });

  test('renders concept map question', () => {
    const question = {
      type: 'concept_map',
      concepts: [
        { id: 'C1', label: 'Concept 1' }
      ]
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByText('Concept 1')).toBeInTheDocument();
  });

  test('handles unknown question type', () => {
    const question = {
      type: 'unknown_type'
    };

    render(
      <QuestionDisplay
        question={question}
        answer={{}}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(screen.getByText(/Unknown question type/)).toBeInTheDocument();
  });

  test('preserves answer state', () => {
    const question = {
      type: 'multiple_choice',
      options: [
        { value: 'A', text: 'Option A' }
      ]
    };

    const { rerender } = render(
      <QuestionDisplay
        question={question}
        answer={{ selected: 'A' }}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    const optionA = screen.getByDisplayValue('A');
    expect(optionA).toBeChecked();

    rerender(
      <QuestionDisplay
        question={question}
        answer={{ selected: 'A' }}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    expect(optionA).toBeChecked();
  });
});

