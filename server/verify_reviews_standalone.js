const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const inMemoryDb = require('./src/utils/inMemoryDb');
const connectDB = require('./src/config/db');

// Import routes and models
const reviewRoutes = require('./src/routes/reviewRoutes');
const Hospital = require('./src/models/Hospital');
const User = require('./src/models/user');

const runAudit = async () => {
    console.log('🔄 STARTING SELF-CONTAINED REVIEWS & RATINGS AUDIT...');
    
    // 1. Launch a local test server on port 3005
    const app = express();
    app.use(express.json());
    app.use('/api/reviews', reviewRoutes);
    
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(3005, resolve));
    console.log('- Test server listening on port 3005...');

    // 2. Connect DB (use in-memory fallback if MONGO_URI fails)
    process.env.USE_IN_MEMORY = 'true'; // Force offline mode for audit safety
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
        // Setup initial Mock data in memory
        const mockUserId = new mongoose.Types.ObjectId().toString();
        const mockHospitalId = new mongoose.Types.ObjectId().toString();

        inMemoryDb.users.push({ _id: mockUserId, name: 'Sainee Sarker', email: 'sainee@example.com' });
        inMemoryDb.hospitals.push({ _id: mockHospitalId, name: 'Kolkata Care Clinic', rating: 0 });

        console.log(`\n✅ Setup Mock User (ID: ${mockUserId}) and Hospital (ID: ${mockHospitalId})`);

        // ==========================================================
        // TEST 1: CREATE A 5-STAR REVIEW
        // ==========================================================
        console.log('\n[TEST 1] Submitting a 5-star review...');
        const review1Res = await request(`${baseUrl}/reviews`, {
            method: 'POST',
            body: {
                rating: 5,
                comment: 'Excellent facility and quick queue response!',
                userId: mockUserId,
                hospitalId: mockHospitalId
            }
        });

        console.log(`   - Status: ${review1Res.status}`);
        console.log(`   - Review ID: ${review1Res.body.data._id}`);
        
        // Check hospital rating calculation
        const hospitalAfter1 = inMemoryDb.hospitals.find(h => h._id === mockHospitalId);
        console.log(`   - Hospital Rating is now: ${hospitalAfter1.rating} stars (Expected: 5.0)`);
        
        if (hospitalAfter1.rating !== 5.0) {
            throw new Error('Hospital rating calculation mismatch after Test 1!');
        }
        console.log('   ✅ TEST 1 PASSED');

        // ==========================================================
        // TEST 2: CREATE A 3-STAR REVIEW (Calculates Average)
        // ==========================================================
        console.log('\n[TEST 2] Submitting a second review (3 stars)...');
        const review2Res = await request(`${baseUrl}/reviews`, {
            method: 'POST',
            body: {
                rating: 3,
                comment: 'Staff was good, but wait times were average.',
                userId: mockUserId,
                hospitalId: mockHospitalId
            }
        });

        console.log(`   - Status: ${review2Res.status}`);
        
        // Check hospital rating calculation (Average of 5 and 3 should be 4.0)
        const hospitalAfter2 = inMemoryDb.hospitals.find(h => h._id === mockHospitalId);
        console.log(`   - Hospital Average Rating is now: ${hospitalAfter2.rating} stars (Expected: 4.0)`);
        
        if (hospitalAfter2.rating !== 4.0) {
            throw new Error('Hospital rating calculation mismatch after Test 2!');
        }
        console.log('   ✅ TEST 2 PASSED');

        // ==========================================================
        // TEST 3: UPDATE THE 3-STAR REVIEW TO 1-STAR (Average recalculation)
        // ==========================================================
        const review2Id = review2Res.body.data._id;
        console.log(`\n[TEST 3] Updating review ${review2Id} to 1 star (with comment update)...`);
        const updateRes = await request(`${baseUrl}/reviews/${review2Id}`, {
            method: 'PUT',
            body: {
                rating: 1,
                comment: 'Update: Extremely bad service on follow up.'
            }
        });

        console.log(`   - Status: ${updateRes.status}`);
        
        // Check hospital rating calculation (Average of 5 and 1 should be 3.0)
        const hospitalAfter3 = inMemoryDb.hospitals.find(h => h._id === mockHospitalId);
        console.log(`   - Hospital Average Rating is now: ${hospitalAfter3.rating} stars (Expected: 3.0)`);
        
        if (hospitalAfter3.rating !== 3.0) {
            throw new Error('Hospital rating calculation mismatch after Test 3!');
        }
        console.log('   ✅ TEST 3 PASSED');

        // ==========================================================
        // TEST 4: DELETE A REVIEW (Recalculate back to original)
        // ==========================================================
        console.log(`\n[TEST 4] Deleting the 1-star review (${review2Id})...`);
        const deleteRes = await request(`${baseUrl}/reviews/${review2Id}`, {
            method: 'DELETE'
        });

        console.log(`   - Status: ${deleteRes.status}`);
        
        // Check hospital rating calculation (Only the 5-star review remains, so average should be 5.0)
        const hospitalAfter4 = inMemoryDb.hospitals.find(h => h._id === mockHospitalId);
        console.log(`   - Hospital Average Rating is now: ${hospitalAfter4.rating} stars (Expected: 5.0)`);
        
        if (hospitalAfter4.rating !== 5.0) {
            throw new Error('Hospital rating calculation mismatch after Test 4!');
        }
        console.log('   ✅ TEST 4 PASSED');

        console.log('\n🌟🌟🌟 REVIEWS & RATINGS ENGINE CONFIRMED WORKING 100% PERFECTLY! 🌟🌟🌟');

    } catch (error) {
        console.error('\n❌ AUDIT ENCOUNTERED AN ERROR:');
        console.error(error);
    } finally {
        // Shutdown test server
        server.close();
        console.log('\n- Test server shutdown successfully.');
    }
};

runAudit();
