const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('./config/prisma'); // Aapki existing prisma config file

const app = express();

// JSON parsing middleware
app.use(express.json());

// ==========================================
// 🔐 AUTHENTICATION MODULE: SIGNUP API
// ==========================================
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are mandatory." 
      });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: "This email is already registered." 
      });
    }

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

    res.status(201).json({ 
      success: true, 
      message: "User registered successfully!", 
      data: newUser 
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