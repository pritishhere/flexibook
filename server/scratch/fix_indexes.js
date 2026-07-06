const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected! Fetching collections...');

        const usersCollection = mongoose.connection.db.collection('users');

        // Check if there are users with mobile: null
        const nullMobileUsers = await usersCollection.find({ mobile: null }).toArray();
        console.log(`Found ${nullMobileUsers.length} users with mobile: null`);

        if (nullMobileUsers.length > 0) {
            console.log('Unsetting "mobile" field for these users so it becomes undefined...');
            const updateResult = await usersCollection.updateMany(
                { mobile: null },
                { $unset: { mobile: "" } }
            );
            console.log(`Updated ${updateResult.modifiedCount} documents.`);
        }

        console.log('Fetching indexes for "users" collection...');
        let indexes = await usersCollection.indexes();
        console.log('Current Indexes:', JSON.stringify(indexes, null, 2));

        const mobileIndex = indexes.find(idx => idx.name === 'mobile_1');
        if (mobileIndex) {
            console.log('Found "mobile_1" index. Dropping it first to ensure correct configuration...');
            await usersCollection.dropIndex('mobile_1');
            console.log('Successfully dropped "mobile_1" index!');
        }

        console.log('Creating sparse unique index on "mobile"...');
        await usersCollection.createIndex({ mobile: 1 }, { unique: true, sparse: true, name: 'mobile_1' });
        console.log('Successfully created "mobile_1" sparse index!');

        indexes = await usersCollection.indexes();
        console.log('Updated Indexes:', JSON.stringify(indexes, null, 2));
    } catch (err) {
        console.error('Error occurred:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database.');
    }
}

run();
