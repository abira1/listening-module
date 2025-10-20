import React from 'react';
import { Button } from './common/Button';
import { InfoNotice } from './common/InfoNotice';

export function ListeningInstructions({ onStart, examTitle = 'IELTS Listening Test' }) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
      <h2 className="text-2xl font-bold text-center mb-6">{examTitle} - Instructions</h2>
      
      <InfoNotice>
        Please read these instructions carefully before starting the test.
      </InfoNotice>

      <div className="my-6 space-y-4 text-gray-700">
        <p><strong>The test consists of 4 sections:</strong></p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Each section contains 10 questions. There are 40 questions in total.</li>
          <li>The audio will play once and will not repeat. Listen carefully.</li>
          <li>You will have time at the beginning of each section to read the questions.</li>
          <li>At the end of each section, you will have time to review your answers before the next section begins.</li>
          <li>You can navigate between questions using the navigation panel at the bottom of the screen.</li>
        </ul>
        <p><strong>Important:</strong> Once you start the test, the audio will begin automatically. Make sure your volume is set to a comfortable level.</p>
      </div>

      <div className="flex justify-center">
        <Button onClick={onStart}>Start Test</Button>
      </div>
    </div>
  );
}