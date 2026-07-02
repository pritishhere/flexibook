const { sendAppointmentAlert } = require('./src/services/notificationService');
require('dotenv').config();

const testWhatsApp = async () => {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886';

    console.log('🔄 Triggering Twilio WhatsApp Config Test...');
    console.log(`   - Account SID: ${sid}`);
    console.log(`   - Twilio Sender Number: ${fromWhatsApp}`);

    if (!sid || sid.includes('your_account_sid_here') || !token || token.includes('your_auth_token_here')) {
        console.log('\n❌ TEST ABORTED: You are still using placeholder Twilio credentials in your .env file.');
        console.log('👉 Please register on twilio.com (free developer sandbox), get your Account SID and Auth Token, save the .env file, and run this script again.');
        return;
    }

    // Replace this with your actual WhatsApp phone number to receive the test message
    const testRecipient = '+919876543210'; 

    console.log(`\n- Sending test alert to: ${testRecipient}...`);
    console.log('ℹ️ Running dispatch...');
    
    await sendAppointmentAlert({
        email: '',
        phone: testRecipient,
        name: 'Pritish Ghosh',
        doctorName: 'Dr. Sen',
        date: new Date(),
        tokenNumber: 5,
        type: 'booked'
    });

    console.log('\n💡 Tip: To receive messages on a phone from the Twilio WhatsApp Sandbox, you MUST first opt-in:');
    console.log('   - Save the Twilio number (+1 415 523 8886) to your phone contacts.');
    console.log('   - Send a WhatsApp message to it containing your Sandbox join code (e.g. "join code-word") from your phone.');
};

testWhatsApp();
