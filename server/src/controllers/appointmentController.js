const mongoose = require('mongoose');
const { getIO } = require('../config/socket'); // Socket engine bulaiye
const Appointment = require('../models/Appointment');
const DoctorLeave = require('../models/DoctorLeave');
const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};
const inMemoryDb = require('../utils/inMemoryDb'); // Helper: "14:30" ko minutes mein convert karega (14*60 + 30 = 870 mins)

// ==========================================
// 1. BOOK APPOINTMENT (Auto-Generate Token)
// ==========================================
exports.bookAppointment = async (req, res) => {
    try {
        const { patient, doctor, hospital, appointmentDate, timeSlot, reasonForVisit } = req.body;

        if (inMemoryDb.isDbConnected()) {
            // Find the last token for this specific doctor on the given date
            const lastAppointment = await Appointment.findOne({ 
                doctor: doctor, 
                hospital: hospital, 
                appointmentDate: appointmentDate 
            }).sort({ tokenNumber: -1 });

            // Generate the new token by incrementing the last one
            const newTokenNumber = lastAppointment ? lastAppointment.tokenNumber + 1 : 1;

            const newAppointment = new Appointment({
                patient,
                doctor,
                hospital,
                appointmentDate,
                timeSlot,
                tokenNumber: newTokenNumber,
                reasonForVisit
            });

            await newAppointment.save();

            // Populate to send email
            const populatedAppointment = await Appointment.findById(newAppointment._id)
                .populate('patient')
                .populate({ path: 'doctor', populate: { path: 'userId' } })
                .populate('hospital');

            if (populatedAppointment) {
                try {
                    const { sendAppointmentAlert } = require('../services/notificationService');
                    const patientName = populatedAppointment.patientName || (populatedAppointment.patient ? populatedAppointment.patient.name : 'Patient');
                    const doctorName = (populatedAppointment.doctor && populatedAppointment.doctor.userId) ? populatedAppointment.doctor.userId.name : 'Doctor';
                    
                    await sendAppointmentAlert({
                        email: populatedAppointment.patient ? populatedAppointment.patient.email : '',
                        phone: '', // Website booking: Email only (no WhatsApp)
                        name: patientName,
                        doctorName: doctorName,
                        date: populatedAppointment.appointmentDate,
                        tokenNumber: populatedAppointment.tokenNumber,
                        type: 'booked'
                    });
                } catch (notifyErr) {
                    console.error('Booking confirmation email dispatch failed:', notifyErr.message);
                }
            }

            return res.status(201).json({
                success: true,
                message: "Appointment booked successfully!",
                data: {
                    tokenNumber: newAppointment.tokenNumber,
                    appointmentDetails: newAppointment
                }
            });
        } else {
            // In-Memory Fallback Mode
            const targetDateStr = new Date(appointmentDate).toDateString();
            const sameDayApps = inMemoryDb.appointments.filter(a => 
                a.doctor === doctor && 
                a.hospital === hospital && 
                new Date(a.appointmentDate).toDateString() === targetDateStr
            );

            let maxToken = 0;
            sameDayApps.forEach(a => {
                if (a.tokenNumber > maxToken) maxToken = a.tokenNumber;
            });
            const newTokenNumber = maxToken + 1;

            const appointmentId = new mongoose.Types.ObjectId().toString();
            const newApp = {
                _id: appointmentId,
                patient,
                doctor,
                hospital,
                appointmentDate: new Date(appointmentDate),
                timeSlot,
                tokenNumber: newTokenNumber,
                reasonForVisit,
                status: 'Pending',
                paymentStatus: 'Pending',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            inMemoryDb.appointments.push(newApp);

            // Fetch populated details from inMemoryDb
            const patientUser = inMemoryDb.users.find(u => u._id === patient);
            const doctorObj = inMemoryDb.doctors.find(d => d._id === doctor);
            let doctorName = 'Doctor';
            let patientName = 'Patient';
            let email = '';

            if (patientUser) {
                patientName = patientUser.name;
                email = patientUser.email;
            }
            if (doctorObj) {
                const docUser = inMemoryDb.users.find(u => u._id === doctorObj.userId);
                if (docUser) doctorName = docUser.name;
            }

            try {
                const { sendAppointmentAlert } = require('../services/notificationService');
                await sendAppointmentAlert({
                    email,
                    phone: '', // Website booking: Email only (no WhatsApp)
                    name: patientName,
                    doctorName,
                    date: newApp.appointmentDate,
                    tokenNumber: newApp.tokenNumber,
                    type: 'booked'
                });
            } catch (notifyErr) {
                console.error('Booking confirmation email dispatch failed (In-Memory):', notifyErr.message);
            }

            return res.status(201).json({
                success: true,
                message: "Appointment booked successfully! (In-Memory Mode)",
                data: {
                    tokenNumber: newApp.tokenNumber,
                    appointmentDetails: newApp
                }
            });
        }

    } catch (error) {
        console.error('Appointment Booking Error:', error);
        res.status(500).json({ success: false, message: "Server error during booking", error: error.message });
    }
};

// ==========================================
// 2. GET PATIENT'S APPOINTMENT HISTORY
// ==========================================
exports.getPatientAppointments = async (req, res) => {
    try {
        const { patientId } = req.params;

        const appointments = await Appointment.find({ patient: patientId })
            .sort({ createdAt: -1 })
            .populate('doctor', 'name specialization')
            .populate('hospital', 'name address');

        res.status(200).json({ success: true, count: appointments.length, data: appointments });

    } catch (error) {
        console.error('Fetch Appointments Error:', error);
        res.status(500).json({ success: false, message: "Server error fetching history", error: error.message });
    }
};

// ==========================================
// 3. MANUAL STATUS UPDATE (General Admin Tool)
// ==========================================
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params; 
        const { status } = req.body; 

        const validStatuses = ['Pending', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled', 'Missed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status provided." });
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { status: status },
            { new: true } 
        );

        if (!updatedAppointment) {
            return res.status(404).json({ success: false, message: "Appointment not found." });
        }

        res.status(200).json({ success: true, message: `Status updated to ${status}.`, data: updatedAppointment });

    } catch (error) {
        console.error('Status Update Error:', error);
        res.status(500).json({ success: false, message: "Server error updating status", error: error.message });
    }
};

