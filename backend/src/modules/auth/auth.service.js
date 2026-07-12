const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const prisma = require('../../config/prisma');
const ApiError = require('../../utils/ApiError');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

// In-memory blacklist for refresh tokens on logout
const blacklistedTokens = new Set();

const getUserRole = (email) => {
  if (email.toLowerCase() === 'admin@example.com') return 'Admin';
  if (email.toLowerCase().includes('mentor')) return 'Mentor';
  return 'Student';
};

const generateAccessToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId, type: 'refresh' }, env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

const register = async (name, email, password, role = 'Student') => {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new ApiError(400, 'User with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true
    }
  });

  // Role is determined dynamically based on email for the response
  const userRole = getUserRole(user.email);
  const accessToken = generateAccessToken(user.id, userRole);
  const refreshToken = generateRefreshToken(user.id);

  return { 
    user: { ...user, role: userRole }, 
    accessToken, 
    refreshToken 
  };
};

const login = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const userRole = getUserRole(user.email);
  const accessToken = generateAccessToken(user.id, userRole);
  const refreshToken = generateRefreshToken(user.id);

  const userResponse = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: userRole,
    createdAt: user.createdAt
  };

  return { user: userResponse, accessToken, refreshToken };
};

const refresh = async (token) => {
  if (!token) {
    throw new ApiError(400, 'Refresh token is required.');
  }

  if (blacklistedTokens.has(token)) {
    throw new ApiError(401, 'Token has been blacklisted.');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      throw new ApiError(401, 'User associated with this token no longer exists.');
    }

    const userRole = getUserRole(user.email);
    const newAccessToken = generateAccessToken(user.id, userRole);
    const newRefreshToken = generateRefreshToken(user.id);

    // Blacklist the old refresh token
    blacklistedTokens.add(token);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token.');
  }
};

const logout = async (token) => {
  if (token) {
    blacklistedTokens.add(token);
  }
  return { message: 'Logged out successfully.' };
};

const googleLogin = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name } = payload;
    
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Create user if not exists
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      });
    }

    const userRole = getUserRole(user.email);
    const accessToken = generateAccessToken(user.id, userRole);
    const refreshToken = generateRefreshToken(user.id);

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: userRole,
      createdAt: user.createdAt
    };

    return { user: userResponse, accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(401, 'Invalid Google Token');
  }
};

const { sendMail } = require('../../utils/emailService');

// In-memory OTP storage: Map mapping email -> { otp, expiresAt }
const activeOtps = new Map();

const sendOtp = async (email) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new ApiError(400, 'Please provide a valid email address.');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (existingUser) {
    throw new ApiError(400, 'An account with this email already exists. Please log in instead.');
  }

  // Generate a random 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiration

  activeOtps.set(email.toLowerCase(), { otp, expiresAt });
  console.log(`[OTP DEBUG] Generated OTP for ${email}: ${otp}`);

  const emailSubject = 'Verify your email address - Careerflow.ai';
  const emailBody = `Hello,

Your One-Time Password (OTP) for email verification is: ${otp}

This code is valid for 5 minutes. Please do not share it with anyone.

Best regards,
The CareerFlow Team`;

  const emailHtml = `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 40px 20px; min-height: 100%;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0; overflow: hidden; border-collapse: separate;">
        <tr>
          <td style="background: linear-gradient(135deg, #293681 0%, #02605f 100%); padding: 32px; text-align: center;">
            <a href="#" style="color: #ffffff; font-size: 22px; font-weight: 800; text-decoration: none; letter-spacing: -0.5px; display: inline-block;">
              <span style="background-color: rgba(255, 255, 255, 0.15); padding: 4px 10px; border-radius: 6px; margin-right: 8px; font-family: sans-serif;">C</span>Careerflow.ai
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 32px; text-align: center;">
            <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; letter-spacing: -0.5px;">Verify your email address</h2>
            <p style="font-size: 14.5px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">To complete your signup and secure your account, please enter the verification code below on the signup page:</p>
            <div style="background-color: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 12px; padding: 18px; margin: 28px auto; max-width: 240px; text-align: center;">
              <span style="font-size: 32px; font-weight: 800; color: #293681; letter-spacing: 6px; font-family: monospace;">${otp}</span>
            </div>
            <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0;">This code is valid for <strong>5 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
            <p style="margin: 0 0 8px 0;">Questions? Contact us at <a href="mailto:support@careerflow.ai" style="color: #02605f; text-decoration: none; font-weight: 600;">support@careerflow.ai</a></p>
            <p style="margin: 0;">&copy; 2026 Careerflow.ai. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </div>
  `;

  await sendMail(email, emailSubject, emailBody, emailHtml);
  return { success: true, message: 'OTP sent successfully.' };
};

const verifyOtp = async (email, otp) => {
  if (!email || !otp) {
    throw new ApiError(400, 'Email and OTP are required.');
  }

  const record = activeOtps.get(email.toLowerCase());
  if (!record) {
    throw new ApiError(400, 'Invalid OTP or OTP has expired.');
  }

  if (Date.now() > record.expiresAt) {
    activeOtps.delete(email.toLowerCase());
    throw new ApiError(400, 'OTP has expired.');
  }

  if (record.otp !== otp.trim()) {
    throw new ApiError(400, 'Invalid OTP code.');
  }

  // Clean up OTP on successful verification
  activeOtps.delete(email.toLowerCase());
  return { success: true, message: 'OTP verified successfully.' };
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  googleLogin,
  getUserRole,
  sendOtp,
  verifyOtp
};

