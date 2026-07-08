import React, { useState, useEffect } from 'react';
import { 
  FiEdit2, FiGithub, FiLinkedin, FiGlobe, FiUploadCloud, 
  FiBriefcase, FiBook, FiAward, FiPlus 
} from 'react-icons/fi';
import './UserProfile.css';

const UserProfile = () => {
  // Mock data for the full requested feature list
  const [user, setUser] = useState({
    name: 'John Pro',
    role: 'Senior Software Engineer',
    bio: 'Passionate software developer with 5+ years of experience building scalable web applications. I love solving complex problems and exploring new technologies.',
    avatar: null, // No avatar to show placeholder
    socials: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      portfolio: 'https://portfolio.com'
    }
  });

  const [certs, setCerts] = useState([]);

  useEffect(() => {
    const savedCerts = localStorage.getItem('careerTrackerCerts');
    if (savedCerts) {
      setCerts(JSON.parse(savedCerts));
    }
  }, []);

  return (
    <div className="profile-container">
      {/* Header Section */}
      <div className="profile-header">
        <div className="profile-header-bg"></div>
        
        <div className="profile-avatar-container">
          <div className="profile-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt="Profile" />
            ) : (
              <span className="profile-avatar-placeholder">
                {user.name.charAt(0)}
              </span>
            )}
          </div>
          <button className="profile-avatar-edit">
            <FiEdit2 size={16} />
          </button>
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-role">{user.role}</p>
          <div className="profile-socials">
            <a href={user.socials.github} className="social-link" target="_blank" rel="noreferrer"><FiGithub /></a>
            <a href={user.socials.linkedin} className="social-link" target="_blank" rel="noreferrer"><FiLinkedin /></a>
            <a href={user.socials.portfolio} className="social-link" target="_blank" rel="noreferrer"><FiGlobe /></a>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn-upload">
            <FiUploadCloud /> Upload Resume (PDF)
          </button>
          <button className="btn-upload" style={{background: 'var(--dash-primary)', color: 'white'}}>
            <FiEdit2 size={14} /> Edit Profile
          </button>
        </div>
      </div>

      <div className="profile-grid">
        {/* Main Column */}
        <div className="profile-main-col" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="profile-section">
            <div className="section-header">
              <h2 className="section-title">About Me (Bio)</h2>
              <button className="btn-icon"><FiEdit2 /></button>
            </div>
            <p style={{ color: 'var(--dash-text-muted)', lineHeight: '1.6', fontSize: '15px' }}>
              {user.bio}
            </p>
          </div>

          <div className="profile-section">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}><FiAward /> Certifications & Badges</h2>
            {certs.length === 0 ? (
              <p style={{ color: 'var(--dash-text-muted)' }}>No certifications added yet. Add them in the Certifications tab!</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                {certs.map(cert => (
                  <div key={cert.id} style={{ background: 'var(--dash-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--dash-border)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--dash-text-main)', marginBottom: '4px' }}>{cert.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--dash-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiBriefcase /> {cert.issuingOrg}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="profile-section">
            <div className="section-header">
              <h2 className="section-title">Experience</h2>
              <button className="btn-icon"><FiPlus /></button>
            </div>
            <div className="timeline-list">
              <div className="timeline-item">
                <div className="timeline-icon"><FiBriefcase /></div>
                <div className="timeline-content">
                  <h3 className="timeline-title">Senior Frontend Engineer</h3>
                  <p className="timeline-subtitle">Tech Innovators Inc. • Full-time</p>
                  <span className="timeline-date">Jan 2022 - Present</span>
                </div>
                <button className="btn-icon"><FiEdit2 size={16} /></button>
              </div>
              <div className="timeline-item">
                <div className="timeline-icon"><FiBriefcase /></div>
                <div className="timeline-content">
                  <h3 className="timeline-title">Software Developer</h3>
                  <p className="timeline-subtitle">Creative Solutions Ltd. • Full-time</p>
                  <span className="timeline-date">Aug 2019 - Dec 2021</span>
                </div>
                <button className="btn-icon"><FiEdit2 size={16} /></button>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <div className="section-header">
              <h2 className="section-title">Education Timeline</h2>
              <button className="btn-icon"><FiPlus /></button>
            </div>
            <div className="timeline-list">
              <div className="timeline-item">
                <div className="timeline-icon"><FiBook /></div>
                <div className="timeline-content">
                  <h3 className="timeline-title">M.S. Computer Science</h3>
                  <p className="timeline-subtitle">Stanford University</p>
                  <span className="timeline-date">2017 - 2019 • CGPA: 3.8/4.0</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="profile-section">
            <div className="section-header">
              <h2 className="section-title">Projects</h2>
              <button className="btn-icon"><FiPlus /></button>
            </div>
            <div className="timeline-list">
              <div className="timeline-item" style={{ border: '1px solid var(--dash-border)', padding: '16px', borderRadius: '8px' }}>
                <div className="timeline-content">
                  <h3 className="timeline-title">CareerFlow Platform</h3>
                  <p className="timeline-subtitle" style={{ margin: '8px 0', color: 'var(--dash-text-muted)' }}>
                    A comprehensive career management SaaS built with React and Node.js.
                  </p>
                  <div className="tag-list">
                    <span className="tag">React</span>
                    <span className="tag">Node.js</span>
                    <span className="tag">PostgreSQL</span>
                  </div>
                </div>
                <a href="#" className="social-link"><FiGithub /></a>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="profile-side-col" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="profile-section">
            <div className="section-header">
              <h2 className="section-title">Top Skills</h2>
              <button className="btn-icon"><FiEdit2 /></button>
            </div>
            <div className="tag-list">
              <span className="tag">React.js</span>
              <span className="tag">JavaScript (ES6+)</span>
              <span className="tag">Node.js</span>
              <span className="tag">TypeScript</span>
              <span className="tag">GraphQL</span>
              <span className="tag">CSS / Tailwind</span>
            </div>
          </div>

          <div className="profile-section">
            <div className="section-header">
              <h2 className="section-title">Certifications</h2>
              <button className="btn-icon"><FiPlus /></button>
            </div>
            <div className="timeline-list">
              <div className="timeline-item">
                <div className="timeline-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--dash-success)' }}><FiAward /></div>
                <div className="timeline-content">
                  <h3 className="timeline-title" style={{ fontSize: '14px' }}>AWS Certified Developer</h3>
                  <p className="timeline-subtitle" style={{ fontSize: '12px' }}>Amazon Web Services</p>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <div className="section-header">
              <h2 className="section-title">Languages</h2>
              <button className="btn-icon"><FiPlus /></button>
            </div>
            <div className="tag-list">
              <span className="tag">English (Native)</span>
              <span className="tag">Spanish (Conversational)</span>
            </div>
          </div>

          <div className="profile-section">
            <div className="section-header">
              <h2 className="section-title">Interests</h2>
              <button className="btn-icon"><FiEdit2 /></button>
            </div>
            <div className="tag-list">
              <span className="tag">Open Source</span>
              <span className="tag">AI/ML</span>
              <span className="tag">Bouldering</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;
