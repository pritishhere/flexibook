const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const userController = require('../controllers/userController');
const { protect, authorize, adminOnly } = require('../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_super_secret_key';

// ==========================================
// 1. Authentication Endpoints
// ==========================================

// @route   POST /api/users/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Email is already registered' });
        }

        // Create new user instance (pre-save hook in user.js automatically hashes password)
        const newUser = new User({
            name,
            email,
            password,
            phone,
            role: role || 'patient'
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: 'User registered successfully! 🎉'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/users/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(200).json({
            success: true,
            message: 'Logged in successfully! 🚀',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 2. User Profile Management
// ==========================================

// Get authenticated user's own profile
router.get('/profile', protect, userController.getUserProfile);

// Update authenticated user's own profile
router.put('/update', protect, userController.updateUserProfile);

// Get a specific user profile by ID (with referenced appointment population)
router.get('/profile/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('appointments');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User profile not found' });
        }
        
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 3. Family Member Management
// ==========================================
router.route('/family')
    .post(protect, userController.addFamilyMember)
    .get(protect, userController.getFamilyMembers);

// ==========================================
// 4. Administrative & Master Dashboard Endpoints
// ==========================================

// @route   GET /api/users/all
// Gets complete user directory for Admin users
router.get('/all', protect, authorize('admin'), userController.getAllUsers);

// @route   GET /api/users/admin/stats
// Gets aggregated stats (Total Users, Total Appointments, Pending Complaints)
router.get('/admin/stats', protect, adminOnly, userController.getDashboardStats);

// @route   PATCH /api/users/admin/update-role
// Enables Admins to grant or revoke roles across the platform
router.patch('/admin/update-role', protect, adminOnly, userController.updateUserRole);

// @route   GET /api/users/admin/complaints
// Fetches system-wide complaints for master management
router.get('/admin/complaints', protect, adminOnly, userController.getAllComplaints);

module.exports = router;