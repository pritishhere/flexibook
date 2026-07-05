const mongoose = require('mongoose');
const Service = require('../models/Service');
const inMemoryDb = require('../utils/inMemoryDb');

// @desc    Create a new service/test under a hospital/department
exports.createService = async (req, res) => {
    try {
        const { name, description, price, duration, hospitalId, departmentId, isAvailable } = req.body;

        if (mongoose.connection.readyState === 1) {
            // Check if hospitalId is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid hospital ID format'
                });
            }

            // Check if departmentId is provided and valid
            if (departmentId && !mongoose.Types.ObjectId.isValid(departmentId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid department ID format'
                });
            }

            const newService = await Service.create({
                name,
                description,
                price,
                duration: duration !== undefined ? duration : 0,
                hospitalId,
                departmentId: departmentId || undefined,
                isAvailable: isAvailable !== undefined ? isAvailable : true
            });

            return res.status(201).json({
                success: true,
                message: 'Service created successfully (MongoDB)',
                data: newService
            });
        } else {
            // In-memory fallback
            if (!name || price === undefined || !hospitalId) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed: name, price, and hospitalId are required'
                });
            }

            const newService = {
                _id: new mongoose.Types.ObjectId().toString(),
                name,
                description: description || '',
                price: Number(price),
                duration: duration !== undefined ? Number(duration) : 0,
                hospitalId: hospitalId.toString(),
                departmentId: departmentId ? departmentId.toString() : null,
                isAvailable: isAvailable !== undefined ? isAvailable : true,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            inMemoryDb.services.push(newService);

            return res.status(201).json({
                success: true,
                message: 'Service created successfully (In-Memory Fallback)',
                data: newService
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create service',
            error: error.message
        });
    }
};

// @desc    Get all services (Optional: filter by hospitalId or departmentId)
exports.getServices = async (req, res) => {
    try {
        const { hospitalId, departmentId } = req.query;

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
            if (departmentId) {
                if (!mongoose.Types.ObjectId.isValid(departmentId)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid department ID format'
                    });
                }
                query.departmentId = departmentId;
            }

            const services = await Service.find(query)
                .populate('hospitalId', 'name')
                .populate('departmentId', 'name');

            return res.status(200).json({
                success: true,
                count: services.length,
                data: services
            });
        } else {
            // In-memory fallback
            let filteredServices = inMemoryDb.services;
            if (hospitalId) {
                filteredServices = filteredServices.filter(s => s.hospitalId === hospitalId);
            }
            if (departmentId) {
                filteredServices = filteredServices.filter(s => s.departmentId === departmentId);
            }

            // Mock populate
            const populated = filteredServices.map(s => {
                const hospital = inMemoryDb.hospitals.find(h => h._id === s.hospitalId);
                const department = inMemoryDb.departments.find(d => d._id === s.departmentId);
                return {
                    ...s,
                    hospitalId: hospital ? { _id: hospital._id, name: hospital.name } : s.hospitalId,
                    departmentId: department ? { _id: department._id, name: department.name } : s.departmentId
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
            message: 'Failed to fetch services',
            error: error.message
        });
    }
};

// @desc    Get a single service by ID
exports.getServiceById = async (req, res) => {
    try {
        const { id } = req.params;

        if (mongoose.connection.readyState === 1) {
            const service = await Service.findById(id)
                .populate('hospitalId', 'name')
                .populate('departmentId', 'name');

            if (!service) {
                return res.status(404).json({
                    success: false,
                    message: 'Service not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: service
            });
        } else {
            // In-memory fallback
            const service = inMemoryDb.services.find(s => s._id === id);
            if (!service) {
                return res.status(404).json({
                    success: false,
                    message: 'Service not found'
                });
            }

            // Mock populate
            const hospital = inMemoryDb.hospitals.find(h => h._id === service.hospitalId);
            const department = inMemoryDb.departments.find(d => d._id === service.departmentId);
            const populated = {
                ...service,
                hospitalId: hospital ? { _id: hospital._id, name: hospital.name } : service.hospitalId,
                departmentId: department ? { _id: department._id, name: department.name } : service.departmentId
            };

            return res.status(200).json({
                success: true,
                data: populated
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error finding service',
            error: error.message
        });
    }
};

// @desc    Update a service by ID
exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;

        if (mongoose.connection.readyState === 1) {
            // Validate IDs if provided
            if (req.body.hospitalId && !mongoose.Types.ObjectId.isValid(req.body.hospitalId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid hospital ID format'
                });
            }
            if (req.body.departmentId && !mongoose.Types.ObjectId.isValid(req.body.departmentId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid department ID format'
                });
            }

            const service = await Service.findByIdAndUpdate(id, req.body, {
                new: true,
                runValidators: true
            }).populate('hospitalId', 'name').populate('departmentId', 'name');

            if (!service) {
                return res.status(404).json({
                    success: false,
                    message: 'Service not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Service updated successfully (MongoDB)',
                data: service
            });
        } else {
            // Use In-Memory fallback
            const index = inMemoryDb.services.findIndex(s => s._id === id);
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Service not found'
                });
            }

            // Merge details
            inMemoryDb.services[index] = {
                ...inMemoryDb.services[index],
                ...req.body,
                updatedAt: new Date()
            };

            // Mock populate
            const service = inMemoryDb.services[index];
            const hospital = inMemoryDb.hospitals.find(h => h._id === service.hospitalId);
            const department = inMemoryDb.departments.find(d => d._id === service.departmentId);
            const populated = {
                ...service,
                hospitalId: hospital ? { _id: hospital._id, name: hospital.name } : service.hospitalId,
                departmentId: department ? { _id: department._id, name: department.name } : service.departmentId
            };

            return res.status(200).json({
                success: true,
                message: 'Service updated successfully (In-Memory Fallback)',
                data: populated
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating service',
            error: error.message
        });
    }
};

// @desc    Delete a service by ID
exports.deleteService = async (req, res) => {
    try {
        const { id } = req.params;

        if (mongoose.connection.readyState === 1) {
            const service = await Service.findByIdAndDelete(id);

            if (!service) {
                return res.status(404).json({
                    success: false,
                    message: 'Service not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Service deleted successfully (MongoDB)'
            });
        } else {
            // Use In-Memory fallback
            const index = inMemoryDb.services.findIndex(s => s._id === id);
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Service not found'
                });
            }

            inMemoryDb.services.splice(index, 1);

            return res.status(200).json({
                success: true,
                message: 'Service deleted successfully (In-Memory Fallback)'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting service',
            error: error.message
        });
    }
};
