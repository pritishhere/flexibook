const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

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


// ==========================================
// ADVANCED HOSPITAL LOGIC (Live Queue Management)
// ==========================================

// GET: Fetch live queue data (Who is inside, who is next)
router.get('/live-queue', appointmentController.getLiveQueueStatus);

// PUT: Assistant action - Let patient inside the cabin
router.put('/:appointmentId/admit', appointmentController.admitPatient);

// PUT: Assistant action - Mark patient as absent (Skip token)
router.put('/:appointmentId/no-show', appointmentController.markNoShow);


module.exports = router;