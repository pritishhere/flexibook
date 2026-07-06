const mongoose = require('mongoose');
require('dotenv').config();

const Hospital = require('../src/models/Hospital');

const addTestHospital = async () => {
    console.log('🔌 Connecting to MongoDB...');
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('✅ Connected successfully!');

        // Create a new healthcare hospital entry
        const testHospital = await Hospital.create({
            name: 'testing hospital',
            address: 'Salt Lake Sector V, Near Tech Hub',
            city: 'Kolkata',
            contactNumber: '9999999999',
            emergencyNumber: '102',
            sector: 'healthcare',
            rating: 4.8,
            isVerified: true
        });

        console.log('\n🌟 SUCCESS: "testing hospital" has been added to your database!');
        console.log('Details:', {
            id: testHospital._id,
            name: testHospital.name,
            sector: testHospital.sector,
            city: testHospital.city,
            isVerified: testHospital.isVerified
        });

    } catch (err) {
        console.error('❌ Failed to add testing hospital:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB.');
    }
};

addTestHospital();
