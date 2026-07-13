const express = require('express');
const router = express.Router();
const { 
  submitComplaint, 
  getAllComplaints, 
  updateComplaintStatus 
} = require('../controllers/complaintControllers');

// User submission endpoint
router.post('/submit', submitComplaint);

// Admin dashboard endpoints
router.get('/admin/all', getAllComplaints);
router.patch('/admin/status/:id', updateComplaintStatus);

module.exports = router;