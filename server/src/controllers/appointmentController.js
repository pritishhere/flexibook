const Appointment = require('../models/Appointment');

// ==========================================
// 1. BOOK APPOINTMENT (Auto-Generate Token)
// ==========================================
exports.bookAppointment = async (req, res) => {
    try {
        const { patient, doctor, hospital, appointmentDate, timeSlot, reasonForVisit } = req.body;

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

        res.status(201).json({
            success: true,
            message: "Appointment booked successfully!",
            data: {
                tokenNumber: newAppointment.tokenNumber,
                appointmentDetails: newAppointment
            }
        });

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