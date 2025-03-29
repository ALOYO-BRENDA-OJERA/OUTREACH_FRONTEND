import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/dona_management.css';

const DonorManagement = () => {
  const [donationRecords, setDonationRecords] = useState([]);
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [medicalNote, setMedicalNote] = useState('');
  const [selectedDonorId, setSelectedDonorId] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState(null);
  
  const [formData, setFormData] = useState({
    donor_id: '',
    hospital_id: '',
    blood_type: '',
    next_eligible_donation: ''
  });

  // Fetch all donation records, donors, and hospitals when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [recordsRes, donorsRes, hospitalsRes] = await Promise.all([
          axios.get('/api/v1/donor_records/records'),
          axios.get('/api/v1/donors'),
          axios.get('/api/v1/hospitals')
        ]);
        
        setDonationRecords(recordsRes.data);
        setDonors(donorsRes.data);
        setHospitals(hospitalsRes.data);
        setError('');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter records by donor or hospital
  const fetchFilteredRecords = async () => {
    setLoading(true);
    try {
      let url = '/api/v1/donor_records/records';
      
      if (selectedDonorId) {
        url = `/api/v1/donor_records/records/donor/${selectedDonorId}`;
      } else if (selectedHospitalId) {
        url = `/api/v1/donor_records/records/hospital/${selectedHospitalId}`;
      }
      
      const response = await axios.get(url);
      setDonationRecords(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching filtered records:', err);
      setError('Failed to load filtered records. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDonorId || selectedHospitalId) {
      fetchFilteredRecords();
    }
  }, [selectedDonorId, selectedHospitalId]);

  const resetFilters = async () => {
    setSelectedDonorId('');
    setSelectedHospitalId('');
    
    try {
      const response = await axios.get('/api/v1/donor_records/records');
      setDonationRecords(response.data);
      setError('');
    } catch (err) {
      console.error('Error resetting filters:', err);
      setError('Failed to reset filters. Please try again later.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // If donor is selected, auto-fill blood type
    if (name === 'donor_id' && value) {
      const selectedDonor = donors.find(donor => donor.id === parseInt(value));
      if (selectedDonor) {
        setFormData(prev => ({
          ...prev,
          blood_type: selectedDonor.blood_type
        }));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      donor_id: '',
      hospital_id: '',
      blood_type: '',
      next_eligible_donation: ''
    });
    setIsEditing(false);
    setCurrentRecordId(null);
    setMedicalNote('');
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setMedicalNote('');
    
    try {
      let response;
      
      if (isEditing) {
        // Update existing record
        response = await axios.put(`/api/v1/donor_records/records/${currentRecordId}`, formData);
      } else {
        // Create new record
        response = await axios.post('/api/v1/donor_records/create_record', formData);
      }
      
      // Check for medical notes
      if (response.data.medical_note) {
        setMedicalNote(response.data.medical_note);
      }
      
      // Check for medical restriction
      if (response.data.status === 'medical_restriction') {
        setMedicalNote(response.data.message + '. Next eligible date: ' + 
          new Date(response.data.next_eligible_date).toLocaleDateString() + 
          ` (${response.data.days_until_eligible} days from now). ${response.data.info}`);
        return;
      }
      
      setSuccess(isEditing ? 'Donation record updated successfully!' : 'Donation record created successfully!');
      
      // Refresh the records list
      const recordsResponse = await axios.get('/api/v1/donor_records/records');
      setDonationRecords(recordsResponse.data);
      
      // Reset the form
      resetForm();
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.response?.data?.error || 'An error occurred while processing your request.');
    }
  };

  const handleEdit = (record) => {
    // Format the date for the input field
    const nextEligibleDate = new Date(record.next_eligible_donation);
    const formattedDate = nextEligibleDate.toISOString().split('T')[0];
    
    setFormData({
      donor_id: record.donor_id.toString(),
      hospital_id: record.hospital_id.toString(),
      blood_type: record.blood_type,
      next_eligible_donation: formattedDate
    });
    
    setIsEditing(true);
    setCurrentRecordId(record.id);
    setSuccess('');
    setError('');
    setMedicalNote('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this donation record? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/v1/donor_records/records/${id}`);
        setSuccess('Donation record deleted successfully!');
        
        // Refresh the records list
        const response = await axios.get('/api/v1/donor_records/records');
        setDonationRecords(response.data);
      } catch (err) {
        console.error('Error deleting record:', err);
        setError(err.response?.data?.error || 'An error occurred while deleting the record.');
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get donor name by ID
  const getDonorName = (donorId) => {
    const donor = donors.find(d => d.id === donorId);
    return donor ? `${donor.first_name} ${donor.last_name}` : 'Unknown Donor';
  };

  // Get hospital name by ID
  const getHospitalName = (hospitalId) => {
    const hospital = hospitals.find(h => h.id === hospitalId);
    return hospital ? hospital.name : 'Unknown Hospital';
  };

  // Check if donor is eligible to donate
  const isDonorEligible = (nextEligibleDate) => {
    const now = new Date();
    const eligible = new Date(nextEligibleDate);
    return now >= eligible;
  };

  return (
    <div className="donor-records-container">
      <h1>Donor Records Management</h1>
      
      {/* Filters */}
      <div className="filters-section">
        <h2>Filter Records</h2>
        <div className="filters-form">
          <div className="form-group">
            <label htmlFor="donor-filter">Filter by Donor:</label>
            <select 
              id="donor-filter" 
              value={selectedDonorId} 
              onChange={(e) => {
                setSelectedDonorId(e.target.value);
                setSelectedHospitalId(''); // Reset hospital filter when donor is selected
              }}
            >
              <option value="">All Donors</option>
              {donors.map(donor => (
                <option key={donor.id} value={donor.id}>
                  {donor.first_name} {donor.last_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="hospital-filter">Filter by Hospital:</label>
            <select 
              id="hospital-filter" 
              value={selectedHospitalId} 
              onChange={(e) => {
                setSelectedHospitalId(e.target.value);
                setSelectedDonorId(''); // Reset donor filter when hospital is selected
              }}
            >
              <option value="">All Hospitals</option>
              {hospitals.map(hospital => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.name}
                </option>
              ))}
            </select>
          </div>
          
          <button className="reset-btn" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      </div>
      
      {/* Form for creating/editing donation records */}
      <div className="record-form-section">
        <h2>{isEditing ? 'Edit Donation Record' : 'Create New Donation Record'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        {medicalNote && <div className="medical-note">{medicalNote}</div>}
        
        <form onSubmit={handleSubmit} className="donation-record-form">
          <div className="form-group">
            <label htmlFor="donor_id">Donor:</label>
            <select
              id="donor_id"
              name="donor_id"
              value={formData.donor_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Donor</option>
              {donors.map(donor => (
                <option key={donor.id} value={donor.id}>
                  {donor.first_name} {donor.last_name} - {donor.blood_type}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="hospital_id">Hospital:</label>
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
            <label htmlFor="blood_type">Blood Type:</label>
            <input
              type="text"
              id="blood_type"
              name="blood_type"
              value={formData.blood_type}
              onChange={handleInputChange}
              readOnly // Blood type is auto-filled based on donor
              required
            />
            <small>Blood type is automatically set based on donor selection</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="next_eligible_donation">Next Eligible Donation Date (Optional):</label>
            <input
              type="date"
              id="next_eligible_donation"
              name="next_eligible_donation"
              value={formData.next_eligible_donation}
              onChange={handleInputChange}
            />
            <small>If not provided, system will set to 56 days from donation date</small>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {isEditing ? 'Update Record' : 'Create Record'}
            </button>
            {isEditing && (
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Display donation records */}
      <div className="records-list-section">
        <h2>Donation Records</h2>
        
        {loading ? (
          <div className="loading">Loading records...</div>
        ) : donationRecords.length === 0 ? (
          <div className="no-records">No donation records found.</div>
        ) : (
          <table className="records-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Donor</th>
                <th>Hospital</th>
                <th>Blood Type</th>
                <th>Donation Date</th>
                <th>Next Eligible Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {donationRecords.map(record => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{getDonorName(record.donor_id)}</td>
                  <td>{getHospitalName(record.hospital_id)}</td>
                  <td className="blood-type">{record.blood_type}</td>
                  <td>{formatDate(record.donated_at)}</td>
                  <td>{formatDate(record.next_eligible_donation)}</td>
                  <td className={isDonorEligible(record.next_eligible_donation) ? 'eligible' : 'ineligible'}>
                    {isDonorEligible(record.next_eligible_donation) ? 'Eligible to Donate' : 'Not Eligible Yet'}
                  </td>
                  <td className="actions">
                    <button 
                      className="edit-btn" 
                      onClick={() => handleEdit(record)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDelete(record.id)}
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

// Add this line at the end of your donor_records.js file
export default DonorManagement;

