const prisma = require('../../config/prisma');
const ApiError = require('../../utils/ApiError');

const getCareers = async (userId) => {
  return prisma.career.findMany({
    where: { userId },
    include: {
      skills: {
        select: {
          id: true,
          name: true,
          proficiency: true
        }
      }
    },
    orderBy: { dateApplied: 'desc' }
  });
};

const getCareerById = async (userId, id) => {
  const career = await prisma.career.findFirst({
    where: { id, userId },
    include: {
      skills: {
        select: {
          id: true,
          name: true,
          proficiency: true
        }
      }
    }
  });

  if (!career) {
    throw new ApiError(404, 'Career application not found.');
  }

  return career;
};

const createCareer = async (userId, data) => {
  const { company, role, status, salary, location, notes, skillIds } = data;

  const connectSkills = skillIds ? skillIds.map(id => ({ id })) : [];

  return prisma.career.create({
    data: {
      company,
      role,
      status: status || 'Applied',
      salary,
      location,
      notes,
      userId,
      skills: {
        connect: connectSkills
      }
    },
    include: {
      skills: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
};

const updateCareer = async (userId, id, data) => {
  // Check ownership
  await getCareerById(userId, id);

  const { company, role, status, salary, location, notes, skillIds } = data;

  const updateData = {
    company,
    role,
    status,
    salary,
    location,
    notes
  };

  if (skillIds) {
    updateData.skills = {
      set: skillIds.map(sid => ({ id: sid }))
    };
  }

  return prisma.career.update({
    where: { id },
    data: updateData,
    include: {
      skills: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
};

const deleteCareer = async (userId, id) => {
  // Check ownership
  await getCareerById(userId, id);

  await prisma.career.delete({
    where: { id }
  });

  return { message: 'Career application deleted successfully.' };
};

module.exports = {
  getCareers,
  getCareerById,
  createCareer,
  updateCareer,
  deleteCareer
};
