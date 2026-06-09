const express = require('express');
const internshipController = require('./internship.controller');
const validate = require('../../middlewares/validate.middleware');
const auth = require('../../middlewares/auth.middleware');
const { 
  validateCreateApplication, 
  validateUpdateApplication, 
  validateUpdateEcosystem 
} = require('./internship.validation');

const router = express.Router();

router.use(auth); // Protect all routes below this middleware

router.get('/applications', internshipController.getApplications);
router.post('/applications', validate(validateCreateApplication), internshipController.createApplication);
router.get('/applications/:id', internshipController.getApplicationById);
router.put('/applications/:id', validate(validateUpdateApplication), internshipController.updateApplication);
router.delete('/applications/:id', internshipController.deleteApplication);

router.get('/ecosystem', internshipController.getEcosystem);
router.put('/ecosystem', validate(validateUpdateEcosystem), internshipController.updateEcosystem);

module.exports = router;