// ==========================================
// 4. LIVE QUEUE TRACKER (TV Screen Data)
// ==========================================
exports.getLiveQueueStatus = async (req, res) => {
    try {
        const { doctorId, date } = req.query;

        if (!doctorId || !date) {
            return res.status(400).json({ success: false, message: "Doctor ID and Date are required." });
        }

        // Find the patient inside the cabin
        const currentPatient = await Appointment.findOne({
            doctor: doctorId,
            appointmentDate: date,
            status: 'In-Progress'
        }).populate('patient', 'name'); 

        // Find the next expected patient
        const nextPatient = await Appointment.findOne({
            doctor: doctorId,
            appointmentDate: date,
            status: { $in: ['Pending', 'Confirmed'] }
        }).sort({ tokenNumber: 1 }); 

        res.status(200).json({
            success: true,
            data: {
                currentOngoingToken: currentPatient ? currentPatient.tokenNumber : "None",
                nextWaitingToken: nextPatient ? nextPatient.tokenNumber : "No more patients waiting",
                totalWaiting: await Appointment.countDocuments({
                    doctor: doctorId,
                    appointmentDate: date,
                    status: { $in: ['Pending', 'Confirmed'] }
                })
            }
        });

    } catch (error) {
        console.error('Live Queue Error:', error);
        res.status(500).json({ success: false, message: "Server error fetching live queue", error: error.message });
    }
};

