const analyticsService = require('./analytics.service');
const ApiResponse = require('../../utils/ApiResponse');

const getDashboard = async (req, res, next) => {
  try {
    const result = await analyticsService.getDashboardData(req.user.id);
    res.status(200).json(new ApiResponse(200, result, 'Dashboard analytics retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard
};
