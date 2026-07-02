const express = require('express');
const notificationController = require('./notification.controller');
const auth = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(auth); // Protect all routes below this middleware

router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.get('/check-alerts', notificationController.checkAlerts);

module.exports = router;
