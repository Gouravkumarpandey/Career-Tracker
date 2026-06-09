let token = localStorage.getItem('token') || null;
let user = null;
try {
  const storedUser = localStorage.getItem('user');
  if (storedUser && storedUser !== 'undefined') {
    user = JSON.parse(storedUser);
  }
} catch (err) {
  console.error('Failed to parse user from localStorage:', err);
  localStorage.removeItem('user');
  localStorage.removeItem('token');
}
let currentGoalFilter = 'all';

// Element Selectors
const authView = document.getElementById('authView');
const dashboardView = document.getElementById('dashboardView');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const userNameText = document.getElementById('userName');
const userBadge = document.getElementById('userBadge');
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');

// Initialize view
function init() {
  if (token && user) {
    authView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    userNameText.textContent = user.name;
    userBadge.textContent = user.role || 'Student';
    switchTab('overview');
    loadAllData();
  } else {
    dashboardView.classList.add('hidden');
    authView.classList.remove('hidden');
  }
}

// Tab Switching
function switchTab(tabId) {
  navItems.forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  tabContents.forEach(content => {
    if (content.id === `tab-${tabId}`) {
      content.classList.remove('hidden');
    } else {
      content.classList.add('hidden');
    }
  });

  // Call relevant fetch functions when tab changes
  if (tabId === 'overview') fetchOverviewData();
  if (tabId === 'profile') fetchProfileData();
  if (tabId === 'roadmaps') fetchRoadmapData();
  if (tabId === 'skills') fetchSkillsData();
  if (tabId === 'goals') fetchGoalsData();
  if (tabId === 'jobs') fetchJobsData();
  if (tabId === 'notifications') fetchNotificationsData();
  if (tabId === 'ai') fetchAIData();
}

// Add Nav Listeners
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const tabId = item.getAttribute('data-tab');
    switchTab(tabId);
  });
});

// Helper: Make Authenticated Requests
async function apiCall(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`/api${path}`, options);
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.message || 'API request failed.');
  }
  return result;
}

// 🔐 LOGIN HANDLER
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await apiCall('POST', '/auth/login', { email, password });
    if (res.success) {
      token = res.data.accessToken;
      user = res.data.user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      init();
    }
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
});

// 🔓 LOGOUT HANDLER
logoutBtn.addEventListener('click', async () => {
  try {
    await apiCall('POST', '/auth/logout');
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    token = null;
    user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    init();
  }
});

// LOAD ALL DATA ON START
function loadAllData() {
  fetchOverviewData();
  fetchNotificationsData(); // load badges count
}

// ==========================================
// 📊 TAB: OVERVIEW DATA
// ==========================================
async function fetchOverviewData() {
  try {
    const res = await apiCall('GET', '/analytics/dashboard');
    const d = res.data;
    
    document.getElementById('readinessScore').textContent = d.careerReadinessScore;
    document.getElementById('skillsStat').textContent = d.skillGrowth.totalSkills;
    document.getElementById('avgSkillProgress').textContent = `${d.skillGrowth.averageProgress}%`;
    document.getElementById('certsStat').textContent = d.certificationStats.activeCertifications;
    
    document.getElementById('goalCompletionStat').textContent = `${d.goalStats.completedGoals}/${d.goalStats.totalGoals}`;
    document.getElementById('goalProgressBar').style.width = `${d.goalStats.completionRate}%`;
    document.getElementById('goalRateText').textContent = `${d.goalStats.completionRate}% completion rate`;

    // Path progress
    const pathText = document.getElementById('pathProgressText');
    const pathBar = document.getElementById('pathProgressBar');
    const pathTitle = document.getElementById('activePathTitle');

    if (d.overallProgress > 0) {
      pathTitle.textContent = "Active Career Development Track";
      pathText.textContent = `Overall Milestones Completion: ${d.overallProgress}%`;
      pathBar.style.width = `${d.overallProgress}%`;
    } else {
      pathTitle.textContent = "No Enrolled Paths";
      pathText.textContent = "Go to the Roadmaps tab to enroll in a pathway.";
      pathBar.style.width = `0%`;
    }
  } catch (err) {
    console.error('Overview error:', err);
  }
}

