import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FiSun, FiMoon, FiLogOut, FiUser, FiAward, FiSettings, FiBell, FiMenu, FiX } from 'react-icons/fi';
import './Header.css';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Home', end: true },
  { to: '/dashboard/learning', label: 'Learning' },
  { to: '/dashboard/jobs', label: 'Jobs' },
  { to: '/dashboard/goals', label: 'Goals' },
  { to: '/dashboard/ai', label: 'AI Features' },
];

const DRAWER_LINKS = [
  { to: '/dashboard', label: 'Home', end: true },
  { to: '/dashboard/learning', label: 'Learning' },
  { to: '/dashboard/jobs', label: 'Jobs' },
  { to: '/dashboard/goals', label: 'Goals' },
  { to: '/dashboard/ai', label: 'AI Features' },
  { to: '/dashboard/internships', label: 'Internships' },
  { to: '/dashboard/resume-builder', label: 'Resume Builder' },
  { to: '/dashboard/analytics', label: 'Analytics' },
];

const Header = ({ userProfile, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const dropdownRef = useRef(null);
  const hamburgerRef = useRef(null);

  const name = userProfile?.name || 'User';
  const avatarText = userProfile?.name
    ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.setAttribute('data-theme', darkMode ? 'light' : 'dark');
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (hamburgerRef.current && !hamburgerRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="header">
        <div className="header-container">
          {/* Left Side: Brand Logo */}
          <Link to="/dashboard" className="header-logo">
            <div className="header-logo-icon">C</div>
            <span className="header-logo-text">Careerflow.ai</span>
          </Link>

          {/* Center: Navigation Links (desktop) */}
          <nav className="header-nav">
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Side: Profile & Utilities */}
          <div className="header-actions">
            <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>

            <div className="profile-dropdown-wrapper" ref={dropdownRef}>
              <button className="avatar-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                {avatarText}
              </button>

              {dropdownOpen && (
                <div className="profile-dropdown-menu">
                  <div className="dropdown-user-info">
                    <div className="user-name">{name}</div>
                    <div className="user-email">{userProfile?.email || ''}</div>
                  </div>
                  <hr className="dropdown-divider" />
                  <Link to="/dashboard/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <FiUser className="item-icon" /> User Profile
                  </Link>
                  <Link to="/dashboard/certifications" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <FiAward className="item-icon" /> Certifications
                  </Link>
                  <Link to="/dashboard/notifications" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <FiBell className="item-icon" /> Notifications
                  </Link>
                  <Link to="/dashboard/settings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <FiSettings className="item-icon" /> Settings
                  </Link>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item logout" onClick={() => { setDropdownOpen(false); onLogout(); }}>
                    <FiLogOut className="item-icon" /> Logout
                  </button>
                </div>
              )}
            </div>

            {/* Hamburger button dropdown — mobile only */}
            <div className="hamburger-dropdown-wrapper" ref={hamburgerRef}>
              <button
                className="hamburger-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>

              {mobileMenuOpen && (
                <div className="hamburger-dropdown-menu">
                  {DRAWER_LINKS.map(link => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.end}
                      className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
                      style={{ textDecoration: 'none' }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
