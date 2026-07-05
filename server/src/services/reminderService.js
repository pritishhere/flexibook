const Appointment = require('../models/Appointment');
const inMemoryDb = require('../utils/inMemoryDb');
const mongoose = require('mongoose');
const { sendAppointmentAlert } = require('./notificationService');

/**
 * Checks for upcoming appointments (within next 24 hours) and sends email reminders.
 */
const checkAndSendReminders = async () => {
    try {
        console.log('🔄 Checking for upcoming appointments that need reminders...');
        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1); // 24 hours from now

        if (inMemoryDb.isDbConnected()) {
            // Find appointments scheduled between now and next 24 hours that haven't been reminded
            const upcomingAppointments = await Appointment.find({
                status: { $in: ['Pending', 'Confirmed'] },
                reminderSent: { $ne: true },
                appointmentDate: { $gte: now, $lte: tomorrow }
            })
            .populate('patient')
            .populate({ path: 'doctor', populate: { path: 'userId' } })
            .populate('hospital');

            if (upcomingAppointments.length > 0) {
                console.log(`📌 Found ${upcomingAppointments.length} upcoming appointments in DB.`);
            }

            for (const appt of upcomingAppointments) {
                const patientName = appt.patientName || (appt.patient ? appt.patient.name : 'Patient');
                const email = appt.patient ? appt.patient.email : '';
                const doctorName = (appt.doctor && appt.doctor.userId) ? appt.doctor.userId.name : 'Doctor';

                if (email) {
                    await sendAppointmentAlert({
                        email,
                        phone: '', // Reminders: Email only (no WhatsApp)
                        name: patientName,
                        doctorName,
                        date: appt.appointmentDate,
                        tokenNumber: appt.tokenNumber,
                        type: 'reminder'
                    });

                    appt.reminderSent = true;
                    await appt.save();
                    console.log(`✅ Sent reminder email to ${patientName} (${email}) for token #${appt.tokenNumber}`);
                } else {
                    console.log(`⚠️ Skip reminder for token #${appt.tokenNumber}: No patient email found.`);
                    // Mark as sent anyway to avoid repeated checks
                    appt.reminderSent = true;
                    await appt.save();
                }
            }
        } else {
            // In-Memory Fallback Mode
            const upcoming = inMemoryDb.appointments.filter(a => {
                const apptDate = new Date(a.appointmentDate);
                return ['Pending', 'Confirmed'].includes(a.status) &&
                       a.reminderSent !== true &&
                       apptDate >= now && apptDate <= tomorrow;
            });

            if (upcoming.length > 0) {
                console.log(`📌 Found ${upcoming.length} upcoming appointments in Memory.`);
            }

            for (const appt of upcoming) {
                const patientUser = inMemoryDb.users.find(u => u._id === appt.patient);
                const doctorObj = inMemoryDb.doctors.find(d => d._id === appt.doctor);
                let doctorName = 'Doctor';
                let patientName = appt.patientName || 'Patient';
                let email = '';

                if (patientUser) {
                    patientName = appt.patientName || patientUser.name;
                    email = patientUser.email;
                }
                if (doctorObj) {
                    const docUser = inMemoryDb.users.find(u => u._id === doctorObj.userId);
                    if (docUser) doctorName = docUser.name;
                }

                if (email) {
                    await sendAppointmentAlert({
                        email,
                        phone: '', // Reminders: Email only (no WhatsApp)
                        name: patientName,
                        doctorName,
                        date: appt.appointmentDate,
                        tokenNumber: appt.tokenNumber,
                        type: 'reminder'
                    });

                    appt.reminderSent = true;
                    console.log(`✅ [In-Memory] Sent reminder email to ${patientName} (${email}) for token #${appt.tokenNumber}`);
                } else {
                    console.log(`⚠️ [In-Memory] Skip reminder for token #${appt.tokenNumber}: No patient email found.`);
                    appt.reminderSent = true;
                }
            }
        }
    } catch (error) {
        console.error('❌ Error in checkAndSendReminders schedule:', error.message);
    }
};

/**
 * Initializes the reminder background job.
 */
const startReminderScheduler = () => {
    // Run an initial check 10 seconds after server startup
    setTimeout(() => {
        checkAndSendReminders();
    }, 10000);

    // Run the check every 1 hour (3600000 ms)
    setInterval(() => {
        checkAndSendReminders();
    }, 3600000);

    console.log('⏰ Appointment Reminder Scheduler registered successfully (runs hourly).');
};

module.exports = { startReminderScheduler, checkAndSendReminders };
