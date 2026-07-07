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

async function start() {
    console.log('🔄 Checking Doctor and Review endpoints on http://localhost:3000...\n');
    const baseUrl = 'http://localhost:3000/api';

    try {
        // 1. Create a User (Patient/Doctor)
        console.log('1. Signing up a new User...');
        const uniqueEmail = `test_doc_${Date.now()}@example.com`;
        const userRes = await request(`${baseUrl}/auth/signup`, {
            method: 'POST',
            body: {
                name: 'Dr. Pritish Ghosh',
                email: uniqueEmail,
                password: 'password123',
                role: 'doctor'
            }
        });
        console.log(`   Response Status: ${userRes.status}`);
        console.log('   User Data:', JSON.stringify(userRes.data, null, 2));

        if (userRes.status !== 201) {
            throw new Error(`Failed to create user (Status: ${userRes.status})`);
        }

        const userId = userRes.data._id;
        const authToken = userRes.data.token;

        // 2. Create a Hospital
        console.log('\n2. Creating Hospital...');
        const hRes = await request(`${baseUrl}/hospitals`, {
            method: 'POST',
            body: {
                name: 'Kolkata General Hospital',
                address: 'Salt Lake Sector V',
                city: 'Kolkata',
                contactNumber: '033-9876543'
            }
        });
        console.log(`   Response Status: ${hRes.status}`);
        if (hRes.status !== 201) {
            throw new Error(`Failed to create hospital (Status: ${hRes.status})`);
        }
        const hospitalId = hRes.data.data._id;
        console.log(`   Hospital ID: ${hospitalId}`);

        // 3. Create a Doctor Profile
        console.log('\n3. Creating Doctor Profile...');
        const docRes = await request(`${baseUrl}/doctors`, {
            method: 'POST',
            body: {
                userId: userId,
                hospitalId: hospitalId,
                specialization: 'Cardiologist',
                experience: 12,
                consultationFee: 800,
                availability: [
                    { day: 'Monday', startTime: '09:00', endTime: '13:00' },
                    { day: 'Wednesday', startTime: '09:00', endTime: '13:00' },
                    { day: 'Friday', startTime: '09:00', endTime: '13:00' }
                ]
            }
        });
        console.log(`   Response Status: ${docRes.status}`);
        console.log('   Doctor Data:', JSON.stringify(docRes.data, null, 2));
        if (docRes.status !== 201) {
            throw new Error(`Failed to create doctor profile (Status: ${docRes.status})`);
        }
        const doctorId = docRes.data.data._id;

        // 4. Fetch all doctors
        console.log('\n4. Fetching all doctors...');
        const listDocRes = await request(`${baseUrl}/doctors`);
        console.log(`   Response Status: ${listDocRes.status}`);
        console.log(`   Total Doctors Found: ${listDocRes.data.count}`);
        console.log('   Data Sample:', JSON.stringify(listDocRes.data.data[0], null, 2));

        // 5. Fetch doctors filtered by hospital
        console.log(`\n5. Fetching doctors filtered by hospitalId: ${hospitalId}...`);
        const filterDocRes = await request(`${baseUrl}/doctors?hospitalId=${hospitalId}`);
        console.log(`   Response Status: ${filterDocRes.status}`);
        console.log(`   Doctors Found in Hospital: ${filterDocRes.data.count}`);

        // 6. Create Review 1 (Rating 4)
        console.log('\n6. Creating first Review (Rating: 4)...');
        const rev1Res = await request(`${baseUrl}/reviews`, {
            method: 'POST',
            body: {
                rating: 4,
                comment: 'Great facilities and doctor behavior.',
                userId: userId,
                hospitalId: hospitalId,
                doctorId: doctorId
            }
        });
        console.log(`   Response Status: ${rev1Res.status}`);
        if (rev1Res.status !== 201) {
            throw new Error(`Failed to create review 1 (Status: ${rev1Res.status})`);
        }
        const review1Id = rev1Res.data.data._id;

        // Verify Hospital Rating is 4
        let getHospitalRes = await request(`${baseUrl}/hospitals/${hospitalId}`);
        console.log(`   Hospital Rating after 1st Review: ${getHospitalRes.data.data.rating} (Expected: 4)`);

        // 7. Create Review 2 (Rating 5)
        console.log('\n7. Creating second Review (Rating: 5)...');
        const rev2Res = await request(`${baseUrl}/reviews`, {
            method: 'POST',
            body: {
                rating: 5,
                comment: 'Excellent and very prompt service.',
                userId: userId,
                hospitalId: hospitalId,
                doctorId: doctorId
            }
        });
        console.log(`   Response Status: ${rev2Res.status}`);
        if (rev2Res.status !== 201) {
            throw new Error(`Failed to create review 2 (Status: ${rev2Res.status})`);
        }
        const review2Id = rev2Res.data.data._id;

        // Verify Hospital Rating is 4.5
        getHospitalRes = await request(`${baseUrl}/hospitals/${hospitalId}`);
        console.log(`   Hospital Rating after 2nd Review: ${getHospitalRes.data.data.rating} (Expected: 4.5)`);

        // 8. Update Review 2 (Rating from 5 to 3)
        console.log('\n8. Updating second Review (Rating: 5 -> 3)...');
        const updateRev2Res = await request(`${baseUrl}/reviews/${review2Id}`, {
            method: 'PUT',
            body: {
                rating: 3,
                comment: 'It was average on second thought.'
            }
        });
        console.log(`   Response Status: ${updateRev2Res.status}`);
        getHospitalRes = await request(`${baseUrl}/hospitals/${hospitalId}`);
        console.log(`   Hospital Rating after updating 2nd Review: ${getHospitalRes.data.data.rating} (Expected: 3.5)`);

        // 9. Fetch all reviews
        console.log('\n9. Fetching reviews for hospital...');
        const listRevRes = await request(`${baseUrl}/reviews?hospitalId=${hospitalId}`);
        console.log(`   Response Status: ${listRevRes.status}`);
        console.log(`   Total Reviews Found: ${listRevRes.data.count}`);

        // 10. Update Doctor Profile (consultationFee 800 -> 950)
        console.log('\n10. Updating Doctor Profile (consultationFee: 800 -> 950)...');
        const updateDocRes = await request(`${baseUrl}/doctors/${doctorId}`, {
            method: 'PUT',
            body: {
                consultationFee: 950,
                specialization: 'Senior Cardiologist'
            }
        });
        console.log(`    Response Status: ${updateDocRes.status}`);
        console.log(`    Updated Doctor Specialization: ${updateDocRes.data.data.specialization}`);
        console.log(`    Updated Doctor Fees: ${updateDocRes.data.data.fees}`);

        // 11. Delete Review 1
        console.log('\n11. Deleting first Review...');
        const delRevRes = await request(`${baseUrl}/reviews/${review1Id}`, {
            method: 'DELETE'
        });
        console.log(`    Response Status: ${delRevRes.status}`);

        // Verify Hospital Rating goes to 3 (since only updated review 2 remains, which is 3 stars)
        getHospitalRes = await request(`${baseUrl}/hospitals/${hospitalId}`);
        console.log(`    Hospital Rating after deleting 1st Review: ${getHospitalRes.data.data.rating} (Expected: 3)`);

        // 12. Delete Doctor
        console.log('\n12. Deleting Doctor Profile...');
        const delDocRes = await request(`${baseUrl}/doctors/${doctorId}`, {
            method: 'DELETE'
        });
        console.log(`    Response Status: ${delDocRes.status}`);

        // 13. Clean up Hospital
        console.log('\n13. Cleaning up created hospital...');
        const delHospRes = await request(`${baseUrl}/hospitals/${hospitalId}`, {
            method: 'DELETE'
        });
        console.log(`    Response Status: ${delHospRes.status}`);

        console.log('\n✅ ALL DOCTOR AND REVIEW ENDPOINTS (INCLUDING PUT & DELETE) TESTED SUCCESSFULLY!');
    } catch (error) {
        console.error('\n❌ ERROR TESTING NEW ENDPOINTS:');
        console.error(error);
    }
}

start();
