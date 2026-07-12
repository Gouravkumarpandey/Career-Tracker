import React, { useState, useEffect } from 'react';
import api from '../config/api';
import './Jobs.css';
import { FiSearch, FiMapPin, FiCompass, FiBriefcase, FiBookmark, FiPlusCircle, FiCheck, FiCalendar, FiClock, FiUser, FiLink } from 'react-icons/fi';

const Jobs = () => {
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'recommendations', 'tracker'
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Recommendations state
  const [aiRecs, setAiRecs] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

  // Tracker state
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [trackerLoading, setTrackerLoading] = useState(false);
  const [pendingJobCheck, setPendingJobCheck] = useState(null);
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);

  // Modals
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [applyNotes, setApplyNotes] = useState('');
  const [interviewForm, setInterviewForm] = useState({
    roundName: '',
    interviewDate: '',
    locationLink: '',
    interviewer: ''
  });

  useEffect(() => {
    // Initial fetch of applications and saved jobs
    fetchTrackerData();
  }, []);

  useEffect(() => {
    const handleWindowFocus = () => {
      if (pendingJobCheck) {
        // Delay slightly to give time to return to browser window smoothly
        setTimeout(() => {
          setShowFeedbackPrompt(true);
        }, 800);
      }
    };
    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [pendingJobCheck]);

  const fetchTrackerData = async () => {
    setTrackerLoading(true);
    try {
      const [appRes, savedRes] = await Promise.all([
        api.get('/api/jobs/applications'),
        api.get('/api/jobs/saved')
      ]);
      setApplications(appRes.data.data || []);
      setSavedJobs(savedRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch tracker data', err);
    } finally {
      setTrackerLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setSearchLoading(true);
    setSelectedJob(null);
    try {
      const response = await api.get('/api/jobs/search/online', {
        params: {
          q: searchQuery,
          location,
          jobType
        }
      });
      const jobs = response.data.data || [];
      setSearchResults(jobs);
    } catch (err) {
      console.error('Online job search failed', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFetchAiRecommendations = async () => {
    setAiLoading(true);
    setAiMessage('');
    try {
      const response = await api.get('/api/jobs/recommendations/ai');
      const data = response.data.data;
      if (data.message) {
        setAiMessage(data.message);
      } else {
        setAiRecs(data.recommendations || []);
      }
    } catch (err) {
      console.error('AI Recommendations failed', err);
      setAiMessage('Failed to fetch recommendations. Please verify your skills/resume are set up.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveJob = async (job) => {
    try {
      // First synchronize external job record in database
      const dbJobRes = await api.post('/api/jobs/external', {
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        salary: job.salary,
        jobType: job.jobType,
        requirements: job.requirements,
        link: job.link
      });
      const dbJob = dbJobRes.data.data;

      // Save job
      const saveRes = await api.post(`/api/jobs/${dbJob.id}/save`);
      alert(saveRes.data.message || 'Saved status toggled');
      fetchTrackerData();
    } catch (err) {
      console.error('Failed to toggle save job', err);
      alert('Error updating saved status.');
    }
  };

  const handleOpenApplyModal = (job) => {
    setSelectedJob(job);
    setApplyNotes('');
    setShowApplyModal(true);
  };

  const handleApplyJob = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;
    try {
      // Synchronize external job record in database
      const dbJobRes = await api.post('/api/jobs/external', {
        title: selectedJob.title,
        company: selectedJob.company,
        location: selectedJob.location,
        description: selectedJob.description,
        salary: selectedJob.salary,
        jobType: selectedJob.jobType,
        requirements: selectedJob.requirements,
        link: selectedJob.link
      });
      const dbJob = dbJobRes.data.data;

      // Submit application
      await api.post(`/api/jobs/${dbJob.id}/apply`, {
        notes: applyNotes
      });

      alert('Job application tracked successfully!');
      setShowApplyModal(false);
      fetchTrackerData();
    } catch (err) {
      console.error('Apply job failed', err);
      alert(err.response?.data?.message || 'Error tracking application.');
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.put(`/api/jobs/applications/${appId}/status`, {
        status: newStatus
      });
      fetchTrackerData();
    } catch (err) {
      console.error('Status change failed', err);
    }
  };

  const handleOpenInterviewModal = (appId) => {
    setSelectedAppId(appId);
    setInterviewForm({
      roundName: '',
      interviewDate: '',
      locationLink: '',
      interviewer: ''
    });
    setShowInterviewModal(true);
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!selectedAppId) return;
    try {
      await api.post(`/api/jobs/applications/${selectedAppId}/interviews`, interviewForm);
      alert('Interview scheduled successfully!');
      setShowInterviewModal(false);
      fetchTrackerData();
    } catch (err) {
      console.error('Interview schedule failed', err);
      alert('Failed to schedule interview.');
    }
  };

  const triggerSearchFromRecommendation = (queryStr) => {
    setSearchQuery(queryStr);
    setActiveTab('search');
    // Run search automatically after state updates
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  // Group applications for Kanban layout
  const columns = {
    'Applied': applications.filter(a => a.status === 'Applied'),
    'Interviewing': applications.filter(a => a.status === 'Interviewing'),
    'Offered': applications.filter(a => a.status === 'Offered'),
    'Rejected': applications.filter(a => a.status === 'Rejected')
  };

  return (
    <div className="jobs-container">
      <h1 className="page-heading">Job Tracker</h1>

      {/* Tabs */}
      <div className="jobs-tabs">
        <button 
          className={`jobs-tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Search Live Jobs
        </button>
        <button 
          className={`jobs-tab ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('recommendations');
            if (aiRecs.length === 0) handleFetchAiRecommendations();
          }}
        >
          AI Recommendations
        </button>
        <button 
          className={`jobs-tab ${activeTab === 'tracker' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('tracker');
            fetchTrackerData();
          }}
        >
          Applications Tracker ({applications.length})
        </button>
      </div>

      {/* Tab 1: Live Job Search */}
      {activeTab === 'search' && (
        <div>
          <form onSubmit={handleSearch} className="search-bar-container">
            <div className="search-input-group">
              <label>Keywords</label>
              <input 
                type="text" 
                placeholder="e.g. React Developer, Node Engineer" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="search-input-group">
              <label>Location</label>
              <input 
                type="text" 
                placeholder="e.g. Bangalore, Remote" 
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
            <button type="submit" className="search-btn">Search</button>
          </form>

          {searchLoading ? (
            <div className="empty-state">Searching live jobs... Please wait.</div>
          ) : searchResults.length === 0 ? (
            <div className="empty-state">
              <FiSearch size={40} style={{ marginBottom: '12px' }} />
              <p>Type keywords and location above to search for job openings.</p>
            </div>
          ) : (
            <div className="jobs-split-layout">
              {/* Left Column - List */}
              <div className={`jobs-list-side ${selectedJob ? 'has-selected-mobile' : ''}`}>
                {searchResults.map(job => (
                  <div 
                    key={job.id} 
                    className={`job-card ${selectedJob?.id === job.id ? 'selected' : ''}`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <h3 className="job-card-title">{job.title}</h3>
                    <div className="job-card-company">{job.company}</div>
                    <div className="job-card-meta">
                      <span className="job-tag"><FiMapPin size={12} /> {job.location}</span>
                      <span className="job-tag"><FiBriefcase size={12} /> {job.jobType}</span>
                      <span className="job-tag salary">{job.salary}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column - Detail */}
              <div className={`job-detail-side ${selectedJob ? 'active-mobile' : ''}`}>
                {selectedJob ? (
                  <>
                    <button 
                      className="job-back-btn-mobile"
                      onClick={() => setSelectedJob(null)}
                      style={{ display: 'none', marginBottom: '16px', padding: '8px 12px', background: 'var(--dash-bg)', border: '1px solid var(--dash-border)', borderRadius: '8px', color: 'var(--dash-text-main)', fontWeight: 600, cursor: 'pointer' }}
                    >
                      ← Back to Jobs List
                    </button>
                    <div className="job-detail-header">
                      <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{selectedJob.title}</h2>
                        <h3 style={{ fontSize: '1.1rem', color: '#4f46e5', margin: '4px 0 10px 0' }}>{selectedJob.company}</h3>
                        <div className="job-card-meta">
                          <span className="job-tag"><FiMapPin size={12} /> {selectedJob.location}</span>
                          <span className="job-tag"><FiBriefcase size={12} /> {selectedJob.jobType}</span>
                          <span className="job-tag salary">{selectedJob.salary}</span>
                        </div>
                      </div>
                      <div className="job-detail-actions">
                        <button 
                          className="action-btn secondary"
                          onClick={() => handleSaveJob(selectedJob)}
                        >
                          <FiBookmark /> Save
                        </button>
                        <button 
                          className="action-btn secondary"
                          onClick={() => handleOpenApplyModal(selectedJob)}
                        >
                          <FiPlusCircle /> Track Application
                        </button>
                        {selectedJob.link && (
                          <a 
                            href={selectedJob.link.startsWith('http') ? selectedJob.link : `https://${selectedJob.link}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="action-btn primary"
                            style={{ textDecoration: 'none' }}
                            onClick={() => setPendingJobCheck(selectedJob)}
                          >
                            <FiLink /> Apply on Company Site
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="job-detail-content">
                      {selectedJob.requirements && (
                        <>
                          <h4>Required Skills & Qualifications</h4>
                          <p>{selectedJob.requirements}</p>
                        </>
                      )}
                      <h4>Job Description</h4>
                      <p style={{ whiteSpace: 'pre-line' }}>{selectedJob.description}</p>
                      {selectedJob.link && (
                        <div style={{ marginTop: '20px' }}>
                          <a 
                            href={selectedJob.link.startsWith('http') ? selectedJob.link : `https://${selectedJob.link}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="ai-search-link"
                          >
                            <FiLink /> View Original Listing
                          </a>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="empty-state">Select a job from the list to view details.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: AI Recommendations */}
      {activeTab === 'recommendations' && (
        <div>
          <div className="ai-recommendation-card">
            <div className="ai-recommendation-info">
              <h2 className="ai-rec-title">AI Resume-based Matchmaking</h2>
              <p className="ai-rec-desc">
                Our AI analyzes your loaded resume and profile skills to recommend the best job roles for your career level.
              </p>
            </div>
            <button 
              className="ai-rec-btn" 
              onClick={handleFetchAiRecommendations}
              disabled={aiLoading}
            >
              {aiLoading ? 'Analyzing...' : 'Generate Matches'}
            </button>
          </div>

          {aiLoading ? (
            <div className="empty-state">Analyzing your profile skills & resume...</div>
          ) : aiMessage ? (
            <div className="empty-state">
              <FiCompass size={40} style={{ marginBottom: '12px' }} />
              <p>{aiMessage}</p>
            </div>
          ) : aiRecs.length === 0 ? (
            <div className="empty-state">
              <FiCompass size={40} style={{ marginBottom: '12px' }} />
              <p>Click "Generate Matches" above to parse your skills/resume and get role matches.</p>
            </div>
          ) : (
            <div className="ai-recommendations-list">
              {aiRecs.map((rec, idx) => (
                <div key={idx} className="ai-rec-item">
                  <div className="ai-rec-header">
                    <span className="ai-rec-role">{rec.title}</span>
                    <span className="ai-rec-score">{rec.matchScore}% Match</span>
                  </div>
                  <p className="ai-rec-reason">{rec.reasoning}</p>
                  <button 
                    className="ai-search-link"
                    onClick={() => triggerSearchFromRecommendation(rec.searchQuery)}
                  >
                    <FiSearch size={14} /> Search Live Openings
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Applications Tracker */}
      {activeTab === 'tracker' && (
        <div>
          {trackerLoading ? (
            <div className="empty-state">Loading application data...</div>
          ) : applications.length === 0 ? (
            <div className="empty-state">
              <FiBriefcase size={40} style={{ marginBottom: '12px' }} />
              <p>You aren't tracking any applications yet. Go to Search Jobs to track your submissions!</p>
            </div>
          ) : (
            <div className="tracker-board">
              {Object.keys(columns).map(colName => (
                <div key={colName} className="tracker-column">
                  <div className="tracker-column-header">
                    <span>{colName}</span>
                    <span className="tracker-badge">{columns[colName].length}</span>
                  </div>
                  
                  {columns[colName].map(app => (
                    <div key={app.id} className="tracker-card">
                      <div className="tracker-card-title">{app.job.title}</div>
                      <div className="tracker-card-company">{app.job.company}</div>
                      <div className="tracker-card-date">
                        Applied: {new Date(app.appliedAt).toLocaleDateString()}
                      </div>
                      
                      {app.interviews && app.interviews.length > 0 && (
                        <div style={{ fontSize: '0.8rem', background: '#fef3c7', padding: '6px', borderRadius: '6px', marginTop: '4px' }}>
                          <strong>Upcoming Interview:</strong>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <FiCalendar size={12} /> {new Date(app.interviews[0].interviewDate).toLocaleDateString()}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FiClock size={12} /> {new Date(app.interviews[0].interviewDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      )}

                      <div className="tracker-actions">
                        <select 
                          className="tracker-select"
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Interviewing">Interviewing</option>
                          <option value="Offered">Offered</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        <button 
                          onClick={() => handleOpenInterviewModal(app.id)}
                          style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          + Interview
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="modal-overlay">
          <form onSubmit={handleApplyJob} className="modal-content">
            <h3 className="modal-header">Track Application</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>
              Add a record for <strong>{selectedJob?.title}</strong> at <strong>{selectedJob?.company}</strong> to your tracker.
            </p>
            <div className="modal-form-group">
              <label>Application Notes (optional)</label>
              <textarea 
                rows="4"
                placeholder="e.g. Applied via referral, follow up in 2 weeks."
                value={applyNotes}
                onChange={e => setApplyNotes(e.target.value)}
              />
            </div>
            <div className="modal-buttons">
              <button type="button" className="action-btn secondary" onClick={() => setShowApplyModal(false)}>Cancel</button>
              <button type="submit" className="action-btn primary">Save & Track</button>
            </div>
          </form>
        </div>
      )}

      {/* Interview Modal */}
      {showInterviewModal && (
        <div className="modal-overlay">
          <form onSubmit={handleScheduleInterview} className="modal-content">
            <h3 className="modal-header">Schedule Interview Round</h3>
            <div className="modal-form-group">
              <label>Round Name</label>
              <input 
                type="text" 
                placeholder="e.g. Technical Round 1, System Design" 
                value={interviewForm.roundName}
                onChange={e => setInterviewForm({...interviewForm, roundName: e.target.value})}
                required
              />
            </div>
            <div className="modal-form-group">
              <label>Date and Time</label>
              <input 
                type="datetime-local" 
                value={interviewForm.interviewDate}
                onChange={e => setInterviewForm({...interviewForm, interviewDate: e.target.value})}
                required
              />
            </div>
            <div className="modal-form-group">
              <label>Location Link / Room (optional)</label>
              <input 
                type="text" 
                placeholder="e.g. https://meet.google.com/abc-def" 
                value={interviewForm.locationLink}
                onChange={e => setInterviewForm({...interviewForm, locationLink: e.target.value})}
              />
            </div>
            <div className="modal-form-group">
              <label>Interviewer Name (optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Technical Lead" 
                value={interviewForm.interviewer}
                onChange={e => setInterviewForm({...interviewForm, interviewer: e.target.value})}
              />
            </div>
            <div className="modal-buttons">
              <button type="button" className="action-btn secondary" onClick={() => setShowInterviewModal(false)}>Cancel</button>
              <button type="submit" className="action-btn primary">Schedule</button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Application Confirmation Prompt */}
      {showFeedbackPrompt && pendingJobCheck && (
        <div className="floating-prompt-card">
          <div className="floating-prompt-header">
            <h4>Application Status Check</h4>
          </div>
          <p>Did you complete your application for <strong>{pendingJobCheck.title}</strong> at <strong>{pendingJobCheck.company}</strong>?</p>
          <div className="floating-prompt-buttons">
            <button 
              className="action-btn secondary btn-sm" 
              onClick={() => {
                setPendingJobCheck(null);
                setShowFeedbackPrompt(false);
              }}
            >
              No
            </button>
            <button 
              className="action-btn primary btn-sm" 
              onClick={async () => {
                try {
                  const dbJobRes = await api.post('/api/jobs/external', {
                    title: pendingJobCheck.title,
                    company: pendingJobCheck.company,
                    location: pendingJobCheck.location,
                    description: pendingJobCheck.description,
                    salary: pendingJobCheck.salary,
                    jobType: pendingJobCheck.jobType || 'Full-time',
                    requirements: pendingJobCheck.requirements,
                    link: pendingJobCheck.link
                  });
                  const dbJob = dbJobRes.data.data;
                  await api.post(`/api/jobs/${dbJob.id}/apply`, {
                    notes: 'Applied via company listing.'
                  });
                  alert('Application tracked under "Applied" column!');
                  fetchTrackerData();
                } catch (err) {
                  console.error('Auto tracking failed:', err);
                } finally {
                  setPendingJobCheck(null);
                  setShowFeedbackPrompt(false);
                }
              }}
            >
              Yes, track it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
