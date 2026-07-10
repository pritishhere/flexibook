const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const DoctorLeave = require('../models/DoctorLeave');
const User = require('../models/user');
const inMemoryDb = require('../utils/inMemoryDb');

// @desc    Add a new doctor to a hospital
exports.createDoctor = async (req, res) => {
    try {
        const { userId, name, email, password, hospitalId, departmentId, specialization, experience, consultationFee, availability } = req.body;

        let resolvedUserId = userId;

        if (mongoose.connection.readyState === 1) {
            // MongoDB Path
            if (!resolvedUserId) {
                if (!name || !email || !password) {
                    return res.status(400).json({
                        success: false,
                        message: 'To onboard a doctor, please provide either a userId OR (name, email, password)'
                    });
                }

                // Check if user already exists
                let doctorUser = await User.findOne({ email: email.toLowerCase() });
                if (doctorUser) {
                    if (doctorUser.role !== 'doctor') {
                        return res.status(400).json({
                            success: false,
                            message: `Email "${email}" is already registered as a ${doctorUser.role}. Cannot onboard as doctor.`
                        });
                    }
                    resolvedUserId = doctorUser._id;
                } else {
                    // Create User account
                    doctorUser = await User.create({
                        name,
                        email,
                        password,
                        role: 'doctor'
                    });
                    resolvedUserId = doctorUser._id;
                }
            }

            const newDoctor = await Doctor.create({
                userId: resolvedUserId,
                hospitalId,
                departmentId,
                specialization,
                experience,
                fees: consultationFee,
                availability
            });

            return res.status(201).json({
                success: true,
                message: 'Doctor added successfully (MongoDB)',
                data: newDoctor
            });
        } else {
            // In-Memory Fallback Path
            if (!resolvedUserId) {
                if (!name || !email || !password) {
                    return res.status(400).json({
                        success: false,
                        message: 'To onboard a doctor, please provide either a userId OR (name, email, password)'
                    });
                }

                // Search in-memory users
                let doctorUser = inMemoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
                if (doctorUser) {
                    if (doctorUser.role !== 'doctor') {
                        return res.status(400).json({
                            success: false,
                            message: `Email "${email}" is already registered as a ${doctorUser.role}.`
                        });
                    }
                    resolvedUserId = doctorUser._id;
                } else {
                    resolvedUserId = new mongoose.Types.ObjectId().toString();
                    doctorUser = {
                        _id: resolvedUserId,
                        name,
                        email: email.toLowerCase(),
                        password, // in test/memory, we store it raw or dummy
                        role: 'doctor',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    inMemoryDb.users.push(doctorUser);
                }
            }

            if (!resolvedUserId || !hospitalId || !specialization || !experience || !consultationFee) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed: hospitalId, specialization, experience, and consultationFee are required'
                });
            }

            const newDoctor = {
                _id: new mongoose.Types.ObjectId().toString(),
                userId: resolvedUserId.toString(),
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

            // Cascade delete user account
            if (doctor.userId) {
                await User.findByIdAndDelete(doctor.userId);
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

            const doctor = inMemoryDb.doctors[index];

            // Remove doctor profile
            inMemoryDb.doctors.splice(index, 1);

            // Cascade delete user account
            const userIndex = inMemoryDb.users.findIndex(u => u._id === doctor.userId);
            if (userIndex !== -1) {
                inMemoryDb.users.splice(userIndex, 1);
            }

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

        if (mongoose.connection.readyState === 1) {
            const newLeave = await DoctorLeave.create({
                doctor: doctorId || req.params.id,
                date: leaveDate,
                reason: reason
            });

            res.status(201).json({
                success: true,
                message: `Leave successfully marked for date: ${leaveDate.toDateString()}`,
                data: newLeave
            });
        } else {
            // In-Memory Fallback
            const newLeave = {
                _id: new mongoose.Types.ObjectId().toString(),
                doctor: doctorId || req.params.id,
                date: leaveDate,
                reason: reason || 'Personal Leave',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            if (!inMemoryDb.doctorLeaves) inMemoryDb.doctorLeaves = [];
            inMemoryDb.doctorLeaves.push(newLeave);

            res.status(201).json({
                success: true,
                message: `Leave successfully marked for date: ${leaveDate.toDateString()} (In-Memory)`,
                data: newLeave
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET: /api/doctors/:id/leaves — Fetch all leaves for a doctor
exports.getDoctorLeaves = async (req, res) => {
    try {
        const { id } = req.params;

        if (mongoose.connection.readyState === 1) {
            const leaves = await DoctorLeave.find({ doctor: id }).sort({ date: 1 });

            return res.status(200).json({
                success: true,
                count: leaves.length,
                data: leaves
            });
        } else {
            // In-Memory Fallback
            const leaves = (inMemoryDb.doctorLeaves || [])
                .filter(l => l.doctor === id)
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            return res.status(200).json({
                success: true,
                count: leaves.length,
                data: leaves
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch doctor leaves',
            error: error.message
        });
    }
};