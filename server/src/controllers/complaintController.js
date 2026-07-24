const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const inMemoryDb = require('../utils/inMemoryDb');

// @desc    File a new complaint
// @route   POST /api/complaints
// @access  Private (Patient)
exports.createComplaint = async (req, res) => {
    try {
        const { hospitalId, subject, description } = req.body;
        const userId = req.user.id;

        if (!hospitalId || !subject || !description) {
            return res.status(400).json({
                success: false,
                message: 'Hospital ID, subject, and description are required fields.'
            });
        }

        if (inMemoryDb.isDbConnected()) {
            const newComplaint = await Complaint.create({
                userId,
                hospitalId,
                subject,
                description
            });

            return res.status(201).json({
                success: true,
                message: 'Complaint submitted successfully (MongoDB)',
                data: newComplaint
            });
        } else {
            const newComplaint = {
                _id: new mongoose.Types.ObjectId().toString(),
                userId: userId.toString(),
                hospitalId: hospitalId.toString(),
                subject,
                description,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            inMemoryDb.complaints.push(newComplaint);

            return res.status(201).json({
                success: true,
                message: 'Complaint submitted successfully (In-Memory Fallback)',
                data: newComplaint
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to submit complaint',
            error: error.message
        });
    }
};

// @desc    Get logged-in patient's complaints
// @route   GET /api/complaints/my
// @access  Private (Patient)
exports.getMyComplaints = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        if (inMemoryDb.isDbConnected()) {
            const complaints = await Complaint.find({
                $or: [{ userId: userId }, { userId: String(userId) }]
            })
                .populate('hospitalId', 'name city')
                .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                count: complaints.length,
                data: complaints
            });
        } else {
            const userComplaints = inMemoryDb.complaints.filter(c => 
                String(c.userId) === String(userId) || String(c.userId) === String(req.user.id)
            );
            const populated = userComplaints.map(c => {
                const hospital = inMemoryDb.hospitals.find(h => String(h._id) === String(c.hospitalId));
                return {
                    ...c,
                    hospitalId: hospital ? { _id: hospital._id, name: hospital.name, city: hospital.city } : c.hospitalId
                };
            }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            return res.status(200).json({
                success: true,
                count: populated.length,
                data: populated
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve your complaints',
            error: error.message
        });
    }
};

// @desc    Get all complaints (Admin)
// @route   GET /api/complaints
// @access  Private (Admin)
exports.getAllComplaints = async (req, res) => {
    try {
        if (inMemoryDb.isDbConnected()) {
            const complaints = await Complaint.find()
                .populate('userId', 'name email')
                .populate('hospitalId', 'name city')
                .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                count: complaints.length,
                data: complaints
            });
        } else {
            const populated = inMemoryDb.complaints.map(c => {
                const user = inMemoryDb.users.find(u => String(u._id) === String(c.userId));
                const hospital = inMemoryDb.hospitals.find(h => String(h._id) === String(c.hospitalId));
                return {
                    ...c,
                    userId: user ? { _id: user._id, name: user.name, email: user.email } : c.userId,
                    hospitalId: hospital ? { _id: hospital._id, name: hospital.name, city: hospital.city } : c.hospitalId
                };
            }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            return res.status(200).json({
                success: true,
                count: populated.length,
                data: populated
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve all complaints',
            error: error.message
        });
    }
};

// @desc    Update complaint ticket status
// @route   PUT /api/complaints/:id/status
// @access  Private (Admin)
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['pending', 'in-progress', 'resolved'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid status parameter is required (pending, in-progress, resolved).'
            });
        }

        let updatedTicket = null;

        if (inMemoryDb.isDbConnected()) {
            updatedTicket = await Complaint.findByIdAndUpdate(
                id,
                { status },
                { new: true }
            ).populate('userId', 'name email').populate('hospitalId', 'name city');
        } else {
            const index = inMemoryDb.complaints.findIndex(c => String(c._id) === String(id));
            if (index !== -1) {
                inMemoryDb.complaints[index].status = status;
                inMemoryDb.complaints[index].updatedAt = new Date();
                updatedTicket = inMemoryDb.complaints[index];
            }
        }

        if (!updatedTicket) {
            return res.status(404).json({
                success: false,
                message: 'Complaint ticket not found'
            });
        }

        // Emit real-time WebSocket event so Customer UI updates instantly
        try {
            const { getIO } = require('../config/socket');
            const io = getIO();
            if (io) {
                io.emit('complaint_updated', { ticketId: id, status, updatedTicket });
                io.emit('master_dashboard:update', { type: 'COMPLAINT_UPDATED' });
            }
        } catch (socketErr) {}

        return res.status(200).json({
            success: true,
            message: 'Complaint status updated successfully',
            data: updatedTicket
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update complaint status',
            error: error.message
        });
    }
};
