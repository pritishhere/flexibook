const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
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
router.post('/', protect, authorize('admin', 'business'), createDoctor);

// 🌐 GET /api/doctors/:id - Get details of a specific doctor
router.get('/:id', getDoctorById);

// 🌐 PUT /api/doctors/:id - Update details of a specific doctor
router.put('/:id', protect, authorize('admin', 'business'), updateDoctor);

// 🌐 DELETE /api/doctors/:id - Delete a specific doctor
router.delete('/:id', protect, authorize('admin', 'business'), deleteDoctor);

// 🌐 POST /api/doctors/:id/leave - Add a leave for a specific doctor
router.post('/:id/leave', protect, authorize('admin', 'business', 'doctor'), addDoctorLeave);

// 🌐 GET /api/doctors/:id/leaves - Get all leaves for a specific doctor
router.get('/:id/leaves', getDoctorLeaves);


module.exports = router;
