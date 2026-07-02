const mongoose = require('mongoose');
const Department = require('../models/Department');
const inMemoryDb = require('../utils/inMemoryDb');

// @desc    Create a new department under a hospital
exports.createDepartment = async (req, res) => {
    try {
        const { name, description, hospitalId, isActive } = req.body;

        if (mongoose.connection.readyState === 1) {
            // Check if hospitalId is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid hospital ID format'
                });
            }

            const newDepartment = await Department.create({
                name,
                description,
                hospitalId,
                isActive: isActive !== undefined ? isActive : true
            });

            return res.status(201).json({
                success: true,
                message: 'Department created successfully (MongoDB)',
                data: newDepartment
            });
        } else {
            // In-memory fallback
            if (!name || !hospitalId) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed: name and hospitalId are required'
                });
            }

            const newDepartment = {
                _id: new mongoose.Types.ObjectId().toString(),
                name,
                description: description || '',
                hospitalId: hospitalId.toString(),
                isActive: isActive !== undefined ? isActive : true,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            inMemoryDb.departments.push(newDepartment);

            return res.status(201).json({
                success: true,
                message: 'Department created successfully (In-Memory Fallback)',
                data: newDepartment
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create department',
            error: error.message
        });
    }
};

// @desc    Get all departments (Optional: filter by hospitalId)
exports.getDepartments = async (req, res) => {
    try {
        const { hospitalId } = req.query;

        if (mongoose.connection.readyState === 1) {
            let query = {};
            if (hospitalId) {
                if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid hospital ID format'
                    });
                }
                query.hospitalId = hospitalId;
            }

            const departments = await Department.find(query).populate('hospitalId', 'name');

            return res.status(200).json({
                success: true,
                count: departments.length,
                data: departments
            });
        } else {
            // In-memory fallback
            let filteredDepartments = inMemoryDb.departments;
            if (hospitalId) {
                filteredDepartments = inMemoryDb.departments.filter(d => 
                    d.hospitalId === hospitalId
                );
            }

            // Mock populate name from inMemoryDb.hospitals
            const populated = filteredDepartments.map(d => {
                const hospital = inMemoryDb.hospitals.find(h => h._id === d.hospitalId);
                return {
                    ...d,
                    hospitalId: hospital ? { _id: hospital._id, name: hospital.name } : d.hospitalId
                };
            });

            return res.status(200).json({
                success: true,
                count: populated.length,
                data: populated
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch departments',
            error: error.message
        });
    }
};

// @desc    Get a single department by ID
exports.getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (mongoose.connection.readyState === 1) {
            const department = await Department.findById(id).populate('hospitalId', 'name');
            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: 'Department not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: department
            });
        } else {
            // In-memory fallback
            const department = inMemoryDb.departments.find(d => d._id === id);
            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: 'Department not found'
                });
            }

            // Mock populate
            const hospital = inMemoryDb.hospitals.find(h => h._id === department.hospitalId);
            const populated = {
                ...department,
                hospitalId: hospital ? { _id: hospital._id, name: hospital.name } : department.hospitalId
            };

            return res.status(200).json({
                success: true,
                data: populated
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error finding department',
            error: error.message
        });
    }
};

// @desc    Update a department by ID
exports.updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        if (mongoose.connection.readyState === 1) {
            // If hospitalId is provided in update, validate it
            if (req.body.hospitalId && !mongoose.Types.ObjectId.isValid(req.body.hospitalId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid hospital ID format'
                });
            }

            const department = await Department.findByIdAndUpdate(id, req.body, {
                new: true,
                runValidators: true
            }).populate('hospitalId', 'name');

            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: 'Department not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Department updated successfully (MongoDB)',
                data: department
            });
        } else {
            // Use In-Memory fallback
            const index = inMemoryDb.departments.findIndex(d => d._id === id);
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Department not found'
                });
            }

            // Merge details
            inMemoryDb.departments[index] = {
                ...inMemoryDb.departments[index],
                ...req.body,
                updatedAt: new Date()
            };

            // Mock populate
            const department = inMemoryDb.departments[index];
            const hospital = inMemoryDb.hospitals.find(h => h._id === department.hospitalId);
            const populated = {
                ...department,
                hospitalId: hospital ? { _id: hospital._id, name: hospital.name } : department.hospitalId
            };

            return res.status(200).json({
                success: true,
                message: 'Department updated successfully (In-Memory Fallback)',
                data: populated
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating department',
            error: error.message
        });
    }
};

// @desc    Delete a department by ID
exports.deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        if (mongoose.connection.readyState === 1) {
            const department = await Department.findByIdAndDelete(id);

            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: 'Department not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Department deleted successfully (MongoDB)'
            });
        } else {
            // Use In-Memory fallback
            const index = inMemoryDb.departments.findIndex(d => d._id === id);
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Department not found'
                });
            }

            inMemoryDb.departments.splice(index, 1);

            return res.status(200).json({
                success: true,
                message: 'Department deleted successfully (In-Memory Fallback)'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting department',
            error: error.message
        });
    }
};
