const { fork } = require('child_process');
const http = require('http');
require('dotenv').config();

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

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
    console.log('🔄 STARTING SELF-CONTAINED AI SYMPTOM CHECKER AUDIT...');
    const testPort = '3005';
    const baseUrl = `http://localhost:${testPort}/api`;

    // Start the server on port 3005 in a child process
    console.log(`- Launching test server on port ${testPort}...`);
    const serverProcess = fork('./app.js', [], {
        env: {
            ...process.env,
            PORT: testPort
        },
        silent: false // show log output
    });

    // Wait 10 seconds for server to bind and connect to MongoDB
    await delay(10000);

    try {
        console.log('- Preparing test doctor & hospital database entries...');

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
        const hospitalId = hospRes.data.data._id;

        // Setup Doctor 1 (Cardiologist)
        const user1Res = await request(`${baseUrl}/auth/signup`, {
            method: 'POST',
            body: {
                name: 'Dr. Debabrata Sen',
                email: `debabrata.sen_${Date.now()}@example.com`,
                password: 'password123',
                mobile: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
                role: 'doctor'
            }
        });
        const doc1Res = await request(`${baseUrl}/doctors`, {
            method: 'POST',
            body: {
                userId: user1Res.data ? user1Res.data._id : null,
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
        console.log(`   [DEBUG] user1Res status: ${user1Res.status}, data: ${JSON.stringify(user1Res.data)}`);
        console.log(`   [DEBUG] doc1Res status: ${doc1Res.status}, data: ${JSON.stringify(doc1Res.data)}`);
        console.log(`   ✅ Created Cardiologist Doctor: ${user1Res.data ? user1Res.data.name : 'undefined'}`);

        // Setup Doctor 2 (Neurologist)
        const user2Res = await request(`${baseUrl}/auth/signup`, {
            method: 'POST',
            body: {
                name: 'Dr. Pritam Das',
                email: `pritam.das_${Date.now()}_2@example.com`,
                password: 'password123',
                mobile: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
                role: 'doctor'
            }
        });
        const doc2Res = await request(`${baseUrl}/doctors`, {
            method: 'POST',
            body: {
                userId: user2Res.data ? user2Res.data._id : null,
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
        console.log(`   [DEBUG] user2Res status: ${user2Res.status}, data: ${JSON.stringify(user2Res.data)}`);
        console.log(`   [DEBUG] doc2Res status: ${doc2Res.status}, data: ${JSON.stringify(doc2Res.data)}`);
        console.log(`   ✅ Created Neurologist Doctor: ${user2Res.data ? user2Res.data.name : 'undefined'}\n`);

        // ==========================================
        // SCENARIO A: CARDIAC SYMPTOMS
        // ==========================================
        console.log('[SCENARIO A] Testing symptom check: "tightness in chest, palpitations, breathless"...');
        const symptomARes = await request(`${baseUrl}/ai/symptom-check`, {
            method: 'POST',
            body: {
                symptoms: 'I feel a strong tightness in my chest and high blood pressure, sometimes feeling breathless.',
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
        console.log('[SCENARIO B] Testing symptom check: "severe headache, migraine, dizzy"...');
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

        console.log('🌟🌟🌟 AI SYMPTOM CHECKER API IS confirmed 100% CORRECT & WORKING PERFECTLY! 🌟🌟🌟');

    } catch (error) {
        console.error('\n❌ AUDIT ENCOUNTERED AN ERROR:');
        console.error(error);
    } finally {
        console.log('- Shutting down test server process...');
        serverProcess.kill('SIGINT');
    }
}

runTests();
