const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const prisma = require('./config/prisma'); // Aapki existing prisma config file

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://career-tracker-frontend-gouravkumarpandeys-projects.vercel.app", // standard Vercel format
  "https://career-tracker-frontend.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error('CORS Policy: Origin not allowed.'), false);
  },
  credentials: true
}));

// JSON parsing middleware
app.use(express.json());

// ==========================================
// ==========================================
// 🔐 AUTHENTICATION MODULE: SIGNUP & OTP APIs
// ==========================================
app.post('/api/auth/signup-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required." 
      });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: "This email is already registered." 
      });
    }

    const authService = require('./modules/auth/auth.service');
    await authService.sendOtp(email);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email successfully."
    });
  } catch (error) {
    console.error("Signup OTP Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send OTP. Please try again."
    });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields including Name, Email, Password, and OTP are mandatory." 
      });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: "This email is already registered." 
      });
    }

    const authService = require('./modules/auth/auth.service');
    
    // Verify OTP first
    try {
      await authService.verifyOtp(email, otp);
    } catch (otpError) {
      return res.status(400).json({
        success: false,
        message: otpError.message || "Invalid or expired OTP."
      });
    }

    // Hash password and create user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    // Auto-login after successful verification
    const userRole = authService.getUserRole(newUser.email);
    // Generate tokens manually using JWT secret or through authService
    // Let's use authService helper login output format
    const jwt = require('jsonwebtoken');
    const env = require('./config/env');
    const accessToken = jwt.sign({ id: newUser.id, role: userRole }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRE || '30d'
    });
    const refreshToken = jwt.sign({ id: newUser.id, type: 'refresh' }, env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.status(201).json({ 
      success: true, 
      message: "User registered and logged in successfully!", 
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: userRole
      },
      data: {
        accessToken,
        refreshToken,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: userRole
        }
      }
    });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error: Registration failed." 
    });
  }
});


// ==========================================
// 🔑 AUTHENTICATION MODULE: LOGIN API
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email aur Password dono chahiye." 
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid Email ya Password." 
      });
    }

    const authService = require('./modules/auth/auth.service');
    const result = await authService.login(email, password);

    // Log login activity
    const activityService = require('./modules/activity/activity.service');
    await activityService.logActivity(result.user.id, 'LOGIN');

    res.status(200).json({
      success: true,
      message: "Login Successful!",
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role
      },
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role
        }
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error: Login nahi ho paya." 
    });
  }
});

const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');

// Serve static files from public folder
app.use(express.static('public'));

// Mount modular routes
app.use('/api', routes);

// Global error handling middleware
app.use(errorMiddleware);

// Module ko export kar rahe hain taaki server.js ise use kar sake
module.exports = app;