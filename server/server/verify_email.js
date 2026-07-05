const sendEmail = require('./src/utils/sendEmail');
require('dotenv').config();

const testRun = async () => {
    const targetEmail = process.env.EMAIL_USER || process.env.SMTP_USER;
    const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
    
    console.log('🔄 Triggering SMTP Email Config Test...');
    console.log(`   - Target SMTP Host: ${host}`);
    console.log(`   - Target SMTP User: ${targetEmail}`);
    
    if (!targetEmail || targetEmail.includes('your-hospital-email')) {
        console.log('\n❌ TEST ABORTED: You are still using placeholder email settings in your .env file.');
        console.log('👉 Please change SMTP_USER and SMTP_PASS to your real credentials, save the .env file, and run this script again.');
        return;
    }

    try {
        console.log('- Sending test email (this might take a few seconds)...');
        await sendEmail({
            email: targetEmail,
            subject: 'FlexiBook SMTP Connection Test! 🚀',
            message: 'Congratulations! Your SMTP settings are configured correctly and the FlexiBook server can send automated email notifications successfully!'
        });
        console.log('✅ SMTP EMAIL TEST SUCCESSFUL!');
        console.log(`   - A test email was successfully dispatched to: ${targetEmail}`);
        console.log('👉 Go open your email inbox to verify you received it!');
    } catch (error) {
        console.error('\n❌ SMTP EMAIL TEST FAILED:');
        console.error(error.message);
        console.log('\n💡 Tip: Double check your SMTP_HOST, SMTP_PORT, and SMTP_PASS variables inside the .env file.');
        console.log('   - If using Gmail, make sure you generated a 16-character App Password (not your normal password).');
    }
};

testRun();
