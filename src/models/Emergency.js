const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
    // The user who pressed the SOS button
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // GPS coordinates for the ambulance to reach exactly
    location: {
        latitude: {
            type: Number,
            required: [true, 'Latitude is required']
        },
        longitude: {
            type: Number,
            required: [true, 'Longitude is required']
        },
        // Optional: Approximate address converted from GPS
        address: {
            type: String, 
            default: ''
        }
    },
    // The hospital assigned to handle this emergency (backend will auto-assign the nearest one later)
    assignedHospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital'
    },
    // Tracking the status of the ambulance
    status: {
        type: String,
        enum: ['pending', 'dispatched', 'resolved', 'cancelled'],
        default: 'pending' // As soon as button is pressed, it becomes pending
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Emergency', emergencySchema);