const prisma = require('../../config/prisma');
const cloudinary = require('../../config/cloudinary');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const { Readable } = require('stream');

const RESUME_EXPIRY_DAYS = 10;

/**
 * Upload a generated resume (plain text / markdown) to Cloudinary as a raw file.
 * Stores it in the `resumes/` folder with a tag so we can batch-delete after 10 days.
 */
const uploadResumeToCloudinary = async (req, res, next) => {
  try {
    const { resumeText, title } = req.body;
    const userId = req.user.id;

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({ success: false, message: 'resumeText is required.' });
    }

    // Convert text to a Buffer stream for Cloudinary upload
    const buffer = Buffer.from(resumeText, 'utf-8');
    const uploadedAt = new Date();
    const expiresAt = new Date(uploadedAt.getTime() + RESUME_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    const publicId = `resumes/user_${userId}_${Date.now()}`;

    // Upload as raw file (plain text)
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          public_id: publicId,
          folder: 'career_tracker_resumes',
          tags: [`user_${userId}`, 'resume', `expires_${expiresAt.toISOString().split('T')[0]}`],
          context: {
            userId: String(userId),
            uploadedAt: uploadedAt.toISOString(),
            expiresAt: expiresAt.toISOString(),
            title: title || 'My Resume'
          }
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      Readable.from(buffer).pipe(uploadStream);
    });

    // Delete any existing resume record for this user (keep only latest)
    const existing = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (existing?.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(existing.cloudinaryPublicId, { resource_type: 'raw' });
      } catch (e) {
        console.warn('[Cloudinary] Could not delete old resume:', e.message);
      }
    }

    // Upsert resume record in DB
    let resume;
    if (existing) {
      resume = await prisma.resume.update({
        where: { id: existing.id },
        data: {
          title: title || existing.title,
          resumeText,
          cloudinaryUrl: uploadResult.secure_url,
          cloudinaryPublicId: uploadResult.public_id,
          cloudinaryUploadedAt: uploadedAt
        }
      });
    } else {
      resume = await prisma.resume.create({
        data: {
          userId,
          title: title || 'My Resume',
          resumeText,
          cloudinaryUrl: uploadResult.secure_url,
          cloudinaryPublicId: uploadResult.public_id,
          cloudinaryUploadedAt: uploadedAt
        }
      });
    }

    return res.status(200).json(new ApiResponse(200, {
      id: resume.id,
      title: resume.title,
      cloudinaryUrl: resume.cloudinaryUrl,
      cloudinaryUploadedAt: resume.cloudinaryUploadedAt,
      expiresAt,
      expiresInDays: RESUME_EXPIRY_DAYS
    }, 'Resume uploaded to Cloudinary successfully. It will be available for AI recommendations for 10 days.'));
  } catch (error) {
    console.error('[ResumeController] uploadResumeToCloudinary error:', error);
    next(error);
  }
};

/**
 * Get the latest stored resume for the current user.
 */
const getStoredResume = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const resume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!resume) {
      return res.status(200).json(new ApiResponse(200, null, 'No resume stored yet.'));
    }

    // Check if expired
    const isExpired = resume.cloudinaryUploadedAt
      ? (Date.now() - new Date(resume.cloudinaryUploadedAt).getTime()) > RESUME_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      : false;

    const expiresAt = resume.cloudinaryUploadedAt
      ? new Date(new Date(resume.cloudinaryUploadedAt).getTime() + RESUME_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
      : null;

    const daysLeft = expiresAt
      ? Math.max(0, Math.ceil((expiresAt - Date.now()) / (1000 * 60 * 60 * 24)))
      : 0;

    return res.status(200).json(new ApiResponse(200, {
      id: resume.id,
      title: resume.title,
      cloudinaryUrl: isExpired ? null : resume.cloudinaryUrl,
      cloudinaryUploadedAt: resume.cloudinaryUploadedAt,
      expiresAt,
      daysLeft,
      isExpired,
      hasCloudResume: !!resume.cloudinaryUrl && !isExpired
    }, isExpired ? 'Resume has expired. Please upload a new one.' : 'Resume retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete stored resume from Cloudinary and DB.
 */
const deleteStoredResume = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const resume = await prisma.resume.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'No resume found.' });
    }

    if (resume.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(resume.cloudinaryPublicId, { resource_type: 'raw' });
    }

    await prisma.resume.delete({ where: { id: resume.id } });

    return res.status(200).json(new ApiResponse(200, null, 'Resume deleted from Cloudinary and database.'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResumeToCloudinary,
  getStoredResume,
  deleteStoredResume
};