// ==========================================
// 5. GATEKEEPER: ADMIT PATIENT TO CABIN
// ==========================================
exports.admitPatient = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        const appointmentToAdmit = await Appointment.findById(appointmentId);

        if (!appointmentToAdmit) {
            return res.status(404).json({ success: false, message: "Appointment not found." });
        }

        // Prevent entry if someone is already inside
        const patientInside = await Appointment.findOne({
            doctor: appointmentToAdmit.doctor,
            appointmentDate: appointmentToAdmit.appointmentDate,
            status: 'In-Progress'
        });

        if (patientInside) {
            return res.status(400).json({
                success: false,
                message: `Cannot admit. Token ${patientInside.tokenNumber} is currently inside.`
            });
        }

        appointmentToAdmit.status = 'In-Progress';
        await appointmentToAdmit.save();

        res.status(200).json({
            success: true,
            message: `Entry Allowed. Token ${appointmentToAdmit.tokenNumber} is inside.`,
            data: appointmentToAdmit
        });

    } catch (error) {
        console.error('Gatekeeper Error:', error);
        res.status(500).json({ success: false, message: "Server error admitting patient", error: error.message });
    }
};

// ==========================================
// 6. TIMEOUT: NO-SHOW / MISS QUEUE
// ==========================================
exports.markNoShow = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        const appointmentToSkip = await Appointment.findById(appointmentId);

        if (!appointmentToSkip) {
            return res.status(404).json({ success: false, message: "Appointment not found." });
        }

        if (appointmentToSkip.status !== 'Pending' && appointmentToSkip.status !== 'Confirmed') {
            return res.status(400).json({
                success: false,
                message: `Cannot skip. Current status is '${appointmentToSkip.status}'.`
            });
        }

        // Mark as missed
        appointmentToSkip.status = 'Missed';
        await appointmentToSkip.save();

        // Find who is next to display on screen
        const nextInLine = await Appointment.findOne({
            doctor: appointmentToSkip.doctor,
            appointmentDate: appointmentToSkip.appointmentDate,
            status: { $in: ['Pending', 'Confirmed'] }
        }).sort({ tokenNumber: 1 });

        res.status(200).json({
            success: true,
            message: `Token ${appointmentToSkip.tokenNumber} marked as Missed. Queue moved.`,
            skippedToken: appointmentToSkip.tokenNumber,
            nextExpectedToken: nextInLine ? nextInLine.tokenNumber : "Queue is empty."
        });

    } catch (error) {
        console.error('No-Show Error:', error);
        res.status(500).json({ success: false, message: "Server error processing timeout", error: error.message });
    }
};

// ==========================================
// 7. GET HOSPITAL APPOINTMENTS (Dashboard Schedule)
// ==========================================
exports.getHospitalAppointments = async (req, res) => {
    try {
        const { hospitalId } = req.params;
        const { date, doctorId } = req.query;

        if (!hospitalId) {
            return res.status(400).json({ success: false, message: "Hospital ID is required." });
        }

        if (inMemoryDb.isDbConnected()) {
            let query = { hospital: hospitalId };
            if (date) {
                const startOfDay = new Date(date);
                startOfDay.setUTCHours(0, 0, 0, 0);
                const endOfDay = new Date(date);
                endOfDay.setUTCHours(23, 59, 59, 999);
                query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
            }
            if (doctorId) {
                query.doctor = doctorId;
            }

            const appointments = await Appointment.find(query)
                .populate('patient', 'name email mobile')
                .populate({
                    path: 'doctor',
                    populate: { path: 'userId', select: 'name' }
                })
                .sort({ appointmentDate: 1, tokenNumber: 1 });

            return res.status(200).json({
                success: true,
                count: appointments.length,
                data: appointments
            });
        } else {
            let filtered = inMemoryDb.appointments.filter(a => a.hospital === hospitalId);
            if (date) {
                const targetDateStr = new Date(date).toDateString();
                filtered = filtered.filter(a => new Date(a.appointmentDate).toDateString() === targetDateStr);
            }
            if (doctorId) {
                filtered = filtered.filter(a => a.doctor === doctorId);
            }

            const populated = filtered.map(a => {
                const patientUser = inMemoryDb.users.find(u => u._id === a.patient);
                const docObj = inMemoryDb.doctors.find(d => d._id === a.doctor);
                let populatedDoctor = a.doctor;

                if (docObj) {
                    const docUser = inMemoryDb.users.find(u => u._id === docObj.userId);
                    populatedDoctor = {
                        ...docObj,
                        userId: docUser ? { _id: docUser._id, name: docUser.name } : docObj.userId
                    };
                }

                return {
                    ...a,
                    patient: patientUser ? { _id: patientUser._id, name: patientUser.name, email: patientUser.email, mobile: patientUser.mobile } : a.patient,
                    doctor: populatedDoctor
                };
            }).sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate) || a.tokenNumber - b.tokenNumber);

            return res.status(200).json({
                success: true,
                count: populated.length,
                data: populated
            });
        }
    } catch (error) {
        console.error('Fetch Hospital Appointments Error:', error);
        res.status(500).json({ success: false, message: "Server error fetching schedule", error: error.message });
    }
};

