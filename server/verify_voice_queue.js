const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const https = require('https');
const mongoose = require('mongoose');
require('dotenv').config();

const inMemoryDb = require('./src/utils/inMemoryDb');
const connectDB = require('./src/config/db');

// Import routes
const voiceQueueRoutes = require('./src/routes/voiceQueueRoutes');

// Helper to download the mock audio file from Stanford's public research servers (tiny 30KB piano note)
const fetchSampleAudio = (dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get('https://ccrma.stanford.edu/~jos/mp3/pno-cs.mp3', (res) => {
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
};

const runAudit = async () => {
    console.log('🔄 STARTING CONVERSATIONAL ONBOARDING & WEBHOOK AUDIT...');

    // 1. Download mock audio sample
    const mockAudioPath = path.join(__dirname, 'test_voice.mp3');
    try {
        await fetchSampleAudio(mockAudioPath);
    } catch (err) {
        console.warn('  ⚠️ Failed to fetch mock audio, will use text mock for fallback.');
    }

    // 2. Start mock static files server on port 3006 (Simulating Twilio Hosting CDN)
    const mediaApp = express();
    mediaApp.get('/test_voice.mp3', (req, res) => {
        res.sendFile(mockAudioPath);
    });
    const mediaServer = http.createServer(mediaApp);
    await new Promise((resolve) => mediaServer.listen(3006, resolve));

    // 3. Launch our webhook test server on port 3005
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/api/voice-queue', voiceQueueRoutes);
    
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(3005, resolve));
    console.log('- Webhook Receiver Server listening on port 3005...');

    // Force offline mode for audit safety
    process.env.USE_IN_MEMORY = 'true'; 
    await connectDB();

    // Reset database stores
    inMemoryDb.users = [];
    inMemoryDb.doctors = [];
    inMemoryDb.hospitals = [];
    inMemoryDb.appointments = [];
    inMemoryDb.whatsappSessions = [];

    // Seed doctor and hospital in memory
    const docUserId = new mongoose.Types.ObjectId().toString();
    const doctorId = new mongoose.Types.ObjectId().toString();
    const hospitalId = new mongoose.Types.ObjectId().toString();

    inMemoryDb.users.push({ _id: docUserId, name: 'Dr. Debabrata Sen', mobile: '9999999999', email: 'doc@flexi.com' });
    inMemoryDb.doctors.push({ 
        _id: doctorId, 
        userId: docUserId, 
        specialization: 'Gastroenterologist', 
        hospitalId,
        consultationFee: 1000 
    });
    inMemoryDb.hospitals.push({ _id: hospitalId, name: 'Kolkata Multispeciality Clinic', address: 'Salt Lake City', city: 'Kolkata' });

    console.log(`✅ Seeded Kolkata Multispeciality Clinic & Dr. Debabrata Sen (Gastroenterologist).`);

    const request = async (url, bodyParams = {}) => {
        return new Promise((resolve, reject) => {
            const postData = Object.keys(bodyParams)
                .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(bodyParams[key]))
                .join('&');

            const req = http.request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(postData)
                }
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({ status: res.statusCode, body: data }));
            });
            req.on('error', reject);
            req.write(postData);
            req.end();
        });
    };

    const webhookUrl = 'http://localhost:3005/api/voice-queue/whatsapp';
    const testNewPhone = 'whatsapp:+918888888888';

    try {
        // ==========================================================
        // MULTI-TURN ONBOARDING TEST
        // ==========================================================
        console.log('\n💬 [ONBOARDING STEP 1] First message from unregistered number...');
        const step1 = await request(webhookUrl, { From: testNewPhone, Body: 'hi' });
        console.log(`   - Output:\n${step1.body}`);
        if (!step1.body.includes('Full Name')) {
            throw new Error('Step 1 failed: chatbot did not ask for Full Name!');
        }

        console.log('\n💬 [ONBOARDING STEP 2] Sending patient name...');
        const step2 = await request(webhookUrl, { From: testNewPhone, Body: 'Pritish Ghosh' });
        console.log(`   - Output:\n${step2.body}`);
        if (!step2.body.includes('Date of Birth') || !step2.body.includes('Pritish Ghosh')) {
            throw new Error('Step 2 failed: chatbot did not verify name or ask for DOB!');
        }

        console.log('\n💬 [ONBOARDING STEP 3a] Sending invalid DOB formatting...');
        const step3a = await request(webhookUrl, { From: testNewPhone, Body: '12-december-1998' });
        console.log(`   - Output:\n${step3a.body}`);
        if (!step3a.body.includes('Invalid format')) {
            throw new Error('Step 3a failed: validation regex did not catch invalid date format!');
        }

        console.log('\n💬 [ONBOARDING STEP 3b] Sending valid DOB formatting...');
        const step3b = await request(webhookUrl, { From: testNewPhone, Body: '11-09-1998' });
        console.log(`   - Output:\n${step3b.body}`);
        if (!step3b.body.includes('Registration Successful') || !step3b.body.includes('11-09-1998')) {
            throw new Error('Step 3b failed: onboarding registration failed!');
        }

        // ==========================================================
        // PROCEED TO BOOKING (Now that number is registered!)
        // ==========================================================
        console.log('\n💬 [ONBOARDING STEP 4] Sending appointment text request...');
        const step4 = await request(webhookUrl, {
            From: testNewPhone,
            Body: 'kal subha Kolkata Multispeciality Clinic me pet dard ke doctor ka number lagado'
        });
        console.log(`   - Output:\n${step4.body}`);

        if (!step4.body.includes('Kolkata Multispeciality Clinic') || !step4.body.includes('Pritish Ghosh') || !step4.body.includes('DOB: 11-09-1998')) {
            throw new Error('Step 4 failed: booking was not resolved with patient demographics!');
        }

        console.log('\n   ✅ CONVERSATIONAL CHATBOT STATE MACHINE ONBOARDING PASSED!');
        console.log('\n🌟🌟🌟 INTERACTIVE PATIENT REGISTRATION ENGINE CONFIRMED WORKING 100% PERFECTLY! 🌟🌟🌟');

    } catch (error) {
        console.error('\n❌ AUDIT ENCOUNTERED AN ERROR:');
        console.error(error);
    } finally {
        server.close();
        mediaServer.close();
        if (fs.existsSync(mockAudioPath)) {
            fs.unlinkSync(mockAudioPath);
        }
        console.log('- Test servers shutdown and cleaned up.');
    }
};

runAudit();
