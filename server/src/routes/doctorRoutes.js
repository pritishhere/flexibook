const express = require('express');
const router = express.Router();
const { 
    createDoctor, 
    getDoctors, 
    getDoctorById,
    updateDoctor,
    deleteDoctor,
    addDoctorLeave,
    getDoctorLeaves
} = require('../controllers/doctorcontroller');

// 🌐 GET /api/doctors - Get all doctors (with optional specialization/hospital search query)
router.get('/', getDoctors);

// 🌐 POST /api/doctors - Add a new doctor
router.post('/', createDoctor);

// 🌐 GET /api/doctors/:id - Get details of a specific doctor
router.get('/:id', getDoctorById);

// 🌐 PUT /api/doctors/:id - Update details of a specific doctor
router.put('/:id', updateDoctor);

// 🌐 DELETE /api/doctors/:id - Delete a specific doctor
router.delete('/:id', deleteDoctor);

// 🌐 POST /api/doctors/:id/leave - Add a leave for a specific doctor
router.post('/:id/leave', addDoctorLeave);

// 🌐 GET /api/doctors/:id/leaves - Get all leaves for a specific doctor
router.get('/:id/leaves', getDoctorLeaves);


module.exports = router;
