const prisma = require('../../config/prisma');
const ApiError = require('../../utils/ApiError');

const getJobs = async (query = {}) => {
  const { search, jobType, location, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = query;

  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedLimit = Math.max(1, parseInt(limit) || 10);
  const skip = (parsedPage - 1) * parsedLimit;

  const allowedSortFields = ['title', 'company', 'location', 'salary', 'createdAt'];
  const actualSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const actualSortOrder = ['asc', 'desc'].includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'desc';

  const where = {
    AND: [
      search ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      } : {},
      jobType ? { jobType: { equals: jobType, mode: 'insensitive' } } : {},
      location ? { location: { contains: location, mode: 'insensitive' } } : {}
    ]
  };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { [actualSortBy]: actualSortOrder },
      skip,
      take: parsedLimit
    }),
    prisma.job.count({ where })
  ]);

  return {
    jobs,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit)
    }
  };
};

const getJobById = async (id) => {
  const job = await prisma.job.findUnique({
    where: { id }
  });

  if (!job) {
    throw new ApiError(404, 'Job listing not found.');
  }

  return job;
};

const createJob = async (data) => {
  const { title, company, location, description, salary, jobType, requirements, link } = data;

  return prisma.job.create({
    data: {
      title,
      company,
      location,
      description,
      salary: salary || null,
      jobType,
      requirements: requirements || null,
      link: link || null
    }
  });
};

const saveJob = async (userId, jobId) => {
  // Check if job exists
  await getJobById(jobId);

  const existingSave = await prisma.savedJob.findFirst({
    where: { userId, jobId }
  });

  if (existingSave) {
    // Unsave
    await prisma.savedJob.delete({
      where: { id: existingSave.id }
    });
    return { saved: false, message: 'Job unsaved successfully.' };
  } else {
    // Save
    await prisma.savedJob.create({
      data: { userId, jobId }
    });
    return { saved: true, message: 'Job saved successfully.' };
  }
};

const getSavedJobs = async (userId) => {
  return prisma.savedJob.findMany({
    where: { userId },
    include: {
      job: true
    },
    orderBy: { savedAt: 'desc' }
  });
};

const applyToJob = async (userId, jobId, data) => {
  const { notes } = data;

  // Check if job exists
  await getJobById(jobId);

  // Check if already applied
  const existingApp = await prisma.jobApplication.findFirst({
    where: { userId, jobId }
  });

  if (existingApp) {
    throw new ApiError(400, 'You have already applied for this job.');
  }

  return prisma.jobApplication.create({
    data: {
      userId,
      jobId,
      status: 'Applied',
      notes: notes || ''
    },
    include: {
      job: true
    }
  });
};

const getApplications = async (userId) => {
  return prisma.jobApplication.findMany({
    where: { userId },
    include: {
      job: true,
      interviews: true
    },
    orderBy: { appliedAt: 'desc' }
  });
};

const getApplicationById = async (userId, id) => {
  const app = await prisma.jobApplication.findFirst({
    where: { id, userId },
    include: {
      job: true,
      interviews: {
        orderBy: { interviewDate: 'asc' }
      }
    }
  });

  if (!app) {
    throw new ApiError(404, 'Job application not found.');
  }

  return app;
};

const updateApplicationStatus = async (userId, id, status) => {
  // Check ownership
  await getApplicationById(userId, id);

  if (!status) {
    throw new ApiError(400, 'Status is required.');
  }

  return prisma.jobApplication.update({
    where: { id },
    data: { status },
    include: {
      job: true
    }
  });
};

const scheduleInterview = async (userId, applicationId, data) => {
  // Check ownership of application
  await getApplicationById(userId, applicationId);

  const { roundName, interviewDate, locationLink, interviewer } = data;

  return prisma.interview.create({
    data: {
      roundName,
      interviewDate: new Date(interviewDate),
      locationLink: locationLink || null,
      interviewer: interviewer || null,
      applicationId
    }
  });
};

const updateInterview = async (userId, interviewId, data) => {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      application: true
    }
  });

  if (!interview || interview.application.userId !== userId) {
    throw new ApiError(404, 'Interview round not found.');
  }

  const { roundName, interviewDate, locationLink, interviewer } = data;

  return prisma.interview.update({
    where: { id: interviewId },
    data: {
      roundName,
      interviewDate: interviewDate ? new Date(interviewDate) : undefined,
      locationLink: locationLink !== undefined ? locationLink : undefined,
      interviewer: interviewer !== undefined ? interviewer : undefined
    }
  });
};

const deleteInterview = async (userId, interviewId) => {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      application: true
    }
  });

  if (!interview || interview.application.userId !== userId) {
    throw new ApiError(404, 'Interview round not found.');
  }

  await prisma.interview.delete({
    where: { id: interviewId }
  });

  return { message: 'Interview scheduled round cancelled successfully.' };
};

