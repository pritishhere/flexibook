const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const DoctorLeave = require('../models/DoctorLeave');
const inMemoryDb = require('../utils/inMemoryDb');

// @desc    Add a new doctor to a hospital
exports.createDoctor = async (req, res) => {
    try {
        const { userId, hospitalId, departmentId, specialization, experience, consultationFee, availability } = req.body;

        if (mongoose.connection.readyState === 1) {
            const newDoctor = await Doctor.create({
                userId,         // Doctor's basic info (name, email) comes from the User model
                hospitalId,     // Hospital where they work
                departmentId,   // Optional department ID
                specialization,
                experience,
                fees: consultationFee,
                availability    // e.g., ["Monday", "Wednesday", "Friday"]
            });

            return res.status(201).json({
                success: true,
                message: 'Doctor added successfully (MongoDB)',
                data: newDoctor
            });
        } else {
            // In-Memory Fallback
            if (!userId || !hospitalId || !specialization || !experience || !consultationFee) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed: userId, hospitalId, specialization, experience, and consultationFee are required'
                });
            }

            const newDoctor = {
                _id: new mongoose.Types.ObjectId().toString(),
                userId: userId.toString(),
                hospitalId: hospitalId.toString(),
                departmentId: departmentId ? departmentId.toString() : null,
                specialization,
                experience: Number(experience),
                fees: Number(consultationFee),
                availability: availability || [],
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            inMemoryDb.doctors.push(newDoctor);

            return res.status(201).json({
                success: true,
                message: 'Doctor added successfully (In-Memory Fallback)',
                data: newDoctor
            });
        }
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

        if (mongoose.connection.readyState === 1) {
            let query = {};
            if (hospitalId) query.hospitalId = hospitalId;
            if (specialization) query.specialization = { $regex: specialization, $options: 'i' };

            const doctors = await Doctor.find(query)
                .populate('userId', 'name email')
                .populate('hospitalId', 'name city');

            return res.status(200).json({
                success: true,
                count: doctors.length,
                data: doctors
            });
        } else {
            // In-Memory Fallback
            let filteredDoctors = inMemoryDb.doctors;

            if (hospitalId) {
                filteredDoctors = filteredDoctors.filter(d => d.hospitalId === hospitalId);
            }

            if (specialization) {
                filteredDoctors = filteredDoctors.filter(d => 
                    d.specialization && d.specialization.toLowerCase().includes(specialization.toLowerCase())
                );
            }

            // Populate mock user and hospital
            const populated = filteredDoctors.map(d => {
                const user = inMemoryDb.users.find(u => u._id === d.userId);
                const hospital = inMemoryDb.hospitals.find(h => h._id === d.hospitalId);
                return {
                    ...d,
                    userId: user ? { _id: user._id, name: user.name, email: user.email } : d.userId,
                    hospitalId: hospital ? { _id: hospital._id, name: hospital.name, city: hospital.city } : d.hospitalId
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
            message: 'Failed to fetch doctors', 
            error: error.message 
        });
    }
};

