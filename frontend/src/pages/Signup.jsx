import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    agreed: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const name = `${formData.firstName} ${formData.lastName}`.trim();
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success
        console.log('Signup successful', data);
        navigate('/login');
      } else {
        // Error
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error', err);
      setError('An error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });

      const data = await response.json();
      if (response.ok) {
        if (data.data?.accessToken) {
          localStorage.setItem('token', data.data.accessToken);
        }
        navigate('/dashboard');
      } else {
        setError(data.message || 'Google Signup failed');
      }
    } catch (err) {
      console.error('Google Signup error', err);
      setError('An error occurred during Google signup.');
    }
  };

  return (
    <div className="portal-page">
      {/* Decorative blobs */}
      <div className="blob-container">
        <div className="blob blob-top-right" />
        <div className="blob blob-bottom-left" />
      </div>

      {/* Back to Home */}
      <Link to="/" className="portal-back-btn" id="back-to-home-signup">
        <FiArrowLeft size={16} />
        Home
      </Link>

      <div className="portal-wrapper">
        {/* Logo */}
        <div className="portal-logo">
          <div className="portal-logo-icon">C</div>
          <span className="portal-logo-text">Careerflow</span>
        </div>

        <h1 className="portal-title">Job Seeker Portal</h1>

        {/* Card */}
        <div className="portal-card">
          {/* Tabs */}
          <div className="portal-tabs">
            <button className="portal-tab" onClick={() => navigate('/login')}>Login</button>
            <button className="portal-tab active">Sign Up</button>
          </div>

          {/* Google button only */}
          <div className="portal-socials" style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Signup Failed')}
              useOneTap
              theme="outline"
              size="large"
              shape="rectangular"
              text="signup_with"
            />
          </div>

          {/* Divider */}
          <div className="portal-divider">
            <span>OR</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="portal-form">
            {error && <div style={{ color: '#e53e3e', fontSize: '14px', marginBottom: '8px', textAlign: 'center', backgroundColor: '#fff5f5', padding: '8px', borderRadius: '4px' }}>{error}</div>}

            <div className="portal-field">
              <label htmlFor="firstName">
                First Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="portal-field">
              <label htmlFor="lastName">
                Last Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="portal-field">
              <label htmlFor="email">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="portal-field">
              <label htmlFor="password">
                Password <span className="required">*</span>
              </label>
              <div className="portal-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Enter a Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="portal-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="portal-terms">
              <input
                type="checkbox"
                name="agreed"
                id="terms-checkbox"
                checked={formData.agreed}
                onChange={handleChange}
                required
              />
              <span>
                By signing up, I agree to the{' '}
                <Link to="#" id="terms-link">Terms of Service</Link> and{' '}
                <Link to="#" id="privacy-link">Privacy Policy</Link>
              </span>
            </label>

            <button type="submit" id="signup-submit-btn" className="portal-submit-btn" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>

            <p className="portal-switch-text">
              Already have an account?{' '}
              <Link to="/login" id="switch-to-login-link">Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
