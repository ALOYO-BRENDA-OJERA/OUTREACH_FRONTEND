import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/request.css';

const BloodRequests = () => {
  const [requests, setRequests] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    location: '',
    contact_number: '',
    hospital_id: '',
    blood_type: '',
    units_needed: 1,
    urgency_level: 'Normal',
    status: 'Open'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all blood requests and hospitals when component mounts
  useEffect(() => {
    fetchBloodRequests();
    fetchHospitals();
  }, []);

  const fetchBloodRequests = async () => {
    try {
      const response = await axios.get('/api/v1/blood_requests/');
      setRequests(response.data);
    } catch (err) {
      setError('Failed to fetch blood requests');
      console.error(err);
    }
  };

  const fetchHospitals = async () => {
    try {
      const response = await axios.get('/api/v1/hospitals/');
      setHospitals(response.data);
    } catch (err) {
      setError('Failed to fetch hospitals');
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      city: '',
      location: '',
      contact_number: '',
      hospital_id: '',
      blood_type: '',
      units_needed: 1,
      urgency_level: 'Normal',
      status: 'Open'
    });
    setIsEditing(false);
    setCurrentRequestId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isEditing) {
        // Update existing request
        await axios.put(`/api/v1/blood_requests/${currentRequestId}`, formData);
        setSuccess('Blood request updated successfully');
      } else {
        // Create new request
        await axios.post('/api/v1/blood_requests/create_blood_request', formData);
        setSuccess('Blood request created successfully');
      }
      
      // Refresh the list and reset form
      fetchBloodRequests();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
      console.error(err);
    }
  };

  const handleEdit = (request) => {
    setFormData({
      name: request.name,
      city: request.city,
      location: request.location || '',
      contact_number: request.contact_number,
      hospital_id: request.hospital_id,
      blood_type: request.blood_type,
      units_needed: request.units_needed,
      urgency_level: request.urgency_level,
      status: request.status
    });
    setIsEditing(true);
    setCurrentRequestId(request.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blood request?')) {
      try {
        await axios.delete(`/api/v1/blood_requests/${id}`);
        setSuccess('Blood request deleted successfully');
        fetchBloodRequests();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete blood request');
        console.error(err);
      }
    }
  };

  return (
    <div className="blood-requests-container">
      <h2>{isEditing ? 'Edit Blood Request' : 'Create Blood Request'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit} className="blood-request-form">
        <div className="form-group">
          <label htmlFor="name">Patient Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="location">Location (Optional)</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="contact_number">Contact Number</label>
          <input
            type="text"
            id="contact_number"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="hospital_id">Hospital</label>
          <select
            id="hospital_id"
            name="hospital_id"
            value={formData.hospital_id}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Hospital</option>
            {hospitals.map(hospital => (
              <option key={hospital.id} value={hospital.id}>
                {hospital.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="blood_type">Blood Type</label>
          <select
            id="blood_type"
            name="blood_type"
            value={formData.blood_type}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Blood Type</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="units_needed">Units Needed</label>
          <input
            type="number"
            id="units_needed"
            name="units_needed"
            min="1"
            value={formData.units_needed}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="urgency_level">Urgency Level</label>
          <select
            id="urgency_level"
            name="urgency_level"
            value={formData.urgency_level}
            onChange={handleInputChange}
            required
          >
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            required
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Fulfilled">Fulfilled</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {isEditing ? 'Update Request' : 'Create Request'}
          </button>
          {isEditing && (
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      
      <h2>Blood Requests</h2>
      <div className="blood-requests-list">
        {requests.length === 0 ? (
          <p>No blood requests found.</p>
        ) : (
          <table className="requests-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Blood Type</th>
                <th>Units</th>
                <th>Hospital</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => (
                <tr key={request.id}>
                  <td>{request.name}</td>
                  <td>{request.blood_type}</td>
                  <td>{request.units_needed}</td>
                  <td>{request.hospital_name || 'Unknown'}</td>
                  <td className={`urgency-${request.urgency_level.toLowerCase()}`}>
                    {request.urgency_level}
                  </td>
                  <td className={`status-${request.status.toLowerCase().replace(' ', '-')}`}>
                    {request.status}
                  </td>
                  <td>
                    <button 
                      className="edit-btn" 
                      onClick={() => handleEdit(request)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDelete(request.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BloodRequests;
