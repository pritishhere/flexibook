const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user'); // Ensure correct model path case
const jwt = require('jsonwebtoken'); 
const inMemoryDb = require('../utils/inMemoryDb');

// Import Booking and Complaint models to calculate all metrics dynamically
let Booking, Complaint;
try {
    Booking = require('../models/Booking');
} catch (e) {
    console.warn('Booking model not found at ../models/Booking. Ensure path is correct.');
}

try {
    Complaint = require('../models/Complaint');
} catch (e) {
    console.warn('Complaint model not found at ../models/Complaint. Ensure path is correct.');
}

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

// Helper function to emit Socket.io real-time update event
const notifyDashboardUpdate = (req) => {
    try {
        const io = req.app.get('io');
        if (io) {
            io.emit('master_dashboard:update');
        }
    } catch (err) {
        console.warn('Could not emit dashboard update event:', err.message);
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

            // 📢 Broadcast live socket update to Master Dashboard
            notifyDashboardUpdate(req);

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
                mobile: userMobile || null,
                businessName: businessName || '',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            inMemoryDb.users.push(newUser);

            // 📢 Broadcast live socket update to Master Dashboard
            notifyDashboardUpdate(req);

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
        let totalBookings = 0;
        let openComplaints = 0;

        if (inMemoryDb.isDbConnected()) {
            // 1. Count Total Users from MongoDB
            totalUsers = await User.countDocuments();

            // 2. Count Total Hospitals / Clinics (doctors, businesses, or hospitals)
            totalHospitals = await User.countDocuments({ 
                role: { $in: ['business', 'hospital', 'doctor'] } 
            });

            // 3. Count Total Bookings dynamically from Booking Model
            if (Booking) {
                totalBookings = await Booking.countDocuments();
            }

            // 4. Count Open Complaints dynamically from Complaint Model
            if (Complaint) {
                openComplaints = await Complaint.countDocuments({
                    status: { $in: ['open', 'Pending', 'In Progress', 'Unresolved'] }
                });
            }
        } else {
            // Count from In-Memory DB
            totalUsers = inMemoryDb.users ? inMemoryDb.users.length : 0;
            totalHospitals = inMemoryDb.users ? inMemoryDb.users.filter(u => ['business', 'hospital', 'doctor'].includes(u.role)).length : 0;
            totalBookings = inMemoryDb.bookings ? inMemoryDb.bookings.length : 0;
            openComplaints = inMemoryDb.complaints ? inMemoryDb.complaints.filter(c => ['open', 'Pending'].includes(c.status)).length : 0;
        }

        return res.status(200).json({
            success: true,
            totalUsers,
            totalHospitals,
            totalBookings,
            openComplaints
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

// @desc    Get all registered users across all categories
// @route   GET /api/auth/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        let users = [];

        if (inMemoryDb.isDbConnected()) {
            users = await User.find().select('-password').sort({ createdAt: -1 });
        } else {
            users = inMemoryDb.users ? inMemoryDb.users.map(({ password, ...u }) => u) : [];
        }

        return res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ message: 'Failed to fetch users list', error: error.message });
    }
};

// @desc    Update user role dynamically
// @route   PATCH /api/auth/update-role
// @access  Private (Admin)
exports.updateUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;

        if (!userId || !role) {
            return res.status(400).json({ message: 'User ID and role are required' });
        }

        if (inMemoryDb.isDbConnected()) {
            await User.findByIdAndUpdate(userId, { role });
        } else {
            const user = inMemoryDb.users.find(u => String(u._id) === String(userId));
            if (user) {
                user.role = role;
            }
        }

        // 📢 Broadcast live socket update to Master Dashboard
        notifyDashboardUpdate(req);

        return res.status(200).json({ message: 'Role updated successfully' });
    } catch (error) {
        console.error('Error updating role:', error);
        return res.status(500).json({ message: 'Failed to update role', error: error.message });
    }
};

// @desc    Delete a user account
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (inMemoryDb.isDbConnected()) {
            await User.findByIdAndDelete(id);
        } else {
            inMemoryDb.users = inMemoryDb.users.filter(u => String(u._id) !== String(id));
        }

        // 📢 Broadcast live socket update to Master Dashboard
        notifyDashboardUpdate(req);

        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
};