require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'default-super-secret-key-for-career-tracker-123!',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  NODE_ENV: process.env.NODE_ENV || 'development',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GROK_API_KEY: process.env.GROK_API_KEY,
  RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
};