// @desc    Get a single doctor by their ID
exports.getDoctorById = async (req, res) => {
    try {
        const { id } = req.params;

        if (mongoose.connection.readyState === 1) {
            const doctor = await Doctor.findById(id)
                .populate('userId', 'name email')
                .populate('hospitalId', 'name address city');

            if (!doctor) {
                return res.status(404).json({ success: false, message: 'Doctor not found' });
            }

            return res.status(200).json({
                success: true,
                data: doctor
            });
        } else {
            // In-Memory Fallback
            const doctor = inMemoryDb.doctors.find(d => d._id === id);
            if (!doctor) {
                return res.status(404).json({ success: false, message: 'Doctor not found' });
            }

            const user = inMemoryDb.users.find(u => u._id === doctor.userId);
            const hospital = inMemoryDb.hospitals.find(h => h._id === doctor.hospitalId);

            const populated = {
                ...doctor,
                userId: user ? { _id: user._id, name: user.name, email: user.email } : doctor.userId,
                hospitalId: hospital ? { _id: hospital._id, name: hospital.name, address: hospital.address, city: hospital.city } : doctor.hospitalId
            };

            return res.status(200).json({
                success: true,
                data: populated
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error finding doctor', 
            error: error.message 
        });
    }
};

// @desc    Update doctor details by ID
exports.updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        // Map consultationFee to fees if provided
        if (updates.consultationFee !== undefined) {
            updates.fees = Number(updates.consultationFee);
            delete updates.consultationFee;
        }

        if (mongoose.connection.readyState === 1) {
            // Validate references if updated
            if (updates.hospitalId && !mongoose.Types.ObjectId.isValid(updates.hospitalId)) {
                return res.status(400).json({ success: false, message: 'Invalid hospital ID format' });
            }
            if (updates.departmentId && !mongoose.Types.ObjectId.isValid(updates.departmentId)) {
                return res.status(400).json({ success: false, message: 'Invalid department ID format' });
            }

            const doctor = await Doctor.findByIdAndUpdate(id, updates, {
                new: true,
                runValidators: true
            }).populate('userId', 'name email').populate('hospitalId', 'name city');

            if (!doctor) {
                return res.status(404).json({ success: false, message: 'Doctor not found' });
            }

            return res.status(200).json({
                success: true,
                message: 'Doctor updated successfully (MongoDB)',
                data: doctor
            });
        } else {
            // In-Memory Fallback
            const index = inMemoryDb.doctors.findIndex(d => d._id === id);
            if (index === -1) {
                return res.status(404).json({ success: false, message: 'Doctor not found' });
            }

            // Merge updates
            inMemoryDb.doctors[index] = {
                ...inMemoryDb.doctors[index],
                ...updates,
                updatedAt: new Date()
            };

            const doctor = inMemoryDb.doctors[index];
            const user = inMemoryDb.users.find(u => u._id === doctor.userId);
            const hospital = inMemoryDb.hospitals.find(h => h._id === doctor.hospitalId);

            const populated = {
                ...doctor,
                userId: user ? { _id: user._id, name: user.name, email: user.email } : doctor.userId,
                hospitalId: hospital ? { _id: hospital._id, name: hospital.name, city: hospital.city } : doctor.hospitalId
            };

            return res.status(200).json({
                success: true,
                message: 'Doctor updated successfully (In-Memory Fallback)',
                data: populated
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating doctor',
            error: error.message
        });
    }
};

// @desc    Delete a doctor profile
exports.deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;

        if (mongoose.connection.readyState === 1) {
            const doctor = await Doctor.findByIdAndDelete(id);
            if (!doctor) {
                return res.status(404).json({ success: false, message: 'Doctor not found' });
            }

            return res.status(200).json({
                success: true,
                message: 'Doctor deleted successfully (MongoDB)'
            });
        } else {
            // In-Memory Fallback
            const index = inMemoryDb.doctors.findIndex(d => d._id === id);
            if (index === -1) {
                return res.status(404).json({ success: false, message: 'Doctor not found' });
            }

            inMemoryDb.doctors.splice(index, 1);

            return res.status(200).json({
                success: true,
                message: 'Doctor deleted successfully (In-Memory Fallback)'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting doctor',
            error: error.message
        });
    }
};

// POST: /api/doctors/leave
exports.addDoctorLeave = async (req, res) => {
    try {
        const { doctorId, date, reason } = req.body;

        // Date ko standard midnight time par set karna zaroori hai taaki match karne mein error na aaye
        const leaveDate = new Date(date);
        leaveDate.setHours(0, 0, 0, 0);

        const newLeave = await DoctorLeave.create({
            doctor: doctorId,
            date: leaveDate,
            reason: reason
        });

        res.status(201).json({
            success: true,
            message: `Leave successfully marked for date: ${leaveDate.toDateString()}`,
            data: newLeave
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};