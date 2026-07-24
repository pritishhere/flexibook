const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const inMemoryDb = require('../utils/inMemoryDb');

// Helper function to emit Socket updates to connected clients/dashboards
const notifyDashboardUpdate = (req) => {
    try {
        const io = req.app.get('io');
        if (io) {
            io.emit('master_dashboard:update');
        }
    } catch (err) {
        console.warn('Socket emit error:', err.message);
    }
};

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

        let newComplaint;

        if (inMemoryDb.isDbConnected()) {
            newComplaint = await Complaint.create({
                userId,
                hospitalId,
                subject,
                description,
                status: 'pending'
            });
        } else {
            newComplaint = {
                _id: new mongoose.Types.ObjectId().toString(),
                userId: userId.toString(),
                hospitalId: hospitalId.toString(),
                subject,
                description,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            inMemoryDb.complaints = inMemoryDb.complaints || [];
            inMemoryDb.complaints.unshift(newComplaint);
        }

        // ⚡ Emit Socket event to auto-refresh live dashboard metrics
        notifyDashboardUpdate(req);

        return res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully',
            data: newComplaint
        });
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
            const userComplaints = (inMemoryDb.complaints || []).filter(c => c.userId === userId.toString());
            const populated = userComplaints.map(c => {
                const hospital = (inMemoryDb.hospitals || []).find(h => String(h._id) === String(c.hospitalId));
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
        let complaints = [];

        if (inMemoryDb.isDbConnected()) {
            complaints = await Complaint.find()
                .populate('userId', 'name email')
                .populate('hospitalId', 'name city')
                .sort({ createdAt: -1 });
        } else {
            complaints = (inMemoryDb.complaints || []).map(c => {
                const user = (inMemoryDb.users || []).find(u => String(u._id) === String(c.userId));
                const hospital = (inMemoryDb.hospitals || []).find(h => String(h._id) === String(c.hospitalId));
                return {
                    ...c,
                    userId: user ? { _id: user._id, name: user.name, email: user.email } : c.userId,
                    hospitalId: hospital ? { _id: hospital._id, name: hospital.name, city: hospital.city } : c.hospitalId
                };
            }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        // Calculate metrics dynamically
        const metrics = {
            totalTickets: complaints.length,
            pendingAction: complaints.filter(c => ['pending', 'Pending', 'open', 'Unresolved'].includes(c.status)).length,
            inProgress: complaints.filter(c => ['in-progress', 'In Progress'].includes(c.status)).length,
            resolved: complaints.filter(c => ['resolved', 'Resolved', 'Closed'].includes(c.status)).length
        };

        return res.status(200).json({
            success: true,
            count: complaints.length,
            metrics,
            data: complaints,
            complaints // Key fallback for frontend compatibility
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve all complaints',
            error: error.message
        });
    }
};

// @desc    Update complaint ticket status
// @route   PATCH or PUT /api/complaints/:id/status
// @access  Private (Admin)
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Standardize status input casing/formatting
        const normalizedStatus = (status || '').toLowerCase();
        const validStatuses = ['pending', 'in-progress', 'resolved', 'open', 'closed'];

        if (!status || !validStatuses.includes(normalizedStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Valid status parameter is required (pending, in-progress, resolved).'
            });
        }

        let updatedComplaint;

        if (inMemoryDb.isDbConnected()) {
            updatedComplaint = await Complaint.findByIdAndUpdate(
                id,
                { status: normalizedStatus },
                { new: true }
            );

            if (!updatedComplaint) {
                return res.status(404).json({
                    success: false,
                    message: 'Complaint ticket not found'
                });
            }
        } else {
            const index = (inMemoryDb.complaints || []).findIndex(c => String(c._id) === String(id));
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Complaint ticket not found'
                });
            }

            inMemoryDb.complaints[index].status = normalizedStatus;
            inMemoryDb.complaints[index].updatedAt = new Date();
            updatedComplaint = inMemoryDb.complaints[index];
        }

        // ⚡ Trigger real-time sync for status updates
        notifyDashboardUpdate(req);

        return res.status(200).json({
            success: true,
            message: 'Complaint status updated successfully',
            data: updatedComplaint
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update complaint status',
            error: error.message
        });
    }
};