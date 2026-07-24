const mongoose = require('mongoose');
require('dotenv').config();

const testConn = async () => {
    console.log('URI:', process.env.MONGO_URI);
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000
        });
        console.log('✅ Connected successfully!');
    } catch (err) {
        console.error('❌ Connection Error details:');
        console.error('Name:', err.name);
        console.error('Message:', err.message);
        console.error('Code:', err.code);
    } finally {
        await mongoose.disconnect();
    }
};

testConn();
