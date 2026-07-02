const { JOB_STATUSES } = require('../../utils/constants');

const validateCreateCareer = (data) => {
  const { company, role, status, salary, location, notes, skillIds } = data;
  if (!company || typeof company !== 'string' || company.trim().length === 0) {
    return 'Company name is required.';
  }
  if (!role || typeof role !== 'string' || role.trim().length === 0) {
    return 'Role is required.';
  }
  if (status && !Object.values(JOB_STATUSES).includes(status)) {
    return `Status must be one of: ${Object.values(JOB_STATUSES).join(', ')}`;
  }
  if (salary !== undefined && typeof salary !== 'string') {
    return 'Salary must be a string.';
  }
  if (location !== undefined && typeof location !== 'string') {
    return 'Location must be a string.';
  }
  if (notes !== undefined && typeof notes !== 'string') {
    return 'Notes must be a string.';
  }
  if (skillIds !== undefined && (!Array.isArray(skillIds) || !skillIds.every(id => typeof id === 'number'))) {
    return 'skillIds must be an array of skill IDs (numbers).';
  }
  return null;
};

const validateUpdateCareer = (data) => {
  const { company, role, status, salary, location, notes, skillIds } = data;
  if (company !== undefined && (typeof company !== 'string' || company.trim().length === 0)) {
    return 'Company name cannot be empty.';
  }
  if (role !== undefined && (typeof role !== 'string' || role.trim().length === 0)) {
    return 'Role cannot be empty.';
  }
  if (status && !Object.values(JOB_STATUSES).includes(status)) {
    return `Status must be one of: ${Object.values(JOB_STATUSES).join(', ')}`;
  }
  if (salary !== undefined && typeof salary !== 'string') {
    return 'Salary must be a string.';
  }
  if (location !== undefined && typeof location !== 'string') {
    return 'Location must be a string.';
  }
  if (notes !== undefined && typeof notes !== 'string') {
    return 'Notes must be a string.';
  }
  if (skillIds !== undefined && (!Array.isArray(skillIds) || !skillIds.every(id => typeof id === 'number'))) {
    return 'skillIds must be an array of skill IDs (numbers).';
  }
  return null;
};

module.exports = {
  validateCreateCareer,
  validateUpdateCareer
};
