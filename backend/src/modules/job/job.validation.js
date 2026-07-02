const validateCreateJob = (data) => {
  const { title, company, location, description, jobType } = data;
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return 'Job title is required.';
  }
  if (!company || typeof company !== 'string' || company.trim().length === 0) {
    return 'Company name is required.';
  }
  if (!location || typeof location !== 'string' || location.trim().length === 0) {
    return 'Job location is required.';
  }
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    return 'Job description is required.';
  }
  if (!jobType || typeof jobType !== 'string' || jobType.trim().length === 0) {
    return 'Job type is required (e.g. Full-time, Internship).';
  }
  return null;
};

const validateApply = (data) => {
  const { notes } = data;
  if (notes !== undefined && typeof notes !== 'string') {
    return 'Notes must be a string.';
  }
  return null;
};

const validateScheduleInterview = (data) => {
  const { roundName, interviewDate, locationLink, interviewer } = data;
  if (!roundName || typeof roundName !== 'string' || roundName.trim().length === 0) {
    return 'Interview round name is required.';
  }
  if (!interviewDate || isNaN(Date.parse(interviewDate))) {
    return 'Valid interview date/time is required.';
  }
  if (locationLink !== undefined && typeof locationLink !== 'string') {
    return 'Location link must be a string.';
  }
  if (interviewer !== undefined && typeof interviewer !== 'string') {
    return 'Interviewer name must be a string.';
  }
  return null;
};

module.exports = {
  validateCreateJob,
  validateApply,
  validateScheduleInterview
};
