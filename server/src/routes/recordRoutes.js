const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');
const MedicalRecord = require('../models/MedicalRecord');
// Import the controller we just created
const recordController = require('../controllers/recordController');

// Import authentication and file upload middleware guards
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Endpoint architectural mappings
// 'file' is the multipart/form-data field key your frontend must target
router.post('/upload', protect, upload.single('file'), recordController.uploadRecord);
router.get('/my-records', protect, recordController.getPatientRecords);
router.delete('/:id', protect, recordController.deleteRecord);
// ==========================================
// 1. Upload/Create a New Medical Record
// ==========================================
// @route   POST /api/records/upload
// @access  Private (Typically used by Patients uploading their own files or Doctors adding prescriptions)
router.post('/upload', protect, RecordController.upload);
router.get('/user/:userId', protect, authorize('patient', 'admin'), RecordController.getRecordsByPatient);
router.post('/upload', protect, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }

        // The processed file properties live inside req.file now!
        // Local path path: req.file.path
        
        /* 🚀 PRO ARCHITECTURE STEP:
           Take req.file.path and upload it to AWS S3 / Cloudinary here.
           Once you get back a secure cloud URL string, save that 'fileUrl' 
           to your Mongoose MedicalRecord model.
        */

        res.status(201).json({
            success: true,
            message: 'File processed and uploaded locally! 📂',
            fileInformation: {
                originalName: req.file.originalname,
                storagePath: req.file.path,
                size: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
router.post('/upload', async (req, res) => {
    try {
        const { userId, hospitalId, doctorId, title, recordType, fileUrl, recordDate } = req.body;

        // Basic validation for mandatory fields
        if (!userId || !hospitalId || !title || !recordType || !fileUrl) {
            return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
        }

        const newRecord = new MedicalRecord({
            userId,
            hospitalId,
            doctorId, // optional
            title,
            recordType,
            fileUrl,
            recordDate: recordDate || Date.now()
        });

        const savedRecord = await newRecord.save();

        res.status(201).json({
            success: true,
            message: 'Medical record added successfully! 📋',
            data: savedRecord
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 2. Fetch All Medical Records for a Specific Patient
// ==========================================
// @route   GET /api/records/user/:userId
// @access  Private
router.get('/user/:userId', async (req, res) => {
    try {
        const { type } = req.query; // Optional query parameter to filter by type (e.g., ?type=prescription)
        
        let query = { userId: req.params.userId };
        if (type) {
            query.recordType = type;
        }

        const records = await MedicalRecord.find(query)
            .populate('hospitalId', 'name')
            .populate('doctorId', 'name specialization')
            .sort({ recordDate: -1 }); // Get the newest health records first

        res.status(200).json({
            success: true,
            count: records.length,
            data: records
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 3. Delete a Medical Record
// ==========================================
// @route   DELETE /api/records/:id
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const record = await MedicalRecord.findById(req.params.id);

        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found.' });
        }

        await record.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Medical record deleted successfully! 🗑️'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;