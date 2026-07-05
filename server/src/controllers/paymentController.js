const crypto = require('crypto');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const User = require('../models/user');
const inMemoryDb = require('../utils/inMemoryDb');

let Razorpay;
let razorpayInstance = null;
let isMock = false;

try {
    Razorpay = require('razorpay');

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret || key_id.includes('YOUR') || key_secret.includes('YOUR')) {
        isMock = true;
        console.log('⚠️ Razorpay keys are not configured in .env. Running Payment API in Mock mode.');
    } else {
        razorpayInstance = new Razorpay({
            key_id: key_id,
            key_secret: key_secret
        });
        console.log('✅ Razorpay SDK initialized successfully.');
    }
} catch (e) {
    isMock = true;
    console.log('⚠️ Razorpay SDK is not installed or failed to load. Running Payment API in Mock mode.');
}

// @desc    Create a Razorpay payment order
// @route   POST /api/payments/order
// @access  Public
exports.createOrder = async (req, res) => {
    try {
        const { userId, amount, currency, receipt } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required to create an order'
            });
        }

        if (!amount) {
            return res.status(400).json({
                success: false,
                message: 'Amount is required'
            });
        }

        const orderAmount = Number(amount);
        let order;

        if (!isMock && razorpayInstance) {
            // Real Razorpay integration
            const options = {
                amount: Math.round(orderAmount * 100), // convert to paise
                currency: currency || 'INR',
                receipt: receipt || `receipt_${Date.now()}`
            };

            order = await razorpayInstance.orders.create(options);
        } else {
            // Mock Fallback mode
            order = {
                id: `order_mock_${Math.random().toString(36).substring(2, 15)}`,
                entity: 'order',
                amount: Math.round(orderAmount * 100),
                amount_paid: 0,
                amount_due: Math.round(orderAmount * 100),
                currency: currency || 'INR',
                receipt: receipt || `receipt_mock_${Date.now()}`,
                status: 'created',
                attempts: 0,
                created_at: Math.floor(Date.now() / 1000)
            };
        }

        // Save Transaction with status 'created'
        if (inMemoryDb.isDbConnected()) {
            await Transaction.create({
                userId,
                orderId: order.id,
                amount: orderAmount,
                currency: currency || 'INR',
                status: 'created',
                receipt: order.receipt
            });
        } else {
            // In-Memory Fallback
            inMemoryDb.transactions.push({
                _id: new mongoose.Types.ObjectId().toString(),
                userId,
                orderId: order.id,
                paymentId: null,
                amount: orderAmount,
                currency: currency || 'INR',
                status: 'created',
                receipt: order.receipt,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        return res.status(201).json({
            success: true,
            message: isMock ? 'Order created successfully (Mock Fallback)' : 'Order created successfully (Razorpay)',
            data: order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order',
            error: error.message
        });
    }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
// @access  Public
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing required payment verification details (orderId, paymentId, signature)'
            });
        }

        const secret = isMock ? 'mock_secret' : process.env.RAZORPAY_KEY_SECRET;

        // HMAC SHA256 signature verification
        const text = razorpay_order_id + '|' + razorpay_payment_id;
        const generatedSignature = crypto
            .createHmac('sha256', secret)
            .update(text)
            .digest('hex');

        if (generatedSignature === razorpay_signature) {
            let transactionObj = null;

            // 1. Update Transaction to 'captured'
            if (inMemoryDb.isDbConnected()) {
                transactionObj = await Transaction.findOneAndUpdate(
                    { orderId: razorpay_order_id },
                    { status: 'captured', paymentId: razorpay_payment_id },
                    { new: true }
                );
            } else {
                // In-Memory Fallback
                transactionObj = inMemoryDb.transactions.find(t => t.orderId === razorpay_order_id);
                if (transactionObj) {
                    transactionObj.status = 'captured';
                    transactionObj.paymentId = razorpay_payment_id;
                    transactionObj.updatedAt = new Date();
                }
            }

            // 2. Resolve Appointment ID from request body or transaction receipt
            let targetAppointmentId = appointmentId;
            if (!targetAppointmentId && transactionObj && transactionObj.receipt) {
                const match = transactionObj.receipt.match(/booking_([a-fA-F0-9]{24})/);
                if (match && match[1]) {
                    targetAppointmentId = match[1];
                } else {
                    const rawMatch = transactionObj.receipt.match(/[a-fA-F0-9]{24}/);
                    if (rawMatch) targetAppointmentId = rawMatch[0];
                }
            }

            // 3. Update Appointment Status & Dispatch Notification Alert
            if (targetAppointmentId) {
                if (inMemoryDb.isDbConnected()) {
                    const Appointment = require('../models/Appointment');
                    const updatedApp = await Appointment.findByIdAndUpdate(
                        targetAppointmentId,
                        { paymentStatus: 'Paid', status: 'Confirmed' },
                        { new: true }
                    ).populate('patient').populate({ path: 'doctor', populate: { path: 'userId' } });

                    if (updatedApp) {
                        try {
                            const { sendAppointmentAlert } = require('../services/notificationService');
                            const patientName = updatedApp.patientName || (updatedApp.patient ? updatedApp.patient.name : 'Patient');
                            const docName = (updatedApp.doctor && updatedApp.doctor.userId) ? updatedApp.doctor.userId.name : 'Doctor';

                            await sendAppointmentAlert({
                                email: updatedApp.patient ? updatedApp.patient.email : '',
                                phone: '', // Payment confirmation: Email only (no WhatsApp)
                                name: patientName,
                                doctorName: docName,
                                date: updatedApp.appointmentDate,
                                tokenNumber: updatedApp.tokenNumber,
                                type: 'booked' // Sends verified confirmation
                            });
                        } catch (notifyErr) {
                            console.error('Payment confirmation alert dispatch failed:', notifyErr.message);
                        }
                    }
                } else {
                    // In-Memory Fallback
                    const appIndex = inMemoryDb.appointments.findIndex(a => a._id === targetAppointmentId);
                    if (appIndex !== -1) {
                        inMemoryDb.appointments[appIndex].paymentStatus = 'Paid';
                        inMemoryDb.appointments[appIndex].status = 'Confirmed';
                        inMemoryDb.appointments[appIndex].updatedAt = new Date();

                        const appt = inMemoryDb.appointments[appIndex];
                        const patientUser = inMemoryDb.users.find(u => u._id === appt.patient);
                        const doctorObj = inMemoryDb.doctors.find(d => d._id === appt.doctor);
                        let docName = 'Doctor';
                        let patientName = appt.patientName || 'Patient';
                        let patientEmail = '';
                        let patientMobile = '';

                        if (patientUser) {
                            patientName = appt.patientName || patientUser.name;
                            patientEmail = patientUser.email;
                            patientMobile = patientUser.mobile;
                        }
                        if (doctorObj) {
                            const docUser = inMemoryDb.users.find(u => u._id === doctorObj.userId);
                            if (docUser) docName = docUser.name;
                        }

                        try {
                            const { sendAppointmentAlert } = require('../services/notificationService');
                            await sendAppointmentAlert({
                                email: patientEmail,
                                phone: '', // Payment confirmation: Email only (no WhatsApp)
                                name: patientName,
                                doctorName: docName,
                                date: appt.appointmentDate,
                                tokenNumber: appt.tokenNumber,
                                type: 'booked'
                            });
                        } catch (notifyErr) {
                            console.error('Payment confirmation alert dispatch failed (In-Memory):', notifyErr.message);
                        }
                    }
                }
            }

            return res.status(200).json({
                success: true,
                message: isMock ? 'Payment verified successfully (Mock Mode)' : 'Payment verified successfully (Razorpay)',
                verified: true
            });
        } else {
            // Update Transaction to 'failed'
            if (inMemoryDb.isDbConnected()) {
                await Transaction.findOneAndUpdate(
                    { orderId: razorpay_order_id },
                    { status: 'failed' }
                );
            } else {
                const tx = inMemoryDb.transactions.find(t => t.orderId === razorpay_order_id);
                if (tx) {
                    tx.status = 'failed';
                    tx.updatedAt = new Date();
                }
            }

            return res.status(400).json({
                success: false,
                message: 'Invalid signature. Payment verification failed.',
                verified: false
            });
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error during payment verification',
            error: error.message
        });
    }
};

