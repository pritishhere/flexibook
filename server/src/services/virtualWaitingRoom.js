const cron = require('node-cron');
const Appointment = require('../models/Appointment'); // Apna path check kar lein
const { sendAppointmentAlert } = require('./notificationService'); // Phase 1 wala notification engine

// ⏳ ASSUMPTION: 1 Patient = 10 Minutes
const AVG_TIME_PER_PATIENT_MINS = 10; 

const inMemoryDb = require('../utils/inMemoryDb');

const startVirtualWaitingRoom = () => {
    cron.schedule('*/5 * * * *', async () => {
        console.log('🔍 Virtual Waiting Room: Scanning live queues for ETA...');

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let liveQueues = [];

            if (inMemoryDb.isDbConnected()) {
                // MongoDB database lookup path
                liveQueues = await Appointment.aggregate([
                    { $match: { date: { $gte: today }, status: 'in-queue', virtualAlertSent: false } },
                    { $sort: { tokenNumber: 1 } }, // Queue order
                    { $group: { _id: '$doctorId', patients: { $push: '$$ROOT' } } }
                ]);
            } else {
                // In-Memory database lookup path
                const filtered = inMemoryDb.appointments.filter(appt => {
                    const apptDate = new Date(appt.date || appt.appointmentDate);
                    apptDate.setHours(0, 0, 0, 0);
                    const statusVal = (appt.status || '').toLowerCase();
                    return apptDate >= today && 
                           statusVal === 'in-queue' && 
                           !appt.virtualAlertSent;
                });

                // Sort by tokenNumber ascending
                filtered.sort((a, b) => (a.tokenNumber || 0) - (b.tokenNumber || 0));

                // Group by doctorId
                const groups = {};
                for (const appt of filtered) {
                    const docId = String(appt.doctor || appt.doctorId);
                    if (!groups[docId]) {
                        groups[docId] = [];
                    }
                    groups[docId].push(appt);
                }

                liveQueues = Object.keys(groups).map(docId => ({
                    _id: docId,
                    patients: groups[docId]
                }));
            }

            for (const doctorQueue of liveQueues) {
                const patientsList = doctorQueue.patients;

                for (let index = 0; index < patientsList.length; index++) {
                    const patient = patientsList[index];
                    const expectedWaitTime = index * AVG_TIME_PER_PATIENT_MINS;

                    // Trigger alert if wait time is 15 minutes or less
                    if (expectedWaitTime <= 15) {
                        await sendAppointmentAlert({
                            email: patient.email,
                            phone: patient.phone,
                            name: patient.patientName || patient.name,
                            doctorName: patient.doctorName,
                            date: patient.date || patient.appointmentDate,
                            tokenNumber: patient.tokenNumber,
                            type: 'your-turn'
                        });

                        // Set virtualAlertSent flag to prevent duplicate notifications
                        if (inMemoryDb.isDbConnected()) {
                            await Appointment.findByIdAndUpdate(patient._id, { virtualAlertSent: true });
                        } else {
                            const apptIndex = inMemoryDb.appointments.findIndex(a => String(a._id) === String(patient._id));
                            if (apptIndex !== -1) {
                                inMemoryDb.appointments[apptIndex].virtualAlertSent = true;
                            }
                        }
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