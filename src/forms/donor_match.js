import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/donor_match.css';

const DonorMatchManagement = () => {
  const [formData, setFormData] = useState({
    request_id: '',
    donor_id: '',
    status: 'Pending',
  });
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAutoMatchResults, setShowAutoMatchResults] = useState(false);
  const [autoMatchResults, setAutoMatchResults] = useState(null);
  
  // Fetch all donor matches on component mount
  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/v1/donor_matches/');
      setMatches(response.data);
    } catch (err) {
      setError('Failed to fetch donor matches');
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
      if (selectedMatchId) {
        // Update existing match
        await axios.put(
          `http://localhost:5000/api/v1/donor_matches/${selectedMatchId}`,
          formData
        );
        setSuccess('Donor match updated successfully');
      } else {
        // Create new match
        await axios.post(
          'http://localhost:5000/api/v1/donor_matches/create_match',
          formData
        );
        setSuccess('Donor match created successfully');
      }
      fetchMatches(); // Refresh match list
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  // Handle match edit
  const handleEdit = (match) => {
    setSelectedMatchId(match.id);
    setFormData({
      request_id: match.request_id,
      donor_id: match.donor_id,
      status: match.status,
    });
  };

  // Handle match deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this donor match?')) {
      try {
        await axios.delete(`http://localhost:5000/api/v1/donor_matches/${id}`);
        setSuccess('Donor match deleted successfully');
        fetchMatches(); // Refresh list
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete donor match');
      }
    }
  };

  // Handle auto matching for a specific request
  const handleAutoMatch = async () => {
    if (!formData.request_id) {
      setError('Please enter a Request ID to find matches');
      return;
    }
    try {
      setShowAutoMatchResults(false);
      const response = await axios.post(
        `http://localhost:5000/api/v1/donor_matches/auto-match/${formData.request_id}`
      );
      setAutoMatchResults(response.data);
      setShowAutoMatchResults(true);
      setSuccess(`Found ${response.data.matches.length} potential donors`);
      fetchMatches(); // Refresh the matches list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to find potential matches');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ request_id: '', donor_id: '', status: 'Pending' });
    setSelectedMatchId(null);
    setShowAutoMatchResults(false);
  };

  return (
    <div className="donor-match-management">
      <h1>{selectedMatchId ? 'Update Donor Match' : 'Create Donor Match'}</h1>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="match-form">
        <div className="form-group">
          <label>Request ID</label>
          <input
            type="number"
            name="request_id"
            value={formData.request_id}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Donor ID</label>
          <input
            type="number"
            name="donor_id"
            value={formData.donor_id}
            onChange={handleChange}
            required={!showAutoMatchResults}
          />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="Pending">Pending</option>
            <option value="Notified">Notified</option>
            <option value="Accepted">Accepted</option>
            <option value="Declined">Declined</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {selectedMatchId ? 'Update Match' : 'Create Match'}
          </button>
          {selectedMatchId && (
            <button type="button" className="cancel-btn" onClick={resetForm}>
              Cancel
            </button>
          )}
          <button
            type="button"
            className="auto-match-btn"
            onClick={handleAutoMatch}
          >
            Auto Match Donors
          </button>
        </div>
      </form>
      
      {/* Success/Error Messages */}
      {success && <div className="alert success">{success}</div>}
      {error && <div className="alert error">{error}</div>}

      {/* Auto Match Results */}
      {showAutoMatchResults && autoMatchResults && (
        <div className="auto-match-results">
          <h2>Auto Match Results</h2>
          
          <div className="request-details">
            <h3>Request Details</h3>
            <p><strong>Patient:</strong> {autoMatchResults.request_details.name}</p>
            <p><strong>Blood Type:</strong> {autoMatchResults.request_details.blood_type}</p>
            <p><strong>Hospital:</strong> {autoMatchResults.request_details.hospital}</p>
            <p><strong>Urgency:</strong> {autoMatchResults.request_details.urgency}</p>
            {autoMatchResults.request_details.location && (
              <p><strong>Location:</strong> {autoMatchResults.request_details.location}</p>
            )}
          </div>
          
          <div className="matches-list">
            <h3>Compatible Donors ({autoMatchResults.matches.length})</h3>
            {autoMatchResults.matches.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Donor Name</th>
                    <th>Blood Type</th>
                    <th>Location</th>
                    <th>Contact</th>
                    <th>Distance (km)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {autoMatchResults.matches.map((match) => (
                    <tr key={match.match_id}>
                      <td>{match.name}</td>
                      <td>{match.donor_blood_type}</td>
                      <td>{match.donor_location}</td>
                      <td>{match.donor_contact}</td>
                      <td>{match.distance_km ? match.distance_km.toFixed(2) : 'N/A'}</td>
                      <td>{match.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No compatible donors found for this request.</p>
            )}
          </div>
        </div>
      )}

      {/* All Matches List */}
      <h2>All Donor Matches</h2>
      <div className="matches-table-container">
        {matches.length > 0 ? (
          <table className="matches-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Request ID</th>
                <th>Donor ID</th>
                <th>Donor Name</th>
                <th>Blood Type</th>
                <th>Status</th>
                <th>Notified At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr key={match.id}>
                  <td>{match.id}</td>
                  <td>{match.request_id}</td>
                  <td>{match.donor_id}</td>
                  <td>{match.donor_details?.name || 'N/A'}</td>
                  <td>{match.donor_details?.blood_type || 'N/A'}</td>
                  <td className={`status-${match.status.toLowerCase()}`}>
                    {match.status}
                  </td>
                  <td>{new Date(match.notified_at).toLocaleString()}</td>
                  <td className="actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(match)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(match.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No donor matches found.</p>
        )}
      </div>
    </div>
  );
};

export default DonorMatchManagement;