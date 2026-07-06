const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        const usersCollection = mongoose.connection.db.collection('users');

        const allUsers = await usersCollection.find().toArray();
        console.log(`Total users in DB: ${allUsers.length}`);

        for (const user of allUsers) {
            console.log(`User: ${user.email}, mobile field: ${JSON.stringify(user.mobile)}, has_mobile_key: ${'mobile' in user}`);
        }
    } catch (err) {
        console.error('Error occurred:', err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
