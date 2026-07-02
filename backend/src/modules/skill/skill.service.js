const prisma = require('../../config/prisma');
const ApiError = require('../../utils/ApiError');

const mapSkillFields = (skill) => {
  if (!skill) return null;
  const prof = skill.proficiency || 'Beginner';
  let progress = 0;
  if (prof === 'Expert') progress = 90;
  else if (prof === 'Intermediate') progress = 60;
  else if (prof === 'Beginner') progress = 25;

  let category = 'Technical';
  const nameLower = skill.name.toLowerCase();
  if (nameLower.includes('react') || nameLower.includes('html') || nameLower.includes('css') || nameLower.includes('frontend')) {
    category = 'Frontend';
  } else if (nameLower.includes('node') || nameLower.includes('express') || nameLower.includes('api') || nameLower.includes('backend')) {
    category = 'Backend';
  } else if (nameLower.includes('postgres') || nameLower.includes('sql') || nameLower.includes('database')) {
    category = 'Databases';
  } else if (nameLower.includes('writing') || nameLower.includes('comm') || nameLower.includes('soft')) {
    category = 'Soft Skills';
  }

  return {
    ...skill,
    progress,
    category
  };
};

const getSkills = async (userId, query = {}) => {
  const { search, category, proficiency, sortBy = 'name', sortOrder = 'asc', page = 1, limit = 10 } = query;

  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedLimit = Math.max(1, parseInt(limit) || 10);
  const skip = (parsedPage - 1) * parsedLimit;

  // Sorting columns whitelist
  const allowedSortFields = ['name', 'proficiency', 'createdAt'];
  const actualSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
  const actualSortOrder = ['asc', 'desc'].includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'asc';

  const where = {
    userId,
    ...(search && {
      name: {
        contains: search,
        mode: 'insensitive'
      }
    }),
    ...(proficiency && {
      proficiency: {
        equals: proficiency,
        mode: 'insensitive'
      }
    })
  };

  const [skills, total] = await Promise.all([
    prisma.skill.findMany({
      where,
      orderBy: { [actualSortBy]: actualSortOrder },
      skip,
      take: parsedLimit,
      include: {
        careers: {
          select: {
            id: true,
            company: true,
            role: true
          }
        }
      }
    }),
    prisma.skill.count({ where })
  ]);

  // Project skills with computed fields
  let projectedSkills = skills.map(mapSkillFields);

  // Filter by category in code if category filter is specified
  if (category) {
    projectedSkills = projectedSkills.filter(s => s.category.toLowerCase() === category.toLowerCase());
  }

  return {
    skills: projectedSkills,
    pagination: {
      total: category ? projectedSkills.length : total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil((category ? projectedSkills.length : total) / parsedLimit)
    }
  };
};

const getSkillById = async (userId, id) => {
  const skill = await prisma.skill.findFirst({
    where: { id, userId },
    include: {
      careers: {
        select: {
          id: true,
          company: true,
          role: true
        }
      }
    }
  });

  if (!skill) {
    throw new ApiError(404, 'Skill not found.');
  }

  return mapSkillFields(skill);
};

const createSkill = async (userId, data) => {
  const { name, proficiency } = data;

  const skill = await prisma.skill.create({
    data: {
      name,
      proficiency: proficiency || 'Beginner',
      userId
    }
  });

  return mapSkillFields(skill);
};

const updateSkill = async (userId, id, data) => {
  // Check ownership
  await getSkillById(userId, id);

  const { name, proficiency } = data;

  const skill = await prisma.skill.update({
    where: { id },
    data: {
      name,
      proficiency
    }
  });

  return mapSkillFields(skill);
};

const deleteSkill = async (userId, id) => {
  // Check ownership
  await getSkillById(userId, id);

  await prisma.skill.delete({
    where: { id }
  });

  return { message: 'Skill deleted successfully.' };
};

module.exports = {
  getSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  mapSkillFields
};
