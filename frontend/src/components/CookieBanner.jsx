import React, { useState, useEffect } from 'react';
import './CookieBanner.css';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    marketing: false
  });

  useEffect(() => {
    // Check if the URL has ?reset-cookies=true to reset state for testing
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset-cookies') === 'true') {
      localStorage.removeItem('cookieConsent');
      localStorage.removeItem('cookiePreferences');
      // Clean up the URL query parameter without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete('reset-cookies');
      window.history.replaceState({}, document.title, url.pathname + url.search);
    }

    // Check if user has already set their preference
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    } else {
      // Load saved preferences if any
      const savedPrefs = localStorage.getItem('cookiePreferences');
      if (savedPrefs) {
        try {
          setPreferences(JSON.parse(savedPrefs));
        } catch (e) {
          console.error("Failed to parse cookie preferences", e);
        }
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = { essential: true, analytics: true, marketing: true };
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    setPreferences(allAccepted);
    setIsVisible(false);
    setShowModal(false);
  };

  const handleDeclineAll = () => {
    const allDeclined = { essential: true, analytics: false, marketing: false };
    localStorage.setItem('cookieConsent', 'declined');
    localStorage.setItem('cookiePreferences', JSON.stringify(allDeclined));
    setPreferences(allDeclined);
    setIsVisible(false);
    setShowModal(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookieConsent', 'custom');
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    setIsVisible(false);
    setShowModal(false);
  };

  const togglePreference = (key) => {
    if (key === 'essential') return; // Cannot toggle essential
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!isVisible && !showModal) return null;

  return (
    <>
      {/* Cookie Banner (Bottom Bar) */}
      {isVisible && !showModal && (
        <div className="cookie-banner-wrapper">
          <div className="cookie-banner-card">
            <p className="cookie-banner-text">
              We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to improve user experience and analyze website traffic. By clicking “Accept,” you agree to our website's cookie use as described in our <span className="cookie-highlight-link" onClick={() => setShowModal(true)}>Cookie Policy</span>. You can change your cookie settings at any time by clicking “<span className="cookie-highlight-link" onClick={() => setShowModal(true)}>Preferences</span>.”
            </p>
            <div className="cookie-banner-actions">
              <button className="cookie-btn btn-preferences" onClick={() => setShowModal(true)}>
                Preferences
              </button>
              <button className="cookie-btn btn-decline" onClick={handleDeclineAll}>
                Decline
              </button>
              <button className="cookie-btn btn-accept" onClick={handleAcceptAll}>
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Preference Modal */}
      {showModal && (
        <div className="cookie-modal-overlay">
          <div className="cookie-modal-card">
            <div className="cookie-modal-header">
              <h3>Cookie Preferences</h3>
              <button className="cookie-modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <div className="cookie-modal-body">
              <p className="cookie-modal-intro">
                When you visit our website, we store cookies on your browser to collect information. The information collected might relate to you, your preferences or your device, and is mostly used to make the site work as you expect it to.
              </p>

              {/* Item 1: Essential */}
              <div className="cookie-pref-item">
                <div className="cookie-pref-info">
                  <h4>Essential Cookies <span className="always-active">Always Active</span></h4>
                  <p>These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms.</p>
                </div>
                <div className="cookie-pref-toggle-wrapper">
                  <label className="cookie-switch">
                    <input type="checkbox" checked disabled />
                    <span className="cookie-slider disabled"></span>
                  </label>
                </div>
              </div>

              {/* Item 2: Analytics */}
              <div className="cookie-pref-item">
                <div className="cookie-pref-info">
                  <h4>Analytics & Performance Cookies</h4>
                  <p>These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.</p>
                </div>
                <div className="cookie-pref-toggle-wrapper">
                  <label className="cookie-switch">
                    <input 
                      type="checkbox" 
                      checked={preferences.analytics} 
                      onChange={() => togglePreference('analytics')}
                    />
                    <span className="cookie-slider"></span>
                  </label>
                </div>
              </div>

              {/* Item 3: Marketing */}
              <div className="cookie-pref-item">
                <div className="cookie-pref-info">
                  <h4>Targeting & Marketing Cookies</h4>
                  <p>These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.</p>
                </div>
                <div className="cookie-pref-toggle-wrapper">
                  <label className="cookie-switch">
                    <input 
                      type="checkbox" 
                      checked={preferences.marketing} 
                      onChange={() => togglePreference('marketing')}
                    />
                    <span className="cookie-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="cookie-modal-footer">
              <button className="cookie-btn btn-decline" onClick={handleDeclineAll}>
                Decline All
              </button>
              <button className="cookie-btn btn-preferences" onClick={handleSavePreferences}>
                Save Preferences
              </button>
              <button className="cookie-btn btn-accept" onClick={handleAcceptAll}>
                Allow All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieBanner;
