import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Register = () => {
  const [step, setStep] = useState(1); // 1: Basic, 2: OTP Verification, 3: Complete Profile
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    department: '',
    designation: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Timer for OTP resend
  React.useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setOtpSent(true);
      setTimeLeft(60);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, otp: formData.otp })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }

      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete registration
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Name, email, and password are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        department: formData.department,
        designation: formData.designation
      };

      await register(registrationData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Municipal Cooperation Portal</h1>
          <p>Employee Services Management System</p>
        </div>

        {/* Progress Indicator */}
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <span>1</span>
            <p>Mobile</p>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <span>2</span>
            <p>Verify</p>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <span>3</span>
            <p>Details</p>
          </div>
        </div>

        {/* Step 1: Phone & Send OTP */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="auth-form">
            <h2>Create Your Account</h2>
            <p className="form-subtitle">Enter your mobile number to get started</p>

            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="phone">Mobile Number *</label>
              <div className="phone-input-group">
                <span className="country-code">+91</span>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10 digit mobile number"
                  maxLength="10"
                  pattern="[0-9]{10}"
                  required
                  disabled={loading}
                />
              </div>
              <small>Standard SMS rates may apply</small>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>

            <div className="auth-links">
              <span>Already have an account?</span>
              <Link to="/login">Login here</Link>
            </div>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            <h2>Verify OTP</h2>
            <p className="form-subtitle">Enter the 6-digit OTP sent to +91{formData.phone}</p>

            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="otp">OTP *</label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="000000"
                maxLength="6"
                pattern="[0-9]{6}"
                required
                disabled={loading}
                className="otp-input"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="otp-actions">
              {timeLeft > 0 ? (
                <p className="resend-timer">Resend OTP in {timeLeft}s</p>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="btn-link"
                >
                  Resend OTP
                </button>
              )}
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="btn-link"
              >
                Change Phone Number
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Complete Profile */}
        {step === 3 && (
          <form onSubmit={handleCompleteRegistration} className="auth-form">
            <h2>Complete Your Profile</h2>
            <p className="form-subtitle">Mobile verified: +91{formData.phone}</p>

            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@municipal.gov.in"
                required
                disabled={loading}
              />
            </div>

            <div className="form-row-two">
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row-two">
              <div className="form-group">
                <label htmlFor="department">Department</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g., Public Works"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="designation">Designation</label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g., Assistant Engineer"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Your address"
                rows="2"
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="auth-links">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={loading}
                className="btn-link"
              >
                ← Back to OTP
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
