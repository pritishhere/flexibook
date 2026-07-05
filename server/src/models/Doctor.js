const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required for a doctor profile']
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: [true, 'Hospital ID is required']
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: false
    },
    specialization: {
        type: String,
        required: [true, 'Specialization is required'],
        trim: true
    },
    qualification: {
        type: String,
        required: false,
        trim: true
    },
    experience: {
        type: Number,
        required: [true, 'Experience (years) is required']
    },
    fees: {
        type: Number,
        required: [true, 'Consultation fee is required']
    },
    
    // 🔥 CTO UPDATE: Smart Scheduling Engine (Day + Time Slot)
    availability: [
        {
            day: { 
                type: String, 
                enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                required: true
            },
            startTime: {
                type: String, // 24-hour format (e.g., "14:00" for 2 PM)
                required: true
            },
            endTime: {
                type: String, // 24-hour format (e.g., "17:00" for 5 PM)
                required: true
            }
        }
    ],

    isAvailable: {
        type: Boolean,
        default: true
    },
    photo: {
        type: String,
        default: ''
    }
    
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Doctor', doctorSchema);