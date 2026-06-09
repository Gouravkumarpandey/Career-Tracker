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
  deleteInterview
};
