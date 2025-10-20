/**
 * Table Completion Component
 * Fill in table cells with information
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function TableCompletion({ question, onAnswer, onReview }) {
  const [answers, setAnswers] = useState({});
  const [isReview, setIsReview] = useState(false);

  const table = question.table || {};
  const headers = table.headers || [];
  const rows = table.rows || [];

  const handleCellChange = (rowIdx, cellIdx, value) => {
    const cellId = `${rowIdx}-${cellIdx}`;
    setAnswers(prev => ({
      ...prev,
      [cellId]: value
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          {/* Header Row */}
          <thead>
            <tr className="bg-gray-100">
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Data Rows */}
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {row.cells.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className="border border-gray-300 px-4 py-2"
                  >
                    {cell.includes('_____') || cell === '' ? (
                      <Input
                        type="text"
                        value={answers[`${rowIdx}-${cellIdx}`] || ''}
                        onChange={(e) => handleCellChange(rowIdx, cellIdx, e.target.value)}
                        placeholder="Enter answer"
                        disabled={isReview}
                        className="w-full"
                      />
                    ) : (
                      <span className="text-gray-700">{cell}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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

export default TableCompletion;

