const mongoose = require('mongoose');
const User = require('../models/user');
const FamilyMember = require('../models/FamilyMember');
const Appointment = require('../models/Appointment');
const Complaint = require('../models/Complaint');
const inMemoryDb = require('../utils/inMemoryDb');

// ==========================================
// 1. Get Logged-In User Profile Data
// ==========================================
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        let user;
        if (inMemoryDb.isDbConnected()) {
            user = await User.findById(userId)
                .select('-password')
                .populate({
                    path: 'appointments',
                    options: { sort: { appointmentDate: -1 } },
                    populate: [
                        { path: 'hospitalId', select: 'name address' },
                        { path: 'doctorId', select: 'name specialization' }
                    ]
                });
        } else {
            const memUser = inMemoryDb.users.find(u => String(u._id) === String(userId));
            if (memUser) {
                user = { ...memUser };
                delete user.password;
            }
        }

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

        if (inMemoryDb.isDbConnected()) {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User profile not found.' });
            }

            if (name) user.name = name.trim();
            if (phone) user.phone = phone.trim();
            if (password) user.password = password; // Triggers Mongoose pre-save hashing

            const updatedUser = await user.save();
            const userResponse = updatedUser.toObject();
            delete userResponse.password;

            return res.status(200).json({
                success: true,
                message: 'Profile configuration updated successfully! 🎉',
                data: userResponse
            });
        } else {
            const index = inMemoryDb.users.findIndex(u => String(u._id) === String(userId));
            if (index === -1) {
                return res.status(404).json({ success: false, message: 'User profile not found.' });
            }

            if (name) inMemoryDb.users[index].name = name.trim();
            if (phone) inMemoryDb.users[index].phone = phone.trim();
            if (password) inMemoryDb.users[index].password = password;

            const userResponse = { ...inMemoryDb.users[index] };
            delete userResponse.password;

            return res.status(200).json({
                success: true,
                message: 'Profile configuration updated successfully! 🎉',
                data: userResponse
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. Add Family Member
// ==========================================
exports.addFamilyMember = async (req, res) => {
    try {
        const { name, relationship, relationToUser, age, gender, bloodGroup, phone } = req.body;
        const userId = req.user._id || req.user.id;
        const relation = (relationToUser || relationship || '').trim();
        const memberAge = Number(age);

        if (!name?.trim() || !relation || !Number.isInteger(memberAge) || memberAge < 0 || memberAge > 120) {
            return res.status(400).json({
                success: false,
                message: 'Name, relationship, and a valid age are required.'
            });
        }

        if (!['male', 'female', 'other'].includes(gender)) {
            return res.status(400).json({ success: false, message: 'Please select a valid gender.' });
        }

        const memberData = {
            userId: String(userId),
            name: name.trim(),
            relationToUser: relation,
            age: memberAge,
            gender,
            bloodGroup: bloodGroup?.trim() || 'Unknown',
            phone: phone?.trim() || ''
        };

        let member;
        if (inMemoryDb.isDbConnected()) {
            member = await FamilyMember.create(memberData);
        } else {
            member = {
                _id: new mongoose.Types.ObjectId().toString(),
                ...memberData,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            inMemoryDb.familyMembers.push(member);
        }

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
        const userId = String(req.user._id || req.user.id);
        const members = inMemoryDb.isDbConnected()
            ? await FamilyMember.find({ userId }).sort({ createdAt: -1 })
            : inMemoryDb.familyMembers
                .filter(member => String(member.userId) === userId)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
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
        let users = [];
        if (inMemoryDb.isDbConnected()) {
            users = await User.find({}).select('-password').sort({ name: 1 });
        } else {
            users = inMemoryDb.users.map(u => {
                const userObj = { ...u };
                delete userObj.password;
                return userObj;
            });
        }

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================================
// 6. Master Dashboard: Get Overall Platform Analytics
// ==========================================================
exports.getDashboardStats = async (req, res) => {
    try {
        let totalUsers = 0;
        let totalAppointments = 0;
        let pendingComplaints = 0;

        if (inMemoryDb.isDbConnected()) {
            totalUsers = await User.countDocuments();
            totalAppointments = await Appointment.countDocuments();
            pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
        } else {
            totalUsers = inMemoryDb.users.length;
            totalAppointments = (inMemoryDb.appointments || []).length;
            pendingComplaints = (inMemoryDb.complaints || []).filter(c => c.status === 'pending').length;
        }

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalAppointments,
                pendingComplaints
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================================
// 7. Master Dashboard: Modify User Account Role
// ==========================================================
exports.updateUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;

        // Cleaned valid roles list (superadmin removed)
        const validRoles = ['patient', 'doctor', 'business', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role provided.' });
        }

        let updatedUser;
        if (inMemoryDb.isDbConnected()) {
            updatedUser = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');
        } else {
            const userIndex = inMemoryDb.users.findIndex(u => String(u._id) === String(userId));
            if (userIndex !== -1) {
                inMemoryDb.users[userIndex].role = role;
                updatedUser = { ...inMemoryDb.users[userIndex] };
                delete updatedUser.password;
            }
        }

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'Target user not found.' });
        }

        // Broadcast real-time Socket.IO event if available
        const io = req.app.get('io');
        if (io) {
            io.emit('master_dashboard:update', {
                type: 'ROLE_UPDATED',
                user: updatedUser
            });
        }

        res.status(200).json({
            success: true,
            message: `User role updated to '${role}' successfully!`,
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================================
// 8. Master Dashboard: Get All Complaints
// ==========================================================
exports.getAllComplaints = async (req, res) => {
    try {
        let complaints = [];
        if (inMemoryDb.isDbConnected()) {
            complaints = await Complaint.find()
                .populate('userId', 'name email')
                .sort({ createdAt: -1 });
        } else {
            complaints = inMemoryDb.complaints || [];
        }

        res.status(200).json({
            success: true,
            count: complaints.length,
            data: complaints
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};