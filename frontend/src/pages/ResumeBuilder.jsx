import React, { useState, useRef } from 'react';
import {
  FiCpu, FiCopy, FiCheck, FiFileText, FiZap, FiDownload, FiFile,
  FiUser, FiMail, FiPhone, FiMapPin, FiLinkedin, FiGithub,
  FiBriefcase, FiBook, FiAward, FiCode, FiPlus, FiTrash2,
  FiChevronRight, FiChevronLeft, FiStar
} from 'react-icons/fi';
import './ResumeBuilder.css';
import api from '../config/api';

/* ── Plain-text → styled HTML parser ───────────────────────── */
const parseResumeToHTML = (text) => {
  if (!text) return '';
  const lines = text.split('\n');
  let html = '';
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }
    const nextLine = (lines[i + 1] || '').trim();
    const isHeading = line === line.toUpperCase() && line.length > 3 && /^[A-Z\s&]+$/.test(line);
    const hasDashes = nextLine.startsWith('---');
    if (isHeading && hasDashes) {
      html += `<div class="rb-section"><h2 class="rb-section-title">${line}</h2><hr class="rb-divider"/>`;
      i += 2;
      let sectionLines = [];
      while (i < lines.length) {
        const sl = lines[i].trim();
        const sl2 = (lines[i + 1] || '').trim();
        const isNext = sl === sl.toUpperCase() && sl.length > 3 && /^[A-Z\s&]+$/.test(sl) && sl2.startsWith('---');
        if (isNext) break;
        sectionLines.push(lines[i]);
        i++;
      }
      let sHtml = '';
      let j = 0;
      while (j < sectionLines.length) {
        const sl = sectionLines[j].trim();
        if (!sl) { j++; continue; }
        if (sl.startsWith('- ') || sl.startsWith('• ')) {
          sHtml += '<ul class="rb-list">';
          while (j < sectionLines.length && (sectionLines[j].trim().startsWith('- ') || sectionLines[j].trim().startsWith('• '))) {
            sHtml += `<li>${sectionLines[j].trim().replace(/^[-•]\s/, '')}</li>`;
            j++;
          }
          sHtml += '</ul>';
        } else if (sl.includes('|')) {
          sHtml += `<div class="rb-job-header">${sl.split('|').map((p, idx) => `<span class="${idx === 0 ? 'rb-job-title' : idx === 1 ? 'rb-company' : 'rb-date'}">${p.trim()}</span>`).join('<span class="rb-sep"> | </span>')}</div>`;
          j++;
        } else {
          sHtml += `<p class="rb-para">${sl}</p>`;
          j++;
        }
      }
      html += sHtml + '</div>';
    } else {
      if (line.includes('@') || line.toLowerCase().includes('email') || line.includes('|') && i < 3) {
        html += `<p class="rb-contact">${line}</p>`;
      } else if (i === 0 || (i < 3 && !hasDashes)) {
        html += `<h1 class="rb-name">${line}</h1>`;
      } else {
        html += `<p class="rb-para">${line}</p>`;
      }
      i++;
    }
  }
  return html;
};

