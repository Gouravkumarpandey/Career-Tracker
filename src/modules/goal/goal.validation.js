const validateCreateGoal = (data) => {
  const { title, targetDate, type, status } = data;
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return 'Goal title is required.';
  }
  if (!targetDate || isNaN(Date.parse(targetDate))) {
    return 'Valid target date (deadline) is required.';
  }
  if (type && !['Short-term', 'Long-term'].includes(type)) {
    return 'Type must be "Short-term" or "Long-term".';
  }
  if (status && typeof status !== 'string') {
    return 'Status must be a string.';
  }
  return null;
};

const validateUpdateGoal = (data) => {
  const { title, targetDate, type, status } = data;
  if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
    return 'Goal title cannot be empty.';
  }
  if (targetDate !== undefined && isNaN(Date.parse(targetDate))) {
    return 'Target date must be a valid date.';
  }
  if (type !== undefined && !['Short-term', 'Long-term'].includes(type)) {
    return 'Type must be "Short-term" or "Long-term".';
  }
  if (status !== undefined && typeof status !== 'string') {
    return 'Status must be a string.';
  }
  return null;
};

module.exports = {
  validateCreateGoal,
  validateUpdateGoal
};
