const express = require('express');
const multer = require('multer');
const aiController = require('./ai.controller');
const auth = require('../../middlewares/auth.middleware');

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/public-chat', aiController.publicChatAssistant);

router.use(auth); // Protect all routes below this middleware

router.post('/resume/analyze', aiController.analyzeResume);
router.post('/resume/analyze-text', aiController.analyzeResumeText);
router.post('/resume/upload-analyze', upload.single('resume'), aiController.uploadAnalyzeResume);
router.post('/resume/generate', aiController.generateResume);
router.get('/skill-gap', aiController.getSkillGap);
router.get('/recommendations/career', aiController.getCareerRecommendations);
router.get('/recommendations/learning', aiController.getLearningRecommendations);
router.post('/resume/rag-match', aiController.matchResumeToJob);
router.post('/chat', aiController.chatAssistant);

module.exports = router;
