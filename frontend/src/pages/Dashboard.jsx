import React, { useState, useRef } from 'react';
import { FiTrendingUp, FiCheckCircle, FiClock, FiTarget, FiActivity, FiFileText, FiUpload } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [atsScore, setAtsScore] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleQuickAnalyze = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/resume/analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: resumeText })
      });
      const data = await response.json();
      if (response.ok) {
        setAtsScore(data.data.overallScore || Math.round((data.data.grammarScore + data.data.readabilityIndex) / 2));
      } else {
        setError(data.message || 'Failed to analyze.');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const response = await fetch('/api/ai/resume/upload-analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        setAtsScore(data.data.overallScore || Math.round((data.data.grammarScore + data.data.readabilityIndex) / 2));
      } else {
        setError(data.message || 'Failed to analyze uploaded resume.');
      }
    } catch (err) {
      setError('An error occurred during file upload analysis.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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

      <div className="dash-card" style={{ gridColumn: 'span 8' }}>
        <h2 className="dash-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiFileText /> Quick ATS Score Checker</span>
          <div>
            <button 
              onClick={() => fileInputRef.current.click()}
              disabled={loading}
              style={{ background: 'var(--dash-surface)', color: 'var(--dash-text-main)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--dash-border)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <FiUpload /> Upload PDF
            </button>
            <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
          </div>
        </h2>
        <p style={{ color: 'var(--dash-text-muted)', marginBottom: '16px', fontSize: '14px' }}>
          Powered by Grok AI. Paste your resume text or upload a PDF to get a quick compatibility score.
        </p>
        
        {error && <div style={{ color: '#ef4444', marginBottom: '12px', fontSize: '14px' }}>{error}</div>}
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <textarea 
            placeholder="Paste your resume here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            style={{ flex: 1, height: '100px', padding: '12px', borderRadius: '8px', border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text-main)', resize: 'vertical' }}
          ></textarea>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '150px' }}>
            <button 
              onClick={handleQuickAnalyze}
              disabled={loading || !resumeText.trim()}
              style={{ background: 'var(--dash-primary)', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {loading ? 'Analyzing...' : <><FiActivity /> Get Score</>}
            </button>
            
            {atsScore !== null && (
              <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>ATS SCORE</div>
                <div style={{ fontSize: '32px', fontWeight: '900' }}>{atsScore}</div>
              </div>
            )}
          </div>
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
