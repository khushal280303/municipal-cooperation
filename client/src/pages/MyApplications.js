import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import '../styles/MyApplications.css';

const MyApplications = () => {
  const { token } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      fetch('http://localhost:5000/api/leaves/my-leaves', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setLeaves(data.leaves);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [token]);

  const handleWithdraw = async (leaveId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/leaves/${leaveId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setLeaves(leaves.filter(l => l._id !== leaveId));
      }
    } catch (err) {
      alert('Failed to withdraw application: ' + err.message);
    }
  };

  if (loading) return <div className="loading">Loading applications...</div>;

  return (
    <div className="applications-container">
      <div className="applications-header">
        <h1>My Applications</h1>
        <Link to="/leave-application" className="btn-primary">+ New Application</Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {leaves.length === 0 ? (
        <div className="no-applications">
          <p>No applications found</p>
          <Link to="/leave-application">Submit your first leave application</Link>
        </div>
      ) : (
        <div className="applications-table">
          <table>
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Days</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(leave => (
                <tr key={leave._id}>
                  <td><span className="badge">{leave.leaveType}</span></td>
                  <td>{new Date(leave.fromDate).toLocaleDateString()}</td>
                  <td>{new Date(leave.toDate).toLocaleDateString()}</td>
                  <td>{leave.numberOfDays}</td>
                  <td>
                    <span className={`status status-${leave.status}`}>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                  </td>
                  <td>{leave.reason}</td>
                  <td>
                    {leave.status === 'pending' && (
                      <button
                        className="btn-danger"
                        onClick={() => handleWithdraw(leave._id)}
                      >
                        Withdraw
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
