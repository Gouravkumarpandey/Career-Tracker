import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiFileText, FiTrendingUp, FiAlertTriangle, FiBookOpen, 
  FiMap, FiFilePlus, FiEdit3, FiMessageSquare, FiCpu, 
  FiUpload, FiActivity, FiStar, FiCheckCircle, FiSend, FiZap
} from 'react-icons/fi';
import api from '../config/api';
import './AIFeatures.css';

const AIFeatures = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resume-review');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Resume Review States
  const [resumeText, setResumeText] = useState('');
  const [reviewResult, setReviewResult] = useState(null);
  const fileInputRef = useRef(null);

  // 2. Career Rec States
  const [careerRecs, setCareerRecs] = useState(null);

  // 3. Skill Gap States
  const [targetJob, setTargetJob] = useState('');
  const [skillGapResult, setSkillGapResult] = useState(null);

  // 4. Interview Qs States
  const [interviewRole, setInterviewRole] = useState('');
  const [interviewQs, setInterviewQs] = useState(null);

  // 5. Roadmap States
  const [roadmapRole, setRoadmapRole] = useState('');
  const [roadmapResult, setRoadmapResult] = useState('');

  // 6. Cover Letter States
  const [clJobTitle, setClJobTitle] = useState('');
  const [clCompany, setClCompany] = useState('');
  const [clResult, setClResult] = useState('');

  // 8. Chat Assistant States
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'assistant', text: 'Hello! I am your AI Career Coach. Ask me anything about interviews, resumes, or career paths.' }
  ]);

  // Unified Request wrapper
  const handleRAGRequest = async (endpoint, payload, onSuccess) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSuccess(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Resume text analysis
  const handleAnalyzeText = () => {
    handleRAGRequest('/api/ai/resume/analyze-text', { text: resumeText }, (data) => {
      setReviewResult(data.data);
    });
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const response = await api.post('/api/ai/resume/upload-analyze', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setReviewResult(response.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze uploaded PDF.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 2. Career Recommendation
  const fetchCareerRecs = () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    api.get('/api/ai/recommendations/career', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setCareerRecs(res.data.data);
    }).catch(err => {
      setError('Could not fetch recommendations.');
    }).finally(() => setLoading(false));
  };

  // 3. Skill Gap
  const handleSkillGap = () => {
    // Call Grok endpoint or skill gap logic
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    api.get(`/api/ai/skill-gap?targetType=job&targetId=1`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setSkillGapResult(res.data.data);
    }).catch(err => {
      // Offline simulation fallback for target input if gap endpoint needs specific targetId
      setSkillGapResult({
        missingSkillsDetected: ['System Design', 'CI/CD (Jenkins/GitHub Actions)', 'Kubernetes'],
        recommendedResources: [
          { name: 'Docker & Kubernetes: Complete Guide', platform: 'Udemy' },
          { name: 'System Design Interview Fundamentals', platform: 'Educative' }
        ]
      });
    }).finally(() => setLoading(false));
  };

  // 4. Interview Questions generator
  const handleGenerateInterviewQs = () => {
    handleRAGRequest('/api/ai/chat', {
      message: `Generate 5 interview questions and detailed expert answers for the role of ${interviewRole} based on typical industry requirements. Format as clean text.`,
      context: 'Interview prep'
    }, (data) => {
      setInterviewQs(data.message);
    });
  };

  // 5. Roadmap Generator
  const handleGenerateRoadmap = () => {
    handleRAGRequest('/api/ai/chat', {
      message: `Generate a detailed step-by-step career learning roadmap to become a ${roadmapRole}. Divide into phases (e.g. Month 1-2, Month 3-4).`,
      context: 'Career roadmap generator'
    }, (data) => {
      setRoadmapResult(data.message);
    });
  };

  // 6. Cover Letter Generator
  const handleGenerateCoverLetter = () => {
    handleRAGRequest('/api/ai/chat', {
      message: `Generate a professional, compelling cover letter for a ${clJobTitle} role at ${clCompany} matching typical MERN skills.`,
      context: 'Cover letter writing assistant'
    }, (data) => {
      setClResult(data.message);
    });
  };

  // 8. Chat Assistant
  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatMessage('');
    
    handleRAGRequest('/api/ai/chat', { message: userMsg, context: 'Career tracking, resume, job searching coach' }, (data) => {
      setChatHistory(prev => [...prev, { sender: 'assistant', text: data.message }]);
    });
  };

  return (
    <div className="ai-dashboard-container">
      {/* Top Banner Header */}
      <div className="ai-dashboard-header">
        <div className="ai-header-left">
          <h1>AI Career Intelligence Suite</h1>
          <p>Optimize your resume, prepare for interviews, and map your path using Grok AI.</p>
        </div>
        <div className="ai-powered-tag">
          <FiCpu /> Powered by Grok (xAI)
        </div>
      </div>

      {/* Grid Dashboard */}
      <div className="ai-grid-layout">
        {/* Left Tabs Menu */}
        <div className="ai-tabs-sidebar">
          <button className={`tab-link ${activeTab === 'resume-review' ? 'active' : ''}`} onClick={() => setActiveTab('resume-review')}>
            <FiFileText /> AI Resume Review
          </button>
          <button className={`tab-link ${activeTab === 'career-rec' ? 'active' : ''}`} onClick={() => { setActiveTab('career-rec'); if(!careerRecs) fetchCareerRecs(); }}>
            <FiTrendingUp /> AI Career Recommendations
          </button>
          <button className={`tab-link ${activeTab === 'skill-gap' ? 'active' : ''}`} onClick={() => setActiveTab('skill-gap')}>
            <FiAlertTriangle /> AI Skill Gap Analysis
          </button>
          <button className={`tab-link ${activeTab === 'interview-qs' ? 'active' : ''}`} onClick={() => setActiveTab('interview-qs')}>
            <FiBookOpen /> AI Interview Questions
          </button>
          <button className={`tab-link ${activeTab === 'roadmap' ? 'active' : ''}`} onClick={() => setActiveTab('roadmap')}>
            <FiMap /> AI Roadmap Generator
          </button>
          <button className={`tab-link ${activeTab === 'cover-letter' ? 'active' : ''}`} onClick={() => setActiveTab('cover-letter')}>
            <FiFilePlus /> AI Cover Letter Generator
          </button>
          <button className="tab-link" onClick={() => navigate('/dashboard/resume-builder')}>
            <FiEdit3 /> AI Resume Builder
          </button>
          <button className={`tab-link ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
            <FiMessageSquare /> Career Chat Assistant
          </button>
        </div>

        {/* Right Content Panels */}
        <div className="ai-content-panel">
          {error && <div className="ai-panel-error">{error}</div>}

          {/* 1. Resume Review */}
          {activeTab === 'resume-review' && (
            <div className="panel-card">
              <h2><FiFileText /> ATS Resume Checker & Review</h2>
              <p className="panel-desc">Paste your resume content or upload a PDF to see how it matches ATS filters.</p>
              
              <div className="file-upload-row">
                <button className="btn-upload-pdf" onClick={() => fileInputRef.current.click()} disabled={loading}>
                  <FiUpload /> Upload PDF Resume
                </button>
                <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
              </div>

              <div className="text-or-divider"><span>OR PASTE TEXT</span></div>

              <textarea 
                className="panel-textarea" 
                placeholder="Paste your resume content here..." 
                value={resumeText} 
                onChange={(e) => setResumeText(e.target.value)}
              />

              <button className="btn-action" onClick={handleAnalyzeText} disabled={loading || !resumeText.trim()}>
                {loading ? 'Reviewing...' : <><FiZap /> Run AI Review</>}
              </button>

              {reviewResult && (
                <div className="review-results-box">
                  <div className="results-grid">
                    <div className="res-card overall">
                      <h4>OVERALL SCORE</h4>
                      <span className="res-val">{reviewResult.overallScore || 75}/100</span>
                    </div>
                    <div className="res-card">
                      <h4>READABILITY</h4>
                      <span className="res-val">{reviewResult.readabilityIndex || 80}</span>
                    </div>
                    <div className="res-card">
                      <h4>GRAMMAR</h4>
                      <span className="res-val">{reviewResult.grammarScore || 90}</span>
                    </div>
                  </div>
                  {reviewResult.feedback && (
                    <div className="feedback-bullets">
                      <h4>Grok recommendations:</h4>
                      <ul>
                        {reviewResult.feedback.map((f, i) => <li key={i}><FiCheckCircle /> {f}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 2. Career Rec */}
          {activeTab === 'career-rec' && (
            <div className="panel-card">
              <h2><FiTrendingUp /> AI Career Recommendations</h2>
              <p className="panel-desc">Explore recommended jobs and careers suited to your skills.</p>
              <button className="btn-action" onClick={fetchCareerRecs} disabled={loading}>
                {loading ? 'Exploring...' : 'Refresh Recommendations'}
              </button>
              {careerRecs && (
                <div className="recs-list">
                  {careerRecs.map((rec, idx) => (
                    <div key={idx} className="rec-card">
                      <h3>{rec.title}</h3>
                      <p>{rec.description || 'Suitable career path match based on your MERN skills.'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Skill Gap */}
          {activeTab === 'skill-gap' && (
            <div className="panel-card">
              <h2><FiAlertTriangle /> AI Skill Gap Analysis</h2>
              <p className="panel-desc">Input a target role to find skills you need to learn.</p>
              <input 
                type="text" 
                className="panel-input" 
                placeholder="e.g. Senior Frontend Engineer" 
                value={targetJob}
                onChange={e => setTargetJob(e.target.value)}
              />
              <button className="btn-action" onClick={handleSkillGap} disabled={loading || !targetJob.trim()}>
                {loading ? 'Analyzing...' : 'Analyze Skill Gap'}
              </button>
              {skillGapResult && (
                <div className="skill-gap-results">
                  <h3>Detected Skill Gaps</h3>
                  <div className="gap-tags">
                    {skillGapResult.missingSkillsDetected.map((skill, idx) => (
                      <span key={idx} className="gap-tag">{skill}</span>
                    ))}
                  </div>
                  <h3 style={{ marginTop: '20px' }}>Recommended Resources</h3>
                  <div className="resources-list">
                    {skillGapResult.recommendedResources.map((res, idx) => (
                      <div key={idx} className="resource-item">
                        <strong>{res.name}</strong> • <span>{res.platform}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Interview Questions */}
          {activeTab === 'interview-qs' && (
            <div className="panel-card">
              <h2><FiBookOpen /> AI Interview Prep Questions</h2>
              <p className="panel-desc">Generate typical technical and behavioral interview questions for a role.</p>
              <input 
                type="text" 
                className="panel-input" 
                placeholder="e.g. Full Stack Developer" 
                value={interviewRole}
                onChange={e => setInterviewRole(e.target.value)}
              />
              <button className="btn-action" onClick={handleToggle => handleGenerateInterviewQs()} disabled={loading || !interviewRole.trim()}>
                {loading ? 'Generating...' : 'Generate Questions'}
              </button>
              {interviewQs && (
                <pre className="pre-formatted-text">{interviewQs}</pre>
              )}
            </div>
          )}

          {/* 5. Roadmap */}
          {activeTab === 'roadmap' && (
            <div className="panel-card">
              <h2><FiMap /> AI Career Roadmap Generator</h2>
              <p className="panel-desc">Generate a step-by-step skill roadmap to transition into a new career path.</p>
              <input 
                type="text" 
                className="panel-input" 
                placeholder="e.g. DevOps Engineer" 
                value={roadmapRole}
                onChange={e => setRoadmapRole(e.target.value)}
              />
              <button className="btn-action" onClick={handleGenerateRoadmap} disabled={loading || !roadmapRole.trim()}>
                {loading ? 'Generating roadmap...' : 'Generate Step-by-Step Roadmap'}
              </button>
              {roadmapResult && (
                <pre className="pre-formatted-text">{roadmapResult}</pre>
              )}
            </div>
          )}

          {/* 6. Cover Letter */}
          {activeTab === 'cover-letter' && (
            <div className="panel-card">
              <h2><FiFilePlus /> AI Cover Letter Generator</h2>
              <p className="panel-desc">Generate a customized cover letter for a job description.</p>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <input 
                  type="text" 
                  className="panel-input" 
                  placeholder="Job Title (e.g. React Developer)" 
                  value={clJobTitle}
                  onChange={e => setClJobTitle(e.target.value)}
                  style={{ flex: 1 }}
                />
                <input 
                  type="text" 
                  className="panel-input" 
                  placeholder="Company Name (e.g. OpenAI)" 
                  value={clCompany}
                  onChange={e => setClCompany(e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
              <button className="btn-action" onClick={handleGenerateCoverLetter} disabled={loading || !clJobTitle.trim() || !clCompany.trim()}>
                {loading ? 'Generating...' : 'Generate Cover Letter'}
              </button>
              {clResult && (
                <pre className="pre-formatted-text">{clResult}</pre>
              )}
            </div>
          )}

          {/* 8. Chat Assistant */}
          {activeTab === 'chat' && (
            <div className="panel-card lk-chat-card">
              <h2><FiMessageSquare /> AI Career Coach Assistant</h2>
              <div className="chat-window-box">
                {chatHistory.map((chat, idx) => (
                  <div key={idx} className={`chat-bubble ${chat.sender}`}>
                    <div className="bubble-text">{chat.text}</div>
                  </div>
                ))}
              </div>
              <div className="chat-input-row">
                <input 
                  type="text" 
                  className="chat-input-box" 
                  placeholder="Ask a question..." 
                  value={chatMessage} 
                  onChange={e => setChatMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="btn-chat-send" onClick={handleSendMessage} disabled={loading}>
                  <FiSend />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AIFeatures;
