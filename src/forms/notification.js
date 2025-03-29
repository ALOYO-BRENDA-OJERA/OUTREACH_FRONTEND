import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/notification.css';

const NotificationManagement = () => {
  const [formData, setFormData] = useState({
    donor_id: '',
    request_id: '',
    message: '',
  });
  const [notifications, setNotifications] = useState([]);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/v1/notifications/');
      setNotifications(response.data);
    } catch (err) {
      setError('Failed to fetch notifications');
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (selectedNotificationId) {
        // Update existing notification
        const response = await axios.put(
          `http://localhost:5000/api/v1/notifications/${selectedNotificationId}`,
          formData
        );
        setSuccess('Notification updated successfully');
      } else {
        // Create new notification
        const response = await axios.post(
          'http://localhost:5000/api/v1/notifications/',
          formData
        );
        setSuccess('Notification created and sent successfully');
      }
      fetchNotifications(); // Refresh notification list
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  // Handle notification edit
  const handleEdit = (notification) => {
    setSelectedNotificationId(notification.id);
    setFormData({
      donor_id: notification.donor_id,
      request_id: notification.request_id || '',
      message: notification.message,
    });
  };

  // Handle notification deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await axios.delete(`http://localhost:5000/api/v1/notifications/${id}`);
        setSuccess('Notification deleted successfully');
        fetchNotifications(); // Refresh list
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete notification');
      }
    }
  };

  // Notify a donor about a match
  const handleNotifyMatch = async () => {
    const matchId = prompt('Enter the Match ID to notify:');
    if (!matchId) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/v1/notifications/notify-match/${matchId}`
      );
      setSuccess('Match notification sent successfully');
      fetchNotifications(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to notify match');
    }
  };

  // Notify requester about no matches
  const handleNotifyNoMatches = async () => {
    const requestId = prompt('Enter the Request ID to notify about no matches:');
    if (!requestId) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/v1/notifications/notify-no-matches/${requestId}`
      );
      setSuccess('No-matches notification sent successfully');
      fetchNotifications(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to notify no matches');
    }
  };

  // Batch notify donors for a request
  const handleBatchNotifyRequest = async () => {
    const requestId = prompt('Enter the Request ID for batch notification:');
    if (!requestId) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/v1/notifications/batch-notify-request/${requestId}`
      );
      setSuccess(response.data.message);
      fetchNotifications(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to batch notify');
    }
  };

  // Check and notify unmatched requests
  const handleCheckUnmatched = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/v1/notifications/check-unmatched-requests'
      );
      setSuccess(response.data.message);
      fetchNotifications(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to check unmatched requests');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ donor_id: '', request_id: '', message: '' });
    setSelectedNotificationId(null);
  };

  return (
    <div className="notification-management">
      <h1>{selectedNotificationId ? 'Update Notification' : 'Create Notification'}</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="notification-form">
        <div className="form-group">
          <label>Donor ID</label>
          <input
            type="number"
            name="donor_id"
            value={formData.donor_id}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Request ID (Optional)</label>
          <input
            type="number"
            name="request_id"
            value={formData.request_id}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows="4"
          />
        </div>
        <button type="submit" className="submit-btn">
          {selectedNotificationId ? 'Update Notification' : 'Send Notification'}
        </button>
        {selectedNotificationId && (
          <button type="button" className="cancel-btn" onClick={resetForm}>
            Cancel
          </button>
        )}
        <button
          type="button"
          className="notify-match-btn"
          onClick={handleNotifyMatch}
        >
          Notify Match
        </button>
        <button
          type="button"
          className="notify-no-matches-btn"
          onClick={handleNotifyNoMatches}
        >
          Notify No Matches
        </button>
        <button
          type="button"
          className="batch-notify-btn"
          onClick={handleBatchNotifyRequest}
        >
          Batch Notify Request
        </button>
        <button
          type="button"
          className="check-unmatched-btn"
          onClick={handleCheckUnmatched}
        >
          Check Unmatched Requests
        </button>
      </form>

      {/* Success/Error Messages */}
      {success && <p className="success-msg">{success}</p>}
      {error && <p className="error-msg">{error}</p>}

      {/* Notification List */}
      <h2>Notification List</h2>
      <div className="notification-list">
        {notifications.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Donor ID</th>
                <th>Request ID</th>
                <th>Message</th>
                <th>Status</th>
                <th>Sent At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => (
                <tr key={notification.id}>
                  <td>{notification.id}</td>
                  <td>{notification.donor_id}</td>
                  <td>{notification.request_id || '-'}</td>
                  <td>{notification.message}</td>
                  <td>{notification.status}</td>
                  <td>{new Date(notification.sent_at).toLocaleString()}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(notification)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(notification.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No notifications found.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationManagement;