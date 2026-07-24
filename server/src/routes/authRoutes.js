const express = require('express');
const router = express.Router();

// Import logic functions from the auth controller
const { 
  registerUser, 
  loginUser, 
  getAdminStats,
  getAllUsers,
  updateUserRole,
  deleteUser
} = require('../controllers/authController');

// 🌐 POST /api/auth/signup & /api/auth/register - Creates a new user
router.post('/signup', registerUser);
router.post('/register', registerUser);

// 🌐 POST /api/auth/login - Logs in an existing user
router.post('/login', loginUser);

// 🌐 GET /api/auth/admin-stats - Fetches user and hospital metrics for the admin panel
router.get('/admin-stats', getAdminStats);

// 👥 GET /api/auth/users - Fetches all registered users for user management table
router.get('/users', getAllUsers);

// 🔄 PATCH /api/auth/update-role - Updates a user's role dynamically
router.patch('/update-role', updateUserRole);

// 🗑️ DELETE /api/auth/users/:id - Permanently removes a user account
router.delete('/users/:id', deleteUser);

module.exports = router;