// Node.js ko bolna ki 10 ki jagah 20 listeners allow kare
require('events').EventEmitter.defaultMaxListeners = 50;

// ==========================================
// 1. IMPORT REQUIRED PACKAGES & LOAD ENV
// ==========================================
const path = require('path'); 
// 🔥 CTO FIX: .env ka exact path sabse pehle load kiya!
require('dotenv').config({ path: path.join(__dirname, '.env') }); 

const express = require('express');
const cors = require('cors');
const http = require('http'); // 🚨 NAYA: Node ka default HTTP module WebSockets ke liye

// 🔥 FIXED PATH: config folder is inside src
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/config/socket'); // 🚨 NAYA: Apna WebSocket Engine import kiya


// ==========================================
// 2. APP INITIALIZATION & MIDDLEWARES
// ==========================================
const app = express();
const server = http.createServer(app); // 🚨 NAYA: Express ko HTTP server mein wrap kiya

app.use(cors()); 
// 🚨 NINJA FIX: express.json() hamesha routes se UPAR hona chahiye!
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Good for form-data (Uploads)

// 🔥 NINJA FEATURE: Serve the 'uploads' directory statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ==========================================
// 3. DATABASE CONNECTION & ENGINES
// ==========================================
// This single line handles the connection using your src/config/db.js file
connectDB();

// ==========================================
// 🚀 START BACKGROUND ENGINES
// ==========================================
// 1. WhatsApp Cron Engine (For Offline Patients)
const startVirtualWaitingRoom = require('./src/services/virtualWaitingRoom');
startVirtualWaitingRoom(); // Live ETA WhatsApp engine started

// 2. WebSockets Engine (For Live App/Website Patients)
initSocket(server); // 🚨 NAYA: Socket.io engine start kar diya!


// ==========================================
// 4. IMPORT ROUTES
// ==========================================
const authRoutes = require('./src/routes/authRoutes');
const hospitalRoutes = require('./src/routes/hospitalRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes'); 
const recordRoutes = require('./src/routes/recordRoutes');
const userRoutes = require('./src/routes/userRoutes');
const departmentRoutes = require('./src/routes/departmentRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const complaintRoutes = require('./src/routes/complaintRoutes'); // 🎫 Private Complaints & Feedback Route
const voiceQueueRoutes = require('./src/routes/voiceQueueRoutes'); // 🎙️ AI Voice-to-Queue Webhook Route
const aiRoutes = require('./src/routes/aiRoutes'); // 🧠 AI Symptom Checker Route
const paymentRoutes = require('./src/routes/paymentRoutes'); // 💳 Payment Route
const appointmentRoutes = require('./src/routes/appointmentRoutes'); // 🚨 Wapas sahi jagah import kiya


// ==========================================
// 5. USE ROUTES (Mounting API Endpoints)
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/doctors', doctorRoutes); 
app.use('/api/records', recordRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/complaints', complaintRoutes); // 🎫 Complaints endpoints mounted
app.use('/api/voice-queue', voiceQueueRoutes); // 🎙️ Webhook endpoint mounted
app.use('/api/ai', aiRoutes); // 🧠 AI endpoints mounted
app.use('/api/payments', paymentRoutes); // 💳 Payment endpoints mounted
app.use('/api/appointments', appointmentRoutes); // 🚨 Wapas sahi jagah mount kiya


// ==========================================
// 6. BASIC TEST ROUTE
// ==========================================
app.get('/', (req, res) => {
    res.send('FlexiBook Backend is Running Smoothly (With All Routes & WebSockets)! 🚀');
});


// ==========================================
// 7. START THE SERVER
// ==========================================
const PORT = process.env.PORT || 3000;

// 🚨 IMPORTANT FIX: Yahan 'app.listen' ki jagah 'server.listen' chalana hai
server.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Server & WebSockets are running smoothly on port ${PORT}`);
    console.log(`📂 Static uploads are served at: /uploads`);
    console.log(`=========================================`);
});