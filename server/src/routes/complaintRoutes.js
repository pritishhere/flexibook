const express = require('express');
const router = express.Router();
const {
    createComplaint,
    getMyComplaints,
    getAllComplaints,
    updateComplaintStatus
} = require('../controllers/complaintController');

// Import authentication and role authorization middleware guards
const { protect, authorize } = require('../middleware/authMiddleware');

// 🌐 POST /api/complaints - Submit a complaint (Patient)
router.post('/', protect, createComplaint);

// 🌐 GET /api/complaints/my - View complaints submitted by the logged-in user (Patient)
router.get('/my', protect, getMyComplaints);

// 🌐 GET /api/complaints - View all submitted complaints (Admin)
router.get('/', protect, authorize('admin'), getAllComplaints);

// 🌐 PUT /api/complaints/:id/status - Update the status of a complaint (Admin)
router.put('/:id/status', protect, authorize('admin'), updateComplaintStatus);

module.exports = router;