const searchOnlineJobs = async (searchQuery = '', location = '', jobType = '', page = 1) => {
  const env = require('../../config/env');
  const query = `${searchQuery || 'Software Engineer'} ${location ? `in ${location}` : ''}`.trim();
  
  let jSearchJobs = [];
  let remotiveJobs = [];

  // 1. Fetch from JSearch (RapidAPI)
  try {
    if (env.RAPIDAPI_KEY) {
      const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=${page}&num_pages=1`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': env.RAPIDAPI_KEY,
          'x-rapidapi-host': env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data && Array.isArray(result.data)) {
          jSearchJobs = result.data.map((item, idx) => ({
            id: `ext-${item.job_id || idx}`,
            title: item.job_title || 'Software Engineer',
            company: item.employer_name || 'Technology Company',
            location: `${item.job_city || ''} ${item.job_state || ''} ${item.job_country || ''}`.trim() || 'Remote',
            description: item.job_description || 'No description provided.',
            salary: item.job_max_salary ? `${item.job_min_salary ? `$${item.job_min_salary} - ` : ''}$${item.job_max_salary} ${item.job_salary_currency || 'USD'}` : 'Competitive Salary',
            jobType: item.job_employment_type ? item.job_employment_type.toLowerCase() : 'full-time',
            requirements: item.job_highlights?.Qualifications?.join(', ') || '',
            link: item.job_apply_link || 'https://rapidapi.com'
          }));
        }
      }
    }
  } catch (error) {
    console.error('[JobService] JSearch API call failed:', error.message);
  }

  // 2. Fetch from Remotive API (Public, no keys required)
  try {
    const remotiveUrl = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(searchQuery || 'Software Engineer')}&limit=15`;
    const response = await fetch(remotiveUrl);
    if (response.ok) {
      const result = await response.json();
      if (result.jobs && Array.isArray(result.jobs)) {
        remotiveJobs = result.jobs.map(item => ({
          id: `ext-remotive-${item.id}`,
          title: item.title,
          company: item.company_name,
          location: item.candidate_required_location || 'Remote',
          description: item.description ? item.description.replace(/<[^>]*>/g, '') : 'No description provided.', // Clean HTML tags
          salary: item.salary || 'Competitive Salary',
          jobType: item.job_type ? item.job_type.replace('_', '-') : 'full-time',
          requirements: item.category || '',
          link: item.url
        }));
      }
    }
  } catch (error) {
    console.error('[JobService] Remotive API call failed:', error.message);
  }

  // Merge results
  const combinedJobs = [...jSearchJobs, ...remotiveJobs];

  // Fallback if both failed
  if (combinedJobs.length === 0) {
    console.warn('[JobService] Both APIs returned zero results. Using fallbacks.');
    return [
      {
        id: `ext-mock-1-${Date.now()}`,
        title: searchQuery ? `${searchQuery} Specialist` : 'Senior Frontend Developer',
        company: 'InnovateTech Systems',
        location: location || 'Bangalore, India (Remote)',
        description: `We are looking for a skilled professional with expertise in ${searchQuery || 'Web Development'}. In this role, you will design, develop, and maintain high-performance applications, collaborate with cross-functional teams, and participate in code reviews.`,
        salary: '12 - 18 LPA',
        jobType: jobType || 'full-time',
        requirements: 'React, Javascript, CSS, Node.js, Git',
        link: 'https://careers.innovatetech.com/jobs/1'
      },
      {
        id: `ext-mock-2-${Date.now()}`,
        title: searchQuery ? `Junior ${searchQuery}` : 'Full Stack Software Engineer',
        company: 'CloudScale Corp',
        location: location || 'Remote (USA)',
        description: `Join our dynamic engineering team to build scalable features. You will work on both frontend interfaces and backend API integrations. Experience with ${searchQuery || 'React/Node'} is highly desired.`,
        salary: '$90,000 - $120,000 USD',
        jobType: jobType || 'full-time',
        requirements: 'Node.js, Express, React, PostgreSQL, REST APIs',
        link: 'https://cloudscale.io/careers'
      }
    ];
  }

  return combinedJobs;
};

const createOrGetExternalJob = async (jobData) => {
  let job = await prisma.job.findFirst({
    where: {
      title: jobData.title,
      company: jobData.company,
      location: jobData.location
    }
  });

  if (!job) {
    job = await prisma.job.create({
      data: {
        title: jobData.title,
        company: jobData.company,
        location: jobData.location || 'Remote',
        description: jobData.description || 'No description provided.',
        salary: jobData.salary || 'Competitive',
        jobType: jobData.jobType || 'Full-time',
        requirements: jobData.requirements || '',
        link: jobData.link || ''
      }
    });
  }

  return job;
};

const getAiRecommendations = async (userId) => {
  const env = require('../../config/env');
  const { callAI } = require('../ai/ai.service');

  // Fetch full user profile details (experiences, education, skills, projects, and latest resume)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      profile: true,
      education: {
        orderBy: { startDate: 'desc' }
      },
      skills: {
        orderBy: { name: 'asc' }
      },
      experiences: {
        orderBy: { startDate: 'desc' }
      },
      projects: {
        orderBy: { startDate: 'desc' }
      },
      resumes: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const skillNames = user.skills.map(s => s.name);
  const resume = user.resumes && user.resumes.length > 0 ? user.resumes[0] : null;

  // Construct comprehensive profile context string for AI
  const profileDetails = [];
  if (user.profile?.bio) profileDetails.push(`Bio: ${user.profile.bio}`);
  
  if (user.experiences && user.experiences.length > 0) {
    const expStrings = user.experiences.map(e => `- ${e.title} at ${e.company} (${e.description || ''})`);
    profileDetails.push(`Work Experience:\n${expStrings.join('\n')}`);
  }

  if (user.projects && user.projects.length > 0) {
    const projStrings = user.projects.map(p => `- ${p.title}: ${p.description || ''} (Technologies: ${p.technologies || ''})`);
    profileDetails.push(`Projects:\n${projStrings.join('\n')}`);
  }

  if (user.education && user.education.length > 0) {
    const eduStrings = user.education.map(ed => `- ${ed.degree} in ${ed.fieldOfStudy} from ${ed.schoolName}`);
    profileDetails.push(`Education:\n${eduStrings.join('\n')}`);
  }

  // If no resume, skills, or profile context, prompt user to complete profile
  if (skillNames.length === 0 && !resume && profileDetails.length === 0) {
    return {
      recommendations: [],
      message: 'Please build a resume, add skills, or complete your profile to get personalized AI job recommendations.'
    };
  }

  const prompt = `
    Candidate's Resume/Title: "${resume ? resume.title : 'Not provided'}"
    Candidate's Skills: [${skillNames.join(', ')}]
    
    Additional Candidate Profile Context:
    ${profileDetails.join('\n\n')}
    
    Based on their full background (skills, experiences, education, and projects), recommend exactly 3 job roles/titles suited for this candidate.
    Return ONLY a valid JSON object with a key "recommendations" which is an array of objects.
    Each object must have the following structure:
    {
      "title": "Job Title (e.g. React Developer)",
      "matchScore": 85, // number out of 100
      "searchQuery": "React Developer", // clean, short search query for jobs
      "reasoning": "Explain why based on their skills/resume/experiences."
    }
  `;

  try {
    const resStr = await callAI([
      { role: 'system', content: 'You are an expert ATS matching engine and recruiter. Always output valid JSON.' },
      { role: 'user', content: prompt }
    ], true);

    let cleanStr = resStr.trim();
    if (cleanStr.startsWith('```json')) cleanStr = cleanStr.substring(7, cleanStr.length - 3).trim();
    const result = JSON.parse(cleanStr);
    return result;

  } catch (error) {
    console.error('[JobService] AI job recommendations failed, using fallback:', error.message);
    
    // Construct relevant offline fallback recommendations based on skills
    const recommendations = [];
    if (skillNames.some(s => s.toLowerCase().includes('react') || s.toLowerCase().includes('frontend'))) {
      recommendations.push({
        title: 'Frontend Engineer',
        matchScore: 92,
        searchQuery: 'Frontend Developer',
        reasoning: `Based on your skills in React and web design, you align perfectly with modern user interface building roles.`
      });
    } else {
      recommendations.push({
        title: 'Software Developer',
        matchScore: 85,
        searchQuery: 'Software Engineer',
        reasoning: 'Matches your foundational software development and database competencies.'
      });
    }

    if (skillNames.some(s => s.toLowerCase().includes('node') || s.toLowerCase().includes('sql') || s.toLowerCase().includes('postgres'))) {
      recommendations.push({
        title: 'Backend Developer',
        matchScore: 88,
        searchQuery: 'Backend Engineer',
        reasoning: 'Strong backend skills matching Express, Node, and relational database systems.'
      });
    } else {
      recommendations.push({
        title: 'Full Stack Engineer',
        matchScore: 80,
        searchQuery: 'Full Stack Developer',
        reasoning: 'Aligns with your versatility in handling both front-end interactions and APIs.'
      });
    }

    recommendations.push({
      title: 'Associate Engineer',
      matchScore: 78,
      searchQuery: 'Software Engineer Intern',
      reasoning: 'Great entry point to build industry exposure and accelerate career scaling.'
    });

    return { recommendations };
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  saveJob,
  getSavedJobs,
  applyToJob,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  scheduleInterview,
  updateInterview,
  deleteInterview,
  searchOnlineJobs,
  createOrGetExternalJob,
  getAiRecommendations
};

