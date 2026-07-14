// c:\Users\priti\OneDrive\Desktop\BACKEND\flexibook\server\verify_waiting_room_standalone.js
process.env.USE_IN_MEMORY = 'true';
require('dotenv').config();

const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const generateToken = require('./src/utils/generateToken');

// 1. Mock node-cron before requiring virtualWaitingRoom
const cron = require('node-cron');
let waitingRoomScanFn = null;
cron.schedule = (expression, fn) => {
    waitingRoomScanFn = fn;
    console.log(`- Intercepted Cron Schedule: [${expression}]`);
};

// 2. Mock notificationService to track alerts
const notificationService = require('./src/services/notificationService');
const dispatchedAlerts = [];
notificationService.sendAppointmentAlert = async (data) => {
    console.log(`   [NOTIFY DISPATCH] Type: ${data.type}, Patient: ${data.name}, Token: #${data.tokenNumber}`);
    dispatchedAlerts.push(data);
    return { success: true };
};

// 3. Mock socket.io globally
const socketEmits = [];
const mockSocketIO = {
    to: (room) => {
        return {
            emit: (event, data) => {
                socketEmits.push({ room, event, data });
                console.log(`   [WEBSOCKET EMIT] Room: ${room}, Event: ${event}, Payload:`, data);
            }
        };
    },
    emit: (event, data) => {
        socketEmits.push({ global: true, event, data });
        console.log(`   [WEBSOCKET EMIT] Global, Event: ${event}, Payload:`, data);
    }
};

const socketConfig = require('./src/config/socket');
socketConfig.getIO = () => mockSocketIO;

// Now import the database configurations and models
const inMemoryDb = require('./src/utils/inMemoryDb');
const connectDB = require('./src/config/db');
const Appointment = require('./src/models/Appointment');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const startVirtualWaitingRoom = require('./src/services/virtualWaitingRoom');

