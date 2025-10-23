import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const AuditTrailViewer = () => {
  const { user: adminUser } = useAdminAuth();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    action: 'all',
    user: '',
    resource: 'all',
    dateFrom: '',
    dateTo: '',
    status: 'all'
  });
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/audit-logs?${queryParams.toString()}`, {
        headers: {
          'X-Admin-Email': adminUser?.email,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleApplyFilters = () => {
    fetchAuditLogs();
  };

  const handleResetFilters = () => {
    setFilters({
      action: 'all',
      user: '',
      resource: 'all',
      dateFrom: '',
      dateTo: '',
      status: 'all'
    });
  };

  const handleExportLogs = async () => {
    try {
      const response = await fetch('/api/audit-logs/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': adminUser?.email,
        },
        body: JSON.stringify(filters)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit_logs_${new Date().getTime()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error exporting logs:', err);
      setError('Failed to export logs');
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-700';
      case 'update':
        return 'bg-blue-100 text-blue-700';
      case 'delete':
        return 'bg-red-100 text-red-700';
      case 'view':
        return 'bg-gray-100 text-gray-700';
      case 'export':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'failure':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Audit Trail</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded border">
        <h3 className="font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Action</label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="view">View</option>
              <option value="export">Export</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Resource</label>
            <select
              value={filters.resource}
              onChange={(e) => handleFilterChange('resource', e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Resources</option>
              <option value="question">Question</option>
              <option value="submission">Submission</option>
              <option value="student">Student</option>
              <option value="exam">Exam</option>
              <option value="user">User</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="warning">Warning</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">User</label>
            <input
              type="text"
              value={filters.user}
              onChange={(e) => handleFilterChange('user', e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="User email or name"
            />
          </div>

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
            onClick={handleApplyFilters}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Apply Filters
          </button>
          <button
            onClick={handleResetFilters}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Reset
          </button>
          <button
            onClick={handleExportLogs}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-auto"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Timestamp</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Action</th>
              <th className="p-3 text-left">Resource</th>
              <th className="p-3 text-left">Details</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : auditLogs.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No audit logs found
                </td>
              </tr>
            ) : (
              auditLogs.map((log, idx) => (
                <tr
                  key={idx}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <td className="p-3 text-xs">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3">{log.user_email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3">{log.resource_type}</td>
                  <td className="p-3 text-xs truncate max-w-xs">{log.description}</td>
                  <td className={`p-3 text-center font-semibold ${getStatusColor(log.status)}`}>
                    {log.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Audit Log Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Timestamp</p>
                  <p className="font-semibold">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">User</p>
                  <p className="font-semibold">{selectedLog.user_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Action</p>
                  <p className="font-semibold capitalize">{selectedLog.action}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Resource</p>
                  <p className="font-semibold">{selectedLog.resource_type}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="font-semibold">{selectedLog.description}</p>
              </div>

              {selectedLog.changes && (
                <div>
                  <p className="text-sm text-gray-600">Changes</p>
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.changes, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">IP Address</p>
                <p className="font-semibold">{selectedLog.ip_address || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditTrailViewer;

