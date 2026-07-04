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
        const userId = req.user.id;

        if (inMemoryDb.isDbConnected()) {
            const complaints = await Complaint.find({ userId })
                .populate('hospitalId', 'name city')
                .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                count: complaints.length,
                data: complaints
            });
        } else {
            const userComplaints = inMemoryDb.complaints.filter(c => c.userId === userId.toString());
            const populated = userComplaints.map(c => {
                const hospital = inMemoryDb.hospitals.find(h => h._id === c.hospitalId);
                return {
                    ...c,
                    hospitalId: hospital ? { _id: hospital._id, name: hospital.name, city: hospital.city } : c.hospitalId
                };
            }).sort((a, b) => b.createdAt - a.createdAt);

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
                const user = inMemoryDb.users.find(u => u._id === c.userId);
                const hospital = inMemoryDb.hospitals.find(h => h._id === c.hospitalId);
                return {
                    ...c,
                    userId: user ? { _id: user._id, name: user.name, email: user.email } : c.userId,
                    hospitalId: hospital ? { _id: hospital._id, name: hospital.name, city: hospital.city } : c.hospitalId
                };
            }).sort((a, b) => b.createdAt - a.createdAt);

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

        if (inMemoryDb.isDbConnected()) {
            const complaint = await Complaint.findByIdAndUpdate(
                id,
                { status },
                { new: true }
            );

            if (!complaint) {
                return res.status(404).json({
                    success: false,
                    message: 'Complaint ticket not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Complaint status updated successfully (MongoDB)',
                data: complaint
            });
        } else {
            const index = inMemoryDb.complaints.findIndex(c => c._id === id);
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Complaint ticket not found'
                });
            }

            inMemoryDb.complaints[index].status = status;
            inMemoryDb.complaints[index].updatedAt = new Date();

            return res.status(200).json({
                success: true,
                message: 'Complaint status updated successfully (In-Memory Fallback)',
                data: inMemoryDb.complaints[index]
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update complaint status',
            error: error.message
        });
    }
};
