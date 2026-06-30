const Hospital = require('../models/Hospital');

// @desc    Create a new hospital (Typically for Business Owners)
exports.createHospital = async (req, res) => {
    try {
        // Extract data sent from the frontend
        const { name, address, city, contactNumber, emergencyNumber } = req.body;

        // Create and save the new hospital in the database
        const newHospital = await Hospital.create({
            name,
            address,
            city,
            contactNumber,
            emergencyNumber
        });

        res.status(201).json({
            success: true,
            message: 'Hospital created successfully',
            data: newHospital
        });
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
        // 🔥 PRO FEATURE: Smart search by city (e.g., /api/hospitals?city=Mumbai)
        const { city } = req.query;
        let query = {};
        
        if (city) {
            // $regex makes the search case-insensitive (mumbai = Mumbai)
            query.city = { $regex: city, $options: 'i' }; 
        }

        // Fetch hospitals based on the query (all or filtered by city)
        const hospitals = await Hospital.find(query);

        res.status(200).json({
            success: true,
            count: hospitals.length,
            data: hospitals
        });
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
        // Find the hospital using the ID passed in the URL (e.g., /api/hospitals/12345)
        const hospital = await Hospital.findById(req.params.id);

        // If no hospital is found with that ID
        if (!hospital) {
            return res.status(404).json({ 
                success: false, 
                message: 'Hospital not found' 
            });
        }

        // Return the found hospital
        res.status(200).json({
            success: true,
            data: hospital
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error finding hospital', 
            error: error.message 
        });
    }
};