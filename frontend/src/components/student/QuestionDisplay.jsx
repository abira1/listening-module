/**
 * Question Display Component
 * Handles rendering of all 23 question types
 * Part of Phase 3, Task 3.3
 */

import React, { useState } from 'react';
import './QuestionDisplay.css';

const QuestionDisplay = ({ question, answer, onAnswerChange }) => {
  const [selectedOptions, setSelectedOptions] = useState(answer?.selected || []);
  const [textAnswer, setTextAnswer] = useState(answer?.text || '');
  const [matchingAnswers, setMatchingAnswers] = useState(answer?.matching || {});

  const handleMultipleChoice = (value) => {
    onAnswerChange({ type: 'multiple_choice', selected: value });
  };

  const handleMultipleSelect = (value) => {
    const newSelected = selectedOptions.includes(value)
      ? selectedOptions.filter(v => v !== value)
      : [...selectedOptions, value];
    setSelectedOptions(newSelected);
    onAnswerChange({ type: 'multiple_select', selected: newSelected });
  };

  const handleTextInput = (value) => {
    setTextAnswer(value);
    onAnswerChange({ type: 'text', text: value });
  };

  const handleMatching = (leftId, rightId) => {
    const newMatching = { ...matchingAnswers, [leftId]: rightId };
    setMatchingAnswers(newMatching);
    onAnswerChange({ type: 'matching', matching: newMatching });
  };

  const renderMultipleChoice = () => (
    <div className="question-content">
      <div className="options-list">
        {question.options?.map(option => (
          <label key={option.value} className="option-item">
            <input
              type="radio"
              name="answer"
              value={option.value}
              checked={answer?.selected === option.value}
              onChange={(e) => handleMultipleChoice(e.target.value)}
            />
            <span className="option-text">{option.text}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderMultipleSelect = () => (
    <div className="question-content">
      <div className="options-list">
        {question.options?.map(option => (
          <label key={option.value} className="option-item">
            <input
              type="checkbox"
              value={option.value}
              checked={selectedOptions.includes(option.value)}
              onChange={(e) => handleMultipleSelect(e.target.value)}
            />
            <span className="option-text">{option.text}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderShortAnswer = () => (
    <div className="question-content">
      <input
        type="text"
        className="text-input"
        placeholder="Enter your answer..."
        value={textAnswer}
        onChange={(e) => handleTextInput(e.target.value)}
      />
    </div>
  );

  const renderEssay = () => (
    <div className="question-content">
      <textarea
        className="text-area"
        placeholder="Write your essay here..."
        rows="10"
        value={textAnswer}
        onChange={(e) => handleTextInput(e.target.value)}
      />
      <div className="word-count">
        Words: {textAnswer.split(/\s+/).filter(w => w.length > 0).length}
      </div>
    </div>
  );

  const renderMatching = () => (
    <div className="question-content">
      <div className="matching-container">
        <div className="matching-column">
          <h4>Left Items</h4>
          {question.leftItems?.map(item => (
            <div key={item.id} className="matching-item">
              {item.text}
            </div>
          ))}
        </div>
        <div className="matching-column">
          <h4>Right Items</h4>
          {question.rightItems?.map(item => (
            <div key={item.id} className="matching-item">
              {item.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderImageSelection = () => (
    <div className="question-content">
      <div className="image-grid">
        {question.images?.map(img => (
          <label key={img.id} className="image-option">
            <input
              type="radio"
              name="image"
              value={img.id}
              checked={answer?.selected === img.id}
              onChange={(e) => handleMultipleChoice(e.target.value)}
            />
            <img src={img.url} alt={img.label} />
            <span>{img.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderAudioSelection = () => (
    <div className="question-content">
      <div className="audio-options">
        {question.audioOptions?.map(audio => (
          <label key={audio.id} className="audio-option">
            <input
              type="radio"
              name="audio"
              value={audio.id}
              checked={answer?.selected === audio.id}
              onChange={(e) => handleMultipleChoice(e.target.value)}
            />
            <audio controls>
              <source src={audio.url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <span>{audio.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderDragDrop = () => (
    <div className="question-content">
      <div className="drag-drop-container">
        <div className="source-items">
          {question.sourceItems?.map(item => (
            <div
              key={item.id}
              className="draggable-item"
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', item.id)}
            >
              {item.text}
            </div>
          ))}
        </div>
        <div className="drop-zones">
          {question.dropZones?.map(zone => (
            <div
              key={zone.id}
              className="drop-zone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const itemId = e.dataTransfer.getData('text/plain');
                handleMatching(zone.id, itemId);
              }}
            >
              {matchingAnswers[zone.id] ? (
                <span>{matchingAnswers[zone.id]}</span>
              ) : (
                <span className="placeholder">Drop here</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFillBlanks = () => (
    <div className="question-content">
      <div className="fill-blanks">
        {question.parts?.map((part, idx) => (
          <span key={idx}>
            {part.type === 'text' ? (
              part.text
            ) : (
              <input
                type="text"
                className="blank-input"
                placeholder="___"
                value={answer?.blanks?.[idx] || ''}
                onChange={(e) => {
                  const newBlanks = [...(answer?.blanks || [])];
                  newBlanks[idx] = e.target.value;
                  onAnswerChange({ type: 'fill_blanks', blanks: newBlanks });
                }}
              />
            )}
          </span>
        ))}
      </div>
    </div>
  );

  const renderHotspot = () => (
    <div className="question-content">
      <div className="hotspot-container">
        <img src={question.imageUrl} alt="Hotspot" className="hotspot-image" />
        {question.hotspots?.map(hotspot => (
          <button
            key={hotspot.id}
            className={`hotspot ${answer?.selected === hotspot.id ? 'selected' : ''}`}
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`
            }}
            onClick={() => handleMultipleChoice(hotspot.id)}
            title={hotspot.label}
          >
            {hotspot.label}
          </button>
        ))}
      </div>
    </div>
  );

  const renderOrdering = () => (
    <div className="question-content">
      <div className="ordering-list">
        {question.items?.map((item, idx) => (
          <div key={item.id} className="ordering-item">
            <span className="order-number">{idx + 1}</span>
            <span className="order-text">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRanking = () => (
    <div className="question-content">
      <div className="ranking-list">
        {question.items?.map(item => (
          <div key={item.id} className="ranking-item">
            <input
              type="number"
              min="1"
              max={question.items.length}
              placeholder="Rank"
              value={answer?.ranking?.[item.id] || ''}
              onChange={(e) => {
                const newRanking = { ...answer?.ranking, [item.id]: e.target.value };
                onAnswerChange({ type: 'ranking', ranking: newRanking });
              }}
            />
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTableCompletion = () => (
    <div className="question-content">
      <table className="completion-table">
        <thead>
          <tr>
            {question.headers?.map(header => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {question.rows?.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.map((cell, cellIdx) => (
                <td key={cellIdx}>
                  {cell.editable ? (
                    <input
                      type="text"
                      value={answer?.table?.[rowIdx]?.[cellIdx] || ''}
                      onChange={(e) => {
                        const newTable = answer?.table || [];
                        if (!newTable[rowIdx]) newTable[rowIdx] = [];
                        newTable[rowIdx][cellIdx] = e.target.value;
                        onAnswerChange({ type: 'table', table: newTable });
                      }}
                    />
                  ) : (
                    cell.text
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderDiagramLabeling = () => (
    <div className="question-content">
      <div className="diagram-container">
        <img src={question.diagramUrl} alt="Diagram" className="diagram-image" />
        {question.labels?.map(label => (
          <div
            key={label.id}
            className="label-point"
            style={{ left: `${label.x}%`, top: `${label.y}%` }}
          >
            <input
              type="text"
              placeholder="Label"
              value={answer?.labels?.[label.id] || ''}
              onChange={(e) => {
                const newLabels = { ...answer?.labels, [label.id]: e.target.value };
                onAnswerChange({ type: 'diagram_labeling', labels: newLabels });
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderSummaryCompletion = () => (
    <div className="question-content">
      <div className="summary-text">
        {question.text}
      </div>
      <div className="word-bank">
        {question.wordBank?.map(word => (
          <button
            key={word}
            className={`word-option ${answer?.selected?.includes(word) ? 'selected' : ''}`}
            onClick={() => {
              const newSelected = answer?.selected?.includes(word)
                ? answer.selected.filter(w => w !== word)
                : [...(answer?.selected || []), word];
              onAnswerChange({ type: 'summary_completion', selected: newSelected });
            }}
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );

  const renderNoteCompletion = () => (
    <div className="question-content">
      <div className="notes-container">
        {question.sections?.map(section => (
          <div key={section.id} className="note-section">
            <h4>{section.title}</h4>
            {section.items?.map((item, idx) => (
              <div key={idx} className="note-item">
                <span>{item.label}:</span>
                <input
                  type="text"
                  placeholder="Enter note..."
                  value={answer?.notes?.[section.id]?.[idx] || ''}
                  onChange={(e) => {
                    const newNotes = answer?.notes || {};
                    if (!newNotes[section.id]) newNotes[section.id] = [];
                    newNotes[section.id][idx] = e.target.value;
                    onAnswerChange({ type: 'note_completion', notes: newNotes });
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  const renderFlowChart = () => (
    <div className="question-content">
      <div className="flowchart-container">
        <svg width="100%" height="400" className="flowchart-svg">
          {question.connections?.map(conn => (
            <line
              key={`line-${conn.from}-${conn.to}`}
              x1={conn.fromX}
              y1={conn.fromY}
              x2={conn.toX}
              y2={conn.toY}
              stroke="#d1d5db"
              strokeWidth="2"
            />
          ))}
        </svg>
        {question.nodes?.map(node => (
          <div
            key={node.id}
            className="flowchart-node"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <input
              type="text"
              placeholder="Enter text..."
              value={answer?.flowchart?.[node.id] || ''}
              onChange={(e) => {
                const newFlowchart = { ...answer?.flowchart, [node.id]: e.target.value };
                onAnswerChange({ type: 'flowchart', flowchart: newFlowchart });
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderMatrix = () => (
    <div className="question-content">
      <table className="matrix-table">
        <thead>
          <tr>
            <th></th>
            {question.columns?.map(col => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {question.rows?.map((row, rowIdx) => (
            <tr key={rowIdx}>
              <td className="row-header">{row}</td>
              {question.columns?.map((col, colIdx) => (
                <td key={colIdx}>
                  <input
                    type="checkbox"
                    checked={answer?.matrix?.[rowIdx]?.[colIdx] || false}
                    onChange={(e) => {
                      const newMatrix = answer?.matrix || [];
                      if (!newMatrix[rowIdx]) newMatrix[rowIdx] = [];
                      newMatrix[rowIdx][colIdx] = e.target.checked;
                      onAnswerChange({ type: 'matrix', matrix: newMatrix });
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderTimelineOrdering = () => (
    <div className="question-content">
      <div className="timeline">
        {question.events?.map((event, idx) => (
          <div key={event.id} className="timeline-event">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <input
                type="number"
                min="1"
                max={question.events.length}
                placeholder="Order"
                value={answer?.timeline?.[event.id] || ''}
                onChange={(e) => {
                  const newTimeline = { ...answer?.timeline, [event.id]: e.target.value };
                  onAnswerChange({ type: 'timeline_ordering', timeline: newTimeline });
                }}
              />
              <span>{event.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderComparisonMatrix = () => (
    <div className="question-content">
      <table className="comparison-table">
        <thead>
          <tr>
            <th>Item</th>
            {question.criteria?.map(criterion => (
              <th key={criterion}>{criterion}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {question.items?.map((item, idx) => (
            <tr key={idx}>
              <td>{item}</td>
              {question.criteria?.map((criterion, colIdx) => (
                <td key={colIdx}>
                  <select
                    value={answer?.comparison?.[idx]?.[colIdx] || ''}
                    onChange={(e) => {
                      const newComparison = answer?.comparison || [];
                      if (!newComparison[idx]) newComparison[idx] = [];
                      newComparison[idx][colIdx] = e.target.value;
                      onAnswerChange({ type: 'comparison_matrix', comparison: newComparison });
                    }}
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="maybe">Maybe</option>
                  </select>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderClozeTest = () => (
    <div className="question-content">
      <div className="cloze-text">
        {question.parts?.map((part, idx) => (
          <span key={idx}>
            {part.type === 'text' ? (
              part.text
            ) : (
              <select
                className="cloze-select"
                value={answer?.cloze?.[idx] || ''}
                onChange={(e) => {
                  const newCloze = [...(answer?.cloze || [])];
                  newCloze[idx] = e.target.value;
                  onAnswerChange({ type: 'cloze_test', cloze: newCloze });
                }}
              >
                <option value="">Select...</option>
                {part.options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
          </span>
        ))}
      </div>
    </div>
  );

  const renderSequencing = () => (
    <div className="question-content">
      <div className="sequencing-container">
        {question.steps?.map((step, idx) => (
          <div key={step.id} className="sequence-step">
            <div className="step-number">{idx + 1}</div>
            <div className="step-content">
              <p>{step.text}</p>
              <input
                type="text"
                placeholder="Your answer..."
                value={answer?.sequence?.[step.id] || ''}
                onChange={(e) => {
                  const newSequence = { ...answer?.sequence, [step.id]: e.target.value };
                  onAnswerChange({ type: 'sequencing', sequence: newSequence });
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderConceptMap = () => (
    <div className="question-content">
      <div className="concept-map">
        {question.concepts?.map(concept => (
          <div key={concept.id} className="concept-node">
            <div className="concept-label">{concept.label}</div>
            <input
              type="text"
              placeholder="Connection..."
              value={answer?.conceptMap?.[concept.id] || ''}
              onChange={(e) => {
                const newMap = { ...answer?.conceptMap, [concept.id]: e.target.value };
                onAnswerChange({ type: 'concept_map', conceptMap: newMap });
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  // Render based on question type
  const renderQuestion = () => {
    switch (question.type) {
      case 'multiple_choice':
        return renderMultipleChoice();
      case 'multiple_select':
        return renderMultipleSelect();
      case 'short_answer':
        return renderShortAnswer();
      case 'essay':
        return renderEssay();
      case 'matching':
        return renderMatching();
      case 'image_selection':
        return renderImageSelection();
      case 'audio_selection':
        return renderAudioSelection();
      case 'drag_drop':
        return renderDragDrop();
      case 'fill_blanks':
        return renderFillBlanks();
      case 'hotspot':
        return renderHotspot();
      case 'ordering':
        return renderOrdering();
      case 'ranking':
        return renderRanking();
      case 'table_completion':
        return renderTableCompletion();
      case 'diagram_labeling':
        return renderDiagramLabeling();
      case 'summary_completion':
        return renderSummaryCompletion();
      case 'note_completion':
        return renderNoteCompletion();
      case 'flowchart':
        return renderFlowChart();
      case 'matrix':
        return renderMatrix();
      case 'timeline_ordering':
        return renderTimelineOrdering();
      case 'comparison_matrix':
        return renderComparisonMatrix();
      case 'cloze_test':
        return renderClozeTest();
      case 'sequencing':
        return renderSequencing();
      case 'concept_map':
        return renderConceptMap();
      default:
        return <div>Unknown question type: {question.type}</div>;
    }
  };

  return (
    <div className="question-display">
      {renderQuestion()}
    </div>
  );
};

export default QuestionDisplay;

