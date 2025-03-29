import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/donot.css';

const DonorManagement = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    blood_type: '',
    phone: '',
    email: '',
    city: '',
    location: '',
    availability_status: true,
  });
  const [donors, setDonors] = useState([]);
  const [selectedDonorId, setSelectedDonorId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all donors on component mount
  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/v1/donors/');
      setDonors(response.data);
    } catch (err) {
      setError('Failed to fetch donors');
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (selectedDonorId) {
        // Update existing donor
        const response = await axios.put(
          `http://localhost:5000/api/v1/donors/${selectedDonorId}`,
          formData
        );
        setSuccess('Donor updated successfully');
      } else {
        // Create new donor
        const response = await axios.post(
          'http://localhost:5000/api/v1/donors/create_donor',
          formData
        );
        setSuccess('Donor created successfully');
      }
      fetchDonors(); // Refresh donor list
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  // Handle donor edit
  const handleEdit = (donor) => {
    setSelectedDonorId(donor.id);
    setFormData({
      name: donor.name,
      age: donor.age,
      blood_type: donor.blood_type,
      phone: donor.phone,
      email: donor.email || '',
      city: donor.city,
      location: donor.location || '',
      availability_status: donor.availability_status,
    });
  };

  // Handle donor deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this donor?')) {
      try {
        await axios.delete(`http://localhost:5000/api/v1/donors/${id}`);
        setSuccess('Donor deleted successfully');
        fetchDonors(); // Refresh list
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete donor');
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      blood_type: '',
      phone: '',
      email: '',
      city: '',
      location: '',
      availability_status: true,
    });
    setSelectedDonorId(null);
  };

  return (
    <div className="donor-management">
      <h1>{selectedDonorId ? 'Update Donor' : 'Add New Donor'}</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="donor-form">
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
          <label>Age</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
            min="18"
          />
        </div>
        <div className="form-group">
          <label>Blood Type</label>
          <select
            name="blood_type"
            value={formData.blood_type}
            onChange={handleChange}
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
          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email (Optional)</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
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
          <label>
            <input
              type="checkbox"
              name="availability_status"
              checked={formData.availability_status}
              onChange={handleChange}
            />
            Available to Donate
          </label>
        </div>
        <button type="submit" className="submit-btn">
          {selectedDonorId ? 'Update Donor' : 'Add Donor'}
        </button>
        {selectedDonorId && (
          <button type="button" className="cancel-btn" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      {/* Success/Error Messages */}
      {success && <p className="success-msg">{success}</p>}
      {error && <p className="error-msg">{error}</p>}

      {/* Donor List */}
      <h2>Donor List</h2>
      <div className="donor-list">
        {donors.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Blood Type</th>
                <th>Phone</th>
                <th>Email</th>
                <th>City</th>
                <th>Location</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {donors.map((donor) => (
                <tr key={donor.id}>
                  <td>{donor.id}</td>
                  <td>{donor.name}</td>
                  <td>{donor.age}</td>
                  <td>{donor.blood_type}</td>
                  <td>{donor.phone}</td>
                  <td>{donor.email || '-'}</td>
                  <td>{donor.city}</td>
                  <td>{donor.location || '-'}</td>
                  <td>{donor.availability_status ? 'Yes' : 'No'}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(donor)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(donor.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No donors found.</p>
        )}
      </div>
    </div>
  );
};

export default DonorManagement;