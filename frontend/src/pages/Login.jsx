import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success
        console.log('Login successful', data);
        // Save token to localStorage (example)
        if (data.data?.accessToken) {
          localStorage.setItem('token', data.data.accessToken);
        }
        navigate('/dashboard');
      } else {
        // Error
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error', err);
      setError('An error occurred during login.');
    } finally {
      setLoading(false);
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
      <Link to="/" className="portal-back-btn" id="back-to-home-login">
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
            <button className="portal-tab active">Login</button>
            <button className="portal-tab" onClick={() => navigate('/signup')}>Sign Up</button>
          </div>

          {/* Social Buttons */}
          <div className="portal-socials">
            <button className="portal-social-btn" id="google-login-btn">
              <FcGoogle size={20} />
              Continue with Google
            </button>

          </div>

          {/* Divider */}
          <div className="portal-divider">
            <span>OR</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="portal-form">
            {error && <div style={{ color: '#e53e3e', fontSize: '14px', marginBottom: '8px', textAlign: 'center', backgroundColor: '#fff5f5', padding: '8px', borderRadius: '4px' }}>{error}</div>}

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
                  placeholder="Password"
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
              <div className="portal-forgot">
                <Link to="#" id="forgot-password-link">Forgot password?</Link>
              </div>
            </div>

            <button type="submit" id="login-submit-btn" className="portal-submit-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
