const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const inMemoryDb = require('./src/utils/inMemoryDb');
const connectDB = require('./src/config/db');

// Import routes and models
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const authRoutes = require('./src/routes/authRoutes');

const runAudit = async () => {
    console.log('🔄 STARTING SELF-CONTAINED APPOINTMENT RESCHEDULING AUDIT...');
    
    // 1. Launch a local test server on port 3005
    const app = express();
    app.use(express.json());
    app.use('/api/appointments', appointmentRoutes);
    app.use('/api/auth', authRoutes);
    
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
            if (options.body) req.write(JSON.stringify(options.body));
            req.end();
        });
    };

    const baseUrl = 'http://localhost:3005/api';

    try {
        // Setup initial Mock Patients, Doctors, and Hospital in memory
        const docUserId = new mongoose.Types.ObjectId().toString();
        const doctorId = new mongoose.Types.ObjectId().toString();
        const hospitalId = new mongoose.Types.ObjectId().toString();
        // Seed users (We use the real verified email to test the SMTP updating trigger)
        const signupRes = await request(`${baseUrl}/auth/signup`, {
            method: 'POST',
            body: {
                name: 'Sainee Sarker',
                email: process.env.SMTP_USER || `ghoshpritish_${Date.now()}@example.com`,
                password: 'password123',
                mobile: '+919903592889',
                role: 'patient'
            }
        });
        const patientId = signupRes.body._id;
        const patientToken = signupRes.body.token;
        const authHeader = { 'Authorization': `Bearer ${patientToken}` };
        inMemoryDb.users.push({ _id: docUserId, name: 'Dr. Debabrata Sen' });

        // Seed doctor
        inMemoryDb.doctors.push({ _id: doctorId, userId: docUserId, specialization: 'Cardiologist', consultationFee: 1000 });

        // Seed hospital
        inMemoryDb.hospitals.push({ _id: hospitalId, name: 'Metro General Hospital', city: 'Kolkata' });

        console.log(`\n✅ Setup Mock Patient, Doctor, and Hospital:`);
        console.log(`   - Patient: Sainee Sarker (${process.env.SMTP_USER || 'ghoshpritish111@gmail.com'})`);

        // Setup dates: Today vs Tomorrow
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const app1Id = new mongoose.Types.ObjectId().toString();
        const app2Id = new mongoose.Types.ObjectId().toString();

        // Booking 1: Scheduled for Today (This is the one we will reschedule to Tomorrow)
        inMemoryDb.appointments.push({
            _id: app1Id,
            patient: patientId,
            doctor: doctorId,
            hospital: hospitalId,
            appointmentDate: today,
            timeSlot: '10:00 AM - 10:15 AM',
            tokenNumber: 1,
            status: 'Pending',
            paymentStatus: 'Paid',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Booking 2: Pre-existing booking for Tomorrow (Establish queue for tomorrow)
        inMemoryDb.appointments.push({
            _id: app2Id,
            patient: patientId,
            doctor: doctorId,
            hospital: hospitalId,
            appointmentDate: tomorrow,
            timeSlot: '10:00 AM - 10:15 AM',
            tokenNumber: 1, // Currently Token #1 tomorrow
            status: 'Pending',
            paymentStatus: 'Paid',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log(`✅ Instantiated bookings (App 1 scheduled today, App 2 scheduled tomorrow with Token #1)`);

        // ==========================================================
        // TRIGGER RESCHEDULE API
        // ==========================================================
        console.log(`\n[TEST] Rescheduling App 1 (${app1Id}) to Tomorrow...`);
        
        const rescheduleRes = await request(`${baseUrl}/appointments/${app1Id}/reschedule`, {
            method: 'PUT',
            headers: authHeader,
            body: {
                newDate: tomorrow,
                newTimeSlot: '11:00 AM - 11:15 AM'
            }
        });

        console.log(`   - Response Status: ${rescheduleRes.status}`);
        console.log(`   - Message: ${rescheduleRes.body.message}`);
        
        const data = rescheduleRes.body.data;
        console.log(`   - New Date: ${new Date(data.appointmentDate).toDateString()}`);
        console.log(`   - New Time Slot: ${data.timeSlot}`);
        console.log(`   - New Token Number: ${data.tokenNumber} (Expected: 2)`);
        console.log(`   - Checking status: ${data.status} (Expected: Pending)`);

        // Assertions
        if (rescheduleRes.status !== 200) {
            throw new Error('Reschedule API returned non-200 response!');
        }
        if (data.tokenNumber !== 2) {
            throw new Error('Queue token increment logic failed during reschedule!');
        }
        if (data.status !== 'Pending') {
            throw new Error('Check-in status resetting failed!');
        }

        console.log('\n   ✅ RESCHEDULE QUEUE TOKEN ALLOCATION PASSED');
        console.log('\n🌟🌟🌟 APPOINTMENT RESCHEDULING ENGINE CONFIRMED WORKING 100% PERFECTLY! 🌟🌟🌟');

    } catch (error) {
        console.error('\n❌ AUDIT ENCOUNTERED AN ERROR:');
        console.error(error);
    } finally {
        server.close();
        console.log('\n- Test server shutdown successfully.');
    }
};

runAudit();
