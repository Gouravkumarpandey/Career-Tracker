const express = require('express');
const userController = require('./user.controller');
const validate = require('../../middlewares/validate.middleware');
const auth = require('../../middlewares/auth.middleware');
const { validateUpdateProfile, validateEducation, validateResume } = require('./user.validation');

const router = express.Router();

router.use(auth); // Protect all routes below this middleware

router.get('/profile', userController.getProfile);
router.put('/profile', validate(validateUpdateProfile), userController.updateProfile);

router.get('/education', userController.getEducation);
router.post('/education', validate(validateEducation), userController.createEducation);
router.put('/education/:id', validate(validateEducation), userController.updateEducation);
router.delete('/education/:id', userController.deleteEducation);

router.get('/resumes', userController.getUserResumes);
router.post('/resumes', validate(validateResume), userController.createResume);

module.exports = router;
