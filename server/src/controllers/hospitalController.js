const mongoose = require('mongoose');
const Hospital = require('../models/Hospital');
const inMemoryDb = require('../utils/inMemoryDb');

// @desc    Create a new hospital (Typically for Business Owners)
exports.createHospital = async (req, res) => {
    try {
        // Extract data sent from the frontend
        const { name, address, city, contactNumber, emergencyNumber } = req.body;

        if (mongoose.connection.readyState === 1) {
            // Create and save the new hospital in the database
            const newHospital = await Hospital.create({
                name,
                address,
                city,
                contactNumber,
                emergencyNumber
            });

            return res.status(201).json({
                success: true,
                message: 'Hospital created successfully (MongoDB)',
                data: newHospital
            });
        } else {
            // Use In-Memory fallback
            if (!name || !address || !city || !contactNumber) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed: name, address, city, and contactNumber are required'
                });
            }

            const newHospital = {
                _id: new mongoose.Types.ObjectId().toString(),
                name,
                address,
                city,
                contactNumber,
                emergencyNumber: emergencyNumber || '',
                rating: 0,
                isVerified: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            inMemoryDb.hospitals.push(newHospital);

            return res.status(201).json({
                success: true,
                message: 'Hospital created successfully (In-Memory Fallback)',
                data: newHospital
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create hospital', 
            error: error.message 
        });
    }
};

// @desc    Get all hospitals (For Patient App Home Screen)
exports.getAllHospitals = async (req, res) => {
    try {
        const { city } = req.query;
        
        if (mongoose.connection.readyState === 1) {
            let query = {};
            if (city) {
                query.city = { $regex: city, $options: 'i' }; 
            }
            const hospitals = await Hospital.find(query);

            return res.status(200).json({
                success: true,
                count: hospitals.length,
                data: hospitals
            });
        } else {
            // Use In-Memory fallback
            let filteredHospitals = inMemoryDb.hospitals;
            if (city) {
                filteredHospitals = inMemoryDb.hospitals.filter(h => 
                    h.city && h.city.toLowerCase().includes(city.toLowerCase())
                );
            }

            return res.status(200).json({
                success: true,
                count: filteredHospitals.length,
                data: filteredHospitals
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch hospitals', 
            error: error.message 
        });
    }
};

// @desc    Get a single hospital by ID (When user clicks on a hospital card)
exports.getHospitalById = async (req, res) => {
    try {
        const { id } = req.params;

        if (mongoose.connection.readyState === 1) {
            const hospital = await Hospital.findById(id);
            if (!hospital) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Hospital not found' 
                });
            }

            return res.status(200).json({
                success: true,
                data: hospital
            });
        } else {
            // Use In-Memory fallback
            const hospital = inMemoryDb.hospitals.find(h => h._id === id);
            if (!hospital) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Hospital not found' 
                });
            }

            return res.status(200).json({
                success: true,
                data: hospital
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error finding hospital', 
            error: error.message 
        });
    }
};