// ==========================================
// 8. UPDATE APPOINTMENT PAYMENT STATUS
// ==========================================
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { paymentStatus } = req.body;

        if (!paymentStatus || !['Pending', 'Paid'].includes(paymentStatus)) {
            return res.status(400).json({ success: false, message: "Invalid paymentStatus. Must be 'Pending' or 'Paid'." });
        }

        if (inMemoryDb.isDbConnected()) {
            const updatedAppointment = await Appointment.findByIdAndUpdate(
                appointmentId,
                { paymentStatus },
                { new: true }
            );

            if (!updatedAppointment) {
                return res.status(404).json({ success: false, message: "Appointment not found." });
            }

            return res.status(200).json({
                success: true,
                message: `Payment status updated to ${paymentStatus}.`,
                data: updatedAppointment
            });
        } else {
            const index = inMemoryDb.appointments.findIndex(a => a._id === appointmentId);
            if (index === -1) {
                return res.status(404).json({ success: false, message: "Appointment not found." });
            }

            inMemoryDb.appointments[index].paymentStatus = paymentStatus;
            inMemoryDb.appointments[index].updatedAt = new Date();

            return res.status(200).json({
                success: true,
                message: `Payment status updated to ${paymentStatus}.`,
                data: inMemoryDb.appointments[index]
            });
        }
    } catch (error) {
        console.error('Update Payment Status Error:', error);
        res.status(500).json({ success: false, message: "Server error updating payment status", error: error.message });
    }
};

