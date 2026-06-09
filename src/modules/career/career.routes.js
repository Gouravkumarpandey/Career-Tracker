const express = require('express');
const careerController = require('./career.controller');
const validate = require('../../middlewares/validate.middleware');
const auth = require('../../middlewares/auth.middleware');
const { validateCreateCareer, validateUpdateCareer } = require('./career.validation');

const router = express.Router();

router.use(auth); // Protect all routes below this middleware

router.get('/', careerController.getAll);
router.get('/:id', careerController.getById);
router.post('/', validate(validateCreateCareer), careerController.create);
router.put('/:id', validate(validateUpdateCareer), careerController.update);
router.delete('/:id', careerController.remove);

module.exports = router;
