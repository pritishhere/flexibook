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
    console.log('🔄 STARTING SELF-CONTAINED HOSPITAL PATIENT MANAGEMENT AUDIT...');
    
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
            const u = new URL(url);
            const reqOpts = {
                hostname: u.hostname,
                port: u.port || 80,
                path: u.pathname + u.search,
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            };
            const req = http.request(reqOpts, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
                    } catch (e) {
                        resolve({ status: res.statusCode, body: data });
                    }
                });
            });
            req.on('error', reject);
            if (options.body) req.write(JSON.stringify(options.body));
            req.end();
        });
    };

    const baseUrl = 'http://localhost:3005/api';

    try {
        // Setup initial Mock Patients, Doctors, and Hospital in memory
        let patientAId;
        let patientBId;
        
        const docUser1Id = new mongoose.Types.ObjectId().toString();
        const docUser2Id = new mongoose.Types.ObjectId().toString();
        
        const doctor1Id = new mongoose.Types.ObjectId().toString();
        const doctor2Id = new mongoose.Types.ObjectId().toString();
        
        const hospitalId = new mongoose.Types.ObjectId().toString();

        // Seed users using signup endpoint to get valid tokens
        const signupResA = await request(`${baseUrl}/auth/signup`, {
            method: 'POST',
            body: {
                name: 'Sainee Sarker',
                email: `sainee_${Date.now()}@example.com`,
                password: 'password123',
                mobile: '9903592889',
                role: 'patient'
            }
        });
        patientAId = signupResA.body._id;
        const patientAToken = signupResA.body.token;
        const authHeader = { 'Authorization': `Bearer ${patientAToken}` };

        const signupResB = await request(`${baseUrl}/auth/signup`, {
            method: 'POST',
            body: {
                name: 'Pritish Ghosh',
                email: `pritish_${Date.now()}@example.com`,
                password: 'password123',
                mobile: '9883769499',
                role: 'patient'
            }
        });
        patientBId = signupResB.body._id;
        inMemoryDb.users.push({ _id: docUser1Id, name: 'Dr. Debabrata Sen' });
        inMemoryDb.users.push({ _id: docUser2Id, name: 'Dr. Pritam Das' });

        // Seed doctors
        inMemoryDb.doctors.push({ _id: doctor1Id, userId: docUser1Id, specialization: 'Cardiologist' });
        inMemoryDb.doctors.push({ _id: doctor2Id, userId: docUser2Id, specialization: 'Neurologist' });

        // Seed hospital
        inMemoryDb.hospitals.push({ _id: hospitalId, name: 'Metro General Hospital', city: 'Kolkata' });

        console.log(`\n✅ Setup Mock Patients, Doctors, and Hospital:`);
        console.log(`   - Hospital ID: ${hospitalId}`);
        console.log(`   - Doctor 1 (Cardio): ${doctor1Id}`);
        console.log(`   - Doctor 2 (Neuro): ${doctor2Id}`);

        // Seed 3 appointments directly in the in-memory array
        const app1Id = new mongoose.Types.ObjectId().toString();
        const app2Id = new mongoose.Types.ObjectId().toString();
        const app3Id = new mongoose.Types.ObjectId().toString();

        const today = new Date();

        inMemoryDb.appointments.push({
            _id: app1Id,
            patient: patientAId,
            doctor: doctor1Id,
            hospital: hospitalId,
            appointmentDate: today,
            timeSlot: '10:00 AM - 10:15 AM',
            tokenNumber: 1,
            reasonForVisit: 'Heart checkup',
            status: 'Pending',
            paymentStatus: 'Pending',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        inMemoryDb.appointments.push({
            _id: app2Id,
            patient: patientBId,
            doctor: doctor1Id,
            hospital: hospitalId,
            appointmentDate: today,
            timeSlot: '10:15 AM - 10:30 AM',
            tokenNumber: 2,
            reasonForVisit: 'BP checkup',
            status: 'Pending',
            paymentStatus: 'Pending',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        inMemoryDb.appointments.push({
            _id: app3Id,
            patient: patientAId,
            doctor: doctor2Id,
            hospital: hospitalId,
            appointmentDate: today,
            timeSlot: '11:00 AM - 11:15 AM',
            tokenNumber: 1,
            reasonForVisit: 'Migraine checkup',
            status: 'Pending',
            paymentStatus: 'Pending',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log(`✅ Seeded 3 mock bookings in memory.`);

        // ==========================================================
        // TEST 1: RETRIEVE ALL HOSPITAL APPOINTMENTS (Admin Schedule)
        // ==========================================================
        console.log('\n[TEST 1] Retrieving hospital schedule list...');
        const listRes = await request(`${baseUrl}/appointments/hospital/${hospitalId}`, {
            headers: authHeader
        });

        console.log(`   - Response Status: ${listRes.status}`);
        console.log(`   - Total Appointments Scheduled: ${listRes.body.count}`);
        
        if (listRes.status !== 200 || listRes.body.count !== 3) {
            throw new Error('Test 1 failed: Expected 3 appointments on the hospital board!');
        }
        console.log('   ✅ TEST 1 PASSED');

        // ==========================================================
        // TEST 2: UPDATE PAYMENT STATUS OF APPOINTMENT 1
        // ==========================================================
        console.log(`\n[TEST 2] Updating payment status of booking ${app1Id} to 'Paid'...`);
        const payRes = await request(`${baseUrl}/appointments/${app1Id}/payment`, {
            method: 'PUT',
            headers: authHeader,
            body: { paymentStatus: 'Paid' }
        });

        console.log(`   - Response Status: ${payRes.status}`);
        console.log(`   - Message: ${payRes.body.message}`);
        console.log(`   - Payment Status is now: ${payRes.body.data.paymentStatus}`);

        if (payRes.status !== 200 || payRes.body.data.paymentStatus !== 'Paid') {
            throw new Error('Test 2 failed: payment status not updated correctly!');
        }
        console.log('   ✅ TEST 2 PASSED');

        // ==========================================================
        // TEST 3: VERIFY PAID APPOINTMENT POPULATES CORRECTLY
        // ==========================================================
        console.log('\n[TEST 3] Re-verifying schedule board outputs...');
        const verifyListRes = await request(`${baseUrl}/appointments/hospital/${hospitalId}`, {
            headers: authHeader
        });
        const app1 = verifyListRes.body.data.find(a => a._id === app1Id);
        
        console.log(`   - Appointment 1 Patient Name: ${app1.patient.name}`);
        console.log(`   - Appointment 1 Payment Status: ${app1.paymentStatus} (Expected: Paid)`);
        console.log(`   - Appointment 1 Doctor Specialization: ${app1.doctor.specialization}`);

        if (app1.paymentStatus !== 'Paid' || app1.patient.name !== 'Sainee Sarker') {
            throw new Error('Test 3 failed: Data population or payment updates not synchronized!');
        }
        console.log('   ✅ TEST 3 PASSED');

        // ==========================================================
        // TEST 4: FILTER BY DOCTOR (Retrieve only Cardio bookings)
        // ==========================================================
        console.log(`\n[TEST 4] Filtering dashboard schedule for Cardio Doctor (${doctor1Id})...`);
        const cardioRes = await request(`${baseUrl}/appointments/hospital/${hospitalId}?doctorId=${doctor1Id}`, {
            headers: authHeader
        });

        console.log(`   - Response Status: ${cardioRes.status}`);
        console.log(`   - Cardio Appointments count: ${cardioRes.body.count}`);

        if (cardioRes.status !== 200 || cardioRes.body.count !== 2) {
            throw new Error('Test 4 failed: Doctor filter not isolating Cardio schedule!');
        }
        console.log('   ✅ TEST 4 PASSED');

        console.log('\n🌟🌟🌟 PATIENT & ORGANIZATION QUEUE SCHEDULER ENGINE CONFIRMED WORKING 100% PERFECTLY! 🌟🌟🌟');

    } catch (error) {
        console.error('\n❌ AUDIT ENCOUNTERED AN ERROR:');
        console.error(error);
    } finally {
        server.close();
        console.log('\n- Test server shutdown successfully.');
    }
};

runAudit();
