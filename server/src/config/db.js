const mongoose = require('mongoose');

const setInMemoryMode = () => {
    process.env.USE_IN_MEMORY = 'true';
};

const setDatabaseMode = () => {
    process.env.USE_IN_MEMORY = 'false';
};

const connectDB = async () => {
    if (process.env.USE_IN_MEMORY === 'true') {
        console.log('ℹ️ Running server in OFFLINE In-Memory Mode.');
        return;
    }

    if (!process.env.MONGO_URI) {
        console.warn('⚠️ No MONGO_URI configured. Falling back to OFFLINE In-Memory Mode.');
        setInMemoryMode();
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
            socketTimeoutMS: 10000
        });
        setDatabaseMode();
        console.log(`✅ MongoDB Database Connected Successfully! Host: ${conn.connection.host}`);
    } catch (error) {
        console.warn(`⚠️ MongoDB Connection Failed: ${error.message}. Falling back to OFFLINE In-Memory Mode.`);
        setInMemoryMode();
    }
};

const retryConnection = async () => {
    if (process.env.USE_IN_MEMORY === 'true') {
        try {
            await connectDB();
        } catch (error) {
            console.warn('Retry connection failed:', error.message);
        }
    }
};

mongoose.connection.on('connected', () => {
    setDatabaseMode();
});

mongoose.connection.on('disconnected', () => {
    if (process.env.USE_IN_MEMORY !== 'true') {
        console.warn('⚠️ MongoDB disconnected. Switching to in-memory fallback for auth/data routes.');
        setInMemoryMode();
    }
});

mongoose.connection.on('reconnected', () => {
    setDatabaseMode();
    console.log('🔄 MongoDB reconnected successfully.');
});

module.exports = connectDB;
