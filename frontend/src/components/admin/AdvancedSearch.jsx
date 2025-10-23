import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const AdvancedSearch = ({ onSearch }) => {
  const { user: adminUser } = useAdminAuth();
  const [searchType, setSearchType] = useState('questions');
  const [filters, setFilters] = useState({
    keyword: '',
    type: 'all',
    difficulty: 'all',
    section: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    scoreMin: '',
    scoreMax: '',
    studentName: '',
    examTitle: ''
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(
        `/api/search/${searchType}?${queryParams.toString()}`,
        {
          headers: {
            'X-Admin-Email': adminUser?.email,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        if (onSearch) onSearch(data);
      } else {
        setError('Search failed');
      }
    } catch (err) {
      console.error('Error searching:', err);
      setError('Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      keyword: '',
      type: 'all',
      difficulty: 'all',
      section: 'all',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      scoreMin: '',
      scoreMax: '',
      studentName: '',
      examTitle: ''
    });
    setResults([]);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Advanced Search</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Search Type Selection */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {['questions', 'submissions', 'students', 'exams'].map(type => (
          <button
            key={type}
            onClick={() => {
              setSearchType(type);
              setResults([]);
            }}
            className={`px-4 py-2 rounded transition-all ${
              searchType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Basic Search */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder={`Search ${searchType}...`}
          value={filters.keyword}
          onChange={(e) => handleFilterChange('keyword', e.target.value)}
          className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
        >
          {showAdvanced ? 'Hide' : 'Advanced'}
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mb-6 p-4 bg-gray-50 rounded border">
          <h3 className="font-semibold mb-4">Advanced Filters</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {/* Question Filters */}
            {searchType === 'questions' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="mcq">MCQ</option>
                    <option value="true_false">True/False</option>
                    <option value="completion">Completion</option>
                    <option value="matching">Matching</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Levels</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Section</label>
                  <select
                    value={filters.section}
                    onChange={(e) => handleFilterChange('section', e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Sections</option>
                    <option value="listening">Listening</option>
                    <option value="reading">Reading</option>
                    <option value="writing">Writing</option>
                  </select>
                </div>
              </>
            )}

            {/* Submission Filters */}
            {searchType === 'submissions' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="graded">Graded</option>
                    <option value="submitted">Submitted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Min Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.scoreMin}
                    onChange={(e) => handleFilterChange('scoreMin', e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Max Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.scoreMax}
                    onChange={(e) => handleFilterChange('scoreMax', e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100"
                  />
                </div>
              </>
            )}

            {/* Student Filters */}
            {searchType === 'students' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Student Name</label>
                  <input
                    type="text"
                    value={filters.studentName}
                    onChange={(e) => handleFilterChange('studentName', e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter student name"
                  />
                </div>
              </>
            )}

            {/* Exam Filters */}
            {searchType === 'exams' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Exam Title</label>
                  <input
                    type="text"
                    value={filters.examTitle}
                    onChange={(e) => handleFilterChange('examTitle', e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter exam title"
                  />
                </div>
              </>
            )}

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium mb-2">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Searching...' : 'Apply Filters'}
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      <div>
        <h3 className="font-semibold mb-4">
          Results ({results.length})
        </h3>

        {results.length === 0 ? (
          <p className="text-gray-500">No results found. Try adjusting your search criteria.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {results.map((result, idx) => (
              <div key={idx} className="p-3 border rounded hover:bg-gray-50">
                <p className="font-medium">{result.title || result.name || result.text}</p>
                <p className="text-sm text-gray-600">{result.description || result.email}</p>
                {result.score !== undefined && (
                  <p className="text-sm font-semibold text-blue-600">Score: {result.score}%</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;

