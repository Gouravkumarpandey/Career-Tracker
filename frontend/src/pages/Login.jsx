import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';

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
        if (data.data?.accessToken) {
          localStorage.setItem('token', data.data.accessToken);
        }
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error', err);
      setError('An error occurred during login.');
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
        setError(data.message || 'Google Login failed');
      }
    } catch (err) {
      console.error('Google Login error', err);
      setError('An error occurred during Google login.');
    }
  };

  return (
    <div className="teal-split-layout">
      {/* Left Side - Login Form */}
      <div className="teal-split-left">
        {/* Top Left Logo */}
        <div className="teal-login-header">
          <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
            <div className="logo-icon">C</div>
            <span>Careerflow.ai</span>
          </Link>
        </div>

        <div className="teal-login-container">
          <h2 className="teal-login-title">Login</h2>

          <form onSubmit={handleSubmit} className="teal-login-form">
            {error && <div className="teal-error">{error}</div>}

            <div className="teal-field">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="teal-field teal-password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="teal-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>

            <button type="submit" className="teal-submit-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="teal-forgot-password">
            <Link to="#">Forgot Password?</Link>
          </div>

          <div className="teal-divider">
            <span>or sign in with these providers</span>
          </div>

          <div className="teal-socials">
            <button type="button" className="teal-social-btn google-btn">
              <span className="social-icon google-icon">G</span>
              Continue with Google
            </button>
          </div>

          <div className="teal-footer-text">
            Not a member yet? <Link to="/signup">Create an account</Link>
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

export default Login;

