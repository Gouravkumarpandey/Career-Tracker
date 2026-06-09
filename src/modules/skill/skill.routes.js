const express = require('express');
const skillController = require('./skill.controller');
const validate = require('../../middlewares/validate.middleware');
const auth = require('../../middlewares/auth.middleware');
const { validateCreateSkill, validateUpdateSkill } = require('./skill.validation');

const router = express.Router();

router.use(auth); // Protect all routes below this middleware

router.get('/', skillController.getAll);
router.get('/:id', skillController.getById);
router.post('/', validate(validateCreateSkill), skillController.create);
router.put('/:id', validate(validateUpdateSkill), skillController.update);
router.delete('/:id', skillController.remove);

module.exports = router;
