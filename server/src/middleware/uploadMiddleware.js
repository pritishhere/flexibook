const multer = require('multer');
const path = require('path');

// ==========================================
// 1. Storage Configuration
// ==========================================
// We use diskStorage to store the file temporarily before sending it to a cloud provider (like S3/Cloudinary).
// If you choose to process uploads completely in memory, use: multer.memoryStorage()
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Defines the directory folder where files will be saved
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        // Appends a unique timestamp hash to prevent filename collisions
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// ==========================================
// 2. File Filter (Validation Guard)
// ==========================================
/**
 * Restricts uploads to ensure users only submit valid medical document types.
 */
const fileFilter = (req, file, cb) => {
    // Allowed file extensions
    const allowedFileTypes = /jpeg|jpg|png|pdf|doc|docx/;
    
    // Check both extension name and mimetype format
    const extName = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedFileTypes.test(file.mimetype);

    if (extName && mimeType) {
        return cb(null, true);
    } else {
        cb(new Error('Only medical files are allowed (.jpeg, .jpg, .png, .pdf, .doc, .docx)'), false);
    }
};

// ==========================================
// 3. Multer Instance Initialization
// ==========================================
const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 10 * 1024 * 1024 // 10MB Maximum file size limit execution parameter
    },
    fileFilter: fileFilter
});

module.exports = upload;