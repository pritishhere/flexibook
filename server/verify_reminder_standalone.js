process.env.USE_IN_MEMORY = 'true';
require('dotenv').config();

// 1. Mock the notification service BEFORE importing reminderService
const notificationService = require('./src/services/notificationService');
notificationService.sendAppointmentAlert = async (data) => {
    console.log(`[MOCK EMAIL] sendAppointmentAlert called for ${data.name} (Type: ${data.type})`);
    return { success: true };
};

const inMemoryDb = require('./src/utils/inMemoryDb');
const { startReminderScheduler, checkAndSendReminders } = require('./src/services/reminderService');

const runTest = async () => {
    console.log('🔄 STARTING MOCKED APPOINTMENT REMINDER SYSTEM STANDALONE AUDIT...');

    // 1. Setup Mock User
    const mockUser = {
        _id: 'user_patient_123',
        name: 'John Doe',
        email: 'patient@example.com',
        mobile: '9883769499',
        role: 'patient'
    };
    inMemoryDb.users.push(mockUser);

    // 2. Setup Mock Doctor User & Doctor
    const mockDocUser = {
        _id: 'user_doc_123',
        name: 'Dr. Deb Mukherjee',
        email: 'doctor@example.com',
        mobile: '9999999999',
        role: 'doctor'
    };
    inMemoryDb.users.push(mockDocUser);

    const mockDoc = {
        _id: 'doc_123',
        userId: 'user_doc_123',
        hospitalId: 'hosp_123',
        specialization: 'Neurologist',
        experience: 12,
        consultationFee: 700,
        availability: [{ day: 'Monday', startTime: '09:00', endTime: '13:00' }]
    };
    inMemoryDb.doctors.push(mockDoc);

    // 3. Setup Mock Hospital
    const mockHospital = {
        _id: 'hosp_123',
        name: 'Metro Wellness Clinic',
        address: 'Salt Lake City',
        city: 'Kolkata'
    };
    inMemoryDb.hospitals.push(mockHospital);

    // 4. Setup Mock Appointment (Scheduled for tomorrow - within 24h)
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 12); // 12 hours from now

    const mockAppt = {
        _id: 'appt_123',
        patient: 'user_patient_123',
        doctor: 'doc_123',
        hospital: 'hosp_123',
        appointmentDate: tomorrow,
        timeSlot: '10:00 AM - 12:00 PM',
        tokenNumber: 4,
        reasonForVisit: 'Severe Migraine Checkup',
        status: 'Confirmed',
        paymentStatus: 'Paid',
        reminderSent: false
    };
    inMemoryDb.appointments.push(mockAppt);

    console.log('📌 Mock Database Initialized:');
    console.log(`   - Appointment Date: ${tomorrow.toLocaleString()}`);
    console.log(`   - Reminder Sent Status (Before): ${mockAppt.reminderSent}`);

    console.log('\n🚀 Executing reminder check directly...');
    await checkAndSendReminders();

    console.log(`\n📌 Reminder Sent Status (After): ${mockAppt.reminderSent}`);

    if (mockAppt.reminderSent === true) {
        console.log('\n🌟🌟🌟 APPOINTMENT REMINDER SYSTEM VERIFIED WORKING 100%! 🌟🌟🌟');
        process.exit(0);
    } else {
        console.error('\n❌ ERROR: Reminder was not sent or reminderSent flag was not updated.');
        process.exit(1);
    }
};

runTest();
