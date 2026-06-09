const prisma = require('../../config/prisma');
const ApiError = require('../../utils/ApiError');
const { getUserRole } = require('../auth/auth.service');

const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      profile: true,
      education: {
        orderBy: { startDate: 'desc' }
      },
      skills: {
        orderBy: { name: 'asc' }
      },
      resumes: {
        orderBy: { createdAt: 'desc' },
        include: {
          metricsAnalysis: true
        }
      }
    }
  });

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  // Attach role dynamically
  user.role = getUserRole(user.email);

  return user;
};

const updateUserProfile = async (userId, data) => {
  const { name, email, bio, avatarUrl, phoneNumber, currentAddress, githubUrl, linkedinUrl, portfolioUrl, resumeFileUrl } = data;

  if (email) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: userId }
      }
    });

    if (existingUser) {
      throw new ApiError(400, 'Email is already taken by another user.');
    }
  }

  const userUpdateData = {};
  if (name !== undefined) userUpdateData.name = name;
  if (email !== undefined) userUpdateData.email = email;

  return prisma.$transaction(async (tx) => {
    if (Object.keys(userUpdateData).length > 0) {
      await tx.user.update({
        where: { id: userId },
        data: userUpdateData
      });
    }

    const profileData = {
      bio,
      avatarUrl,
      phoneNumber,
      currentAddress,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      resumeFileUrl
    };

    // Filter out undefined values
    const cleanedProfileData = {};
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== undefined) {
        cleanedProfileData[key] = profileData[key];
      }
    });

    if (Object.keys(cleanedProfileData).length > 0) {
      await tx.profile.upsert({
        where: { userId },
        create: {
          ...cleanedProfileData,
          userId
        },
        update: cleanedProfileData
      });
    }

    const userRecord = await tx.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        education: true,
        skills: true
      }
    });

    if (userRecord) {
      userRecord.role = getUserRole(userRecord.email);
    }

    return userRecord;
  });
};

// ==========================================
// 🎓 EDUCATION CRUD METHODS
// ==========================================

const getEducation = async (userId) => {
  return prisma.education.findMany({
    where: { userId },
    orderBy: { startDate: 'desc' }
  });
};

const createEducation = async (userId, data) => {
  const { institution, degree, fieldOfStudy, startDate, endDate, percentage } = data;

  return prisma.education.create({
    data: {
      institution,
      degree,
      fieldOfStudy,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      percentage: percentage ? parseFloat(percentage) : null,
      userId
    }
  });
};

const updateEducation = async (userId, id, data) => {
  const education = await prisma.education.findFirst({
    where: { id, userId }
  });

  if (!education) {
    throw new ApiError(404, 'Education record not found.');
  }

  const { institution, degree, fieldOfStudy, startDate, endDate, percentage } = data;

  return prisma.education.update({
    where: { id },
    data: {
      institution,
      degree,
      fieldOfStudy,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
      percentage: percentage !== undefined ? (percentage ? parseFloat(percentage) : null) : undefined
    }
  });
};

const deleteEducation = async (userId, id) => {
  const education = await prisma.education.findFirst({
    where: { id, userId }
  });

  if (!education) {
    throw new ApiError(404, 'Education record not found.');
  }

  await prisma.education.delete({
    where: { id }
  });

  return { message: 'Education record deleted successfully.' };
};

// ==========================================
// 📄 RESUME CRUD METHODS
// ==========================================

const createResume = async (userId, data) => {
  const { title, resumeFileUrl } = data;

  return prisma.$transaction(async (tx) => {
    const resume = await tx.resume.create({
      data: {
        title,
        userId
      }
    });

    if (resumeFileUrl) {
      await tx.profile.upsert({
        where: { userId },
        create: {
          resumeFileUrl,
          userId
        },
        update: {
          resumeFileUrl
        }
      });
    }

    return resume;
  });
};

const getUserResumes = async (userId) => {
  return prisma.resume.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      metricsAnalysis: true
    }
  });
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getEducation,
  createEducation,
  updateEducation,
  deleteEducation,
  createResume,
  getUserResumes
};
