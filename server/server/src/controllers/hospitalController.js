const mongoose = require('mongoose');
const Hospital = require('../models/Hospital');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const Doctor = require('../models/Doctor');
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

// @desc    Update a hospital by ID
exports.updateHospital = async (req, res) => {
    try {
        const { id } = req.params;

        if (mongoose.connection.readyState === 1) {
            const hospital = await Hospital.findByIdAndUpdate(id, req.body, {
                new: true,
                runValidators: true
            });

            if (!hospital) {
                return res.status(404).json({
                    success: false,
                    message: 'Hospital not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Hospital updated successfully (MongoDB)',
                data: hospital
            });
        } else {
            // Use In-Memory fallback
            const index = inMemoryDb.hospitals.findIndex(h => h._id === id);
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Hospital not found'
                });
            }

            // Merge details
            inMemoryDb.hospitals[index] = {
                ...inMemoryDb.hospitals[index],
                ...req.body,
                updatedAt: new Date()
            };

            return res.status(200).json({
                success: true,
                message: 'Hospital updated successfully (In-Memory Fallback)',
                data: inMemoryDb.hospitals[index]
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating hospital',
            error: error.message
        });
    }
};

// @desc    Delete a hospital by ID
exports.deleteHospital = async (req, res) => {
    try {
        const { id } = req.params;

        if (mongoose.connection.readyState === 1) {
            const hospital = await Hospital.findByIdAndDelete(id);

            if (!hospital) {
                return res.status(404).json({
                    success: false,
                    message: 'Hospital not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Hospital deleted successfully (MongoDB)'
            });
        } else {
            // Use In-Memory fallback
            const index = inMemoryDb.hospitals.findIndex(h => h._id === id);
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Hospital not found'
                });
            }

            inMemoryDb.hospitals.splice(index, 1);

            return res.status(200).json({
                success: true,
                message: 'Hospital deleted successfully (In-Memory Fallback)'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting hospital',
            error: error.message
        });
    }
};

