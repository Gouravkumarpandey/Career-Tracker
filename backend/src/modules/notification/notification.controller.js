const notificationService = require('./notification.service');
const ApiResponse = require('../../utils/ApiResponse');

const getNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.getNotifications(req.user.id);
    res.status(200).json(new ApiResponse(200, result, 'Notifications retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await notificationService.markAsRead(req.user.id, parseInt(id));
    res.status(200).json(new ApiResponse(200, result, 'Notification marked as read.'));
  } catch (error) {
    next(error);
  }
};

const checkAlerts = async (req, res, next) => {
  try {
    const result = await notificationService.checkAlerts(req.user.id);
    res.status(200).json(new ApiResponse(200, result, 'Alerts scanned and notifications updated.'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  checkAlerts
};
