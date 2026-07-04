const MedicalRecord = require('../models/MedicalRecord');

// ==========================================
// 1. Create / Save a New Medical Record
// ==========================================
exports.uploadRecord = async (req, res) => {
    try {
        const { hospitalId, doctorId, title, recordType, recordDate } = req.body;
        const userId = req.user.id; // Pulled securely from the JWT token session

        // Ensure a file path actually exists from the upload middleware
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please attach a file.' });
        }

        /* 💡 PRO ARCHITECTURE STEP:
           By default, req.file.path points to your local 'uploads/' folder.
           If you link AWS S3 or Cloudinary, you would upload the local file here 
           and replace `fileUrl` with your cloud download string link.
        */
        const fileUrl = req.file.path; 

        // Create database document instance
        const newRecord = new MedicalRecord({
            userId,
            hospitalId,
            doctorId: doctorId || null, // Optional if booking a general lab test
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
};

// ==========================================
// 2. Fetch All Records for a Specific Patient
// ==========================================
exports.getPatientRecords = async (req, res) => {
    try {
        const { type } = req.query; // Optional filter capability (e.g., ?type=prescription)
        const userId = req.user.id;

        // Base query parameters to isolate the patient's data safely
        let query = { userId };
        if (type) {
            query.recordType = type;
        }

        // Fetch files and populate basic hospital and doctor metadata strings
        const records = await MedicalRecord.find(query)
            .populate('hospitalId', 'name')
            .populate('doctorId', 'name specialization')
            .sort({ recordDate: -1 }); // Newest logs first

        res.status(200).json({
            success: true,
            count: records.length,
            data: records
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. Delete an Existing Medical Record
// ==========================================
exports.deleteRecord = async (req, res) => {
    try {
        const record = await MedicalRecord.findById(req.params.id);

        if (!record) {
            return res.status(404).json({ success: false, message: 'Medical record not found.' });
        }

        // Access Control Guard: Ensure only the original owner can drop the resource
        if (record.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized permission matrix mismatch.' });
        }

        /* 💡 PRO FILE CLEANUP:
           If storing files locally or on the cloud, you should use Node's `fs.unlink` 
           or your cloud SDK to delete the physical asset here before removing the DB document.
        */

        await record.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Medical record dropped successfully! 🗑️'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
