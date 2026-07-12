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
    <div className="profile-dashboard-layout">
      {/* 1. Header Hero Card */}
      <div className="profile-hero-card">
        <div className="profile-hero-banner">
          <div className="banner-gradient-overlay" />
          <button className="profile-edit-trigger" onClick={handleEditClick} title="Edit Profile Details">
            <FiEdit2 /> Edit Profile
          </button>
        </div>
        
        <div className="profile-hero-info">
          <div className="hero-avatar-wrapper">
            <div className="hero-avatar-circle">{avatarChar}</div>
          </div>
          
          <div className="hero-details-row">
            <div className="hero-details-left">
              <h1 className="hero-name">{profile.name}</h1>
              <p className="hero-role-title">{profile.role}</p>
              <p className="hero-bio">{profile.bio || "No summary provided yet."}</p>
              
              <div className="hero-contact-grid">
                {profile.email && (
                  <span className="contact-item">
                    <FiMail /> {profile.email}
                  </span>
                )}
                {profile.phoneNumber && (
                  <span className="contact-item">
                    <FiPhone /> {profile.phoneNumber}
                  </span>
                )}
                {profile.currentAddress && (
                  <span className="contact-item">
                    <FiMapPin /> {profile.currentAddress}
                  </span>
                )}
              </div>
            </div>
            
            <div className="hero-details-right">
              <div className="social-links-container">
                {profile.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="social-link-btn github" title="GitHub Profile">
                    <FiGithub /> GitHub
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="social-link-btn linkedin" title="LinkedIn Profile">
                    <FiLinkedin /> LinkedIn
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="social-link-btn portfolio" title="Personal Portfolio">
                    <FiGlobe /> Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grid Sections (Experience, Education on Left; Projects on Right) */}
      <div className="profile-sections-grid">
        <div className="sections-left-col">
          {/* Experience Section */}
          <div className="profile-section-card">
            <div className="section-card-header">
              <h2 className="section-title"><FiBriefcase /> Work Experience</h2>
              <button className="btn-add-item" onClick={() => setShowExpModal(true)}>
                <FiPlus /> Add
              </button>
            </div>
            
            <div className="experience-timeline">
              {experienceList.length === 0 ? (
                <p className="empty-text-message">No work experience listed yet.</p>
              ) : (
                experienceList.map(exp => (
                  <div key={exp.id} className="timeline-item">
                    <div className="timeline-icon-box"><FiBriefcase /></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <h3 className="item-role">{exp.role}</h3>
                        <button className="item-delete-trigger" onClick={() => handleDeleteExp(exp.id)} title="Delete Experience">
                          &times;
                        </button>
                      </div>
                      <span className="item-company">{exp.company} <span className="item-type-badge">{exp.jobType}</span></span>
                      <span className="item-dates-span">
                        {new Date(exp.startDate).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, {month: 'short', year: 'numeric'}) : 'Present'}
                      </span>
                      {exp.location && <span className="item-location"><FiMapPin /> {exp.location}</span>}
                      {exp.description && <p className="item-description-p">{exp.description}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Education Section */}
          <div className="profile-section-card">
            <div className="section-card-header">
              <h2 className="section-title"><FiBook /> Education</h2>
              <button className="btn-add-item" onClick={() => setShowEduModal(true)}>
                <FiPlus /> Add
              </button>
            </div>
            
            <div className="education-timeline">
              {educationList.length === 0 ? (
                <p className="empty-text-message">No education details listed yet.</p>
              ) : (
                educationList.map(edu => (
                  <div key={edu.id} className="timeline-item">
                    <div className="timeline-icon-box"><FiBook /></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <h3 className="item-institution">{edu.institution}</h3>
                        <button className="item-delete-trigger" onClick={() => handleDeleteEdu(edu.id)} title="Delete Education">
                          &times;
                        </button>
                      </div>
                      <span className="item-degree">{edu.degree} in {edu.fieldOfStudy}</span>
                      <span className="item-dates-span">
                        {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                      </span>
                      {edu.percentage && <span className="item-grade">Grade / CGPA: <strong>{edu.percentage}</strong></span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="sections-right-col">
          {/* Projects Section */}
          <div className="profile-section-card">
            <div className="section-card-header">
              <h2 className="section-title"><FiCpu /> Projects</h2>
              <button className="btn-add-item" onClick={() => setShowProjModal(true)}>
                <FiPlus /> Add Project
              </button>
            </div>
            
            <div className="projects-vertical-list">
              {projectList.length === 0 ? (
                <p className="empty-text-message">No projects added yet.</p>
              ) : (
                projectList.map(proj => (
                  <div key={proj.id} className="project-detail-card">
                    <div className="project-card-header-row">
                      <h3 className="project-card-title">{proj.title}</h3>
                      <button className="item-delete-trigger" onClick={() => handleDeleteProj(proj.id)} title="Delete Project">
                        &times;
                      </button>
                    </div>
                    
                    <p className="project-card-desc">{proj.description}</p>
                    
                    {proj.techStack && (
                      <div className="project-tech-tags">
                        {proj.techStack.split(',').map((tech, idx) => (
                          <span key={idx} className="tech-badge">{tech.trim()}</span>
                        ))}
                      </div>
                    )}
                    
                    <div className="project-card-links">
                      {proj.githubLink && (
                        <a href={proj.githubLink} target="_blank" rel="noreferrer" className="proj-link github">
                          <FiGithub /> Code
                        </a>
                      )}
                      {proj.liveLink && (
                        <a href={proj.liveLink} target="_blank" rel="noreferrer" className="proj-link live">
                          <FiExternalLink /> Live
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
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
