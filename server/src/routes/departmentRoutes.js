const express = require('express');
const router = express.Router();
const { 
    createDepartment, 
    getDepartments, 
    getDepartmentById,
    updateDepartment,
    deleteDepartment
} = require('../controllers/departmentController');

// 🌐 POST /api/departments - Create a new department under a hospital
router.post('/', createDepartment);

// 🌐 GET /api/departments - Get departments (can filter by hospitalId query param)
router.get('/', getDepartments);

// 🌐 GET /api/departments/:id - Get a specific department by its ID
router.get('/:id', getDepartmentById);

// 🌐 PUT /api/departments/:id - Update details of a specific department
router.put('/:id', updateDepartment);

// 🌐 DELETE /api/departments/:id - Delete a specific department
router.delete('/:id', deleteDepartment);

module.exports = router;
