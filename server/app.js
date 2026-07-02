const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// App Initialization
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
// Database Connection
if (process.env.USE_IN_MEMORY === 'true') {
    console.log('ℹ️ Running server in OFFLINE In-Memory Mode.');
    Object.defineProperty(mongoose.connection, 'readyState', {
        get: () => 0,
        configurable: true
    });
} else {
    mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000 // Timeout connection attempts after 5 seconds
    })
    .then(() => console.log('✅ MongoDB Database Connected Successfully!'))
    .catch((err) => {
        console.log('⚠️ MongoDB Connection Failed:', err.message);
        console.log('ℹ️ Automatically falling back to OFFLINE In-Memory Mode.');
        Object.defineProperty(mongoose.connection, 'readyState', {
            get: () => 0,
            configurable: true
        });
    });
}

// --- IMPORT ROUTES ---
const authRoutes = require('./src/routes/authRoutes');
const hospitalRoutes = require('./src/routes/hospitalRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes');
const departmentRoutes = require('./src/routes/departmentRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const aiRoutes = require('./src/routes/aiRoutes'); // 🧠 AI Symptom Checker Route link ho gaya
const paymentRoutes = require('./src/routes/paymentRoutes'); // 💳 Payment Route link ho gaya

// --- USE ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/ai', aiRoutes); // 🧠 AI endpoints mounted
app.use('/api/payments', paymentRoutes); // 💳 Payment endpoints mounted

// Basic Test Route
app.get('/', (req, res) => {
    res.send('FlexiBook Backend is Running Smoothly with Nodemon! 🚀');
});

// Server Listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running smoothly on port ${PORT}`);
});