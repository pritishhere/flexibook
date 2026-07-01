const express = require('express');
const router = express.Router();
const { 
    createService, 
    getServices, 
    getServiceById,
    updateService,
    deleteService
} = require('../controllers/serviceController');

// 🌐 POST /api/services - Create a new service under a hospital/department
router.post('/', createService);

// 🌐 GET /api/services - Get all services (can filter by hospitalId or departmentId query params)
router.get('/', getServices);

// 🌐 GET /api/services/:id - Get details of a specific service by its ID
router.get('/:id', getServiceById);

// 🌐 PUT /api/services/:id - Update details of a specific service
router.put('/:id', updateService);

// 🌐 DELETE /api/services/:id - Delete a specific service
router.delete('/:id', deleteService);

module.exports = router;
