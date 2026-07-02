const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/user'); // Required to push appointment IDs to the user profile
// Import controller modules
const appointmentController = require('../controllers/appointmentController');

// Import authentication rules
const { protect, authorize } = require('../middleware/authMiddleware');
// ==========================================
// 1. Book a New Appointment (With Live Token Generation)
// ==========================================
// @route   POST /api/appointments/book
// Match explicit path segments to execution functions
router.post('/book', protect, authorize('patient'), appointmentController.bookAppointment);
router.get('/my-bookings', protect, authorize('patient'), appointmentController.getMyAppointments);
router.get('/queue/live', protect, authorize('admin', 'doctor'), appointmentController.getLiveQueue);
router.put('/:id/status', protect, authorize('admin', 'doctor'), appointmentController.updateQueueStatus);
router.post('/book', async (req, res) => {
    try {
        const { userId, hospitalId, doctorId, serviceId, appointmentDate } = req.body;

        // Set date boundaries for the selected day to find existing tokens
        const startOfDay = new Date(appointmentDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(appointmentDate);
        endOfDay.setHours(23, 59, 59, 999);

        // 🧠 Live Token Logic: Find how many people booked for this specific doctor/service today
        const query = {
            hospitalId,
            appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $ne: 'cancelled' } // Ignore cancelled slots
        };
        
        if (doctorId) query.doctorId = doctorId;
        if (serviceId) query.serviceId = serviceId;

        const ongoingAppointmentsCount = await Appointment.countDocuments(query);
        
        // Next token number is current count + 1
        const nextTokenNumber = ongoingAppointmentsCount + 1;

        // Dynamic wait time estimate (e.g., roughly 15 minutes per previous patient in queue)
        const estimatedWaitTime = ongoingAppointmentsCount * 15;

        // Create the new appointment
        const newAppointment = new Appointment({
            userId,
            hospitalId,
            doctorId,
            serviceId,
            appointmentDate,
            tokenNumber: nextTokenNumber,
            estimatedWaitTime,
            status: 'in-queue' // Defaulting straight to the live queue
        });

        const savedAppointment = await newAppointment.save();

        // Relate this appointment back to the User model's appointment array
        await User.findByIdAndUpdate(userId, {
            $push: { appointments: savedAppointment._id }
        });

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully! 🎟️',
            data: savedAppointment
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 2. Get All Appointments for a Specific Patient
// ==========================================
// @route   GET /api/appointments/user/:userId
router.get('/user/:userId', async (req, res) => {
    try {
        const appointments = await Appointment.find({ userId: req.params.userId })
            .populate('hospitalId', 'name address') // Pull specific fields from related documents
            .populate('doctorId', 'name specialization')
            .sort({ appointmentDate: -1 }); // Latest appointments first

        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 3. Update Appointment Status (For Hospital Admins/Doctors)
// ==========================================
// @route   PUT /api/appointments/:id/status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body; // 'pending', 'in-queue', 'completed', 'cancelled'

        if (!['pending', 'in-queue', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status update value.' });
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedAppointment) {
            return res.status(404).json({ success: false, message: 'Appointment profile not found.' });
        }

        res.status(200).json({
            success: true,
            message: `Queue status updated to ${status}! 🔄`,
            data: updatedAppointment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;