const runAudit = async () => {
    console.log('🔄 STARTING VIRTUAL WAITING ROOM & WEB-SOCKET QUEUE UPDATES AUDIT...');

    // A. Start local Express Test Server on Port 3005
    const app = express();
    app.use(express.json());
    app.use('/api/appointments', appointmentRoutes);
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(3005, resolve));
    console.log('- Test server listening on port 3005...');

    // Force offline in-memory database mode
    await connectDB();

    // Setup HTTP helper
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

    const baseUrl = 'http://localhost:3005/api/appointments';

    try {
        // Setup mock parameters
        const patient1Id = new mongoose.Types.ObjectId().toString();
        const patient2Id = new mongoose.Types.ObjectId().toString();
        const patient3Id = new mongoose.Types.ObjectId().toString();
        const doctorId = new mongoose.Types.ObjectId().toString();
        const hospitalId = new mongoose.Types.ObjectId().toString();

        const mockUserId = new mongoose.Types.ObjectId().toString();
        const token = generateToken(mockUserId);

        inMemoryDb.users.push({ _id: mockUserId, name: 'Audit User', role: 'patient', email: 'audit@flexibook.com' });
        inMemoryDb.users.push({ _id: patient1Id, name: 'Sainee Sarker', email: 'sainee@example.com', phone: '9903592889' });
        inMemoryDb.users.push({ _id: patient2Id, name: 'Pritish Ghosh', email: 'pritish@example.com', phone: '9883769499' });
        inMemoryDb.users.push({ _id: patient3Id, name: 'Aritra Das', email: 'aritra@example.com', phone: '9000000000' });
        inMemoryDb.doctors.push({ _id: doctorId, userId: new mongoose.Types.ObjectId().toString() });
        inMemoryDb.hospitals.push({ _id: hospitalId, name: 'Metro General Hospital' });

        // Initialize Virtual Waiting Room (intercepts cron hook)
        startVirtualWaitingRoom();

        if (!waitingRoomScanFn) {
            throw new Error('Waiting Room logic was not registered inside node-cron!');
        }

        // ==========================================================
        // TEST 1: VIRTUAL WAITING ROOM ETA CALCULATION & ALERTS
        // ==========================================================
        console.log('\n[TEST 1] Seeding live queue and triggering Virtual Waiting Room Scan...');
        
        const app1Id = new mongoose.Types.ObjectId().toString();
        const app2Id = new mongoose.Types.ObjectId().toString();
        const app3Id = new mongoose.Types.ObjectId().toString();

        const today = new Date();

        // 3 appointments in queue
        // Patient 1: index 0 (ETA: 0 mins)
        // Patient 2: index 1 (ETA: 10 mins)
        // Patient 3: index 2 (ETA: 20 mins)
        inMemoryDb.appointments.push({
            _id: app1Id,
            patient: patient1Id,
            patientName: 'Sainee Sarker',
            email: 'sainee@example.com',
            phone: '9903592889',
            doctor: doctorId,
            doctorName: 'Dr. Sen',
            hospital: hospitalId,
            date: today,
            tokenNumber: 1,
            status: 'in-queue',
            virtualAlertSent: false,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        inMemoryDb.appointments.push({
            _id: app2Id,
            patient: patient2Id,
            patientName: 'Pritish Ghosh',
            email: 'pritish@example.com',
            phone: '9883769499',
            doctor: doctorId,
            doctorName: 'Dr. Sen',
            hospital: hospitalId,
            date: today,
            tokenNumber: 2,
            status: 'in-queue',
            virtualAlertSent: false,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        inMemoryDb.appointments.push({
            _id: app3Id,
            patient: patient3Id,
            patientName: 'Aritra Das',
            email: 'aritra@example.com',
            phone: '9000000000',
            doctor: doctorId,
            doctorName: 'Dr. Sen',
            hospital: hospitalId,
            date: today,
            tokenNumber: 3,
            status: 'in-queue',
            virtualAlertSent: false,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Trigger Waiting Room Check Function
        await waitingRoomScanFn();

        // Validate alerts
        // Patient 1 (ETA 0) and Patient 2 (ETA 10) should have received alerts.
        // Patient 3 (ETA 20) should NOT have received an alert since wait time > 15 mins.
        console.log(`   - Alerts Sent Count: ${dispatchedAlerts.length} (Expected: 2)`);
        
        const alertedTokens = dispatchedAlerts.map(a => a.tokenNumber);
        console.log(`   - Alerted Tokens: ${JSON.stringify(alertedTokens)} (Expected: [1, 2])`);

        const p1After = inMemoryDb.appointments.find(a => a._id === app1Id);
        const p2After = inMemoryDb.appointments.find(a => a._id === app2Id);
        const p3After = inMemoryDb.appointments.find(a => a._id === app3Id);

        console.log(`   - Token #1 Alert Sent Flag: ${p1After.virtualAlertSent} (Expected: true)`);
        console.log(`   - Token #3 Alert Sent Flag: ${p3After.virtualAlertSent} (Expected: false)`);

        if (dispatchedAlerts.length !== 2 || !alertedTokens.includes(1) || !alertedTokens.includes(2) || p1After.virtualAlertSent !== true || p3After.virtualAlertSent !== false) {
            throw new Error('Test 1 failed: Waiting room alerting logic is incorrect!');
        }
        console.log('   ✅ TEST 1 PASSED (Waiting room notifications working perfectly!)');

        // ==========================================================
        // TEST 2: REAL-TIME WEB-SOCKET EMITS FOR NEXT PATIENT CALL
        // ==========================================================
        console.log('\n[TEST 2] Triggering /next-patient checkup call endpoint (Doctor dashboard simulation)...');
        
        socketEmits.length = 0; // Clear previous logs
        const nextPatRes = await request(`${baseUrl}/next-patient`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: {
                doctorId: doctorId,
                currentServingToken: 2
            }
        });

        console.log(`   - Response Status: ${nextPatRes.status}`);
        console.log(`   - Response Message: ${nextPatRes.body.message}`);
        console.log(`   - Intercepted Socket Emits Count: ${socketEmits.length} (Expected: 2)`);

        const queueUpdateEvent = socketEmits.find(e => e.event === 'queue_update');
        const yourTurnEvent = socketEmits.find(e => e.event === 'your_turn_alert');

        console.log(`   - Queue Update Event Room: ${queueUpdateEvent?.room}`);
        console.log(`   - Queue Update currentToken: ${queueUpdateEvent?.data.currentToken} (Expected: 2)`);
        console.log(`   - Your Turn Alert tokenNumber: ${yourTurnEvent?.data.tokenNumber} (Expected: 2)`);

        if (nextPatRes.status !== 200 || socketEmits.length !== 2 || !queueUpdateEvent || !yourTurnEvent || queueUpdateEvent.data.currentToken !== 2 || yourTurnEvent.data.tokenNumber !== 2) {
            throw new Error('Test 2 failed: Next patient websocket broadcasts failed!');
        }
        console.log('   ✅ TEST 2 PASSED (Real-time queue update websocket emissions working perfectly!)');

        // ==========================================================
        // TEST 3: REAL-TIME WEB-SOCKET EMERGENCY BROADCASTS
        // ==========================================================
        console.log('\n[TEST 3] Triggering /trigger-emergency broadcast endpoint...');

        socketEmits.length = 0; // Clear logs
        const emergencyMsg = "Urgent: Dr. Sen is called to emergency surgery. Expect 30 mins delay.";
        const emergencyRes = await request(`${baseUrl}/trigger-emergency`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: {
                message: emergencyMsg
            }
        });

        console.log(`   - Response Status: ${emergencyRes.status}`);
        console.log(`   - Response Message: ${emergencyRes.body.message}`);
        console.log(`   - Intercepted Socket Emits Count: ${socketEmits.length} (Expected: 1)`);

        const broadcastEvent = socketEmits[0];
        console.log(`   - Broadcast is Global: ${broadcastEvent?.global}`);
        console.log(`   - Broadcast Message: "${broadcastEvent?.data.message}"`);

        if (emergencyRes.status !== 200 || socketEmits.length !== 1 || !broadcastEvent || broadcastEvent.global !== true || broadcastEvent.data.message !== emergencyMsg) {
            throw new Error('Test 3 failed: Emergency websocket broadcasts failed!');
        }
        console.log('   ✅ TEST 3 PASSED (Global emergency WebSocket broadcasts working perfectly!)');

        console.log('\n🌟🌟🌟 LIVE WAITING ROOM & REAL-TIME WEB-SOCKET QUEUE ENGINE WORKING 100% PERFECTLY! 🌟🌟🌟');

    } catch (error) {
        console.error('\n❌ AUDIT ENCOUNTERED AN ERROR:');
        console.error(error);
    } finally {
        server.close();
        console.log('\n- Test server shutdown successfully.');
    }
};

runAudit();
