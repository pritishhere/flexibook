const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.EMAIL_PORT || process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.EMAIL_USER || process.env.SMTP_USER || '', 
      pass: process.env.EMAIL_PASS || process.env.SMTP_PASS || '',
    },
  });

  const mailOptions = {
    from: '"Smart Queue System" <no-reply@smartqueue.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;