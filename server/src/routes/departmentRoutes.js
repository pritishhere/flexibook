const express = require('express');
const router = express.Router();
const { 
    createDepartment, 
    getDepartments, 
    getDepartmentById 
} = require('../controllers/departmentController');

// 🌐 POST /api/departments - Create a new department under a hospital
router.post('/', createDepartment);

// 🌐 GET /api/departments - Get departments (can filter by hospitalId query param)
router.get('/', getDepartments);

// 🌐 GET /api/departments/:id - Get a specific department by its ID
router.get('/:id', getDepartmentById);

module.exports = router;
