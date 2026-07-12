import React, { useState, useEffect } from 'react';
import api from '../config/api';
import './Internships.css';
import { FiSearch, FiMapPin, FiCompass, FiBriefcase, FiBookmark, FiPlusCircle, FiCheck, FiCalendar, FiClock, FiLink, FiHeart } from 'react-icons/fi';

const Internships = () => {
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'liked', 'tracker'
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Tracker and Liked state
  const [applications, setApplications] = useState([]);
  const [likedInternships, setLikedInternships] = useState([]);
  const [trackerLoading, setTrackerLoading] = useState(false);

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

  const [pendingJobCheck, setPendingJobCheck] = useState(null);
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);

  useEffect(() => {
    // Initial fetch of data
    fetchTrackerData();
    // Default search for internships on load
    handleSearch(null, 'internship');
  }, []);

  useEffect(() => {
    const handleWindowFocus = () => {
      if (pendingJobCheck) {
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
      
      // Filter local database objects for 'internship' types
      const allApps = appRes.data.data || [];
      const allSaved = savedRes.data.data || [];

      const internshipApps = allApps.filter(app => 
        app.job.jobType?.toLowerCase().includes('internship') || 
        app.job.title?.toLowerCase().includes('intern')
      );

      const savedInternships = allSaved.filter(save => 
        save.job.jobType?.toLowerCase().includes('internship') || 
        save.job.title?.toLowerCase().includes('intern')
      );

      setApplications(internshipApps);
      setLikedInternships(savedInternships);
    } catch (err) {
      console.error('Failed to fetch internship tracker data', err);
    } finally {
      setTrackerLoading(false);
    }
  };

  const handleSearch = async (e, defaultTerm) => {
    if (e) e.preventDefault();
    setSearchLoading(true);
    setSelectedInternship(null);

    const term = defaultTerm || searchQuery || 'Internship';
    try {
      const response = await api.get('/api/jobs/search/online', {
        params: {
          q: term.toLowerCase().includes('intern') ? term : `${term} Internship`,
          location,
          jobType: 'internship'
        }
      });
      let jobs = response.data.data || [];
      
      // Strict matching for specific query keywords if user actively searched
      if (searchQuery) {
        const queryWords = searchQuery.toLowerCase().split(/\s+/).filter(word => word.length > 1 && word !== 'internship' && word !== 'intern');
        if (queryWords.length > 0) {
          jobs = jobs.filter(job => 
            queryWords.some(word => 
              job.title.toLowerCase().includes(word) || 
              job.description.toLowerCase().includes(word)
            )
          );
        }
      } else {
        // Normal list logic: Ensure they are internships if query is empty (default load)
        jobs = jobs.filter(job => 
          job.title.toLowerCase().includes('intern') || 
          job.jobType.toLowerCase().includes('intern') || 
          job.description.toLowerCase().includes('intern')
        );
      }

      setSearchResults(jobs);
      if (jobs.length > 0) {
        setSelectedInternship(jobs[0]);
      }
    } catch (err) {
      console.error('Online internship search failed', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleLikeInternship = async (internship) => {
    try {
      // First synchronize external job record in database
      const dbJobRes = await api.post('/api/jobs/external', {
        title: internship.title,
        company: internship.company,
        location: internship.location,
        description: internship.description,
        salary: internship.salary,
        jobType: 'internship',
        requirements: internship.requirements,
        link: internship.link
      });
      const dbJob = dbJobRes.data.data;

      // Save/like job
      const saveRes = await api.post(`/api/jobs/${dbJob.id}/save`);
      alert(saveRes.data.message || 'Liked status updated');
      fetchTrackerData();
    } catch (err) {
      console.error('Failed to like internship', err);
      alert('Error updating like status.');
    }
  };

  const handleOpenApplyModal = (internship) => {
    setSelectedInternship(internship);
    setApplyNotes('');
    setShowApplyModal(true);
  };

  const handleApplyInternship = async (e) => {
    e.preventDefault();
    if (!selectedInternship) return;
    try {
      // Synchronize external job record in database
      const dbJobRes = await api.post('/api/jobs/external', {
        title: selectedInternship.title,
        company: selectedInternship.company,
        location: selectedInternship.location,
        description: selectedInternship.description,
        salary: selectedInternship.salary,
        jobType: 'internship',
        requirements: selectedInternship.requirements,
        link: selectedInternship.link
      });
      const dbJob = dbJobRes.data.data;

      // Submit application
      await api.post(`/api/jobs/${dbJob.id}/apply`, {
        notes: applyNotes
      });

      alert('Internship application tracked successfully!');
      setShowApplyModal(false);
      fetchTrackerData();
    } catch (err) {
      console.error('Apply internship failed', err);
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

  // Group applications for Kanban layout
  const columns = {
    'Applied': applications.filter(a => a.status === 'Applied'),
    'Interviewing': applications.filter(a => a.status === 'Interviewing'),
    'Offered': applications.filter(a => a.status === 'Offered'),
    'Rejected': applications.filter(a => a.status === 'Rejected')
  };

  const isLiked = (internshipId) => {
    return likedInternships.some(save => save.job.link === selectedInternship?.link);
  };

  return (
    <div className="internships-container">
      <h1 className="page-heading">Internships</h1>

      {/* Tabs */}
      <div className="internships-tabs">
        <button 
          className={`internships-tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Find Internships
        </button>
        <button 
          className={`internships-tab ${activeTab === 'liked' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('liked');
            fetchTrackerData();
          }}
        >
          Liked Internships ({likedInternships.length})
        </button>
        <button 
          className={`internships-tab ${activeTab === 'tracker' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('tracker');
            fetchTrackerData();
          }}
        >
          My Tracker ({applications.length})
        </button>
      </div>

      {/* Tab 1: Find Internships */}
      {activeTab === 'search' && (
        <div>
          <form onSubmit={(e) => handleSearch(e)} className="internship-search-container">
            <div className="internship-input-group">
              <label>Role / Keywords</label>
              <input 
                type="text" 
                placeholder="e.g. React Developer, UI Design" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="internship-input-group">
              <label>Location</label>
              <input 
                type="text" 
                placeholder="e.g. Bangalore, Remote" 
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
            <button type="submit" className="internship-search-btn">Search Internships</button>
          </form>

          {searchLoading ? (
            <div className="empty-state">Searching live internships... Please wait.</div>
          ) : searchResults.length === 0 ? (
            <div className="empty-state">
              <FiSearch size={40} style={{ marginBottom: '12px' }} />
              <p>Type keywords and location above to search for internship openings.</p>
            </div>
          ) : (
            <div className="internships-split-layout">
              {/* Left Column - List */}
              <div className="internships-list-side">
                {searchResults.map(internship => (
                  <div 
                    key={internship.id} 
                    className={`internship-card ${selectedInternship?.id === internship.id ? 'selected' : ''}`}
                    onClick={() => setSelectedInternship(internship)}
                  >
                    <h3 className="internship-card-title">{internship.title}</h3>
                    <div className="internship-card-company">{internship.company}</div>
                    <div className="internship-card-meta">
                      <span className="internship-tag"><FiMapPin size={12} /> {internship.location}</span>
                      <span className="internship-tag salary">{internship.salary}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column - Detail */}
              <div className="internship-detail-side">
                {selectedInternship ? (
                  <>
                    <div className="internship-detail-header">
                      <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{selectedInternship.title}</h2>
                        <h3 style={{ fontSize: '1.1rem', color: '#3b82f6', margin: '4px 0 10px 0' }}>{selectedInternship.company}</h3>
                        <div className="internship-card-meta">
                          <span className="internship-tag"><FiMapPin size={12} /> {selectedInternship.location}</span>
                          <span className="internship-tag salary">{selectedInternship.salary}</span>
                        </div>
                      </div>
                      <div className="internship-detail-actions">
                        <button 
                          className="internship-action-btn secondary"
                          onClick={() => handleLikeInternship(selectedInternship)}
                          style={{ color: isLiked() ? '#ef4444' : '#4b5563' }}
                        >
                          <FiHeart style={{ fill: isLiked() ? '#ef4444' : 'none' }} /> Like
                        </button>
                        <button 
                          className="internship-action-btn secondary"
                          onClick={() => handleOpenApplyModal(selectedInternship)}
                        >
                          <FiPlusCircle /> Track Submission
                        </button>
                        {selectedInternship.link && (
                          <a 
                            href={selectedInternship.link.startsWith('http') ? selectedInternship.link : `https://${selectedInternship.link}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="internship-action-btn primary"
                            style={{ textDecoration: 'none' }}
                            onClick={() => setPendingJobCheck(selectedInternship)}
                          >
                            <FiLink /> Apply on Company Site
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="internship-detail-content">
                      {selectedInternship.requirements && (
                        <>
                          <h4>Required Skills & Qualifications</h4>
                          <p>{selectedInternship.requirements}</p>
                        </>
                      )}
                      <h4>Internship Description</h4>
                      <p style={{ whiteSpace: 'pre-line' }}>{selectedInternship.description}</p>
                    </div>
                  </>
                ) : (
                  <div className="empty-state">Select an internship from the list to view details.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Liked Internships */}
      {activeTab === 'liked' && (
        <div>
          {likedInternships.length === 0 ? (
            <div className="empty-state">
              <FiBookmark size={40} style={{ marginBottom: '12px' }} />
              <p>You haven't liked any internships yet. Hit Like on listings under "Find Internships" to save them here!</p>
            </div>
          ) : (
            <div className="liked-internships-grid">
              {likedInternships.map(save => (
                <div key={save.id} className="liked-internship-item">
                  <div className="liked-internship-header">
                    <span className="liked-internship-role">{save.job.title}</span>
                    <span className="liked-internship-company">{save.job.company}</span>
                  </div>
                  <div className="internship-card-meta">
                    <span className="internship-tag"><FiMapPin size={12} /> {save.job.location}</span>
                    <span className="internship-tag salary">{save.job.salary}</span>
                  </div>
                  <div className="liked-internship-actions">
                    <button 
                      className="internship-action-btn secondary"
                      onClick={() => handleLikeInternship(save.job)}
                      style={{ color: '#ef4444' }}
                    >
                      <FiHeart style={{ fill: '#ef4444' }} /> Unlike
                    </button>
                    {save.job.link && (
                      <a 
                        href={save.job.link.startsWith('http') ? save.job.link : `https://${save.job.link}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="internship-action-btn primary"
                        style={{ textDecoration: 'none' }}
                      >
                        <FiLink /> Apply
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Applications Tracker */}
      {activeTab === 'tracker' && (
        <div>
          {applications.length === 0 ? (
            <div className="empty-state">
              <FiBriefcase size={40} style={{ marginBottom: '12px' }} />
              <p>You aren't tracking any internship applications. Go to Find Internships to track submissions!</p>
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
                        Submitted: {new Date(app.appliedAt).toLocaleDateString()}
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
                          style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
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
          <form onSubmit={handleApplyInternship} className="modal-content">
            <h3 className="modal-header">Track Submission</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>
              Add a record for <strong>{selectedInternship?.title}</strong> at <strong>{selectedInternship?.company}</strong> to your tracker.
            </p>
            <div className="modal-form-group">
              <label>Application Notes (optional)</label>
              <textarea 
                rows="4"
                placeholder="e.g. Applied via Remotive portal."
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
                placeholder="e.g. Initial Chat, Code Pairing" 
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
                placeholder="e.g. Recruiter, Mentor" 
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

      {/* Floating Internship Application Confirmation Prompt */}
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
                    jobType: 'internship',
                    requirements: pendingJobCheck.requirements,
                    link: pendingJobCheck.link
                  });
                  const dbJob = dbJobRes.data.data;
                  await api.post(`/api/jobs/${dbJob.id}/apply`, {
                    notes: 'Applied via company listing.'
                  });
                  alert('Internship tracked under "Applied" column!');
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

export default Internships;