/* ── Steps config ───────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Personal Info',   icon: <FiUser /> },
  { id: 2, label: 'Target & Summary',icon: <FiStar /> },
  { id: 3, label: 'Experience',      icon: <FiBriefcase /> },
  { id: 4, label: 'Education',       icon: <FiBook /> },
  { id: 5, label: 'Skills & More',   icon: <FiCode /> },
];

const emptyJob = () => ({ title: '', company: '', location: '', startDate: '', endDate: '', current: false, achievements: '' });
const emptyEdu = () => ({ degree: '', institution: '', year: '', gpa: '' });
const emptyCert = () => ({ name: '', issuer: '', year: '' });
const emptyProject = () => ({ name: '', tech: '', description: '' });

/* ── Component ──────────────────────────────────────────────── */
const ResumeBuilder = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedResume, setGeneratedResume] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const resumeRef = useRef(null);

  /* Personal */
  const [personal, setPersonal] = useState({ name: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '' });

  /* Target & Summary */
  const [target, setTarget] = useState({ role: '', jobDescription: '', summary: '' });

  /* Experience */
  const [jobs, setJobs] = useState([emptyJob()]);

  /* Education */
  const [eduList, setEduList] = useState([emptyEdu()]);

  /* Skills & More */
  const [skills, setSkills] = useState({ technical: '', soft: '', languages: '' });
  const [certs, setCerts] = useState([]);
  const [projects, setProjects] = useState([]);

  /* ── Helpers ─────────────────────────────────────────────── */
  const updatePersonal = (k, v) => setPersonal(p => ({ ...p, [k]: v }));
  const updateTarget   = (k, v) => setTarget(p => ({ ...p, [k]: v }));
  const updateSkills   = (k, v) => setSkills(p => ({ ...p, [k]: v }));

  const updateJob  = (i, k, v) => setJobs(prev => prev.map((j, idx) => idx === i ? { ...j, [k]: v } : j));
  const addJob     = () => setJobs(p => [...p, emptyJob()]);
  const removeJob  = (i) => setJobs(p => p.filter((_, idx) => idx !== i));

  const updateEdu  = (i, k, v) => setEduList(prev => prev.map((e, idx) => idx === i ? { ...e, [k]: v } : e));
  const addEdu     = () => setEduList(p => [...p, emptyEdu()]);
  const removeEdu  = (i) => setEduList(p => p.filter((_, idx) => idx !== i));

  const updateCert = (i, k, v) => setCerts(prev => prev.map((c, idx) => idx === i ? { ...c, [k]: v } : c));
  const addCert    = () => setCerts(p => [...p, emptyCert()]);
  const removeCert = (i) => setCerts(p => p.filter((_, idx) => idx !== i));

  const updateProject = (i, k, v) => setProjects(prev => prev.map((p, idx) => idx === i ? { ...p, [k]: v } : p));
  const addProject    = () => setProjects(p => [...p, emptyProject()]);
  const removeProject = (i) => setProjects(p => p.filter((_, idx) => idx !== i));

  /* ── Validation per step ────────────────────────────────── */
  const canProceed = () => {
    if (step === 1) return personal.name.trim() && personal.email.trim();
    if (step === 2) return target.role.trim();
    return true;
  };

  /* ── Generate ───────────────────────────────────────────── */
  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const payload = { personal, target, jobs, eduList, skills, certs, projects };
      const response = await api.post('/api/ai/resume/generate', payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setGeneratedResume(response.data.data.resumeText);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
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

  const handleDownloadTXT = () => {
    const blob = new Blob([generatedResume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-${target.role.replace(/\s+/g, '-').toLowerCase() || 'my'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => window.print();

  const parsedHTML = parseResumeToHTML(generatedResume);

  /* ── Step renders ───────────────────────────────────────── */
  const renderStep1 = () => (
    <div className="rb-step-content">
      <div className="rb-step-intro">
        <h3>Personal Information</h3>
        <p>Contact details that appear at the top of your resume.</p>
      </div>
      <div className="rb-grid-2">
        <div className="rb-form-group">
          <label><FiUser /> Full Name *</label>
          <input className="rb-input" placeholder="John Doe" value={personal.name} onChange={e => updatePersonal('name', e.target.value)} />
        </div>
        <div className="rb-form-group">
          <label><FiMail /> Email Address *</label>
          <input className="rb-input" type="email" placeholder="john@example.com" value={personal.email} onChange={e => updatePersonal('email', e.target.value)} />
        </div>
        <div className="rb-form-group">
          <label><FiPhone /> Phone Number</label>
          <input className="rb-input" placeholder="+91 9876543210" value={personal.phone} onChange={e => updatePersonal('phone', e.target.value)} />
        </div>
        <div className="rb-form-group">
          <label><FiMapPin /> Location</label>
          <input className="rb-input" placeholder="City, State" value={personal.location} onChange={e => updatePersonal('location', e.target.value)} />
        </div>
        <div className="rb-form-group">
          <label><FiLinkedin /> LinkedIn URL</label>
          <input className="rb-input" placeholder="linkedin.com/in/johndoe" value={personal.linkedin} onChange={e => updatePersonal('linkedin', e.target.value)} />
        </div>
        <div className="rb-form-group">
          <label><FiGithub /> GitHub / Portfolio</label>
          <input className="rb-input" placeholder="github.com/johndoe" value={personal.github} onChange={e => updatePersonal('github', e.target.value)} />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="rb-step-content">
      <div className="rb-step-intro">
        <h3>Target Role & Job Description</h3>
        <p>Paste the full job posting — the AI will tailor every keyword and bullet point directly to it for maximum ATS score.</p>
      </div>
      <div className="rb-form-group">
        <label><FiStar /> Target Role / Job Title *</label>
        <input className="rb-input" placeholder="e.g. Senior React Developer" value={target.role} onChange={e => updateTarget('role', e.target.value)} />
      </div>
      <div className="rb-form-group">
        <label><FiFileText /> Target Job Description <span className="rb-badge-required">Highly Recommended</span></label>
        <textarea
          className="rb-input rb-textarea rb-textarea-lg"
          placeholder={`Paste the full job posting here. Example:\n\nWe are looking for a Senior React Developer to join our team...\n\nRequirements:\n- 3+ years of React experience\n- Node.js and REST API knowledge\n- Experience with AWS or GCP...\n\nThe AI will extract keywords and tailor your resume to match this exact job description.`}
          value={target.jobDescription}
          onChange={e => updateTarget('jobDescription', e.target.value)}
        />
        <span className="rb-hint">💡 The more detailed the job description, the more precisely the AI targets ATS keywords.</span>
      </div>
      <div className="rb-form-group">
        <label><FiFileText /> Your Professional Summary <span className="rb-optional">(optional — AI will write one if blank)</span></label>
        <textarea
          className="rb-input rb-textarea"
          placeholder="Results-driven software engineer with 3+ years building scalable web applications..."
          value={target.summary}
          onChange={e => updateTarget('summary', e.target.value)}
          style={{ minHeight: '80px' }}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="rb-step-content">
      <div className="rb-step-intro">
        <h3>Work Experience</h3>
        <p>List your positions. Be specific — the AI will convert these into impactful bullet points.</p>
      </div>
      {jobs.map((job, i) => (
        <div key={i} className="rb-card">
          <div className="rb-card-header">
            <span className="rb-card-num">Position {i + 1}</span>
            {jobs.length > 1 && (
              <button className="rb-remove-btn" onClick={() => removeJob(i)}><FiTrash2 size={14} /></button>
            )}
          </div>
          <div className="rb-grid-2">
            <div className="rb-form-group">
              <label>Job Title</label>
              <input className="rb-input" placeholder="Frontend Developer" value={job.title} onChange={e => updateJob(i, 'title', e.target.value)} />
            </div>
            <div className="rb-form-group">
              <label>Company Name</label>
              <input className="rb-input" placeholder="Google Inc." value={job.company} onChange={e => updateJob(i, 'company', e.target.value)} />
            </div>
            <div className="rb-form-group">
              <label>Location</label>
              <input className="rb-input" placeholder="Bangalore, India" value={job.location} onChange={e => updateJob(i, 'location', e.target.value)} />
            </div>
            <div className="rb-form-group">
              <label>Start Date</label>
              <input className="rb-input" type="month" value={job.startDate} onChange={e => updateJob(i, 'startDate', e.target.value)} />
            </div>
            <div className="rb-form-group">
              <label>End Date {job.current && <span className="rb-optional">(current)</span>}</label>
              <input className="rb-input" type="month" value={job.endDate} disabled={job.current} onChange={e => updateJob(i, 'endDate', e.target.value)} />
            </div>
            <div className="rb-form-group rb-checkbox-group">
              <label className="rb-checkbox-label">
                <input type="checkbox" checked={job.current} onChange={e => updateJob(i, 'current', e.target.checked)} />
                Currently working here
              </label>
            </div>
          </div>
          <div className="rb-form-group" style={{ marginTop: '4px' }}>
            <label>Key Responsibilities & Achievements</label>
            <textarea
              className="rb-input rb-textarea"
              placeholder="- Built a React dashboard that improved team productivity by 30%&#10;- Led migration from class components to React hooks&#10;- Integrated REST APIs and collaborated with backend team"
              value={job.achievements}
              onChange={e => updateJob(i, 'achievements', e.target.value)}
            />
            <span className="rb-hint">Use bullet points or sentences. AI will polish them into impact-driven statements.</span>
          </div>
        </div>
      ))}
      <button className="rb-add-btn" onClick={addJob}><FiPlus /> Add Another Position</button>
    </div>
  );

  const renderStep4 = () => (
    <div className="rb-step-content">
      <div className="rb-step-intro">
        <h3>Education</h3>
        <p>Your academic qualifications.</p>
      </div>
      {eduList.map((edu, i) => (
        <div key={i} className="rb-card">
          <div className="rb-card-header">
            <span className="rb-card-num">Education {i + 1}</span>
            {eduList.length > 1 && (
              <button className="rb-remove-btn" onClick={() => removeEdu(i)}><FiTrash2 size={14} /></button>
            )}
          </div>
          <div className="rb-grid-2">
            <div className="rb-form-group">
              <label>Degree / Qualification</label>
              <input className="rb-input" placeholder="B.Tech Computer Science" value={edu.degree} onChange={e => updateEdu(i, 'degree', e.target.value)} />
            </div>
            <div className="rb-form-group">
              <label>Institution</label>
              <input className="rb-input" placeholder="Arka Jain University" value={edu.institution} onChange={e => updateEdu(i, 'institution', e.target.value)} />
            </div>
            <div className="rb-form-group">
              <label>Graduation Year</label>
              <input className="rb-input" type="number" placeholder="2024" min="1990" max="2030" value={edu.year} onChange={e => updateEdu(i, 'year', e.target.value)} />
            </div>
            <div className="rb-form-group">
              <label>GPA / Percentage <span className="rb-optional">(optional)</span></label>
              <input className="rb-input" placeholder="8.5 / 10 or 85%" value={edu.gpa} onChange={e => updateEdu(i, 'gpa', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <button className="rb-add-btn" onClick={addEdu}><FiPlus /> Add Another Qualification</button>
    </div>
  );

  const renderStep5 = () => (
    <div className="rb-step-content">
      <div className="rb-step-intro">
        <h3>Skills, Certifications & Projects</h3>
        <p>Round out your resume with technical skills, achievements, and side projects.</p>
      </div>

      {/* Skills */}
      <div className="rb-section-divider">Skills</div>
      <div className="rb-form-group">
        <label>Technical Skills</label>
        <textarea className="rb-input" style={{ minHeight: '70px' }} placeholder="JavaScript, React, Node.js, MongoDB, Docker, AWS, REST APIs..." value={skills.technical} onChange={e => updateSkills('technical', e.target.value)} />
      </div>
      <div className="rb-grid-2">
        <div className="rb-form-group">
          <label>Soft Skills <span className="rb-optional">(optional)</span></label>
          <input className="rb-input" placeholder="Leadership, Communication, Problem-solving" value={skills.soft} onChange={e => updateSkills('soft', e.target.value)} />
        </div>
        <div className="rb-form-group">
          <label>Languages <span className="rb-optional">(optional)</span></label>
          <input className="rb-input" placeholder="English (Fluent), Hindi (Native)" value={skills.languages} onChange={e => updateSkills('languages', e.target.value)} />
        </div>
      </div>

      {/* Certifications */}
      <div className="rb-section-divider">Certifications <span className="rb-optional">(optional)</span></div>
      {certs.map((cert, i) => (
        <div key={i} className="rb-card">
          <div className="rb-card-header">
            <span className="rb-card-num">Certification {i + 1}</span>
            <button className="rb-remove-btn" onClick={() => removeCert(i)}><FiTrash2 size={14} /></button>
          </div>
          <div className="rb-grid-3">
            <div className="rb-form-group">
              <label>Certification Name</label>
              <input className="rb-input" placeholder="AWS Certified Developer" value={cert.name} onChange={e => updateCert(i, 'name', e.target.value)} />
            </div>
            <div className="rb-form-group">
              <label>Issuing Body</label>
              <input className="rb-input" placeholder="Amazon Web Services" value={cert.issuer} onChange={e => updateCert(i, 'issuer', e.target.value)} />
            </div>
            <div className="rb-form-group">
              <label>Year</label>
              <input className="rb-input" placeholder="2024" value={cert.year} onChange={e => updateCert(i, 'year', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <button className="rb-add-btn" onClick={addCert}><FiPlus /> Add Certification</button>

      {/* Projects */}
      <div className="rb-section-divider" style={{ marginTop: '20px' }}>Projects <span className="rb-optional">(optional)</span></div>
      {projects.map((proj, i) => (
        <div key={i} className="rb-card">
          <div className="rb-card-header">
            <span className="rb-card-num">Project {i + 1}</span>
            <button className="rb-remove-btn" onClick={() => removeProject(i)}><FiTrash2 size={14} /></button>
          </div>
          <div className="rb-grid-2">
            <div className="rb-form-group">
              <label>Project Name</label>
              <input className="rb-input" placeholder="Career Tracker App" value={proj.name} onChange={e => updateProject(i, 'name', e.target.value)} />
            </div>
            <div className="rb-form-group">
              <label>Technologies Used</label>
              <input className="rb-input" placeholder="React, Node.js, PostgreSQL" value={proj.tech} onChange={e => updateProject(i, 'tech', e.target.value)} />
            </div>
          </div>
          <div className="rb-form-group">
            <label>Description / Impact</label>
            <textarea className="rb-input" style={{ minHeight: '70px' }} placeholder="Built a full-stack job tracking application with AI features, serving 500+ users..." value={proj.description} onChange={e => updateProject(i, 'description', e.target.value)} />
          </div>
        </div>
      ))}
      <button className="rb-add-btn" onClick={addProject}><FiPlus /> Add Project</button>
    </div>
  );

  const stepRenderers = [null, renderStep1, renderStep2, renderStep3, renderStep4, renderStep5];

  return (
    <div className="resume-builder-container">
      {/* ── Left Panel: Wizard Form ── */}
      <div className="rb-input-section">
        <div className="rb-header">
          <h1 className="page-heading" style={{ margin: '0 0 4px 0' }}>Resume Builder</h1>
          <p className="rb-subtitle">AI-powered ATS-friendly resume generator</p>
        </div>

        {/* Step Indicator */}
        <div className="rb-steps-indicator">
          {STEPS.map(s => (
            <div
              key={s.id}
              className={`rb-step-dot ${step === s.id ? 'active' : step > s.id ? 'done' : ''}`}
              onClick={() => { if (step > s.id || (step === s.id - 1 && canProceed())) setStep(s.id); }}
              title={s.label}
            >
              <div className="rb-step-icon">{step > s.id ? <FiCheck /> : s.icon}</div>
              <span className="rb-step-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="rb-step-wrapper">
          {error && <div className="rb-error">{error}</div>}
          {stepRenderers[step]()}
        </div>

        {/* Navigation */}
        <div className="rb-nav-btns">
          {step > 1 && (
            <button className="rb-btn-back" onClick={() => setStep(s => s - 1)}>
              <FiChevronLeft /> Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < 5 ? (
            <button
              className="rb-btn-next"
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
            >
              Next <FiChevronRight />
            </button>
          ) : (
            <button
              className="btn-generate-resume"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? <><span className="rb-spinner" /> Generating with AI...</> : <><FiZap /> Generate ATS Resume</>}
            </button>
          )}
        </div>
      </div>

      {/* ── Right Panel: Preview ── */}
      <div className="rb-output-section">
        <div className="rb-output-header">
          <div className="rb-output-title">
            <FiFileText style={{ color: 'var(--dash-primary)' }} />
            ATS Resume Preview
          </div>
          {generatedResume && (
            <div className="rb-action-btns">
              <button className="rb-btn-action rb-btn-copy" onClick={handleCopy}>
                {copied ? <><FiCheck color="#10b981" /> Copied!</> : <><FiCopy /> Copy</>}
              </button>
              <button className="rb-btn-action rb-btn-txt" onClick={handleDownloadTXT}>
                <FiFile /> .TXT
              </button>
              <button className="rb-btn-action rb-btn-pdf" onClick={handleDownloadPDF}>
                <FiDownload /> Download PDF
              </button>
            </div>
          )}
        </div>

        <div className="rb-output-content">
          {generatedResume ? (
            <div className="rb-resume-paper" ref={resumeRef} id="resume-print-area">
              <div className="rb-resume-html" dangerouslySetInnerHTML={{ __html: parsedHTML }} />
            </div>
          ) : (
            <div className="rb-empty-state">
              <FiCpu size={48} style={{ opacity: 0.15 }} />
              <p>Complete all steps and click <strong>Generate ATS Resume</strong></p>
              <p className="rb-empty-hint">Your professionally formatted, ATS-optimized resume will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
