import React from 'react';
import { Search, Filter, Download, Eye } from 'lucide-react';

export function SubmissionManagement() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Submission Management</h2>
        <p className="text-gray-600">Review and grade student test submissions</p>
      </div>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">No submissions yet.</p>
        <p className="text-sm text-gray-500 mt-2">Submissions will appear here once students complete tests.</p>
      </div>
    </div>
  );
}