import React, { useState, useRef, useEffect } from 'react';
import { 
  FiTrendingUp, FiCheckCircle, FiClock, FiTarget, FiActivity, 
  FiFileText, FiUpload, FiCalendar, FiChevronLeft, FiChevronRight, 
  FiAward, FiSliders, FiCheckSquare, FiInfo, FiZap 
} from 'react-icons/fi';
import './Dashboard.css';
import api from '../config/api';

const Dashboard = () => {
  // --- Existing Quick ATS Checker State ---
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [atsScore, setAtsScore] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // --- Dynamic Dashboard Metrics & Stats State ---
  const [apiData, setApiData] = useState(null);
  
  // Interactive Tasks for Daily/Weekly Progress
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Complete React Course Section 4', time: '10:00 AM', completed: true, points: 20 },
    { id: 2, text: 'Update Resume with new project', time: '2:00 PM', completed: false, points: 30 },
    { id: 3, text: 'Apply for Frontend Internships', time: '4:30 PM', completed: false, points: 25 },
    { id: 4, text: 'Solve 2 Leetcode problems', time: '6:00 PM', completed: true, points: 15 },
    { id: 5, text: 'Review feedback on PR', time: '7:30 PM', completed: false, points: 10 }
  ]);

  // Calendar Streak State
  // July 2026 matching the screenshot
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed, so 6 is July

  // Streak history configuration. Keys format: "YYYY-MM-DD".
  // 'missed' (red with x), 'completed' (green with tick), 'active' (blue with </>)
  const [streakHistory, setStreakHistory] = useState({
    "2026-07-01": "missed",
    "2026-07-02": "missed",
    "2026-07-03": "missed",
    "2026-07-04": "missed",
    "2026-07-05": "completed",
    "2026-07-06": "missed",
    "2026-07-07": "completed",
    "2026-07-08": "completed",
    "2026-07-09": "completed",
    "2026-07-10": "active"
  });

  // Calculate streaks dynamically
  const calculateStreak = () => {
    let currentStreak = 0;
    let longestStreak = 4; // Mock baseline longest
    
    // Sort dates ascending
    const sortedDates = Object.keys(streakHistory)
      .filter(dateStr => streakHistory[dateStr] === 'completed' || streakHistory[dateStr] === 'active')
      .sort();
      
    // Calculate current visit streak ending today (2026-07-10)
    let checkDate = new Date(2026, 6, 10); // July 10, 2026
    while (true) {
      const formatted = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (streakHistory[formatted] === 'completed' || streakHistory[formatted] === 'active') {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    // Compute longest streak
    let tempStreak = 0;
    let startCheck = new Date(2026, 6, 1);
    const endCheck = new Date(2026, 6, 10);
    
    while (startCheck <= endCheck) {
      const formatted = `${startCheck.getFullYear()}-${String(startCheck.getMonth() + 1).padStart(2, '0')}-${String(startCheck.getDate()).padStart(2, '0')}`;
      if (streakHistory[formatted] === 'completed' || streakHistory[formatted] === 'active') {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else if (streakHistory[formatted] === 'missed') {
        tempStreak = 0;
      }
      startCheck.setDate(startCheck.getDate() + 1);
    }

    return { current: currentStreak, longest: longestStreak };
  };

  const { current: currentStreak, longest: longestStreak } = calculateStreak();

  // Load backend statistics if available
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await api.get('/api/analytics/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setApiData(res.data);
        }
      } catch (err) {
        console.warn("Could not load backend analytics, using interactive simulation mode.");
      }
    };
    fetchStats();
  }, []);

  // Toggle tasks completion
  const handleToggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // --- Calculations for dynamic metrics ---
  // 1. Goal Completion %
  const completedGoalsCount = apiData?.goalStats?.completedGoals ?? 3;
  const totalGoalsCount = apiData?.goalStats?.totalGoals ?? 5;
  const goalCompletionPercentage = Math.round((completedGoalsCount / totalGoalsCount) * 100);

  // 2. Daily & Weekly Progress
  const totalDailyPoints = tasks.reduce((sum, t) => sum + t.points, 0);
  const completedDailyPoints = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);
  const dailyProgressPercent = Math.round((completedDailyPoints / totalDailyPoints) * 100) || 0;
  
  // Weekly progress is impacted by daily success
  const weeklyProgressPercent = Math.round(60 + (dailyProgressPercent * 0.2));

  // 3. Productivity Score
  // Calculated based on completed tasks, streak multipliers, and career readiness
  const baseProductivity = Math.round((completedDailyPoints / totalDailyPoints) * 80);
  const streakBonus = Math.min(20, currentStreak * 2);
  const productivityScore = Math.min(100, baseProductivity + streakBonus + 10);

  // 4. Career Readiness Score
  const careerReadinessScore = apiData?.careerReadinessScore ?? 78.5;

  // Month navigation helpers
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Toggle calendar days for fun interactive streak editing
  const toggleDayStreak = (dayStr) => {
    setStreakHistory(prev => {
      const currentStatus = prev[dayStr];
      let nextStatus;
      if (currentStatus === 'completed') {
        nextStatus = 'missed';
      } else if (currentStatus === 'missed') {
        nextStatus = 'active';
      } else if (currentStatus === 'active') {
        nextStatus = undefined;
      } else {
        nextStatus = 'completed';
      }
      return {
        ...prev,
        [dayStr]: nextStatus
      };
    });
  };

  // Generate calendar days
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayIndex = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    // Adjust so Mon=0, Tue=1, ..., Sun=6
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const renderCalendar = () => {
    const daysCount = getDaysInMonth(currentYear, currentMonth);
    const firstDayIdx = getFirstDayIndex(currentYear, currentMonth);
    const cells = [];

    // Empty spaces before first day
    for (let i = 0; i < firstDayIdx; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days grid
    for (let day = 1; day <= daysCount; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const status = streakHistory[dateStr];

      let dayClass = "calendar-day";
      let content = day;
      
      if (status === 'completed') {
        dayClass += " completed";
        content = (
          <div className="status-badge check">
            <span>{day}</span>
            <span className="badge-tick">✓</span>
          </div>
        );
      } else if (status === 'missed') {
        dayClass += " missed";
        content = (
          <div className="status-badge cross">
            <span>{day}</span>
            <span className="badge-cross">×</span>
          </div>
        );
      } else if (status === 'active') {
        dayClass += " active-dev";
        content = (
          <div className="status-badge dev">
            <span>&lt;/&gt;</span>
          </div>
        );
      }

      cells.push(
        <button 
          key={dateStr} 
          className={dayClass} 
          onClick={() => toggleDayStreak(dateStr)}
          title="Click to toggle streak log"
        >
          {content}
        </button>
      );
    }

    return cells;
  };

  // --- Existing ATS Checker Handlers ---
  const handleQuickAnalyze = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/api/ai/resume/analyze-text', { text: resumeText }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = response.data;
      setAtsScore(data.data.overallScore || Math.round((data.data.grammarScore + data.data.readabilityIndex) / 2));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred.');
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

      const response = await api.post('/api/ai/resume/upload-analyze', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const data = response.data;
      setAtsScore(data.data.overallScore || Math.round((data.data.grammarScore + data.data.readabilityIndex) / 2));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred during file upload analysis.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="overview-grid">
      <div className="overview-header" style={{ gridColumn: 'span 12' }}>
        <h1>Career Dashboard</h1>
        <p>Welcome back, John! Track your readiness, performance statistics, and daily streak progress.</p>
      </div>

      {/* 4 Stat Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card premium-stat">
          <div className="stat-icon primary">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <span className="stat-label">Career Readiness</span>
            <span className="stat-value">{careerReadinessScore}%</span>
          </div>
        </div>

        <div className="stat-card premium-stat">
          <div className="stat-icon success">
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <span className="stat-label">Goals Completed</span>
            <span className="stat-value">{completedGoalsCount} / {totalGoalsCount}</span>
          </div>
        </div>

        <div className="stat-card premium-stat">
          <div className="stat-icon warning">
            <FiZap />
          </div>
          <div className="stat-content">
            <span className="stat-label">Productivity Score</span>
            <span className="stat-value">{productivityScore}/100</span>
          </div>
        </div>

        <div className="stat-card premium-stat">
          <div className="stat-icon accent">
            <FiTarget />
          </div>
          <div className="stat-content">
            <span className="stat-label">Current Streak</span>
            <span className="stat-value">{currentStreak} Days</span>
          </div>
        </div>
      </div>

      {/* Main Section Left: Skill Growth Graph & Monthly Analytics & ATS */}
      <div className="chart-section main-dashboard-left">
        
        {/* Core Circular Metrics & Readiness Section */}
        <div className="visual-metrics-row">
          {/* Career Readiness Score Circle Meter */}
          <div className="dash-card visual-metric-card">
            <h3 className="card-headline">Career Readiness Gauge</h3>
            <div className="circular-meter-container">
              <svg width="150" height="150" viewBox="0 0 150 150">
                <circle cx="75" cy="75" r="60" className="meter-bg" />
                <circle 
                  cx="75" 
                  cy="75" 
                  r="60" 
                  className="meter-fill color-readiness" 
                  style={{ strokeDashoffset: 377 - (377 * careerReadinessScore) / 100 }} 
                />
                <text x="75" y="70" className="meter-text-large">{careerReadinessScore}%</text>
                <text x="75" y="95" className="meter-text-sub">Fit Score</text>
              </svg>
            </div>
            <div className="visual-stats-legend">
              <span className="legend-item"><span className="dot fill-readiness"></span> Profile Completion</span>
              <span className="legend-item"><span className="dot fill-readiness"></span> Core Skills Mastery</span>
            </div>
          </div>

          {/* Goal Completion Ring */}
          <div className="dash-card visual-metric-card">
            <h3 className="card-headline">Goal Completion %</h3>
            <div className="circular-meter-container">
              <svg width="150" height="150" viewBox="0 0 150 150">
                <circle cx="75" cy="75" r="60" className="meter-bg" />
                <circle 
                  cx="75" 
                  cy="75" 
                  r="60" 
                  className="meter-fill color-goals" 
                  style={{ strokeDashoffset: 377 - (377 * goalCompletionPercentage) / 100 }} 
                />
                <text x="75" y="70" className="meter-text-large">{goalCompletionPercentage}%</text>
                <text x="75" y="95" className="meter-text-sub">Target Met</text>
              </svg>
            </div>
            <div className="visual-stats-legend">
              <span className="legend-item"><span className="dot fill-goals"></span> {completedGoalsCount} Milestones Done</span>
              <span className="legend-item"><span className="dot fill-goals"></span> {totalGoalsCount - completedGoalsCount} Milestones Open</span>
            </div>
          </div>

          {/* Productivity Gauge */}
          <div className="dash-card visual-metric-card">
            <h3 className="card-headline">Productivity Rating</h3>
            <div className="circular-meter-container">
              <svg width="150" height="150" viewBox="0 0 150 150">
                <circle cx="75" cy="75" r="60" className="meter-bg" />
                <circle 
                  cx="75" 
                  cy="75" 
                  r="60" 
                  className="meter-fill color-productivity" 
                  style={{ strokeDashoffset: 377 - (377 * productivityScore) / 100 }} 
                />
                <text x="75" y="70" className="meter-text-large">{productivityScore}</text>
                <text x="75" y="95" className="meter-text-sub">Performance</text>
              </svg>
            </div>
            <div className="visual-stats-legend">
              <span className="legend-item"><span className="dot fill-productivity"></span> Daily Task Weight</span>
              <span className="legend-item"><span className="dot fill-productivity"></span> Streak Multiplier</span>
            </div>
          </div>
        </div>

        {/* Skill Growth Graph */}
        <div className="dash-card graph-card">
          <h2 className="dash-title">Skill Growth & Activity Area</h2>
          <div className="skill-graph-container">
            {/* Custom interactive responsive SVG graph */}
            <svg viewBox="0 0 600 240" className="skill-svg-chart">
              {/* Grid Lines */}
              <line x1="50" y1="200" x2="550" y2="200" className="graph-grid-line" />
              <line x1="50" y1="140" x2="550" y2="140" className="graph-grid-line" />
              <line x1="50" y1="80" x2="550" y2="80" className="graph-grid-line" />
              <line x1="50" y1="20" x2="550" y2="20" className="graph-grid-line" />

              {/* Graph Fills (Area) */}
              <path 
                d="M 50 200 Q 150 120 250 150 T 450 60 T 550 40 L 550 200 Z" 
                className="graph-area-fill" 
              />

              {/* Graph Curves */}
              <path 
                d="M 50 200 Q 150 120 250 150 T 450 60 T 550 40" 
                className="graph-curve-line" 
              />

              {/* Data points */}
              <circle cx="50" cy="200" r="5" className="graph-dot" />
              <circle cx="150" cy="135" r="5" className="graph-dot" />
              <circle cx="250" cy="150" r="5" className="graph-dot" />
              <circle cx="350" cy="95" r="5" className="graph-dot" />
              <circle cx="450" cy="60" r="5" className="graph-dot" />
              <circle cx="550" cy="40" r="5" className="graph-dot" />

              {/* Labels */}
              <text x="50" y="220" className="graph-axis-label">Jan</text>
              <text x="150" y="220" className="graph-axis-label">Feb</text>
              <text x="250" y="220" className="graph-axis-label">Mar</text>
              <text x="350" y="220" className="graph-axis-label">Apr</text>
              <text x="450" y="220" className="graph-axis-label">May</text>
              <text x="550" y="220" className="graph-axis-label">Jun</text>

              <text x="20" y="25" className="graph-axis-y-label">Expert</text>
              <text x="20" y="145" className="graph-axis-y-label">Inter</text>
              <text x="20" y="205" className="graph-axis-y-label">Beg</text>
            </svg>
          </div>
          <div className="graph-footer-stats">
            <div>
              <span className="stat-subtext">Primary Skill Node</span>
              <h4>React & JavaScript Development</h4>
            </div>
            <div>
              <span className="stat-subtext">Avg Progress Rate</span>
              <h4 style={{ color: 'var(--dash-success)' }}>+24.8% Monthly Growth</h4>
            </div>
          </div>
        </div>

        {/* Monthly Analytics */}
        <div className="dash-card monthly-analytics-card">
          <h2 className="dash-title">Monthly Analytics Report</h2>
          <div className="analytics-metrics-grid">
            <div className="analytics-item">
              <span className="analytics-num">18</span>
              <span className="analytics-label">Applications Sent</span>
              <div className="analytics-mini-bar"><div className="fill" style={{ width: '70%', background: 'var(--dash-primary)' }}></div></div>
            </div>
            <div className="analytics-item">
              <span className="analytics-num">4</span>
              <span className="analytics-label">Interviews Arranged</span>
              <div className="analytics-mini-bar"><div className="fill" style={{ width: '40%', background: 'var(--dash-accent)' }}></div></div>
            </div>
            <div className="analytics-item">
              <span className="analytics-num">2</span>
              <span className="analytics-label">Certificates Earned</span>
              <div className="analytics-mini-bar"><div className="fill" style={{ width: '60%', background: 'var(--dash-success)' }}></div></div>
            </div>
            <div className="analytics-item">
              <span className="analytics-num">32h</span>
              <span className="analytics-label">Time Invested</span>
              <div className="analytics-mini-bar"><div className="fill" style={{ width: '85%', background: 'var(--dash-warning)' }}></div></div>
            </div>
          </div>
        </div>

        {/* Existing Quick ATS Checker */}
        <div className="dash-card ats-checker-card">
          <h2 className="dash-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiFileText /> Quick ATS Score Checker</span>
            <div>
              <button 
                onClick={() => fileInputRef.current.click()}
                disabled={loading}
                className="btn-upload-pdf"
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
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <textarea 
              placeholder="Paste your resume here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="ats-textarea"
            ></textarea>
            
            <div className="ats-submit-wrapper">
              <button 
                onClick={handleQuickAnalyze}
                disabled={loading || !resumeText.trim()}
                className="btn-get-score"
              >
                {loading ? 'Analyzing...' : <><FiActivity /> Get Score</>}
              </button>
              
              {atsScore !== null && (
                <div className="ats-score-badge">
                  <div style={{ fontSize: '11px', fontWeight: 'bold' }}>ATS SCORE</div>
                  <div style={{ fontSize: '32px', fontWeight: '900' }}>{atsScore}</div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Side Section Right: Streak Calendar & Tasks */}
      <div className="side-section main-dashboard-right">
        
        {/* Streak Calendar Card - High Fidelity Dark Style exactly matching image */}
        <div className="dash-card streak-calendar-card">
          <div className="streak-stats-header">
            <div className="streak-stat-box">
              <span className="icon-wrap hourglass">⏳</span>
              <div className="text-wrap">
                <span className="label">Current Visit Streak</span>
                <span className="value">{currentStreak} days</span>
              </div>
            </div>
            
            <div className="streak-divider"></div>

            <div className="streak-stat-box">
              <span className="icon-wrap flame">🔥</span>
              <div className="text-wrap">
                <span className="label">Longest Visit Streak</span>
                <span className="value">{longestStreak} days</span>
              </div>
            </div>
          </div>

          <div className="calendar-container">
            <div className="calendar-header">
              <h3 className="calendar-title">Visit Streak Calendar <FiInfo className="info-icon" title="Days logged in backend and local activities" /></h3>
              <div className="month-selector">
                <button className="arrow-btn" onClick={prevMonth}><FiChevronLeft /></button>
                <span className="month-display">{monthNames[currentMonth]} {currentYear}</span>
                <button className="arrow-btn" onClick={nextMonth}><FiChevronRight /></button>
              </div>
            </div>

            <div className="days-of-week">
              <span>MO</span>
              <span>TU</span>
              <span>WE</span>
              <span>TH</span>
              <span>FR</span>
              <span>SA</span>
              <span>SU</span>
            </div>

            <div className="calendar-grid">
              {renderCalendar()}
            </div>
          </div>
        </div>

        {/* Daily / Weekly Progress & Today's Tasks */}
        <div className="dash-card tasks-progress-card">
          <h2 className="dash-title">Tasks & Progression</h2>
          
          <div className="progress-header">
            <span>Daily Task Progress</span>
            <span className="progress-value">{dailyProgressPercent}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${dailyProgressPercent}%`, background: 'var(--dash-success)' }}></div>
          </div>
          
          <div className="progress-header" style={{ marginTop: '20px' }}>
            <span>Weekly Target Velocity</span>
            <span className="progress-value">{weeklyProgressPercent}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${weeklyProgressPercent}%` }}></div>
          </div>

          <h3 className="dash-subtitle" style={{ marginTop: '28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiCheckSquare /> Today's Tasks
          </h3>
          
          <ul className="task-list">
            {tasks.map(task => (
              <li 
                key={task.id} 
                className={`task-item interactive ${task.completed ? 'completed' : ''}`}
                onClick={() => handleToggleTask(task.id)}
              >
                <div className={`task-checkbox-custom ${task.completed ? 'checked' : ''}`}>
                  {task.completed && <span>✓</span>}
                </div>
                <span className="task-text">{task.text}</span>
                <span className="task-time">{task.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
