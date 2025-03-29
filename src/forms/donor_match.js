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
//   personally
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [potentialDonors, setPotentialDonors] = useState([]);

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
        const response = await axios.put(
          `http://localhost:5000/api/v1/donor_matches/${selectedMatchId}`,
          formData
        );
        setSuccess('Donor match updated successfully');
      } else {
        // Create new match
        const response = await axios.post(
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

  // Find potential matches for a blood request
  const handleFindMatches = async () => {
    if (!formData.request_id) {
      setError('Please enter a Request ID to find matches');
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/donor_matches/find-matches/${formData.request_id}`
      );
      setPotentialDonors(response.data);
      setSuccess(`Found ${response.data.length} potential donors`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to find potential matches');
    }
  };

  // Run batch matching
  const handleBatchMatch = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/v1/donor_matches/batch-match');
      setSuccess(response.data.message);
      fetchMatches(); // Refresh list after batch match
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to run batch match');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ request_id: '', donor_id: '', status: 'Pending' });
    setSelectedMatchId(null);
    setPotentialDonors([]);
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
            required
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
          className="find-matches-btn"
          onClick={handleFindMatches}
        >
          Find Potential Matches
        </button>
        <button
          type="button"
          className="batch-match-btn"
          onClick={handleBatchMatch}
        >
          Run Batch Match
        </button>
      </form>

      {/* Success/Error Messages */}
      {success && <p className="success-msg">{success}</p>}
      {error && <p className="error-msg">{error}</p>}

      {/* Potential Donors */}
      {potentialDonors.length > 0 && (
        <div className="potential-donors">
          <h2>Potential Donors</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Blood Type</th>
                <th>Phone</th>
                <th>City</th>
              </tr>
            </thead>
            <tbody>
              {potentialDonors.map((donor) => (
                <tr key={donor.id}>
                  <td>{donor.id}</td>
                  <td>{donor.name}</td>
                  <td>{donor.blood_type}</td>
                  <td>{donor.phone}</td>
                  <td>{donor.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Match List */}
      <h2>Donor Match List</h2>
      <div className="match-list">
        {matches.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Request ID</th>
                <th>Donor ID</th>
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
                  <td>{match.status}</td>
                  <td>{new Date(match.notified_at).toLocaleString()}</td>
                  <td>
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