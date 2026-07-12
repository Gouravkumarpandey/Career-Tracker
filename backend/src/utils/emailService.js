const nodemailer = require('nodemailer');
const env = require('../config/env');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  }
});

/**
 * Send an email using the configured SMTP transporter.
 * @param {string} to - Recipient email address
 * @param {string} subject - Subject line
 * @param {string} text - Plain text body
 * @param {string} [html] - Optional HTML body
 * @returns {Promise<any>}
 */
const sendMail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"CareerFlow Support" <${env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text
    });
    console.log(`[EmailService] Email successfully sent to ${to}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[EmailService] Failed to send email to ${to}:`, error);
    throw error;
  }
};

module.exports = {
  sendMail
};
