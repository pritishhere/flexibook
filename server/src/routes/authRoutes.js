const express = require('express');
const router = express.Router();

// Import the 'dimaag' (logic functions) from the auth controller
const { registerUser, loginUser } = require('../controllers/authController');

// 🌐 POST /api/auth/signup & /api/auth/register - Creates a new user
router.post('/signup', registerUser);
router.post('/register', registerUser);

// 🌐 POST /api/auth/login - Logs in an existing user
router.post('/login', loginUser);

module.exports = router;