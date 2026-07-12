import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import api from '../config/api';

const Signup = () => {
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    agreed: false,
  });
  const [step, setStep] = useState('form'); // 'form' or 'otp'
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (error) setError('');
  };

  // ─── Step 1: Request OTP ───────────────────────────────────────────────────
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.agreed) {
      setError('You must agree to the Terms and Privacy Policy.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/signup-otp', {
        email: formData.email,
      });

      if (response.status === 200 || response.status === 201) {
        setStep('otp');
      }
    } catch (err) {
      console.error('Request OTP error', err);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Verify OTP and Register ─────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        otp: otp,
      });

      const data = response.data;
      if (data.data?.accessToken) {
        localStorage.setItem('token', data.data.accessToken);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Verify OTP / Signup error', err);
      setError(err.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Resend OTP ──────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/signup-otp', {
        email: formData.email,
      });
      alert('A new OTP has been sent to your email.');
    } catch (err) {
      console.error('Resend OTP error', err);
      setError(err.response?.data?.message || 'Failed to resend OTP.');
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
      {/* Left Side - Signup / OTP Form */}
      <div className="teal-split-left">
        {/* Logo */}
        <div className="teal-login-header">
          <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
            <div className="logo-icon">C</div>
            <span>Careerflow.ai</span>
          </Link>
        </div>

        <div className="purple-login-container">
          {step === 'form' ? (
            <>
              <h2 className="purple-login-title">Sign up</h2>
              <p className="purple-login-subtitle">Create a new account</p>

              <form onSubmit={handleRequestOtp} className="purple-login-form">
                {error && <div className="teal-error">{error}</div>}

                <div className="purple-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
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
                  {loading ? 'Sending OTP...' : 'Sign Up'}
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
            </>
          ) : (
            <>
              <h2 className="purple-login-title">Verify Email</h2>
              <p className="purple-login-subtitle">Enter the 6-digit OTP code sent to your email.</p>

              <form onSubmit={handleVerifyOtp} className="purple-login-form">
                {error && <div className="teal-error">{error}</div>}

                <div className="purple-field">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiShield size={14} /> Verification Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}
                  />
                </div>

                <button type="submit" className="purple-submit-btn" disabled={loading || otp.length !== 6}>
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </form>

              <div className="purple-footer-links" style={{ marginTop: '20px' }}>
                <div className="purple-footer-row" style={{ justifyContent: 'space-between', width: '100%' }}>
                  <button onClick={handleResendOtp} disabled={loading} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '14px', padding: 0 }}>
                    Resend OTP
                  </button>
                  <button onClick={() => setStep('form')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '14px', padding: 0 }}>
                    Edit Details
                  </button>
                </div>
              </div>
            </>
          )}
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