// @desc    Get hospital business analytics (Command Center Dashboard)
// @route   GET /api/hospitals/:id/analytics
// @access  Private (Admin / Hospital Owner)
exports.getHospitalAnalytics = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify hospital exists
        let hospitalName = '';
        if (mongoose.connection.readyState === 1 && process.env.USE_IN_MEMORY !== 'true') {
            const hospital = await Hospital.findById(id);
            if (!hospital) {
                return res.status(404).json({ success: false, message: 'Hospital not found' });
            }
            hospitalName = hospital.name;
        } else {
            const hospital = inMemoryDb.hospitals.find(h => h._id === id);
            if (!hospital) {
                return res.status(404).json({ success: false, message: 'Hospital not found' });
            }
            hospitalName = hospital.name;
        }

        let rawAppointments = [];
        let rawReviews = [];

        if (mongoose.connection.readyState === 1 && process.env.USE_IN_MEMORY !== 'true') {
            // MongoDB Fetching
            rawAppointments = await Appointment.find({ hospital: id })
                .populate({ path: 'doctor', populate: { path: 'userId', select: 'name' } })
                .populate('patient', 'name email mobile');
            rawReviews = await Review.find({ hospitalId: id });
        } else {
            // In-Memory Fallback Fetching
            const filteredApps = inMemoryDb.appointments.filter(a => a.hospital === id);
            rawAppointments = filteredApps.map(a => {
                const patientUser = inMemoryDb.users.find(u => u._id === a.patient);
                const docObj = inMemoryDb.doctors.find(d => d._id === a.doctor);
                let populatedDoctor = a.doctor;

                if (docObj) {
                    const docUser = inMemoryDb.users.find(u => u._id === docObj.userId);
                    populatedDoctor = {
                        ...docObj,
                        userId: docUser ? { _id: docUser._id, name: docUser.name } : docObj.userId
                    };
                }

                return {
                    ...a,
                    patient: patientUser ? { _id: patientUser._id, name: patientUser.name, email: patientUser.email, mobile: patientUser.mobile } : a.patient,
                    doctor: populatedDoctor
                };
            });
            rawReviews = inMemoryDb.reviews.filter(r => r.hospitalId === id);
        }

        // ==========================================
        // 1. VOLUME ANALYTICS & GROWTH
        // ==========================================
        const uniquePatientIds = [...new Set(rawAppointments.map(a => {
            if (!a.patient) return null;
            return typeof a.patient === 'object' ? a.patient._id.toString() : a.patient.toString();
        }).filter(Boolean))];
        const totalPatients = uniquePatientIds.length;

        // Calculate New Patients this month (First booking ever is in this month)
        const firstVisits = {};
        rawAppointments.forEach(a => {
            if (!a.patient) return;
            const patientId = typeof a.patient === 'object' ? a.patient._id.toString() : a.patient.toString();
            const appDate = new Date(a.appointmentDate);
            if (!firstVisits[patientId] || appDate < firstVisits[patientId]) {
                firstVisits[patientId] = appDate;
            }
        });

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newPatientsThisMonth = Object.values(firstVisits).filter(d => d >= startOfMonth).length;

        // ==========================================
        // 2. APPOINTMENTS STATS
        // ==========================================
        const totalAppointments = rawAppointments.length;
        const completedAppointments = rawAppointments.filter(a => a.status === 'Completed').length;
        const noShowAppointments = rawAppointments.filter(a => a.status === 'Missed').length;
        const pendingAppointments = rawAppointments.filter(a => ['Pending', 'Confirmed'].includes(a.status)).length;

        // ==========================================
        // 3. REVENUE ANALYTICS (Monthly and LifeTime)
        // ==========================================
        let totalRevenue = 0;
        let monthlyRevenue = 0;
        const monthlyRevenueTrendMap = {};

        rawAppointments.forEach(a => {
            if (a.paymentStatus !== 'Paid') return;
            
            const fee = (a.doctor && a.doctor.consultationFee) ? a.doctor.consultationFee : 0;
            totalRevenue += fee;

            const appDate = new Date(a.appointmentDate);
            if (appDate >= startOfMonth) {
                monthlyRevenue += fee;
            }

            // Grouping key: e.g. "July 2026"
            const monthLabel = appDate.toLocaleString('default', { month: 'long', year: 'numeric' });
            monthlyRevenueTrendMap[monthLabel] = (monthlyRevenueTrendMap[monthLabel] || 0) + fee;
        });

        // Convert trend map to array sorted by date chronological
        const monthlyRevenueTrend = Object.keys(monthlyRevenueTrendMap).map(month => ({
            month,
            revenue: monthlyRevenueTrendMap[month]
        }));

        // ==========================================
        // 4. DOCTOR PERFORMANCE LEADERBOARD
        // ==========================================
        const doctorMap = {};
        rawAppointments.forEach(a => {
            if (!a.doctor) return;
            const docId = typeof a.doctor === 'object' ? a.doctor._id.toString() : a.doctor.toString();
            
            if (!doctorMap[docId]) {
                let name = 'Unknown Doctor';
                let specialization = 'General';
                
                if (typeof a.doctor === 'object') {
                    specialization = a.doctor.specialization || 'General';
                    if (a.doctor.userId && a.doctor.userId.name) {
                        name = a.doctor.userId.name;
                    }
                }

                doctorMap[docId] = {
                    doctorId: docId,
                    name,
                    specialization,
                    appointmentsCount: 0
                };
            }
            doctorMap[docId].appointmentsCount++;
        });

        const doctorPerformance = Object.values(doctorMap).sort((a, b) => b.appointmentsCount - a.appointmentsCount);

        // ==========================================
        // 5. PEAK HOURS (TIMESLOT ANALYTICS)
        // ==========================================
        const slotMap = {};
        rawAppointments.forEach(a => {
            if (!a.timeSlot) return;
            slotMap[a.timeSlot] = (slotMap[a.timeSlot] || 0) + 1;
        });

        const peakHours = Object.keys(slotMap).map(timeSlot => ({
            timeSlot,
            count: slotMap[timeSlot]
        })).sort((a, b) => b.count - a.count);

        // ==========================================
        // 6. FEEDBACK ANALYTICS
        // ==========================================
        const totalReviews = rawReviews.length;
        const reviewSum = rawReviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalReviews > 0 ? parseFloat((reviewSum / totalReviews).toFixed(1)) : 0;

        // ==========================================
        // 7. RECENT TRANSACTIONS / BILLING LEDGER
        // ==========================================
        const transactionLedger = rawAppointments
            .filter(a => a.paymentStatus === 'Paid')
            .map(a => ({
                appointmentId: a._id,
                patientName: a.patient ? a.patient.name : 'Unknown Patient',
                doctorName: (a.doctor && a.doctor.userId) ? a.doctor.userId.name : 'Unknown Doctor',
                amount: (a.doctor && a.doctor.consultationFee) ? a.doctor.consultationFee : 0,
                date: a.appointmentDate
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        return res.status(200).json({
            success: true,
            data: {
                hospitalName,
                metrics: {
                    totalPatients,
                    newPatientsThisMonth,
                    totalAppointments,
                    completedAppointments,
                    noShowAppointments,
                    pendingAppointments,
                    totalRevenue,
                    monthlyRevenue,
                    averageRating,
                    totalReviews
                },
                financials: {
                    monthlyRevenueTrend,
                    transactionLedger
                },
                charts: {
                    doctorPerformance,
                    peakHours
                }
            }
        });

    } catch (error) {
        console.error('Fetch Hospital Analytics Error:', error);
        res.status(500).json({ success: false, message: 'Server error compiling business analytics', error: error.message });
    }
};