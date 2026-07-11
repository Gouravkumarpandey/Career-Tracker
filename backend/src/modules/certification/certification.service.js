const prisma = require('../../config/prisma');
const ApiError = require('../../utils/ApiError');
const fs = require('fs');
const path = require('path');

// Helper function to save file buffer to local uploads directory
const saveCertificateFile = (file) => {
  if (!file) return null;
  
  // Save to backend/public/uploads/certificates
  const uploadDir = path.join(__dirname, '../../../public/uploads/certificates');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const ext = path.extname(file.originalname);
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, file.buffer);

  // Return the relative URL path served by express static
  return `/uploads/certificates/${fileName}`;
};

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

const createCert = async (userId, data, file) => {
  const { name, issuingOrg, issueDate, expiryDate, credentialId, credentialUrl, score, badge } = data;

  const fileUrl = saveCertificateFile(file);

  return prisma.certification.create({
    data: {
      name,
      issuingOrg,
      issueDate: new Date(issueDate),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      credentialId: credentialId || null,
      credentialUrl: credentialUrl || null,
      score: score || null,
      badge: badge || null,
      fileUrl: fileUrl || null,
      expiryReminderSent: false,
      userId
    }
  });
};

const updateCert = async (userId, id, data, file) => {
  // Check ownership
  const existingCert = await getCertById(userId, id);

  const { name, issuingOrg, issueDate, expiryDate, credentialId, credentialUrl, score, badge } = data;

  const fileUrl = file ? saveCertificateFile(file) : undefined;

  // Clean up old file if replacing
  if (fileUrl && existingCert.fileUrl) {
    try {
      const oldFilePath = path.join(__dirname, '../../../public', existingCert.fileUrl);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    } catch (err) {
      console.warn('Failed to delete old certificate file:', err.message);
    }
  }

  return prisma.certification.update({
    where: { id },
    data: {
      name,
      issuingOrg,
      issueDate: issueDate ? new Date(issueDate) : undefined,
      expiryDate: expiryDate !== undefined ? (expiryDate ? new Date(expiryDate) : null) : undefined,
      credentialId,
      credentialUrl,
      score: score !== undefined ? score : undefined,
      badge: badge !== undefined ? badge : undefined,
      fileUrl: fileUrl !== undefined ? fileUrl : undefined,
      // If the expiry date changed, reset the reminder flag
      ...(expiryDate !== undefined && { expiryReminderSent: false })
    }
  });
};

const deleteCert = async (userId, id) => {
  // Check ownership
  const cert = await getCertById(userId, id);

  // Delete file from disk
  if (cert.fileUrl) {
    try {
      const filePath = path.join(__dirname, '../../../public', cert.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.warn('Failed to delete certificate file:', err.message);
    }
  }

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
