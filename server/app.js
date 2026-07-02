// ==========================================
// 1. IMPORT REQUIRED PACKAGES
// ==========================================
const express = require('express');
const cors = require('cors');
const path = require('path'); // 🔥 Ninja: For serving static files
require('dotenv').config();

// 🔥 FIXED PATH: config folder is inside src
const connectDB = require('./src/config/db');


// ==========================================
// 2. APP INITIALIZATION & MIDDLEWARES
// ==========================================
const app = express();

app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Good for form-data (Uploads)

// 🔥 NINJA FEATURE: Serve the 'uploads' directory statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ==========================================
// 3. DATABASE CONNECTION
// ==========================================
// This single line handles the connection using your src/config/db.js file
connectDB();


// ==========================================
// 4. IMPORT ROUTES
// ==========================================
const authRoutes = require('./src/routes/authRoutes');
const hospitalRoutes = require('./src/routes/hospitalRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes'); 
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const recordRoutes = require('./src/routes/recordRoutes');
const userRoutes = require('./src/routes/userRoutes');
const departmentRoutes = require('./src/routes/departmentRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const aiRoutes = require('./src/routes/aiRoutes'); // 🧠 AI Symptom Checker Route
const paymentRoutes = require('./src/routes/paymentRoutes'); // 💳 Payment Route


// ==========================================
// 5. USE ROUTES (Mounting API Endpoints)
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/doctors', doctorRoutes); 
app.use('/api/appointments', appointmentRoutes); 
app.use('/api/records', recordRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/ai', aiRoutes); // 🧠 AI endpoints mounted
app.use('/api/payments', paymentRoutes); // 💳 Payment endpoints mounted


// ==========================================
// 6. BASIC TEST ROUTE
// ==========================================
app.get('/', (req, res) => {
    res.send('FlexiBook Backend is Running Smoothly (With All Routes)! 🚀');
});


// ==========================================
// 7. START THE SERVER
// ==========================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Server is running smoothly on port ${PORT}`);
    console.log(`📂 Static uploads are served at: /uploads`);
    console.log(`=========================================`);
});