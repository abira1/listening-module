/**
 * Note Completion Component
 * Complete notes with information from text
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function NoteCompletion({ question, onAnswer, onReview }) {
  const [answers, setAnswers] = useState({});
  const [isReview, setIsReview] = useState(false);

  const notes = question.notes || [];

  const handleNoteChange = (noteId, value) => {
    setAnswers(prev => ({
      ...prev,
      [noteId]: value
    }));
  };

  const handleSubmit = () => {
    onAnswer(answers);
  };

  const handleReview = () => {
    setIsReview(true);
    if (onReview) {
      onReview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Text */}
      {question.text && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-800 text-lg">
            {question.text}
          </p>
        </div>
      )}

      {/* Passage Text */}
      {question.passage && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
          <p className="text-sm font-semibold text-gray-700 mb-2">Passage:</p>
          <p className="text-gray-700 text-sm leading-relaxed">
            {question.passage}
          </p>
        </div>
      )}

      {/* Notes to Complete */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-gray-700">Complete the notes:</p>
        {notes.map((note, idx) => (
          <div key={note.id || idx} className="space-y-2">
            {/* Note Label */}
            <label className="block text-sm font-medium text-gray-700">
              {note.label}:
            </label>

            {/* Note Input */}
            <Input
              type="text"
              value={answers[note.id] || ''}
              onChange={(e) => handleNoteChange(note.id, e.target.value)}
              placeholder={`Enter ${note.label.toLowerCase()}`}
              disabled={isReview}
              className="w-full"
            />

            {/* Review Mode */}
            {isReview && (
              <div className="text-sm text-green-700 font-medium">
                Correct: {note.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600">
          Completed: {Object.keys(answers).filter(k => answers[k]?.trim()).length} / {notes.length}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{
              width: `${(Object.keys(answers).filter(k => answers[k]?.trim()).length / notes.length) * 100}%`
            }}
          ></div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={handleReview}
          disabled={isReview}
        >
          Review
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isReview}
        >
          Submit Answer
        </Button>
      </div>
    </div>
  );
}

export default NoteCompletion;

