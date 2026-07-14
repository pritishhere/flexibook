const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
    // Primary account holder (who is adding this member)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Member name is required'],
        trim: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true
    },
    // 🔥 THE ANSWER TO YOUR QUESTION: What is their relation?
    relationToUser: {
        type: String,
        required: true,
        // User can type anything here: 'Father', 'Spouse', 'Son', 'Grandfather', 'Friend', etc.
        trim: true
    },
    bloodGroup: {
        type: String,
        default: 'Unknown'
    },
    phone: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FamilyMember', familyMemberSchema);
