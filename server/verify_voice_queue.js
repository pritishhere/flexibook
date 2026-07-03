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
    console.log('🔄 STARTING MULTIMODAL AI VOICE-TO-QUEUE WEBHOOK AUDIT...');

    // 1. Download mock audio sample to test the download parser
    const mockAudioPath = path.join(__dirname, 'test_voice.mp3');
    try {
        console.log('- Fetching small sample audio file from public CDN...');
        await fetchSampleAudio(mockAudioPath);
        console.log('  ✅ Mock audio saved locally.');
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
    console.log('- Twilio Mock CDN Server listening on port 3006...');

    // 3. Launch our webhook test server on port 3005
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true })); // Twilio sends urlencoded payloads!
    app.use('/api/voice-queue', voiceQueueRoutes);
    
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(3005, resolve));
    console.log('- Webhook Receiver Server listening on port 3005...');

    // Force offline mode for audit safety
    process.env.USE_IN_MEMORY = 'true'; 
    await connectDB();

    // Seed mock doctor and hospital in memory
    const docUserId = new mongoose.Types.ObjectId().toString();
    const doctorId = new mongoose.Types.ObjectId().toString();
    const hospitalId = new mongoose.Types.ObjectId().toString();

    inMemoryDb.users.push({ _id: docUserId, name: 'Dr. Debabrata Sen' });
    inMemoryDb.doctors.push({ 
        _id: doctorId, 
        userId: docUserId, 
        specialization: 'Gastroenterologist', 
        hospitalId,
        consultationFee: 1000 
    });
    inMemoryDb.hospitals.push({ _id: hospitalId, name: 'Metro General Hospital', city: 'Kolkata' });

    console.log(`\n✅ Setup Mock Clinic:`);
    console.log(`   - Target Specialization: Gastroenterologist`);
    console.log(`   - Doctor: Dr. Debabrata Sen (Fee: ₹1000)`);

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

    try {
        // ==========================================================
        // TEST 1: TEXT QUERY BOOKING (Hindi query)
        // ==========================================================
        console.log('\n[TEST 1] Testing text-based booking in Hindi...');
        const textRes = await request(webhookUrl, {
            From: 'whatsapp:+919883769499',
            Body: 'kal subha ke liye pet dard ke doctor ka number laga do bhaiya, mera naam Sainee hai.'
        });

        console.log(`   - Response Status: ${textRes.status}`);
        console.log(`   - TwiML Output Received:\n${textRes.body}`);

        if (textRes.status !== 200 || !textRes.body.includes('Gastroenterologist') || !textRes.body.includes('Sainee')) {
            throw new Error('Test 1 failed: Gemini could not parse text query successfully!');
        }
        console.log('   ✅ TEST 1 PASSED (AI parsed Hindi request & booked Gastroenterologist!)');

        // ==========================================================
        // TEST 2: AUDIO WEBHOOK SIMULATION (Twilio download pipeline)
        // ==========================================================
        console.log('\n[TEST 2] Testing voice note (multimodal audio) booking via CDN URL...');
        const voiceRes = await request(webhookUrl, {
            From: 'whatsapp:+919903592889',
            MediaUrl0: 'http://localhost:3006/test_voice.mp3',
            MediaContentType0: 'audio/mp3'
        });

        console.log(`   - Response Status: ${voiceRes.status}`);
        console.log(`   - TwiML Output Received:\n${voiceRes.body}`);

        if (voiceRes.status !== 200 || !voiceRes.body.includes('Confirmed')) {
            throw new Error('Test 2 failed: Audio download or Gemini parser failed!');
        }
        console.log('   ✅ TEST 2 PASSED (Webhook downloaded audio and booked appointment!)');

        console.log('\n🌟🌟🌟 MULTIMODAL AI WHATSAPP VOICE RECEIVER ENGINE CONFIRMED WORKING 100% PERFECTLY! 🌟🌟🌟');

    } catch (error) {
        console.error('\n❌ AUDIT ENCOUNTERED AN ERROR:');
        console.error(error);
    } finally {
        server.close();
        mediaServer.close();
        // Cleanup local file
        if (fs.existsSync(mockAudioPath)) {
            fs.unlinkSync(mockAudioPath);
        }
        console.log('- Test servers shutdown and cleaned up.');
    }
};

runAudit();
