import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/dashboard'; // Make sure this path is correct
import BloodRequests from './forms/request';
import Notifications from './forms/notification';
import HospitalManagement from './forms/hospital_management';
import DonorManagement from './forms/donor_records';
import DonorMatchManagement from './forms/donor_match';
import NotificationManagement from './forms/notification';
import Donors from './forms/donor';
// import BloodRequests from './forms/request'
import Home from './pages/home';

function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/request" element={<BloodRequests />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/hospital-management" element={<HospitalManagement />} />
            <Route path="/donor_records" element={<DonorManagement />} />
            <Route path="/donor-match-management" element={<DonorMatchManagement />} />
            <Route path="/notification-management" element={<NotificationManagement />} />
            <Route path="/donor" element={<Donors />} />
            
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
