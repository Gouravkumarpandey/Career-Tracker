const { sendMail } = require('../src/utils/emailService');

async function test() {
  try {
    console.log('Sending test email...');
    await sendMail(
      'singhbhoomi999@gmail.com',
      'Test Email from CareerFlow',
      'If you receive this, email configuration is working successfully!',
      '<h1>Success!</h1><p>Email configuration is working successfully!</p>'
    );
    console.log('Test email sent successfully!');
  } catch (error) {
    console.error('Test email failed:', error);
  }
}

test();
