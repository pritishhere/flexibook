const cron = require('node-cron');
const Appointment = require('../models/Appointment'); // Apna path check kar lein
const { sendAppointmentAlert } = require('./notificationService'); // Phase 1 wala notification engine

// ⏳ ASSUMPTION: 1 Patient = 10 Minutes
const AVG_TIME_PER_PATIENT_MINS = 10; 

const startVirtualWaitingRoom = () => {
    // Har 5 minute mein yeh engine check karega: '*/5 * * * *'
    cron.schedule('*/5 * * * *', async () => {
        console.log('🔍 Virtual Waiting Room: Scanning live queues for ETA...');

        try {
            // Sirf aaj ke 'pending' ya 'in-queue' appointments uthao
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Doctors ki list laao jinke patients line mein hain
            const liveQueues = await Appointment.aggregate([
                { $match: { date: { $gte: today }, status: 'in-queue', virtualAlertSent: false } },
                { $sort: { tokenNumber: 1 } }, // Queue ke hisaab se line lagao
                { $group: { _id: '$doctorId', patients: { $push: '$$ROOT' } } }
            ]);

            for (const doctorQueue of liveQueues) {
                const patientsList = doctorQueue.patients;

                // Har patient ka hisaab lagao
                for (let index = 0; index < patientsList.length; index++) {
                    const patient = patientsList[index];
                    
                    // Agar koi 3rd number par hai, toh uske aage 2 log hain (index = 2). 
                    // ETA = 2 * 10 mins = 20 mins.
                    const expectedWaitTime = index * AVG_TIME_PER_PATIENT_MINS;

                    // 🚨 MAGIC TRIGGER: Agar wait time 15 minute ya usse kam reh gaya hai, alert bhej do!
                    if (expectedWaitTime <= 15) {
                        await sendAppointmentAlert({
                            email: patient.email, // Patient email
                            phone: patient.phone, // Patient phone (WhatsApp)
                            name: patient.patientName,
                            doctorName: patient.doctorName,
                            date: patient.date,
                            tokenNumber: patient.tokenNumber,
                            type: 'your-turn' // Yeh template humne pichli baar banaya tha!
                        });

                        // Spam rokne ke liye DB mein update kar do ki message bhej diya
                        await Appointment.findByIdAndUpdate(patient._id, { virtualAlertSent: true });
                        console.log(`✅ Virtual Alert sent to Token #${patient.tokenNumber} (ETA: ${expectedWaitTime} mins)`);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Virtual Waiting Room Error:', error.message);
        }
    });
};

module.exports = startVirtualWaitingRoom;