import React from 'react';
import { Clock, BookOpen, CheckCircle } from 'lucide-react';

export function ReadingInstructions({ onStart, examTitle }) {
  return (
    <div className="max-w-4xl w-full mx-auto bg-white rounded-xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{examTitle || 'IELTS Reading Test'}</h1>
        <p className="text-gray-600">Please read these instructions carefully before starting</p>
      </div>

      <div className="space-y-6 mb-8">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <div className="flex items-start">
            <Clock className="h-6 w-6 text-blue-600 mr-3 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Time Allocation</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>You have <strong>60 minutes</strong> to complete this reading test</li>
                <li>The test consists of <strong>3 passages</strong> and <strong>40 questions</strong></li>
                <li>The timer will turn red and blink during the last 2 minutes</li>
                <li>The test will auto-submit when time expires</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
          <div className="flex items-start">
            <BookOpen className="h-6 w-6 text-green-600 mr-3 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Format</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li><strong>Split-screen layout:</strong> Reading passage on the left, questions on the right</li>
                <li><strong>Question types:</strong> Multiple choice, True/False/Not Given, Matching, Short answer, Sentence completion</li>
                <li>You can navigate between questions using the footer navigation bar</li>
                <li>You can highlight text and add notes to help you remember important information</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg">
          <div className="flex items-start">
            <CheckCircle className="h-6 w-6 text-purple-600 mr-3 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Important Notes</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Answer all questions - there is no negative marking</li>
                <li>Pay attention to word limits for short answer questions</li>
                <li>Use the "Review" checkbox to mark questions you want to return to</li>
                <li>You can change your answers at any time before submitting</li>
                <li>Click "Submit Test" when you're finished or time runs out</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onStart}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-lg shadow-lg transition-colors duration-200"
        >
          I'm ready - Start the Reading Test
        </button>
      </div>
    </div>
  );
}
