const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    verifyPayment, 
    getTransactionHistory, 
    getReceipt 
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// 🌐 POST /api/payments/order - Create a new payment order
router.post('/order', protect, createOrder);

// 🌐 POST /api/payments/verify - Verify payment signature
router.post('/verify', protect, verifyPayment);

// 🌐 GET /api/payments/history/:userId - Fetch all transactions for a user
router.get('/history/:userId', protect, getTransactionHistory);

// 🌐 GET /api/payments/receipt/:paymentId - Fetch receipt JSON details
router.get('/receipt/:paymentId', protect, getReceipt);

module.exports = router;
