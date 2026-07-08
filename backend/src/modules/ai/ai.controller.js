const aiService = require('./ai.service');
const ApiResponse = require('../../utils/ApiResponse');
const pdfParse = require('pdf-parse');

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

const analyzeResumeText = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Resume text is required.' });
    }
    const result = await aiService.analyzeResumeTextDirect(req.user.id, text);
    res.status(200).json(new ApiResponse(200, result, 'Resume ATS analysis completed successfully.'));
  } catch (error) {
    next(error);
  }
};

const uploadAnalyzeResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No resume file uploaded. Please upload a PDF.' });
    }

    let extractedText = '';
    
    // Parse PDF
    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      extractedText = data.text;
    } else {
      return res.status(400).json({ success: false, message: 'Only PDF files are supported at this time.' });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Could not extract any text from the uploaded file.' });
    }

    const result = await aiService.analyzeResumeTextDirect(req.user.id, extractedText);
    res.status(200).json(new ApiResponse(200, result, 'Resume file ATS analysis completed successfully.'));
  } catch (error) {
    console.error("File parsing error:", error);
    next(error);
  }
};

const generateResume = async (req, res, next) => {
  try {
    const { targetRole, experience, skills, education } = req.body;
    if (!targetRole || !experience) {
      return res.status(400).json({ success: false, message: 'Target role and experience are required.' });
    }
    const result = await aiService.generateResume(req.user.id, { targetRole, experience, skills, education });
    res.status(200).json(new ApiResponse(200, { resumeText: result }, 'Resume generated successfully.'));
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

const chatAssistant = async (req, res, next) => {
  try {
    const { message, context } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }
    const result = await aiService.aiChatAssistant(req.user.id, message, context);
    res.status(200).json(new ApiResponse(200, result, 'AI response generated successfully.'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeResume,
  analyzeResumeText,
  uploadAnalyzeResume,
  generateResume,
  getSkillGap,
  getCareerRecommendations,
  getLearningRecommendations,
  chatAssistant
};
