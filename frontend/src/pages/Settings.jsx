import React, { useState } from 'react';
import { FiMoon, FiSun, FiMonitor, FiBell, FiLock, FiGlobe, FiUserX } from 'react-icons/fi';
import './Settings.css';

const Settings = () => {
  const [theme, setTheme] = useState('system');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    interviews: true,
    deadlines: true
  });
  const [privacy, setPrivacy] = useState({
    publicProfile: false,
    showEmail: false
  });

  const handleNotificationChange = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handlePrivacyChange = (key) => {
    setPrivacy({ ...privacy, [key]: !privacy[key] });
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1 className="settings-title">Settings & Preferences</h1>
        <p className="settings-subtitle">Manage your account settings, appearance, and notifications.</p>
      </div>

      <div className="settings-card">
        <div className="settings-card-header">
          <h2 className="settings-card-title"><FiMonitor /> Appearance</h2>
        </div>
        <div className="settings-card-body">
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label">Theme Preference</div>
              <div className="setting-desc">Choose how CareerFlow looks to you.</div>
            </div>
            <div className="setting-action">
              <select 
                className="settings-select"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
                <option value="system">System Default</option>
              </select>
            </div>
          </div>
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label">Accent Color</div>
              <div className="setting-desc">Personalize your dashboard's primary color.</div>
            </div>
            <div className="setting-action">
              <select className="settings-select">
                <option value="blue">Blue (Default)</option>
                <option value="purple">Purple</option>
                <option value="green">Emerald</option>
                <option value="orange">Sunset</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-card-header">
          <h2 className="settings-card-title"><FiGlobe /> Language & Region</h2>
        </div>
        <div className="settings-card-body">
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label">Language</div>
              <div className="setting-desc">Select your preferred language.</div>
            </div>
            <div className="setting-action">
              <select className="settings-select">
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-card-header">
          <h2 className="settings-card-title"><FiBell /> Notifications</h2>
        </div>
        <div className="settings-card-body">
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label">Email Alerts</div>
              <div className="setting-desc">Receive weekly summaries and important updates via email.</div>
            </div>
            <div className="setting-action">
              <label className="toggle-switch">
                <input type="checkbox" checked={notifications.email} onChange={() => handleNotificationChange('email')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label">Push Notifications</div>
              <div className="setting-desc">Get browser notifications while the app is open.</div>
            </div>
            <div className="setting-action">
              <label className="toggle-switch">
                <input type="checkbox" checked={notifications.push} onChange={() => handleNotificationChange('push')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label">Interview Reminders</div>
              <div className="setting-desc">Notify me 24 hours before scheduled interviews.</div>
            </div>
            <div className="setting-action">
              <label className="toggle-switch">
                <input type="checkbox" checked={notifications.interviews} onChange={() => handleNotificationChange('interviews')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-card-header">
          <h2 className="settings-card-title"><FiLock /> Privacy & Security</h2>
        </div>
        <div className="settings-card-body">
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label">Public Profile</div>
              <div className="setting-desc">Allow recruiters to view your profile using a public link.</div>
            </div>
            <div className="setting-action">
              <label className="toggle-switch">
                <input type="checkbox" checked={privacy.publicProfile} onChange={() => handlePrivacyChange('publicProfile')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label">Show Email on Profile</div>
              <div className="setting-desc">Make your email visible on your public profile.</div>
            </div>
            <div className="setting-action">
              <label className="toggle-switch">
                <input type="checkbox" checked={privacy.showEmail} onChange={() => handlePrivacyChange('showEmail')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-card" style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
        <div className="settings-card-header" style={{ background: 'rgba(239, 68, 68, 0.05)' }}>
          <h2 className="settings-card-title" style={{ color: '#ef4444' }}><FiUserX /> Account Management</h2>
        </div>
        <div className="settings-card-body">
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label">Delete Account</div>
              <div className="setting-desc">Permanently remove your account and all associated data. This action cannot be undone.</div>
            </div>
            <div className="setting-action">
              <button className="btn-danger">Delete Account</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Settings;
