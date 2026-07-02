const express = require('express');
const router = express.Router();
const {
    createReview,
    getReviews,
    deleteReview,
    updateReview
} = require('../controllers/reviewController');

// 🌐 POST /api/reviews - Add a new review
router.post('/', createReview);

// 🌐 GET /api/reviews - Get reviews (supports hospitalId or doctorId filters in query parameters)
router.get('/', getReviews);

// 🌐 PUT /api/reviews/:id - Update details of a review
router.put('/:id', updateReview);

// 🌐 DELETE /api/reviews/:id - Delete a review
router.delete('/:id', deleteReview);

module.exports = router;
