const aiService = require('./ai.service');
const ApiResponse = require('../../utils/ApiResponse');

const analyzeResume = async (req, res, next) => {
  try {
    const { resumeId } = req.body;
    if (!resumeId) {
      return res.status(400).json({ success: false, message: 'resumeId is required.' });
    }
    const result = await aiService.analyzeResume(req.user.id, parseInt(resumeId));
    res.status(200).json(new ApiResponse(200, result, 'Resume analysis completed successfully.'));
  } catch (error) {
    next(error);
  }
};

const getSkillGap = async (req, res, next) => {
  try {
    const { targetType, targetId } = req.query;
    if (!targetType || !targetId) {
      return res.status(400).json({ success: false, message: 'targetType and targetId are required queries.' });
    }
    const result = await aiService.getSkillGapAnalysis(req.user.id, targetType, targetId);
    res.status(200).json(new ApiResponse(200, result, 'Skill gap analysis completed successfully.'));
  } catch (error) {
    next(error);
  }
};

const getCareerRecommendations = async (req, res, next) => {
  try {
    const result = await aiService.getCareerRecommendations(req.user.id);
    res.status(200).json(new ApiResponse(200, result, 'AI career recommendations generated successfully.'));
  } catch (error) {
    next(error);
  }
};

const getLearningRecommendations = async (req, res, next) => {
  try {
    const result = await aiService.getLearningRecommendations(req.user.id);
    res.status(200).json(new ApiResponse(200, result, 'AI learning recommendations generated successfully.'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeResume,
  getSkillGap,
  getCareerRecommendations,
  getLearningRecommendations
};
