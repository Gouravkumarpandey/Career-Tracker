const prisma = require('../config/prisma');

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

      console.log(`
========================================================================
📧 [EMAIL DISPATCHED]
To: ${userEmail} (${userName})
Subject: Action Required: Your Certification "${cert.name}" is Expiring Soon!
------------------------------------------------------------------------
Hello ${userName},

This is an automated notification from your Career Tracker.
Your certification details:
- Name: ${cert.name}
- Provider: ${cert.issuingOrg}
- Expiration Date: ${new Date(cert.expiryDate).toLocaleDateString()}

Please make arrangements to renew or update this credential to maintain 
your Career Readiness Score.

Best regards,
CareerFlow Team
========================================================================
      `);

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
