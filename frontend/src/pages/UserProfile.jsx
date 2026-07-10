import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  FiEdit2, FiGithub, FiLinkedin, FiGlobe, FiUploadCloud, 
  FiBriefcase, FiBook, FiAward, FiPlus, FiX, FiMail, FiPhone, FiMapPin, FiCpu, FiExternalLink, FiSend, FiMoreHorizontal
} from 'react-icons/fi';
import api from '../config/api';
import './UserProfile.css';

const UserProfile = () => {
  const { userProfile, refreshProfile } = useOutletContext();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: 'Student',
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    phoneNumber: '',
    currentAddress: '',
  });

  const [educationList, setEducationList] = useState([]);
  const [experienceList, setExperienceList] = useState([]);
  const [projectList, setProjectList] = useState([]);

  // Mocking LinkedIn Mockup Specific States
  const [pronouns, setPronouns] = useState('He/Him');
  const [connections, setConnections] = useState('500+');
  const [profileLanguage, setProfileLanguage] = useState('English');

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Modals status
  const [showEduModal, setShowEduModal] = useState(false);
  const [showExpModal, setShowExpModal] = useState(false);
  const [showProjModal, setShowProjModal] = useState(false);

  // New item forms
  const [newEdu, setNewEdu] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    percentage: ''
  });

  const [newExp, setNewExp] = useState({
    company: '',
    role: '',
    location: '',
    jobType: 'Full-time',
    startDate: '',
    endDate: '',
    description: ''
  });

  const [newProj, setNewProj] = useState({
    title: '',
    description: '',
    techStack: '',
    liveLink: '',
    githubLink: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (userProfile) {
      setProfile({
        name: userProfile.name || '',
        email: userProfile.email || '',
        role: userProfile.role || 'Student',
        bio: userProfile.profile?.bio || '',
        githubUrl: userProfile.profile?.githubUrl || '',
        linkedinUrl: userProfile.profile?.linkedinUrl || '',
        portfolioUrl: userProfile.profile?.portfolioUrl || '',
        phoneNumber: userProfile.profile?.phoneNumber || '',
        currentAddress: userProfile.profile?.currentAddress || '',
      });
      setEducationList(userProfile.education || []);
      setExperienceList(userProfile.experiences || []);
      setProjectList(userProfile.projects || []);
    }
  }, [userProfile]);

  const handleEditClick = () => {
    setEditForm({ ...profile, pronouns, connections });
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await api.put('/api/users/profile', editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (editForm.pronouns) setPronouns(editForm.pronouns);
      if (editForm.connections) setConnections(editForm.connections);
      await refreshProfile();
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Education handler
  const handleAddEdu = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('/api/users/education', newEdu, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await refreshProfile();
      setShowEduModal(false);
      setNewEdu({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', percentage: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to add education record');
    }
  };

  const handleDeleteEdu = async (id) => {
    if (!window.confirm('Delete this education record?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/users/education/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await refreshProfile();
    } catch (err) {
      console.error(err);
      alert('Failed to delete education record');
    }
  };

  // Experience handler
  const handleAddExp = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('/api/users/experience', newExp, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await refreshProfile();
      setShowExpModal(false);
      setNewExp({ company: '', role: '', location: '', jobType: 'Full-time', startDate: '', endDate: '', description: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to add experience record');
    }
  };

  const handleDeleteExp = async (id) => {
    if (!window.confirm('Delete this experience record?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/users/experience/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await refreshProfile();
    } catch (err) {
      console.error(err);
      alert('Failed to delete experience record');
    }
  };

  // Project handler
  const handleAddProj = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('/api/users/projects', newProj, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await refreshProfile();
      setShowProjModal(false);
      setNewProj({ title: '', description: '', techStack: '', liveLink: '', githubLink: '', startDate: '', endDate: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to add project');
    }
  };

  const handleDeleteProj = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/users/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await refreshProfile();
    } catch (err) {
      console.error(err);
      alert('Failed to delete project');
    }
  };

  const avatarChar = profile.name ? profile.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="lk-profile-layout">
      {/* Main Left Column */}
      <div className="lk-main-column">
        
        {/* Intro Card */}
        <div className="lk-card lk-intro-card">
          <div className="lk-banner-wrapper">
            <div className="lk-banner">
              {/* Graphic curvy background matches mockup */}
              <svg viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="lk-banner-graphic">
                <path d="M-50 150 C 150 50, 200 250, 450 100 C 600 0, 750 180, 850 50" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                <path d="M-20 180 C 180 80, 220 200, 400 80 C 580 -20, 700 150, 900 80" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
              </svg>
            </div>
            <button className="lk-banner-edit-btn" onClick={handleEditClick}>
              <FiEdit2 size={16} />
            </button>
          </div>

          <div className="lk-intro-content">
            <div className="lk-avatar-section">
              <div className="lk-avatar">
                <span className="lk-avatar-text">{avatarChar}</span>
              </div>
            </div>

            <div className="lk-intro-details">
              <div className="lk-details-left">
                <div className="lk-name-row">
                  <h1 className="lk-fullname">{profile.name}</h1>
                  {pronouns && <span className="lk-pronouns">({pronouns})</span>}
                </div>
                <p className="lk-headline-role">{profile.role}</p>
                <div className="lk-meta-location">
                  {profile.currentAddress && <span>{profile.currentAddress}</span>}
                  <span className="lk-contact-link-btn">Contact info</span>
                </div>
                <div className="lk-connections-count">{connections} connections</div>
                
                <div className="lk-actions-row">
                  <button className="lk-btn lk-btn-blue"><FiSend /> Message</button>
                  <button className="lk-btn lk-btn-outline">More</button>
                </div>
              </div>

              {/* Right Side Info (Current company/education placeholders matching LinkedIn style) */}
              <div className="lk-details-right">
                {experienceList.length > 0 && (
                  <div className="lk-detail-badge">
                    <FiBriefcase className="lk-badge-icon" />
                    <span>{experienceList[0].company}</span>
                  </div>
                )}
                {educationList.length > 0 && (
                  <div className="lk-detail-badge">
                    <FiBook className="lk-badge-icon" />
                    <span>{educationList[0].institution}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Badges Box: Open to Work & Providing Services */}
            <div className="lk-boxes-container">
              <div className="lk-badge-box">
                <div className="lk-badge-box-header">
                  <strong>Open to work</strong>
                  <button className="lk-badge-box-edit"><FiEdit2 size={12} /></button>
                </div>
                <p>{profile.role} roles</p>
                <span className="lk-box-link">Show details</span>
              </div>

              <div className="lk-badge-box lk-badge-box-light">
                <div className="lk-badge-box-header">
                  <strong>Providing Services</strong>
                  <button className="lk-badge-box-edit"><FiEdit2 size={12} /></button>
                </div>
                <p>Software Development, Technical Consulting...</p>
                <span className="lk-box-link">Show details</span>
              </div>
            </div>
          </div>
        </div>

        {/* About Card */}
        <div className="lk-card">
          <div className="lk-card-header-row">
            <h2 className="lk-card-title">About</h2>
            <button className="lk-card-edit-btn" onClick={handleEditClick}><FiEdit2 /></button>
          </div>
          <p className="lk-about-text-content">
            {profile.bio || "No summary provided yet. Click the edit icon to add your bio summary."}
          </p>
        </div>

        {/* Experience Card */}
        <div className="lk-card">
          <div className="lk-card-header-row">
            <h2 className="lk-card-title">Experience</h2>
            <div className="lk-header-actions">
              <button className="lk-card-add-btn" onClick={() => setShowExpModal(true)}><FiPlus /> Add</button>
            </div>
          </div>
          <div className="lk-items-list">
            {experienceList.length === 0 ? (
              <p className="lk-empty-text">No experience listed yet.</p>
            ) : (
              experienceList.map(exp => (
                <div key={exp.id} className="lk-item-row">
                  <div className="lk-item-logo-box"><FiBriefcase /></div>
                  <div className="lk-item-info">
                    <div className="lk-item-title-row">
                      <h3 className="lk-item-title">{exp.role}</h3>
                      <button className="lk-item-delete-btn" onClick={() => handleDeleteExp(exp.id)}>&times;</button>
                    </div>
                    <span className="lk-item-subtitle">{exp.company} • {exp.jobType}</span>
                    <span className="lk-item-dates">
                      {new Date(exp.startDate).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, {month: 'short', year: 'numeric'}) : 'Present'}
                    </span>
                    {exp.location && <span className="lk-item-location-text"><FiMapPin /> {exp.location}</span>}
                    {exp.description && <p className="lk-item-desc-text">{exp.description}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Education Card */}
        <div className="lk-card">
          <div className="lk-card-header-row">
            <h2 className="lk-card-title">Education</h2>
            <div className="lk-header-actions">
              <button className="lk-card-add-btn" onClick={() => setShowEduModal(true)}><FiPlus /> Add</button>
            </div>
          </div>
          <div className="lk-items-list">
            {educationList.length === 0 ? (
              <p className="lk-empty-text">No education listed yet.</p>
            ) : (
              educationList.map(edu => (
                <div key={edu.id} className="lk-item-row">
                  <div className="lk-item-logo-box"><FiBook /></div>
                  <div className="lk-item-info">
                    <div className="lk-item-title-row">
                      <h3 className="lk-item-title">{edu.institution}</h3>
                      <button className="lk-item-delete-btn" onClick={() => handleDeleteEdu(edu.id)}>&times;</button>
                    </div>
                    <span className="lk-item-subtitle">{edu.degree} in {edu.fieldOfStudy}</span>
                    <span className="lk-item-dates">
                      {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                    </span>
                    {edu.percentage && <span className="lk-item-location-text">Grade/CGPA: {edu.percentage}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Projects Card */}
        <div className="lk-card">
          <div className="lk-card-header-row">
            <h2 className="lk-card-title">Featured Projects</h2>
            <button className="lk-card-add-btn" onClick={() => setShowProjModal(true)}><FiPlus /> Add</button>
          </div>
          <div className="lk-projects-container">
            {projectList.length === 0 ? (
              <p className="lk-empty-text">No projects listed yet.</p>
            ) : (
              projectList.map(proj => (
                <div key={proj.id} className="lk-project-card-item">
                  <div className="lk-project-card-header">
                    <h4>{proj.title}</h4>
                    <button className="lk-item-delete-btn" onClick={() => handleDeleteProj(proj.id)}>&times;</button>
                  </div>
                  <p>{proj.description}</p>
                  {proj.techStack && (
                    <div className="lk-tech-tags-list">
                      {proj.techStack.split(',').map((tech, idx) => (
                        <span key={idx} className="lk-tech-tag">{tech.trim()}</span>
                      ))}
                    </div>
                  )}
                  <div className="lk-proj-links-row">
                    {proj.githubLink && <a href={proj.githubLink} target="_blank" rel="noreferrer"><FiGithub /> Code</a>}
                    {proj.liveLink && <a href={proj.liveLink} target="_blank" rel="noreferrer"><FiExternalLink /> Live</a>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Right Column (Widgets matching mockup) */}
      <div className="lk-right-column">
        
        {/* Profile Language Widget */}
        <div className="lk-card lk-widget-card">
          <div className="lk-widget-header">
            <h3>Profile language</h3>
            <button className="lk-widget-edit"><FiEdit2 size={14} /></button>
          </div>
          <div className="lk-lang-buttons">
            <button 
              className={`lk-lang-btn ${profileLanguage === 'English' ? 'active' : ''}`}
              onClick={() => setProfileLanguage('English')}
            >
              English
            </button>
            <button 
              className={`lk-lang-btn ${profileLanguage === 'Español' ? 'active' : ''}`}
              onClick={() => setProfileLanguage('Español')}
            >
              Español
            </button>
          </div>
        </div>

        {/* Public Profile & URL Widget */}
        <div className="lk-card lk-widget-card">
          <div className="lk-widget-header">
            <h3>Public profile & URL</h3>
            <button className="lk-widget-edit"><FiEdit2 size={14} /></button>
          </div>
          <p className="lk-widget-url">
            www.linkedin.com/in/{profile.name.toLowerCase().replace(/\s+/g, '-')}
          </p>
        </div>

      </div>

      {/* Edit Intro Form Modal */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit intro</h3>
              <button className="modal-close" onClick={() => setIsEditing(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSaveProfile} className="modal-form">
              <div className="form-group">
                <label>Name *</label>
                <input type="text" name="name" value={editForm.name} onChange={handleEditChange} required />
              </div>
              <div className="form-group">
                <label>Pronouns</label>
                <input type="text" name="pronouns" value={editForm.pronouns} onChange={handleEditChange} placeholder="e.g. He/Him, They/Them" />
              </div>
              <div className="form-group">
                <label>Headline (Role) *</label>
                <input type="text" name="role" value={editForm.role} onChange={handleEditChange} required />
              </div>
              <div className="form-group">
                <label>Bio (Summary)</label>
                <textarea name="bio" value={editForm.bio} onChange={handleEditChange} rows="3" />
              </div>
              <div className="form-group">
                <label>Address / Location</label>
                <input type="text" name="currentAddress" value={editForm.currentAddress} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" name="phoneNumber" value={editForm.phoneNumber} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label>Connections Count</label>
                <input type="text" name="connections" value={editForm.connections} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label>GitHub Link</label>
                <input type="url" name="githubUrl" value={editForm.githubUrl} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label>LinkedIn Link</label>
                <input type="url" name="linkedinUrl" value={editForm.linkedinUrl} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label>Portfolio / Website Link</label>
                <input type="url" name="portfolioUrl" value={editForm.portfolioUrl} onChange={handleEditChange} />
              </div>
              <button type="submit" className="modal-submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Experience Modal */}
      {showExpModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Experience</h3>
              <button className="modal-close" onClick={() => setShowExpModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleAddExp} className="modal-form">
              <div className="form-group">
                <label>Role *</label>
                <input type="text" value={newExp.role} onChange={e => setNewExp({...newExp, role: e.target.value})} required placeholder="e.g. Senior Frontend Engineer" />
              </div>
              <div className="form-group">
                <label>Company *</label>
                <input type="text" value={newExp.company} onChange={e => setNewExp({...newExp, company: e.target.value})} required placeholder="e.g. Google" />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" value={newExp.location} onChange={e => setNewExp({...newExp, location: e.target.value})} placeholder="e.g. San Francisco, CA" />
              </div>
              <div className="form-group">
                <label>Job Type</label>
                <select value={newExp.jobType} onChange={e => setNewExp({...newExp, jobType: e.target.value})}>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div className="form-group">
                <label>Start Date *</label>
                <input type="date" value={newExp.startDate} onChange={e => setNewExp({...newExp, startDate: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>End Date (leave empty if current)</label>
                <input type="date" value={newExp.endDate} onChange={e => setNewExp({...newExp, endDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={newExp.description} onChange={e => setNewExp({...newExp, description: e.target.value})} rows="3" placeholder="Describe your achievements..." />
              </div>
              <button type="submit" className="modal-submit">Save Experience</button>
            </form>
          </div>
        </div>
      )}

      {/* Education Modal */}
      {showEduModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Education</h3>
              <button className="modal-close" onClick={() => setShowEduModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleAddEdu} className="modal-form">
              <div className="form-group">
                <label>School/Institution *</label>
                <input type="text" value={newEdu.institution} onChange={e => setNewEdu({...newEdu, institution: e.target.value})} required placeholder="e.g. Stanford University" />
              </div>
              <div className="form-group">
                <label>Degree *</label>
                <input type="text" value={newEdu.degree} onChange={e => setNewEdu({...newEdu, degree: e.target.value})} required placeholder="e.g. Master of Science" />
              </div>
              <div className="form-group">
                <label>Field of Study *</label>
                <input type="text" value={newEdu.fieldOfStudy} onChange={e => setNewEdu({...newEdu, fieldOfStudy: e.target.value})} required placeholder="e.g. Computer Science" />
              </div>
              <div className="form-group">
                <label>Start Date *</label>
                <input type="date" value={newEdu.startDate} onChange={e => setNewEdu({...newEdu, startDate: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>End Date (leave empty if current)</label>
                <input type="date" value={newEdu.endDate} onChange={e => setNewEdu({...newEdu, endDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Grade / CGPA</label>
                <input type="text" value={newEdu.percentage} onChange={e => setNewEdu({...newEdu, percentage: e.target.value})} placeholder="e.g. 3.8/4.0" />
              </div>
              <button type="submit" className="modal-submit">Save Education</button>
            </form>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {showProjModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Project</h3>
              <button className="modal-close" onClick={() => setShowProjModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleAddProj} className="modal-form">
              <div className="form-group">
                <label>Project Title *</label>
                <input type="text" value={newProj.title} onChange={e => setNewProj({...newProj, title: e.target.value})} required placeholder="e.g. CareerFlow SaaS Platform" />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea value={newProj.description} onChange={e => setNewProj({...newProj, description: e.target.value})} rows="3" required placeholder="What did this project solve..." />
              </div>
              <div className="form-group">
                <label>Tech Stack (comma-separated)</label>
                <input type="text" value={newProj.techStack} onChange={e => setNewProj({...newProj, techStack: e.target.value})} placeholder="e.g. React, Node.js, PostgreSQL" />
              </div>
              <div className="form-group">
                <label>GitHub Repository Link</label>
                <input type="url" value={newProj.githubLink} onChange={e => setNewProj({...newProj, githubLink: e.target.value})} placeholder="https://github.com/..." />
              </div>
              <div className="form-group">
                <label>Live URL (Demo)</label>
                <input type="url" value={newProj.liveLink} onChange={e => setNewProj({...newProj, liveLink: e.target.value})} placeholder="https://..." />
              </div>
              <button type="submit" className="modal-submit">Save Project</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
