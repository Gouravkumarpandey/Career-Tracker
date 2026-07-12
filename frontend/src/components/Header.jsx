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

const Header = ({ userProfile, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const dropdownRef = useRef(null);

  const name = userProfile?.name || 'User';
  const avatarText = userProfile?.name
    ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.setAttribute('data-theme', darkMode ? 'light' : 'dark');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change (via link click)
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="header">
        <div className="header-container">
          {/* Left Side: Brand Logo */}
          <Link to="/dashboard" className="header-logo">
            <div className="header-logo-icon">C</div>
            <span className="header-logo-text">CareerTracker</span>
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
                  <Link to="/dashboard/internships" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <FiAward className="item-icon" /> Internships
                  </Link>
                  <Link to="/dashboard/certifications" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <FiAward className="item-icon" /> Certifications
                  </Link>
                  <Link to="/dashboard/resume-builder" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <FiSettings className="item-icon" /> Resume Builder
                  </Link>
                  <Link to="/dashboard/analytics" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <FiSettings className="item-icon" /> Analytics
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

            {/* Hamburger button — mobile only */}
            <button
              className="hamburger-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <FiMenu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMobileMenu}>
          <nav className="mobile-drawer" onClick={e => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <Link to="/dashboard" className="header-logo" onClick={closeMobileMenu}>
                <div className="header-logo-icon">C</div>
                <span>CareerTracker</span>
              </Link>
              <button className="mobile-close-btn" onClick={closeMobileMenu} aria-label="Close menu">
                <FiX size={22} />
              </button>
            </div>

            <div className="mobile-nav-links">
              {NAV_LINKS.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </NavLink>
              ))}
              <hr className="dropdown-divider" style={{ margin: '12px 0' }} />
              <NavLink to="/dashboard/profile" className="mobile-nav-item" onClick={closeMobileMenu}><FiUser /> Profile</NavLink>
              <NavLink to="/dashboard/internships" className="mobile-nav-item" onClick={closeMobileMenu}><FiAward /> Internships</NavLink>
              <NavLink to="/dashboard/certifications" className="mobile-nav-item" onClick={closeMobileMenu}><FiAward /> Certifications</NavLink>
              <NavLink to="/dashboard/resume-builder" className="mobile-nav-item" onClick={closeMobileMenu}><FiSettings /> Resume Builder</NavLink>
              <NavLink to="/dashboard/analytics" className="mobile-nav-item" onClick={closeMobileMenu}><FiSettings /> Analytics</NavLink>
              <NavLink to="/dashboard/notifications" className="mobile-nav-item" onClick={closeMobileMenu}><FiBell /> Notifications</NavLink>
              <NavLink to="/dashboard/settings" className="mobile-nav-item" onClick={closeMobileMenu}><FiSettings /> Settings</NavLink>
            </div>

            <div className="mobile-drawer-footer">
              <div className="mobile-user-info">
                <div className="avatar-btn" style={{ pointerEvents: 'none' }}>{avatarText}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>{name}</div>
                  <div style={{ fontSize: '12px', color: '#888892' }}>{userProfile?.email}</div>
                </div>
              </div>
              <button className="dropdown-item logout" onClick={() => { closeMobileMenu(); onLogout(); }} style={{ width: '100%', marginTop: '8px' }}>
                <FiLogOut className="item-icon" /> Logout
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;
