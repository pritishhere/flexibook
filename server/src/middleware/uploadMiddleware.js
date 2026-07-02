const multer = require('multer');
const path = require('path');

<<<<<<< HEAD
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
=======
// 1. STORAGE CONFIGURATION (File kahan aur kis naam se save hogi)
const storage = multer.diskStorage({
    // Destination set karta hai ki file kis folder mein jayegi
    destination: function (req, file, cb) {
        cb(null, 'uploads/medical_records/'); 
    },
    
    // Filename set karta hai ki file ka naya naam kya hoga
    filename: function (req, file, cb) {
        // Ek hi naam ki 2 files crash na karein, isliye hum time (Date.now) add karte hain
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Naya naam = originalFieldname-123456789.pdf
>>>>>>> main
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

<<<<<<< HEAD
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
=======
// 2. FILE FILTER (Security Check: Sirf PDF aur Images allow hongi)
const fileFilter = (req, file, cb) => {
    // Allowed extensions (Regular Expression)
    const allowedTypes = /jpeg|jpg|png|pdf/;
    
    // Check extension
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime type (Security ke liye taaki koi rename karke fake PDF na daale)
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true); // Guard ne bola: "Theek hai, aage jao!"
    } else {
        cb(new Error('Error: Sirf Images (jpeg/jpg/png) aur PDFs hi allow hain!')); // Guard ne rok liya
    }
};

// 3. UPLOAD INITIALIZATION (Sab kuch ek sath jodna)
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Max file size limit: 5MB set kiya hai
    fileFilter: fileFilter
});

// Is 'upload' module ko export kar rahe hain taaki isko routes mein use kar sakein
module.exports = upload;
>>>>>>> main
