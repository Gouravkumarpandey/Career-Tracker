const express = require('express');
const roadmapController = require('./roadmap.controller');
const validate = require('../../middlewares/validate.middleware');
const auth = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');
const { validateCreatePath } = require('./roadmap.validation');

const router = express.Router();

router.use(auth); // Protect all routes below this middleware

router.get('/paths', roadmapController.getPaths);
router.post('/paths', authorize('Admin'), validate(validateCreatePath), roadmapController.createPath);
router.get('/paths/:id', roadmapController.getPathById);
router.post('/paths/:id/enroll', roadmapController.enrollInPath);
router.get('/my-paths', roadmapController.getUserPaths);
router.post('/milestones/:id/complete', roadmapController.completeMilestone);

module.exports = router;
