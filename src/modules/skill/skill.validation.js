const { PROFICIENCY_LEVELS } = require('../../utils/constants');

const validateCreateSkill = (data) => {
  const { name, proficiency, category, progress } = data;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return 'Skill name is required.';
  }
  if (proficiency && !Object.values(PROFICIENCY_LEVELS).includes(proficiency)) {
    return `Proficiency must be one of: ${Object.values(PROFICIENCY_LEVELS).join(', ')}`;
  }
  if (category !== undefined && (typeof category !== 'string' || category.trim().length === 0)) {
    return 'Category must be a non-empty string.';
  }
  if (progress !== undefined) {
    const progVal = parseInt(progress);
    if (isNaN(progVal) || progVal < 0 || progVal > 100) {
      return 'Progress must be an integer between 0 and 100.';
    }
  }
  return null;
};

const validateUpdateSkill = (data) => {
  const { name, proficiency, category, progress } = data;
  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    return 'Skill name cannot be empty.';
  }
  if (proficiency && !Object.values(PROFICIENCY_LEVELS).includes(proficiency)) {
    return `Proficiency must be one of: ${Object.values(PROFICIENCY_LEVELS).join(', ')}`;
  }
  if (category !== undefined && (typeof category !== 'string' || category.trim().length === 0)) {
    return 'Category must be a non-empty string.';
  }
  if (progress !== undefined) {
    const progVal = parseInt(progress);
    if (isNaN(progVal) || progVal < 0 || progVal > 100) {
      return 'Progress must be an integer between 0 and 100.';
    }
  }
  return null;
};

module.exports = {
  validateCreateSkill,
  validateUpdateSkill
};
