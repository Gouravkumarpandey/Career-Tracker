const express = require('express');
const goalController = require('./goal.controller');
const validate = require('../../middlewares/validate.middleware');
const auth = require('../../middlewares/auth.middleware');
const { validateCreateGoal, validateUpdateGoal } = require('./goal.validation');

const router = express.Router();

router.use(auth); // Protect all routes below this middleware

router.get('/', goalController.getAll);
router.post('/', validate(validateCreateGoal), goalController.create);
router.get('/:id', goalController.getById);
router.put('/:id', validate(validateUpdateGoal), goalController.update);
router.delete('/:id', goalController.remove);

module.exports = router;
