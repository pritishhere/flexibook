const Appointment = require('../models/Appointment');
const User = require('../models/user');
const { sendAppointmentAlert } = require('../services/notificationService');

// ==========================================
// 1. Book Appointment & Generate Live Token
// ==========================================
exports.bookAppointment = async (req, res) => {
    try {
        const { hospitalId, doctorId, serviceId, appointmentDate } = req.body;
        const userId = req.user.id; // Extracted safely from the JWT validation middleware

        if (!hospitalId || !appointmentDate) {
            return res.status(400).json({ success: false, message: 'Hospital ID and Appointment Date are required.' });
        }

        // Set date boundaries for the selected day (00:00:00 to 23:59:59)
        const startOfDay = new Date(appointmentDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(appointmentDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Build dynamic matching query constraints
        const query = {
            hospitalId,
            appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $ne: 'cancelled' } // Exclude cancelled appointments from line placement
        };
        
        if (doctorId) query.doctorId = doctorId;
        if (serviceId) query.serviceId = serviceId;

        // Dynamic Queuing Logic: Fetch current bookings count for that doctor/service today
        const ongoingBookingsCount = await Appointment.countDocuments(query);
        
        // Compute token number sequentially
        const nextTokenNumber = ongoingBookingsCount + 1;

        // Give a standard baseline estimate (e.g., 15 minutes processing time per patient ahead)
        const estimatedWaitTime = ongoingBookingsCount * 15;

        const newAppointment = new Appointment({
            userId,
            hospitalId,
            doctorId,
            serviceId,
            appointmentDate,
            tokenNumber: nextTokenNumber,
            estimatedWaitTime,
            status: 'pending' // Default starts as pending until the user checks in at the desk
        });

        const savedAppointment = await newAppointment.save();

        // Push this appointment ID directly into the patient's User profile schema record array
        await User.findByIdAndUpdate(userId, {
            $push: { appointments: savedAppointment._id }
        });

        // 🔥 TRIGGER: Fetch User account details and send notification alerts
        try {
            const userAccount = await User.findById(userId);
            const doctorData = await Appointment.findById(savedAppointment._id).populate('doctorId', 'name');

            // Execute asynchronously (fire-and-forget so your controller speeds up response time)
            sendAppointmentAlert({
                email: userAccount.email,
                phone: userAccount.phone || userAccount.mobile || '',
                name: userAccount.name,
                doctorName: doctorData.doctorId?.name || 'Specialist',
                date: savedAppointment.appointmentDate,
                tokenNumber: savedAppointment.tokenNumber,
                type: 'booked' // Calls the confirmation text block
            });
        } catch (alertError) {
            console.error('⚠️ Failed to send appointment alert:', alertError.message);
        }

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully! Your live queue token is ready. 🎟️',
            data: savedAppointment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 2. Get Authenticated User's Booking Logs
// ==========================================
exports.getMyAppointments = async (req, res) => {
    try {
        const bookings = await Appointment.find({ userId: req.user.id })
            .populate('hospitalId', 'name address')
            .populate('doctorId', 'name specialization')
            .sort({ appointmentDate: -1 }); // Show latest first

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. Get Live Queue Dashboard for Medical Staff
// ==========================================
exports.getLiveQueue = async (req, res) => {
    try {
        const { doctorId, date } = req.query;

        if (!doctorId) {
            return res.status(400).json({ success: false, message: 'Doctor ID query parameter is required.' });
        }

        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate).setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate).setHours(23, 59, 59, 999);

        // Fetch running active list sorted chronologically by token assignment order
        const liveQueue = await Appointment.find({
            doctorId,
            appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['in-queue', 'pending'] }
        })
        .populate('userId', 'name phone')
        .sort({ tokenNumber: 1 });

        res.status(200).json({
            success: true,
            count: liveQueue.length,
            data: liveQueue
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 4. Update Status (Call Next Patient / Check-in)
// ==========================================
exports.updateQueueStatus = async (req, res) => {
    try {
        const { status } = req.body; // Expects: 'pending', 'in-queue', 'completed', 'cancelled'

        if (!['pending', 'in-queue', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid queue status payload choice.' });
        }

        // Find appointment record and pre-populate related fields
        const appointment = await Appointment.findById(req.params.id)
            .populate('userId', 'name email phone')
            .populate('doctorId', 'name');

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment details not found.' });
        }

        const previousStatus = appointment.status;
        appointment.status = status;

        if (status === 'completed' || status === 'cancelled') {
            appointment.estimatedWaitTime = 0;
        }

        const updatedAppointment = await appointment.save();

        // 🔥 TRIGGER ENGINE: Evaluate structural transitions
        if (previousStatus !== status) {
            let notificationType = null;

            if (status === 'cancelled') {
                notificationType = 'cancelled';
            } else if (status === 'in-queue') {
                // This means the doctor or desk has clicked "Call Next Patient" -> Time has come!
                notificationType = 'your-turn';
            } else if (previousStatus !== 'pending' && status === 'pending') {
                // If it transitioned backwards or was re-slotted on a later timeline
                notificationType = 'updated';
            }

            // If a valid notification trigger type was determined, dispatch it!
            if (notificationType && appointment.userId) {
                sendAppointmentAlert({
                    email: appointment.userId.email,
                    phone: appointment.userId.phone,
                    name: appointment.userId.name,
                    doctorName: appointment.doctorId?.name || 'Specialist',
                    date: updatedAppointment.appointmentDate,
                    tokenNumber: updatedAppointment.tokenNumber,
                    type: notificationType
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Queue state shifted to: ${status} successfully.`,
            data: updatedAppointment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};