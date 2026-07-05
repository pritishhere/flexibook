const mongoose = require('mongoose');

const doctorLeaveSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    // Exact kis din chhutti hai
    date: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        default: 'Personal Leave'
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('DoctorLeave', doctorLeaveSchema);