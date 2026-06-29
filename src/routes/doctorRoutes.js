const express = require('express');
const router = express.Router();

const { 
    createDoctor, 
    getDoctors, 
    getDoctorById 
} = require('../controllers/doctorController');

// 🌐 GET /api/doctors - Get all doctors (or filter by hospital/specialization)
router.get('/', getDoctors);

// 🌐 POST /api/doctors - Add a new doctor
router.post('/', createDoctor);

// 🌐 GET /api/doctors/:id - Get full details of a specific doctor
router.get('/:id', getDoctorById);

module.exports = router;