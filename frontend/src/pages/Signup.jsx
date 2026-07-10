import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useGoogleLogin } from '@react-oauth/google';
import API_BASE from '../config/api';

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

  // ─── Email / Password Signup ─────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const name = `${formData.firstName} ${formData.lastName}`.trim();
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  // ─── Google OAuth ────────────────────────────────────────────────────────────
  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: tokenResponse.access_token }),
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

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Google signup was cancelled or failed.'),
  });

  return (
    <div className="teal-split-layout">
      {/* Left Side - Signup Form */}
      <div className="teal-split-left">
        {/* Logo */}
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

          {/* Google Button — actually triggers OAuth */}
          <div className="purple-socials">
            <button
              type="button"
              className="teal-social-btn google-btn"
              onClick={() => googleLogin()}
            >
              <svg className="google-btn-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
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
