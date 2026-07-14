// Configure the correct sandbox sender BEFORE requiring the service
process.env.TWILIO_WHATSAPP_NUMBER = '+14155238886'; 

require('dotenv').config(); 
const { sendAppointmentAlert } = require('./src/services/notificationService');

const testWhatsApp = async () => {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER; 
    
    // The recipient is the first argument passed (e.g. node verify_whatsapp.js +91XXXXXXXXXX) 
    // or falls back to your personal number
    const testRecipient = process.argv[2] || '+916203978419'; 

    console.log('🔄 Triggering Twilio WhatsApp Config Test...');
    console.log(`   - Account SID: ${sid}`);
    console.log(`   - Sandbox Sender: ${fromWhatsApp}`);
    console.log(`   - Target Recipient: ${testRecipient}`);

    if (!sid || sid.includes('your_account_sid_here') || !token || token.includes('your_auth_token_here')) {
        console.log('\n❌ TEST ABORTED: You are still using placeholder Twilio credentials in your .env file.');
        return;
    }

    console.log(`\n- Sending test alert from ${fromWhatsApp} to ${testRecipient}...`);
    console.log('ℹ️ Running dispatch...');

    await sendAppointmentAlert({
        email: '',
        phone: testRecipient,
        name: 'Sainee Sarker',
        doctorName: 'Dr. Sen',
        date: new Date(),
        tokenNumber: 5,
        type: 'booked'
    });

    console.log('\n💡 Tip: To receive messages on the target phone from the Twilio Sandbox, they MUST opt-in first:');
    console.log(`   1. Save the Twilio number (${fromWhatsApp}) to their contacts.`);
    console.log('   2. Open WhatsApp and send a message containing your Sandbox join code to that Twilio contact.');
};

testWhatsApp();
