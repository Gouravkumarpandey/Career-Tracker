import React, { useState, useRef } from 'react';
import { FiCheckCircle, FiCpu, FiFileText, FiActivity, FiStar, FiUpload } from 'react-icons/fi';
import './AIFeatures.css';

const AIFeatures = () => {
  const [resumeText, setResumeText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleAnalyzeText = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/resume/analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: resumeText })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResults(data.data);
      } else {
        setError(data.message || 'Failed to analyze resume text.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    setFile(selectedFile);
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const response = await fetch('/api/ai/resume/upload-analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type manually when using FormData
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        setResults(data.data);
      } else {
        setError(data.message || 'Failed to analyze uploaded resume.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during file upload analysis.');
    } finally {
      setLoading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="ai-container">
      <div className="ai-header">
        <div className="ai-title-wrap">
          <h1>AI Career Intelligence</h1>
          <p>Supercharge your job search with our Grok-powered AI tools.</p>
        </div>
        <div className="ai-grok-badge">
          <FiCpu /> Powered by Grok (xAI)
        </div>
      </div>

      <div className="ats-card">
        <h2><FiFileText /> ATS Resume Checker</h2>
        <p style={{ color: 'var(--dash-text-muted)', marginBottom: '20px' }}>
          Paste your resume text below, or upload a PDF to see how it scores against standard Applicant Tracking Systems. Grok will analyze your grammar, action verbs, metrics, and readability.
        </p>

        {error && <div style={{ color: '#ef4444', marginBottom: '16px', padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <button 
            className="btn-analyze" 
            onClick={() => fileInputRef.current.click()} 
            disabled={loading}
            style={{ background: 'var(--dash-surface)', color: 'var(--dash-text-main)', border: '1px solid var(--dash-border)' }}
          >
            <FiUpload /> Upload PDF
          </button>
          <input 
            type="file" 
            accept=".pdf" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--dash-border)' }} />
          <span style={{ color: 'var(--dash-text-muted)' }}>OR</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--dash-border)' }} />
        </div>

        <textarea 
          className="ats-textarea" 
          placeholder="Paste your resume content here..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
        ></textarea>

        <button 
          className="btn-analyze" 
          onClick={handleAnalyzeText} 
          disabled={loading || (!resumeText.trim() && !file)}
        >
          {loading ? 'Analyzing with Grok...' : <><FiActivity /> Analyze Text</>}
        </button>

        {results && (
          <div className="ats-results">
            <div className="score-grid">
              <div className="score-card overall">
                <h3>OVERALL ATS SCORE</h3>
                <div className="score-value">{results.overallScore || Math.round((results.grammarScore + results.readabilityIndex) / 2)}/100</div>
              </div>
              <div className="score-card">
                <h3>GRAMMAR & SPELLING</h3>
                <div className="score-value">{results.grammarScore}/100</div>
              </div>
              <div className="score-card">
                <h3>READABILITY</h3>
                <div className="score-value">{results.readabilityIndex}/100</div>
              </div>
              <div className="score-card">
                <h3>ACTION VERBS</h3>
                <div className="score-value" style={{ color: '#10b981' }}>{results.actionVerbsCount}</div>
              </div>
              <div className="score-card">
                <h3>QUANTIFIABLE METRICS</h3>
                <div className="score-value" style={{ color: '#8b5cf6' }}>{results.quantifiableMetricsCount}</div>
              </div>
            </div>

            {results.feedback && results.feedback.length > 0 && (
              <div className="feedback-section">
                <h3><FiStar style={{ color: '#eab308', marginRight: '8px' }}/> Grok's Recommendations</h3>
                <ul className="feedback-list">
                  {results.feedback.map((tip, index) => (
                    <li key={index}><FiCheckCircle style={{ color: 'var(--dash-primary)', marginRight: '8px', verticalAlign: 'middle' }}/> {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIFeatures;
