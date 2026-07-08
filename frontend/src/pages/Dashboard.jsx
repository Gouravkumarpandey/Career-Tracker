import React from 'react';
import { FiTrendingUp, FiCheckCircle, FiClock, FiTarget } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="overview-grid">
      <div className="overview-header" style={{ gridColumn: 'span 12' }}>
        <h1>Career Dashboard</h1>
        <p>Welcome back, John! Here's what's happening with your career today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <span className="stat-label">Career Readiness</span>
            <span className="stat-value">85%</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <span className="stat-label">Goals Completed</span>
            <span className="stat-value">12</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">
            <FiClock />
          </div>
          <div className="stat-content">
            <span className="stat-label">Learning Hours</span>
            <span className="stat-value">24h</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon accent">
            <FiTarget />
          </div>
          <div className="stat-content">
            <span className="stat-label">Current Streak</span>
            <span className="stat-value">7 Days</span>
          </div>
        </div>
      </div>

      <div className="chart-section dash-card">
        <h2 className="dash-title">Skill Growth & Activity</h2>
        {/* Placeholder for a chart library like Recharts or Chart.js */}
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dash-bg)', borderRadius: '8px', border: '1px dashed var(--dash-border)' }}>
          <p style={{ color: 'var(--dash-text-muted)' }}>Activity Heatmap & Skill Graph will render here</p>
        </div>
      </div>

      <div className="side-section">
        <div className="dash-card">
          <div className="progress-header">
            <span>Weekly Progress</span>
            <span className="progress-value">68%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: '68%' }}></div>
          </div>
          
          <div className="progress-header" style={{ marginTop: '24px' }}>
            <span>Monthly Goals</span>
            <span className="progress-value">42%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: '42%' }}></div>
          </div>
        </div>

        <div className="dash-card">
          <h2 className="dash-title" style={{ fontSize: '18px' }}>Today's Tasks</h2>
          <ul className="task-list">
            <li className="task-item">
              <div className="task-checkbox"></div>
              <span className="task-text">Complete React Course Section 4</span>
              <span className="task-time">10:00 AM</span>
            </li>
            <li className="task-item">
              <div className="task-checkbox"></div>
              <span className="task-text">Update Resume with new project</span>
              <span className="task-time">2:00 PM</span>
            </li>
            <li className="task-item">
              <div className="task-checkbox"></div>
              <span className="task-text">Apply for Frontend Internships</span>
              <span className="task-time">4:30 PM</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
