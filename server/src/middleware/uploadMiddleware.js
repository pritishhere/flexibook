const multer = require('multer');
const path = require('path');

// 1. Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 2. File Filter (Validation Guard)
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extName = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedFileTypes.test(file.mimetype);

    if (extName && mimeType) {
        return cb(null, true);
    } else {
        cb(new Error('Only medical files are allowed (.jpeg, .jpg, .png, .pdf, .doc, .docx)'), false);
    }
};

// 3. Multer Instance Initialization
const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 10 * 1024 * 1024 // 10MB file limit
    },
    fileFilter: fileFilter
});

module.exports = upload;
