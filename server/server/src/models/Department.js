const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Department name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital', 
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Department', departmentSchema);