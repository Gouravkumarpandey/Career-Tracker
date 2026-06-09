const prisma = require('../../config/prisma');
const ApiError = require('../../utils/ApiError');
const { CAREER_PATHS } = require('../roadmap/roadmap.service');

// Simulated AI text analysis helper for resume parser
const analyzeResumeText = (title) => {
  const lowerTitle = title.toLowerCase();
  
  let grammarScore = 85.0;
  let actionVerbsCount = 12;
  let quantifiableMetricsCount = 5;
  let readabilityIndex = 75.0;

  if (lowerTitle.includes('senior') || lowerTitle.includes('lead')) {
    grammarScore = 92.5;
    actionVerbsCount = 22;
    quantifiableMetricsCount = 9;
    readabilityIndex = 68.0;
  } else if (lowerTitle.includes('junior') || lowerTitle.includes('intern')) {
    grammarScore = 78.0;
    actionVerbsCount = 8;
    quantifiableMetricsCount = 2;
    readabilityIndex = 82.5;
  }

  return {
    grammarScore,
    actionVerbsCount,
    quantifiableMetricsCount,
    readabilityIndex
  };
};

const analyzeResume = async (userId, resumeId) => {
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId }
  });

  if (!resume) {
    throw new ApiError(404, 'Resume not found.');
  }

  const analysis = analyzeResumeText(resume.title);

  // Upsert analysis
  const metrics = await prisma.resumeMetricsAnalysis.upsert({
    where: { resumeId },
    update: analysis,
    create: {
      ...analysis,
      resumeId
    }
  });

  return {
    resumeId,
    title: resume.title,
    analysis: metrics
  };
};

