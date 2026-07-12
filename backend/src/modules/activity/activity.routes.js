const express = require('express');
const activityController = require('./activity.controller');
const auth = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/', auth, activityController.getUserActivities);

module.exports = router;
