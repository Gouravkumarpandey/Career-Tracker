const validateCreateApplication = (data) => {
  const { company, role, status, interviewStage, stipendAmount, durationMonths } = data;
  if (!company || typeof company !== 'string' || company.trim().length === 0) {
    return 'Company name is required.';
  }
  if (!role || typeof role !== 'string' || role.trim().length === 0) {
    return 'Role title is required.';
  }
  if (status && typeof status !== 'string') {
    return 'Status must be a string.';
  }
  if (interviewStage && typeof interviewStage !== 'string') {
    return 'Interview stage must be a string.';
  }
  if (stipendAmount !== undefined && stipendAmount !== null && isNaN(parseFloat(stipendAmount))) {
    return 'Stipend amount must be a number.';
  }
  if (durationMonths !== undefined && durationMonths !== null && isNaN(parseInt(durationMonths))) {
    return 'Duration in months must be an integer.';
  }
  return null;
};

const validateUpdateApplication = (data) => {
  const { company, role, status, interviewStage, stipendAmount, durationMonths } = data;
  if (company !== undefined && (typeof company !== 'string' || company.trim().length === 0)) {
    return 'Company name cannot be empty.';
  }
  if (role !== undefined && (typeof role !== 'string' || role.trim().length === 0)) {
    return 'Role title cannot be empty.';
  }
  if (status !== undefined && typeof status !== 'string') {
    return 'Status must be a string.';
  }
  if (interviewStage !== undefined && typeof interviewStage !== 'string') {
    return 'Interview stage must be a string.';
  }
  if (stipendAmount !== undefined && stipendAmount !== null && isNaN(parseFloat(stipendAmount))) {
    return 'Stipend amount must be a number.';
  }
  if (durationMonths !== undefined && durationMonths !== null && isNaN(parseInt(durationMonths))) {
    return 'Duration in months must be an integer.';
  }
  return null;
};

const validateUpdateEcosystem = (data) => {
  const { stipendAmount, durationMonths, projectDomain, mentorAssigned, onboardingStatus, completionCertificate } = data;
  if (stipendAmount !== undefined && stipendAmount !== null && isNaN(parseFloat(stipendAmount))) {
    return 'Stipend amount must be a number.';
  }
  if (durationMonths !== undefined && isNaN(parseInt(durationMonths))) {
    return 'Duration in months must be an integer.';
  }
  if (projectDomain !== undefined && typeof projectDomain !== 'string') {
    return 'Project domain must be a string.';
  }
  if (mentorAssigned !== undefined && typeof mentorAssigned !== 'string') {
    return 'Mentor assigned must be a string.';
  }
  if (onboardingStatus && !['PENDING', 'ONGOING', 'COMPLETED', 'TERMINATED'].includes(onboardingStatus.toUpperCase())) {
    return 'Invalid onboarding status.';
  }
  if (completionCertificate !== undefined && typeof completionCertificate !== 'string') {
    return 'Completion certificate must be a string (URL).';
  }
  return null;
};

module.exports = {
  validateCreateApplication,
  validateUpdateApplication,
  validateUpdateEcosystem
};
