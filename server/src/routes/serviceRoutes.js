const express = require('express');
const router = express.Router();
const { 
    createService, 
    getServices, 
    getServiceById 
} = require('../controllers/serviceController');

// 🌐 POST /api/services - Create a new service under a hospital/department
router.post('/', createService);

// 🌐 GET /api/services - Get all services (can filter by hospitalId or departmentId query params)
router.get('/', getServices);

// 🌐 GET /api/services/:id - Get details of a specific service by its ID
router.get('/:id', getServiceById);

module.exports = router;
