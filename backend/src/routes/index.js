const express = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/user/user.routes');
const careerRoutes = require('../modules/career/career.routes');
const skillRoutes = require('../modules/skill/skill.routes');
const roadmapRoutes = require('../modules/roadmap/roadmap.routes');
const goalRoutes = require('../modules/goal/goal.routes');
const internshipRoutes = require('../modules/internship/internship.routes');
const jobRoutes = require('../modules/job/job.routes');
const certificationRoutes = require('../modules/certification/certification.routes');
const analyticsRoutes = require('../modules/analytics/analytics.routes');
const notificationRoutes = require('../modules/notification/notification.routes');
const aiRoutes = require('../modules/ai/ai.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/careers', careerRoutes);
router.use('/skills', skillRoutes);
router.use('/roadmaps', roadmapRoutes);
router.use('/goals', goalRoutes);
router.use('/internships', internshipRoutes);
router.use('/jobs', jobRoutes);
router.use('/certifications', certificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
