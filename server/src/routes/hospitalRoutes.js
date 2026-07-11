const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Import the logic functions from the hospital controller
const { 
    createHospital, 
    getAllHospitals, 
    getHospitalById,
    updateHospital,
    deleteHospital,
    getHospitalAnalytics
} = require('../controllers/hospitalController');

// 🌐 GET /api/hospitals - Get a list of all hospitals (or search by city)
router.get('/', getAllHospitals);

// 🌐 GET /api/hospitals/:id/analytics - Get business analytics for the hospital (Command Center)
router.get('/:id/analytics', protect, authorize('admin', 'business'), getHospitalAnalytics);

// 🌐 POST /api/hospitals - Add a new hospital to the database
router.post('/', protect, authorize('admin', 'business'), createHospital);

// 🌐 GET /api/hospitals/:id - Get full details of one specific hospital
router.get('/:id', getHospitalById);

// 🌐 PUT /api/hospitals/:id - Update details of a specific hospital
router.put('/:id', protect, authorize('admin', 'business'), updateHospital);

// 🌐 DELETE /api/hospitals/:id - Delete a specific hospital
router.delete('/:id', protect, authorize('admin'), deleteHospital);

module.exports = router;