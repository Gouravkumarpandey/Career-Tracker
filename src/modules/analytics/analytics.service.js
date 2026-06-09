const prisma = require('../../config/prisma');
const { mapSkillFields } = require('../skill/skill.service');
const { mapGoalFields } = require('../goal/goal.service');

const getDashboardData = async (userId) => {
  // 1. Get career path progress (from Assessment table under CareerPathEnrollment)
  const enrollments = await prisma.assessment.findMany({
    where: {
      userId,
      category: 'CareerPathEnrollment'
    },
    select: { score: true }
  });

  const overallProgress = enrollments.length > 0
    ? parseFloat((enrollments.reduce((sum, en) => sum + en.score, 0) / enrollments.length).toFixed(2))
    : 0.0;

  // 2. Get skill growth details (using mapSkillFields dynamically)
  const skills = await prisma.skill.findMany({
    where: { userId }
  });

  const skillLevelCounts = { Beginner: 0, Intermediate: 0, Expert: 0 };
  const skillCategoryCounts = {};
  let totalSkillProgress = 0;

  const projectedSkills = skills.map(mapSkillFields);

  projectedSkills.forEach(skill => {
    const prof = skill.proficiency || 'Beginner';
    if (skillLevelCounts[prof] !== undefined) {
      skillLevelCounts[prof]++;
    }

    const cat = skill.category || 'Technical';
    skillCategoryCounts[cat] = (skillCategoryCounts[cat] || 0) + 1;

    totalSkillProgress += skill.progress || 0;
  });

  const averageSkillProgress = skills.length > 0
    ? parseFloat((totalSkillProgress / skills.length).toFixed(2))
    : 0.0;

  // 3. Get goal statistics (using mapGoalFields dynamically)
  const goals = await prisma.goal.findMany({
    where: { userId }
  });

  let completedGoals = 0;
  let pendingGoals = 0;

  const projectedGoals = goals.map(mapGoalFields);

  projectedGoals.forEach(goal => {
    if (goal.status && goal.status.toLowerCase() === 'completed') {
      completedGoals++;
    } else {
      pendingGoals++;
    }
  });

  // 4. Get active certifications count
  const certsCount = await prisma.certification.count({
    where: {
      userId,
      OR: [
        { expiryDate: null },
        { expiryDate: { gte: new Date() } }
      ]
    }
  });

  // 5. Calculate Career Readiness Score (out of 100)
  // 5a. Profile completeness (10 items, 2.5 points each)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }
  });

  let profilePoints = 0;
  if (user) {
    if (user.name) profilePoints += 2.5;
    if (user.email) profilePoints += 2.5;
    if (user.profile) {
      const p = user.profile;
      if (p.bio) profilePoints += 2.5;
      if (p.avatarUrl) profilePoints += 2.5;
      if (p.phoneNumber) profilePoints += 2.5;
      if (p.currentAddress) profilePoints += 2.5;
      if (p.githubUrl) profilePoints += 2.5;
      if (p.linkedinUrl) profilePoints += 2.5;
      if (p.portfolioUrl) profilePoints += 2.5;
      if (p.resumeFileUrl) profilePoints += 2.5;
    }
  }

  // 5b. Skills Points (Max 25: 5 points for each Intermediate/Expert skill, 2 points for Beginner)
  let skillsPoints = 0;
  projectedSkills.forEach(skill => {
    const prof = skill.proficiency || 'Beginner';
    if (prof === 'Expert' || prof === 'Intermediate') {
      skillsPoints += 5;
    } else {
      skillsPoints += 2;
    }
  });
  skillsPoints = Math.min(25, skillsPoints);

  // 5c. Goals Points (Max 25: percent of completed goals * 25)
  const totalGoals = goals.length;
  const goalsPoints = totalGoals > 0
    ? parseFloat(((completedGoals / totalGoals) * 25).toFixed(2))
    : 0.0;

  // 5d. Certifications Points (Max 25: 5 points per active certification)
  const certsPoints = Math.min(25, certsCount * 5);

  const careerReadinessScore = parseFloat((profilePoints + skillsPoints + goalsPoints + certsPoints).toFixed(2));

  return {
    overallProgress,
    skillGrowth: {
      totalSkills: skills.length,
      levels: skillLevelCounts,
      categories: skillCategoryCounts,
      averageProgress: averageSkillProgress
    },
    goalStats: {
      totalGoals,
      completedGoals,
      pendingGoals,
      completionRate: totalGoals > 0 ? parseFloat(((completedGoals / totalGoals) * 100).toFixed(2)) : 0.0
    },
    certificationStats: {
      activeCertifications: certsCount
    },
    readinessDetails: {
      profileScore: profilePoints,
      skillsScore: skillsPoints,
      goalsScore: goalsPoints,
      certsScore: certsPoints
    },
    careerReadinessScore
  };
};

module.exports = {
  getDashboardData
};
