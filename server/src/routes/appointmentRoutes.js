const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const queueController = require('../controllers/queueController');
const { protect } = require('../middleware/authMiddleware'); 

// ==========================================
// CORE ROUTES 
// ==========================================

// POST: Book new appointment
router.post('/book', protect, appointmentController.bookAppointment); 

// GET: Fetch patient's history
router.get('/patient/:patientId', protect, appointmentController.getPatientAppointments);

// PUT: General manual status update
router.put('/:appointmentId/status', protect, appointmentController.updateAppointmentStatus);

// GET: Fetch all appointments for a specific hospital (Dashboard view)
router.get('/hospital/:hospitalId', protect, appointmentController.getHospitalAppointments);

// PUT: Update appointment payment status (Dashboard view)
router.put('/:appointmentId/payment', protect, appointmentController.updatePaymentStatus);

// PUT: Reschedule appointment to a new date/timeslot
router.put('/:appointmentId/reschedule', protect, appointmentController.rescheduleAppointment);


// ==========================================
// ADVANCED HOSPITAL LOGIC (Live Queue Management)
// ==========================================

// GET: Fetch live queue data (Who is inside, who is next)
router.get('/live-queue', appointmentController.getLiveQueueStatus);

// PUT: Assistant action - Let patient inside the cabin
router.put('/:appointmentId/admit', protect, appointmentController.admitPatient);

// PUT: Assistant action - Mark patient as absent (Skip token)
router.put('/:appointmentId/no-show', protect, appointmentController.markNoShow);

// 🔥 LIVE WEBSOCKET TRIGGERS (Naye Routes)
router.post('/next-patient', protect, queueController.callNextPatient);
router.post('/trigger-emergency', protect, queueController.triggerEmergency);
module.exports = router;