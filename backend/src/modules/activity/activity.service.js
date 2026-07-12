const prisma = require('../../config/prisma');

const activityPoints = {
  'LOGIN': 1,
  'JOB_SEARCH': 1,
  'JOB_APPLY': 2,
  'BOOKMARK_JOB': 1,
  'RESUME_UPLOAD': 5,
  'INTERVIEW_COMPLETE': 10,
  'PROFILE_UPDATE': 3
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const updateStreakAndActiveDays = async (userId) => {
  // Fetch all qualified days ordered by date
  const qualifiedDays = await prisma.dailyActivity.findMany({
    where: { userId, qualified: true },
    orderBy: { date: 'asc' },
    select: { date: true }
  });

  const activeDaysCount = qualifiedDays.length;

  let currentStreak = 0;
  let longestStreak = 0;

  if (activeDaysCount > 0) {
    const dates = qualifiedDays.map(d => d.date);

    // 1. Calculate longest streak
    let tempCurrent = 1;
    let tempLongest = 1;

    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);

      // Calculate difference in days
      const diffTime = Math.abs(currDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempCurrent++;
        if (tempCurrent > tempLongest) {
          tempLongest = tempCurrent;
        }
      } else if (diffDays > 1) {
        tempCurrent = 1;
      }
    }
    longestStreak = tempLongest;

    // 2. Calculate current streak (working backwards from today)
    const now = new Date();
    const todayStr = formatDate(now);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    const dateSet = new Set(dates);

    // If today is qualified, start backwards from today
    if (dateSet.has(todayStr)) {
      currentStreak = 1;
      let checkDate = new Date(now);
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const checkStr = formatDate(checkDate);
        if (dateSet.has(checkStr)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    // Else, if yesterday was qualified, start backwards from yesterday (streak is maintained)
    else if (dateSet.has(yesterdayStr)) {
      currentStreak = 1;
      let checkDate = new Date(yesterday);
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const checkStr = formatDate(checkDate);
        if (dateSet.has(checkStr)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    // Else, streak is broken
    else {
      currentStreak = 0;
    }
  }

  // Update user stats
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak,
      longestStreak,
      activeDays: activeDaysCount
    }
  });
};

const logActivity = async (userId, type) => {
  const points = activityPoints[type] || 1;
  const now = new Date();
  const todayStr = formatDate(now);

  // 1. Create activity log
  await prisma.activityLog.create({
    data: {
      userId,
      type,
      points,
      createdAt: now
    }
  });

  // 2. Find or create daily activity count
  const daily = await prisma.dailyActivity.findUnique({
    where: {
      userId_date: {
        userId,
        date: todayStr
      }
    }
  });

  let newScore = points;
  
  if (daily) {
    newScore = daily.score + points;
    
    await prisma.dailyActivity.update({
      where: { id: daily.id },
      data: { 
        score: newScore,
        qualified: newScore >= 5
      }
    });
  } else {
    await prisma.dailyActivity.create({
      data: {
        userId,
        date: todayStr,
        score: points,
        qualified: points >= 5
      }
    });
  }

  // 3. Update overall user totals
  await prisma.user.update({
    where: { id: userId },
    data: {
      totalScore: { increment: points },
      totalActivities: { increment: 1 }
    }
  });

  // 4. Update streak and active days
  await updateStreakAndActiveDays(userId);
};

const getActivities = async (userId) => {
  const dailyActivities = await prisma.dailyActivity.findMany({
    where: { userId },
    orderBy: { date: 'asc' }
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      currentStreak: true, 
      longestStreak: true, 
      activeDays: true,
      totalScore: true,
      totalActivities: true 
    }
  });

  return {
    dailyActivities,
    currentStreak: user?.currentStreak || 0,
    longestStreak: user?.longestStreak || 0,
    activeDays: user?.activeDays || 0,
    totalScore: user?.totalScore || 0,
    totalActivities: user?.totalActivities || 0
  };
};

module.exports = {
  logActivity,
  getActivities
};
