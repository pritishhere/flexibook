const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    verifyPayment, 
    getTransactionHistory, 
    getReceipt 
} = require('../controllers/paymentController');

// 🌐 POST /api/payments/order - Create a new payment order
router.post('/order', createOrder);

// 🌐 POST /api/payments/verify - Verify payment signature
router.post('/verify', verifyPayment);

// 🌐 GET /api/payments/history/:userId - Fetch all transactions for a user
router.get('/history/:userId', getTransactionHistory);

// 🌐 GET /api/payments/receipt/:paymentId - Fetch receipt JSON details
router.get('/receipt/:paymentId', getReceipt);

module.exports = router;
