const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    familyMember: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FamilyMember',
        default: null
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
    consultationFee: {
        type: Number,
        required: true,
        min: 1,
        default: 500
    },
    patientName: {
        type: String,
        default: null
    },
    patientAge: {
        type: Number,
        default: null
    },
    patientGender: {
        type: String,
        default: null
    },
    patientRelationship: {
        type: String,
        default: 'Self'
    },
    status: {
        type: String,
        // 🔥 CTO FIX: Added 'In-Queue' for the Virtual Waiting Room tracking
        enum: ['Pending', 'Confirmed', 'In-Queue', 'In-Progress', 'Completed', 'Cancelled', 'Missed'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending'
    },
    reminderSent: {
        type: Boolean,
        default: false
    },
    virtualAlertSent: {
        type: Boolean,
        default: false 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Appointment', appointmentSchema);
