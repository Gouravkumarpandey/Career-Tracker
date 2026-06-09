const internshipService = require('./internship.service');
const ApiResponse = require('../../utils/ApiResponse');

const getApplications = async (req, res, next) => {
  try {
    const result = await internshipService.getApplications(req.user.id);
    res.status(200).json(new ApiResponse(200, result, 'Internship applications retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await internshipService.getApplicationById(req.user.id, parseInt(id));
    res.status(200).json(new ApiResponse(200, result, 'Internship application details retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const createApplication = async (req, res, next) => {
  try {
    const result = await internshipService.createApplication(req.user.id, req.body);
    res.status(201).json(new ApiResponse(201, result, 'Internship application tracked successfully.'));
  } catch (error) {
    next(error);
  }
};

const updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await internshipService.updateApplication(req.user.id, parseInt(id), req.body);
    res.status(200).json(new ApiResponse(200, result, 'Internship application updated successfully.'));
  } catch (error) {
    next(error);
  }
};

const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await internshipService.deleteApplication(req.user.id, parseInt(id));
    res.status(200).json(new ApiResponse(200, result, 'Internship application deleted successfully.'));
  } catch (error) {
    next(error);
  }
};

const getEcosystem = async (req, res, next) => {
  try {
    const result = await internshipService.getEcosystem(req.user.id);
    res.status(200).json(new ApiResponse(200, result, 'Active internship details retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const updateEcosystem = async (req, res, next) => {
  try {
    const result = await internshipService.updateEcosystem(req.user.id, req.body);
    res.status(200).json(new ApiResponse(200, result, 'Active internship details updated successfully.'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  getEcosystem,
  updateEcosystem
};
