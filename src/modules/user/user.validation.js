const validateUpdateProfile = (data) => {
  const { name, email, bio, avatarUrl, phoneNumber, currentAddress, githubUrl, linkedinUrl, portfolioUrl, resumeFileUrl } = data;
  
  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
    return 'Name must be at least 2 characters long.';
  }
  if (email !== undefined && (typeof email !== 'string' || !email.includes('@'))) {
    return 'Please provide a valid email address.';
  }
  if (bio !== undefined && bio !== null && typeof bio !== 'string') {
    return 'Bio must be a string.';
  }
  if (avatarUrl !== undefined && avatarUrl !== null && typeof avatarUrl !== 'string') {
    return 'Avatar URL must be a string.';
  }
  if (phoneNumber !== undefined && phoneNumber !== null && typeof phoneNumber !== 'string') {
    return 'Phone number must be a string.';
  }
  if (currentAddress !== undefined && currentAddress !== null && typeof currentAddress !== 'string') {
    return 'Current address must be a string.';
  }
  if (githubUrl !== undefined && githubUrl !== null && typeof githubUrl !== 'string') {
    return 'GitHub URL must be a string.';
  }
  if (linkedinUrl !== undefined && linkedinUrl !== null && typeof linkedinUrl !== 'string') {
    return 'LinkedIn URL must be a string.';
  }
  if (portfolioUrl !== undefined && portfolioUrl !== null && typeof portfolioUrl !== 'string') {
    return 'Portfolio URL must be a string.';
  }
  if (resumeFileUrl !== undefined && resumeFileUrl !== null && typeof resumeFileUrl !== 'string') {
    return 'Resume file URL must be a string.';
  }
  
  return null;
};

const validateEducation = (data) => {
  const { institution, degree, fieldOfStudy, startDate, endDate, percentage } = data;
  
  if (!institution || typeof institution !== 'string' || institution.trim().length === 0) {
    return 'Institution name is required.';
  }
  if (!degree || typeof degree !== 'string' || degree.trim().length === 0) {
    return 'Degree name is required.';
  }
  if (fieldOfStudy && typeof fieldOfStudy !== 'string') {
    return 'Field of study must be a string.';
  }
  if (!startDate || isNaN(Date.parse(startDate))) {
    return 'Valid start date is required.';
  }
  if (endDate && isNaN(Date.parse(endDate))) {
    return 'End date must be a valid date.';
  }
  if (percentage !== undefined && percentage !== null) {
    const pct = parseFloat(percentage);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      return 'Percentage must be a number between 0 and 100.';
    }
  }
  
  return null;
};

const validateResume = (data) => {
  const { title, resumeFileUrl } = data;
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return 'Resume title is required.';
  }
  if (resumeFileUrl !== undefined && typeof resumeFileUrl !== 'string') {
    return 'Resume file URL must be a string.';
  }
  return null;
};

module.exports = {
  validateUpdateProfile,
  validateEducation,
  validateResume
};
