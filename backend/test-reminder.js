/**
 * TEST SCRIPT: Calendar reminder email pipeline
 * Run with: node test-reminder.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: EMAIL_USER, pass: EMAIL_PASS }
});

const TEST_EMAIL = 'kumarpandeygourav@gmail.com';

async function sendTestEmail() {
  console.log('\n[1] Sending IMMEDIATE test email to verify SMTP...');
  const info = await transporter.sendMail({
    from: `"CareerFlow Test" <${EMAIL_USER}>`,
    to: TEST_EMAIL,
    subject: 'CareerFlow: SMTP Test — Email is Working!',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#6366f1;">CareerFlow — Email Test</h2>
        <p>Your SMTP configuration is working correctly.</p>
        <p>The reminder system will send emails <strong>15 minutes before</strong> any scheduled event.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;"/>
        <p style="font-size:12px;color:#9ca3af;">Sent at ${new Date().toLocaleTimeString()}</p>
      </div>
    `
  });
  console.log(`   SMTP test email sent to ${TEST_EMAIL}! Message ID: ${info.messageId}`);
}

async function insertTestEvent() {
  console.log('\n[2] Inserting a test CalendarEvent 2 minutes from now...');

  const user = await prisma.user.findFirst({ select: { id: true, email: true, name: true } });
  if (!user) {
    console.error('   No user found in database. Please log in first.');
    return;
  }

  // Schedule event 2 minutes from now so scheduler picks it up within 60 seconds
  const eventDate = new Date(Date.now() + 2 * 60 * 1000);
  const eventTimeStr = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const event = await prisma.calendarEvent.create({
    data: {
      userId: user.id,
      title: 'Test Reminder: LinkedIn Profile Update',
      type: 'reminder',
      eventDate,
      sendEmail: true,
      emailSent: false,
      completed: false
    }
  });

  console.log(`   Event created: ID=${event.id}`);
  console.log(`   Scheduled for: ${eventDate.toLocaleTimeString()} (${eventDate.toISOString()})`);
  console.log(`   Scheduler will email: ${user.email} (from DB user)`);

  // Also send an immediate preview of what the reminder email looks like to TEST_EMAIL
  console.log(`\n[3] Sending a PREVIEW reminder email to ${TEST_EMAIL} right now...`);
  const previewInfo = await transporter.sendMail({
    from: `"CareerFlow Support" <${EMAIL_USER}>`,
    to: TEST_EMAIL,
    subject: `Reminder: "Test Reminder: LinkedIn Profile Update" is scheduled at ${eventTimeStr}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:0;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px 32px;">
          <h1 style="margin:0;color:white;font-size:22px;">⏰ CareerFlow Reminder</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Your task is coming up soon</p>
        </div>
        <div style="padding:28px 32px;background:#ffffff;">
          <p style="font-size:16px;margin:0 0 8px;">Hello <strong>${user.name || 'there'}</strong>,</p>
          <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">This is your 15-minute reminder for an upcoming event:</p>
          <div style="background:#f8f7ff;border-left:4px solid #6366f1;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
            <div style="font-size:18px;font-weight:700;color:#1f2937;">Test Reminder: LinkedIn Profile Update</div>
            <div style="font-size:13px;color:#6b7280;margin-top:6px;">⏰ Starts at <strong>${eventTimeStr}</strong> — that's in about 15 minutes</div>
            <div style="display:inline-block;margin-top:10px;padding:4px 12px;background:#6366f1;color:white;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;">Reminder</div>
          </div>
          <p style="font-size:13px;color:#9ca3af;margin:0;">Stay on track with CareerFlow 🚀</p>
        </div>
        <div style="background:#f9fafb;padding:14px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="font-size:11px;color:#9ca3af;margin:0;">CareerFlow — Your AI-powered career companion</p>
        </div>
      </div>
    `
  });
  console.log(`   Preview reminder email sent to ${TEST_EMAIL}! Message ID: ${previewInfo.messageId}`);
  console.log('\n[4] The backend scheduler also runs every 60 seconds and will auto-send to the DB user.');
  console.log('    Watch for: [Scheduler] Found 1 upcoming calendar event(s)');
}

(async () => {
  try {
    await sendTestEmail();
    await insertTestEvent();
  } catch (err) {
    console.error('\nTest failed:', err.message);
    if (err.code === 'EAUTH') {
      console.error('Gmail auth failed. Make sure EMAIL_PASS is an App Password.');
    }
  } finally {
    await prisma.$disconnect();
    console.log('\n[Done]');
  }
})();
