import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
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
        navigate('/login');
      } else {
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
    <div className="teal-split-layout">
      {/* Left Side - Signup Form */}
      <div className="teal-split-left">
        {/* Top Left Logo */}
        <div className="teal-login-header">
          <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
            <div className="logo-icon">C</div>
            <span>Careerflow.ai</span>
          </Link>
        </div>

        <div className="purple-login-container">
          <h2 className="purple-login-title">Sign up</h2>
          <p className="purple-login-subtitle">Create a new account</p>

          <form onSubmit={handleSubmit} className="purple-login-form">
            {error && <div className="teal-error">{error}</div>}

            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="purple-field" style={{ flex: 1 }}>
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Your first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="purple-field" style={{ flex: 1 }}>
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Your last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="purple-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="purple-field purple-password-field">
              <label>Password</label>
              <div className="purple-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="purple-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <label style={{ fontSize: '14px', color: '#6b7280', display: 'flex', gap: '8px', marginBottom: '24px', alignItems: 'center' }}>
              <input
                type="checkbox"
                name="agreed"
                checked={formData.agreed}
                onChange={handleChange}
                required
                style={{ margin: 0, width: '16px', height: '16px' }}
              />
              <span>
                I agree to the <Link to="#" className="text-primary hover-underline">Terms</Link> and <Link to="#" className="text-primary hover-underline">Privacy Policy</Link>
              </span>
            </label>

            <button type="submit" className="purple-submit-btn" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>

          <div className="purple-divider">
            <span>or</span>
          </div>

          <div className="purple-socials">
            <button type="button" className="purple-social-btn outline-btn">
              <span className="social-icon google-icon">G</span>
              Continue with Google
            </button>
          </div>

          <div className="purple-footer-links">
            <div className="purple-footer-row">
              <span className="text-muted">Already have an account?</span> <Link to="/login" className="text-primary">Log in</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="teal-split-right">
        <img 
          src="https://cdn.prod.website-files.com/62775a91cc3db44c787149de/67183eb61f2946ce0cd8415e_AI-Interview-Practice.webp" 
          alt="AI Interview Practice" 
        />
      </div>
    </div>
  );
};

export default Signup;
