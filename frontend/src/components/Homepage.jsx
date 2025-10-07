import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from './Header';
import { ClockIcon, BookOpenIcon, LayersIcon, CheckIcon } from 'lucide-react';
import { BackendService } from '../services/BackendService';

export function Homepage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const publishedExams = await BackendService.getPublishedExams();
        setExams(publishedExams);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching exams:', error);
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minutes`;
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-blue-50 to-blue-100">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Available IELTS Listening Tests
            </h1>
            <p className="text-gray-600">
              Select a test to begin your IELTS Listening practice. Each test consists of 4 sections with various question types.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : exams.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 mb-4">No tests available at the moment.</p>
              <p className="text-sm text-gray-500">Please check back later or contact the administrator.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                      {exam.title}
                    </h2>
                    <p className="text-gray-600 mb-4">{exam.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {formatDuration(exam.duration_seconds)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <LayersIcon className="w-4 h-4 mr-1" />
                        4 sections
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <BookOpenIcon className="w-4 h-4 mr-1" />
                        {exam.question_count || 40} questions
                      </div>
                    </div>

                    <div className="mt-auto">
                      <Link
                        to={`/exam/${exam.id}`}
                        className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                      >
                        Start Test
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}