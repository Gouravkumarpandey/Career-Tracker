import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  FiEdit2, FiGithub, FiLinkedin, FiGlobe, FiUploadCloud, 
  FiBriefcase, FiBook, FiAward, FiPlus, FiX, FiMail, FiPhone, FiMapPin, FiCpu, FiExternalLink
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
    setEditForm({ ...profile });
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
    <div className="profile-container">
      {/* LinkedIn-style Intro Card */}
      <div className="li-intro-card">
        <div className="li-banner"></div>
        <div className="li-intro-body">
          <div className="li-avatar-wrapper">
            <span className="li-avatar-placeholder">{avatarChar}</span>
          </div>
          <div className="li-info-row">
            <div className="li-text-info">
              <h1 className="li-name">{profile.name}</h1>
              <p className="li-headline">{profile.role}</p>
              <div className="li-contact-list">
                {profile.currentAddress && <span className="li-contact-item"><FiMapPin /> {profile.currentAddress}</span>}
                <span className="li-contact-item"><FiMail /> {profile.email}</span>
                {profile.phoneNumber && <span className="li-contact-item"><FiPhone /> {profile.phoneNumber}</span>}
              </div>
              <div className="li-socials-row">
                {profile.githubUrl && <a href={profile.githubUrl} className="li-social-link" target="_blank" rel="noreferrer"><FiGithub /> GitHub</a>}
                {profile.linkedinUrl && <a href={profile.linkedinUrl} className="li-social-link" target="_blank" rel="noreferrer"><FiLinkedin /> LinkedIn</a>}
                {profile.portfolioUrl && <a href={profile.portfolioUrl} className="li-social-link" target="_blank" rel="noreferrer"><FiGlobe /> Website</a>}
              </div>
            </div>
            <div className="li-actions-col">
              <button className="li-btn-primary" onClick={handleEditClick}><FiEdit2 /> Edit Profile</button>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="li-section-card">
        <h2 className="li-section-title">About</h2>
        <p className="li-about-text">
          {profile.bio || "No biography provided yet. Add information about yourself by editing your profile."}
        </p>
      </div>

      {/* Experience Section */}
      <div className="li-section-card">
        <div className="li-section-header">
          <h2 className="li-section-title">Experience</h2>
          <button className="li-btn-add" onClick={() => setShowExpModal(true)}><FiPlus /> Add experience</button>
        </div>
        <div className="li-timeline">
          {experienceList.length === 0 ? (
            <p className="li-empty-text">No experience added yet.</p>
          ) : (
            experienceList.map(exp => (
              <div key={exp.id} className="li-timeline-item">
                <div className="li-item-icon"><FiBriefcase /></div>
                <div className="li-item-body">
                  <div className="li-item-header">
                    <h3 className="li-item-title">{exp.role}</h3>
                    <button className="li-item-delete" onClick={() => handleDeleteExp(exp.id)}>&times;</button>
                  </div>
                  <h4 className="li-item-subtitle">{exp.company} • {exp.jobType}</h4>
                  <span className="li-item-date">
                    {new Date(exp.startDate).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, {month: 'short', year: 'numeric'}) : 'Present'}
                  </span>
                  {exp.location && <p className="li-item-location"><FiMapPin /> {exp.location}</p>}
                  {exp.description && <p className="li-item-desc">{exp.description}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Education Section */}
      <div className="li-section-card">
        <div className="li-section-header">
          <h2 className="li-section-title">Education</h2>
          <button className="li-btn-add" onClick={() => setShowEduModal(true)}><FiPlus /> Add education</button>
        </div>
        <div className="li-timeline">
          {educationList.length === 0 ? (
            <p className="li-empty-text">No education added yet.</p>
          ) : (
            educationList.map(edu => (
              <div key={edu.id} className="li-timeline-item">
                <div className="li-item-icon"><FiBook /></div>
                <div className="li-item-body">
                  <div className="li-item-header">
                    <h3 className="li-item-title">{edu.institution}</h3>
                    <button className="li-item-delete" onClick={() => handleDeleteEdu(edu.id)}>&times;</button>
                  </div>
                  <h4 className="li-item-subtitle">{edu.degree} in {edu.fieldOfStudy}</h4>
                  <span className="li-item-date">
                    {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                  </span>
                  {edu.percentage && <p className="li-item-desc">Grade / CGPA: {edu.percentage}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Projects Section */}
      <div className="li-section-card">
        <div className="li-section-header">
          <h2 className="li-section-title">Projects</h2>
          <button className="li-btn-add" onClick={() => setShowProjModal(true)}><FiPlus /> Add project</button>
        </div>
        <div className="li-projects-grid">
          {projectList.length === 0 ? (
            <p className="li-empty-text">No projects added yet.</p>
          ) : (
            projectList.map(proj => (
              <div key={proj.id} className="li-project-card">
                <div className="li-project-header">
                  <h3 className="li-project-title">{proj.title}</h3>
                  <button className="li-item-delete" onClick={() => handleDeleteProj(proj.id)}>&times;</button>
                </div>
                <p className="li-project-desc">{proj.description}</p>
                {proj.techStack && (
                  <div className="li-tech-tags">
                    {proj.techStack.split(',').map((tech, idx) => (
                      <span key={idx} className="li-tag">{tech.trim()}</span>
                    ))}
                  </div>
                )}
                <div className="li-project-links">
                  {proj.githubLink && <a href={proj.githubLink} target="_blank" rel="noreferrer" className="li-link-btn"><FiGithub /> GitHub</a>}
                  {proj.liveLink && <a href={proj.liveLink} target="_blank" rel="noreferrer" className="li-link-btn"><FiExternalLink /> Live Demo</a>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Intro</h3>
              <button className="modal-close" onClick={() => setIsEditing(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSaveProfile} className="modal-form">
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={editForm.name} onChange={handleEditChange} required />
              </div>
              <div className="form-group">
                <label>Headline (Role)</label>
                <input type="text" name="role" value={editForm.role} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label>Bio (Summary)</label>
                <textarea name="bio" value={editForm.bio} onChange={handleEditChange} rows="3" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" name="phoneNumber" value={editForm.phoneNumber} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label>Address / Location</label>
                <input type="text" name="currentAddress" value={editForm.currentAddress} onChange={handleEditChange} />
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
                <textarea value={newExp.description} onChange={e => setNewExp({...newExp, description: e.target.value})} rows="3" placeholder="Describe your key achievements..." />
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
                <input type="text" value={newEdu.percentage} onChange={e => setNewEdu({...newEdu, percentage: e.target.value})} placeholder="e.g. 3.8/4.0 or 85%" />
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
