const roadmapService = require('./roadmap.service');
const ApiResponse = require('../../utils/ApiResponse');

const getPaths = async (req, res, next) => {
  try {
    const result = await roadmapService.getPaths();
    res.status(200).json(new ApiResponse(200, result, 'Career paths retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const getPathById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await roadmapService.getPathById(parseInt(id));
    res.status(200).json(new ApiResponse(200, result, 'Career path details retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const createPath = async (req, res, next) => {
  try {
    const result = await roadmapService.createPath(req.body);
    res.status(201).json(new ApiResponse(201, result, 'Career path created successfully.'));
  } catch (error) {
    next(error);
  }
};

const enrollInPath = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await roadmapService.enrollInPath(req.user.id, parseInt(id));
    res.status(201).json(new ApiResponse(201, result, 'Enrolled in career path successfully.'));
  } catch (error) {
    next(error);
  }
};

const getUserPaths = async (req, res, next) => {
  try {
    const result = await roadmapService.getUserPaths(req.user.id);
    res.status(200).json(new ApiResponse(200, result, 'User enrolled career paths retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const completeMilestone = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { complete } = req.body;
    const result = await roadmapService.completeMilestone(
      req.user.id, 
      parseInt(id), 
      complete !== undefined ? complete : true
    );
    res.status(200).json(new ApiResponse(200, result, 'Milestone progress updated successfully.'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPaths,
  getPathById,
  createPath,
  enrollInPath,
  getUserPaths,
  completeMilestone
};
