const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1, // Minimum 1 star
        max: 5  // Maximum 5 stars
    },
    comment: {
        type: String,
        trim: true,
        default: ''
    },
    // 🔥 MAGIC LINK 1: Which user/patient wrote this review?
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // 🔥 MAGIC LINK 2: Which hospital is this review for?
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },
    // Optional: If the review is specifically for a doctor
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Review', reviewSchema);