const prisma = require('../../config/prisma');
const ApiError = require('../../utils/ApiError');

const mapCareerToInternship = (career) => {
  if (!career) return null;
  // Remove "Internship: " prefix if present in role for presentation
  const roleName = career.role.startsWith('Internship: ') 
    ? career.role.substring(12) 
    : career.role;

  return {
    id: career.id,
    company: career.company,
    role: roleName,
    status: career.status,
    interviewStage: career.notes && career.notes.startsWith('Stage: ')
      ? career.notes.split('\n')[0].substring(7)
      : 'Applied',
    notes: career.notes || '',
    stipendAmount: career.salary ? parseFloat(career.salary) || null : null,
    durationMonths: null,
    appliedAt: career.dateApplied
  };
};

const getApplications = async (userId) => {
  const careers = await prisma.career.findMany({
    where: {
      userId,
      OR: [
        { role: { contains: 'intern', mode: 'insensitive' } },
        { role: { startsWith: 'Internship:', mode: 'insensitive' } }
      ]
    },
    orderBy: { dateApplied: 'desc' }
  });

  return careers.map(mapCareerToInternship);
};

const getApplicationById = async (userId, id) => {
  const career = await prisma.career.findFirst({
    where: {
      id,
      userId,
      OR: [
        { role: { contains: 'intern', mode: 'insensitive' } },
        { role: { startsWith: 'Internship:', mode: 'insensitive' } }
      ]
    }
  });

  if (!career) {
    throw new ApiError(404, 'Internship application not found.');
  }

  return mapCareerToInternship(career);
};

const createApplication = async (userId, data) => {
  const { company, role, status, interviewStage, notes, stipendAmount } = data;

  // We store this in the Career table with the "Internship: " role prefix
  const career = await prisma.career.create({
    data: {
      company,
      role: `Internship: ${role}`,
      status: status || 'Applied',
      salary: stipendAmount ? stipendAmount.toString() : null,
      notes: `Stage: ${interviewStage || 'Applied'}\n${notes || ''}`,
      userId
    }
  });

  return mapCareerToInternship(career);
};

const updateApplication = async (userId, id, data) => {
  // Check ownership
  const existingApp = await getApplicationById(userId, id);

  const { company, role, status, interviewStage, notes, stipendAmount } = data;

  const updateData = {};
  if (company !== undefined) updateData.company = company;
  if (role !== undefined) updateData.role = `Internship: ${role}`;
  if (status !== undefined) updateData.status = status;
  if (stipendAmount !== undefined) updateData.salary = stipendAmount ? stipendAmount.toString() : null;
  
  if (interviewStage !== undefined || notes !== undefined) {
    const stage = interviewStage !== undefined ? interviewStage : existingApp.interviewStage;
    const n = notes !== undefined ? notes : existingApp.notes;
    updateData.notes = `Stage: ${stage}\n${n}`;
  }

  const career = await prisma.career.update({
    where: { id },
    data: updateData
  });

  return mapCareerToInternship(career);
};

const deleteApplication = async (userId, id) => {
  // Check ownership
  await getApplicationById(userId, id);

  await prisma.career.delete({
    where: { id }
  });

  return { message: 'Internship application deleted successfully.' };
};

const getEcosystem = async (userId) => {
  let ecosystem = await prisma.internshipEcosystem.findUnique({
    where: { userId }
  });

  if (!ecosystem) {
    ecosystem = await prisma.internshipEcosystem.create({
      data: {
        userId,
        durationMonths: 6,
        projectDomain: 'Unassigned',
        onboardingStatus: 'PENDING'
      }
    });
  }

  return ecosystem;
};

const updateEcosystem = async (userId, data) => {
  const { stipendAmount, durationMonths, projectDomain, mentorAssigned, onboardingStatus, completionCertificate } = data;

  const updateData = {};
  if (stipendAmount !== undefined) updateData.stipendAmount = stipendAmount ? parseFloat(stipendAmount) : null;
  if (durationMonths !== undefined) updateData.durationMonths = parseInt(durationMonths);
  if (projectDomain !== undefined) updateData.projectDomain = projectDomain;
  if (mentorAssigned !== undefined) updateData.mentorAssigned = mentorAssigned;
  if (onboardingStatus !== undefined) updateData.onboardingStatus = onboardingStatus.toUpperCase();
  if (completionCertificate !== undefined) updateData.completionCertificate = completionCertificate;

  return prisma.internshipEcosystem.upsert({
    where: { userId },
    update: updateData,
    create: {
      ...updateData,
      userId,
      durationMonths: durationMonths ? parseInt(durationMonths) : 6,
      projectDomain: projectDomain || 'Unassigned',
      onboardingStatus: onboardingStatus ? onboardingStatus.toUpperCase() : 'PENDING'
    }
  });
};

module.exports = {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  getEcosystem,
  updateEcosystem
};
