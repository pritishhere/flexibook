const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        const usersCollection = mongoose.connection.db.collection('users');

        // Delete all users whose email starts with "audit_user_"
        const deleteResult = await usersCollection.deleteMany({
            email: { $regex: /^audit_user_/i }
        });
        console.log(`Deleted ${deleteResult.deletedCount} audit test users.`);

        // Also check if there are any other users with mobile: null
        const nullMobileUsers = await usersCollection.find({ mobile: null }).toArray();
        console.log(`Remaining users with mobile: null: ${nullMobileUsers.length}`);
        for (const u of nullMobileUsers) {
            console.log(` - User: ${u.email}, mobile: ${u.mobile}`);
            if ('mobile' in u) {
                console.log(`   Removing mobile key for ${u.email}...`);
                const res = await usersCollection.updateOne({ _id: u._id }, { $unset: { mobile: "" } });
                console.log(`   Update result: modifiedCount = ${res.modifiedCount}`);
            }
        }

    } catch (err) {
        console.error('Error occurred:', err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
