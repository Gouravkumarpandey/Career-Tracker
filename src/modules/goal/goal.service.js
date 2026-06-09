const prisma = require('../../config/prisma');
const ApiError = require('../../utils/ApiError');

const mapGoalFields = (goal) => {
  if (!goal) return null;
  
  // Calculate if goal is short-term (<= 30 days from creation/now) or long-term
  const target = new Date(goal.targetDate);
  const now = new Date();
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const type = diffDays <= 30 ? 'Short-term' : 'Long-term';

  return {
    ...goal,
    type
  };
};

const getGoals = async (userId, query = {}) => {
  const { type, status, sortBy = 'targetDate', sortOrder = 'asc', page = 1, limit = 10 } = query;

  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedLimit = Math.max(1, parseInt(limit) || 10);
  const skip = (parsedPage - 1) * parsedLimit;

  const allowedSortFields = ['title', 'targetDate', 'status', 'createdAt'];
  const actualSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'targetDate';
  const actualSortOrder = ['asc', 'desc'].includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'asc';

  const where = {
    userId,
    ...(status && {
      status: {
        equals: status,
        mode: 'insensitive'
      }
    })
  };

  const [goals, total] = await Promise.all([
    prisma.goal.findMany({
      where,
      orderBy: { [actualSortBy]: actualSortOrder },
      skip,
      take: parsedLimit
    }),
    prisma.goal.count({ where })
  ]);

  let projectedGoals = goals.map(mapGoalFields);

  if (type) {
    projectedGoals = projectedGoals.filter(g => g.type.toLowerCase() === type.toLowerCase());
  }

  return {
    goals: projectedGoals,
    pagination: {
      total: type ? projectedGoals.length : total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil((type ? projectedGoals.length : total) / parsedLimit)
    }
  };
};

const getGoalById = async (userId, id) => {
  const goal = await prisma.goal.findFirst({
    where: { id, userId }
  });

  if (!goal) {
    throw new ApiError(404, 'Goal not found.');
  }

  return mapGoalFields(goal);
};

const createGoal = async (userId, data) => {
  const { title, description, targetDate, status } = data;

  const goal = await prisma.goal.create({
    data: {
      title,
      description: description || '',
      targetDate: new Date(targetDate),
      status: status || 'Pending',
      userId
    }
  });

  return mapGoalFields(goal);
};

const updateGoal = async (userId, id, data) => {
  // Check ownership
  await getGoalById(userId, id);

  const { title, description, targetDate, status } = data;

  const goal = await prisma.goal.update({
    where: { id },
    data: {
      title,
      description,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      status
    }
  });

  return mapGoalFields(goal);
};

const deleteGoal = async (userId, id) => {
  // Check ownership
  await getGoalById(userId, id);

  await prisma.goal.delete({
    where: { id }
  });

  return { message: 'Goal deleted successfully.' };
};

module.exports = {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  mapGoalFields
};
