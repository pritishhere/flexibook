const express = require('express');
const router = express.Router();

const { 
    createDoctor, 
    getDoctors, 
    getDoctorById,
    updateDoctor,
    deleteDoctor
} = require('../controllers/doctorcontroller');

// 🌐 GET /api/doctors - Get all doctors (or filter by hospital/specialization)
router.get('/', getDoctors);

// 🌐 POST /api/doctors - Add a new doctor
router.post('/', createDoctor);

// 🌐 GET /api/doctors/:id - Get full details of a specific doctor
router.get('/:id', getDoctorById);

// 🌐 PUT /api/doctors/:id - Update details of a specific doctor
router.put('/:id', updateDoctor);

// 🌐 DELETE /api/doctors/:id - Delete a specific doctor
router.delete('/:id', deleteDoctor);

module.exports = router;