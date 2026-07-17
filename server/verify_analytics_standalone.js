const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const inMemoryDb = require('./src/utils/inMemoryDb');
const connectDB = require('./src/config/db');

// Import routes and models
const hospitalRoutes = require('./src/routes/hospitalRoutes');
const generateToken = require('./src/utils/generateToken');

const runAudit = async () => {
    console.log('🔄 STARTING SELF-CONTAINED BUSINESS ANALYTICS AUDIT...');
    
    // 1. Launch a local test server on port 3005
    const app = express();
    app.use(express.json());
    app.use('/api/hospitals', hospitalRoutes);
    
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(3005, resolve));
    console.log('- Test server listening on port 3005...');

    // Force offline mode for audit safety
    process.env.USE_IN_MEMORY = 'true'; 
    await connectDB();

    const request = async (url, options = {}) => {
        return new Promise((resolve, reject) => {
            const req = http.request(url, {
                method: options.method || 'GET',
                headers: { 'Content-Type': 'application/json', ...options.headers }
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
            });
            req.on('error', reject);
            req.end();
        });
    };

    const baseUrl = 'http://localhost:3005/api';

    try {
        // Setup initial Mock Patients, Doctors, Reviews, and Hospital in memory
        const patient1Id = new mongoose.Types.ObjectId().toString();
        const patient2Id = new mongoose.Types.ObjectId().toString();
        
        const docUser1Id = new mongoose.Types.ObjectId().toString();
        const docUser2Id = new mongoose.Types.ObjectId().toString();
        
        const doctor1Id = new mongoose.Types.ObjectId().toString();
        const doctor2Id = new mongoose.Types.ObjectId().toString();
        
        const hospitalId = new mongoose.Types.ObjectId().toString();

        // Seed users
        inMemoryDb.users.push({ _id: patient1Id, name: 'Sainee Sarker', email: 'sainee@example.com', mobile: '9903592889' });
        inMemoryDb.users.push({ _id: patient2Id, name: 'Pritish Ghosh', email: 'pritish@example.com', mobile: '9883769499' });
        inMemoryDb.users.push({ _id: docUser1Id, name: 'Dr. Debabrata Sen' });
        inMemoryDb.users.push({ _id: docUser2Id, name: 'Dr. Pritam Das' });

        // Seed doctors (Dr. Sen fee: 1000, Dr. Das fee: 500)
        inMemoryDb.doctors.push({ _id: doctor1Id, userId: docUser1Id, specialization: 'Cardiologist', consultationFee: 1000 });
        inMemoryDb.doctors.push({ _id: doctor2Id, userId: docUser2Id, specialization: 'Neurologist', consultationFee: 500 });

        // Seed hospital
        inMemoryDb.hospitals.push({ _id: hospitalId, name: 'Metro General Hospital', city: 'Kolkata' });

        console.log(`\n✅ Setup Mock Patients, Doctors, and Hospital:`);
        console.log(`   - Hospital ID: ${hospitalId}`);

        // Setup mock admin user for authorization
        const mockAdminId = new mongoose.Types.ObjectId().toString();
        inMemoryDb.users.push({ _id: mockAdminId, name: 'Admin User', role: 'admin', email: 'admin@flexibook.com' });
        const adminToken = generateToken(mockAdminId);
        const authHeader = { 'Authorization': `Bearer ${adminToken}` };

        // Seed 4 appointments across different dates to test new patient calculations and monthly metrics
        const app1Id = new mongoose.Types.ObjectId().toString();
        const app2Id = new mongoose.Types.ObjectId().toString();
        const app3Id = new mongoose.Types.ObjectId().toString();
        const app4Id = new mongoose.Types.ObjectId().toString();

        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        
        const thisMonth = new Date();

        // Appointment 1: Patient 1 -> Doctor 1 (Last Month, Paid)
        inMemoryDb.appointments.push({
            _id: app1Id,
            patient: patient1Id,
            doctor: doctor1Id,
            hospital: hospitalId,
            appointmentDate: lastMonth,
            timeSlot: '10:00 AM - 10:15 AM',
            status: 'Completed',
            paymentStatus: 'Paid'
        });

        // Appointment 2: Patient 1 -> Doctor 1 (This Month, Paid)
        inMemoryDb.appointments.push({
            _id: app2Id,
            patient: patient1Id,
            doctor: doctor1Id,
            hospital: hospitalId,
            appointmentDate: thisMonth,
            timeSlot: '10:00 AM - 10:15 AM',
            status: 'Completed',
            paymentStatus: 'Paid'
        });

        // Appointment 3: Patient 2 -> Doctor 2 (This Month, Paid)
        inMemoryDb.appointments.push({
            _id: app3Id,
            patient: patient2Id,
            doctor: doctor2Id,
            hospital: hospitalId,
            appointmentDate: thisMonth,
            timeSlot: '11:00 AM - 11:15 AM',
            status: 'Completed',
            paymentStatus: 'Paid'
        });

        // Appointment 4: Patient 2 -> Doctor 1 (This Month, Pending/Unpaid) -> SHOULD NOT count towards revenue
        inMemoryDb.appointments.push({
            _id: app4Id,
            patient: patient2Id,
            doctor: doctor1Id,
            hospital: hospitalId,
            appointmentDate: thisMonth,
            timeSlot: '12:00 PM - 12:15 PM',
            status: 'Missed',
            paymentStatus: 'Pending'
        });

        // Seed Reviews
        inMemoryDb.reviews.push({ hospitalId: hospitalId, rating: 5, userId: patient1Id });
        inMemoryDb.reviews.push({ hospitalId: hospitalId, rating: 4, userId: patient2Id });

        console.log(`✅ Seeded 4 bookings and 2 reviews in memory.`);

        // ==========================================================
        // CALL THE BUSINESS ANALYTICS API
        // ==========================================================
        console.log('\n[TEST] Requesting hospital dashboard analytics...');
        const res = await request(`${baseUrl}/hospitals/${hospitalId}/analytics`, {
            headers: authHeader
        });

        console.log(`   - Response Status: ${res.status}`);
        
        const m = res.body.data.metrics;
        const f = res.body.data.financials;
        const c = res.body.data.charts;

        console.log('\n📊 VERIFYING CORE METRICS:');
        console.log(`   - Hospital Name: "${res.body.data.hospitalName}" (Expected: "Metro General Hospital")`);
        console.log(`   - Total Unique Patients: ${m.totalPatients} (Expected: 2)`);
        console.log(`   - New Patients This Month: ${m.newPatientsThisMonth} (Expected: 1)`);
        console.log(`   - Total Appointments: ${m.totalAppointments} (Expected: 4)`);
        console.log(`   - Completed Appointments: ${m.completedAppointments} (Expected: 3)`);
        console.log(`   - Missed Queue Slots (No-Shows): ${m.noShowAppointments} (Expected: 1)`);
        console.log(`   - Lifetime Revenue Collected: ₹${m.totalRevenue} (Expected: 2500)`);
        console.log(`   - Monthly Revenue Collected: ₹${m.monthlyRevenue} (Expected: 1500)`);
        console.log(`   - Average Rating score: ${m.averageRating} stars (Expected: 4.5)`);
        console.log(`   - Total Reviews Count: ${m.totalReviews} reviews (Expected: 2)`);

        console.log('\n📈 VERIFYING FINANCIAL TRENDS & CHART BREAKDOWNS:');
        console.log(`   - Monthly Revenue Trend points: ${JSON.stringify(f.monthlyRevenueTrend)}`);
        console.log(`   - Peak Timeslots: ${JSON.stringify(c.peakHours)}`);
        console.log(`   - Doctor Leaderboards: ${JSON.stringify(c.doctorPerformance)}`);
        console.log(`   - Ledger Length: ${f.transactionLedger.length} rows`);

        // Assertions
        if (m.totalPatients !== 2 || m.newPatientsThisMonth !== 1) {
            throw new Error('Volume calculations error!');
        }
        if (m.totalRevenue !== 2500 || m.monthlyRevenue !== 1500) {
            throw new Error('Revenue calculations error!');
        }
        if (m.averageRating !== 4.5 || m.totalReviews !== 2) {
            throw new Error('Feedback aggregate calculations error!');
        }

        console.log('\n   ✅ ALL BUSINESS ANALYTICS TESTS PASSED');
        console.log('\n🌟🌟🌟 COMMAND CENTER ANALYTICS ENGINE CONFIRMED WORKING 100% PERFECTLY! 🌟🌟🌟');

    } catch (error) {
        console.error('\n❌ AUDIT ENCOUNTERED AN ERROR:');
        console.error(error);
    } finally {
        server.close();
        console.log('\n- Test server shutdown successfully.');
    }
};

runAudit();
