const express = require('express');
const aiController = require('./ai.controller');
const auth = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(auth); // Protect all routes below this middleware

router.post('/resume/analyze', aiController.analyzeResume);
router.get('/skill-gap', aiController.getSkillGap);
router.get('/recommendations/career', aiController.getCareerRecommendations);
router.get('/recommendations/learning', aiController.getLearningRecommendations);

module.exports = router;
