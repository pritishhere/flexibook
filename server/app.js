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
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ MongoDB Database Connected Successfully!'))
.catch((err) => console.log('❌ MongoDB Connection Failed:', err.message));

// --- IMPORT ROUTES ---
const authRoutes = require('./src/routes/authRoutes');
const hospitalRoutes = require('./src/routes/hospitalRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes'); // 🔥 Naya Doctor Route aa gaya
const departmentRoutes = require('./src/routes/departmentRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');

// --- USE ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/doctors', doctorRoutes); // 🔥 Naya Doctor Route link ho gaya
app.use('/api/departments', departmentRoutes);
app.use('/api/services', serviceRoutes);

// Basic Test Route
app.get('/', (req, res) => {
    res.send('FlexiBook Backend is Running Smoothly with Nodemon! 🚀');
});

// Server Listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running smoothly on port ${PORT}`);
});