import React, { useState, useEffect } from 'react';
import { 
  FiAward, FiPlus, FiX, FiExternalLink, FiBriefcase, 
  FiTrash2, FiFileText, FiClock, FiCheckCircle, FiAlertTriangle 
} from 'react-icons/fi';
import './Certifications.css';
import api from '../config/api';

const Certifications = () => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    issuingOrg: 'Coursera', // Default provider option
    customIssuingOrg: '',
    issueDate: '',
    expiryDate: '',
    credentialUrl: '',
    score: '',
    badge: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const uploadBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Fetch certifications from backend
  const fetchCertifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/certifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCerts(response.data.data.certifications || []);
    } catch (err) {
      console.error('Failed to fetch certifications:', err);
      setError('Could not load certifications from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleAddCert = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.issueDate) return;

    setError('');
    const token = localStorage.getItem('token');
    
    // Determine provider name
    const finalProvider = formData.issuingOrg === 'Others' 
      ? formData.customIssuingOrg 
      : formData.issuingOrg;

    if (!finalProvider) {
      setError('Please specify the issuing organization.');
      return;
    }

    try {
      const postData = new FormData();
      postData.append('name', formData.name);
      postData.append('issuingOrg', finalProvider);
      postData.append('issueDate', formData.issueDate);
      if (formData.expiryDate) postData.append('expiryDate', formData.expiryDate);
      if (formData.credentialUrl) postData.append('credentialUrl', formData.credentialUrl);
      if (formData.score) postData.append('score', formData.score);
      if (formData.badge) postData.append('badge', formData.badge);
      if (selectedFile) {
        postData.append('file', selectedFile);
      }

      await api.post('/api/certifications', postData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Reset form and modal
      setFormData({
        name: '',
        issuingOrg: 'Coursera',
        customIssuingOrg: '',
        issueDate: '',
        expiryDate: '',
        credentialUrl: '',
        score: '',
        badge: ''
      });
      setSelectedFile(null);
      setIsModalOpen(false);
      
      // Refresh list
      fetchCertifications();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save certification. Please try again.');
    }
  };

  const handleDeleteCert = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certification?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/certifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCertifications();
    } catch (err) {
      console.error('Delete certification failed:', err);
      setError('Could not delete certification.');
    }
  };

  // Helper to determine status alerts
  const getExpiryStatus = (expiryDateString) => {
    if (!expiryDateString) return { text: 'No Expiry', class: 'no-expiry', icon: <FiCheckCircle /> };
    
    const expiry = new Date(expiryDateString);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Expired', class: 'expired', icon: <FiAlertTriangle /> };
    } else if (diffDays <= 30) {
      return { text: `Expiring in ${diffDays} days`, class: 'expiring-soon', icon: <FiClock /> };
    }
    return { text: 'Active', class: 'active-status', icon: <FiCheckCircle /> };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric', day: 'numeric' });
  };

  return (
    <div className="cert-container">
      <div className="cert-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-heading" style={{ margin: 0 }}>Certifications</h1>
        <button className="btn-add-cert" onClick={() => setIsModalOpen(true)}>
          <FiPlus /> Add Certificate
        </button>
      </div>

      {error && <div className="cert-error-alert">{error}</div>}

      {loading ? (
        <div className="cert-loading">Loading certifications...</div>
      ) : certs.length === 0 ? (
        <div className="cert-empty-state">
          <FiAward size={48} />
          <h3>No certifications added yet</h3>
          <p>Add your professional certifications or academic credentials to keep your profile complete.</p>
        </div>
      ) : (
        <div className="cert-grid">
          {certs.map(cert => {
            const expiryStatus = getExpiryStatus(cert.expiryDate);
            return (
              <div key={cert.id} className="cert-card">
                <button 
                  className="btn-delete-cert" 
                  onClick={() => handleDeleteCert(cert.id)}
                  title="Delete certification"
                >
                  <FiTrash2 />
                </button>

                <div className={`status-tag ${expiryStatus.class}`}>
                  {expiryStatus.icon} {expiryStatus.text}
                </div>

                <div className="cert-icon"><FiAward /></div>
                
                <div className="cert-name">{cert.name}</div>
                <div className="cert-org"><FiBriefcase /> {cert.issuingOrg}</div>
                
                <div className="cert-details-grid">
                  {cert.score && (
                    <div className="detail-item">
                      <span className="detail-label">Score</span>
                      <span className="detail-value">{cert.score}</span>
                    </div>
                  )}
                  {cert.badge && (
                    <div className="detail-item">
                      <span className="detail-label">Badge</span>
                      <span className="detail-value badge-highlight">{cert.badge}</span>
                    </div>
                  )}
                </div>

                <div className="cert-actions-wrapper">
                  {cert.credentialUrl && (
                    <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="cert-action-btn primary-btn">
                      Verification Link <FiExternalLink />
                    </a>
                  )}
                  {cert.fileUrl && (
                    <a 
                      href={`${uploadBase}${cert.fileUrl}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="cert-action-btn secondary-btn"
                    >
                      View Certificate <FiFileText />
                    </a>
                  )}
                </div>
                
                <div className="cert-dates">
                  <span>Issued: {formatDate(cert.issueDate)}</span>
                  {cert.expiryDate && <span>Expires: {formatDate(cert.expiryDate)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content cert-modal-content">
            <div className="modal-header">
              <h2>Add New Certification</h2>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}><FiX /></button>
            </div>
            
            <form onSubmit={handleAddCert} className="cert-form">
              <div className="form-group">
                <label>Certification Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="e.g. Meta Front-End Developer Professional"
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Provider (Issuing Org) *</label>
                  <select 
                    name="issuingOrg" 
                    value={formData.issuingOrg} 
                    onChange={handleInputChange} 
                    className="form-select"
                  >
                    <option value="Coursera">Coursera</option>
                    <option value="NPTEL">NPTEL</option>
                    <option value="Udemy">Udemy</option>
                    <option value="edX">edX</option>
                    <option value="Microsoft">Microsoft</option>
                    <option value="Google">Google</option>
                    <option value="AWS">AWS</option>
                    <option value="Others">Others (Type below)</option>
                  </select>
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Score (e.g. 96% or 9.5 CGPA)</label>
                  <input 
                    type="text" 
                    name="score" 
                    value={formData.score} 
                    onChange={handleInputChange} 
                    placeholder="Optional"
                  />
                </div>
              </div>

              {formData.issuingOrg === 'Others' && (
                <div className="form-group animate-fade">
                  <label>Custom Issuing Organization *</label>
                  <input 
                    type="text" 
                    name="customIssuingOrg" 
                    value={formData.customIssuingOrg} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="e.g. Stanford Online"
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Badge name or Level</label>
                  <input 
                    type="text" 
                    name="badge" 
                    value={formData.badge} 
                    onChange={handleInputChange} 
                    placeholder="e.g. Gold Medalist / Intermediate"
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Upload Certificate File (PDF / Images)</label>
                  <input 
                    type="file" 
                    accept=".pdf,image/*" 
                    onChange={handleFileChange}
                    className="file-input-field"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Issue Date *</label>
                  <input 
                    type="date" 
                    name="issueDate" 
                    value={formData.issueDate} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Expiry Date (Optional)</label>
                  <input 
                    type="date" 
                    name="expiryDate" 
                    value={formData.expiryDate} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Verification Link (Credential URL)</label>
                <input 
                  type="url" 
                  name="credentialUrl" 
                  value={formData.credentialUrl} 
                  onChange={handleInputChange} 
                  placeholder="https://coursera.org/verify/..."
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Save Certification</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certifications;
