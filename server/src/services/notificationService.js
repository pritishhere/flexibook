let twilio = null;
let nodemailer = null;
let client = null;
let transporter = null;
let fromWhatsApp = null;

// Safe Twilio Loader
try {
    twilio = require('twilio');
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (accountSid && authToken && !accountSid.includes('YOUR') && !authToken.includes('YOUR')) {
        client = twilio(accountSid, authToken);
    }
    fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER;
} catch (e) {
    console.log('⚠️ Twilio SDK not installed or failed to load. SMS/WhatsApp alerts are disabled.');
}

// Safe Nodemailer Loader
try {
    nodemailer = require('nodemailer');
    const smtpHost = process.env.SMTP_HOST;
    if (smtpHost && !smtpHost.includes('YOUR')) {
        transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, 
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
} catch (e) {
    console.log('⚠️ Nodemailer SDK not installed or failed to load. Email alerts are disabled.');
}

/**
 * Global Notification Engine
 * @param {Object} data - { email, phone, name, doctorName, date, tokenNumber, type }
 * @param {String} data.type - 'booked' | 'updated' | 'cancelled' | 'your-turn'
 */
const sendAppointmentAlert = async (data) => {
    const { email, phone, name, doctorName, date, tokenNumber, type } = data;
    const formattedDate = new Date(date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    let subject = '';
    let headingColor = '#2c3e50';
    let messageBody = '';

    // Context switching based on action type
    switch (type) {
        case 'booked':
            subject = 'Appointment Confirmed! 🎟️';
            messageBody = `Hello ${name}, your booking with Dr. ${doctorName} is successfully confirmed for ${formattedDate}. Your queue token is #${tokenNumber}. Please track your live status on our app.`;
            break;
        case 'updated':
            subject = 'Appointment Updated / Rescheduled 🔄';
            headingColor = '#f39c12';
            messageBody = `Hello ${name}, your appointment with Dr. ${doctorName} has been modified. Your new slot is scheduled for ${formattedDate}. Your token remains #${tokenNumber}.`;
            break;
        case 'cancelled':
            subject = 'Appointment Cancelled ❌';
            headingColor = '#c0392b';
            messageBody = `Hello ${name}, we regret to inform you that your scheduled appointment with Dr. ${doctorName} on ${formattedDate} has been cancelled. If money was deducted, a refund will process automatically.`;
            break;
        case 'your-turn':
            subject = 'Your Turn Has Arrived! 🚨';
            headingColor = '#27ae60';
            messageBody = `🚨 Hello ${name}! The doctor is ready for you. Please proceed directly to Dr. ${doctorName}'s cabin immediately. Your token is #${tokenNumber}.`;
            break;
    }

    // --- CHANNEL A: WHATSAPP DISPATCH ---
    if (twilio && client && phone && fromWhatsApp) {
        try {
            const formattedTo = phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`;
            const formattedFrom = fromWhatsApp.startsWith('whatsapp:') ? fromWhatsApp : `whatsapp:${fromWhatsApp}`;

            await client.messages.create({
                from: formattedFrom,
                to: formattedTo,
                body: `*${subject}*\n\n${messageBody}\n\n_Thank you, Team FlexiBook._`
            });
            console.log(`✅ WhatsApp sent: [Type: ${type}] to ${phone}`);
        } catch (err) {
            console.error(`❌ WhatsApp Error [Type: ${type}]: ${err.message}`);
        }
    }

    // --- CHANNEL B: TRANSACTIONAL EMAIL DISPATCH ---
    if (nodemailer && transporter && email) {
        try {
            await transporter.sendMail({
                from: `"FlexiBook Healthcare" <${process.env.SMTP_USER}>`,
                to: email,
                subject: subject,
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <h2 style="color: ${headingColor}; border-bottom: 2px solid ${headingColor}; padding-bottom: 10px; margin-top: 0;">${subject}</h2>
                        <p style="font-size: 16px; color: #333333; line-height: 1.5;">Dear ${name},</p>
                        <p style="font-size: 15px; color: #555555; line-height: 1.6; background-color: #f9f9f9; padding: 15px; border-left: 4px solid ${headingColor}; border-radius: 4px;">
                            ${messageBody}
                        </p>
                        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
                        <p style="font-size: 11px; color: #aaaaaa; text-align: center; margin-bottom: 0;">This is an automated operational transmission from FlexiBook System. Please do not reply directly.</p>
                    </div>`
            });
            console.log(`✅ Email sent: [Type: ${type}] to ${email}`);
        } catch (err) {
            console.error(`❌ Email Error [Type: ${type}]: ${err.message}`);
        }
    }
};

module.exports = { sendAppointmentAlert };