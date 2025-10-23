import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const QuestionBankManager = () => {
  const { user: adminUser } = useAdminAuth();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankQuestions, setBankQuestions] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'listening',
    difficulty: 'all'
  });

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/question-banks', {
        headers: {
          'X-Admin-Email': adminUser?.email,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBanks(data);
      }
    } catch (err) {
      console.error('Error fetching banks:', err);
      setError('Failed to fetch question banks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBank = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!formData.name.trim()) {
      setError('Bank name is required');
      return;
    }

    try {
      const response = await fetch('/api/question-banks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': adminUser?.email,
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newBank = await response.json();
        setBanks([...banks, newBank]);
        setMessage('Question bank created successfully');
        setFormData({ name: '', description: '', category: 'listening', difficulty: 'all' });
        setShowCreateForm(false);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create bank');
      }
    } catch (err) {
      console.error('Error creating bank:', err);
      setError('Failed to create bank');
    }
  };

  const handleDeleteBank = async (bankId) => {
    if (!window.confirm('Are you sure you want to delete this bank?')) {
      return;
    }

    try {
      const response = await fetch(`/api/question-banks/${bankId}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Email': adminUser?.email,
        },
      });

      if (response.ok) {
        setBanks(banks.filter(b => b.id !== bankId));
        setMessage('Bank deleted successfully');
      } else {
        setError('Failed to delete bank');
      }
    } catch (err) {
      console.error('Error deleting bank:', err);
      setError('Failed to delete bank');
    }
  };

  const handleViewBank = async (bank) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/question-banks/${bank.id}/questions`, {
        headers: {
          'X-Admin-Email': adminUser?.email,
        },
      });

      if (response.ok) {
        const questions = await response.json();
        setSelectedBank(bank);
        setBankQuestions(questions);
      }
    } catch (err) {
      console.error('Error fetching bank questions:', err);
      setError('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestionToBank = async (bankId, questionId) => {
    try {
      const response = await fetch(`/api/question-banks/${bankId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': adminUser?.email,
        },
        body: JSON.stringify({ question_id: questionId })
      });

      if (response.ok) {
        setMessage('Question added to bank');
        handleViewBank(selectedBank);
      } else {
        setError('Failed to add question');
      }
    } catch (err) {
      console.error('Error adding question:', err);
      setError('Failed to add question');
    }
  };

  const handleRemoveQuestionFromBank = async (bankId, questionId) => {
    try {
      const response = await fetch(
        `/api/question-banks/${bankId}/questions/${questionId}`,
        {
          method: 'DELETE',
          headers: {
            'X-Admin-Email': adminUser?.email,
          },
        }
      );

      if (response.ok) {
        setMessage('Question removed from bank');
        handleViewBank(selectedBank);
      } else {
        setError('Failed to remove question');
      }
    } catch (err) {
      console.error('Error removing question:', err);
      setError('Failed to remove question');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Question Bank Manager</h2>

      {message && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Create Bank Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
          <h3 className="font-semibold mb-4">Create New Question Bank</h3>
          <form onSubmit={handleCreateBank} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Bank Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Listening Part 1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Describe this question bank..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="listening">Listening</option>
                  <option value="reading">Reading</option>
                  <option value="writing">Writing</option>
                  <option value="speaking">Speaking</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Create Bank
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!showCreateForm && (
        <button
          onClick={() => setShowCreateForm(true)}
          className="mb-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Create Bank
        </button>
      )}

      {/* Banks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : banks.length === 0 ? (
          <p className="text-gray-500">No question banks created yet</p>
        ) : (
          banks.map(bank => (
            <div key={bank.id} className="p-4 border rounded hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">{bank.name}</h3>
                  <p className="text-sm text-gray-600">{bank.description}</p>
                </div>
                <button
                  onClick={() => handleDeleteBank(bank.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  ✕
                </button>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                <span>{bank.category}</span>
                <span>{bank.question_count || 0} questions</span>
              </div>

              <button
                onClick={() => handleViewBank(bank)}
                className="w-full px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-sm"
              >
                View & Manage
              </button>
            </div>
          ))
        )}
      </div>

      {/* Bank Details Modal */}
      {selectedBank && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedBank.name}</h3>
              <button
                onClick={() => setSelectedBank(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">{selectedBank.description}</p>
              <p className="text-sm text-gray-600 mt-2">
                Category: <strong>{selectedBank.category}</strong>
              </p>
            </div>

            <h4 className="font-semibold mb-3">Questions ({bankQuestions.length})</h4>

            {bankQuestions.length === 0 ? (
              <p className="text-gray-500 text-sm">No questions in this bank yet</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {bankQuestions.map(q => (
                  <div key={q.id} className="p-2 border rounded flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Q{q.number}: {q.type}</p>
                      <p className="text-xs text-gray-600 line-clamp-1">{q.text}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveQuestionFromBank(selectedBank.id, q.id)}
                      className="ml-2 text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBankManager;

