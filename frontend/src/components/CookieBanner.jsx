import React, { useState, useEffect } from 'react';
import './CookieBanner.css';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already set their preference
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  const handlePreferences = () => {
    localStorage.setItem('cookieConsent', 'preferences');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner-wrapper">
      <div className="cookie-banner-card">
        <p className="cookie-banner-text">
          We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to improve user experience and analyze website traffic. By clicking “Accept,” you agree to our website's cookie use as described in our <a href="/cookie-policy" className="cookie-policy-link">Cookie Policy</a>. You can change your cookie settings at any time by clicking “<span className="cookie-highlight-link" onClick={handlePreferences}>Preferences</span>.”
        </p>
        <div className="cookie-banner-actions">
          <button className="cookie-btn btn-preferences" onClick={handlePreferences}>
            Preferences
          </button>
          <button className="cookie-btn btn-decline" onClick={handleDecline}>
            Decline
          </button>
          <button className="cookie-btn btn-accept" onClick={handleAccept}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
