const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Service name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Service price is required']
    },
    duration: {
        type: Number, // Estimated time in minutes (e.g., 30 for a test)
        default: 0
    },
    // 🔥 MAGIC LINK: Connects this service to a specific hospital
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },
    // Optional: Connects this service to a specific department (e.g., X-Ray to Radiology)
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Service', serviceSchema);