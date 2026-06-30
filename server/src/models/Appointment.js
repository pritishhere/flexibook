const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    // Patient who is booking the appointment
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Hospital where the appointment is booked
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },
    // Doctor for the consultation (can be null if booking only a test)
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    // If the patient is booking a specific test/service instead of a doctor
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    },
    appointmentDate: {
        type: Date,
        required: [true, 'Appointment date is required']
    },
    // 🔥 PRO FEATURE: Token number for live tracking
    tokenNumber: {
        type: Number,
        required: true
    },
    // Live status of the patient in the queue
    status: {
        type: String,
        enum: ['pending', 'in-queue', 'completed', 'cancelled'],
        default: 'pending'
    },
    // Dynamic estimated wait time in minutes
    estimatedWaitTime: {
        type: Number,
        default: 0
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Appointment', appointmentSchema);