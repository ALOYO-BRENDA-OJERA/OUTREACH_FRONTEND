import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Blood Donation</h2>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            {/* <li>
              <Link to="/profile">Profile</Link>
            </li> */}
            <li>
              <Link to="/request">Blood Requests</Link>
            </li>
            <li>
              <Link to="/notifications">Notifications</Link>
            </li>
            <li>
              <Link to="/hospital-management">Hospital Management</Link>
            </li>
            <li>
              <Link to="/donor_records">Donor Management</Link>
            </li>
            <li>
              <Link to="/donor-match-management">Donor Match Management</Link>
            </li>
            <li>
              <Link to="/notification-management">Notification Management</Link>
            </li>

            <li>
              <Link to="/donor">Donors</Link>
            </li>
          </ul>
        </nav>
      </aside>
      
      {/* Main Content */}
      <div className="main-content">
        <div className="content-area">
          <DashboardHome />
        </div>
      </div>
    </div>
  );
};

// Placeholder Dashboard Home Component
const DashboardHome = () => {
  return (
    <div className="dashboard-home">
      <h1>Welcome to the Blood Donation Dashboard</h1>
      <p>Select an option from the sidebar to manage the system.</p>
    </div>
  );
};

export default Dashboard;
