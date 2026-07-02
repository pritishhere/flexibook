const express = require('express');
const router = express.Router();

// Import the logic functions from the hospital controller
const { 
    createHospital, 
    getAllHospitals, 
    getHospitalById,
    updateHospital,
    deleteHospital
} = require('../controllers/hospitalController');
// Open/Public routes
router.get('/all', doctorController.getAllDoctors);

// Protected administrative actions
router.post('/add-new', protect, authorize('admin'), doctorController.registerDoctor);
router.delete('/:id', protect, authorize('admin'), doctorController.removeDoctor);
// 🌐 GET /api/hospitals - Get a list of all hospitals (or search by city)
router.get('/', getAllHospitals);

// 🌐 POST /api/hospitals - Add a new hospital to the database
router.post('/', createHospital);

// 🌐 GET /api/hospitals/:id - Get full details of one specific hospital
router.get('/:id', getHospitalById);

// 🌐 PUT /api/hospitals/:id - Update details of a specific hospital
router.put('/:id', updateHospital);

// 🌐 DELETE /api/hospitals/:id - Delete a specific hospital
router.delete('/:id', deleteHospital);

module.exports = router;