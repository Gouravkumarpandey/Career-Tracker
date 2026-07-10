const env = require('../config/env');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to verify Google reCAPTCHA v3 token.
 */
const verifyRecaptcha = async (req, res, next) => {
  try {
    const { recaptchaToken } = req.body;

    if (!recaptchaToken) {
      throw new ApiError(400, 'reCAPTCHA token is missing.');
    }

    const secretKey = env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.warn('WARNING: RECAPTCHA_SECRET_KEY is not defined in environment variables.');
      return next(); // If not configured, bypass verification to prevent blocking
    }

    // Verify token with Google API
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: recaptchaToken,
        remoteip: req.ip
      })
    });

    const data = await response.json();

    if (!data.success) {
      console.error('reCAPTCHA verification failed:', data['error-codes']);
      throw new ApiError(400, 'reCAPTCHA verification failed. Please try again.');
    }

    // Reject requests with a score below 0.5 (typical threshold for suspicious traffic)
    if (data.score !== undefined && data.score < 0.5) {
      console.warn(`Suspicious request blocked: score ${data.score}`);
      throw new ApiError(403, 'Access denied: Suspicious activity detected.');
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = verifyRecaptcha;
