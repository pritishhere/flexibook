const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/user');
const Appointment = require('../src/models/Appointment');
const Doctor = require('../src/models/Doctor');
const Hospital = require('../src/models/Hospital');

const checkDatabase = async () => {
    console.log('🔌 Connecting to live MongoDB Atlas cluster...');
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('✅ Connected successfully!');

        // 1. Get Database Stats
        const userCount = await User.countDocuments();
        const doctorCount = await Doctor.countDocuments();
        const hospitalCount = await Hospital.countDocuments();
        const appointmentCount = await Appointment.countDocuments();

        console.log('\n📊 Database Collection Stats:');
        console.log(`- Hospitals: ${hospitalCount}`);
        console.log(`- Doctors:   ${doctorCount}`);
        console.log(`- Users:     ${userCount}`);
        console.log(`- Bookings:  ${appointmentCount}`);

        // 2. Fetch Recent WhatsApp Patient
        console.log('\n👤 Recent Users registered in Atlas:');
        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(3);
        if (recentUsers.length === 0) {
            console.log('  (No users found)');
        } else {
            recentUsers.forEach(u => {
                console.log(`  * ${u.name} (Mobile: ${u.mobile || 'N/A'}, DOB: ${u.dob || 'N/A'}, Role: ${u.role})`);
            });
        }

        // 3. Fetch Recent Appointments
        console.log('\n🎟️ Recent Appointments booked in Atlas:');
        const recentAppts = await Appointment.find()
            .sort({ createdAt: -1 })
            .limit(3)
            .populate('patient', 'name')
            .populate({ path: 'doctor', populate: { path: 'userId', select: 'name' } })
            .populate('hospital', 'name');

        if (recentAppts.length === 0) {
            console.log('  (No bookings found)');
        } else {
            recentAppts.forEach(a => {
                const docName = (a.doctor && a.doctor.userId) ? a.doctor.userId.name : 'Unknown';
                const hospName = a.hospital ? a.hospital.name : 'Unknown';
                console.log(`  * Patient: ${a.patientName || (a.patient ? a.patient.name : 'N/A')}`);
                console.log(`    Hospital: ${hospName} | Doctor: ${docName}`);
                console.log(`    Date: ${new Date(a.appointmentDate).toDateString()} | Token: #${a.tokenNumber}`);
                console.log(`    Payment: ${a.paymentStatus} | Status: ${a.status}`);
                console.log('    ---');
            });
        }

    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB Atlas.');
    }
};

checkDatabase();
