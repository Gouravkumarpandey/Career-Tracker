const express = require('express');
const calendarController = require('./calendar.controller');
const auth = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(auth); // Protect all routes below this middleware

router.get('/', calendarController.getAll);
router.post('/', calendarController.create);
router.put('/:id', calendarController.update);
router.delete('/:id', calendarController.remove);

module.exports = router;
