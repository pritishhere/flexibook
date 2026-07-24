const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken'); 
const inMemoryDb = require('../utils/inMemoryDb');

const syncUserToMemory = (user) => {
    if (!user) return;

    const normalizedUser = {
        _id: String(user._id || user.id),
        id: String(user._id || user.id),
        name: user.name,
        email: user.email,
        role: user.role || 'patient',
        password: user.password,
        mobile: user.mobile || user.phone || null,
        businessName: user.businessName || ''
    };

    const existingIndex = inMemoryDb.users.findIndex((entry) => String(entry._id) === normalizedUser._id);
    if (existingIndex >= 0) {
        inMemoryDb.users[existingIndex] = normalizedUser;
    } else {
        inMemoryDb.users.push(normalizedUser);
    }
};

// Helper function to generate a JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'your_fallback_super_secret_key', {
        expiresIn: '30d', 
    });
};

// @desc    Register a new user (Patient or Business)
exports.registerUser = async (req, res) => {
    try {
        let { name, email, password, role, mobile, phone, businessName, businessPhone, businessEmail } = req.body;
        const shouldUseDatabase = inMemoryDb.isDbConnected();

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Validation failed: Name, email, and password are required' });
        }

        email = (email || '').trim().toLowerCase();
        const userMobile = (mobile || phone || '').trim();

        const userData = {
            name: (name || '').trim(),
            email,
            password,
            role: role || 'patient'
        };

        if (businessName) {
            userData.businessName = (businessName || '').trim();
        }

        if (userMobile) {
            userData.mobile = userMobile;
            userData.phone = userMobile;
        }

        if (businessPhone) {
            userData.mobile = (businessPhone || '').trim();
            userData.phone = (businessPhone || '').trim();
        }

        if (businessEmail) {
            userData.email = (businessEmail || '').trim().toLowerCase();
            email = userData.email;
        }

        if (shouldUseDatabase) {
            // 1. Check if user already exists in DB
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ message: 'User already exists with this email address' });
            }

            // 2. Create the new user
            const user = await User.create(userData);
            syncUserToMemory(user);
            if (user) {
                return res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    mobile: user.mobile || user.phone || null,
                    businessName: user.businessName || '',
                    token: generateToken(user._id)
                });
            }
        } else {
            // In-Memory Fallback
            const userExists = inMemoryDb.users.find(u => u.email.toLowerCase() === email);
            if (userExists) {
                return res.status(400).json({ message: 'User already exists with this email address' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = {
                _id: new mongoose.Types.ObjectId().toString(),
                name: name.trim(),
                email,
                password: hashedPassword,
                role: role || 'patient',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            inMemoryDb.users.push(newUser);

            return res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                mobile: newUser.mobile || newUser.phone || null,
                businessName: newUser.businessName || '',
                token: generateToken(newUser._id)
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'User already exists with this email or phone number.' });
        }
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};

// @desc    Login existing user
exports.loginUser = async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        email = (email || '').trim().toLowerCase();

        let user = null;

        if (inMemoryDb.isDbConnected()) {
            user = await User.findOne({ email });
        } else {
            user = inMemoryDb.users.find((entry) => (entry.email || '').toLowerCase() === email);
        }

        if (user && (await bcrypt.compare(password, user.password))) {
            if (user._id && user.email) {
                syncUserToMemory(user);
            }
            return res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                mobile: user.mobile || user.phone || null,
                businessName: user.businessName || '',
                token: generateToken(user._id)
            });
        }

        return res.status(401).json({ message: 'Invalid email or password' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

// @desc    Get dashboard metrics for Master/Admin Dashboard
// @route   GET /api/auth/admin-stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res) => {
    try {
        let totalUsers = 0;
        let totalHospitals = 0;

        if (inMemoryDb.isDbConnected()) {
            // Count from MongoDB Database
            totalUsers = await User.countDocuments();
            totalHospitals = await User.countDocuments({ 
                role: { $in: ['business', 'hospital'] } 
            });
        } else {
            // Count from In-Memory DB
            totalUsers = inMemoryDb.users.length;
            totalHospitals = inMemoryDb.users.filter(u => ['business', 'hospital'].includes(u.role)).length;
        }

        return res.status(200).json({
            success: true,
            totalUsers,
            totalHospitals,
            totalBookings: 0,
            openComplaints: 0
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching admin statistics',
            error: error.message
        });
    }
};