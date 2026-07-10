import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  FiEdit2, FiGithub, FiLinkedin, FiGlobe, FiUploadCloud, 
  FiBriefcase, FiBook, FiAward, FiPlus, FiX, FiCheck, FiMail, FiPhone, FiMapPin
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
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showEduModal, setShowEduModal] = useState(false);
  const [newEdu, setNewEdu] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    percentage: ''
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

  const handleAddEdu = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('/api/users/education', newEdu, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await refreshProfile();
      setShowEduModal(false);
      setNewEdu({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        percentage: ''
      });
    } catch (err) {
      console.error(err);
      alert('Failed to add education record');
    }
  };

  const handleDeleteEdu = async (eduId) => {
    if (!window.confirm('Are you sure you want to delete this education record?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/users/education/${eduId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await refreshProfile();
    } catch (err) {
      console.error(err);
      alert('Failed to delete education record');
    }
  };

  const avatarChar = profile.name ? profile.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="profile-container">
      {/* Header Section */}
      <div className="profile-header">
        <div className="profile-header-bg"></div>
        
        <div className="profile-avatar-container">
          <div className="profile-avatar">
            <span className="profile-avatar-placeholder">{avatarChar}</span>
          </div>
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{profile.name}</h1>
          <p className="profile-role">{profile.role}</p>
          <div className="profile-socials">
            {profile.githubUrl && <a href={profile.githubUrl} className="social-link" target="_blank" rel="noreferrer"><FiGithub /></a>}
            {profile.linkedinUrl && <a href={profile.linkedinUrl} className="social-link" target="_blank" rel="noreferrer"><FiLinkedin /></a>}
            {profile.portfolioUrl && <a href={profile.portfolioUrl} className="social-link" target="_blank" rel="noreferrer"><FiGlobe /></a>}
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn-upload" onClick={handleEditClick} style={{background: 'var(--dash-primary)', color: 'white'}}>
            <FiEdit2 size={14} /> Edit Profile
          </button>
        </div>
      </div>

      {/* Main Profile Grid */}
      <div className="profile-grid">
        {/* Left column */}
        <div className="profile-main-col" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Bio */}
          <div className="profile-section">
            <div className="section-header">
              <h2 className="section-title">About Me (Bio)</h2>
            </div>
            <p style={{ color: 'var(--dash-text-muted)', lineHeight: '1.6', fontSize: '15px' }}>
              {profile.bio || "No biography provided yet. Click 'Edit Profile' to add one!"}
            </p>
          </div>

          {/* Contact Details */}
          <div className="profile-section">
            <div className="section-header">
              <h2 className="section-title">Contact & Location</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--dash-text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiMail /> {profile.email}</div>
              {profile.phoneNumber && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiPhone /> {profile.phoneNumber}</div>}
              {profile.currentAddress && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiMapPin /> {profile.currentAddress}</div>}
            </div>
          </div>

          {/* Education Timeline */}
          <div className="profile-section">
            <div className="section-header">
              <h2 className="section-title">Education Timeline</h2>
              <button className="btn-icon" onClick={() => setShowEduModal(true)}><FiPlus /></button>
            </div>
            <div className="timeline-list">
              {educationList.length === 0 ? (
                <p style={{ color: 'var(--dash-text-muted)' }}>No education records added yet.</p>
              ) : (
                educationList.map(edu => (
                  <div key={edu.id} className="timeline-item">
                    <div className="timeline-icon"><FiBook /></div>
                    <div className="timeline-content">
                      <h3 className="timeline-title">{edu.degree} in {edu.fieldOfStudy}</h3>
                      <p className="timeline-subtitle">{edu.institution}</p>
                      <span className="timeline-date">
                        {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                        {edu.percentage && ` • Grade/CGPA: ${edu.percentage}`}
                      </span>
                    </div>
                    <button className="btn-icon" style={{color: '#ef4444'}} onClick={() => handleDeleteEdu(edu.id)}>&times;</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="profile-side-col" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Static sections/Placeholder info preserved for aesthetic consistency */}
          <div className="profile-section">
            <div className="section-header">
              <h2 className="section-title">Skills & Interests</h2>
            </div>
            <div className="tag-list">
              <span className="tag">React.js</span>
              <span className="tag">JavaScript</span>
              <span className="tag">Node.js</span>
              <span className="tag">TypeScript</span>
              <span className="tag">CSS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <button className="modal-close" onClick={() => setIsEditing(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSaveProfile} className="modal-form">
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={editForm.name} onChange={handleEditChange} required />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea name="bio" value={editForm.bio} onChange={handleEditChange} rows="3" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" name="phoneNumber" value={editForm.phoneNumber} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" name="currentAddress" value={editForm.currentAddress} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label>GitHub Profile Link</label>
                <input type="url" name="githubUrl" value={editForm.githubUrl} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label>LinkedIn Profile Link</label>
                <input type="url" name="linkedinUrl" value={editForm.linkedinUrl} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label>Portfolio Link</label>
                <input type="url" name="portfolioUrl" value={editForm.portfolioUrl} onChange={handleEditChange} />
              </div>
              <button type="submit" className="modal-submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Education Modal */}
      {showEduModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Education</h3>
              <button className="modal-close" onClick={() => setShowEduModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleAddEdu} className="modal-form">
              <div className="form-group">
                <label>Institution / School</label>
                <input type="text" value={newEdu.institution} onChange={e => setNewEdu({...newEdu, institution: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Degree (e.g. B.S., M.S.)</label>
                <input type="text" value={newEdu.degree} onChange={e => setNewEdu({...newEdu, degree: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Field of Study (e.g. Computer Science)</label>
                <input type="text" value={newEdu.fieldOfStudy} onChange={e => setNewEdu({...newEdu, fieldOfStudy: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" value={newEdu.startDate} onChange={e => setNewEdu({...newEdu, startDate: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>End Date (Keep empty if current)</label>
                <input type="date" value={newEdu.endDate} onChange={e => setNewEdu({...newEdu, endDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Grade / CGPA</label>
                <input type="text" value={newEdu.percentage} onChange={e => setNewEdu({...newEdu, percentage: e.target.value})} />
              </div>
              <button type="submit" className="modal-submit">Add Record</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
