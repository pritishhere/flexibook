// c:\Users\priti\OneDrive\Desktop\BACKEND\flexibook\server\verify_family_booking_standalone.js
process.env.USE_IN_MEMORY = 'true';
require('dotenv').config();

const express = require('express');
const http = require('http');
const mongoose = require('mongoose');

// Generate JWT token helper
const generateToken = require('./src/utils/generateToken');
const inMemoryDb = require('./src/utils/inMemoryDb');
const connectDB = require('./src/config/db');

// Controllers & Routes
const userRoutes = require('./src/routes/userRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');

const runAudit = async () => {
    console.log('🔄 STARTING FAMILY MEMBER BOOKING WORKFLOW AUDIT...');

    // A. Start local Express Test Server on Port 3006
    const app = express();
    app.use(express.json());
    app.use('/api/users', userRoutes);
    app.use('/api/appointments', appointmentRoutes);

    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(3006, resolve));
    console.log('- Test server listening on port 3006...');

    // Force offline in-memory database mode
    await connectDB();

    // Helper function to send requests
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

    const usersUrl = 'http://localhost:3006/api/users';
    const appointmentsUrl = 'http://localhost:3006/api/appointments';

    try {
        // Step 1: Create a mock owner/patient account and generate token
        const ownerId = new mongoose.Types.ObjectId().toString();
        const mockOwner = {
            _id: ownerId,
            name: 'Pritish Owner',
            email: 'pritish@example.com',
            phone: '9883769499',
            role: 'patient',
            password: 'hashed_password'
        };
        inMemoryDb.users.push(mockOwner);
        const token = generateToken(ownerId);
        const authHeader = { 'Authorization': `Bearer ${token}` };

        console.log('\n[TEST 1] Getting empty family member list for user...');
        const listRes1 = await request(`${usersUrl}/family`, {
            method: 'GET',
            headers: authHeader
        });
        console.log(`   - Status: ${listRes1.status} (Expected: 200)`);
        console.log(`   - Family members loaded: ${listRes1.body.data.length} (Expected: 0)`);
        if (listRes1.status !== 200 || !listRes1.body.success || listRes1.body.data.length !== 0) {
            throw new Error('Test 1 failed: Initial family list fetch error!');
        }
        console.log('   ✅ TEST 1 PASSED');

        console.log('\n[TEST 2] Adding a new family member (Spouse)...');
        const familyData = {
            name: 'Sainee Ghosh',
            relationship: 'Spouse',
            age: 26,
            gender: 'female',
            bloodGroup: 'B+',
            phone: '9903592889'
        };
        const addRes = await request(`${usersUrl}/family`, {
            method: 'POST',
            headers: authHeader,
            body: familyData
        });
        console.log(`   - Status: ${addRes.status} (Expected: 201)`);
        console.log(`   - Saved Member Name: ${addRes.body.data.name}`);
        console.log(`   - Saved Member Relation: ${addRes.body.data.relationToUser}`);
        if (addRes.status !== 201 || !addRes.body.success || addRes.body.data.relationToUser !== 'Spouse') {
            throw new Error('Test 2 failed: Adding family member returned unexpected result!');
        }
        const memberId = addRes.body.data._id;
        console.log('   ✅ TEST 2 PASSED');

        console.log('\n[TEST 3] Fetching family member list again...');
        const listRes2 = await request(`${usersUrl}/family`, {
            method: 'GET',
            headers: authHeader
        });
        console.log(`   - Status: ${listRes2.status} (Expected: 200)`);
        console.log(`   - Family list count: ${listRes2.body.data.length} (Expected: 1)`);
        if (listRes2.status !== 200 || listRes2.body.data.length !== 1 || listRes2.body.data[0]._id !== memberId) {
            throw new Error('Test 3 failed: Family list is not showing the added member!');
        }
        console.log('   ✅ TEST 3 PASSED');

        console.log('\n[TEST 4] Booking appointment for the family member...');
        // Seed doctor and hospital
        const doctorId = new mongoose.Types.ObjectId().toString();
        const hospitalId = new mongoose.Types.ObjectId().toString();
        inMemoryDb.doctors.push({
            _id: doctorId,
            userId: new mongoose.Types.ObjectId().toString(),
            hospitalId: hospitalId,
            specialization: 'Dentist',
            fees: 400
        });
        inMemoryDb.hospitals.push({
            _id: hospitalId,
            name: 'FlexiBook Dental Clinic',
            city: 'Kolkata'
        });

        const bookingPayload = {
            familyMemberId: memberId,
            patientName: familyData.name,
            patientEmail: mockOwner.email,
            patientPhone: familyData.phone,
            patientAge: familyData.age,
            patientGender: familyData.gender,
            doctor: doctorId,
            hospital: hospitalId,
            appointmentDate: new Date(),
            timeSlot: '11:00 AM',
            consultationFee: 400,
            bookingMode: 'appointment'
        };

        const bookRes = await request(`${appointmentsUrl}/book`, {
            method: 'POST',
            headers: authHeader,
            body: bookingPayload
        });

        console.log(`   - Status: ${bookRes.status} (Expected: 201)`);
        console.log(`   - Response success: ${bookRes.body.success}`);
        
        // Find appointment in memory DB
        const savedAppt = inMemoryDb.appointments.find(a => String(a.familyMember) === String(memberId));
        if (!savedAppt) {
            throw new Error('Test 4 failed: Appointment record not created or not associated with family member!');
        }

        console.log(`   - Associated Family Member ID: ${savedAppt.familyMember}`);
        console.log(`   - Snapshot Patient Name: ${savedAppt.patientName} (Expected: Sainee Ghosh)`);
        console.log(`   - Snapshot Patient Relationship: ${savedAppt.patientRelationship} (Expected: Spouse)`);
        console.log(`   - Snapshot Patient Age: ${savedAppt.patientAge} (Expected: 26)`);

        if (savedAppt.patientName !== 'Sainee Ghosh' || savedAppt.patientRelationship !== 'Spouse' || savedAppt.patientAge !== 26 || savedAppt.patientGender !== 'female') {
            throw new Error('Test 4 failed: Snapshot details of family member are incorrect in appointment!');
        }
        console.log('   ✅ TEST 4 PASSED');

        console.log('\n🌟🌟🌟 FAMILY MEMBER BOOKING WORKFLOW VERIFIED 100% WORKING PERFECTLY! 🌟🌟🌟');

    } catch (error) {
        console.error('\n❌ AUDIT ENCOUNTERED AN ERROR:');
        console.error(error.message);
    } finally {
        server.close();
        console.log('\n- Test server shutdown successfully.');
    }
};

runAudit();
