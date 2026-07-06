const mongoose = require('mongoose');
require('dotenv').config();

const Hospital = require('../src/models/Hospital');
const User = require('../src/models/user');
const Doctor = require('../src/models/Doctor');

const addTestDoctor = async () => {
    console.log('🔌 Connecting to MongoDB...');
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('✅ Connected successfully!');

        // 1. Find the "testing hospital"
        const hospital = await Hospital.findOne({ name: 'testing hospital' });
        if (!hospital) {
            throw new Error('Hospital "testing hospital" not found in the database. Please run add_test_hospital.js first.');
        }
        console.log(`🏥 Found Hospital: "${hospital.name}" (${hospital._id})`);

        // 2. Create/Find a User for the Doctor
        const doctorEmail = 'testing_doctor@example.com';
        let doctorUser = await User.findOne({ email: doctorEmail });
        
        if (!doctorUser) {
            doctorUser = await User.create({
                name: 'Dr. Testing Specialist',
                email: doctorEmail,
                password: 'password123',
                role: 'doctor',
                phone: '9876543211'
            });
            console.log(`👤 Created User profile for Doctor: "${doctorUser.name}"`);
        } else {
            console.log(`👤 User profile already exists: "${doctorUser.name}"`);
        }

        // 3. Create Doctor Profile linked to "testing hospital"
        let doctorProfile = await Doctor.findOne({ userId: doctorUser._id, hospitalId: hospital._id });
        if (!doctorProfile) {
            doctorProfile = await Doctor.create({
                userId: doctorUser._id,
                hospitalId: hospital._id,
                specialization: 'General Physician',
                qualification: 'MD, MBBS',
                experience: 10,
                fees: 500,
                availability: [
                    { day: 'Monday', startTime: '09:00', endTime: '13:00' },
                    { day: 'Wednesday', startTime: '14:00', endTime: '18:00' },
                    { day: 'Friday', startTime: '09:00', endTime: '13:00' }
                ],
                isAvailable: true
            });
            console.log(`✅ Registered Doctor Profile:`);
        } else {
            console.log(`ℹ️ Doctor Profile already exists:`);
        }

        console.log({
            doctorId: doctorProfile._id,
            doctorName: doctorUser.name,
            specialization: doctorProfile.specialization,
            consultationFee: doctorProfile.fees,
            linkedHospital: hospital.name,
            availability: doctorProfile.availability
        });

        console.log('\n🎉 SUCCESS: Test doctor is registered and linked to "testing hospital"!');

    } catch (err) {
        console.error('❌ Failed to add testing doctor:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB.');
    }
};

addTestDoctor();