// ==========================================
// 9. RESCHEDULE APPOINTMENT
// ==========================================
exports.rescheduleAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { newDate, newTimeSlot } = req.body;

        if (!newDate || !newTimeSlot) {
            return res.status(400).json({ success: false, message: "New date and new time slot are required." });
        }

        if (inMemoryDb.isDbConnected()) {
            const appointment = await Appointment.findById(appointmentId)
                .populate('patient', 'name email mobile')
                .populate({ path: 'doctor', populate: { path: 'userId', select: 'name' } });

            if (!appointment) {
                return res.status(404).json({ success: false, message: "Appointment not found." });
            }

            // Prevent changes if appointment is Completed or Cancelled
            if (['Completed', 'Cancelled', 'Missed'].includes(appointment.status)) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Cannot reschedule appointment with status '${appointment.status}'.` 
                });
            }

            // Calculate new token number for the doctor on the new date
            const lastAppointment = await Appointment.findOne({ 
                doctor: appointment.doctor._id, 
                hospital: appointment.hospital, 
                appointmentDate: new Date(newDate) 
            }).sort({ tokenNumber: -1 });

            const newTokenNumber = lastAppointment ? lastAppointment.tokenNumber + 1 : 1;

            // Apply updates
            appointment.appointmentDate = new Date(newDate);
            appointment.timeSlot = newTimeSlot;
            appointment.tokenNumber = newTokenNumber;
            appointment.status = 'Pending'; // Reset check-in state

            await appointment.save();

            // Dispatch Notifications
            try {
                const { sendAppointmentAlert } = require('../services/notificationService');
                const doctorName = (appointment.doctor && appointment.doctor.userId) ? appointment.doctor.userId.name : 'Doctor';
                const patientName = appointment.patient ? appointment.patient.name : 'Patient';

                await sendAppointmentAlert({
                    email: appointment.patient ? appointment.patient.email : '',
                    phone: appointment.patient ? appointment.patient.mobile : '',
                    name: patientName,
                    doctorName: doctorName,
                    date: appointment.appointmentDate,
                    tokenNumber: appointment.tokenNumber,
                    type: 'updated'
                });
            } catch (err) {
                console.error('Reschedule Notification Dispatch Failed:', err.message);
            }

            return res.status(200).json({
                success: true,
                message: "Appointment rescheduled successfully!",
                data: appointment
            });
        } else {
            // In-Memory Fallback
            const index = inMemoryDb.appointments.findIndex(a => a._id === appointmentId);
            if (index === -1) {
                return res.status(404).json({ success: false, message: "Appointment not found." });
            }

            const appointment = inMemoryDb.appointments[index];

            if (['Completed', 'Cancelled', 'Missed'].includes(appointment.status)) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Cannot reschedule appointment with status '${appointment.status}'.` 
                });
            }

            // Find new token number
            const targetDateStr = new Date(newDate).toDateString();
            const sameDayApps = inMemoryDb.appointments.filter(a => 
                a.doctor === appointment.doctor && 
                a.hospital === appointment.hospital && 
                new Date(a.appointmentDate).toDateString() === targetDateStr
            );

            let maxToken = 0;
            sameDayApps.forEach(a => {
                if (a.tokenNumber > maxToken) maxToken = a.tokenNumber;
            });
            const newTokenNumber = maxToken + 1;

            // Update
            appointment.appointmentDate = new Date(newDate);
            appointment.timeSlot = newTimeSlot;
            appointment.tokenNumber = newTokenNumber;
            appointment.status = 'Pending';
            appointment.updatedAt = new Date();

            // Populate mock relationships for notification
            const patientUser = inMemoryDb.users.find(u => u._id === appointment.patient);
            const docObj = inMemoryDb.doctors.find(d => d._id === appointment.doctor);
            let doctorName = 'Doctor';
            let patientName = 'Patient';
            let email = '';
            let phone = '';

            if (patientUser) {
                patientName = patientUser.name;
                email = patientUser.email;
                phone = patientUser.mobile;
            }
            if (docObj) {
                const docUser = inMemoryDb.users.find(u => u._id === docObj.userId);
                if (docUser) doctorName = docUser.name;
            }

            // Dispatch notification
            try {
                const { sendAppointmentAlert } = require('../services/notificationService');
                await sendAppointmentAlert({
                    email,
                    phone,
                    name: patientName,
                    doctorName,
                    date: appointment.appointmentDate,
                    tokenNumber: appointment.tokenNumber,
                    type: 'updated'
                });
            } catch (err) {
                console.error('Reschedule Notification Dispatch Failed (In-Memory):', err.message);
            }

            return res.status(200).json({
                success: true,
                message: "Appointment rescheduled successfully!",
                data: appointment
            });
        }
    } catch (error) {
        console.error('Reschedule Appointment Error:', error);
        res.status(500).json({ success: false, message: "Server error rescheduling appointment", error: error.message });
    }
};

// ==========================================
// 10. LIVE QUEUE ALERTS (Socket.io Push)
// ==========================================

const updateAppointmentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { status } = req.body; // e.g., 'Completed'

        // 1. DB mein status update kiya
        const appointment = await Appointment.findByIdAndUpdate(appointmentId, { status }, { new: true });

        // 2. Queue ka naya data fetch kiya (Aapko apna logic lagana hoga ETA count karne ka)
        const updatedQueueData = {
            message: "A patient just finished! Queue is moving.",
            currentServingToken: appointment.tokenNumber + 1
        };

        // 🚨 3. THE MAGIC PUSH: Us doctor ke room mein sabko live update bhej do!
        const io = getIO();
        io.to(appointment.doctor.toString()).emit('queue_updated', updatedQueueData);

        res.status(200).json({ success: true, message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


// ==========================================
// 11. DOCTOR LEAVE CHECK (Before Booking)
// ==========================================

exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, appointmentDate, timeSlot, patientId } = req.body;

        // 🚨 NEW LOGIC: Date normalize karo aur check karo
        const requestedDate = new Date(appointmentDate);
        requestedDate.setHours(0, 0, 0, 0);

        const isDoctorOnLeave = await DoctorLeave.findOne({
            doctor: doctorId,
            date: requestedDate
        });

        // Agar DB mein us date ki leave mil gayi, toh turant API rok do!
        if (isDoctorOnLeave) {
            return res.status(400).json({
                success: false,
                message: 'Sorry! The doctor is on leave on this date. Please select another date.'
            });
        }
    } catch (error) {
        // Error handling
    }
};

// ==========================================
// 12. Doctor TIME SLOT VALIDATION (BEFORE BOOKING)
// ==========================================

exports.bookAppointment = async (req, res) => {
    try {
        // timeSlot hamesha 24-hour format mein aayega UI se, e.g., "14:30"
        const { doctorId, hospitalId, appointmentDate, timeSlot, patientId } = req.body;

        const requestedDate = new Date(appointmentDate);
        requestedDate.setHours(0, 0, 0, 0); // Date ko normalize kiya
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // ❌ CASE 0: Past Date check
        if (requestedDate < today) {
            return res.status(400).json({ success: false, message: "Aap beete hue kal (past date) mein booking nahi kar sakte." });
        }

        // 👨‍⚕️ Fetch Doctor Details
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor nahi mile." });
        }

        // ❌ CASE 1: Is doctor on leave? (Pichla feature)
        const isLeave = await DoctorLeave.findOne({ doctor: doctorId, date: requestedDate });
        if (isLeave) {
            return res.status(400).json({ 
                success: false, 
                message: `We apologize, but Dr. ${doctor.name || 'Doctor'} is on leave on this date. Please select another date.` 
            });
        }

        // 🗓️ Find requested Day (e.g., "Monday")
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const requestedDayName = daysOfWeek[requestedDate.getDay()];

        // ❌ CASE 2: Does doctor work on this day?
        const daySchedule = doctor.availability.find(schedule => schedule.day === requestedDayName);
        if (!daySchedule) {
            return res.status(400).json({ 
                success: false, 
                message: `Professional Alert: Dr. ${doctor.name || 'Doctor'} is not available on ${requestedDayName}s. Please check their schedule on the hospital dashboard.` 
            });
        }

        // ❌ CASE 3: Is the timeSlot within the doctor's working hours?
        const reqMinutes = timeToMinutes(timeSlot); // e.g., "14:30" -> 870
        const startMinutes = timeToMinutes(daySchedule.startTime); // e.g., "14:00" -> 840
        const endMinutes = timeToMinutes(daySchedule.endTime); // e.g., "17:00" -> 1020

        if (reqMinutes < startMinutes || reqMinutes > endMinutes) {
            return res.status(400).json({ 
                success: false, 
                message: `Invalid Time Slot! The doctor's shift on ${requestedDayName} is only from ${daySchedule.startTime} to ${daySchedule.endTime}.` 
            });
        }

        // ✅ ALL TESTS PASSED! Generate Token and Book.
        // Token number logic (Example: total appointments on that day + 1)
        const totalAppointmentsToday = await Appointment.countDocuments({ 
            doctor: doctorId, 
            appointmentDate: requestedDate 
        });

        const newAppointment = await Appointment.create({
            patient: patientId,
            doctor: doctorId,
            hospital: hospitalId,
            appointmentDate: requestedDate,
            timeSlot: timeSlot,
            tokenNumber: totalAppointmentsToday + 1,
            status: 'Pending'
        });

        res.status(201).json({
            success: true,
            message: "Appointment successfully booked! The doctor will see you at " + timeSlot,
            data: newAppointment
        });

    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ success: false, message: "Server error occurred while booking." });
    }
};