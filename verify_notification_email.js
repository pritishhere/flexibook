require('dotenv').config();
const { sendAppointmentAlert } = require('./src/services/notificationService');

const testNotification = async () => {
    // The sender is always the SMTP_USER in your .env
    const senderEmail = process.env.SMTP_USER || process.env.EMAIL_USER;
    
    // The recipient is the first argument passed (e.g. node verify_notification_email.js friend@example.com)
    // or falls back to sending to yourself if no argument is provided
    const targetEmail = process.argv[2] || senderEmail;
    
    console.log('🔄 Triggering Styled HTML Email Test...');
    console.log(`   - Sender (From): ${senderEmail}`);
    console.log(`   - Recipient (To): ${targetEmail}`);
    
    if (!senderEmail || senderEmail.includes('your-hospital-email')) {
        console.log('❌ Error: Please set your real SMTP_USER in the .env file first.');
        return;
    }

    try {
        console.log(`- Dispatching styled email from ${senderEmail} to ${targetEmail}...`);
        await sendAppointmentAlert({
            email: targetEmail,
            phone: '', // skip whatsapp for this email test
            name: 'Pritish Ghosh',
            doctorName: 'Dr. Debabrata Sen (Cardiologist)',
            date: new Date(),
            tokenNumber: 3,
            type: 'booked' // Generates the beautiful blue 'booked' HTML theme
        });
        console.log('✅ STYLED EMAIL SENT SUCCESSFULLY!');
        console.log(`👉 Ask the recipient (${targetEmail}) to check their inbox to view the styled appointment layout!`);
    } catch (error) {
        console.error('\n❌ SMTP ALERT EMAIL FAILED:');
        console.error(error.message);
    }
};

testNotification();
