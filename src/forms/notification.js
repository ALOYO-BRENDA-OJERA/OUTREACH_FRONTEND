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
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 10;

  // Fetch all notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/v1/notifications/get_all_notifications');
      setNotifications(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch notifications. Please try again.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (selectedNotificationId) {
        // Update existing notification
        await axios.put(
          `http://localhost:5000/api/v1/notifications/update_notification${selectedNotificationId}`,
          formData
        );
        setSuccess('Notification updated successfully');
      } else {
        // Create new notification
        await axios.post(
          'http://localhost:5000/api/v1/notifications/create_notification',
          formData
        );
        setSuccess('Notification created and sent successfully');
      }
      await fetchNotifications(); // Refresh notification list
      resetForm();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 
                      (err.response?.data?.message || 'An error occurred. Please try again.');
      setError(errorMsg);
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle notification deletion
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/v1/notifications/${id}`);
      setSuccess('Notification deleted successfully');
      await fetchNotifications(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete notification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Specialized notification functions
  const handleSpecialNotification = async (endpoint, promptMessage, successMessage) => {
    const id = prompt(promptMessage);
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/v1/notifications/${endpoint}/${id}`
      );
      setSuccess(successMessage || response.data?.message || 'Operation completed successfully');
      await fetchNotifications();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to complete operation. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ donor_id: '', request_id: '', message: '' });
    setSelectedNotificationId(null);
  };

  // Pagination logic
  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
  const currentNotifications = notifications.slice(indexOfFirstNotification, indexOfLastNotification);
  const totalPages = Math.ceil(notifications.length / notificationsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="notification-management">
      <h1>{selectedNotificationId ? 'Update Notification' : 'Create Notification'}</h1>

      {/* Status Messages */}
      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess('')} className="close-btn">&times;</button>
        </div>
      )}
      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError('')} className="close-btn">&times;</button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="notification-form">
        <div className="form-group">
          <label>Donor ID *</label>
          <input
            type="number"
            name="donor_id"
            value={formData.donor_id}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Request ID (Optional)</label>
          <input
            type="number"
            name="request_id"
            value={formData.request_id}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Message *</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows="4"
            disabled={loading}
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn submit-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : selectedNotificationId ? 'Update Notification' : 'Send Notification'}
          </button>
          
          {selectedNotificationId && (
            <button 
              type="button" 
              className="btn cancel-btn" 
              onClick={resetForm}
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Special Notification Actions */}
      <div className="special-actions">
        <h2>Special Notification Actions</h2>
        <div className="action-buttons">
          <button
            type="button"
            className="btn notify-match-btn"
            onClick={() => handleSpecialNotification(
              'notify-match', 
              'Enter the Match ID to notify:',
              'Match notification sent successfully'
            )}
            disabled={loading}
          >
            Notify Match
          </button>
          <button
            type="button"
            className="btn notify-no-matches-btn"
            onClick={() => handleSpecialNotification(
              'notify-no-matches',
              'Enter the Request ID to notify about no matches:',
              'No-matches notification sent successfully'
            )}
            disabled={loading}
          >
            Notify No Matches
          </button>
          <button
            type="button"
            className="btn batch-notify-btn"
            onClick={() => handleSpecialNotification(
              'batch-notify-request',
              'Enter the Request ID for batch notification:'
            )}
            disabled={loading}
          >
            Batch Notify Request
          </button>
          <button
            type="button"
            className="btn check-unmatched-btn"
            onClick={() => handleSpecialNotification(
              'check-unmatched-requests',
              '',
              'Unmatched requests checked successfully'
            )}
            disabled={loading}
          >
            Check Unmatched Requests
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="notification-list">
        <div className="list-header">
          <h2>Notification List</h2>
          <button 
            onClick={fetchNotifications} 
            className="btn refresh-btn"
            disabled={loading}
          >
            Refresh
          </button>
        </div>
        
        {loading && notifications.length === 0 ? (
          <div className="loading">Loading notifications...</div>
        ) : notifications.length > 0 ? (
          <>
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
                {currentNotifications.map((notification) => (
                  <tr key={notification.id}>
                    <td>{notification.id}</td>
                    <td>{notification.donor_id}</td>
                    <td>{notification.request_id || '-'}</td>
                    <td className="message-cell">{notification.message}</td>
                    <td>
                      <span className={`status-badge ${notification.status.toLowerCase()}`}>
                        {notification.status}
                      </span>
                    </td>
                    <td>{notification.sent_at ? new Date(notification.sent_at).toLocaleString() : '-'}</td>
                    <td className="action-buttons">
                      <button
                        className="btn edit-btn"
                        onClick={() => handleEdit(notification)}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        className="btn delete-btn"
                        onClick={() => handleDelete(notification.id)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-notifications">No notifications found.</div>
        )}
      </div>
    </div>
  );
};

export default NotificationManagement;