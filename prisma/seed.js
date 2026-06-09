const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding (original schema)...');

  // Clean existing data
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "users" CASCADE;`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "jobs" CASCADE;`);
  console.log('🧹 Cleaned existing tables.');

  // Create demo student user
  const hashedPassword = await bcrypt.hash('bhoomi123', 10);
  const student = await prisma.user.create({
    data: {
      name: 'Bhoomi Singh',
      email: 'bhoomi@example.com',
      password: hashedPassword,
    },
  });
  console.log(`👤 Created user: ${student.name} (${student.email})`);

  // Create profile
  await prisma.profile.create({
    data: {
      userId: student.id,
      bio: 'Aspiring Full Stack Developer.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      githubUrl: 'https://github.com/bhoomi',
      linkedinUrl: 'https://linkedin.com/in/bhoomi',
      portfolioUrl: 'https://bhoomi.dev',
      phoneNumber: '+919876543210',
      currentAddress: 'Bangalore'
    }
  });

  // Create skills
  const skillReact = await prisma.skill.create({
    data: {
      name: 'React',
      proficiency: 'Intermediate',
      userId: student.id,
    },
  });

  const skillNode = await prisma.skill.create({
    data: {
      name: 'Node.js',
      proficiency: 'Intermediate',
      userId: student.id,
    },
  });

  const skillPostgres = await prisma.skill.create({
    data: {
      name: 'PostgreSQL',
      proficiency: 'Beginner',
      userId: student.id,
    },
  });
  console.log('🛠️ Created skills.');

  // Create career entries
  const career1 = await prisma.career.create({
    data: {
      company: 'Google',
      role: 'Frontend Developer',
      status: 'Interviewing',
      salary: '18 LPA',
      location: 'Bangalore (Hybrid)',
      notes: 'Preparing for system design and React principles.',
      userId: student.id,
      skills: {
        connect: [{ id: skillReact.id }],
      },
    },
  });

  const career2 = await prisma.career.create({
    data: {
      company: 'Microsoft',
      role: 'Software Engineer',
      status: 'Applied',
      salary: '22 LPA',
      location: 'Hyderabad',
      notes: 'Applied with referral.',
      userId: student.id,
      skills: {
        connect: [{ id: skillReact.id }, { id: skillNode.id }],
      },
    },
  });
  console.log('💼 Created career applications.');

  // Create jobs
  const job1 = await prisma.job.create({
    data: {
      title: 'Junior Backend Developer',
      company: 'TechCorp',
      location: 'Bangalore',
      description: 'Build robust REST APIs using Node.js and SQL.',
      salary: '8 LPA',
      jobType: 'Full-time',
      requirements: 'Node.js, SQL, REST APIs',
      link: 'https://techcorp.com/careers'
    }
  });

  const job2 = await prisma.job.create({
    data: {
      title: 'Frontend Development Intern',
      company: 'InnoLabs',
      location: 'Remote',
      description: 'Help develop modern web portals using React.',
      salary: '20,000/month',
      jobType: 'Internship',
      requirements: 'React, HTML, CSS',
      link: 'https://innolabs.com/careers'
    }
  });
  console.log('💼 Created jobs.');

  // Create job application
  const jobApp = await prisma.jobApplication.create({
    data: {
      userId: student.id,
      jobId: job1.id,
      status: 'Interviewing',
      notes: 'Got a callback for the technical round.'
    }
  });

  // Create scheduled interview (upcoming round)
  await prisma.interview.create({
    data: {
      roundName: 'Technical Round 1',
      interviewDate: new Date(Date.now() + 1000 * 60 * 60 * 18), // 18 hours from now
      locationLink: 'https://meet.google.com/abc-defg-hij',
      interviewer: 'Lead Dev',
      applicationId: jobApp.id
    }
  });

  // Create education
  await prisma.education.create({
    data: {
      institution: 'BITS Pilani',
      degree: 'B.Tech',
      fieldOfStudy: 'Computer Science',
      startDate: new Date('2022-08-01'),
      endDate: new Date('2026-06-01'),
      percentage: 82.0,
      userId: student.id
    }
  });

  // Create certification
  await prisma.certification.create({
    data: {
      name: 'AWS Cloud Practitioner',
      issuingOrg: 'Amazon Web Services',
      issueDate: new Date('2025-01-10'),
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15), // Expiring in 15 days
      credentialId: 'AWS-12345',
      credentialUrl: 'https://aws.amazon.com/verify',
      userId: student.id
    }
  });

  // Create goals
  await prisma.goal.create({
    data: {
      title: 'Short-term Goal: Learn Docker basics',
      description: 'Understand containerization and write simple Dockerfiles.',
      targetDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5 days from now
      status: 'Pending',
      userId: student.id
    }
  });

  await prisma.goal.create({
    data: {
      title: 'Long-term Goal: Land a Software Engineer role',
      description: 'Prepare data structures and algorithms, apply to 20 jobs.',
      targetDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45), // 45 days from now
      status: 'Pending',
      userId: student.id
    }
  });

  // Create InternshipEcosystem
  await prisma.internshipEcosystem.create({
    data: {
      userId: student.id,
      stipendAmount: 15000,
      durationMonths: 6,
      projectDomain: 'Admin Dashboard Development',
      mentorAssigned: 'Sanjay Kumar',
      onboardingStatus: 'ONGOING'
    }
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
