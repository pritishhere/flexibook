const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const inMemoryDb = require('./src/utils/inMemoryDb');
const connectDB = require('./src/config/db');
const generateToken = require('./src/utils/generateToken');

// Import routes and models
const complaintRoutes = require('./src/routes/complaintRoutes');

const runAudit = async () => {
    console.log('🔄 STARTING SELF-CONTAINED PRIVATE COMPLAINTS & FEEDBACK AUDIT...');
    
    // 1. Launch a local test server on port 3005
    const app = express();
    app.use(express.json());
    app.use('/api/complaints', complaintRoutes);
    
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
        // Setup initial Mock Users and Hospital in memory
        const mockPatientId = new mongoose.Types.ObjectId().toString();
        const mockAdminId = new mongoose.Types.ObjectId().toString();
        const mockHospitalId = new mongoose.Types.ObjectId().toString();

        const patientUser = { _id: mockPatientId, name: 'Sainee Patient', email: 'sainee.patient@example.com', role: 'patient' };
        const adminUser = { _id: mockAdminId, name: 'Super Admin', email: 'admin@flexibook.com', role: 'admin' };
        
        inMemoryDb.users.push(patientUser);
        inMemoryDb.users.push(adminUser);
        inMemoryDb.hospitals.push({ _id: mockHospitalId, name: 'Metro General Hospital', city: 'Kolkata' });

        // Generate JWT tokens for authentication headers
        const patientToken = generateToken(mockPatientId);
        const adminToken = generateToken(mockAdminId);

        console.log(`\n✅ Mock Data Instantiated:`);
        console.log(`   - Patient Token Generated for Sainee`);
        console.log(`   - Admin Token Generated for Super Admin`);

        // ==========================================================
        // TEST 1: SUBMIT COMPLAINT (Patient)
        // ==========================================================
        console.log('\n[TEST 1] Patient submitting a grievance ticket...');
        const submitRes = await request(`${baseUrl}/complaints`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${patientToken}` },
            body: {
                hospitalId: mockHospitalId,
                subject: 'Long waiting lines at cardiology desk',
                description: 'I waited for over 2 hours yesterday even though my token number was #3. The desk executive was unresponsive.'
            }
        });

        console.log(`   - Response Status: ${submitRes.status}`);
        console.log(`   - Ticket ID: ${submitRes.body.data._id}`);
        console.log(`   - Initial Status: ${submitRes.body.data.status}`);
        
        if (submitRes.status !== 201 || submitRes.body.data.status !== 'pending') {
            throw new Error('Test 1 failed: Complaint submission structure invalid!');
        }
        console.log('   ✅ TEST 1 PASSED');

        // ==========================================================
        // TEST 2: GET MY COMPLAINTS (Patient)
        // ==========================================================
        console.log('\n[TEST 2] Retrieving logged-in patient\'s own tickets...');
        const myRes = await request(`${baseUrl}/complaints/my`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${patientToken}` }
        });

        console.log(`   - Response Status: ${myRes.status}`);
        console.log(`   - Tickets Found: ${myRes.body.count}`);
        console.log(`   - Ticket Subject: "${myRes.body.data[0].subject}"`);
        console.log(`   - Linked Hospital: ${myRes.body.data[0].hospitalId.name}`);

        if (myRes.status !== 200 || myRes.body.count !== 1 || myRes.body.data[0].hospitalId.name !== 'Metro General Hospital') {
            throw new Error('Test 2 failed: Patient could not fetch their own tickets correctly!');
        }
        console.log('   ✅ TEST 2 PASSED');

        // ==========================================================
        // TEST 3: GET ALL COMPLAINTS (Admin authorization validation)
        // ==========================================================
        console.log('\n[TEST 3] Admin fetching all submitted tickets across the system...');
        const allRes = await request(`${baseUrl}/complaints`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        console.log(`   - Response Status: ${allRes.status}`);
        console.log(`   - Total System Tickets: ${allRes.body.count}`);
        console.log(`   - Submitted By: ${allRes.body.data[0].userId.name} (${allRes.body.data[0].userId.email})`);

        if (allRes.status !== 200 || allRes.body.count !== 1) {
            throw new Error('Test 3 failed: Admin could not view all tickets!');
        }
        console.log('   ✅ TEST 3 PASSED');

        // ==========================================================
        // TEST 4: UPDATE STATUS TO RESOLVED (Admin action)
        // ==========================================================
        const ticketId = submitRes.body.data._id;
        console.log(`\n[TEST 4] Admin updating ticket status to "resolved"...`);
        const statusRes = await request(`${baseUrl}/complaints/${ticketId}/status`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${adminToken}` },
            body: { status: 'resolved' }
        });

        console.log(`   - Response Status: ${statusRes.status}`);
        console.log(`   - Updated Status: ${statusRes.body.data.status}`);

        if (statusRes.status !== 200 || statusRes.body.data.status !== 'resolved') {
            throw new Error('Test 4 failed: Admin status modification rejected!');
        }
        console.log('   ✅ TEST 4 PASSED');

        // ==========================================================
        // TEST 5: GET MY COMPLAINTS AFTER RESOLUTION (Patient validation check)
        // ==========================================================
        console.log('\n[TEST 5] Patient verifying ticket resolution status...');
        const myResAfter = await request(`${baseUrl}/complaints/my`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${patientToken}` }
        });

        console.log(`   - Response Status: ${myResAfter.status}`);
        console.log(`   - Verified resolved state: ${myResAfter.body.data[0].status === 'resolved'}`);

        if (myResAfter.body.data[0].status !== 'resolved') {
            throw new Error('Test 5 failed: resolved state not propagated to patient!');
        }
        console.log('   ✅ TEST 5 PASSED');

        console.log('\n🌟🌟🌟 COMPLAINTS & FEEDBACK TICKETING ENGINE CONFIRMED WORKING 100% PERFECTLY! 🌟🌟🌟');

    } catch (error) {
        console.error('\n❌ AUDIT ENCOUNTERED AN ERROR:');
        console.error(error);
    } finally {
        server.close();
        console.log('\n- Test server shutdown successfully.');
    }
};

runAudit();
