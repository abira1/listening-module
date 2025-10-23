import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const ExamScheduler = ({ examId, onScheduleCreated }) => {
  const { user: adminUser } = useAdminAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    start_time: '',
    end_time: '',
    max_students: '',
    allow_late_start: false,
    grace_period_minutes: 5
  });

  // Fetch schedules
  useEffect(() => {
    if (examId) {
      fetchSchedules();
    }
  }, [examId]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/scheduler/exams/${examId}/schedules`, {
        headers: {
          'X-Admin-Email': adminUser?.email,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!formData.start_time || !formData.end_time) {
      setError('Start and end times are required');
      return;
    }

    try {
      const response = await fetch('/api/scheduler/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': adminUser?.email,
        },
        body: JSON.stringify({
          exam_id: examId,
          start_time: formData.start_time,
          end_time: formData.end_time,
          max_students: formData.max_students ? parseInt(formData.max_students) : null,
          allow_late_start: formData.allow_late_start,
          grace_period_minutes: parseInt(formData.grace_period_minutes)
        })
      });

      if (response.ok) {
        const newSchedule = await response.json();
        setSchedules([...schedules, newSchedule]);
        setMessage('Schedule created successfully');
        setFormData({
          start_time: '',
          end_time: '',
          max_students: '',
          allow_late_start: false,
          grace_period_minutes: 5
        });
        setShowCreateForm(false);
        onScheduleCreated?.(newSchedule);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create schedule');
      }
    } catch (err) {
      console.error('Error creating schedule:', err);
      setError('Failed to create schedule');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      const response = await fetch(`/api/scheduler/schedules/${scheduleId}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Email': adminUser?.email,
        },
      });

      if (response.ok) {
        setSchedules(schedules.filter(s => s.id !== scheduleId));
        setMessage('Schedule deleted successfully');
      } else {
        setError('Failed to delete schedule');
      }
    } catch (err) {
      console.error('Error deleting schedule:', err);
      setError('Failed to delete schedule');
    }
  };

  const handleViewEnrollments = async (schedule) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/scheduler/schedules/${schedule.id}/enrollments`, {
        headers: {
          'X-Admin-Email': adminUser?.email,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEnrollments(data);
        setSelectedSchedule(schedule);
      }
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      setError('Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const getScheduleStatus = (schedule) => {
    const now = new Date();
    const start = new Date(schedule.start_time);
    const end = new Date(schedule.end_time);

    if (now < start) return 'Upcoming';
    if (now > end) return 'Completed';
    return 'Active';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Exam Scheduling</h2>

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

      {/* Create Schedule Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
          <h3 className="font-semibold mb-4">Create New Schedule</h3>
          <form onSubmit={handleCreateSchedule} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Time *</label>
                <input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">End Time *</label>
                <input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Max Students (Optional)</label>
                <input
                  type="number"
                  value={formData.max_students}
                  onChange={(e) => setFormData({ ...formData, max_students: e.target.value })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Grace Period (minutes)</label>
                <input
                  type="number"
                  value={formData.grace_period_minutes}
                  onChange={(e) => setFormData({ ...formData, grace_period_minutes: e.target.value })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="60"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allow_late_start"
                checked={formData.allow_late_start}
                onChange={(e) => setFormData({ ...formData, allow_late_start: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="allow_late_start" className="text-sm">
                Allow late start within grace period
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Create Schedule
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
          + Create Schedule
        </button>
      )}

      {/* Schedules List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : schedules.length === 0 ? (
          <p className="text-gray-500">No schedules created yet</p>
        ) : (
          schedules.map(schedule => (
            <div key={schedule.id} className="p-4 border rounded hover:bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{formatDateTime(schedule.start_time)}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      getScheduleStatus(schedule) === 'Active' ? 'bg-green-100 text-green-700' :
                      getScheduleStatus(schedule) === 'Upcoming' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {getScheduleStatus(schedule)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    to {formatDateTime(schedule.end_time)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewEnrollments(schedule)}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-sm"
                  >
                    View ({schedule.enrolled_students})
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>Max Students: {schedule.max_students || 'Unlimited'}</p>
                <p>Enrolled: {schedule.enrolled_students}</p>
                <p>Late Start: {schedule.allow_late_start ? `Yes (${schedule.grace_period_minutes} min)` : 'No'}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Enrollments Modal */}
      {selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Enrollments</h3>
              <button
                onClick={() => setSelectedSchedule(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {enrollments.length === 0 ? (
              <p className="text-gray-500">No enrollments yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map(enrollment => (
                    <tr key={enrollment.id} className="border-t">
                      <td className="p-2">{enrollment.name}</td>
                      <td className="p-2">{enrollment.email}</td>
                      <td className="p-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="p-2 text-xs text-gray-600">
                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamScheduler;

