const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const queueController = require('../controllers/queueController');

// Note: Uncomment the auth middleware later when DB and tokens are ready
// const { protect } = require('../middleware/authMiddleware'); 

// ==========================================
// CORE ROUTES 
// ==========================================

// POST: Book new appointment
router.post('/book', appointmentController.bookAppointment); 

// GET: Fetch patient's history
router.get('/patient/:patientId', appointmentController.getPatientAppointments);

// PUT: General manual status update
router.put('/:appointmentId/status', appointmentController.updateAppointmentStatus);

// GET: Fetch all appointments for a specific hospital (Dashboard view)
router.get('/hospital/:hospitalId', appointmentController.getHospitalAppointments);

// PUT: Update appointment payment status (Dashboard view)
router.put('/:appointmentId/payment', appointmentController.updatePaymentStatus);

// PUT: Reschedule appointment to a new date/timeslot
router.put('/:appointmentId/reschedule', appointmentController.rescheduleAppointment);


// ==========================================
// ADVANCED HOSPITAL LOGIC (Live Queue Management)
// ==========================================

// GET: Fetch live queue data (Who is inside, who is next)
router.get('/live-queue', appointmentController.getLiveQueueStatus);

// PUT: Assistant action - Let patient inside the cabin
router.put('/:appointmentId/admit', appointmentController.admitPatient);

// PUT: Assistant action - Mark patient as absent (Skip token)
router.put('/:appointmentId/no-show', appointmentController.markNoShow);

// 🔥 LIVE WEBSOCKET TRIGGERS (Naye Routes)
router.post('/next-patient', queueController.callNextPatient);
router.post('/trigger-emergency', queueController.triggerEmergency);
module.exports = router;