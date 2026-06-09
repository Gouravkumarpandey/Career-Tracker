const validateCreatePath = (data) => {
  const { title, description } = data;
  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    return 'Path title must be at least 3 characters long.';
  }
  if (!description || typeof description !== 'string' || description.trim().length < 5) {
    return 'Path description must be at least 5 characters long.';
  }
  return null;
};

const validateCreateMilestone = (data) => {
  const { title, description, order } = data;
  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    return 'Milestone title must be at least 2 characters long.';
  }
  if (description !== undefined && typeof description !== 'string') {
    return 'Milestone description must be a string.';
  }
  if (order === undefined || isNaN(parseInt(order)) || parseInt(order) < 1) {
    return 'Milestone order must be a positive integer.';
  }
  return null;
};

module.exports = {
  validateCreatePath,
  validateCreateMilestone
};
