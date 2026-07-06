const mongoose = require('mongoose');
const User = require('../src/models/user');
require('dotenv').config();

async function run() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected! Creating test user...');

        const email = `test_create_${Date.now()}@example.com`;
        const user = await User.create({
            name: 'Test Create',
            email: email,
            password: 'password123',
            role: 'patient'
            // mobile is undefined
        });

        console.log('User created:', user);
        console.log('Has mobile key:', 'mobile' in user.toObject());
        console.log('Mobile value:', user.mobile);

        // Fetch back from database to see exactly what MongoDB stored
        const dbUser = await mongoose.connection.db.collection('users').findOne({ email });
        console.log('Stored in DB:', dbUser);
        console.log('Has mobile key in DB:', 'mobile' in dbUser);
    } catch (err) {
        console.error('Error occurred:', err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
