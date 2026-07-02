const express = require('express');
const router = express.Router();
const { 
    createDoctor, 
    getDoctors, 
    getDoctorById 
} = require('../controllers/doctorcontroller');

// 🌐 GET /api/doctors - Get all doctors (with optional specialization/hospital search query)
router.get('/', getDoctors);

// 🌐 POST /api/doctors - Add a new doctor
router.post('/', createDoctor);

// 🌐 GET /api/doctors/:id - Get details of a specific doctor
router.get('/:id', getDoctorById);

module.exports = router;