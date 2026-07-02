const prisma = require('../../config/prisma');

const getNotifications = async (userId) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
};

const markAsRead = async (userId, id) => {
  const notification = await prisma.notification.findFirst({
    where: { id, userId }
  });

  if (!notification) {
    throw new Error('Notification not found.');
  }

  return prisma.notification.update({
    where: { id },
    data: { isRead: true }
  });
};

const checkAlerts = async (userId) => {
  const now = new Date();
  
  // 1. Goal Reminders (TargetDate within 3 days, not completed)
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);

  const upcomingGoals = await prisma.goal.findMany({
    where: {
      userId,
      status: { notIn: ['Completed', 'completed'] },
      targetDate: {
        gte: now,
        lte: threeDaysFromNow
      }
    }
  });

  // Fetch all user's notifications to prevent duplicates
  const existingNotifications = await prisma.notification.findMany({
    where: { userId }
  });
  const messages = existingNotifications.map(n => n.message);

  for (const goal of upcomingGoals) {
    const daysLeft = Math.ceil((new Date(goal.targetDate) - now) / (1000 * 60 * 60 * 24));
    const message = `[Goal Alert] Your goal "${goal.title}" is due in ${daysLeft} days on ${goal.targetDate.toLocaleDateString()}.`;

    if (!messages.includes(message)) {
      await prisma.notification.create({
        data: {
          userId,
          message,
          isRead: false
        }
      });
    }
  }

  // 2. Interview Reminders (InterviewDate within 24 hours)
  const twentyFourHoursFromNow = new Date();
  twentyFourHoursFromNow.setHours(now.getHours() + 24);

  const upcomingInterviews = await prisma.interview.findMany({
    where: {
      application: {
        userId
      },
      interviewDate: {
        gte: now,
        lte: twentyFourHoursFromNow
      }
    },
    include: {
      application: {
        include: {
          job: true
        }
      }
    }
  });

  for (const interview of upcomingInterviews) {
    const timeStr = new Date(interview.interviewDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const message = `[Interview Alert] Your ${interview.roundName} interview with ${interview.application.job.company} is scheduled for tomorrow at ${timeStr}.`;

    if (!messages.includes(message)) {
      await prisma.notification.create({
        data: {
          userId,
          message,
          isRead: false
        }
      });
    }
  }

  // 3. Certification Expiry Alerts (ExpiryDate within 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);

  const expiringCerts = await prisma.certification.findMany({
    where: {
      userId,
      expiryDate: {
        gte: now,
        lte: thirtyDaysFromNow
      }
    }
  });

  for (const cert of expiringCerts) {
    if (!cert.expiryDate) continue;

    const message = `[Certification Alert] Your certification "${cert.name}" from ${cert.issuingOrg} is expiring on ${cert.expiryDate.toLocaleDateString()}.`;

    if (!messages.includes(message)) {
      await prisma.notification.create({
        data: {
          userId,
          message,
          isRead: false
        }
      });
    }
  }

  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
};

module.exports = {
  getNotifications,
  markAsRead,
  checkAlerts
};
