import React from 'react';
import { Button } from './common/Button';
import { InfoNotice } from './common/InfoNotice';

export function WritingInstructions({ onStart, examTitle = 'IELTS Writing Test' }) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
      <h2 className="text-2xl font-bold text-center mb-6">{examTitle} - Instructions</h2>
      
      <InfoNotice>
        Please read these instructions carefully before starting the test.
      </InfoNotice>

      <div className="my-6 space-y-4 text-gray-700">
        <p><strong>The test consists of 2 tasks:</strong></p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Task 1:</strong> You should spend about 20 minutes on this task. Write at least 150 words.</li>
          <li><strong>Task 2:</strong> You should spend about 40 minutes on this task. Write at least 250 words.</li>
        </ul>
        
        <p><strong>Important guidelines:</strong></p>
        <ul className="list-disc pl-6 space-y-2">
          <li>You have 60 minutes total to complete both tasks.</li>
          <li>A word counter is provided below each writing area to help you track your progress.</li>
          <li>You can navigate between Task 1 and Task 2 using the navigation buttons.</li>
          <li>Your answers will be automatically saved as you type.</li>
          <li>Make sure to complete both tasks before submitting.</li>
          <li>Write clearly and organize your ideas effectively.</li>
        </ul>
        
        <p className="text-sm text-gray-600 mt-4">
          <strong>Note:</strong> Once you start the test, the timer will begin. Plan your time wisely to complete both tasks.
        </p>
      </div>

      <div className="flex justify-center">
        <Button onClick={onStart}>Start Test</Button>
      </div>
    </div>
  );
}
