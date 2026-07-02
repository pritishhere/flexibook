const User = require('../models/User');

// ==========================================
// 1. Get Logged-In User Profile Data
// ==========================================
exports.getUserProfile = async (req, res) => {
    try {
        // Find user by ID stored in the verified JWT token (req.user is set by authMiddleware)
        // Omit the password hash and populate full appointment meta histories
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate({
                path: 'appointments',
                options: { sort: { appointmentDate: -1 } }, // Newest bookings first
                populate: [
                    { path: 'hospitalId', select: 'name address' },
                    { path: 'doctorId', select: 'name specialization' }
                ]
            });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User profile not found.' });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 2. Update User Profile Settings
// ==========================================
exports.updateUserProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;

        // Ensure update parameters are valid strings
        if (!name && !phone) {
            return res.status(400).json({ success: false, message: 'Please provide metadata fields to update.' });
        }

        // Object containing changes to apply
        const updates = {};
        if (name) updates.name = name.trim();
        if (phone) updates.phone = phone.trim();

        // Update the document directly
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true } // Returns the newly modified object and applies model regex validation rules
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User profile not found.' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile configuration updated successfully! 🎉',
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. Get Complete User Directory (Admin Only)
// ==========================================
exports.getAllUsers = async (req, res) => {
    try {
        // Fetch all profiles across the schema (excl. passwords) sorted alphabetically
        const users = await User.find({}).select('-password').sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};