const express = require('express');
const analyticsController = require('./analytics.controller');
const auth = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/dashboard', auth, analyticsController.getDashboard);

module.exports = router;
