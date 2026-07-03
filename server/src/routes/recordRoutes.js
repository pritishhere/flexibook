const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const recordController = require('../controllers/recordController');

// 🌐 POST /api/records/upload - Upload a medical record file
// This is protected by JWT authentication and parses a file uploaded under the field name 'file'
router.post('/upload', protect, upload.single('file'), recordController.uploadRecord);

// 🌐 GET /api/records/my-records - Fetch logged-in patient's medical records
router.get('/my-records', protect, recordController.getPatientRecords);

// 🌐 DELETE /api/records/:id - Delete a specific medical record
router.delete('/:id', protect, recordController.deleteRecord);

module.exports = router;