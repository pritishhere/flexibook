const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Doctor = require('../src/models/Doctor');
const User = require('../src/models/user');
const DoctorLeave = require('../src/models/DoctorLeave');

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        // Find the first doctor
        const doc = await Doctor.findOne().populate('userId', 'name');
        if (!doc) {
            console.log('❌ No doctors found in database. Please run the verify_all_apis.js script first to populate records.');
            process.exit(1);
        }

        const doctorId = doc._id;
        const doctorName = doc.userId?.name || 'Unknown Doctor';
        
        // Let's create a leave for a specific date: July 20, 2026
        const leaveDateStr = '2026-07-20';
        const leaveDate = new Date(leaveDateStr);
        leaveDate.setHours(0, 0, 0, 0);

        // Delete any existing leaves for this date to avoid duplicates
        await DoctorLeave.deleteMany({ doctor: doctorId, date: leaveDate });

        // Create the test leave
        const newLeave = await DoctorLeave.create({
            doctor: doctorId,
            date: leaveDate,
            reason: 'Test Leave for Verification'
        });

        console.log('\n=========================================');
        console.log('🎉 TEST LEAVE CREATED SUCCESSFULLY!');
        console.log(`👨‍⚕️ Doctor: ${doctorName}`);
        console.log(`🆔 Doctor ID: ${doctorId}`);
        console.log(`📅 Leave Date: ${leaveDateStr} (${newLeave.date.toDateString()})`);
        console.log('=========================================\n');
        
        console.log('👉 To verify this leave:');
        console.log('1. Go to the Customer Booking Page / AI Symptom Checker.');
        console.log(`2. Select "${doctorName}" as the doctor.`);
        console.log(`3. Try to select the date: ${leaveDateStr}.`);
        console.log('4. Verify that booking is disabled and the warning matches.');

    } catch (err) {
        console.error('Error running test leave script:', err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
