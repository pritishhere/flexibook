const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_super_secret_key';
// Import the user controller we just created
const userController = require('../controllers/userController');

// Import authentication restrictions
const { protect, authorize } = require('../middleware/authMiddleware');

// Endpoint architectural mappings
router.get('/profile', protect, userController.getUserProfile);
router.put('/update', protect, userController.updateUserProfile);

// Admin-only route map parameters
router.get('/all', protect, authorize('admin'), userController.getAllUsers);
// ==========================================
// 1. User Registration (Signup)
// ==========================================
// @route   POST /api/users/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        // Check if the user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Email is already registered' });
        }

        // Hash the password for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user instance
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
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

// ==========================================
// 2. User Login (Sign-In with JWT Generation)
// ==========================================
// @route   POST /api/users/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Compare entered password with hashed password in database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate a JWT Token valid for 30 days
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
// 3. Get User Profile (With Appointments Populated)
// ==========================================
// @route   GET /api/users/profile/:id
router.get('/profile/:id', async (req, res) => {
    try {
        // Find user, strip out password field, and pull complete metadata from referenced appointments
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

module.exports = router;