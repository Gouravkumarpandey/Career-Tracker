const careerService = require('./career.service');
const ApiResponse = require('../../utils/ApiResponse');

const getAll = async (req, res, next) => {
  try {
    const careers = await careerService.getCareers(req.user.id);
    res.status(200).json(new ApiResponse(200, careers, 'Careers retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const career = await careerService.getCareerById(req.user.id, id);
    res.status(200).json(new ApiResponse(200, career, 'Career application retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const career = await careerService.createCareer(req.user.id, req.body);
    res.status(201).json(new ApiResponse(201, career, 'Career application created successfully.'));
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const career = await careerService.updateCareer(req.user.id, id, req.body);
    res.status(200).json(new ApiResponse(200, career, 'Career application updated successfully.'));
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result = await careerService.deleteCareer(req.user.id, id);
    res.status(200).json(new ApiResponse(200, result, 'Career application deleted successfully.'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
