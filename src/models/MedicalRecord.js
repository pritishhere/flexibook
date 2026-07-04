const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
    // Owner of the medical record
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // The hospital that generated this record
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },
    // Doctor who prescribed or reviewed it
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    title: {
        type: String,
        required: [true, 'Document title is required'],
        trim: true // e.g., "Blood Test Report", "Viral Fever Prescription"
    },
    recordType: {
        type: String,
        enum: ['prescription', 'lab-report', 'x-ray', 'scan', 'other'],
        required: true
    },
    // 🔥 PRO FEATURE: Secure cloud link for the PDF/Image file
    fileUrl: {
        type: String,
        required: [true, 'File URL is required']
    },
    recordDate: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);