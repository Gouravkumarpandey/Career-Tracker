const certificationService = require('./certification.service');
const ApiResponse = require('../../utils/ApiResponse');

const getAll = async (req, res, next) => {
  try {
    const result = await certificationService.getCertifications(req.user.id, req.query);
    res.status(200).json(new ApiResponse(200, result, 'Certifications retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await certificationService.getCertById(req.user.id, parseInt(id));
    res.status(200).json(new ApiResponse(200, result, 'Certification retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const result = await certificationService.createCert(req.user.id, req.body);
    res.status(201).json(new ApiResponse(201, result, 'Certification created successfully.'));
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await certificationService.updateCert(req.user.id, parseInt(id), req.body);
    res.status(200).json(new ApiResponse(200, result, 'Certification updated successfully.'));
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await certificationService.deleteCert(req.user.id, parseInt(id));
    res.status(200).json(new ApiResponse(200, result, 'Certification deleted successfully.'));
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
