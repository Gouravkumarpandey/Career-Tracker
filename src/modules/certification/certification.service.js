const prisma = require('../../config/prisma');
const ApiError = require('../../utils/ApiError');

const getCertifications = async (userId, query = {}) => {
  const { search, sortBy = 'issueDate', sortOrder = 'desc', page = 1, limit = 10 } = query;

  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedLimit = Math.max(1, parseInt(limit) || 10);
  const skip = (parsedPage - 1) * parsedLimit;

  const allowedSortFields = ['name', 'issuingOrg', 'issueDate', 'expiryDate', 'createdAt'];
  const actualSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'issueDate';
  const actualSortOrder = ['asc', 'desc'].includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'desc';

  const where = {
    userId,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { issuingOrg: { contains: search, mode: 'insensitive' } }
      ]
    })
  };

  const [certifications, total] = await Promise.all([
    prisma.certification.findMany({
      where,
      orderBy: { [actualSortBy]: actualSortOrder },
      skip,
      take: parsedLimit
    }),
    prisma.certification.count({ where })
  ]);

  return {
    certifications,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit)
    }
  };
};

const getCertById = async (userId, id) => {
  const cert = await prisma.certification.findFirst({
    where: { id, userId }
  });

  if (!cert) {
    throw new ApiError(404, 'Certification record not found.');
  }

  return cert;
};

const createCert = async (userId, data) => {
  const { name, issuingOrg, issueDate, expiryDate, credentialId, credentialUrl } = data;

  return prisma.certification.create({
    data: {
      name,
      issuingOrg,
      issueDate: new Date(issueDate),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      credentialId: credentialId || null,
      credentialUrl: credentialUrl || null,
      userId
    }
  });
};

const updateCert = async (userId, id, data) => {
  // Check ownership
  await getCertById(userId, id);

  const { name, issuingOrg, issueDate, expiryDate, credentialId, credentialUrl } = data;

  return prisma.certification.update({
    where: { id },
    data: {
      name,
      issuingOrg,
      issueDate: issueDate ? new Date(issueDate) : undefined,
      expiryDate: expiryDate !== undefined ? (expiryDate ? new Date(expiryDate) : null) : undefined,
      credentialId,
      credentialUrl
    }
  });
};

const deleteCert = async (userId, id) => {
  // Check ownership
  await getCertById(userId, id);

  await prisma.certification.delete({
    where: { id }
  });

  return { message: 'Certification record deleted successfully.' };
};

module.exports = {
  getCertifications,
  getCertById,
  createCert,
  updateCert,
  deleteCert
};
