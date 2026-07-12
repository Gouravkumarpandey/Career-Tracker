const express = require('express');
const authController = require('./auth.controller');
const validate = require('../../middlewares/validate.middleware');
const auth = require('../../middlewares/auth.middleware');
const verifyRecaptcha = require('../../middlewares/recaptcha.middleware');
const { validateRegister, validateLogin } = require('./auth.validation');

const router = express.Router();

router.post('/register', verifyRecaptcha, validate(validateRegister), authController.register);
router.post('/login', verifyRecaptcha, validate(validateLogin), authController.login);
router.post('/google', authController.googleLogin);
router.post('/refresh', authController.refresh);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.me);
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);

module.exports = router;

