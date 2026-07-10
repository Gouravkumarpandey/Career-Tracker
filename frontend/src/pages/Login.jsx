import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import api from '../config/api';

const Login = () => {
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  // ─── Google OAuth Success Callback ───────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await api.post('/api/auth/google', {
        idToken: credentialResponse.credential
      });
      const data = response.data;
      if (data.data?.accessToken) {
        localStorage.setItem('token', data.data.accessToken);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Google login error', err);
      setError(err.response?.data?.message || 'Google login failed');
    }
  };

  // ─── Email / Password Login ──────────────────────────────────────────────────
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

      const response = await api.post('/api/auth/login', {
        email: formData.email,
        password: formData.password,
        recaptchaToken: token,
      });

      const data = response.data;
      if (data.data?.accessToken) {
        localStorage.setItem('token', data.data.accessToken);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error', err);
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teal-split-layout">
      {/* Left Side */}
      <div className="teal-split-left">
        <div className="teal-login-header">
          <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
            <div className="logo-icon">C</div>
            <span>Careerflow.ai</span>
          </Link>
        </div>

        <div className="teal-login-container">
          <div className="login-form-header">
            <h2 className="teal-login-title">Welcome back</h2>
            <p className="login-subtitle">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="teal-login-form">
            {error && <div className="teal-error">{error}</div>}

            {/* Email */}
            <div className="login-field-group">
              <label className="login-label">Email address</label>
              <div className="login-input-wrapper">
                <FiMail className="login-input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="login-input"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field-group">
              <div className="login-label-row">
                <label className="login-label">Password</label>
                <Link to="#" className="login-forgot">Forgot password?</Link>
              </div>
              <div className="login-input-wrapper">
                <FiLock className="login-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="login-input"
                  required
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="login-divider">
            <span>or continue with</span>
          </div>

          {/* Secure Google Login Button Container */}
          <div className="teal-socials" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google login failed')}
              shape="pill"
              theme="outline"
              size="large"
              width="100%"
            />
          </div>

          <div className="teal-footer-text" style={{ textAlign: 'center' }}>
            Not a member yet? <Link to="/signup">Create an account</Link>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="teal-split-right">
        <img
          src="https://cdn.prod.website-files.com/62775a91cc3db44c787149de/67183eb61f2946ce0cd8415e_AI-Interview-Practice.webp"
          alt="AI Interview Practice"
        />
      </div>
    </div>
  );
};

export default Login;
