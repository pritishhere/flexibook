const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Doctor name is required'],
        trim: true
    },
    qualification: {
        type: String, 
        required: true
    },
    experience: {
        type: Number, 
        required: true
    },
    fees: {
        type: Number,
        required: [true, 'Consultation fee is required']
    },
    photo: {
        type: String,
        default: '' 
    },
    
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },
    
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Doctor', doctorSchema);