// Importing the Database Model
const MedicalRecord = require('../models/MedicalRecord');

// API Logic: Function to handle file uploads and save details to the database
const uploadRecord = async (req, res) => {
    try {
        // 1. Check if the file was successfully processed by the Multer middleware
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: "No file uploaded. Please select a PDF or Image file." 
            });
        }

        // 2. Extract remaining details from the request body (sent via form-data from frontend)
        const { userId, hospitalId, doctorId, title, recordType } = req.body;

        // 3. Format the secure file URL (Path) to be saved in the database
        // req.file.path will look like: "uploads/medical_records/file-123.pdf"
        // We replace backslashes with forward slashes for Windows/Mac/Linux cross-compatibility
        const secureFileUrl = req.file.path.replace(/\\/g, "/");

        // 4. Create a new document instance for the database
        const newRecord = new MedicalRecord({
            userId,
            hospitalId,
            doctorId,
            title,
            recordType,
            fileUrl: secureFileUrl // 🔥 Pro Feature: Storing the actual file path
        });

        // 5. Save the document to the database
        await newRecord.save();

        // 6. Send a success response back to the frontend
        res.status(201).json({
            success: true,
            message: "Medical record uploaded and saved successfully! 🚀",
            data: newRecord
        });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error during upload.", 
            error: error.message 
        });
    }
};

module.exports = { uploadRecord };