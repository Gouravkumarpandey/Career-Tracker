import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import api from '../config/api';

const Signup = () => {
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();
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

    if (!executeRecaptcha) {
      setError('reCAPTCHA is not initialized yet. Please try again.');
      return;
    }

    setLoading(true);

    try {
      // Execute reCAPTCHA v3 using action "submit"
      const token = await executeRecaptcha('submit');

      const name = `${formData.firstName} ${formData.lastName}`.trim();
      const response = await api.post('/api/auth/signup', {
        name,
        email: formData.email,
        password: formData.password,
        recaptchaToken: token,
      });

      if (response.status === 200 || response.status === 201) {
        navigate('/login');
      }
    } catch (err) {
      console.error('Signup error', err);
      setError(err.response?.data?.message || 'An error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Google OAuth Success Callback ───────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await api.post('/api/auth/google', {
        idToken: credentialResponse.credential,
      });

      const data = response.data;
      if (data.data?.accessToken) {
        localStorage.setItem('token', data.data.accessToken);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Google Signup error', err);
      setError(err.response?.data?.message || 'An error occurred during Google signup.');
    }
  };

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

          {/* Secure Google Login Button Container */}
          <div className="purple-socials" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google signup failed')}
              shape="pill"
              theme="outline"
              size="large"
              width="100%"
            />
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
