const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Testing email connection...');
  console.log('User:', process.env.EMAIL_USER);
  console.log('Pass:', process.env.EMAIL_PASS ? '***' : 'MISSING');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log('SUCCESS: Nodemailer is ready to send emails!');
  } catch (error) {
    console.error('ERROR verifying connection:');
    console.error(error);
  }
}

testEmail();
