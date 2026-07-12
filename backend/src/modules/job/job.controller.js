const jobService = require('./job.service');
const ApiResponse = require('../../utils/ApiResponse');
const activityService = require('../activity/activity.service');

const getJobs = async (req, res, next) => {
  try {
    const result = await jobService.getJobs(req.query);
    res.status(200).json(new ApiResponse(200, result, 'Job listings retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await jobService.getJobById(parseInt(id));
    res.status(200).json(new ApiResponse(200, result, 'Job details retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const createJob = async (req, res, next) => {
  try {
    const result = await jobService.createJob(req.body);
    res.status(201).json(new ApiResponse(201, result, 'Job listing created successfully.'));
  } catch (error) {
    next(error);
  }
};

const saveJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await jobService.saveJob(req.user.id, parseInt(id));
    // Log bookmark activity
    await activityService.logActivity(req.user.id, 'BOOKMARK_JOB');
    res.status(200).json(new ApiResponse(200, result, result.message));
  } catch (error) {
    next(error);
  }
};

const getSavedJobs = async (req, res, next) => {
  try {
    const result = await jobService.getSavedJobs(req.user.id);
    res.status(200).json(new ApiResponse(200, result, 'Saved jobs retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const applyToJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await jobService.applyToJob(req.user.id, parseInt(id), req.body);
    // Log apply activity
    await activityService.logActivity(req.user.id, 'JOB_APPLY');
    res.status(201).json(new ApiResponse(201, result, 'Job application submitted successfully.'));
  } catch (error) {
    next(error);
  }
};

const getApplications = async (req, res, next) => {
  try {
    const result = await jobService.getApplications(req.user.id);
    res.status(200).json(new ApiResponse(200, result, 'Job applications retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await jobService.getApplicationById(req.user.id, parseInt(id));
    res.status(200).json(new ApiResponse(200, result, 'Application details retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await jobService.updateApplicationStatus(req.user.id, parseInt(id), status);
    res.status(200).json(new ApiResponse(200, result, 'Application status updated successfully.'));
  } catch (error) {
    next(error);
  }
};

const scheduleInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await jobService.scheduleInterview(req.user.id, parseInt(id), req.body);
    res.status(201).json(new ApiResponse(201, result, 'Interview scheduled successfully.'));
  } catch (error) {
    next(error);
  }
};

const updateInterview = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const result = await jobService.updateInterview(req.user.id, parseInt(interviewId), req.body);
    res.status(200).json(new ApiResponse(200, result, 'Interview details updated successfully.'));
  } catch (error) {
    next(error);
  }
};

const deleteInterview = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const result = await jobService.deleteInterview(req.user.id, parseInt(interviewId));
    res.status(200).json(new ApiResponse(200, result, 'Interview round cancelled successfully.'));
  } catch (error) {
    next(error);
  }
};

const searchOnlineJobs = async (req, res, next) => {
  try {
    const { q, location, jobType, page } = req.query;
    const result = await jobService.searchOnlineJobs(q, location, jobType, page ? parseInt(page) : 1);
    // Log job search activity
    if (req.user && req.user.id) {
      await activityService.logActivity(req.user.id, 'JOB_SEARCH');
    }
    res.status(200).json(new ApiResponse(200, result, 'Online jobs search completed successfully.'));
  } catch (error) {
    next(error);
  }
};

const getAiRecommendations = async (req, res, next) => {
  try {
    const result = await jobService.getAiRecommendations(req.user.id);
    res.status(200).json(new ApiResponse(200, result, 'AI job recommendations retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const createOrGetExternalJob = async (req, res, next) => {
  try {
    const result = await jobService.createOrGetExternalJob(req.body);
    res.status(200).json(new ApiResponse(200, result, 'External job matched successfully.'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  saveJob,
  getSavedJobs,
  applyToJob,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  scheduleInterview,
  updateInterview,
  deleteInterview,
  searchOnlineJobs,
  getAiRecommendations,
  createOrGetExternalJob
};

