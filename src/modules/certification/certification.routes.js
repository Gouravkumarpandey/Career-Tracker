const express = require('express');
const certificationController = require('./certification.controller');
const validate = require('../../middlewares/validate.middleware');
const auth = require('../../middlewares/auth.middleware');
const { validateCreateCert, validateUpdateCert } = require('./certification.validation');

const router = express.Router();

router.use(auth); // Protect all routes below this middleware

router.get('/', certificationController.getAll);
router.post('/', validate(validateCreateCert), certificationController.create);
router.get('/:id', certificationController.getById);
router.put('/:id', validate(validateUpdateCert), certificationController.update);
router.delete('/:id', certificationController.remove);

module.exports = router;
