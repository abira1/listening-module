import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const BulkOperations = () => {
  const { user: adminUser } = useAdminAuth();
  const [operationType, setOperationType] = useState('students');
  const [selectedItems, setSelectedItems] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [bulkAction, setBulkAction] = useState('');
  const [actionParams, setActionParams] = useState({});

  useEffect(() => {
    fetchItems();
  }, [operationType]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bulk/${operationType}`, {
        headers: {
          'X-Admin-Email': adminUser?.email,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data);
        setSelectedItems([]);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleBulkAction = async () => {
    if (selectedItems.length === 0) {
      setError('Please select at least one item');
      return;
    }

    if (!bulkAction) {
      setError('Please select an action');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const response = await fetch('/api/bulk/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': adminUser?.email,
        },
        body: JSON.stringify({
          operation_type: operationType,
          action: bulkAction,
          item_ids: selectedItems,
          params: actionParams
        })
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`${result.success_count} items processed successfully`);
        setSelectedItems([]);
        setBulkAction('');
        fetchItems();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Bulk operation failed');
      }
    } catch (err) {
      console.error('Error executing bulk action:', err);
      setError('Failed to execute bulk action');
    } finally {
      setLoading(false);
    }
  };

  const getBulkActions = () => {
    switch (operationType) {
      case 'students':
        return [
          { value: 'assign_role', label: 'Assign Role' },
          { value: 'reset_password', label: 'Reset Password' },
          { value: 'deactivate', label: 'Deactivate' },
          { value: 'export', label: 'Export Data' }
        ];
      case 'submissions':
        return [
          { value: 'grade', label: 'Grade' },
          { value: 'flag_plagiarism', label: 'Flag Plagiarism' },
          { value: 'delete', label: 'Delete' },
          { value: 'export', label: 'Export' }
        ];
      case 'questions':
        return [
          { value: 'update_difficulty', label: 'Update Difficulty' },
          { value: 'update_section', label: 'Update Section' },
          { value: 'delete', label: 'Delete' },
          { value: 'export', label: 'Export' }
        ];
      case 'exams':
        return [
          { value: 'publish', label: 'Publish' },
          { value: 'archive', label: 'Archive' },
          { value: 'delete', label: 'Delete' },
          { value: 'export_results', label: 'Export Results' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Bulk Operations</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Left Panel - Operation Type */}
        <div className="col-span-1">
          <h3 className="font-semibold mb-4">Operation Type</h3>
          <div className="space-y-2">
            {['students', 'submissions', 'questions', 'exams'].map(type => (
              <button
                key={type}
                onClick={() => setOperationType(type)}
                className={`w-full text-left p-3 rounded transition-all ${
                  operationType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Middle Panel - Items List */}
        <div className="col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">
              Select Items ({selectedItems.length}/{items.length})
            </h3>
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {selectedItems.length === items.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto border rounded p-3">
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : items.length === 0 ? (
              <p className="text-gray-500">No items available</p>
            ) : (
              items.map(item => (
                <label key={item.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm flex-1 truncate">
                    {item.name || item.title || item.email}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Actions */}
        <div className="col-span-1 space-y-4">
          <div>
            <h3 className="font-semibold mb-4">Bulk Action</h3>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            >
              <option value="">-- Select Action --</option>
              {getBulkActions().map(action => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </select>

            {/* Action Parameters */}
            {bulkAction === 'assign_role' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={actionParams.role || ''}
                  onChange={(e) => setActionParams({ ...actionParams, role: e.target.value })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Role --</option>
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
              </div>
            )}

            {bulkAction === 'update_difficulty' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  value={actionParams.difficulty || ''}
                  onChange={(e) => setActionParams({ ...actionParams, difficulty: e.target.value })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Difficulty --</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            )}

            {bulkAction === 'grade' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Score</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={actionParams.score || ''}
                  onChange={(e) => setActionParams({ ...actionParams, score: e.target.value })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter score"
                />
              </div>
            )}

            {/* Confirmation */}
            <div className="p-3 bg-yellow-50 rounded border border-yellow-200 mb-4">
              <p className="text-sm text-yellow-800">
                ⚠️ This will affect {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}
              </p>
            </div>

            <button
              onClick={handleBulkAction}
              disabled={loading || selectedItems.length === 0 || !bulkAction}
              className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
            >
              {loading ? 'Processing...' : 'Execute Action'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOperations;

