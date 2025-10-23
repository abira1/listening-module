import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const QuestionOverviewPanel = ({ trackId, onQuestionSelect }) => {
  const { user: adminUser } = useAdminAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('number');

  // Fetch questions
  useEffect(() => {
    if (trackId) {
      fetchQuestions();
    }
  }, [trackId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tracks/${trackId}/questions`, {
        headers: {
          'X-Admin-Email': adminUser?.email,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      } else {
        setError('Failed to fetch questions');
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort questions
  const filteredQuestions = questions
    .filter(q => {
      if (filterType !== 'all' && q.type !== filterType) return false;
      if (searchTerm && !q.text?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'number':
          return (a.number || 0) - (b.number || 0);
        case 'type':
          return (a.type || '').localeCompare(b.type || '');
        case 'difficulty':
          const diffOrder = { easy: 1, medium: 2, hard: 3 };
          return (diffOrder[a.difficulty] || 0) - (diffOrder[b.difficulty] || 0);
        default:
          return 0;
      }
    });

  // Get unique question types
  const questionTypes = [...new Set(questions.map(q => q.type))];

  // Statistics
  const stats = {
    total: questions.length,
    byType: questionTypes.reduce((acc, type) => {
      acc[type] = questions.filter(q => q.type === type).length;
      return acc;
    }, {}),
    byDifficulty: {
      easy: questions.filter(q => q.difficulty === 'easy').length,
      medium: questions.filter(q => q.difficulty === 'medium').length,
      hard: questions.filter(q => q.difficulty === 'hard').length
    },
    totalMarks: questions.reduce((sum, q) => sum + (q.marks || 1), 0)
  };

  const getTypeColor = (type) => {
    const colors = {
      mcq_single: 'blue',
      mcq_multiple: 'purple',
      true_false_ng: 'green',
      sentence_completion: 'orange',
      fill_gaps: 'yellow',
      matching: 'red',
      writing_task1: 'indigo',
      writing_task2: 'pink'
    };
    return colors[type] || 'gray';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'green',
      medium: 'yellow',
      hard: 'red'
    };
    return colors[difficulty] || 'gray';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Question Overview</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm text-gray-600">Total Questions</p>
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
        </div>

        <div className="p-4 bg-green-50 rounded border border-green-200">
          <p className="text-sm text-gray-600">Total Marks</p>
          <p className="text-2xl font-bold text-green-600">{stats.totalMarks}</p>
        </div>

        <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
          <p className="text-sm text-gray-600">Easy</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.byDifficulty.easy}</p>
        </div>

        <div className="p-4 bg-red-50 rounded border border-red-200">
          <p className="text-sm text-gray-600">Hard</p>
          <p className="text-2xl font-bold text-red-600">{stats.byDifficulty.hard}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {questionTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="number">Sort by Number</option>
            <option value="type">Sort by Type</option>
            <option value="difficulty">Sort by Difficulty</option>
          </select>
        </div>

        {/* Type Distribution */}
        <div className="flex flex-wrap gap-2">
          {questionTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type ? 'all' : type)}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                filterType === type
                  ? `bg-${getTypeColor(type)}-600 text-white`
                  : `bg-${getTypeColor(type)}-100 text-${getTypeColor(type)}-700 hover:bg-${getTypeColor(type)}-200`
              }`}
            >
              {type} ({stats.byType[type]})
            </button>
          ))}
        </div>
      </div>

      {/* Questions Grid */}
      <div className="space-y-2">
        {loading ? (
          <p className="text-gray-500">Loading questions...</p>
        ) : filteredQuestions.length === 0 ? (
          <p className="text-gray-500">No questions found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuestions.map(question => (
              <div
                key={question.id}
                onClick={() => {
                  setSelectedQuestion(question);
                  onQuestionSelect?.(question);
                }}
                className={`p-4 border rounded cursor-pointer transition-all hover:shadow-lg ${
                  selectedQuestion?.id === question.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Question Number and Type */}
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-lg">Q{question.number}</span>
                  <span className={`text-xs px-2 py-1 rounded text-white bg-${getTypeColor(question.type)}-500`}>
                    {question.type}
                  </span>
                </div>

                {/* Question Text */}
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                  {question.text || '(No text)'}
                </p>

                {/* Metadata */}
                <div className="flex justify-between items-center text-xs text-gray-600">
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded bg-${getDifficultyColor(question.difficulty)}-100 text-${getDifficultyColor(question.difficulty)}-700`}>
                      {question.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {question.marks || 1} mark{question.marks !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Question Details */}
                {question.type === 'mcq_single' || question.type === 'mcq_multiple' ? (
                  <div className="mt-2 text-xs text-gray-600">
                    {question.options?.length || 0} options
                  </div>
                ) : question.type === 'matching' ? (
                  <div className="mt-2 text-xs text-gray-600">
                    {question.items?.length || 0} items
                  </div>
                ) : question.type === 'writing_task1' || question.type === 'writing_task2' ? (
                  <div className="mt-2 text-xs text-gray-600">
                    {question.minWords || 150}-{question.maxWords || 250} words
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Question Details */}
      {selectedQuestion && (
        <div className="mt-6 p-4 bg-gray-50 rounded border">
          <h3 className="font-semibold mb-3">Question Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">ID</p>
              <p className="font-mono">{selectedQuestion.id}</p>
            </div>
            <div>
              <p className="text-gray-600">Type</p>
              <p>{selectedQuestion.type}</p>
            </div>
            <div>
              <p className="text-gray-600">Marks</p>
              <p>{selectedQuestion.marks || 1}</p>
            </div>
            <div>
              <p className="text-gray-600">Difficulty</p>
              <p>{selectedQuestion.difficulty}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-600">Text</p>
              <p className="mt-1">{selectedQuestion.text}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionOverviewPanel;

