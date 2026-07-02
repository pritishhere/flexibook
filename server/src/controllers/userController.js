const User = require('../models/user');
const FamilyMember = require('../models/FamilyMember');

// ==========================================
// 1. Get Logged-In User Profile Data
// ==========================================
exports.getUserProfile = async (req, res) => {
    try {
        // Find user by ID stored in the verified JWT token (req.user is set by authMiddleware)
        // Omit the password hash and populate full appointment meta histories
        const user = await User.findById(req.user._id || req.user.id)
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
        const { name, phone, password } = req.body;
        const userId = req.user._id || req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User profile not found.' });
        }

        // Apply string updates safely
        if (name) user.name = name.trim();
        if (phone) user.phone = phone.trim();
        if (password) user.password = password; // Trigger pre-save hashing

        const updatedUser = await user.save();
        
        // Hide password out of the response
        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            message: 'Profile configuration updated successfully! 🎉',
            data: userResponse
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. Add Family Member
// ==========================================
exports.addFamilyMember = async (req, res) => {
    const { name, relationship, age, gender } = req.body;
    try {
        const userId = req.user._id || req.user.id;
        const member = await FamilyMember.create({
            userId,
            name,
            relationship,
            age,
            gender,
        });
        res.status(201).json({ success: true, data: member });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 4. Get All Family Members for Logged-In User
// ==========================================
exports.getFamilyMembers = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const members = await FamilyMember.find({ userId });
        res.json({ success: true, data: members });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 5. Get Complete User Directory (Admin Only)
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