// ==========================================
// 👤 TAB: PROFILE & EDUCATION
// ==========================================
async function fetchProfileData() {
  try {
    const res = await apiCall('GET', '/users/profile');
    const data = res.data;

    // Fill profile fields
    if (data.profile) {
      document.getElementById('profileBio').value = data.profile.bio || '';
      document.getElementById('profilePhone').value = data.profile.phoneNumber || '';
      document.getElementById('profileAddress').value = data.profile.currentAddress || '';
      document.getElementById('profileGithub').value = data.profile.githubUrl || '';
      document.getElementById('profileLinkedin').value = data.profile.linkedinUrl || '';
      document.getElementById('profilePortfolio').value = data.profile.portfolioUrl || '';
    }

    // List education
    const eduList = document.getElementById('educationList');
    eduList.innerHTML = '';
    
    if (data.education && data.education.length > 0) {
      data.education.forEach(edu => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        const start = new Date(edu.startDate).toLocaleDateString([], { year: 'numeric', month: 'short' });
        const end = edu.endDate ? new Date(edu.endDate).toLocaleDateString([], { year: 'numeric', month: 'short' }) : 'Present';
        
        item.innerHTML = `
          <h4>${edu.degree} in ${edu.fieldOfStudy || 'General'}</h4>
          <p class="text-muted">${edu.institution} (${start} - ${end})</p>
          ${edu.percentage ? `<small>Performance: <strong>${edu.percentage}%</strong></small>` : ''}
          <div class="mt-10">
            <button class="btn btn-sm btn-danger" onclick="deleteEducation(${edu.id})">Delete</button>
          </div>
        `;
        eduList.appendChild(item);
      });
    } else {
      eduList.innerHTML = '<p class="text-muted">No education history logged yet.</p>';
    }
  } catch (err) {
    console.error('Profile error:', err);
  }
}

// Profile Save
document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const bio = document.getElementById('profileBio').value;
  const phoneNumber = document.getElementById('profilePhone').value;
  const currentAddress = document.getElementById('profileAddress').value;
  const githubUrl = document.getElementById('profileGithub').value;
  const linkedinUrl = document.getElementById('profileLinkedin').value;
  const portfolioUrl = document.getElementById('profilePortfolio').value;

  try {
    await apiCall('PUT', '/users/profile', { bio, phoneNumber, currentAddress, githubUrl, linkedinUrl, portfolioUrl });
    alert('Profile saved successfully!');
    fetchProfileData();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
});

// Add Education
document.getElementById('educationForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const institution = document.getElementById('eduInst').value;
  const degree = document.getElementById('eduDegree').value;
  const fieldOfStudy = document.getElementById('eduField').value;
  const startDate = document.getElementById('eduStart').value;
  const percentage = document.getElementById('eduPct').value;

  try {
    await apiCall('POST', '/users/education', { institution, degree, fieldOfStudy, startDate, percentage });
    document.getElementById('educationForm').reset();
    fetchProfileData();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
});

