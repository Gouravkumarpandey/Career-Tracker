import React, { useState } from 'react';
import { FiCpu, FiCopy, FiCheck, FiFileText, FiZap } from 'react-icons/fi';
import './ResumeBuilder.css';

const ResumeBuilder = () => {
  const [formData, setFormData] = useState({
    targetRole: '',
    experience: '',
    skills: '',
    education: ''
  });
  const [loading, setLoading] = useState(false);
  const [generatedResume, setGeneratedResume] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.targetRole || !formData.experience) {
      setError('Target Role and Experience are required fields.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/resume/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (response.ok) {
        setGeneratedResume(data.data.resumeText);
      } else {
        setError(data.message || 'Failed to generate resume.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while connecting to Grok AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedResume) return;
    navigator.clipboard.writeText(generatedResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="resume-builder-container">
      {/* Input Section */}
      <div className="rb-input-section">
        <div className="rb-header">
          <h1>AI Resume Builder</h1>
          <p>Provide your background, and Grok will generate a perfectly formatted, ATS-optimized resume.</p>
        </div>

        {error && <div style={{ color: '#ef4444', marginBottom: '16px', padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>{error}</div>}

        <div className="rb-form-group">
          <label>Target Role / Job Title *</label>
          <input 
            type="text" 
            name="targetRole"
            value={formData.targetRole}
            onChange={handleInputChange}
            className="rb-input" 
            placeholder="e.g. Senior Frontend Engineer" 
          />
        </div>

        <div className="rb-form-group">
          <label>Professional Experience *</label>
          <textarea 
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            className="rb-input rb-textarea" 
            placeholder="Paste your rough work history here. E.g. Worked at Google for 2 years, built a React dashboard..." 
          />
        </div>

        <div className="rb-form-group">
          <label>Core Skills (Optional)</label>
          <textarea 
            name="skills"
            value={formData.skills}
            onChange={handleInputChange}
            className="rb-input" 
            style={{ minHeight: '80px' }}
            placeholder="JavaScript, React, Node.js, AWS..." 
          />
        </div>

        <div className="rb-form-group">
          <label>Education (Optional)</label>
          <input 
            type="text" 
            name="education"
            value={formData.education}
            onChange={handleInputChange}
            className="rb-input" 
            placeholder="e.g. B.S. Computer Science, University of Washington" 
          />
        </div>

        <button 
          className="btn-generate-resume" 
          onClick={handleGenerate}
          disabled={loading || !formData.targetRole || !formData.experience}
        >
          {loading ? (
            <>Generating with Grok...</>
          ) : (
            <><FiZap /> Generate ATS Resume</>
          )}
        </button>
      </div>

      {/* Output Section */}
      <div className="rb-output-section">
        <div className="rb-output-header">
          <div className="rb-output-title">
            <FiFileText style={{ color: 'var(--dash-primary)' }} />
            Generated Resume
          </div>
          <button className="btn-copy" onClick={handleCopy} disabled={!generatedResume}>
            {copied ? <><FiCheck color="#10b981" /> Copied!</> : <><FiCopy /> Copy to Clipboard</>}
          </button>
        </div>
        
        <div className="rb-output-content">
          {generatedResume ? (
            <div className="rb-resume-paper">
              <textarea 
                className="rb-resume-text" 
                value={generatedResume} 
                readOnly
              />
            </div>
          ) : (
            <div className="rb-empty-state">
              <FiCpu size={48} style={{ opacity: 0.2 }} />
              <p>Your AI-generated resume will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