// @desc    Get transaction history for a user
// @route   GET /api/payments/history/:userId
// @access  Public
exports.getTransactionHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        if (inMemoryDb.isDbConnected()) {
            const history = await Transaction.find({ userId })
                .populate('userId', 'name email')
                .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                count: history.length,
                data: history
            });
        } else {
            // In-Memory Fallback
            const history = inMemoryDb.transactions
                .filter(t => t.userId === userId)
                .map(t => {
                    const user = inMemoryDb.users.find(u => u._id === userId);
                    return {
                        ...t,
                        userId: user ? { _id: user._id, name: user.name, email: user.email } : null
                    };
                })
                .reverse(); // sort descending (newest first)

            return res.status(200).json({
                success: true,
                count: history.length,
                data: history
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transaction history',
            error: error.message
        });
    }
};

// @desc    Get receipt details for a successful payment
// @route   GET /api/payments/receipt/:paymentId
// @access  Public
exports.getReceipt = async (req, res) => {
    try {
        const { paymentId } = req.params;
        let tx = null;
        let user = null;

        if (inMemoryDb.isDbConnected()) {
            tx = await Transaction.findOne({ paymentId }).populate('userId', 'name email mobile');
            if (tx) {
                user = tx.userId;
            }
        } else {
            // In-Memory Fallback
            tx = inMemoryDb.transactions.find(t => t.paymentId === paymentId);
            if (tx) {
                user = inMemoryDb.users.find(u => u._id === tx.userId);
            }
        }

        if (!tx || tx.status !== 'captured') {
            return res.status(403).json({
                success: false,
                message: 'Invoice bills are only generated and accessible for successful payments.'
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                paymentId: tx.paymentId,
                orderId: tx.orderId,
                amount: tx.amount,
                currency: tx.currency,
                status: tx.status,
                receipt: tx.receipt,
                createdAt: tx.createdAt,
                user: {
                    name: user ? user.name : 'Valued Patient',
                    email: user ? user.email : 'N/A',
                    mobile: user && user.mobile ? user.mobile : 'N/A'
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve receipt details',
            error: error.message
        });
    }
};
