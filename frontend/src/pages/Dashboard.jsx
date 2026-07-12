import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  FiTrendingUp, FiCheckCircle, FiClock, FiTarget, FiActivity, 
  FiCalendar, FiAward, FiSliders, FiZap, FiChevronLeft, FiChevronRight, FiInfo 
} from 'react-icons/fi';
import './Dashboard.css';
import api from '../config/api';

const Dashboard = () => {
  const { userProfile } = useOutletContext() || {};

  // --- Dynamic Dashboard Metrics & Stats State ---
  const [apiData, setApiData] = useState(null);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [interviewsCount, setInterviewsCount] = useState(0);
  const [completedTopicsCount, setCompletedTopicsCount] = useState(0);
  const [localTasks, setLocalTasks] = useState(null);

  // Calendar Month State matching July 2026
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed, so 6 is July

  // Streak states
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [streakHistory, setStreakHistory] = useState({});

  // Activity Log Heatmap State
  const [activityData, setActivityData] = useState({ dailyActivities: [], currentStreak: 0, longestStreak: 0 });

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await api.get('/api/activities', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = res.data.data;
          setActivityData(data);
          setCurrentStreak(data.currentStreak || 0);
          setLongestStreak(data.longestStreak || 0);

          const history = {};
          data.dailyActivities?.forEach(act => {
            if (act.qualified) {
              history[act.date] = 'active';
            }
          });
          setStreakHistory(history);
        }
      } catch (err) {
        console.warn("Could not load activity log data", err);
      }
    };
    fetchActivities();
  }, [userProfile]);

  // Load backend statistics if available
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await api.get('/api/analytics/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setApiData(res.data.data);
        }
      } catch (err) {
        console.warn("Could not load backend analytics, using interactive simulation mode.");
      }
    };

    const fetchJobApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await api.get('/api/jobs/applications', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const apps = res.data.data || [];
          setApplicationsCount(apps.length);
          const totalInterviews = apps.reduce((sum, app) => sum + (app.interviews?.length || 0), 0);
          setInterviewsCount(totalInterviews);
        }
      } catch (err) {
        console.warn("Could not load job applications count", err);
      }
    };

    const loadLocalData = () => {
      const savedTasks = localStorage.getItem('careerTrackerTasks');
      if (savedTasks) {
        try {
          setLocalTasks(JSON.parse(savedTasks));
        } catch (e) {
          console.error(e);
        }
      }
      const savedTopics = localStorage.getItem('lt_topics');
      if (savedTopics) {
        try {
          const parsed = JSON.parse(savedTopics);
          setCompletedTopicsCount(parsed.length);
        } catch (e) {
          console.error(e);
        }
      }
    };

    fetchStats();
    fetchJobApplications();
    loadLocalData();
  }, [userProfile]);

  // --- Calculations for dynamic metrics ---
  // 1. Goal Completion %
  const completedGoalsCount = apiData?.goalStats?.completedGoals ?? 3;
  const totalGoalsCount = apiData?.goalStats?.totalGoals ?? 5;
  const goalCompletionPercentage = Math.round((completedGoalsCount / totalGoalsCount) * 100);

  // 2. Daily & Weekly Progress
  const mockTasks = [
    { id: 1, text: 'Complete React Course Section 4', time: '10:00 AM', completed: true, points: 20 },
    { id: 2, text: 'Update Resume with new project', time: '2:00 PM', completed: false, points: 30 },
    { id: 3, text: 'Apply for Frontend Internships', time: '4:30 PM', completed: false, points: 25 },
    { id: 4, text: 'Solve 2 Leetcode problems', time: '6:00 PM', completed: true, points: 15 },
    { id: 5, text: 'Review feedback on PR', time: '7:30 PM', completed: false, points: 10 }
  ];

  let dailyProgressPercent = 0;
  let weeklyProgressPercent = 60;
  let productivityScore = 40;

  const hasLocalTasks = localTasks && (
    (localTasks.todo && localTasks.todo.length > 0) || 
    (localTasks.inProgress && localTasks.inProgress.length > 0) || 
    (localTasks.done && localTasks.done.length > 0)
  );

  if (hasLocalTasks) {
    const todoCount = localTasks.todo?.length || 0;
    const inProgressCount = localTasks.inProgress?.length || 0;
    const doneCount = localTasks.done?.length || 0;
    const totalCount = todoCount + inProgressCount + doneCount;
    
    dailyProgressPercent = Math.round((doneCount / totalCount) * 100);
    weeklyProgressPercent = Math.round(60 + (dailyProgressPercent * 0.2));
    
    const baseProductivity = Math.round((doneCount / totalCount) * 80);
    const streakBonus = Math.min(20, currentStreak * 2);
    productivityScore = Math.min(100, baseProductivity + streakBonus + 10);
  } else {
    const totalDailyPoints = mockTasks.reduce((sum, t) => sum + t.points, 0);
    const completedDailyPoints = mockTasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);
    dailyProgressPercent = Math.round((completedDailyPoints / totalDailyPoints) * 100) || 0;
    weeklyProgressPercent = Math.round(60 + (dailyProgressPercent * 0.2));
    
    const baseProductivity = Math.round((completedDailyPoints / totalDailyPoints) * 80);
    const streakBonus = Math.min(20, currentStreak * 2);
    productivityScore = Math.min(100, baseProductivity + streakBonus + 10);
  }

  // Safety checks to prevent NaN
  if (isNaN(productivityScore)) {
    productivityScore = 40;
  }
  if (isNaN(dailyProgressPercent)) {
    dailyProgressPercent = 0;
  }
  if (isNaN(weeklyProgressPercent)) {
    weeklyProgressPercent = 60;
  }

  // 3. Time Invested
  const certsCount = apiData?.certificationStats?.activeCertifications ?? 0;
  const timeInvested = (completedTopicsCount * 4) + (certsCount * 10) + 12;

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
            <span>🔥</span>
          </div>
        );
      }

      cells.push(
        <div 
          key={dateStr} 
          className={dayClass}
        >
          {content}
        </div>
      );
    }

    return cells;
  };

  const activeDaysCount = activityData.activeDays || 0;
  const totalActivitiesCount = activityData.totalActivities || 0;

  const getMonthList = () => {
    const list = [];
    let m = currentMonth + 1; // start from 12 months ago
    let y = currentYear - 1;
    for (let i = 0; i < 12; i++) {
      if (m > 11) {
        m = 0;
        y++;
      }
      list.push({ month: m, year: y });
      m++;
    }
    return list;
  };

  const renderContributionMap = () => {
    const months = getMonthList();
    const activityMap = {};
    activityData.dailyActivities?.forEach(act => {
      activityMap[act.date] = act.score;
    });
    
    return (
      <div className="contribution-map-container">
        <div className="months-row">
          {months.map(({ month, year }) => {
            const daysCount = new Date(year, month + 1, 0).getDate();
            const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon, ...
            const startIdx = firstDay === 0 ? 6 : firstDay - 1;

            const cells = [];
            for (let i = 0; i < startIdx; i++) {
              cells.push({ dateStr: null, count: 0, isPadding: true });
            }
            for (let day = 1; day <= daysCount; day++) {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const count = activityMap[dateStr] || 0;
              cells.push({ dateStr, count, isPadding: false, dayNum: day });
            }

            const weeks = [];
            let currentWeek = [];
            cells.forEach((cell, idx) => {
              currentWeek.push(cell);
              if (currentWeek.length === 7 || idx === cells.length - 1) {
                while (currentWeek.length < 7) {
                  currentWeek.push({ dateStr: null, count: 0, isPadding: true });
                }
                weeks.push(currentWeek);
                currentWeek = [];
              }
            });

            return (
              <div key={`${year}-${month}`} className="month-block">
                <div className="weeks-container">
                  {weeks.map((week, wIdx) => (
                    <div key={wIdx} className="week-column">
                      {week.map((day, dIdx) => {
                        let colorClass = "day-square empty";
                        let tooltip = "";
                        
                        if (!day.isPadding) {
                          if (day.count === 0) {
                            colorClass = "day-square level-0";
                            tooltip = `${day.dateStr}: No activity`;
                          } else if (day.count <= 2) {
                            colorClass = "day-square level-1";
                            tooltip = `${day.dateStr}: ${day.count} activities`;
                          } else if (day.count <= 5) {
                            colorClass = "day-square level-2";
                            tooltip = `${day.dateStr}: ${day.count} activities`;
                          } else if (day.count <= 10) {
                            colorClass = "day-square level-3";
                            tooltip = `${day.dateStr}: ${day.count} activities`;
                          } else {
                            colorClass = "day-square level-4";
                            tooltip = `${day.dateStr}: ${day.count} activities`;
                          }
                        }

                        return (
                          <div 
                            key={dIdx} 
                            className={colorClass} 
                            title={tooltip}
                          >
                            {day.count >= 10 && <span className="fire-indicator">🔥</span>}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="month-name-label">{monthNames[month]}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="overview-grid">
      <div className="overview-header" style={{ gridColumn: 'span 12' }}>
        <h1>Career Dashboard</h1>
        <p>Welcome back, {userProfile?.name || 'User'}! Track your readiness, performance statistics, and daily streak progress.</p>
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

      {/* Main Section Left: Skill Growth Graph & Monthly Analytics */}
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

        {/* Activity Heatmap Calendar */}
        <div className="dash-card activity-heatmap-card">
          <div className="heatmap-header">
            <div className="header-left">
              <span className="active-days-count">{activeDaysCount} Active days</span>
              <FiInfo className="info-icon" title="Days with at least 1 meaningful action logged" />
            </div>
            <div className="header-right">
              <span className="streak-badge">
                🔥 {activityData.currentStreak || 0} Day AC Streak! <span className="sub">Longest: {activityData.longestStreak || 0}</span>
              </span>
            </div>
          </div>

          <div className="heatmap-grid-container">
            {renderContributionMap()}
          </div>

          <div className="heatmap-footer">
            <span className="footer-left">{activeDaysCount} problems solved this year</span>
            <div className="footer-right legend">
              <span>Less</span>
              <div className="day-square level-0" title="No activity"></div>
              <div className="day-square level-1" title="1-2 activities"></div>
              <div className="day-square level-2" title="3-5 activities"></div>
              <div className="day-square level-3" title="6-10 activities"></div>
              <div className="day-square level-4" title="10+ activities"><span className="fire-indicator">🔥</span></div>
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Monthly Analytics */}
        <div className="dash-card monthly-analytics-card">
          <h2 className="dash-title">Monthly Analytics Report</h2>
          <div className="analytics-metrics-grid">
            <div className="analytics-item">
              <span className="analytics-num">{applicationsCount}</span>
              <span className="analytics-label">Applications Sent</span>
              <div className="analytics-mini-bar"><div className="fill" style={{ width: `${Math.min(100, (applicationsCount / 20) * 100)}%`, background: 'var(--dash-primary)' }}></div></div>
            </div>
            <div className="analytics-item">
              <span className="analytics-num">{interviewsCount}</span>
              <span className="analytics-label">Interviews Arranged</span>
              <div className="analytics-mini-bar"><div className="fill" style={{ width: `${Math.min(100, (interviewsCount / 5) * 100)}%`, background: 'var(--dash-accent)' }}></div></div>
            </div>
            <div className="analytics-item">
              <span className="analytics-num">{apiData?.certificationStats?.activeCertifications ?? 0}</span>
              <span className="analytics-label">Certificates Earned</span>
              <div className="analytics-mini-bar"><div className="fill" style={{ width: `${Math.min(100, ((apiData?.certificationStats?.activeCertifications || 0) / 3) * 100)}%`, background: 'var(--dash-success)' }}></div></div>
            </div>
            <div className="analytics-item">
              <span className="analytics-num">{timeInvested}h</span>
              <span className="analytics-label">Time Invested</span>
              <div className="analytics-mini-bar"><div className="fill" style={{ width: `${Math.min(100, (timeInvested / 40) * 100)}%`, background: 'var(--dash-warning)' }}></div></div>
            </div>
          </div>
        </div>

      </div>

      {/* Side Section Right: Streak Counter & Progress */}
      <div className="side-section main-dashboard-right">
        
        {/* Streak Calendar Card - High Fidelity Dark Style exactly matching image */}
        <div className="dash-card streak-calendar-card">
          <div className="streak-stats-header">
            <div className="streak-stat-box">
              <span className="icon-wrap flame">🔥</span>
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

        {/* Daily / Weekly Progress */}
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
