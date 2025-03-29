import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/hospital_management.css';

const HospitalManagement = () => {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    location: '',
    contact_number: '',
  });
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all hospitals on component mount
  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/v1/hospitals/get_hospitals');
      setHospitals(response.data);
    } catch (err) {
      setError('Failed to fetch hospitals');
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
      if (selectedHospitalId) {
        // Update existing hospital
        const response = await axios.put(
          `http://localhost:5000/api/v1/hospitals/hospitals/${selectedHospitalId}`,
          formData
        );
        setSuccess('Hospital updated successfully');
      } else {
        // Create new hospital
        const response = await axios.post(
          'http://localhost:5000/api/v1/hospitals/create_hospitals',
          formData
        );
        setSuccess('Hospital created successfully');
      }
      fetchHospitals(); // Refresh hospital list
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  // Handle hospital edit
  const handleEdit = (hospital) => {
    setSelectedHospitalId(hospital.id);
    setFormData({
      name: hospital.name,
      city: hospital.city,
      location: hospital.location || '',
      contact_number: hospital.contact_number,
    });
  };

  // Handle hospital deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this hospital?')) {
      try {
        await axios.delete(`http://localhost:5000/api/v1/hospitals/hospitals/${id}`);
        setSuccess('Hospital deleted successfully');
        fetchHospitals(); // Refresh list
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete hospital');
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ name: '', city: '', location: '', contact_number: '' });
    setSelectedHospitalId(null);
  };

  return (
    <div className="hospital-management">
      <h1>{selectedHospitalId ? 'Update Hospital' : 'Add New Hospital'}</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="hospital-form">
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Location (Optional)</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Contact Number</label>
          <input
            type="text"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-btn">
          {selectedHospitalId ? 'Update Hospital' : 'Add Hospital'}
        </button>
        {selectedHospitalId && (
          <button type="button" className="cancel-btn" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      {/* Success/Error Messages */}
      {success && <p className="success-msg">{success}</p>}
      {error && <p className="error-msg">{error}</p>}

      {/* Hospital List */}
      <h2>Hospital List</h2>
      <div className="hospital-list">
        {hospitals.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>City</th>
                <th>Location</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map((hospital) => (
                <tr key={hospital.id}>
                  <td>{hospital.id}</td>
                  <td>{hospital.name}</td>
                  <td>{hospital.city}</td>
                  <td>{hospital.location || '-'}</td>
                  <td>{hospital.contact_number}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(hospital)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(hospital.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hospitals found.</p>
        )}
      </div>
    </div>
  );
};

export default HospitalManagement;