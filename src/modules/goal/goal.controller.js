const goalService = require('./goal.service');
const ApiResponse = require('../../utils/ApiResponse');

const getAll = async (req, res, next) => {
  try {
    const result = await goalService.getGoals(req.user.id, req.query);
    res.status(200).json(new ApiResponse(200, result, 'Goals retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await goalService.getGoalById(req.user.id, parseInt(id));
    res.status(200).json(new ApiResponse(200, result, 'Goal retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const result = await goalService.create(req.user.id, req.body); // wait, it's createGoal in service
    // Let's check service method name: createGoal.
    // So let's make sure we call createGoal.
    const resultGoal = await goalService.createGoal(req.user.id, req.body);
    res.status(201).json(new ApiResponse(201, resultGoal, 'Goal created successfully.'));
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await goalService.updateGoal(req.user.id, parseInt(id), req.body);
    res.status(200).json(new ApiResponse(200, result, 'Goal updated successfully.'));
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await goalService.deleteGoal(req.user.id, parseInt(id));
    res.status(200).json(new ApiResponse(200, result, 'Goal deleted successfully.'));
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
