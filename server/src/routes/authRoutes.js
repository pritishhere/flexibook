const express = require('express');
const router = express.Router();

// Import logic functions from the auth controller (including getAdminStats)
const { registerUser, loginUser, getAdminStats } = require('../controllers/authController');

// 🌐 POST /api/auth/signup & /api/auth/register - Creates a new user
router.post('/signup', registerUser);
router.post('/register', registerUser);

// 🌐 POST /api/auth/login - Logs in an existing user
router.post('/login', loginUser);

// 🌐 GET /api/auth/admin-stats - Fetches user and hospital metrics for the admin panel
router.get('/admin-stats', getAdminStats);

module.exports = router;