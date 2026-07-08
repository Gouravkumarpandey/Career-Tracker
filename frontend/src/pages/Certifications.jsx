import React, { useState, useEffect } from 'react';
import { FiAward, FiPlus, FiX, FiExternalLink, FiBriefcase } from 'react-icons/fi';
import './Certifications.css';

const Certifications = () => {
  const [certs, setCerts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    issuingOrg: '',
    issueDate: '',
    expiryDate: '',
    credentialUrl: ''
  });

  useEffect(() => {
    const savedCerts = localStorage.getItem('careerTrackerCerts');
    if (savedCerts) {
      setCerts(JSON.parse(savedCerts));
    } else {
      // Mock initial data
      const mockCerts = [
        {
          id: 1,
          name: 'AWS Certified Solutions Architect - Associate',
          issuingOrg: 'Amazon Web Services',
          issueDate: '2023-05-15',
          expiryDate: '2026-05-15',
          credentialUrl: 'https://aws.amazon.com/certification/'
        },
        {
          id: 2,
          name: 'Meta Front-End Developer Professional Certificate',
          issuingOrg: 'Coursera / Meta',
          issueDate: '2022-11-10',
          expiryDate: '',
          credentialUrl: 'https://coursera.org'
        }
      ];
      setCerts(mockCerts);
      localStorage.setItem('careerTrackerCerts', JSON.stringify(mockCerts));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCert = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.issuingOrg || !formData.issueDate) return;

    const newCert = {
      id: Date.now(),
      ...formData
    };

    const updatedCerts = [newCert, ...certs];
    setCerts(updatedCerts);
    localStorage.setItem('careerTrackerCerts', JSON.stringify(updatedCerts));
    
    setFormData({ name: '', issuingOrg: '', issueDate: '', expiryDate: '', credentialUrl: '' });
    setIsModalOpen(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No Expiry';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="cert-container">
      <div className="cert-header">
        <div className="cert-title">
          <h1>Certifications & Badges</h1>
          <p>Track your professional certifications and add them to your profile.</p>
        </div>
        <button className="btn-add-cert" onClick={() => setIsModalOpen(true)}>
          <FiPlus /> Add Certificate
        </button>
      </div>

      <div className="cert-grid">
        {certs.map(cert => (
          <div key={cert.id} className="cert-card">
            <div className="cert-icon"><FiAward /></div>
            <div className="cert-name">{cert.name}</div>
            <div className="cert-org"><FiBriefcase /> {cert.issuingOrg}</div>
            
            {cert.credentialUrl && (
              <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="cert-link">
                View Credential <FiExternalLink />
              </a>
            )}
            
            <div className="cert-dates">
              <span>Issued: {formatDate(cert.issueDate)}</span>
              <span>Expires: {formatDate(cert.expiryDate)}</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Certification</h2>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}><FiX /></button>
            </div>
            
            <form onSubmit={handleAddCert}>
              <div className="form-group">
                <label>Certification Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="e.g. Certified Kubernetes Administrator"
                />
              </div>
              
              <div className="form-group">
                <label>Issuing Organization *</label>
                <input 
                  type="text" 
                  name="issuingOrg" 
                  value={formData.issuingOrg} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="e.g. Cloud Native Computing Foundation"
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
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
                  <label>Expiry Date</label>
                  <input 
                    type="date" 
                    name="expiryDate" 
                    value={formData.expiryDate} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Credential URL</label>
                <input 
                  type="url" 
                  name="credentialUrl" 
                  value={formData.credentialUrl} 
                  onChange={handleInputChange} 
                  placeholder="https://..."
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
