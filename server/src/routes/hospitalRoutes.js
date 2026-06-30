const express = require('express');
const router = express.Router();

// Import the logic functions from the hospital controller
const { 
    createHospital, 
    getAllHospitals, 
    getHospitalById 
} = require('../controllers/hospitalController');

// 🌐 GET /api/hospitals - Get a list of all hospitals (or search by city)
router.get('/', getAllHospitals);

// 🌐 POST /api/hospitals - Add a new hospital to the database
router.post('/', createHospital);

// 🌐 GET /api/hospitals/:id - Get full details of one specific hospital
router.get('/:id', getHospitalById);

module.exports = router;