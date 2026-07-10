import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi';
import { useGoogleLogin } from '@react-oauth/google';
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

  // ─── Google OAuth ────────────────────────────────────────────────────────────
  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      const response = await api.post('/api/auth/google', {
        idToken: tokenResponse.access_token // The backend expects idToken/accessToken
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

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Google login was cancelled or failed.'),
  });

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

          {/* Google Button — actually triggers OAuth */}
          <div className="teal-socials">
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
