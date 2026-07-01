const multer = require('multer');
const path = require('path');

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
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

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
