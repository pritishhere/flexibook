const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const User = require('../models/user');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const DoctorLeave = require('../models/DoctorLeave');
const FamilyMember = require('../models/FamilyMember');
const inMemoryDb = require('../utils/inMemoryDb');

const DEFAULT_DOCTOR_PASSWORD = 'FlexiBook@123';
const DEFAULT_PATIENT_PASSWORD = 'Patient@123';
const DEFAULT_HEALTHCARE_SPECIALIZATION = 'General Medicine';
const DEFAULT_HOSPITAL_CONTACT = '9876543210';
const DEFAULT_DOCTOR_AVAILABILITY = [
    { day: 'Monday', startTime: '09:00', endTime: '17:00' },
    { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
    { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
    { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
    { day: 'Friday', startTime: '09:00', endTime: '17:00' },
    { day: 'Saturday', startTime: '09:00', endTime: '14:00' }
];

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const slugify = (value = 'flexibook') =>
    value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'flexibook';

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const resolveMongoBookingTargets = async (body) => {
    let { patient, doctor, hospital } = body;
    const {
        patientName,
        patientEmail,
        patientPhone,
        hospitalName,
        hospitalCity,
        hospitalAddress,
        hospitalContactNumber,
        specialization,
        consultationFee
    } = body;

    if (!patient) {
        const email = normalizeEmail(patientEmail);
        if (!patientName || !email) {
            throw Object.assign(new Error('Patient name and email are required to book an appointment.'), { statusCode: 400 });
        }

        let patientUser = await User.findOne({ email });
        if (!patientUser) {
            patientUser = await User.create({
                name: patientName.trim(),
                email,
                phone: patientPhone || '',
                password: DEFAULT_PATIENT_PASSWORD,
                role: 'patient'
            });
        }
        patient = patientUser._id;
    }

    if (!hospital) {
        if (!hospitalName) {
            throw Object.assign(new Error('Hospital name is required to book an appointment.'), { statusCode: 400 });
        }

        const hospitalQuery = {
            name: new RegExp(`^${escapeRegex(hospitalName.trim())}$`, 'i')
        };
        if (hospitalCity) {
            hospitalQuery.city = new RegExp(`^${escapeRegex(hospitalCity.trim())}$`, 'i');
        }

        let hospitalDoc = await Hospital.findOne(hospitalQuery);
        if (!hospitalDoc) {
            hospitalDoc = await Hospital.create({
                name: hospitalName.trim(),
                address: hospitalAddress || `${hospitalCity || 'Kolkata'}, India`,
                city: hospitalCity || 'Kolkata',
                contactNumber: hospitalContactNumber || DEFAULT_HOSPITAL_CONTACT,
                isVerified: true
            });
        }
        hospital = hospitalDoc._id;
    }

    if (!doctor) {
        let doctorDoc = await Doctor.findOne({ hospitalId: hospital, isAvailable: true });
        if (!doctorDoc) {
            const doctorEmail = `doctor.${slugify(hospitalName)}.${hospital.toString()}@flexibook.local`;
            let doctorUser = await User.findOne({ email: doctorEmail });
            if (!doctorUser) {
                doctorUser = await User.create({
                    name: `Dr. ${hospitalName || 'FlexiBook'} Care Team`,
                    email: doctorEmail,
                    password: DEFAULT_DOCTOR_PASSWORD,
                    role: 'doctor'
                });
            }

            doctorDoc = await Doctor.create({
                userId: doctorUser._id,
                hospitalId: hospital,
                specialization: specialization || DEFAULT_HEALTHCARE_SPECIALIZATION,
                qualification: 'MBBS',
                experience: 10,
                fees: Number(consultationFee) || 500,
                availability: DEFAULT_DOCTOR_AVAILABILITY,
                isAvailable: true
            });
        }
        doctor = doctorDoc._id;
    }

    return { patient, doctor, hospital };
};

const resolveInMemoryBookingTargets = (body) => {
    let { patient, doctor, hospital } = body;
    const {
        patientName,
        patientEmail,
        patientPhone,
        hospitalName,
        hospitalCity,
        hospitalAddress,
        hospitalContactNumber,
        specialization,
        consultationFee
    } = body;

    if (!patient) {
        const email = normalizeEmail(patientEmail);
        if (!patientName || !email) {
            throw Object.assign(new Error('Patient name and email are required to book an appointment.'), { statusCode: 400 });
        }

        let patientUser = inMemoryDb.users.find(u => u.email && u.email.toLowerCase() === email);
        if (!patientUser) {
            patientUser = {
                _id: new mongoose.Types.ObjectId().toString(),
                name: patientName.trim(),
                email,
                phone: patientPhone || '',
                password: DEFAULT_PATIENT_PASSWORD,
                role: 'patient',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            inMemoryDb.users.push(patientUser);
        }
        patient = patientUser._id;
    }

    if (!hospital) {
        if (!hospitalName) {
            throw Object.assign(new Error('Hospital name is required to book an appointment.'), { statusCode: 400 });
        }

        let hospitalDoc = inMemoryDb.hospitals.find(h =>
            h.name &&
            h.name.toLowerCase() === hospitalName.trim().toLowerCase() &&
            (!hospitalCity || (h.city && h.city.toLowerCase() === hospitalCity.trim().toLowerCase()))
        );

        if (!hospitalDoc) {
            hospitalDoc = {
                _id: new mongoose.Types.ObjectId().toString(),
                name: hospitalName.trim(),
                address: hospitalAddress || `${hospitalCity || 'Kolkata'}, India`,
                city: hospitalCity || 'Kolkata',
                contactNumber: hospitalContactNumber || DEFAULT_HOSPITAL_CONTACT,
                rating: 0,
                isVerified: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            inMemoryDb.hospitals.push(hospitalDoc);
        }
        hospital = hospitalDoc._id;
    }

    if (!doctor) {
        let doctorDoc = inMemoryDb.doctors.find(d => d.hospitalId === hospital && d.isAvailable !== false);
        if (!doctorDoc) {
            const doctorUser = {
                _id: new mongoose.Types.ObjectId().toString(),
                name: `Dr. ${hospitalName || 'FlexiBook'} Care Team`,
                email: `doctor.${slugify(hospitalName)}.${hospital}@flexibook.local`,
                password: DEFAULT_DOCTOR_PASSWORD,
                role: 'doctor',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            inMemoryDb.users.push(doctorUser);

            doctorDoc = {
                _id: new mongoose.Types.ObjectId().toString(),
                userId: doctorUser._id,
                hospitalId: hospital,
                specialization: specialization || DEFAULT_HEALTHCARE_SPECIALIZATION,
                qualification: 'MBBS',
                experience: 10,
                fees: Number(consultationFee) || 500,
                availability: DEFAULT_DOCTOR_AVAILABILITY,
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            inMemoryDb.doctors.push(doctorDoc);
        }
        doctor = doctorDoc._id;
    }

    return { patient, doctor, hospital };
};

// ==========================================
// 1. BOOK APPOINTMENT (Auto-Generate Token)
// ==========================================
exports.bookAppointment = async (req, res) => {
    try {
        let { patient, doctor, hospital, appointmentDate, timeSlot, reasonForVisit, bookingMode } = req.body;

        // Appointment ownership always belongs to the authenticated account.
        if (req.user) {
            patient = req.user._id || req.user.id;
        }

        if (!appointmentDate || !timeSlot) {
            return res.status(400).json({
                success: false,
                message: 'Appointment date and time slot are required.'
            });
        }

        let selectedFamilyMember = null;
        const familyMemberId = req.body.familyMemberId;
        if (familyMemberId) {
            if (!mongoose.Types.ObjectId.isValid(familyMemberId)) {
                return res.status(400).json({ success: false, message: 'Invalid family member selection.' });
            }

            const ownerId = String(req.user._id || req.user.id);
            selectedFamilyMember = inMemoryDb.isDbConnected()
                ? await FamilyMember.findOne({ _id: familyMemberId, userId: ownerId })
                : inMemoryDb.familyMembers.find(member =>
                    String(member._id) === String(familyMemberId)
                    && String(member.userId) === ownerId
                );

            if (!selectedFamilyMember) {
                return res.status(404).json({
                    success: false,
                    message: 'Family member was not found for this account.'
                });
            }
        }

        if (!patient || !doctor || !hospital) {
            const resolvedTargets = inMemoryDb.isDbConnected()
                ? await resolveMongoBookingTargets({ ...req.body, patient })
                : resolveInMemoryBookingTargets({ ...req.body, patient });

            patient = patient || resolvedTargets.patient;
            doctor = doctor || resolvedTargets.doctor;
            hospital = hospital || resolvedTargets.hospital;
        }

        if (!patient || !doctor || !hospital) {
            return res.status(400).json({
                success: false,
                message: 'Patient, doctor, and hospital details are required to book an appointment.'
            });
        }

        const appointmentDateValue = new Date(appointmentDate);
        const visitReason = reasonForVisit || (bookingMode === 'queue' ? 'Joined live queue' : 'General Checkup');
        const patientSnapshot = selectedFamilyMember
            ? {
                name: selectedFamilyMember.name,
                age: selectedFamilyMember.age,
                gender: selectedFamilyMember.gender,
                relationship: selectedFamilyMember.relationToUser
            }
            : {
                name: req.body.patientName || req.user.name,
                age: req.body.patientAge || null,
                gender: req.body.patientGender || null,
                relationship: 'Self'
            };

        // === Block booking if doctor is marked unavailable or on leave ===
        if (inMemoryDb.isDbConnected()) {
            // Check doctor's availability flag
            const doctorDoc = await Doctor.findById(doctor);
            if (doctorDoc && doctorDoc.isAvailable === false) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot book: Doctor is currently unavailable.'
                });
            }

            // Check if doctor has a leave for the appointment date
            const startOfDay = new Date(appointmentDateValue);
            startOfDay.setHours(0,0,0,0);
            const endOfDay = new Date(appointmentDateValue);
            endOfDay.setHours(23,59,59,999);

            const leave = await DoctorLeave.findOne({
                doctor: doctor,
                date: { $gte: startOfDay, $lte: endOfDay }
            });

            if (leave) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot book: Doctor is on leave for ${startOfDay.toDateString()}.`
                });
            }

            // Find the last token for this specific doctor on the given date
            const lastAppointment = await Appointment.findOne({ 
                doctor: doctor, 
                hospital: hospital, 
                appointmentDate: appointmentDateValue
            }).sort({ tokenNumber: -1 });

            // Generate the new token by incrementing the last one
            const newTokenNumber = lastAppointment ? lastAppointment.tokenNumber + 1 : 1;

            const newAppointment = new Appointment({
                patient,
                doctor,
                hospital,
                appointmentDate: appointmentDateValue,
                timeSlot,
                tokenNumber: newTokenNumber,
                reasonForVisit: visitReason,
                familyMember: selectedFamilyMember?._id || null,
                patientName: patientSnapshot.name,
                patientAge: patientSnapshot.age,
                patientGender: patientSnapshot.gender,
                patientRelationship: patientSnapshot.relationship,
                consultationFee: Number(req.body.consultationFee) || 500
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
            // Check doctor's availability flag in in-memory DB
            const docObjCheck = inMemoryDb.doctors.find(d => d._id === doctor);
            if (docObjCheck && docObjCheck.isAvailable === false) {
                return res.status(400).json({ success: false, message: 'Cannot book: Doctor is currently unavailable.' });
            }

            // Check in-memory doctor leaves for the date
            const targetDateStr = appointmentDateValue.toDateString();
            const hasLeave = (inMemoryDb.doctorLeaves || []).some(l => l.doctor === doctor && new Date(l.date).toDateString() === targetDateStr);
            if (hasLeave) {
                return res.status(400).json({ success: false, message: `Cannot book: Doctor is on leave for ${targetDateStr}.` });
            }

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
                appointmentDate: appointmentDateValue,
                timeSlot,
                tokenNumber: newTokenNumber,
                reasonForVisit: visitReason,
                familyMember: selectedFamilyMember?._id || null,
                patientName: patientSnapshot.name,
                patientAge: patientSnapshot.age,
                patientGender: patientSnapshot.gender,
                patientRelationship: patientSnapshot.relationship,
                consultationFee: Number(req.body.consultationFee) || 500,
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
                patientName = newApp.patientName || patientUser.name;
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
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : "Server error during booking",
            error: error.message
        });
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
            .populate('hospital', 'name address')
            .populate('familyMember', 'name age gender relationToUser');

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
                const patientName = appointment.patientName || (appointment.patient ? appointment.patient.name : 'Patient');

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
                patientName = appointment.patientName || patientUser.name;
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
