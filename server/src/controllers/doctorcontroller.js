const Doctor = require('../models/Doctor');

// @desc    Add a new doctor to a hospital
exports.createDoctor = async (req, res) => {
    try {
        const { userId, hospitalId, specialization, experience, consultationFee, availability } = req.body;

        const newDoctor = await Doctor.create({
            userId,         // Doctor's basic info (name, email) comes from the User model
            hospitalId,     // Hospital where they work
            specialization,
            experience,
            consultationFee,
            availability    // e.g., ["Monday", "Wednesday", "Friday"]
        });

        res.status(201).json({
            success: true,
            message: 'Doctor added successfully',
            data: newDoctor
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to add doctor', 
            error: error.message 
        });
    }
};

// @desc    Get all doctors (With optional filter by Hospital or Specialization)
exports.getDoctors = async (req, res) => {
    try {
        const { hospitalId, specialization } = req.query;
        let query = {};

        // If user wants doctors of a specific hospital
        if (hospitalId) query.hospitalId = hospitalId;
        
        // If user is searching for a specific specialist (e.g., Cardiologist)
        if (specialization) query.specialization = { $regex: specialization, $options: 'i' };

        // Fetch doctors and automatically get their Name and Email from the User collection using 'populate'
        const doctors = await Doctor.find(query).populate('userId', 'name email').populate('hospitalId', 'name city');

        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch doctors', 
            error: error.message 
        });
    }
};

// @desc    Get a single doctor by their ID
exports.getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id)
            .populate('userId', 'name email')
            .populate('hospitalId', 'name address city');

        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        res.status(200).json({
            success: true,
            data: doctor
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error finding doctor', 
            error: error.message 
        });
    }
};