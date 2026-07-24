const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/user');

const createOrFindAdmin = async () => {
    console.log('🔌 Connecting to database...');
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('✅ Connected successfully!');

        // Check if an admin already exists
        const existingAdmins = await User.find({ role: 'admin' });
        
        console.log('\n🔍 Existing Admin Accounts:');
        if (existingAdmins.length > 0) {
            existingAdmins.forEach(admin => {
                console.log(`- Name: ${admin.name} | Email: ${admin.email}`);
            });
        } else {
            console.log('No admin users found.');
        }

        // Create or reset default admin account
        const adminEmail = 'admin@flexibook.com';
        const adminPassword = 'adminpassword123';

        let adminUser = await User.findOne({ email: adminEmail });

        if (adminUser) {
            adminUser.role = 'admin';
            adminUser.password = adminPassword; // Pre-save hook will hash it
            await adminUser.save();
            console.log(`\n✅ Existing admin account updated successfully:`);
        } else {
            adminUser = new User({
                name: 'System Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'admin'
            });
            await adminUser.save();
            console.log(`\n🎉 Created brand new admin account:`);
        }

        console.log(`-----------------------------------`);
        console.log(`Email:    ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log(`Role:     admin`);
        console.log(`-----------------------------------`);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected.');
    }
};

createOrFindAdmin();
