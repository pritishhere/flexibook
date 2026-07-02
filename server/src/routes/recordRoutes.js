const express = require('express');
const router = express.Router();

// 1. Import the Upload Middleware and the Record Controller
const uploadMiddleware = require('../middleware/uploadMiddleware');
const recordController = require('../controllers/recordController');

// 2. Define the route for uploading records (Endpoint: POST /api/records/upload)
// 'uploadMiddleware.single("document")' expects a single file sent with the field name 'document'
router.post(
    '/upload', 
    uploadMiddleware.single('document'), // Middleware validates and stores the file first
    recordController.uploadRecord        // Controller handles the database saving logic
);

module.exports = router;