async function deleteEducation(id) {
  if (!confirm('Are you sure you want to delete this record?')) return;
  try {
    await apiCall('DELETE', `/users/education/${id}`);
    fetchProfileData();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

// ==========================================
// 🛣️ TAB: CAREER ROADMAPS
// ==========================================
async function fetchRoadmapData() {
  try {
    const pathsRes = await apiCall('GET', '/roadmaps/paths');
    const myPathsRes = await apiCall('GET', '/roadmaps/my-paths');
    
    const paths = pathsRes.data;
    const myPaths = myPathsRes.data;

    // List paths
    const pathsList = document.getElementById('pathsList');
    pathsList.innerHTML = '';

    paths.forEach(path => {
      const isEnrolled = myPaths.some(p => p.careerPathId === path.id);
      const div = document.createElement('div');
      div.className = 'list-item flex-row-between';
      div.innerHTML = `
        <div>
          <h4>${path.title}</h4>
          <p class="text-muted" style="font-size: 14px;">${path.description}</p>
        </div>
        <div>
          ${isEnrolled 
            ? '<span class="status-badge badge-Offered">Enrolled</span>' 
            : `<button class="btn btn-sm btn-primary" onclick="enrollInPath(${path.id})">Enroll</button>`
          }
        </div>
      `;
      pathsList.appendChild(div);
    });

    // Active milestones
    const detail = document.getElementById('activePathDetail');
    if (myPaths.length > 0) {
      const active = myPaths[0]; // show first enrolled path
      const p = active.careerPath;
      
      detail.innerHTML = `
        <div class="flex-row-between">
          <h4>${p.title}</h4>
          <strong class="text-muted">${active.progress}% completed</strong>
        </div>
        <div class="progress-bar-container mt-10">
          <div class="progress-bar" style="width: ${active.progress}%"></div>
        </div>
        <div class="milestones-list mt-20">
          ${p.milestones.map(ms => {
            // Check completed status
            const completed = active.progress >= 100 || (active.progress > 0 && ms.order === 1); // Mock check or match milestone title
            return `
              <div class="list-item" style="border-left: 4px solid ${completed ? 'var(--accent-green)' : 'var(--border-color)'}">
                <div class="flex-row-between">
                  <h5>${ms.title}</h5>
                  <label class="checkbox-container">
                    <input type="checkbox" ${completed ? 'checked' : ''} onchange="toggleMilestone(${ms.id}, this.checked)">
                    Complete
                  </label>
                </div>
                <p class="text-muted" style="font-size: 13px; margin: 6px 0;">${ms.description}</p>
                <div class="resources">
                  ${ms.resources.map(res => `
                    <small>📚 <a href="${res.url}" target="_blank" style="color: var(--accent-blue); text-decoration: none;">${res.title} (${res.type})</a></small>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else {
      detail.innerHTML = '<p class="text-muted">You have not enrolled in any roadmap pathways. Choose a path from the left list and click Enroll!</p>';
    }
  } catch (err) {
    console.error('Roadmap error:', err);
  }
}

async function enrollInPath(id) {
  try {
    await apiCall('POST', `/roadmaps/paths/${id}/enroll`);
    fetchRoadmapData();
    fetchOverviewData();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

async function toggleMilestone(id, complete) {
  try {
    await apiCall('POST', `/roadmaps/milestones/${id}/complete`, { complete });
    fetchRoadmapData();
    fetchOverviewData();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

// ==========================================
// 🛠️ TAB: SKILLS TRACKER
// ==========================================
async function fetchSkillsData() {
  try {
    const res = await apiCall('GET', '/skills');
    const container = document.getElementById('skillsContainer');
    container.innerHTML = '';

    if (res.data.skills && res.data.skills.length > 0) {
      res.data.skills.forEach(skill => {
        const card = document.createElement('div');
        card.className = 'skill-card';
        card.innerHTML = `
          <div class="skill-header">
            <h4>${skill.name}</h4>
            <span class="user-role-badge" style="background: rgba(88, 166, 255, 0.1); color: var(--accent-blue); border-color: rgba(88,166,255,0.2)">${skill.category}</span>
          </div>
          <div class="flex-row-between">
            <span class="text-muted" style="font-size: 14px;">Proficiency: <strong>${skill.proficiency}</strong></span>
            <span style="font-size: 14px; font-weight: 600;">${skill.progress}%</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${skill.progress}%"></div>
          </div>
          <div class="mt-10 flex-row-between">
            <button class="btn btn-sm btn-danger" onclick="deleteSkill(${skill.id})">Remove</button>
          </div>
        `;
        container.appendChild(card);
      });
    } else {
      container.innerHTML = '<p class="text-muted">No skills tracked yet. Enter a skill name above to add one!</p>';
    }
  } catch (err) {
    console.error('Skills error:', err);
  }
}

// Add Skill
document.getElementById('skillForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('skillName').value;
  const proficiency = document.getElementById('skillProf').value;

  try {
    await apiCall('POST', '/skills', { name, proficiency });
    document.getElementById('skillForm').reset();
    fetchSkillsData();
    fetchOverviewData();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
});

async function deleteSkill(id) {
  if (!confirm('Are you sure you want to delete this skill?')) return;
  try {
    await apiCall('DELETE', `/skills/${id}`);
    fetchSkillsData();
    fetchOverviewData();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

// ==========================================
// 🎯 TAB: GOALS BOARD
// ==========================================
async function fetchGoalsData() {
  try {
    let path = '/goals';
    if (currentGoalFilter !== 'all') {
      path += `?type=${currentGoalFilter}`;
    }
    const res = await apiCall('GET', path);
    const list = document.getElementById('goalsList');
    list.innerHTML = '';

    if (res.data.goals && res.data.goals.length > 0) {
      res.data.goals.forEach(goal => {
        const completed = goal.status && goal.status.toLowerCase() === 'completed';
        const isShortTerm = goal.type === 'Short-term';
        const div = document.createElement('div');
        div.className = 'list-item flex-row-between';
        div.innerHTML = `
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h4 style="text-decoration: ${completed ? 'line-through' : 'none'}">${goal.title}</h4>
              <span class="user-role-badge" style="background: rgba(255,255,255,0.05); color: var(--text-secondary); border: none; font-size: 11px;">${goal.type}</span>
            </div>
            <p class="text-muted" style="font-size: 13px; margin: 4px 0;">${goal.description || 'No description provided.'}</p>
            <small>Deadline: <strong style="color: ${completed ? 'var(--accent-green)' : (isShortTerm ? 'var(--accent-yellow)' : 'var(--accent-blue)')}">${new Date(goal.targetDate).toLocaleDateString()}</strong></small>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <label>
              <input type="checkbox" ${completed ? 'checked' : ''} onchange="toggleGoalStatus(${goal.id}, this.checked)">
              Done
            </label>
            <button class="btn btn-sm btn-danger" onclick="deleteGoal(${goal.id})">Delete</button>
          </div>
        `;
        list.appendChild(div);
      });
    } else {
      list.innerHTML = '<p class="text-muted">No goals logged matching this filter.</p>';
    }
  } catch (err) {
    console.error('Goals error:', err);
  }
}

// Add Goal
document.getElementById('goalForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('goalTitle').value;
  const targetDate = document.getElementById('goalDate').value;

  try {
    await apiCall('POST', '/goals', { title, targetDate });
    document.getElementById('goalForm').reset();
    fetchGoalsData();
    fetchOverviewData();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
});

async function toggleGoalStatus(id, completed) {
  try {
    await apiCall('PUT', `/goals/${id}`, { status: completed ? 'Completed' : 'Pending' });
    fetchGoalsData();
    fetchOverviewData();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

async function deleteGoal(id) {
  if (!confirm('Are you sure you want to delete this goal?')) return;
  try {
    await apiCall('DELETE', `/goals/${id}`);
    fetchGoalsData();
    fetchOverviewData();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

// Goal filters listener
document.querySelectorAll('[data-goal-filter]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('[data-goal-filter]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentGoalFilter = btn.getAttribute('data-goal-filter');
    fetchGoalsData();
  });
});

// ==========================================
// 💼 TAB: JOBS & INTERNSHIPS
// ==========================================
async function fetchJobsData() {
  try {
    // 1. Fetch available jobs
    const jobsRes = await apiCall('GET', '/jobs');
    const jobsList = document.getElementById('jobsList');
    jobsList.innerHTML = '';

    jobsRes.data.jobs.forEach(job => {
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `
        <div class="flex-row-between">
          <h4>${job.title}</h4>
          <span class="status-badge badge-Interviewing">${job.jobType}</span>
        </div>
        <p class="text-muted" style="font-size: 13px; margin: 4px 0;">${job.company} - 📍 ${job.location}</p>
        <p style="font-size: 14px; margin: 8px 0;">${job.description}</p>
        <small>Requirements: <strong>${job.requirements || 'None'}</strong></small>
        <div class="mt-10">
          <button class="btn btn-sm btn-primary" onclick="applyJob(${job.id})">Apply Now</button>
        </div>
      `;
      jobsList.appendChild(div);
    });

    // 2. Fetch manual internship applications
    const internRes = await apiCall('GET', '/internships/applications');
    const internList = document.getElementById('internshipsList');
    internList.innerHTML = '';

    if (internRes.data && internRes.data.length > 0) {
      internRes.data.forEach(intern => {
        const div = document.createElement('div');
        div.className = 'list-item flex-row-between';
        div.innerHTML = `
          <div>
            <h4>${intern.company}</h4>
            <p class="text-muted" style="font-size: 13px;">Role: ${intern.role} | Stage: <strong>${intern.interviewStage}</strong></p>
            ${intern.stipendAmount ? `<small>Stipend: ₹${intern.stipendAmount}/month</small>` : ''}
          </div>
          <div>
            <span class="status-badge badge-${intern.status}">${intern.status}</span>
            <button class="btn btn-sm btn-danger mt-10" onclick="deleteInternship(${intern.id})" style="display: block;">Delete</button>
          </div>
        `;
        internList.appendChild(div);
      }
      );
    } else {
      internList.innerHTML = '<p class="text-muted">No manual internship applications logged.</p>';
    }

    // 3. Fetch interviews list
    const appsRes = await apiCall('GET', '/jobs/applications');
    const interviewList = document.getElementById('interviewsList');
    interviewList.innerHTML = '';

    let interviewCount = 0;
    appsRes.data.forEach(app => {
      if (app.interviews && app.interviews.length > 0) {
        app.interviews.forEach(interview => {
          interviewCount++;
          const dateStr = new Date(interview.interviewDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
          const div = document.createElement('div');
          div.className = 'list-item';
          div.innerHTML = `
            <h4>${interview.roundName}</h4>
            <p class="text-muted" style="font-size: 13px;">Company: ${app.job.company} | Role: ${app.job.title}</p>
            <p style="font-size: 14px; margin: 4px 0;">Interviewer: <strong>${interview.interviewer || 'TBD'}</strong></p>
            <small>Scheduled: <strong style="color: var(--accent-purple)">${dateStr}</strong></small>
            ${interview.locationLink ? `<p style="font-size: 13px;"><a href="${interview.locationLink}" target="_blank" style="color: var(--accent-blue)">🔗 Join Interview Room</a></p>` : ''}
          `;
          interviewList.appendChild(div);
        });
      }
    });

    if (interviewCount === 0) {
      interviewList.innerHTML = '<p class="text-muted">No interviews scheduled yet.</p>';
    }
  } catch (err) {
    console.error('Jobs data error:', err);
  }
}

async function applyJob(id) {
  try {
    await apiCall('POST', `/jobs/${id}/apply`, { notes: 'Applied from web dashboard.' });
    alert('Applied successfully!');
    fetchJobsData();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

// Track Internship
document.getElementById('internshipForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const company = document.getElementById('internCompany').value;
  const role = document.getElementById('internRole').value;
  const stipendAmount = document.getElementById('internStipend').value;

  try {
    await apiCall('POST', '/internships/applications', { company, role, stipendAmount });
    document.getElementById('internshipForm').reset();
    fetchJobsData();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
});

async function deleteInternship(id) {
  if (!confirm('Are you sure you want to delete this log?')) return;
  try {
    await apiCall('DELETE', `/internships/applications/${id}`);
    fetchJobsData();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

// ==========================================
// 🔔 TAB: ALERTS & NOTIFICATIONS
// ==========================================
async function fetchNotificationsData() {
  try {
    const res = await apiCall('GET', '/notifications');
    const list = document.getElementById('notificationsList');
    list.innerHTML = '';

    const badge = document.getElementById('alertCount');
    const unread = res.data.filter(n => !n.isRead).length;
    badge.textContent = unread;
    badge.style.display = unread > 0 ? 'inline-block' : 'none';

    if (res.data && res.data.length > 0) {
      res.data.forEach(n => {
        const isGoal = n.message.includes('Goal');
        const isInterview = n.message.includes('Interview');
        const isCert = n.message.includes('Certification');
        const typeClass = isGoal ? 'goal-alert' : (isInterview ? 'interview-alert' : (isCert ? 'certification-alert' : ''));
        
        const card = document.createElement('div');
        card.className = `notification-card ${typeClass}`;
        card.innerHTML = `
          <div class="flex-row-between">
            <p>${n.message}</p>
            ${!n.isRead 
              ? `<button class="btn btn-sm btn-outline" onclick="readNotification(${n.id})">Mark Read</button>`
              : '<small class="text-muted">Read</small>'
            }
          </div>
          <small class="text-muted">${new Date(n.createdAt).toLocaleString()}</small>
        `;
        list.appendChild(card);
      });
    } else {
      list.innerHTML = '<p class="text-muted">No warning logs generated. Click "Scan For Warnings" below to parse goal deadlines, interview times, or certifications expirations!</p>';
    }
  } catch (err) {
    console.error('Notifications error:', err);
  }
}

document.getElementById('scanAlertsBtn').addEventListener('click', async () => {
  try {
    await apiCall('GET', '/notifications/check-alerts');
    fetchNotificationsData();
    alert('Scan complete! Unread alert count updated.');
  } catch (err) {
    alert(`Scan failed: ${err.message}`);
  }
});

async function readNotification(id) {
  try {
    await apiCall('PATCH', `/notifications/${id}/read`);
    fetchNotificationsData();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

// ==========================================
// 🤖 TAB: AI ASSISTANT
// ==========================================
async function fetchAIData() {
  try {
    const res = await apiCall('GET', '/users/resumes');
    const select = document.getElementById('aiResumeSelect');
    select.innerHTML = '<option value="">Select a registered resume...</option>';

    res.data.forEach(resume => {
      const opt = document.createElement('option');
      opt.value = resume.id;
      opt.textContent = `${resume.title} (Added: ${new Date(resume.createdAt).toLocaleDateString()})`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('AI Data error:', err);
  }
}

// Run AI Resume Analysis
document.getElementById('analyzeResumeBtn').addEventListener('click', async () => {
  const resumeId = document.getElementById('aiResumeSelect').value;
  if (!resumeId) {
    alert('Please select a resume first.');
    return;
  }

  const resultBox = document.getElementById('resumeAnalysisResult');
  resultBox.innerHTML = '<p>Analyzing resume contents via AI...</p>';

  try {
    const res = await apiCall('POST', '/ai/resume/analyze', { resumeId });
    const analysis = res.data.analysis;
    
    resultBox.innerHTML = `
      <div class="list-item" style="border-left: 4px solid var(--accent-purple)">
        <h4>📄 AI Parser Scorecard</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px;">
          <div>Grammar & Mechanics Score: <strong>${analysis.grammarScore}%</strong></div>
          <div>Readability Index: <strong>${analysis.readabilityIndex}%</strong></div>
          <div>Active Action Verbs: <strong>${analysis.actionVerbsCount}</strong></div>
          <div>Quantifiable Impact Metrics: <strong>${analysis.quantifiableMetricsCount}</strong></div>
        </div>
        <p class="text-muted mt-10" style="font-size: 13px;">AI Advice: Your readability score is strong. Try incorporating more metrics (e.g., numbers, percentages) to highlight your direct impact.</p>
      </div>
    `;
  } catch (err) {
    resultBox.innerHTML = `<p class="text-danger">Analysis failed: ${err.message}</p>`;
  }
});

// Run AI Career Recommendations
document.getElementById('aiCareerRecBtn').addEventListener('click', async () => {
  const resultBox = document.getElementById('aiRecResult');
  resultBox.innerHTML = '<p>Generating AI career matching lists...</p>';

  try {
    const res = await apiCall('GET', '/ai/recommendations/career');
    resultBox.innerHTML = '<h4>🤖 Career Matching Suggestions:</h4>';
    
    res.data.forEach(rec => {
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `
        <div class="flex-row-between">
          <h5>${rec.suggestedCareer}</h5>
          <span class="user-role-badge" style="background: rgba(63, 185, 80, 0.15); color: var(--accent-green); border-color: rgba(63,185,80,0.2)">Confidence: ${Math.round(rec.confidenceScore * 100)}%</span>
        </div>
        <p style="font-size: 14px; margin-top: 6px;">${rec.reasoning}</p>
      `;
      resultBox.appendChild(div);
    });
  } catch (err) {
    resultBox.innerHTML = `<p class="text-danger">Failed to generate: ${err.message}</p>`;
  }
});

// Run AI Learning Recommendations
document.getElementById('aiLearningBtn').addEventListener('click', async () => {
  const resultBox = document.getElementById('aiRecResult');
  resultBox.innerHTML = '<p>Calculating skill gaps and mapping bridge courses...</p>';

  try {
    const res = await apiCall('GET', '/ai/recommendations/learning');
    resultBox.innerHTML = '<h4>🤖 Skill Gap Bridge recommendations:</h4>';
    
    if (res.data.missingSkillsDetected.length > 0) {
      resultBox.innerHTML += `
        <p style="font-size: 14px; margin-bottom: 12px;">Missing skills detected from your enrolled paths: <strong style="color: var(--accent-yellow)">${res.data.missingSkillsDetected.join(', ')}</strong></p>
      `;
    }
    
    res.data.recommendedResources.forEach(resItem => {
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `
        <h5>${resItem.title} (${resItem.type})</h5>
        <p class="text-muted" style="font-size: 13px;">Topic Category: ${resItem.category}</p>
        <a href="${resItem.url}" target="_blank" style="color: var(--accent-blue); font-size: 14px; text-decoration: none;">🔗 Click here to access learning platform</a>
      `;
      resultBox.appendChild(div);
    });
  } catch (err) {
    resultBox.innerHTML = `<p class="text-danger">Failed to generate: ${err.message}</p>`;
  }
});

// Initialize on Load
init();