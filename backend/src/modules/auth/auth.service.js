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

module.exports = {
  register,
  login,
  refresh,
  logout,
  googleLogin,
  getUserRole
};
