const prisma = require('../config/prisma');
const { sendMail } = require('./emailService');

const checkExpiringCertifications = async () => {
  console.log('[Scheduler] Checking for expiring certifications...');
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const today = new Date();

    // Find certifications expiring in the next 30 days that haven't had a reminder sent
    const expiringCerts = await prisma.certification.findMany({
      where: {
        expiryDate: {
          gte: today,
          lte: thirtyDaysFromNow
        },
        expiryReminderSent: false
      },
      include: {
        user: true
      }
    });

    if (expiringCerts.length === 0) {
      console.log('[Scheduler] No new expiring certifications found.');
      return;
    }

    console.log(`[Scheduler] Found ${expiringCerts.length} expiring certification(s). Dispatching reminders...`);

    for (const cert of expiringCerts) {
      const userEmail = cert.user.email;
      const userName = cert.user.name;

      const emailSubject = `Action Required: Your Certification "${cert.name}" is Expiring Soon!`;
      const emailBody = `Hello ${userName},

This is an automated notification from your Career Tracker.
Your certification details:
- Name: ${cert.name}
- Provider: ${cert.issuingOrg}
- Expiration Date: ${new Date(cert.expiryDate).toLocaleDateString()}

Please make arrangements to renew or update this credential to maintain your Career Readiness Score.

Best regards,
CareerFlow Team`;

      const emailHtml = `<p>Hello <strong>${userName}</strong>,</p>
<p>This is an automated notification from your Career Tracker.</p>
<p>Your certification details:</p>
<ul>
  <li><strong>Name:</strong> ${cert.name}</li>
  <li><strong>Provider:</strong> ${cert.issuingOrg}</li>
  <li><strong>Expiration Date:</strong> ${new Date(cert.expiryDate).toLocaleDateString()}</li>
</ul>
<p>Please make arrangements to renew or update this credential to maintain your Career Readiness Score.</p>
<p>Best regards,<br/><strong>CareerFlow Team</strong></p>`;

      try {
        await sendMail(userEmail, emailSubject, emailBody, emailHtml);
      } catch (err) {
        console.error(`[Scheduler] Failed to dispatch email to ${userEmail}:`, err);
      }


      // Mark reminder as sent
      await prisma.certification.update({
        where: { id: cert.id },
        data: { expiryReminderSent: true }
      });
    }
  } catch (error) {
    console.error('[Scheduler] Error checking expiring certifications:', error);
  }
};

const startExpiryScheduler = () => {
  // Run check immediately on startup
  checkExpiringCertifications();

  // Run check every 24 hours (86400000 ms)
  setInterval(checkExpiringCertifications, 86400000);
};

module.exports = {
  checkExpiringCertifications,
  startExpiryScheduler
};
