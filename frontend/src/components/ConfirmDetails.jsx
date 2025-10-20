import React from 'react';
import { InfoNotice } from './common/InfoNotice';
import { Button } from './common/Button';

export function ConfirmDetails({ onContinue }) {
  return (
    <div className="bg-white rounded-md shadow-sm w-full max-w-3xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <img
          src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png"
          alt="User icon"
          className="w-10 h-10"
        />
        <h2 className="text-xl text-gray-700">Confirm your details</h2>
      </div>
      
      <div className="mb-6 space-y-4">
        <div>
          <p className="text-gray-700 mb-1">Name:</p>
          <p className="font-medium">Test Candidate</p>
        </div>
        <div>
          <p className="text-gray-700 mb-1">Date of birth:</p>
          <p className="font-medium">01 January 2000</p>
        </div>
        <div>
          <p className="text-gray-700 mb-1">Candidate number:</p>
          <p className="font-medium">TEST{Math.floor(Math.random() * 100000)}</p>
        </div>
      </div>

      <InfoNotice message="If your details are not correct, please inform the invigilator." />

      <div className="flex justify-center mt-6">
        <Button onClick={onContinue}>My details are correct</Button>
      </div>
    </div>
  );
}