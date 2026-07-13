const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: [true, 'Appointment ID is required']
    },
    orderId: {
        type: String,
        required: [true, 'Order ID is required'],
        unique: true
    },
    paymentId: {
        type: String,
        default: null
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required']
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['created', 'captured', 'failed'],
        default: 'created'
    },
    receipt: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
