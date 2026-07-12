const activityService = require('./activity.service');
const ApiResponse = require('../../utils/ApiResponse');

const getUserActivities = async (req, res, next) => {
  try {
    const data = await activityService.getActivities(req.user.id);
    res.status(200).json(new ApiResponse(200, data, 'User activities retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserActivities
};
