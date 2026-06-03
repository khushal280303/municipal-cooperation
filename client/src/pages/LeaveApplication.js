import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/LeaveApplication.css';

const LeaveApplication = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    leaveType: 'CL',
    fromDate: '',
    toDate: '',
    numberOfDays: '',
    reason: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateDays = () => {
    if (formData.fromDate && formData.toDate) {
      const from = new Date(formData.fromDate);
      const to = new Date(formData.toDate);
      const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
      setFormData(prev => ({ ...prev, numberOfDays: Math.max(1, days) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSuccess('Leave application submitted successfully!');
      setTimeout(() => navigate('/my-applications'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leave-application-container">
      <div className="form-card">
        <h1>Leave Application Form</h1>
        <p className="subtitle">Apply for Casual Leave (CL), Medical Leave (ML), or Earned Leave (EL)</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="application-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="leaveType">Leave Type *</label>
              <select
                id="leaveType"
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="CL">Casual Leave (CL)</option>
                <option value="ML">Medical Leave (ML)</option>
                <option value="EL">Earned Leave (EL)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fromDate">From Date *</label>
              <input
                type="date"
                id="fromDate"
                name="fromDate"
                value={formData.fromDate}
                onChange={(e) => {
                  handleChange(e);
                  setTimeout(calculateDays, 0);
                }}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="toDate">To Date *</label>
              <input
                type="date"
                id="toDate"
                name="toDate"
                value={formData.toDate}
                onChange={(e) => {
                  handleChange(e);
                  setTimeout(calculateDays, 0);
                }}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="numberOfDays">Number of Days</label>
              <input
                type="number"
                id="numberOfDays"
                name="numberOfDays"
                value={formData.numberOfDays}
                readOnly
                className="readonly"
              />
              <small>Calculated automatically</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="reason">Reason for Leave *</label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Please provide a brief reason for your leave"
                rows="5"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveApplication;
