import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, FiUser, FiBookOpen, FiCpu, 
  FiBriefcase, FiAward, FiTarget, FiCalendar, 
  FiFileText, FiPieChart, FiBell, FiSettings,
  FiLogOut, FiX
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar, userProfile, onLogout }) => {
  const name = userProfile?.name || 'Loading...';
  const role = userProfile?.role || 'User';
  const avatarText = userProfile?.name ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <NavLink to="/dashboard" className="sidebar-logo">
          <div className="sidebar-logo-icon">C</div>
          CareerTracker
        </NavLink>
        <button className="sidebar-close" onClick={toggleSidebar} aria-label="Close Sidebar">
          <FiX />
        </button>
      </div>

      <div className="sidebar-content">
        <div className="sidebar-section">
          <div className="sidebar-title">Main</div>
          <nav className="sidebar-nav">
            <NavLink to="/dashboard" end className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <span className="sidebar-icon"><FiHome /></span>
              Career Dashboard
            </NavLink>
            <NavLink to="/dashboard/profile" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <span className="sidebar-icon"><FiUser /></span>
              User Profile
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">Growth & Tracking</div>
          <nav className="sidebar-nav">
            <NavLink to="/dashboard/learning" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <span className="sidebar-icon"><FiBookOpen /></span>
              Learning Tracker
            </NavLink>
            <NavLink to="/dashboard/jobs" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <span className="sidebar-icon"><FiBriefcase /></span>
              Job Tracker
            </NavLink>
            <NavLink to="/dashboard/internships" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <span className="sidebar-icon"><FiBriefcase /></span>
              Internships
            </NavLink>
            <NavLink to="/dashboard/certifications" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <span className="sidebar-icon"><FiAward /></span>
              Certifications
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">Planning & Tools</div>
          <nav className="sidebar-nav">
            <NavLink to="/dashboard/ai" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <span className="sidebar-icon"><FiCpu /></span>
              AI Features
            </NavLink>
            <NavLink to="/dashboard/goals" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <span className="sidebar-icon"><FiTarget /></span>
              Goal Management
            </NavLink>
            <NavLink to="/dashboard/planner" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <span className="sidebar-icon"><FiCalendar /></span>
              Planner
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">Insights & Creation</div>
          <nav className="sidebar-nav">
            <NavLink to="/dashboard/resume-builder" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <span className="sidebar-icon"><FiFileText /></span>
              Resume Builder
            </NavLink>
            <NavLink to="/dashboard/analytics" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <span className="sidebar-icon"><FiPieChart /></span>
              Analytics
            </NavLink>
          </nav>
        </div>
        
        <div className="sidebar-section">
          <div className="sidebar-title">System</div>
          <nav className="sidebar-nav">
            <NavLink to="/dashboard/notifications" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <span className="sidebar-icon"><FiBell /></span>
              Notifications
            </NavLink>
            <NavLink to="/dashboard/settings" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <span className="sidebar-icon"><FiSettings /></span>
              Settings
            </NavLink>
          </nav>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-profile-mini">
          <div className="user-avatar">{avatarText}</div>
          <div className="user-info">
            <div className="user-name">{name}</div>
            <div className="user-role">{role}</div>
          </div>
          <button className="logout-btn-mini" onClick={onLogout} title="Logout">
            <FiLogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
