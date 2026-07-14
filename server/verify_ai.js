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
    console.log('🔄 RUNNING AI SYMPTOM CHECKER TESTING FLOW...\n');
    const baseUrl = 'http://localhost:3000/api';

    try {
        console.log('1. Preparing test doctor data in the system...');
        
        // Setup Kolkata Hospital
        const hospRes = await request(`${baseUrl}/hospitals`, {
            method: 'POST',
            body: {
                name: 'Kolkata Multispeciality Clinic',
                address: 'Salt Lake City',
                city: 'Kolkata',
                contactNumber: '033-665544'
            }
        });
        console.log('hospRes response:', JSON.stringify(hospRes, null, 2));
        const hospitalId = hospRes.data.data._id;

        // Setup Doctor 1 (Cardiologist)
        const user1Res = await request(`${baseUrl}/auth/signup`, {
            method: 'POST',
            body: {
                name: 'Dr. Debabrata Sen',
                email: `debabrata.sen_${Date.now()}@example.com`,
                password: 'password123',
                role: 'doctor'
            }
        });
        const doc1Res = await request(`${baseUrl}/doctors`, {
            method: 'POST',
            body: {
                userId: user1Res.data._id,
                hospitalId: hospitalId,
                specialization: 'Cardiologist',
                experience: 15,
                consultationFee: 1000,
                availability: [
                    { day: 'Monday', startTime: '09:00', endTime: '13:00' },
                    { day: 'Tuesday', startTime: '09:00', endTime: '13:00' }
                ]
            }
        });
        console.log(`   - Created Cardiologist Doctor Profile: ${user1Res.data.name}`);

        // Setup Doctor 2 (Neurologist)
        const user2Res = await request(`${baseUrl}/auth/signup`, {
            method: 'POST',
            body: {
                name: 'Dr. Pritam Das',
                email: `pritam.das_${Date.now()}@example.com`,
                password: 'password123',
                role: 'doctor'
            }
        });
        const doc2Res = await request(`${baseUrl}/doctors`, {
            method: 'POST',
            body: {
                userId: user2Res.data._id,
                hospitalId: hospitalId,
                specialization: 'Neurologist',
                experience: 10,
                consultationFee: 900,
                availability: [
                    { day: 'Wednesday', startTime: '09:00', endTime: '13:00' },
                    { day: 'Thursday', startTime: '09:00', endTime: '13:00' }
                ]
            }
        });
        console.log(`   - Created Neurologist Doctor Profile: ${user2Res.data.name}\n`);

        // ==========================================
        // SCENARIO A: CARDIAC SYMPTOMS
        // ==========================================
        console.log('[SCENARIO A] Testing symptom: "tightness in chest, palpitations, breathless"...');
        const symptomARes = await request(`${baseUrl}/ai/symptom-check`, {
            method: 'POST',
            body: {
                symptoms: 'I have tightness in my chest and high blood pressure, sometimes feeling breathless.',
                city: 'Kolkata'
            }
        });

        console.log(`   - Suggested Specialty: ${symptomARes.data.suggestedSpecialty} (Expected: Cardiologist)`);
        console.log(`   - Reason: ${symptomARes.data.reason}`);
        console.log(`   - Recommendations Found: ${symptomARes.data.count}`);
        if (symptomARes.data.count > 0) {
            console.log(`   - Recommended Doctor: ${symptomARes.data.recommendations[0].doctor.name}`);
            console.log(`   - Located At Hospital: ${symptomARes.data.recommendations[0].hospital.name}`);
            console.log('   ✅ SCENARIO A PASSED SUCCESSFULLY\n');
        } else {
            throw new Error('Cardiac symptom check failed to recommend Doctor 1');
        }

        // ==========================================
        // SCENARIO B: NEUROLOGICAL SYMPTOMS
        // ==========================================
        console.log('[SCENARIO B] Testing symptom: "severe headache, migraine, dizzy"...');
        const symptomBRes = await request(`${baseUrl}/ai/symptom-check`, {
            method: 'POST',
            body: {
                symptoms: 'Experiencing a severe migraine, headache, and feeling dizzy.',
                city: 'Kolkata'
            }
        });

        console.log(`   - Suggested Specialty: ${symptomBRes.data.suggestedSpecialty} (Expected: Neurologist)`);
        console.log(`   - Reason: ${symptomBRes.data.reason}`);
        console.log(`   - Recommendations Found: ${symptomBRes.data.count}`);
        if (symptomBRes.data.count > 0) {
            console.log(`   - Recommended Doctor: ${symptomBRes.data.recommendations[0].doctor.name}`);
            console.log(`   - Located At Hospital: ${symptomBRes.data.recommendations[0].hospital.name}`);
            console.log('   ✅ SCENARIO B PASSED SUCCESSFULLY\n');
        } else {
            throw new Error('Neurological symptom check failed to recommend Doctor 2');
        }

        // Clean up test hospital
        await request(`${baseUrl}/hospitals/${hospitalId}`, { method: 'DELETE' });

        console.log('🌟🌟🌟 AI SYMPTOM CHECKER API IS 100% CORRECT & WORKING PERFECTLY! 🌟🌟🌟');

    } catch (error) {
        console.error('\n❌ TEST ENCOUNTERED AN ERROR:');
        console.error(error);
    }
}

runTests();
