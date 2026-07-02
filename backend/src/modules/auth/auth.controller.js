const authService = require('./auth.service');
const ApiResponse = require('../../utils/ApiResponse');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.register(name, email, password, role);
    res.status(201).json(new ApiResponse(201, result, 'User registered successfully.'));
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(new ApiResponse(200, result, 'Login successful.'));
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    res.status(200).json(new ApiResponse(200, req.user, 'Current user retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    res.status(200).json(new ApiResponse(200, result, 'Token refreshed successfully.'));
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const result = await authService.logout(token);
    res.status(200).json(new ApiResponse(200, result, 'Logged out successfully.'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  me,
  refresh,
  logout
};
