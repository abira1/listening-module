import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const NotificationCenter = () => {
  const { user: adminUser } = useAdminAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'X-Admin-Email': adminUser?.email,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'X-Admin-Email': adminUser?.email,
        },
      });

      if (response.ok) {
        setNotifications(notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        ));
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'X-Admin-Email': adminUser?.email,
        },
      });

      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Email': adminUser?.email,
        },
      });

      if (response.ok) {
        setNotifications(notifications.filter(n => n.id !== notificationId));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'exam_scheduled':
        return '📅';
      case 'exam_reminder':
        return '⏰';
      case 'grading_complete':
        return '✅';
      case 'plagiarism_alert':
        return '⚠️';
      case 'system_alert':
        return '🔔';
      default:
        return '📬';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'high':
        return 'border-l-4 border-orange-500 bg-orange-50';
      case 'normal':
        return 'border-l-4 border-blue-500 bg-blue-50';
      default:
        return 'border-l-4 border-gray-500 bg-gray-50';
    }
  };

  const filteredNotifications = notifications.filter(n =>
    filterType === 'all' ? true : n.type === filterType
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Notification Center</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {['all', 'exam_scheduled', 'grading_complete', 'plagiarism_alert', 'system_alert'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 rounded text-sm transition-all ${
              filterType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type === 'all' ? 'All' : type.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-gray-500">Loading notifications...</p>
        ) : filteredNotifications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No notifications</p>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded flex justify-between items-start ${getPriorityColor(notification.priority)} ${
                !notification.read ? 'font-semibold' : ''
              }`}
            >
              <div className="flex gap-3 flex-1">
                <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                <div className="flex-1">
                  <p className="font-semibold">{notification.title}</p>
                  <p className="text-sm text-gray-700">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                {!notification.read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Mark Read
                  </button>
                )}
                <button
                  onClick={() => handleDeleteNotification(notification.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notification Settings */}
      <div className="mt-8 p-4 bg-gray-50 rounded border">
        <h3 className="font-semibold mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm">Email notifications for exams</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm">Email notifications for grading</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm">Alert for plagiarism detection</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-sm">System maintenance alerts</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;

