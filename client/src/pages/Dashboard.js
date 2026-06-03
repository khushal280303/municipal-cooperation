import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ total: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch('http://localhost:5000/api/leaves/my-leaves', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setStats(data.stats);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [token]);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Employee Dashboard</h1>
          <p>Dhule Municipal Corporation • Employee Services</p>
        </div>
        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <span className="user-email">{user?.email}</span>
        </div>
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <h3>Total Applications</h3>
          <p className="stat-number">{stats.total}</p>
        </div>
        <div className="stat-card approved">
          <h3>Approved Applications</h3>
          <p className="stat-number">{stats.approved}</p>
        </div>
        <div className="stat-card rejected">
          <h3>Rejected Applications</h3>
          <p className="stat-number">{stats.rejected}</p>
        </div>
        <div className="stat-card pending">
          <h3>Pending Applications</h3>
          <p className="stat-number">{stats.pending}</p>
        </div>
      </div>

      <div className="services-section">
        <h2>Service Directory</h2>
        <div className="services-grid">
          <Link to="/leave-application" className="service-card">
            <h3>Leave Application</h3>
            <p>Apply for CL, ML, or Earned Leave</p>
            <span className="arrow">→</span>
          </Link>
          <div className="service-card disabled">
            <h3>Promotion Application</h3>
            <p>Request for departmental promotion</p>
          </div>
          <div className="service-card disabled">
            <h3>ACP Benefits</h3>
            <p>Assured Career Progression Scheme</p>
          </div>
          <div className="service-card disabled">
            <h3>Women Welfare</h3>
            <p>Issues related to women employees</p>
          </div>
          <div className="service-card disabled">
            <h3>Disabled Support</h3>
            <p>Support for Divyang employees</p>
          </div>
          <Link to="/my-applications" className="service-card">
            <h3>My Applications</h3>
            <p>View and manage your applications</p>
            <span className="arrow">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
