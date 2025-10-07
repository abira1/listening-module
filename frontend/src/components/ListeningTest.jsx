import React, { useState, useEffect } from 'react';
import { FirebaseService } from '../services/FirebaseService';

export function ListeningTest({ examId, audioRef }) {
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  useEffect(() => {
    const loadExamData = async () => {
      try {
        const data = await FirebaseService.getExamWithSectionsAndQuestions(examId);
        setExamData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading exam data:', error);
        setLoading(false);
      }
    };

    loadExamData();
  }, [examId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">Unable to load test data</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-blue-50">
      <div className="bg-white w-full p-2 flex justify-between items-center border-b border-gray-300">
        <div>
          <img src="https://i.postimg.cc/FKx07M5m/ILTES.png" alt="IELTS Logo" className="h-8" />
        </div>
        <div className="flex items-center gap-4">
          <img src="https://i.postimg.cc/0Q2DmVPS/Biritsh-Council.png" alt="British Council" className="h-6" />
          <img src="https://i.postimg.cc/9f2GXWkJ/IDB.png" alt="IDP" className="h-6" />
          <img src="https://i.postimg.cc/TYZVSjJ8/Cambridge-University.png" alt="Cambridge Assessment English" className="h-6" />
        </div>
      </div>

      <main className="flex-1 p-4 pb-20">
        <div className="bg-white border border-gray-200 rounded-sm p-4 mb-4">
          <h2 className="font-bold mb-2">
            {examData.exam.title} - Section {currentPage}
          </h2>
          <div className="bg-blue-50 p-4 rounded-sm">
            <p className="text-gray-700">Questions will be displayed here based on the section data.</p>
            <p className="text-sm text-gray-500 mt-2">Total Sections: {examData.sections.length}</p>
            <p className="text-sm text-gray-500">Current Section: {currentPage}</p>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-300 py-2 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-700">Section {currentPage} of {examData.sections.length}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="bg-white border border-gray-300 rounded-sm px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(examData.sections.length, currentPage + 1))}
            disabled={currentPage === examData.sections.length}
            className="bg-white border border-gray-300 rounded-sm px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </footer>
    </div>
  );
}