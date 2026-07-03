const mongoose = require('mongoose');

const connectDB = async () => {
    // If the in-memory mode is explicitly requested
    if (process.env.USE_IN_MEMORY === 'true') {
        console.log('ℹ️ Running server in OFFLINE In-Memory Mode.');
        Object.defineProperty(mongoose.connection, 'readyState', {
            get: () => 0,
            configurable: true
        });
        return;
    }

    try {
        // Attempt to connect to MongoDB Atlas with a 5-second timeout limit
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log(`✅ MongoDB Database Connected Successfully! Host: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Failed: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
