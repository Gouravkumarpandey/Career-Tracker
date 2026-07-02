const prisma = require('../../config/prisma');
const ApiError = require('../../utils/ApiError');

// Static Career Paths & Milestones definition (original schema compatibility)
const CAREER_PATHS = [
  {
    id: 1,
    title: 'Full Stack Web Developer',
    description: 'Master frontend styling, state management, backend routing, databases, and microservices.',
    milestones: [
      {
        id: 101,
        title: 'Frontend Basics (HTML, CSS, JS)',
        description: 'Learn modern semantic HTML, flexbox/grid layouts, and vanilla JS DOM manipulation.',
        order: 1,
        resources: [
          { title: 'MDN Web Docs - HTML/CSS', type: 'Article', url: 'https://developer.mozilla.org/en-US/docs/Learn' }
        ]
      },
      {
        id: 102,
        title: 'Backend API design with Node.js & Express',
        description: 'Learn MVC routing, database connections, and middleware processing.',
        order: 2,
        resources: [
          { title: 'Node.js Express crash course', type: 'Video', url: 'https://www.youtube.com/watch?v=f2EqECiUXac' }
        ]
      },
      {
        id: 103,
        title: 'Databases and SQL',
        description: 'Understand relational database design, joins, indexes, and migrations.',
        order: 3,
        resources: [
          { title: 'SQL Zoo Exercises', type: 'Course', url: 'https://sqlzoo.net/' }
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'Data Scientist',
    description: 'Learn statistical modeling, Python data structures, machine learning algorithms, and visualization.',
    milestones: [
      {
        id: 201,
        title: 'Python & Data Analysis Basics',
        description: 'Master pandas, numpy, and Jupyter notebook tools.',
        order: 1,
        resources: [
          { title: 'Kaggle Python Course', type: 'Course', url: 'https://www.kaggle.com/learn/python' }
        ]
      },
      {
        id: 202,
        title: 'Machine Learning Algorithms',
        description: 'Implement regression, classification, clustering, and evaluation metrics.',
        order: 2,
        resources: [
          { title: 'Scikit-Learn Tutorials', type: 'Article', url: 'https://scikit-learn.org/stable/tutorial/' }
        ]
      }
    ]
  }
];

const getPaths = async () => {
  return CAREER_PATHS.map(path => ({
    id: path.id,
    title: path.title,
    description: path.description,
    _count: { milestones: path.milestones.length }
  }));
};

const getPathById = async (id) => {
  const path = CAREER_PATHS.find(p => p.id === id);
  if (!path) {
    throw new ApiError(404, 'Career path not found.');
  }
  return path;
};

const enrollInPath = async (userId, careerPathId) => {
  const path = CAREER_PATHS.find(p => p.id === careerPathId);
  if (!path) {
    throw new ApiError(404, 'Career path not found.');
  }

  // Check existing enrollment in Assessment table
  const existingEnrollment = await prisma.assessment.findFirst({
    where: {
      userId,
      category: 'CareerPathEnrollment',
      title: `Enrolled: ${path.title}`
    }
  });

  if (existingEnrollment) {
    throw new ApiError(400, 'Already enrolled in this career path.');
  }

  // Create enrollment record using Assessment table
  const enrollment = await prisma.assessment.create({
    data: {
      title: `Enrolled: ${path.title}`,
      category: 'CareerPathEnrollment',
      score: 0.0, // progress percentage
      totalMarks: 100.0,
      passed: false,
      userId
    }
  });

  return {
    id: enrollment.id,
    userId: enrollment.userId,
    careerPathId: path.id,
    status: 'active',
    progress: 0.0,
    careerPath: path
  };
};

const calculateProgress = async (userId, path) => {
  const totalMilestones = path.milestones.length;
  if (totalMilestones === 0) return 0.0;

  // Count completed milestones for this path in Assessment table
  let completedCount = 0;
  for (const ms of path.milestones) {
    const isCompleted = await prisma.assessment.findFirst({
      where: {
        userId,
        category: 'MilestoneCompletion',
        title: `Milestone: ${ms.title}`
      }
    });
    if (isCompleted) {
      completedCount++;
    }
  }

  const progressPct = parseFloat(((completedCount / totalMilestones) * 100).toFixed(2));

  // Update enrollment score in Assessment table
  await prisma.assessment.updateMany({
    where: {
      userId,
      category: 'CareerPathEnrollment',
      title: `Enrolled: ${path.title}`
    },
    data: {
      score: progressPct,
      passed: progressPct >= 100.0
    }
  });

  return progressPct;
};

const getUserPaths = async (userId) => {
  // Find all CareerPathEnrollment assessments
  const enrollments = await prisma.assessment.findMany({
    where: {
      userId,
      category: 'CareerPathEnrollment'
    }
  });

  const userPaths = [];
  for (const en of enrollments) {
    const pathTitle = en.title.substring(10); // strip "Enrolled: "
    const path = CAREER_PATHS.find(p => p.title === pathTitle);
    if (path) {
      userPaths.push({
        id: en.id,
        userId,
        careerPathId: path.id,
        status: en.score >= 100.0 ? 'completed' : 'active',
        progress: en.score,
        careerPath: path
      });
    }
  }

  return userPaths;
};

const completeMilestone = async (userId, milestoneId, complete = true) => {
  // Find milestone in our static map
  let matchedPath = null;
  let matchedMilestone = null;

  for (const path of CAREER_PATHS) {
    const ms = path.milestones.find(m => m.id === milestoneId);
    if (ms) {
      matchedPath = path;
      matchedMilestone = ms;
      break;
    }
  }

  if (!matchedMilestone) {
    throw new ApiError(404, 'Milestone not found.');
  }

  const milestoneTitle = `Milestone: ${matchedMilestone.title}`;

  const existingProgress = await prisma.assessment.findFirst({
    where: {
      userId,
      category: 'MilestoneCompletion',
      title: milestoneTitle
    }
  });

  if (complete) {
    if (!existingProgress) {
      await prisma.assessment.create({
        data: {
          title: milestoneTitle,
          category: 'MilestoneCompletion',
          score: 100.0,
          totalMarks: 100.0,
          passed: true,
          userId
        }
      });
    }
  } else {
    if (existingProgress) {
      await prisma.assessment.delete({
        where: { id: existingProgress.id }
      });
    }
  }

  // Recalculate progress for parent path
  const progress = await calculateProgress(userId, matchedPath);

  return {
    milestoneId,
    completed: complete,
    progress
  };
};

module.exports = {
  getPaths,
  getPathById,
  enrollInPath,
  getUserPaths,
  completeMilestone,
  CAREER_PATHS
};
