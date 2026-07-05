const mongoose = require('mongoose');
const Review = require('../models/Review');
const Hospital = require('../models/Hospital');
const inMemoryDb = require('../utils/inMemoryDb');

// Helper function to update the average rating of a hospital (MongoDB)
const updateHospitalAverageRating = async (hospitalId) => {
    try {
        const reviews = await Review.find({ hospitalId });
        if (reviews.length === 0) {
            await Hospital.findByIdAndUpdate(hospitalId, { rating: 0 });
            return;
        }

        const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
        const average = (sum / reviews.length).toFixed(1); // 1 decimal place

        await Hospital.findByIdAndUpdate(hospitalId, { rating: parseFloat(average) });
    } catch (error) {
        console.error('Error updating hospital average rating:', error.message);
    }
};

// Helper function to update the average rating of a hospital (In-Memory)
const updateHospitalAverageRatingInMemory = (hospitalId) => {
    const reviews = inMemoryDb.reviews.filter(r => r.hospitalId === hospitalId);
    const hospitalIndex = inMemoryDb.hospitals.findIndex(h => h._id === hospitalId);
    if (hospitalIndex === -1) return;

    if (reviews.length === 0) {
        inMemoryDb.hospitals[hospitalIndex].rating = 0;
        return;
    }

    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    const average = (sum / reviews.length).toFixed(1);
    inMemoryDb.hospitals[hospitalIndex].rating = parseFloat(average);
};

// @desc    Create a new review for a hospital (and optionally a specific doctor)
// @route   POST /api/reviews
// @access  Public
exports.createReview = async (req, res) => {
    try {
        const { rating, comment, userId, hospitalId, doctorId } = req.body;

        if (!rating || !userId || !hospitalId) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed: rating, userId, and hospitalId are required'
            });
        }

        if (mongoose.connection.readyState === 1) {
            // MongoDB path
            const newReview = await Review.create({
                rating: Number(rating),
                comment: comment || '',
                userId,
                hospitalId,
                doctorId: doctorId || undefined
            });

            // Recalculate hospital average rating
            await updateHospitalAverageRating(hospitalId);

            return res.status(201).json({
                success: true,
                message: 'Review created successfully (MongoDB)',
                data: newReview
            });
        } else {
            // In-Memory path
            const newReview = {
                _id: new mongoose.Types.ObjectId().toString(),
                rating: Number(rating),
                comment: comment || '',
                userId: userId.toString(),
                hospitalId: hospitalId.toString(),
                doctorId: doctorId ? doctorId.toString() : null,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            inMemoryDb.reviews.push(newReview);
            updateHospitalAverageRatingInMemory(hospitalId);

            return res.status(201).json({
                success: true,
                message: 'Review created successfully (In-Memory Fallback)',
                data: newReview
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create review',
            error: error.message
        });
    }
};

// @desc    Get reviews (Optional filters: hospitalId, doctorId)
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res) => {
    try {
        const { hospitalId, doctorId } = req.query;

        if (mongoose.connection.readyState === 1) {
            let query = {};
            if (hospitalId) query.hospitalId = hospitalId;
            if (doctorId) query.doctorId = doctorId;

            const reviews = await Review.find(query)
                .populate('userId', 'name email')
                .populate({
                    path: 'doctorId',
                    populate: { path: 'userId', select: 'name' }
                });

            return res.status(200).json({
                success: true,
                count: reviews.length,
                data: reviews
            });
        } else {
            // In-Memory path
            let filteredReviews = inMemoryDb.reviews;
            if (hospitalId) {
                filteredReviews = filteredReviews.filter(r => r.hospitalId === hospitalId);
            }
            if (doctorId) {
                filteredReviews = filteredReviews.filter(r => r.doctorId === doctorId);
            }

            const populated = filteredReviews.map(r => {
                const user = inMemoryDb.users.find(u => u._id === r.userId);
                const doctorObj = inMemoryDb.doctors.find(d => d._id === r.doctorId);
                let populatedDoctor = r.doctorId;

                if (doctorObj) {
                    const docUser = inMemoryDb.users.find(u => u._id === doctorObj.userId);
                    populatedDoctor = {
                        ...doctorObj,
                        userId: docUser ? { _id: docUser._id, name: docUser.name } : doctorObj.userId
                    };
                }

                return {
                    ...r,
                    userId: user ? { _id: user._id, name: user.name, email: user.email } : r.userId,
                    doctorId: populatedDoctor
                };
            });

            return res.status(200).json({
                success: true,
                count: populated.length,
                data: populated
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            error: error.message
        });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Public
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        if (mongoose.connection.readyState === 1) {
            const review = await Review.findById(id);
            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: 'Review not found'
                });
            }

            const hospitalId = review.hospitalId;

            // Delete review
            await Review.findByIdAndDelete(id);

            // Recalculate hospital average rating
            await updateHospitalAverageRating(hospitalId);

            return res.status(200).json({
                success: true,
                message: 'Review deleted successfully (MongoDB)'
            });
        } else {
            // In-Memory path
            const index = inMemoryDb.reviews.findIndex(r => r._id === id);
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Review not found'
                });
            }

            const hospitalId = inMemoryDb.reviews[index].hospitalId;
            inMemoryDb.reviews.splice(index, 1);
            updateHospitalAverageRatingInMemory(hospitalId);

            return res.status(200).json({
                success: true,
                message: 'Review deleted successfully (In-Memory Fallback)'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete review',
            error: error.message
        });
    }
};

// @desc    Update a review (rating and/or comment)
// @route   PUT /api/reviews/:id
// @access  Public
exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        if (mongoose.connection.readyState === 1) {
            const review = await Review.findById(id);
            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: 'Review not found'
                });
            }

            if (rating !== undefined) review.rating = Number(rating);
            if (comment !== undefined) review.comment = comment;

            await review.save();

            // Recalculate hospital average rating
            await updateHospitalAverageRating(review.hospitalId);

            return res.status(200).json({
                success: true,
                message: 'Review updated successfully (MongoDB)',
                data: review
            });
        } else {
            // In-Memory Fallback
            const index = inMemoryDb.reviews.findIndex(r => r._id === id);
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Review not found'
                });
            }

            if (rating !== undefined) inMemoryDb.reviews[index].rating = Number(rating);
            if (comment !== undefined) inMemoryDb.reviews[index].comment = comment;
            inMemoryDb.reviews[index].updatedAt = new Date();

            const review = inMemoryDb.reviews[index];
            updateHospitalAverageRatingInMemory(review.hospitalId);

            return res.status(200).json({
                success: true,
                message: 'Review updated successfully (In-Memory Fallback)',
                data: review
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update review',
            error: error.message
        });
    }
};
