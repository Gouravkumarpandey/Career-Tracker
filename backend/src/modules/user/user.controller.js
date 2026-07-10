const userService = require('./user.service');
const ApiResponse = require('../../utils/ApiResponse');

const getProfile = async (req, res, next) => {
  try {
    const result = await userService.getUserProfile(req.user.id);
    res.status(200).json(new ApiResponse(200, result, 'User profile retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const result = await userService.updateUserProfile(req.user.id, req.body);
    res.status(200).json(new ApiResponse(200, result, 'User profile updated successfully.'));
  } catch (error) {
    next(error);
  }
};

const getEducation = async (req, res, next) => {
  try {
    const result = await userService.getEducation(req.user.id);
    res.status(200).json(new ApiResponse(200, result, 'Education records retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const createEducation = async (req, res, next) => {
  try {
    const result = await userService.createEducation(req.user.id, req.body);
    res.status(201).json(new ApiResponse(201, result, 'Education record created successfully.'));
  } catch (error) {
    next(error);
  }
};

const updateEducation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await userService.updateEducation(req.user.id, parseInt(id), req.body);
    res.status(200).json(new ApiResponse(200, result, 'Education record updated successfully.'));
  } catch (error) {
    next(error);
  }
};

const deleteEducation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await userService.deleteEducation(req.user.id, parseInt(id));
    res.status(200).json(new ApiResponse(200, result, 'Education record deleted successfully.'));
  } catch (error) {
    next(error);
  }
};

const createResume = async (req, res, next) => {
  try {
    const result = await userService.createResume(req.user.id, req.body);
    res.status(201).json(new ApiResponse(201, result, 'Resume registered successfully.'));
  } catch (error) {
    next(error);
  }
};

const getUserResumes = async (req, res, next) => {
  try {
    const result = await userService.getUserResumes(req.user.id);
    res.status(200).json(new ApiResponse(200, result, 'Resume history retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const createExperience = async (req, res, next) => {
  try {
    const result = await userService.createExperience(req.user.id, req.body);
    res.status(201).json(new ApiResponse(201, result, 'Experience record created successfully.'));
  } catch (error) {
    next(error);
  }
};

const deleteExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await userService.deleteExperience(req.user.id, parseInt(id));
    res.status(200).json(new ApiResponse(200, result, 'Experience record deleted successfully.'));
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const result = await userService.createProject(req.user.id, req.body);
    res.status(201).json(new ApiResponse(201, result, 'Project created successfully.'));
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await userService.deleteProject(req.user.id, parseInt(id));
    res.status(200).json(new ApiResponse(200, result, 'Project deleted successfully.'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getEducation,
  createEducation,
  updateEducation,
  deleteEducation,
  createResume,
  getUserResumes,
  createExperience,
  deleteExperience,
  createProject,
  deleteProject
};
