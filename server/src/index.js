const express = require('express');
const cors = require('cors');
const complaintRoutes = require('./routes/complaintRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middleware
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// 2. Mount Your Complaint Routes
app.use('/api/complaints', complaintRoutes);

// 3. Base Status Route
app.get('/status', (req, res) => {
  res.status(200).json({ status: 'Local mockup server is running smoothly!' });
});

// 4. Start Server
app.listen(PORT, () => {
  console.log(`⚡ Backend server running on http://localhost:${PORT}`);
  console.log(`📁 Local in-memory storage initialized (No MongoDB required!)`);
});