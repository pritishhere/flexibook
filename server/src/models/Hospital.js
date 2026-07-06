const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Hospital name is required'],
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    contactNumber: {
        type: String,
        required: [true, 'Contact number is required']
    },
    emergencyNumber: {
        type: String,
        default: '' 
    },
    images: [{
        type: String 
    }],
    rating: {
        type: Number,
        default: 0
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    sector: {
        type: String,
        enum: ['healthcare', 'salon', 'dining', 'travel', 'logistics', 'other'],
        default: 'healthcare'
    },
    isVerified: {
        type: Boolean,
        default: false 
    }
}, { 
    timestamps: true
});

module.exports = mongoose.model('Hospital', hospitalSchema);