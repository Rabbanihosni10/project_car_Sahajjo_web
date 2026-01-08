const nodemailer = require('nodemailer');

let cachedTransporter = null;

async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465, // true for 465, false for others
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    return cachedTransporter;
  }

  // Fallback to Ethereal test account if SMTP creds are not provided
  const testAccount = await nodemailer.createTestAccount();
  cachedTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return cachedTransporter;
}

async function sendOtpEmail(to, code) {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER ? `Car Sahajjo <${process.env.SMTP_USER}>` : 'Car Sahajjo <no-reply@carsahajjo.local>',
      to,
      subject: 'Your Car Sahajjo OTP',
      text: `Your OTP code is ${code}. It expires in 10 minutes.`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:16px">
          <h2>Car Sahajjo 2FA Verification</h2>
          <p>Your OTP code is <strong>${code}</strong>.</p>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    });

    if (nodemailer.getTestMessageUrl) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`📧 OTP email preview: ${previewUrl}`);
      }
    }
    return { success: true };
  } catch (err) {
    console.error('Email send error:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendOtpEmail };
