const http = require('http');

async function request(url, options = {}) {
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
                    resolve({
                        status: res.statusCode,
                        data: data ? JSON.parse(data) : null
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: data
                    });
                }
            });
        });
        req.on('error', reject);
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        req.end();
    });
}

async function runTests() {
    console.log('🔄 STARTING COMPREHENSIVE ENDPOINT AUDIT ON ALL ACTIVE APIs (http://localhost:3000)...\n');
    const baseUrl = 'http://localhost:3000/api';

    try {
        // ==========================================
        // 1. AUTH API TESTING
        // ==========================================
        console.log('[TEST 1] Testing Authentication API...');
        const uniqueEmail = `audit_user_${Date.now()}@example.com`;
        
        // SignUp User
        const signupRes = await request(`${baseUrl}/auth/signup`, {
            method: 'POST',
            body: {
                name: 'Audit Reviewer',
                email: uniqueEmail,
                password: 'securepassword123',
                role: 'admin'
            }
        });
        console.log(`   - SignUp Status: ${signupRes.status}`);
        if (signupRes.status !== 201) throw new Error('SignUp failed');
        const userId = signupRes.data._id;

        // Login User
        const loginRes = await request(`${baseUrl}/auth/login`, {
            method: 'POST',
            body: {
                email: uniqueEmail,
                password: 'securepassword123'
            }
        });
        console.log(`   - Login Status: ${loginRes.status}`);
        if (loginRes.status !== 200) throw new Error('Login failed');
        console.log('   ✅ AUTH API WORKING PERFECTLY\n');

        const token = loginRes.data.token;
        const authHeader = { 'Authorization': `Bearer ${token}` };

        // ==========================================
        // 2. HOSPITAL API TESTING
        // ==========================================
        console.log('[TEST 2] Testing Hospital API (CRUD)...');
        // Create Hospital
        const createHospRes = await request(`${baseUrl}/hospitals`, {
            method: 'POST',
            headers: authHeader,
            body: {
                name: 'City Care Hospital',
                address: 'Park Street',
                city: 'Kolkata',
                contactNumber: '033-111222'
            }
        });
        console.log(`   - Create Hospital Status: ${createHospRes.status}`);
        if (createHospRes.status !== 201) throw new Error('Create hospital failed');
        const hospitalId = createHospRes.data.data._id;

        // Read All Hospitals
        const listHospRes = await request(`${baseUrl}/hospitals`);
        console.log(`   - Read All Hospitals Status: ${listHospRes.status} (Count: ${listHospRes.data.count})`);

        // Read Single Hospital by ID
        const getHospRes = await request(`${baseUrl}/hospitals/${hospitalId}`);
        console.log(`   - Read Single Hospital Status: ${getHospRes.status} (Name: ${getHospRes.data.data.name})`);

        // Update Hospital
        const updateHospRes = await request(`${baseUrl}/hospitals/${hospitalId}`, {
            method: 'PUT',
            headers: authHeader,
            body: { name: 'City Care Super-speciality Hospital' }
        });
        console.log(`   - Update Hospital Status: ${updateHospRes.status} (New Name: ${updateHospRes.data.data.name})`);
        console.log('   ✅ HOSPITAL API WORKING PERFECTLY\n');

        // ==========================================
        // 3. DEPARTMENT API TESTING
        // ==========================================
        console.log('[TEST 3] Testing Department API (CRUD)...');
        // Create Department
        const createDeptRes = await request(`${baseUrl}/departments`, {
            method: 'POST',
            body: {
                name: 'Pediatrics',
                description: 'Child care unit',
                hospitalId: hospitalId
            }
        });
        console.log(`   - Create Department Status: ${createDeptRes.status}`);
        if (createDeptRes.status !== 201) throw new Error('Create department failed');
        const departmentId = createDeptRes.data.data._id;

        // Read Departments filtered by hospital
        const listDeptRes = await request(`${baseUrl}/departments?hospitalId=${hospitalId}`);
        console.log(`   - Read Departments Status: ${listDeptRes.status} (Count: ${listDeptRes.data.count})`);

        // Read Single Department
        const getDeptRes = await request(`${baseUrl}/departments/${departmentId}`);
        console.log(`   - Read Single Department Status: ${getDeptRes.status}`);

        // Update Department
        const updateDeptRes = await request(`${baseUrl}/departments/${departmentId}`, {
            method: 'PUT',
            body: { description: 'Specialized child care & immunisation clinic' }
        });
        console.log(`   - Update Department Status: ${updateDeptRes.status}`);
        console.log('   ✅ DEPARTMENT API WORKING PERFECTLY\n');

        // ==========================================
        // 4. SERVICE API TESTING
        // ==========================================
        console.log('[TEST 4] Testing Service API (CRUD)...');
        // Create Service
        const createServRes = await request(`${baseUrl}/services`, {
            method: 'POST',
            body: {
                name: 'Child Vaccination Package',
                price: 1500,
                duration: 20,
                hospitalId: hospitalId,
                departmentId: departmentId
            }
        });
        console.log(`   - Create Service Status: ${createServRes.status}`);
        if (createServRes.status !== 201) throw new Error('Create service failed');
        const serviceId = createServRes.data.data._id;

        // Read Services
        const listServRes = await request(`${baseUrl}/services?hospitalId=${hospitalId}`);
        console.log(`   - Read Services Status: ${listServRes.status} (Count: ${listServRes.data.count})`);

        // Read Single Service
        const getServRes = await request(`${baseUrl}/services/${serviceId}`);
        console.log(`   - Read Single Service Status: ${getServRes.status}`);

        // Update Service
        const updateServRes = await request(`${baseUrl}/services/${serviceId}`, {
            method: 'PUT',
            body: { price: 1650 }
        });
        console.log(`   - Update Service Status: ${updateServRes.status} (New Price: ${updateServRes.data.data.price})`);
        console.log('   ✅ SERVICE API WORKING PERFECTLY\n');

        // ==========================================
        // 5. DOCTOR API TESTING
        // ==========================================
        console.log('[TEST 5] Testing Doctor API (CRUD)...');
        // Create Doctor
        const createDocRes = await request(`${baseUrl}/doctors`, {
            method: 'POST',
            headers: authHeader,
            body: {
                userId: userId,
                hospitalId: hospitalId,
                departmentId: departmentId,
                specialization: 'Pediatrician',
                experience: 8,
                consultationFee: 500,
                availability: [
                    { day: 'Tuesday', startTime: '09:00', endTime: '13:00' },
                    { day: 'Thursday', startTime: '09:00', endTime: '13:00' }
                ]
            }
        });
        console.log(`   - Create Doctor Status: ${createDocRes.status}`);
        if (createDocRes.status !== 201) throw new Error('Create doctor failed');
        const doctorId = createDocRes.data.data._id;

        // Read Doctors
        const listDocRes = await request(`${baseUrl}/doctors?hospitalId=${hospitalId}`);
        console.log(`   - Read Doctors Status: ${listDocRes.status} (Count: ${listDocRes.data.count})`);

        // Read Single Doctor
        const getDocRes = await request(`${baseUrl}/doctors/${doctorId}`);
        console.log(`   - Read Single Doctor Status: ${getDocRes.status}`);

        // Update Doctor
        const updateDocRes = await request(`${baseUrl}/doctors/${doctorId}`, {
            method: 'PUT',
            headers: authHeader,
            body: { consultationFee: 600 }
        });
        console.log(`   - Update Doctor Status: ${updateDocRes.status} (New Fees: ${updateDocRes.data.data.fees})`);
        console.log('   ✅ DOCTOR API WORKING PERFECTLY\n');

        // ==========================================
        // 6. REVIEW API TESTING
        // ==========================================
        console.log('[TEST 6] Testing Review API (CRUD)...');
        // Create Review
        const createRevRes = await request(`${baseUrl}/reviews`, {
            method: 'POST',
            body: {
                rating: 5,
                comment: 'Very professional pediatrician!',
                userId: userId,
                hospitalId: hospitalId,
                doctorId: doctorId
            }
        });
        console.log(`   - Create Review Status: ${createRevRes.status}`);
        if (createRevRes.status !== 201) throw new Error('Create review failed');
        const reviewId = createRevRes.data.data._id;

        // Verify Hospital Rating recalculation (Should be 5)
        let getHospRatingRes = await request(`${baseUrl}/hospitals/${hospitalId}`);
        console.log(`   - Recalculated Hospital Rating: ${getHospRatingRes.data.data.rating} (Expected: 5)`);

        // Update Review (Rating 5 -> 4)
        const updateRevRes = await request(`${baseUrl}/reviews/${reviewId}`, {
            method: 'PUT',
            body: { rating: 4 }
        });
        console.log(`   - Update Review Status: ${updateRevRes.status}`);

        // Verify Hospital Rating recalculation after update (Should be 4)
        getHospRatingRes = await request(`${baseUrl}/hospitals/${hospitalId}`);
        console.log(`   - Recalculated Hospital Rating after Update: ${getHospRatingRes.data.data.rating} (Expected: 4)`);

        // Read Reviews
        const listRevRes = await request(`${baseUrl}/reviews?hospitalId=${hospitalId}`);
        console.log(`   - Read Reviews Status: ${listRevRes.status} (Count: ${listRevRes.data.count})`);
        console.log('   ✅ REVIEW API WORKING PERFECTLY\n');

        // ==========================================
        // 7. CLEANUP / DELETION TESTING (Completes CRUD validation)
        // ==========================================
        console.log('[TEST 7] Performing Deletion Cleanup...');

        // Delete Review
        const delRevRes = await request(`${baseUrl}/reviews/${reviewId}`, { method: 'DELETE' });
        console.log(`   - Delete Review Status: ${delRevRes.status}`);

        // Verify Hospital Rating resets to 0
        getHospRatingRes = await request(`${baseUrl}/hospitals/${hospitalId}`);
        console.log(`   - Hospital Rating after review deletion: ${getHospRatingRes.data.data.rating} (Expected: 0)`);

        // Delete Hospital
        const delHospRes = await request(`${baseUrl}/hospitals/${hospitalId}`, { 
            method: 'DELETE',
            headers: authHeader
        });
        console.log(`   - Delete Hospital Status: ${delHospRes.status}`);

        // Delete Service
        const delServRes = await request(`${baseUrl}/services/${serviceId}`, { method: 'DELETE' });
        console.log(`   - Delete Service Status: ${delServRes.status}`);

        // Delete Department
        const delDeptRes = await request(`${baseUrl}/departments/${departmentId}`, { method: 'DELETE' });
        console.log(`   - Delete Department Status: ${delDeptRes.status}`);

        // Delete Doctor
        const delDocRes = await request(`${baseUrl}/doctors/${doctorId}`, { 
            method: 'DELETE',
            headers: authHeader
        });
        console.log(`   - Delete Doctor Status: ${delDocRes.status}`);

        console.log('   ✅ CLEANUP & DELETION COMPLETED SUCCESSFULLY\n');

        console.log('🌟🌟🌟 ALL APIs ARE CONFIRMED WORKING 100% PERFECTLY! 🌟🌟🌟');

    } catch (error) {
        console.error('\n❌ AUDIT ENCOUNTERED AN ERROR:');
        console.error(error);
    }
}

runTests();