const getSkillGapAnalysis = async (userId, targetType, targetId) => {
  // 1. Get user skills
  const userSkills = await prisma.skill.findMany({
    where: { userId },
    select: { name: true }
  });

  const userSkillNames = userSkills.map(s => s.name.toLowerCase());

  let requiredSkills = [];
  let targetName = '';

  if (targetType === 'job') {
    const job = await prisma.job.findUnique({
      where: { id: parseInt(targetId) }
    });
    if (!job) throw new ApiError(404, 'Target job listing not found.');
    
    targetName = `${job.title} at ${job.company}`;
    if (job.requirements) {
      requiredSkills = job.requirements
        .split(/[,\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
    } else {
      requiredSkills = ['JavaScript', 'Node.js', 'React'];
    }
  } else if (targetType === 'path') {
    const path = CAREER_PATHS.find(p => p.id === parseInt(targetId));
    if (!path) throw new ApiError(404, 'Target career path not found.');

    targetName = path.title;
    requiredSkills = path.milestones.map(m => m.title.split(' ')[0]); // Extract first word representing main skill/category
  } else {
    throw new ApiError(400, 'Invalid targetType. Must be "job" or "path".');
  }

  const matchingSkills = [];
  const missingSkills = [];

  requiredSkills.forEach(reqSkill => {
    const isMatching = userSkillNames.some(uSkill => uSkill.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(uSkill));
    if (isMatching) {
      matchingSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  const totalRequired = requiredSkills.length;
  const matchPct = totalRequired > 0 
    ? parseFloat(((matchingSkills.length / totalRequired) * 100).toFixed(2))
    : 100.0;
  
  const gapPct = parseFloat((100.0 - matchPct).toFixed(2));

  return {
    targetType,
    targetId,
    targetName,
    matchingSkills,
    missingSkills,
    matchPercentage: matchPct,
    gapPercentage: gapPct,
    recommendation: missingSkills.length > 0 
      ? `To qualify for "${targetName}", prioritize learning: ${missingSkills.join(', ')}.`
      : 'You meet all the basic skill requirements for this role!'
  };
};

const getCareerRecommendations = async (userId) => {
  // Get user skills
  const skills = await prisma.skill.findMany({
    where: { userId },
    select: { name: true }
  });

  if (skills.length === 0) {
    return {
      recommendations: [],
      message: 'Please add some skills to get personalized career recommendations.'
    };
  }

  const skillNames = skills.map(s => s.name.toLowerCase());

  const suggestionsList = [
    {
      career: 'Full Stack Engineer',
      triggerKeywords: ['react', 'node', 'express', 'javascript', 'html', 'css', 'sql', 'postgresql', 'mongodb'],
      reason: 'Based on your programming and web development skillsets.',
      confidenceScore: 0.90
    },
    {
      career: 'Data Analyst / Scientist',
      triggerKeywords: ['python', 'pandas', 'numpy', 'sql', 'analytics', 'tableau', 'machine learning', 'excel'],
      reason: 'Your data modeling and scripting skills match analytics paths.',
      confidenceScore: 0.85
    },
    {
      career: 'Cloud DevOps Engineer',
      triggerKeywords: ['docker', 'kubernetes', 'aws', 'cloud', 'linux', 'git', 'ci/cd', 'terraform'],
      reason: 'Your interest in infrastructure automation and cloud tools align with DevOps.',
      confidenceScore: 0.88
    }
  ];

  const matchedSuggestions = [];

  for (const sug of suggestionsList) {
    const hits = sug.triggerKeywords.filter(keyword => 
      skillNames.some(skill => skill.includes(keyword))
    );

    if (hits.length > 0) {
      const matchRatio = hits.length / sug.triggerKeywords.length;
      const score = parseFloat(Math.min(0.99, sug.confidenceScore * (0.5 + 0.5 * matchRatio)).toFixed(2));
      
      matchedSuggestions.push({
        suggestedCareer: sug.career,
        reasoning: `Matched via skills: [${hits.join(', ')}]. ${sug.reason}`,
        confidenceScore: score
      });
    }
  }

  if (matchedSuggestions.length === 0) {
    matchedSuggestions.push({
      suggestedCareer: 'Software Engineer Generalist',
      reasoning: 'Explore core algorithms, database principles, and full stack workflows to find your niche.',
      confidenceScore: 0.70
    });
  }

  // Save recommendations to DB
  return prisma.$transaction(async (tx) => {
    // Delete old recommendations
    await tx.aIRecommendation.deleteMany({
      where: { userId }
    });

    // Save new ones
    const createdRecs = [];
    for (const rec of matchedSuggestions) {
      const dbRec = await tx.aIRecommendation.create({
        data: {
          suggestedCareer: rec.suggestedCareer,
          reasoning: rec.reasoning,
          confidenceScore: rec.confidenceScore,
          userId
        }
      });
      createdRecs.push(dbRec);
    }
    return createdRecs;
  });
};

const getLearningRecommendations = async (userId) => {
  // Find skill gaps from enrolled paths in Assessment table
  const enrollments = await prisma.assessment.findMany({
    where: {
      userId,
      category: 'CareerPathEnrollment'
    }
  });

  let missingSkills = [];
  if (enrollments.length > 0) {
    for (const en of enrollments) {
      const pathTitle = en.title.substring(10); // strip "Enrolled: "
      const path = CAREER_PATHS.find(p => p.title === pathTitle);
      if (path) {
        const gap = await getSkillGapAnalysis(userId, 'path', path.id);
        missingSkills.push(...gap.missingSkills);
      }
    }
  }

  if (missingSkills.length === 0) {
    missingSkills = ['Data Structures', 'REST APIs', 'SQL'];
  }

  missingSkills = [...new Set(missingSkills)];

  const recommendedResources = [];
  for (const skill of missingSkills) {
    const resources = await prisma.resource.findMany({
      where: {
        OR: [
          { title: { contains: skill, mode: 'insensitive' } },
          { category: { contains: skill, mode: 'insensitive' } }
        ]
      },
      take: 2
    });

    if (resources.length > 0) {
      recommendedResources.push(...resources);
    } else {
      recommendedResources.push({
        title: `Introduction to ${skill}`,
        type: 'Course',
        url: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`,
        category: skill,
        isPremium: false
      });
    }
  }

  return {
    missingSkillsDetected: missingSkills,
    recommendedResources: recommendedResources.slice(0, 5)
  };
};

module.exports = {
  analyzeResume,
  getSkillGapAnalysis,
  getCareerRecommendations,
  getLearningRecommendations
};
