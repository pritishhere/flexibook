const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    timeSlot: {
        type: String,
        required: true 
    },
    tokenNumber: {
        type: Number,
        required: true 
    },
    reasonForVisit: {
        type: String,
        default: 'General Checkup'
    },
    status: {
        type: String,
        // Updated to include Advanced Phase 3 logic states
        enum: ['Pending', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled', 'Missed'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending'
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Appointment', appointmentSchema);
